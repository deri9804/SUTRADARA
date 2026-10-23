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
    loggedIn: false,
    uiLanguage: 'id'
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
        // 1. Validasi API Key langsung ke Google ModelService (ListModels)
        const listUrl = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key);
        const listResp = await fetch(listUrl);
        const listData = await listResp.json().catch(() => ({}));

        if (!listResp.ok) {
            const errDetail = (listData && listData.error && listData.error.message) ? listData.error.message : ('HTTP ' + listResp.status);
            if (notice) {
                notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-red-400 bg-red-500/10 border-red-500/20 block';
                notice.textContent = '❌ API Key Ditolak: ' + errDetail;
            }
            return;
        }

        // 2. Ambil model yang aktif dan didukung untuk generateContent di akun ini
        const modelsList = Array.isArray(listData.models) ? listData.models : [];
        const supportedModelObj = modelsList.find(m => 
            Array.isArray(m.supportedGenerationMethods) && 
            m.supportedGenerationMethods.includes('generateContent') &&
            (m.name.includes('flash') || m.name.includes('gemini'))
        );
        const targetModel = supportedModelObj ? supportedModelObj.name.replace(/^models\//, '') : 'gemini-2.0-flash';

        // Simpan model aktif yang terverifikasi ke localStorage
        localStorage.setItem('trendora_detected_gemini_model', targetModel);

        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-emerald-300 bg-emerald-500/10 border-emerald-500/20 block';
            notice.textContent = `✅ API Key Valid! Terhubung ke Google Gemini AI (Model: ${targetModel}).`;
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

        // Sinkronisasi otomatis ke profil Supabase (agar bot WA bisa pakai API Key ini)
        if (typeof supabaseClient !== 'undefined' && supabaseClient && uid) {
            try {
                supabaseClient.from('profiles').update({
                    gemini_api_key: key,
                    updated_at: new Date().toISOString()
                }).eq('id', uid).then().catch(err => console.warn('[Gemini Sync to Supabase]:', err));
            } catch (_) {}
        }

        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-emerald-300 bg-emerald-500/10 border-emerald-500/20 block';
            notice.textContent = '✅ Berhasil! API Key tersimpan dan tersinkron ke akun Trendora AI Anda (termasuk untuk WhatsApp Bot).';
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
            if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                try {
                    supabaseClient.from('profiles').update({
                        gemini_api_key: null,
                        updated_at: new Date().toISOString()
                    }).eq('id', uid).then().catch(() => {});
                } catch (_) {}
            }
        }
        localStorage.removeItem('trendora_gemini_api_key');
        localStorage.removeItem('sutradara_gemini_api_key');
        const input = document.getElementById('inputGeminiApiKey');
        if (input) input.value = '';
        updateApiKeyIndicator();
        const notice = document.getElementById('apiKeyModalNotice');
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-amber-300 bg-amber-500/10 border-amber-500/20 block';
            notice.textContent = 'API Key telah dihapus dari akun Anda.';
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
    const toggle = document.getElementById('toggleN8nAutoForward');
    if (toggle) toggle.checked = false;
    setN8nAutoForward(false);
    const notice = document.getElementById('n8nModalNotice');
    if (notice) {
        notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-amber-300 bg-amber-500/10 border-amber-500/20 block';
        notice.textContent = 'URL Webhook dan Auto-Forward n8n telah dinonaktifkan.';
    }
    updateN8nIndicator();
}

function getN8nAutoForward() {
    const uid = getActiveUserId();
    if (!uid) return false;
    try {
        return localStorage.getItem('trendora_n8n_auto_forward_' + uid) === 'true';
    } catch (_) {
        return false;
    }
}

function setN8nAutoForward(enabled) {
    const uid = getActiveUserId();
    if (!uid) return;
    try {
        localStorage.setItem('trendora_n8n_auto_forward_' + uid, enabled ? 'true' : 'false');
    } catch (_) {}
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
    const toggle = document.getElementById('toggleN8nAutoForward');
    const notice = document.getElementById('n8nModalNotice');
    if (!modal) return;
    const currentUrl = getN8nWebhookUrl();
    if (input) input.value = currentUrl;
    if (toggle) toggle.checked = getN8nAutoForward();
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

    const toggle = document.getElementById('toggleN8nAutoForward');
    const autoForward = toggle ? toggle.checked : false;
    setN8nAutoForward(autoForward);

    // Sinkronisasi ke Supabase profile jika sedang login
    if (typeof supabaseClient !== 'undefined' && supabaseClient && uid) {
        try {
            supabaseClient.from('profiles').update({
                n8n_webhook_url: url,
                n8n_auto_forward: autoForward,
                updated_at: new Date().toISOString()
            }).eq('id', uid).then().catch(() => {});
        } catch (_) {}
    }

    if (notice) {
        notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-emerald-300 bg-emerald-500/20 border-emerald-500/40 block';
        notice.innerHTML = `<i class="fa-solid fa-circle-check mr-1.5 text-emerald-400"></i>Pengaturan n8n berhasil disimpan! Auto-Forward: <strong>${autoForward ? 'AKTIF (ON)' : 'NONAKTIF (OFF)'}</strong>`;
    }

    setTimeout(() => {
        closeN8nModal();
    }, 1100);
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

// =================================================================
// WHATSAPP BOT INTEGRATION MODAL (Baileys / Trendora WA)
// =================================================================
function openWaBotModal() {
    const modal = document.getElementById('waBotModal');
    if (!modal) return;

    // Set Webhook URL dynamically from origin
    const input = document.getElementById('inputWaWebhookUrl');
    if (input) {
        const origin = (window.location && window.location.origin) ? window.location.origin : 'https://sutradara-swart.vercel.app';
        input.value = `${origin}/api/webhook-wa`;
    }

    // Update phone badge
    const phoneBadge = document.getElementById('waModalPhoneBadge');
    if (phoneBadge) {
        const phone = (currentUser && currentUser.phone) || '';
        if (phone) {
            phoneBadge.textContent = phone;
            phoneBadge.className = 'text-emerald-400 font-mono font-bold text-xs truncate';
        } else {
            phoneBadge.textContent = 'Terhubung Otomatis';
            phoneBadge.className = 'text-gray-300 font-mono font-bold text-xs truncate';
        }
    }

    // Update Gemini API Key badge
    const geminiBadge = document.getElementById('waModalGeminiBadge');
    if (geminiBadge) {
        const key = getGeminiApiKey();
        if (key) {
            geminiBadge.innerHTML = '<span class="text-emerald-400"><i class="fa-solid fa-circle-check mr-1"></i>Terpasang 🟢</span>';
        } else {
            geminiBadge.innerHTML = '<span class="text-amber-400 cursor-pointer hover:underline" onclick="closeWaBotModal(); openApiKeyModal();"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Belum Diatur ⚠️</span>';
        }
    }

    // Hide previous copy notice
    const notice = document.getElementById('waWebhookCopyNotice');
    if (notice) notice.classList.add('hidden');

    modal.classList.remove('hidden');
}

function closeWaBotModal() {
    const modal = document.getElementById('waBotModal');
    if (modal) modal.classList.add('hidden');
}

function copyWaBotWebhookUrl() {
    const input = document.getElementById('inputWaWebhookUrl');
    const notice = document.getElementById('waWebhookCopyNotice');
    const btn = document.getElementById('btnCopyWaWebhook');
    if (!input) return;

    input.select();
    input.setSelectionRange(0, 99999);
    try {
        navigator.clipboard.writeText(input.value);
    } catch (_) {
        document.execCommand('copy');
    }

    if (notice) {
        notice.classList.remove('hidden');
    }
    if (btn) {
        const origHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check mr-1"></i><span>Tersalin!</span>';
        btn.classList.add('scale-105');
        setTimeout(() => {
            btn.innerHTML = origHtml;
            btn.classList.remove('scale-105');
        }, 1800);
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


/* ----------------------------------------------------------------- */
/* V5.2: BILINGUAL UI ENGINE (INDONESIAN / ENGLISH)                   */
/* ----------------------------------------------------------------- */

        function uiLanguageStorageKey() {
            if (currentUser && currentUser.loggedIn && currentUser.userId) return 'sutradara.uiLang.' + currentUser.userId;
            if (currentUser && currentUser.email) return 'sutradara.uiLang.' + currentUser.email;
            return 'sutradara.uiLang.guest';
        }
        function loadUiLanguageFromStorage() {
            try {
                const v = window.localStorage.getItem(uiLanguageStorageKey());
                if (v === 'en' || v === 'id') return v;
            } catch (e) { /* ignore */ }
            return 'id';
        }
        function saveUiLanguageToStorage(lang) {
            try {
                if (lang === 'en' || lang === 'id') {
                    window.localStorage.setItem(uiLanguageStorageKey(), lang);
                }
            } catch (e) { /* ignore */ }
        }

        // V5.2: bilingual UI string dictionary. Add new keys here. Anything
        // not in this map falls back to the original Indonesian string so we
        // never break the existing copy.
        const UI_STRINGS = {
            'nav.generateImage': { id: 'GENERATE IMAGE', en: 'GENERATE IMAGE' },
            'nav.fotoGenerate': { id: 'FotoGenerate', en: 'Photo Studio' },
            'nav.thumbnail': { id: 'Thumbnail', en: 'Thumbnail' },
            'nav.infographic': { id: 'Infographic', en: 'Infographic' },
            'nav.ugc': { id: 'UGC / Product Ads', en: 'UGC / Product Ads' },
            'nav.characterSheet': { id: 'Character Sheet', en: 'Character Sheet' },
            'nav.productSheet': { id: 'Product Sheet', en: 'Product Sheet' },
            'nav.poster': { id: 'Poster & Social Media', en: 'Poster & Social Media' },
            'nav.voiceOver': { id: 'Voice Over', en: 'Voice Over' },
            'nav.videoTools': { id: 'VIDEO TOOLS', en: 'VIDEO TOOLS' },
            'nav.gabungkanVideo': { id: 'Gabungkan Video', en: 'Merge Video' },
            'nav.history': { id: 'HISTORY', en: 'HISTORY' },
            'nav.adminPanel': { id: 'ADMIN PANEL', en: 'ADMIN PANEL' },
            'nav.settings': { id: 'SETTINGS', en: 'SETTINGS' },
            'nav.settingsSoon': { id: 'SOON', en: 'SOON' },
            'nav.logout': { id: 'LOGOUT', en: 'LOGOUT' },
            'nav.storyboard': { id: 'STORYBOARD', en: 'STORYBOARD' },
            'storyboard.create': { id: 'Pembuatan Video', en: 'Create Video' },
            'storyboard.commercial': { id: 'Pembuatan Video Iklan', en: 'Ad Creation' },
            'storyboard.drama': { id: 'Pembuatan Konten Kreatif', en: 'Creative Content' },
            'storyboard.animation': { id: 'Animasi Miniatur', en: 'Miniature Animation' },
            'storyboard.shortFilm': { id: 'Pembuatan Short Film', en: 'Short Film' },
            'storyboard.education': { id: 'Edukasi', en: 'Education' },
            'storyboard.documentary': { id: 'Dokumenter', en: 'Documentary' },
            'storyboard.custom': { id: 'Custom Storyboard', en: 'Custom Storyboard' },
            'topbar.appName': { id: 'SUTRADARA AI', en: 'SUTRADARA AI' },
            'topbar.appTagline': { id: 'AI Storyboard & Video Director', en: 'AI Storyboard & Video Director' },
            'history.title': { id: 'History', en: 'History' },
            'history.subtitle': { id: 'Semua aktivitas generate tersimpan rapi di sini. Klik card untuk membuka kembali.', en: 'All generated activities are saved here. Click a card to reopen.' },
            'history.filterAll': { id: 'All', en: 'All' },
            'history.export': { id: 'Export HTML', en: 'Export HTML' },
            'history.upload': { id: 'Upload HTML', en: 'Upload HTML' },
            'history.clear': { id: 'Clear History', en: 'Clear History' },
            'common.cancel': { id: 'Batal', en: 'Cancel' },
            'common.save': { id: 'Simpan', en: 'Save' },
            'common.continue': { id: 'Lanjut', en: 'Continue' },
            'common.generate': { id: 'Generate', en: 'Generate' },
            'common.download': { id: 'Download', en: 'Download' },
            'common.edit': { id: 'Edit', en: 'Edit' },
            'common.retry': { id: 'Coba Lagi', en: 'Retry' },
            'common.copy': { id: 'Copy', en: 'Copy' },
            'common.copied': { id: 'Copied', en: 'Copied' },
            'common.back': { id: 'Kembali', en: 'Back' },
            'common.close': { id: 'Tutup', en: 'Close' },
            'common.reset': { id: 'Reset', en: 'Reset' },
            'common.yes': { id: 'Ya', en: 'Yes' },
            'common.no': { id: 'Tidak', en: 'No' },
            'common.processing': { id: 'Memproses...', en: 'Processing...' },
            'common.ready': { id: 'Siap', en: 'Ready' },
            'common.error': { id: 'Terjadi kesalahan', en: 'Something went wrong' },
            'videoMerge.title': { id: 'Gabungkan Video', en: 'Merge Video' },
            'videoMerge.subtitle': { id: 'Susun klip adegan, tambahkan voice over jika ada, lalu ekspor satu video final dengan crossfade otomatis.', en: 'Arrange scene clips, optionally add voice-over, and export one final video with automatic crossfade.' },
            'videoMerge.history': { id: 'History', en: 'History' },
            'videoMerge.uploadLabel': { id: 'Upload Video Scene', en: 'Upload Scene Video' },
            'videoMerge.voiceOver': { id: 'Voice Over Optional', en: 'Voice Over (Optional)' },
            'videoMerge.btnGabung': { id: 'Gabungkan', en: 'Merge' },
            'videoMerge.btnDownload': { id: 'Download Video', en: 'Download Video' },
            'videoMerge.resultTitle': { id: 'Hasil Video', en: 'Video Result' },
            'productSheet.title': { id: 'PRODUCT SHEET', en: 'PRODUCT SHEET' },
            'productSheet.count': { id: 'Jumlah Produk', en: 'Number of Products' },
            'productSheet.name': { id: 'Nama Produk', en: 'Product Name' },
            'productSheet.desc': { id: 'Deskripsi Produk', en: 'Product Description' },
            'productSheet.dim': { id: 'Dimensi / Ukuran (opsional)', en: 'Dimensions / Size (optional)' },
            'productSheet.palette': { id: 'Palet Warna', en: 'Color Palette' },
            'productSheet.material': { id: 'Material', en: 'Material' },
            'productSheet.refs': { id: 'Foto Referensi', en: 'Reference Photos' },
            'productSheet.btnGenerate': { id: 'Generate Product Sheet', en: 'Generate Product Sheet' },
            'productSheet.btnReset': { id: 'Reset Form', en: 'Reset Form' },
            'characterSheet.title': { id: 'CHARACTER SHEET', en: 'CHARACTER SHEET' },
            'characterSheet.count': { id: 'Jumlah Karakter', en: 'Number of Characters' },
            'characterSheet.name': { id: 'Nama Karakter', en: 'Character Name' },
            'characterSheet.btnGenerate': { id: 'Generate Character Sheet', en: 'Generate Character Sheet' },
            'voiceover.title': { id: 'Voice Over', en: 'Voice Over' },
            'voiceover.subtitle': { id: 'Buat narasi voice over Bahasa Indonesia Gen-Z atau English untuk video, storyboard, atau iklan.', en: 'Generate Indonesian Gen-Z or English voice-over narration for your video, storyboard, or ad.' },
            // Storyboard sub-items in the sidebar nav
            'nav.storyboard.commercial': { id: 'Video Iklan', en: 'Ad Video' },
            'nav.storyboard.commercialFull': { id: 'Pembuatan Video Iklan', en: 'Ad Video Creation' },
            'nav.storyboard.drama': { id: 'Konten Kreatif', en: 'Creative Content' },
            'nav.storyboard.dramaFull': { id: 'Pembuatan Konten Kreatif', en: 'Creative Content Production' },
            'nav.storyboard.animation': { id: 'Animasi', en: 'Animation' },
            'nav.storyboard.animationFull': { id: 'Pembuatan Video Animasi', en: 'Animated Video Production' },
            // User dropdown
            'userMenu.myAccount': { id: 'Akun Saya', en: 'My Account' },
            'userMenu.logout': { id: 'Keluar', en: 'Logout' },
            'userMenu.loggedInAs': { id: 'LOGGED IN AS', en: 'LOGGED IN AS' },
            'userMenu.admin': { id: 'ADMIN', en: 'ADMIN' },
            'userMenu.member': { id: 'MEMBER', en: 'MEMBER' },
            // Home view
            'home.kicker': { id: 'Sutradara AI Home', en: 'Sutradara AI Home' },
            'home.greeting': { id: 'Selamat datang kembali Boss', en: 'Welcome back, Boss' },
            'home.tagline': { id: 'Udah mandi belom? Klo sudah ready, yuk kita mulai berkarya sekarang, klik satu menu di kiri untuk memulai pertempuran hari ini...', en: "Ready to create? Pick a menu on the left and let's start your project today." },
            // Storyboard form
            'storyboard.productionMode': { id: 'Storyboard Production Mode', en: 'Storyboard Production Mode' },
            'storyboard.storyboardLabel': { id: 'Ceritakan Video yang Ingin Kamu Buat', en: 'Tell Us the Video You Want to Make' },
            'storyboard.storyboardHint': { id: 'Auto membaca tujuan, konflik, dan bahasa cerita user sebelum menyusun alur.', en: 'Auto-detects intent, conflict, and language from your story before planning the flow.' },
            'storyboard.storyboardPlaceholder': { id: 'Tulis cerita / ide / brief / naskah kamu di sini... Semakin detail semakin bagus hasilnya. Contoh: Seorang pria menawarkan kopi kepada calon pembeli di kafe bergaya retro...', en: 'Type your story / idea / brief / script here... The more detail, the better the result. Example: A man offers coffee to a potential customer in a retro-style cafe...' },
            'storyboard.settings': { id: 'STORYBOARD SETTINGS', en: 'STORYBOARD SETTINGS' },
            'userMenu.langLabel': { id: 'Bahasa UI', en: 'UI Language' },
            'userMenu.langId': { id: 'Indonesia (default)', en: 'Indonesian (default)' },
            'userMenu.langEn': { id: 'English', en: 'English' },
            // Settings page
            'settings.kicker': { id: 'App Settings', en: 'App Settings' },
            'settings.title': { id: 'Pengaturan', en: 'Settings' },
            'settings.subtitle': { id: 'Sesuaikan tampilan dan bahasa aplikasi.', en: 'Customize the app appearance and language.' },
            'settings.language.title': { id: 'Bahasa UI', en: 'UI Language' },
            'settings.language.desc': { id: 'Pilih bahasa untuk semua menu, tombol, dan label aplikasi. Pilihan tersimpan per user sehingga tetap aktif setelah logout/login ulang.', en: 'Pick the language for all menus, buttons, and labels. The choice is saved per user so it persists after logout/login.' },
            'settings.language.idHint': { id: 'Default. Cocok untuk pengguna Indonesia.', en: 'Default. Suitable for Indonesian users.' },
            'settings.language.enHint': { id: 'Untuk pengguna internasional / non-Indonesia. Mengubah semua menu dan default bahasa storyboard ke English.', en: 'For international / non-Indonesian users. Switches all menus and the default storyboard language to English.' },
            'settings.language.current': { id: 'Saat ini', en: 'Current' }
        };

        function tUi(key, fallback) {
            const entry = UI_STRINGS && UI_STRINGS[key];
            if (!entry) return fallback != null ? fallback : key;
            const lang = (currentUser && currentUser.uiLanguage) || 'id';
            return entry[lang] || entry.id || (fallback != null ? fallback : key);
        }

        function applyUiLanguage() {
            // Toggle the i18n attribute so CSS can react if needed.
            const lang = (currentUser && currentUser.uiLanguage) || 'id';
            try { document.documentElement.setAttribute('data-ui-lang', lang); } catch (e) {}
            // Walk every element with a data-i18n="key" attribute and replace
            // its text content with the localized string. Missing keys leave
            // the element untouched, so the rest of the UI keeps its original
            // Indonesian copy.
            const nodes = document.querySelectorAll('[data-i18n]');
            nodes.forEach((el) => {
                const key = el.getAttribute('data-i18n');
                if (!key) return;
                const entry = UI_STRINGS[key];
                if (!entry) return;
                el.textContent = entry[lang] || entry.id || key;
            });
            // Also translate text inputs / textareas that use data-i18n-placeholder.
            const phNodes = document.querySelectorAll('[data-i18n-placeholder]');
            phNodes.forEach((el) => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (!key) return;
                const entry = UI_STRINGS[key];
                if (!entry) return;
                el.setAttribute('placeholder', entry[lang] || entry.id || key);
            });
            // Keep the language switcher dropdown in sync with the active lang.
            const langSel = document.getElementById('uiLanguageSelect');
            if (langSel && langSel.value !== lang) langSel.value = lang;
        }

        function setUiLanguage(lang, opts) {
            if (lang !== 'en' && lang !== 'id') return;
            currentUser.uiLanguage = lang;
            saveUiLanguageToStorage(lang);
            applyUiLanguage();
            // Update the dropdown UI if it's open somewhere
            const sel = document.getElementById('uiLanguageSelect');
            if (sel) sel.value = lang;
            // V5.2: when the user switches the app to English, the storyboard
            // spoken language default should follow so the dialog defaults
            // to English. When the user switches back to Indonesian, restore
            // the Gen-Z default (only if the user hadn't manually picked a
            // different language yet — we detect that by checking whether the
            // current value is one of the auto-managed defaults).
            if (lang === 'en') {
                if (typeof state !== 'undefined' && state && state.language) {
                    if (!/^english/i.test(state.language)) {
                        const prev = state.language;
                        state.language = 'English';
                        // Persist the new default so the next fresh storyboard
                        // also starts in English.
                        try {
                            const sel2 = document.getElementById('selectLanguage');
                            if (sel2) {
                                sel2.value = 'English';
                                if (typeof state !== 'undefined' && state) {
                                    // remember the user explicitly moved it
                                    state.__uiLanguageAutoSwitchedFrom = prev;
                                }
                            }
                        } catch (e) { /* ignore */ }
                    }
                }
            } else if (lang === 'id') {
                if (typeof state !== 'undefined' && state && state.language && state.__uiLanguageAutoSwitchedFrom) {
                    state.language = state.__uiLanguageAutoSwitchedFrom;
                    const sel2 = document.getElementById('selectLanguage');
                    if (sel2) sel2.value = state.__uiLanguageAutoSwitchedFrom;
                    state.__uiLanguageAutoSwitchedFrom = null;
                }
            }
            if (!opts || !opts.silent) {
                showCanvasNotice(lang === 'en' ? 'UI language set to English. Default storyboard language switched to English.' : 'Bahasa UI disetel ke Indonesia.', 'info');
            }
            // Keep the Settings page radios + the user dropdown widget in sync.
            try { syncSettingsLanguageRadios(); } catch (e) { /* ignore */ }
        }

        function restoreUiLanguageOnLogin() {
            const stored = loadUiLanguageFromStorage();
            currentUser.uiLanguage = stored;
            applyUiLanguage();
            const sel = document.getElementById('uiLanguageSelect');
            if (sel) sel.value = stored;
        }

        // V5.2: when the app re-renders large sections (e.g. nav state change,
        // history view, storyboard results) the new nodes are not in the DOM
        // when the initial applyUiLanguage() runs. A MutationObserver re-runs
        // the i18n pass for each new subtree so freshly added buttons / labels
        // / tooltips immediately reflect the chosen language.
        function setupUiLanguageObserver() {
            if (typeof MutationObserver === 'undefined') return;
            try {
                const observer = new MutationObserver((mutations) => {
                    if (!currentUser || currentUser.uiLanguage === 'id') return;
                    let needsReapply = false;
                    for (const m of mutations) {
                        if (m.addedNodes && m.addedNodes.length) {
                            for (const n of m.addedNodes) {
                                if (n.nodeType === 1 && (n.hasAttribute && (n.hasAttribute('data-i18n') || n.hasAttribute('data-i18n-placeholder') || (n.querySelector && (n.querySelector('[data-i18n]') || n.querySelector('[data-i18n-placeholder]')))))) {
                                    needsReapply = true;
                                    break;
                                }
                            }
                        }
                        if (needsReapply) break;
                    }
                    if (needsReapply) {
                        try { applyUiLanguage(); } catch (e) { /* swallow */ }
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
            } catch (e) { /* ignore */ }
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupUiLanguageObserver);
        } else {
            setupUiLanguageObserver();
        }



// V5.2 (Isu #1): Indonesian chat shorthand that speech models cannot
// pronounce. The video model synthesises the [AUDIO / DIALOGUE] block
// verbatim and the Gemini TTS voice-over reads the script verbatim, so
// these tokens are read literally: "loe" becomes "lo-e" and "bgt"
// becomes "baget". Only the audio path is rewritten — the on-screen
// script textarea keeps whatever the user or the director wrote.
function toPronounceableIndonesian(value) {
    const text = String(value || '');
    if (!text) return text;
    return text
        .replace(/\bloe\b/gi, 'lo')
        .replace(/\bb(?:gt|tg|ngt|ng)(?:2|nya)?\b/g, 'banget')
        .replace(/\bsngat\b/gi, 'sangat')
        .replace(/\bklo\b/gi, 'kalau')
        .replace(/\bkyk\b/gi, 'kayak')
        .replace(/\bdmn\b/gi, 'darimana')
        .replace(/\byg\b/gi, 'yang');
}

