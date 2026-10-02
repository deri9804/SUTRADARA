// Gemini Canvas blocks WebSocket connections; the database watcher is the
// reliable cross-device fallback for this single-file deployment.
const AUTH_ENABLE_REALTIME = false;

async function handleSupabaseUserSession(user) {
    if (!user || !user.id) return;
    if (currentUser.loggedIn && currentUser.userId === user.id && currentUser.status === 'active') return;
    if (deviceLimitBlockedUserId === user.id) {
        showDeviceLimitPanel(user, AUTH_MAX_DEVICES);
        return;
    }
    if (profileSessionLock) return profileSessionLock;

    profileSessionLock = (async () => {
    try {
        const { data: profileRows, error: profileError } = await supabaseClient
            .from('profiles')
            .select('id, full_name, role, status')
            .eq('id', user.id)
            .limit(5);

        if (profileError) {
            console.error("[SESSION PROFILE] query error:", profileError?.message);
            if (currentUser.loggedIn && currentUser.userId === user.id) return;
        }

        const list = Array.isArray(profileRows) ? profileRows : (profileRows ? [profileRows] : []);
        const profile = list.find(r => String(r.status || '').toLowerCase() === 'active') || list[0] || null;

        const profileFullName = (profile && typeof profile.full_name === 'string' && profile.full_name.trim())
            ? profile.full_name
            : user.email.split('@')[0];
        const profileRole = (profile && typeof profile.role === 'string' && profile.role.trim())
            ? profile.role
            : 'member';
        const profileStatus = (profile && typeof profile.status === 'string')
            ? profile.status
            : null;

        console.log("[SESSION PROFILE]", {
            id: user.id,
            full_name: profileFullName,
            role: profileRole,
            status: profileStatus
        });

        if (!profile) {
            if (currentUser.loggedIn && currentUser.userId === user.id) return;
            showAuthView();
            showAuthError("Profil member tidak ditemukan. Coba refresh halaman.");
            return;
        }

        if (profileStatus !== 'active') {
            console.warn(`[Auth] Blocked session for ${user.email}: profile=${!!profile} status=${profileStatus}`);
            currentUser.userId = null;
            currentUser.name = "Member";
            currentUser.email = null;
            currentUser.role = "member";
            currentUser.status = profileStatus || 'inactive';
            currentUser.loggedIn = false;
            teardownDeviceRealtimeSubscription();
            updateUserHeaderUI();
            try {
                await supabaseClient.auth.signOut();
            } catch (signOutErr) {
                console.warn("[Auth] signOut during block failed:", signOutErr?.message);
            }
            showAuthError("Akun Anda sedang tidak aktif. Silakan hubungi admin.");
            showAuthView();
            return;
        }

        const deviceGate = await registerDeviceOrReject(user.id);
        if (!deviceGate.ok) {
            currentUser.loggedIn = false;
            updateUserHeaderUI();
            if (deviceGate.limitReached) {
                deviceLimitBlockedUserId = user.id;
                showDeviceLimitPanel(user, deviceGate.count);
            } else {
                showAuthView();
                showAuthError(deviceGate.error || 'Tidak dapat memverifikasi perangkat ini. Coba lagi.');
                await supabaseClient.auth.signOut();
            }
            return;
        }

        currentUser.userId = user.id;
        currentUser.email = user.email;
        currentUser.name = profileFullName;
        currentUser.status = profileStatus;
        currentUser.role = profileRole;
        currentUser.loggedIn = true;
        deviceLimitBlockedUserId = null;

        if (AUTH_ENABLE_REALTIME) {
            await setupDeviceRealtimeSubscription(user.id, getOrCreateDeviceId());
        }
        startDeviceWatcher(user.id, getOrCreateDeviceId());

        await loadMemberSettings(user.id);
        updateUserHeaderUI();
        try {
            await renderUnifiedHistoryView();
        } catch (e) {
            console.warn('[History] Initial unified history render after login failed:', e);
        }

        // Every fresh login starts at the member home so the full
        // Storyboard menu is visible before the member chooses a tool.
        showHomeView();
    } catch (err) {
        console.error("[Supabase Auth] Profile resolution error:", err.message);
        if (!(currentUser.loggedIn && currentUser.userId === user.id)) {
            showAuthView();
            showAuthError("Gagal memuat profil member.");
        }
    }
    })();
    try { await profileSessionLock; } finally { profileSessionLock = null; }
}

async function loadMemberSettings(userId) {
    try {
        const { data: settings } = await supabaseClient
            .from('member_settings')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (settings) {
            if (settings.aspect_ratio) setPillValue('#selectorRatio', settings.aspect_ratio, 'aspectRatio');
            if (settings.duration_per_scene) setPillValue('#selectorDuration', settings.duration_per_scene, 'durationPerScene');
            if (settings.audio_mode) {
                document.getElementById('selectAudioMode').value = settings.audio_mode;
                state.audioMode = settings.audio_mode;
            }
            if (settings.language) {
                document.getElementById('selectLanguage').value = settings.language;
                state.language = settings.language;
            }
            state.visualStyle = 'Auto';
            // V5.0 (Isu #2): loading member settings must never
            // re-enable the overlay mode.
            state.visualStyleExplicitOverlay = false;
            state.customStyle = '';
            updateSummaryPill();
        }
    } catch (e) {
        // Ignore gracefully if settings don't exist
    }
}

function setPillValue(containerSelector, val, key) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const btn = container.querySelector(`button[data-val="${val}"]`);
    if (btn) {
        btn.click();
    } else {
        state[key] = val;
    }
}

function getOrCreateDeviceId() {
    let id = null;
    try { id = localStorage.getItem(AUTH_DEVICE_KEY); } catch (_) {}
    if (!id) {
        id = (crypto.randomUUID && crypto.randomUUID()) || ('dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10));
        try { localStorage.setItem(AUTH_DEVICE_KEY, id); } catch (_) {}
    }
    return id;
}

function applyRememberPreference(remember, email) {
    // V5.0 (user request): "Tetap login di browser ini" checkbox
    // has been removed from the UI. Sessions are always persisted
    // and only clear on explicit logout. This helper is kept as a
    // shim so legacy callers still work — it always remembers
    // the email so the login form is prefilled on next visit.
    try { localStorage.setItem(AUTH_REMEMBER_KEY, '1'); } catch (_) {}
    try { localStorage.removeItem(AUTH_UNTIL_KEY); } catch (_) {}
    if (email) saveRememberedEmail(email);
}

// V5.0 (user request): toggles the password input between masked
// (type=password, eye icon visible) and plain (type=text, eye-slash
// icon). Keeps state in-memory only — no persistence, no leakage.
function toggleLoginPasswordVisibility() {
    const input = document.getElementById('loginPassword');
    const icon = document.getElementById('loginPasswordEyeIcon');
    if (!input || !icon) return;
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
    try { input.focus(); } catch (_) {}
}

let pendingDeviceUser = null;

function hideDeviceLimitPanel() {
    const panel = document.getElementById('deviceLimitPanel');
    if (panel) panel.classList.add('hidden');
    pendingDeviceUser = null;
}

function showDeviceLimitPanel(user, count) {
    pendingDeviceUser = user;
    const err = document.getElementById('authErrorMessage');
    if (err) err.classList.add('hidden');
    const panel = document.getElementById('deviceLimitPanel');
    const text = document.getElementById('deviceLimitText');
    if (text) {
        text.textContent = 'Akun ini sudah login di ' + (count || AUTH_MAX_DEVICES) + ' perangkat (maksimal ' + AUTH_MAX_DEVICES + '). Logout di perangkat lain, atau keluarkan semua perangkat lain untuk masuk di sini.';
    }
    if (panel) panel.classList.remove('hidden');
    showAuthView();
}

async function logoutOtherDevicesAndEnter() {
    const user = pendingDeviceUser;
    const btn = document.getElementById('btnLogoutOtherDevices');
    if (!user || !supabaseClient) return;
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Mengeluarkan perangkat lain...';
    }
    try {
        const deviceId = getOrCreateDeviceId();
        const { error: deleteError } = await supabaseClient.from('member_devices')
            .delete().eq('user_id', user.id).neq('device_id', deviceId);
        if (deleteError) throw deleteError;
        const { data: remainingDevices, error: verifyDeleteError } = await supabaseClient
            .from('member_devices')
            .select('device_id')
            .eq('user_id', user.id);
        if (verifyDeleteError) throw verifyDeleteError;
        const otherDevices = (remainingDevices || []).filter(row => row.device_id !== deviceId);
        if (otherDevices.length > 0) {
            throw new Error('Perangkat lain masih terdaftar.');
        }
        const { error: upsertError } = await supabaseClient.from('member_devices').upsert({
            user_id: user.id,
            device_id: deviceId,
            user_agent: String(navigator.userAgent || '').slice(0, 180),
            last_seen: new Date().toISOString()
        }, { onConflict: 'user_id,device_id' });
        if (upsertError) throw upsertError;
        hideDeviceLimitPanel();
        deviceLimitBlockedUserId = null;
        await handleSupabaseUserSession(user);
    } catch (e) {
        showAuthError('Gagal mengeluarkan perangkat lain. Coba lagi.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Logout semua perangkat lain & masuk di sini';
        }
    }
}

async function registerDeviceOrReject(userId) {
    if (!supabaseClient || !userId) return { ok: false, count: 0, error: 'Supabase Auth belum siap.' };
    const deviceId = getOrCreateDeviceId();
    const nowIso = new Date().toISOString();
    const agent = String(navigator.userAgent || '').slice(0, 180);
    try {
        const { data, error } = await supabaseClient
            .from('member_devices')
            .select('device_id, last_seen')
            .eq('user_id', userId);
        if (error) return { ok: false, count: 0, error: 'Gagal memverifikasi perangkat. Coba lagi.' };
        const rows = data || [];
        const known = rows.some(r => r.device_id === deviceId);
        if (known) {
            const { error: updateError } = await supabaseClient.from('member_devices').update({
                last_seen: nowIso,
                user_agent: agent
            }).eq('user_id', userId).eq('device_id', deviceId);
            if (updateError) return { ok: false, count: rows.length, error: 'Gagal memperbarui perangkat. Coba lagi.' };
            return { ok: true, count: rows.length };
        }
        if (rows.length >= AUTH_MAX_DEVICES) return { ok: false, count: rows.length, limitReached: true };
        const { error: insertError } = await supabaseClient.from('member_devices').insert({
            user_id: userId,
            device_id: deviceId,
            user_agent: agent,
            last_seen: nowIso
        });
        if (insertError) return { ok: false, count: rows.length, error: 'Gagal mendaftarkan perangkat. Coba lagi.' };
        return { ok: true, count: rows.length + 1 };
    } catch (e) {
        return { ok: false, count: 0, error: 'Gagal memverifikasi perangkat. Coba lagi.' };
    }
}

async function unregisterThisDevice(userId) {
    if (!supabaseClient || !userId) return;
    const deviceId = localStorage.getItem(AUTH_DEVICE_KEY);
    if (!deviceId) return;
    const { error } = await supabaseClient.from('member_devices')
        .delete().eq('user_id', userId).eq('device_id', deviceId);
    if (error) console.warn('[Device Registry] Unregister failed:', error.message);
}

function teardownDeviceRealtimeSubscription() {
    stopDeviceWatcher();
    if (deviceRealtimeChannel && supabaseClient) {
        try { supabaseClient.removeChannel(deviceRealtimeChannel); }
        catch (e) { /* ignore */ }
    }
    deviceRealtimeChannel = null;
    deviceRealtimeUserId = null;
    deviceRealtimeDeviceId = null;
}

function stopDeviceWatcher() {
    if (deviceWatchTimer) clearInterval(deviceWatchTimer);
    deviceWatchTimer = null;
    window.removeEventListener('focus', verifyCurrentDeviceRegistration);
    document.removeEventListener('visibilitychange', verifyCurrentDeviceRegistration);
    deviceWatchUserId = null;
    deviceWatchDeviceId = null;
    deviceWatchInFlight = false;
}

async function verifyCurrentDeviceRegistration() {
    if (!supabaseClient || !deviceWatchUserId || !deviceWatchDeviceId || deviceWatchInFlight) return;
    if (!currentUser.loggedIn || currentUser.userId !== deviceWatchUserId) return;
    deviceWatchInFlight = true;
    try {
        const { data, error } = await supabaseClient.from('member_devices')
            .select('device_id')
            .eq('user_id', deviceWatchUserId)
            .eq('device_id', deviceWatchDeviceId)
            .limit(1);
        if (error) {
            console.warn('[Device Watch] Verification failed:', error.message);
            return;
        }
        if (!Array.isArray(data) || data.length === 0) {
            await forceLogoutThisDevice('Perangkat Anda sudah dikeluarkan dari akun ini. Silakan masuk kembali.');
        }
    } finally {
        deviceWatchInFlight = false;
    }
}

function startDeviceWatcher(userId, deviceId) {
    stopDeviceWatcher();
    deviceWatchUserId = userId;
    deviceWatchDeviceId = deviceId;
    deviceWatchTimer = setInterval(verifyCurrentDeviceRegistration, DEVICE_WATCH_INTERVAL_MS);
    window.addEventListener('focus', verifyCurrentDeviceRegistration);
    document.addEventListener('visibilitychange', verifyCurrentDeviceRegistration);
    verifyCurrentDeviceRegistration();
}

async function forceLogoutThisDevice(reason) {
    if (!(currentUser && currentUser.loggedIn)) return;
    console.warn('[Device Realtime] Force logout:', reason);
    teardownDeviceRealtimeSubscription();
    const uid = currentUser.userId;
    try {
        await unregisterThisDevice(uid);
        if (supabaseClient) await supabaseClient.auth.signOut();
    } catch (e) { /* ignore */ }
    clearSupabaseAuthKeys();
    currentUser.userId = null;
    currentUser.email = null;
    currentUser.name = 'Member';
    currentUser.role = 'member';
    currentUser.status = 'inactive';
    currentUser.loggedIn = false;
    deviceLimitBlockedUserId = null;
    updateUserHeaderUI();
    showCanvasNotice(reason || 'Sesi Anda berakhir. Silakan masuk kembali.');
    showAuthView();
}

async function setupDeviceRealtimeSubscription(userId, deviceId) {
    if (!supabaseClient || !userId || !deviceId) return;
    if (deviceRealtimeChannel && deviceRealtimeUserId === userId && deviceRealtimeDeviceId === deviceId) return;
    teardownDeviceRealtimeSubscription();

    const channelName = 'member_devices_' + userId;
    const channel = supabaseClient
        .channel(channelName)
        .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'member_devices',
            filter: 'user_id=eq.' + userId
        }, async payload => {
            const kickedId = payload && payload.old && payload.old.device_id;
            if (!kickedId) return;
            if (kickedId === deviceId) {
                // Our device was kicked — either the user logged in elsewhere and pressed
                // "kick other devices", or admin removed our row. Sign out immediately.
                await forceLogoutThisDevice('Perangkat Anda sudah dikeluarkan dari akun ini. Silakan masuk kembali.');
            }
            // Otherwise another device was kicked — not our concern.
        })
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'member_devices',
            filter: 'user_id=eq.' + userId
        }, async () => {
            // New login landed. Verify we still have a row; if not (we were silently
            // evicted), sign out.
            try {
                const { data } = await supabaseClient.from('member_devices')
                    .select('device_id').eq('user_id', userId).eq('device_id', deviceId);
                if (!data || data.length === 0) {
                    await forceLogoutThisDevice('Sesi berakhir. Silakan masuk kembali.');
                }
            } catch (e) { /* ignore */ }
        });

    try {
        await new Promise((resolve, reject) => {
            let settled = false;
            deviceRealtimeChannel = channel.subscribe(status => {
                if (status === 'SUBSCRIBED' && !settled) {
                    settled = true;
                    resolve();
                } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].indexOf(status) >= 0 && !settled) {
                    settled = true;
                    reject(new Error('Realtime status: ' + status));
                }
            });
            setTimeout(() => {
                if (!settled) {
                    settled = true;
                    reject(new Error('Realtime subscription timeout.'));
                }
            }, 10000);
        });
        deviceRealtimeUserId = userId;
        deviceRealtimeDeviceId = deviceId;
    } catch (e) {
        console.warn('[Device Realtime] subscribe failed:', e && e.message);
        teardownDeviceRealtimeSubscription();
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    const emailInput = document.getElementById('loginEmail').value.trim().toLowerCase();
    // Do not trim passwords: leading/trailing spaces may be intentional.
    const passwordInput = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('authErrorMessage');
    const submitBtn = document.getElementById('btnLoginSubmit');

    errorDiv.classList.add('hidden');
    const limitPanel = document.getElementById('deviceLimitPanel');
    if (limitPanel) limitPanel.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>MEMPROSES...</span>`;

    console.log("[Supabase Auth] Login attempt for:", emailInput);

    if (!supabaseClient) {
        showAuthError("Supabase Auth belum terkonfigurasi dengan benar.");
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>MASUK SEKARANG</span> <i class="fa-solid fa-arrow-right"></i>`;
        return;
    }

    try {
        // V5.0 (user request): always remember — the legacy
        // "Tetap login di browser ini" checkbox has been removed
        // from the UI. Sessions are persisted by default and
        // only cleared on explicit logout via the logout button.
        applyRememberPreference(true, emailInput);
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: emailInput,
            password: passwordInput
        });

        if (error) {
            console.warn("[Supabase Auth] Login rejected:", {
                name: error.name,
                message: error.message,
                code: error.code,
                status: error.status
            });
            let msg = error.message || 'Gagal masuk.';
            if (error.code === 'invalid_credentials') msg = 'Email atau password tidak diterima server. Coba lagi, atau reset password.';
            else if (error.code === 'email_not_confirmed') msg = 'Email belum dikonfirmasi. Cek kotak masuk untuk tautan verifikasi.';
            else if (error.code === 'too_many_requests') msg = 'Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.';
            showAuthError(msg);
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>MASUK SEKARANG</span> <i class="fa-solid fa-arrow-right"></i>`;
            return;
        }

        if (data.user) {
            const deviceGate = await registerDeviceOrReject(data.user.id);
            if (!deviceGate.ok) {
                if (deviceGate.limitReached) {
                    deviceLimitBlockedUserId = data.user.id;
                    showDeviceLimitPanel(data.user, deviceGate.count);
                } else {
                    deviceLimitBlockedUserId = null;
                    showAuthError(deviceGate.error || 'Tidak dapat memverifikasi perangkat ini. Coba lagi.');
                    await supabaseClient.auth.signOut();
                }
                return;
            }
            hideDeviceLimitPanel();
            await handleSupabaseUserSession(data.user);
        }
    } catch (err) {
        console.error("[Supabase Auth Exception]", err);
        showAuthError(err && err.message ? err.message : "Terjadi kesalahan koneksi ke Supabase Auth.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>MASUK SEKARANG</span> <i class="fa-solid fa-arrow-right"></i>`;
    }
}

function showAuthError(msg) {
    const errorDiv = document.getElementById('authErrorMessage');
    errorDiv.textContent = msg;
    errorDiv.className = 'text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-medium';
    errorDiv.classList.remove('hidden');
}

async function handleForgotPassword() {
    const email = document.getElementById('loginEmail').value.trim();
    if (!email) {
        showAuthError("Masukkan email terlebih dahulu untuk reset password.");
        return;
    }
    if (!supabaseClient) {
        showAuthError("Supabase Auth belum terkonfigurasi dengan benar.");
        return;
    }

    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.href
        });
        if (error) throw error;
        const errorDiv = document.getElementById('authErrorMessage');
        errorDiv.textContent = "Link reset password telah dikirim ke email Anda.";
        errorDiv.className = "text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-medium block";
    } catch (err) {
        showAuthError(err.message || "Gagal mengirim link reset password.");
    }
}

async function handleLogout() {
    clearActiveViewKey();
    const uid = currentUser && currentUser.userId;
    deviceLimitBlockedUserId = null;
    teardownDeviceRealtimeSubscription();
    try {
        if (supabaseClient) await supabaseClient.auth.signOut();
        await unregisterThisDevice(uid);
    } finally {
        resetUserSession();
        // Forgetting on explicit logout is the standard behaviour:
        // the next login will start with a clean form, not the
        // previous user's email. The "Tetap login di browser ini"
        // checkbox has been removed — sessions are always
        // remembered until the user explicitly logs out via this
        // button. Manual logout is the only path that clears the
        // remembered email.
        clearRememberedEmail();
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
        showAuthView();
    }
}

function resetUserSession() {
    currentUser.userId = null;
    currentUser.name = "Member";
    currentUser.email = null;
    currentUser.role = "member";
    currentUser.loggedIn = false;
    updateUserHeaderUI();
}

/* ----------------------------------------------------------------- */
/* ROUTING & UI VISIBILITY                                           */
/* ----------------------------------------------------------------- */

const MAIN_VIEW_IDS = ['sessionCheckView', 'authView', 'homeView', 'creatorFormView', 'loadingView', 'resultView', 'adminView', 'imageGenView', 'voiceOverView', 'autoAdsView', 'videoToolsView', 'historyView'];

function hideMainViews() {
    MAIN_VIEW_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}

function showAuthView() {
    clearActiveViewKey();
    document.body.classList.add('show-auth');
    hideMainViews();
    document.getElementById('authView').classList.remove('hidden');

    document.getElementById('userNavMenu').classList.add('hidden');
    const btnHistory = document.getElementById('btnHeaderHistory');
    if (btnHistory) btnHistory.classList.add('hidden');

    const header = document.getElementById('appHeader');
    if (header) header.style.display = 'none';
    const sidebar = document.getElementById('appSidebar');
    if (sidebar) sidebar.style.display = 'none';
    setActiveSidebarItem(null);
    // Prefill email + focus on the right field for a quick re-login.
    // The password is never filled by the app — the browser's
    // built-in password manager handles that via the autocomplete
    // attribute on the input.
    try { prefillLoginForm(); } catch (e) { /* ignore */ }
}

function showSessionCheckView() {
    document.body.classList.add('show-auth');
    hideMainViews();
    const view = document.getElementById('sessionCheckView');
    if (view) view.classList.remove('hidden');
}

function showAppHeader() {
    document.body.classList.remove('show-auth');
    const header = document.getElementById('appHeader');
    if (header) header.style.display = '';
    const sidebar = document.getElementById('appSidebar');
    if (sidebar) sidebar.style.display = '';
}

function showHomeView() {
        if (!currentUser.loggedIn || currentUser.status !== 'active') {
            showAuthView();
            return;
        }
        hideMainViews();
        showAppHeader();
        document.getElementById('userNavMenu').classList.remove('hidden');
        document.getElementById('userDropdown').classList.add('hidden');
        const home = document.getElementById('homeView');
        if (home) home.classList.remove('hidden');
        const name = document.getElementById('homeMemberName');
        if (name) name.textContent = currentUser.name || 'Member';
        sidebarState.minimized = false;
        document.body.classList.remove('sidebar-minimized');
        updateSidebarToggleIcon();
        expandNavGroup('storyboard');
        setActiveSidebarItem(null);
}

function showAppView() {
    if (!currentUser.loggedIn || currentUser.status !== 'active') {
        showAuthView();
        return;
    }

    hideMainViews();

    if (storyboardGenerating && (!storyboardGenerationMode || storyboardGenerationMode === state.storyboardMode)) {
        document.getElementById('loadingView').classList.remove('hidden');
        document.getElementById('creatorFormView').classList.add('hidden');
        document.getElementById('resultView').classList.add('hidden');
    } else if (state.directorData) {
        document.getElementById('resultView').classList.remove('hidden');
        document.getElementById('creatorFormView').classList.add('hidden');
    } else {
        document.getElementById('creatorFormView').classList.remove('hidden');
        document.getElementById('resultView').classList.add('hidden');
    }

    document.getElementById('userNavMenu').classList.remove('hidden');
    document.getElementById('userDropdown').classList.add('hidden');
    showAppHeader();
    // View switcher is passive — active state is set by the caller (nav function or restore).
}

function showAdminView() {
    if (!currentUser.loggedIn || currentUser.status !== 'active') {
        showAuthView();
        return;
    }
    if (currentUser.role !== 'admin') {
        showAppView();
        return;
    }
    hideMainViews();
    document.getElementById('userDropdown').classList.add('hidden');

    document.getElementById('adminView').classList.remove('hidden');

    showAppHeader();
    // View switcher is passive — active state is set by the caller.

    loadAdminProfiles();
}

function showImageGenView() {
    if (!currentUser.loggedIn || currentUser.status !== 'active') {
        showAuthView();
        return;
    }
    hideMainViews();
    document.getElementById('userDropdown').classList.add('hidden');

    document.getElementById('imageGenView').classList.remove('hidden');
    document.getElementById('userNavMenu').classList.remove('hidden');

    const noticeEl = document.getElementById('imageGenNotice');
    if (noticeEl) noticeEl.className = 'hidden text-[11px] p-3 rounded-xl border font-medium';

    showAppHeader();
    expandNavGroup('imageGen');
    // View switcher is passive — active state is set by the caller.

    renderImageGenToolSelector();
    renderImageGenToolForm();
}

function showVoiceOverView() {
    if (!currentUser.loggedIn || currentUser.status !== 'active') {
        showAuthView();
        return;
    }
    hideMainViews();
    showAppHeader();
    const v = document.getElementById('voiceOverView');
    if (v) v.classList.remove('hidden');
    document.getElementById('userNavMenu').classList.remove('hidden');
    document.getElementById('userDropdown').classList.add('hidden');
}

function showAutoAdsView() {
    if (!currentUser.loggedIn || currentUser.status !== 'active') {
        showAuthView();
        return;
    }
    hideMainViews();
    showAppHeader();
    const v = document.getElementById('autoAdsView');
    if (v) v.classList.remove('hidden');
    document.getElementById('userNavMenu').classList.remove('hidden');
    document.getElementById('userDropdown').classList.add('hidden');
}

function updateUserHeaderUI() {
    document.getElementById('navUserName').textContent = currentUser.name || 'Member';
    document.getElementById('dropdownUserEmail').textContent = currentUser.email || '';
    document.getElementById('dropdownUserRole').textContent = (currentUser.role || 'MEMBER').toUpperCase();

    document.getElementById('modalUserName').textContent = currentUser.name || 'Member';
    document.getElementById('modalUserEmail').textContent = currentUser.email || '';
    document.getElementById('modalUserRoleBadge').textContent = (currentUser.role || 'MEMBER').toUpperCase();

    // Account modal trigger — always shown for active users.
    const menuAccount = document.getElementById('menuAccount');
    if (menuAccount) {
        if (currentUser.loggedIn && currentUser.status === 'active') {
            menuAccount.classList.remove('hidden');
        } else {
            menuAccount.classList.add('hidden');
        }
    }

    // Sidebar Admin Panel visibility — admin role only.
    updateSidebarRoleVisibility();
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');
}

function openAccountModal() {
    document.getElementById('userDropdown').classList.add('hidden');
    document.getElementById('accountModal').classList.remove('hidden');
}

function closeAccountModal() {
    document.getElementById('accountModal').classList.add('hidden');
}

function handleLogoClick() {
    if (currentUser.loggedIn && currentUser.status === 'active') {
        navGoStoryboard();
    } else {
        showAuthView();
    }
}
