/* ----------------------------------------------------------------- */
/* PHASE 5B: SUPABASE AUTHENTICATION CONFIGURATION                   */
/* ----------------------------------------------------------------- */

const SUPABASE_URL = "https://inixcxbvfyvmuuzlkljq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ozGrENkmrJH48KSWov2BIw_2f13d_qH";

// =================================================================
// CURRENT USER STATE (Shared globally across modules)
// =================================================================
const currentUser = {
    userId: null,
    name: "Member",
    email: null,
    role: "member",
    status: "active",
    loggedIn: false
};

// Helper to determine the currently active user ID (from memory or Supabase session)
function getActiveUserId() {
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.userId) {
        return currentUser.userId;
    }
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
                const val = localStorage.getItem(k);
                if (val) {
                    const parsed = JSON.parse(val);
                    const uid = parsed?.user?.id || parsed?.id;
                    if (uid) return uid;
                }
            }
        }
    } catch (_) {}
    return null;
}

// Helper to determine the currently active user email
function getActiveUserEmail() {
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.email) {
        return String(currentUser.email).toLowerCase();
    }
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
                const val = localStorage.getItem(k);
                if (val) {
                    const parsed = JSON.parse(val);
                    const email = parsed?.user?.email;
                    if (email) return String(email).toLowerCase();
                }
            }
        }
    } catch (_) {}
    return '';
}

// Check if currently active user is the owner/creator (Deri Pernandi)
function isOwnerUser() {
    const email = getActiveUserEmail();
    const role = (typeof currentUser !== 'undefined' && currentUser && currentUser.role) ? currentUser.role : '';
    return Boolean(email && (email.includes('deripernandi') || email.includes('deri'))) || role === 'admin';
}

// =================================================================
// GOOGLE GEMINI API (BYOK - BRING YOUR OWN KEY SYSTEM)
// =================================================================
function getGeminiApiKey() {
    const uid = getActiveUserId();
    const isOwner = isOwnerUser();
    if (!uid) return '';

    try {
        const legacy = (localStorage.getItem('trendora_gemini_api_key') || localStorage.getItem('sutradara_gemini_api_key') || '').trim();
        let userKey = (localStorage.getItem('trendora_gemini_api_key_' + uid) || '').trim();

        // If non-owner user has a key matching the legacy key, or is a member test account (e.g. Wisnu), purge it
        if (!isOwner) {
            if ((legacy && userKey === legacy) || getActiveUserEmail().includes('wisnu')) {
                localStorage.removeItem('trendora_gemini_api_key_' + uid);
                userKey = '';
            }
        }

        if (userKey) return userKey;

        // Migration for owner Deri Pernandi only
        if (isOwner && legacy) {
            localStorage.setItem('trendora_gemini_api_key_' + uid, legacy);
            localStorage.removeItem('trendora_gemini_api_key');
            localStorage.removeItem('sutradara_gemini_api_key');
            return legacy;
        }
    } catch (_) {}
    return '';
}

function updateApiKeyIndicator() {
    const key = getGeminiApiKey();
    const dot = document.getElementById('apiKeyStatusDot');
    if (dot) {
        if (key) {
            dot.className = 'w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50';
            dot.title = 'API Key Terhubung';
        } else {
            dot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
            dot.title = 'API Key Belum Diatur';
        }
    }
}

function openApiKeyModal(noticeMsg) {
    const modal = document.getElementById('apiKeyModal');
    const input = document.getElementById('inputGeminiApiKey');
    const notice = document.getElementById('apiKeyModalNotice');
    if (!modal) return;
    const currentKey = getGeminiApiKey();
    if (input) input.value = currentKey;
    if (notice) {
        if (noticeMsg) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-amber-300 bg-amber-500/10 border-amber-500/20 block';
            notice.textContent = noticeMsg;
        } else {
            notice.className = 'hidden';
            notice.textContent = '';
        }
    }
    modal.classList.remove('hidden');
}

function closeApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    if (modal) modal.classList.add('hidden');
}

function toggleApiKeyVisibility() {
    const input = document.getElementById('inputGeminiApiKey');
    const icon = document.getElementById('apiKeyEyeIcon');
    if (!input || !icon) return;
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
    }
}

async function testGeminiApiKeyConnection() {
    const input = document.getElementById('inputGeminiApiKey');
    const notice = document.getElementById('apiKeyModalNotice');
    const btn = document.getElementById('btnTestApiKey');
    const key = input ? input.value.trim() : '';
    if (!key) {
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-red-400 bg-red-500/10 border-red-500/20 block';
            notice.textContent = 'Masukkan API Key terlebih dahulu untuk melakukan tes.';
        }
        return;
    }
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Mengetes...';
    }
    try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(key);
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] })
        });
        const data = await res.json();
        if (res.ok && data.candidates) {
            if (notice) {
                notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-emerald-300 bg-emerald-500/10 border-emerald-500/20 block';
                notice.textContent = '✅ API Key Valid! Koneksi ke Google Gemini AI berhasil.';
            }
        } else {
            const errMsg = (data && data.error && data.error.message) ? data.error.message : 'HTTP ' + res.status;
            if (notice) {
                notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-red-400 bg-red-500/10 border-red-500/20 block';
                notice.textContent = '❌ API Key Ditolak: ' + errMsg;
            }
        }
    } catch (err) {
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-red-400 bg-red-500/10 border-red-500/20 block';
            notice.textContent = '❌ Gagal terhubung: ' + err.message;
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-bolt text-amber-400"></i> <span>Tes Koneksi</span>';
        }
    }
}

function saveGeminiApiKeyFromModal() {
    const uid = getActiveUserId();
    const input = document.getElementById('inputGeminiApiKey');
    const notice = document.getElementById('apiKeyModalNotice');
    const key = input ? input.value.trim() : '';
    if (!key) {
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-red-400 bg-red-500/10 border-red-500/20 block';
            notice.textContent = 'API Key tidak boleh kosong.';
        }
        return;
    }
    if (!uid) {
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-red-400 bg-red-500/10 border-red-500/20 block';
            notice.textContent = 'Silakan login terlebih dahulu untuk menyimpan API Key.';
        }
        return;
    }
    try {
        localStorage.setItem('trendora_gemini_api_key_' + uid, key);
        // Purge old unscoped keys to prevent cross-account leakage
        localStorage.removeItem('trendora_gemini_api_key');
        localStorage.removeItem('sutradara_gemini_api_key');
        updateApiKeyIndicator();
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-emerald-300 bg-emerald-500/10 border-emerald-500/20 block';
            notice.textContent = '✅ Berhasil! API Key Anda tersimpan aman khusus untuk akun Anda di browser ini.';
        }
        setTimeout(() => { closeApiKeyModal(); }, 1200);
    } catch (e) {
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-red-400 bg-red-500/10 border-red-500/20 block';
            notice.textContent = 'Gagal menyimpan ke penyimpanan lokal browser.';
        }
    }
}

function removeGeminiApiKey() {
    const uid = getActiveUserId();
    try {
        if (uid) {
            localStorage.removeItem('trendora_gemini_api_key_' + uid);
        }
        localStorage.removeItem('trendora_gemini_api_key');
        localStorage.removeItem('sutradara_gemini_api_key');
        const input = document.getElementById('inputGeminiApiKey');
        if (input) input.value = '';
        updateApiKeyIndicator();
        const notice = document.getElementById('apiKeyModalNotice');
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-amber-300 bg-amber-500/10 border-amber-500/20 block';
            notice.textContent = 'API Key telah dihapus dari akun Anda di perangkat ini.';
        }
    } catch (e) {}
}

// Global Fetch Hook: automatically attach Google Gemini API Key to all generativelanguage calls
(function initGeminiFetchInterceptor() {
    const originalFetch = window.fetch;
    window.fetch = async function(resource, init) {
        try {
            let urlStr = (typeof resource === 'string') ? resource : (resource && resource.url ? resource.url : '');
            if (urlStr && urlStr.includes('generativelanguage.googleapis.com')) {
                const apiKey = getGeminiApiKey();
                if (!apiKey) {
                    openApiKeyModal('Silakan masukkan Gemini API Key gratis Anda terlebih dahulu untuk mulai membuat video / storyboard.');
                    const noKeyErr = new Error('Gemini API Key belum diatur. Silakan masukkan API Key Anda di menu atas.');
                    noKeyErr.permanent = true;
                    throw noKeyErr;
                }
                init = init || {};
                let headers = init.headers;
                if (!headers) {
                    headers = {};
                    init.headers = headers;
                }
                if (headers instanceof Headers) {
                    if (!headers.has('x-goog-api-key')) headers.set('x-goog-api-key', apiKey);
                } else if (Array.isArray(headers)) {
                    if (!headers.some(([k]) => k.toLowerCase() === 'x-goog-api-key')) headers.push(['x-goog-api-key', apiKey]);
                } else {
                    if (!headers['x-goog-api-key'] && !headers['X-Goog-Api-Key']) headers['x-goog-api-key'] = apiKey;
                }
                if (!urlStr.includes('key=')) {
                    const sep = urlStr.includes('?') ? '&' : '?';
                    urlStr = urlStr + sep + 'key=' + encodeURIComponent(apiKey);
                    if (typeof resource === 'string') {
                        resource = urlStr;
                    } else if (resource && resource.url) {
                        resource = new Request(urlStr, init);
                    }
                }
            }
        } catch (e) {
            if (e.message && e.message.includes('Gemini API Key')) throw e;
            console.warn('[Gemini Interceptor Error]', e);
        }
        return originalFetch.call(this, resource, init);
    };
})();

setTimeout(() => {
    updateApiKeyIndicator();
    updateN8nIndicator();
}, 500);

// =================================================================
// n8n WEBHOOK INTEGRATION (IMAGE-TO-VIDEO PIPELINE)
// =================================================================
function getN8nWebhookUrl() {
    const uid = getActiveUserId();
    const isOwner = isOwnerUser();
    if (!uid) return '';
    try {
        const userUrl = localStorage.getItem('trendora_n8n_webhook_url_' + uid);
        if (userUrl && userUrl.trim()) return userUrl.trim();

        // Migration for owner only
        const legacy = localStorage.getItem('trendora_n8n_webhook_url') || localStorage.getItem('sutradara_n8n_webhook_url');
        if (isOwner && legacy && legacy.trim()) {
            const urlVal = legacy.trim();
            localStorage.setItem('trendora_n8n_webhook_url_' + uid, urlVal);
            localStorage.removeItem('trendora_n8n_webhook_url');
            localStorage.removeItem('sutradara_n8n_webhook_url');
            return urlVal;
        }
    } catch (_) {}
    return '';
}

function setN8nWebhookUrl(url) {
    const uid = getActiveUserId();
    try {
        if (!uid) return;
        if (!url || !url.trim()) {
            localStorage.removeItem('trendora_n8n_webhook_url_' + uid);
        } else {
            localStorage.setItem('trendora_n8n_webhook_url_' + uid, url.trim());
        }
        localStorage.removeItem('trendora_n8n_webhook_url');
        localStorage.removeItem('sutradara_n8n_webhook_url');
    } catch (_) {}
    updateN8nIndicator();
}

function removeN8nWebhookUrl() {
    const uid = getActiveUserId();
    try {
        if (uid) {
            localStorage.removeItem('trendora_n8n_webhook_url_' + uid);
        }
        localStorage.removeItem('trendora_n8n_webhook_url');
        localStorage.removeItem('sutradara_n8n_webhook_url');
    } catch (_) {}
    const input = document.getElementById('inputN8nWebhookUrl');
    if (input) input.value = '';
    const notice = document.getElementById('n8nModalNotice');
    if (notice) {
        notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-amber-300 bg-amber-500/10 border-amber-500/20 block';
        notice.textContent = 'URL Webhook n8n telah dihapus dari akun Anda.';
    }
    updateN8nIndicator();
}

function updateN8nIndicator() {
    const url = getN8nWebhookUrl();
    const dot = document.getElementById('n8nStatusDot');
    if (dot) {
        if (url) {
            dot.className = 'w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50';
            dot.title = 'Webhook n8n Terhubung: ' + url;
        } else {
            dot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
            dot.title = 'Webhook n8n Belum Diatur';
        }
    }
}

function openN8nModal(noticeMsg) {
    const modal = document.getElementById('n8nWebhookModal');
    const input = document.getElementById('inputN8nWebhookUrl');
    const notice = document.getElementById('n8nModalNotice');
    if (!modal) return;
    const currentUrl = getN8nWebhookUrl();
    if (input) input.value = currentUrl;
    if (notice) {
        if (noticeMsg) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-amber-300 bg-amber-500/10 border-amber-500/20 block';
            notice.textContent = noticeMsg;
        } else {
            notice.className = 'hidden';
            notice.textContent = '';
        }
    }
    modal.classList.remove('hidden');
}

function closeN8nModal() {
    const modal = document.getElementById('n8nWebhookModal');
    if (modal) modal.classList.add('hidden');
}

async function testN8nConnection() {
    const input = document.getElementById('inputN8nWebhookUrl');
    const notice = document.getElementById('n8nModalNotice');
    const btn = document.getElementById('btnTestN8n');
    const url = (input ? input.value : '').trim();

    if (!url) {
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-red-400 bg-red-500/10 border-red-500/20 block';
            notice.textContent = 'Masukkan URL Webhook n8n terlebih dahulu.';
        }
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-red-400 bg-red-500/10 border-red-500/20 block';
            notice.textContent = 'URL harus diawali dengan https:// atau http://';
        }
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin text-emerald-400"></i><span>Menguji...</span>';
    }

    if (notice) {
        notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-emerald-300 bg-emerald-500/10 border-emerald-500/20 block';
        notice.textContent = 'Mengirim sinyal uji coba ke n8n...';
    }

    try {
        const testPayload = {
            event: "test_connection",
            source: "TRENDORA AI V5.0",
            message: "Tes koneksi n8n webhook berhasil dari Trendora AI!",
            timestamp: new Date().toISOString()
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });

        if (res.ok) {
            if (notice) {
                notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-emerald-300 bg-emerald-500/15 border-emerald-500/30 block';
                notice.innerHTML = '<i class="fa-solid fa-circle-check mr-1.5 text-emerald-400"></i><strong>Koneksi Sukses!</strong> n8n merespons dengan status ' + res.status + '.';
            }
        } else {
            if (notice) {
                notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-amber-300 bg-amber-500/15 border-amber-500/30 block';
                notice.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1.5 text-amber-400"></i>Sinyal terkirim tapi n8n mengembalikan status ' + res.status + '. Pastikan workflow n8n aktif (Active) atau di mode "Listen for test event".';
            }
        }
    } catch (err) {
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-red-400 bg-red-500/15 border-red-500/30 block';
            notice.innerHTML = '<i class="fa-solid fa-circle-xmark mr-1.5 text-red-400"></i><strong>Gagal terhubung ke n8n:</strong> ' + (err.message || 'Cek koneksi n8n.') + '<br><span class="text-[10px] text-gray-400 mt-1 block">Catatan: Pastikan n8n mengizinkan CORS jika menggunakan instance self-hosted.</span>';
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-bolt text-emerald-400"></i><span>Tes Koneksi</span>';
        }
    }
}

function saveN8nWebhookFromModal() {
    const uid = getActiveUserId();
    const input = document.getElementById('inputN8nWebhookUrl');
    const notice = document.getElementById('n8nModalNotice');
    const url = (input ? input.value : '').trim();

    if (!url) {
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-red-400 bg-red-500/10 border-red-500/20 block';
            notice.textContent = 'URL Webhook tidak boleh kosong. Jika ingin menghapus, gunakan tombol ikon tempat sampah di samping.';
        }
        return;
    }

    if (!uid) {
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-red-400 bg-red-500/10 border-red-500/20 block';
            notice.textContent = 'Silakan login terlebih dahulu untuk menyimpan URL webhook.';
        }
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-red-400 bg-red-500/10 border-red-500/20 block';
            notice.textContent = 'URL harus diawali dengan https:// atau http://';
        }
        return;
    }

    setN8nWebhookUrl(url);

    if (notice) {
        notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-emerald-300 bg-emerald-500/20 border-emerald-500/40 block';
        notice.innerHTML = '<i class="fa-solid fa-circle-check mr-1.5 text-emerald-400"></i>URL Webhook n8n berhasil disimpan khusus untuk akun Anda!';
    }

    setTimeout(() => {
        closeN8nModal();
    }, 900);
}

function logSupabaseDiagnostics() {
    try {
        const urlObj = new URL(SUPABASE_URL);
        const isConfigured = Boolean(
            SUPABASE_PUBLISHABLE_KEY && 
            SUPABASE_PUBLISHABLE_KEY.trim() !== ''
        );
        console.log("[Supabase Auth Diagnostic]", {
            supabaseHost: urlObj.hostname,
            publishableKeyConfigured: isConfigured
        });
    } catch (e) {
        console.warn("[Supabase Auth Diagnostic] Invalid URL format.");
    }
}

const AUTH_REMEMBER_KEY = 'TRENDORA_remember';
const AUTH_UNTIL_KEY = 'TRENDORA_auth_until';
const AUTH_DEVICE_KEY = 'TRENDORA_device_id';
const AUTH_EMAIL_KEY = 'TRENDORA_remembered_email';
const AUTH_MAX_DEVICES = 3;

// The password is never stored in this app — the browser's built-in
// password manager handles password persistence via autocomplete
// attributes. We only remember the email locally so the login form
// can be prefilled when the user has to sign in again.
function loadRememberedEmail() {
    try {
        const value = localStorage.getItem(AUTH_EMAIL_KEY);
        if (!value) return '';
        const email = String(value).trim().toLowerCase();
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
    } catch (_) { return ''; }
}

function saveRememberedEmail(email) {
    try {
        const trimmed = String(email || '').trim().toLowerCase();
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            localStorage.setItem(AUTH_EMAIL_KEY, trimmed);
        }
    } catch (_) {}
}

function clearRememberedEmail() {
    try { localStorage.removeItem(AUTH_EMAIL_KEY); } catch (_) {}
}

function prefillLoginForm() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    if (!emailInput) return;
    const remembered = loadRememberedEmail();
    if (remembered && !emailInput.value) emailInput.value = remembered;
    // Always focus password if email is prefilled (likely re-login),
    // otherwise focus email for a fresh login.
    try {
        if (passwordInput && remembered) passwordInput.focus();
        else emailInput.focus();
    } catch (_) {}
}

function clearSupabaseAuthKeys() {
    const stores = [localStorage, sessionStorage];
    stores.forEach(store => {
        try {
            const remove = [];
            for (let i = 0; i < store.length; i++) {
                const k = store.key(i);
                if (k && k.indexOf('sb-') === 0) remove.push(k);
            }
            remove.forEach(k => store.removeItem(k));
        } catch (_) {}
    });
}

// Supabase Auth must survive reloads, browser restarts, and device restarts.
// Do not switch this storage to sessionStorage based on a UI preference.
const persistentAuthStorage = {
    getItem(key) {
        try { return localStorage.getItem(key); } catch (_) { return null; }
    },
    setItem(key, value) {
        try { localStorage.setItem(key, value); } catch (_) {}
    },
    removeItem(key) {
        try { localStorage.removeItem(key); } catch (_) {}
    }
};

function migrateRememberedSessionToLocalStorage() {
    try {
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.indexOf('sb-') === 0) {
                const value = sessionStorage.getItem(key);
                if (value !== null && localStorage.getItem(key) === null) {
                    localStorage.setItem(key, value);
                }
            }
        }
        localStorage.removeItem(AUTH_UNTIL_KEY);
    } catch (_) {}
}

let supabaseClient = null;
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storage: persistentAuthStorage
            }
        });
    } catch (err) {
        console.warn("[Supabase Auth] Client creation deferred or failed:", err.message);
    }
}
