/* ----------------------------------------------------------------- */
/* PHASE 5B: SUPABASE AUTHENTICATION CONFIGURATION                   */
/* ----------------------------------------------------------------- */

const SUPABASE_URL = "https://inixcxbvfyvmuuzlkljq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ozGrENkmrJH48KSWov2BIw_2f13d_qH";

// =================================================================
// GOOGLE GEMINI API (BYOK - BRING YOUR OWN KEY SYSTEM)
// =================================================================
const _DEFAULT_OWNER_KEY = atob("QVEuQWI4Uk42S0gycXZxYjE5YXBqLTBBSE1PNTZNc2gxc0llLVY3V29vZHRiOEVJY1JFN1E=");

function getGeminiApiKey() {
    try {
        const stored = localStorage.getItem('trendora_gemini_api_key') || localStorage.getItem('sutradara_gemini_api_key');
        if (stored && stored.trim()) return stored.trim();
    } catch (_) {}
    if (currentUser && currentUser.role === 'admin') {
        return _DEFAULT_OWNER_KEY;
    }
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
    const currentKey = (function() {
        try { return localStorage.getItem('sutradara_gemini_api_key') || ''; } catch (_) { return ''; }
    })();
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
    try {
        localStorage.setItem('trendora_gemini_api_key', key);
        localStorage.setItem('sutradara_gemini_api_key', key);
        updateApiKeyIndicator();
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-emerald-300 bg-emerald-500/10 border-emerald-500/20 block';
            notice.textContent = '✅ Berhasil! API Key Anda tersimpan aman di browser ini.';
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
    try {
        localStorage.removeItem('trendora_gemini_api_key');
        localStorage.removeItem('sutradara_gemini_api_key');
        const input = document.getElementById('inputGeminiApiKey');
        if (input) input.value = '';
        updateApiKeyIndicator();
        const notice = document.getElementById('apiKeyModalNotice');
        if (notice) {
            notice.className = 'text-[11px] p-3 rounded-xl border font-medium text-amber-300 bg-amber-500/10 border-amber-500/20 block';
            notice.textContent = 'API Key telah dihapus dari perangkat ini.';
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

setTimeout(updateApiKeyIndicator, 500);

// Konfigurasi n8n Webhook URL
// Ganti URL ini dengan Production URL atau Test URL dari n8n Webhook Node Anda
const N8N_WEBHOOK_URL = "https://your-n8n-instance.com/webhook-test/TRENDORA-export"; 

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

const currentUser = {
    userId: null,
    name: "Member",
    email: null,
    role: "member",
    status: "active",
    loggedIn: false
};
