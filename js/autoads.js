/* ========================================== */
/* PHASE 6A.8: AUTO ADS (TEXT)                 */
/* ========================================== */

const AUTO_ADS_DURATION_HINT = {
    '15s': 'approximately 15 seconds when read at a natural conversational pace',
    '30s': 'approximately 30 seconds when read at a natural conversational pace',
    '45s': 'approximately 45 seconds when read at a natural conversational pace',
    '60s': 'approximately 60 seconds when read at a natural conversational pace'
};

const AUTO_ADS_PLATFORM_GUIDE = {
    'TikTok': 'TikTok-friendly: short punchy sentences, casual spoken-word, trending pacing.',
    'Reels': 'Instagram Reels-friendly: casual, snappy, conversational.',
    'YouTube Shorts': 'YouTube Shorts-friendly: tight hook, fast pacing, strong CTA.',
    'Marketplace': 'Marketplace-friendly: trust-building, benefit-led, concise CTA.',
    'General': 'General-purpose ad copy: clear hook, benefits, strong CTA.'
};

function buildAutoAdsPrompt(a) {
    const durationHint = AUTO_ADS_DURATION_HINT[a.duration] || 'approximately 30 seconds';
    const platformGuide = AUTO_ADS_PLATFORM_GUIDE[a.platform] || AUTO_ADS_PLATFORM_GUIDE.General;
    return [
        'You are an expert short-form ad copywriter.',
        'Generate a single short-form video ad script divided into three sections: HOOK, BODY, and CTA.',
        '',
        'Product: ' + (a.productName || '').trim(),
        '',
        'Benefits / keunggulan:',
        a.benefits || '',
        '',
        (a.audience ? ('Target audience: ' + a.audience + '\n') : '') +
        'Platform: ' + (a.platform || 'General'),
        'Target duration: ' + durationHint,
        '',
        'Platform-specific guidance:',
        platformGuide,
        '',
        'Rules:',
        '- HOOK: 1 short attention-grabbing opening sentence (max ~12 words). Bold, curiosity-driven or benefit-led. No fake medical claims, no fabricated guarantees, no fake stats.',
        '- BODY: 2-5 short sentences covering problem -> benefit -> selling point. Conversational. Natural spoken-word.',
        '- CTA: 1 short closing sentence with a clear call to action (e.g. "Order sekarang", "Klik keranjang", "Cek link di bio").',
        '',
        'Output format: respond in STRICT JSON with keys: hook, body, cta. Values are plain strings.',
        'Do not include any text outside the JSON. Do not include explanations.'
    ].filter(Boolean).join('\n');
}

function parseAutoAdsJson(text) {
    try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start < 0 || end <= start) return null;
        return JSON.parse(text.substring(start, end + 1));
    } catch (e) { return null; }
}

async function generateAdCopy(prompt) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
        })
    });
    if (!response.ok) throw new Error('Gemini text API HTTP ' + response.status);
    const data = await response.json();
    const txt = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    if (!txt) throw new Error('No text returned.');
    const parsed = parseAutoAdsJson(txt);
    if (!parsed) throw new Error('Could not parse ad copy.');
    return {
        hook: (parsed.hook || '').toString().trim(),
        body: (parsed.body || '').toString().trim(),
        cta: (parsed.cta || '').toString().trim(),
        raw: txt
    };
}

async function startAutoAdsGeneration() {
    if (!currentUser.loggedIn) {
        showAuthView();
        return;
    }
    const a = state.autoAds;
    if (!a.productName || !a.productName.trim()) {
        showAutoAdsNotice('Nama Produk wajib diisi.', 'error');
        return;
    }
    if (!a.benefits || !a.benefits.trim()) {
        showAutoAdsNotice('Keunggulan / Benefit wajib diisi.', 'error');
        return;
    }
    const btn = document.getElementById('btnGenerateAutoAds');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> <span>Generating...</span>';
    }
    showAutoAdsNotice('Memanggil text generator...', 'info');

    try {
        const prompt = buildAutoAdsPrompt(a);
        const result = await generateAdCopy(prompt);
        a.hook = result.hook;
        a.body = result.body;
        a.cta = result.cta;
        const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
        setVal('autoAdsHook', a.hook);
        setVal('autoAdsBody', a.body);
        setVal('autoAdsCta', a.cta);
        const resultEl = document.getElementById('autoAdsResult');
        if (resultEl) resultEl.classList.remove('hidden');
        showAutoAdsNotice('Script iklan berhasil di-generate.', 'success');

        // Save to history
        const configSnapshot = {
            productName: a.productName,
            benefits: a.benefits,
            audience: a.audience,
            platform: a.platform,
            duration: a.duration,
            hook: a.hook,
            body: a.body,
            cta: a.cta
        };
        const rec = {
            id: 'aa_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
            ts: new Date().toISOString(),
            tool: 'autoads',
            ownerId: getHistoryOwnerId(),
            parentId: null,
            version: 1,
            configSnapshot: configSnapshot,
            promptUsed: result.raw || '',
            dataUrl: null,
            sourceDataUrl: null
        };
        saveImageGenHistory(rec);
    } catch (err) {
        console.error('[AutoAds] Failed:', err);
        showAutoAdsNotice('Gagal generate script: ' + (err && err.message ? err.message : 'Unknown error'), 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate Iklan</span>';
        }
    }
}

function showAutoAdsNotice(msg, type) {
    const el = document.getElementById('autoAdsNotice');
    if (!el) return;
    if (!msg) {
        el.className = 'hidden text-[11px] p-3 rounded-xl border font-medium';
        el.textContent = '';
        return;
    }
    if (type === 'error') {
        el.className = 'text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-medium block';
    } else if (type === 'success') {
        el.className = 'text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-medium block';
    } else {
        el.className = 'text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl font-medium block';
    }
    el.textContent = msg;
}

function buildFullAdScript() {
    const a = state.autoAds;
    const hook = (a.hook || '').trim();
    const body = (a.body || '').trim();
    const cta = (a.cta || '').trim();
    return [hook, body, cta].filter(Boolean).join('\n\n');
}

async function copyAutoAdsFullScript() {
    const text = buildFullAdScript();
    if (!text) {
        showAutoAdsNotice('Belum ada script untuk dicopy.', 'error');
        return;
    }
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        showAutoAdsNotice('Full script disalin ke clipboard.', 'success');
    } catch (e) {
        showAutoAdsNotice('Gagal menyalin script.', 'error');
    }
}

function sendAutoAdsToVoiceOver() {
    const text = buildFullAdScript();
    if (!text) {
        showAutoAdsNotice('Belum ada script untuk dikirim.', 'error');
        return;
    }
    state.voiceOver.script = text;
    const el = document.getElementById('voiceScript');
    if (el) el.value = text;
    showAutoAdsNotice('Script dikirim ke Voice Over.', 'success');
}

function sendAutoAdsToStoryboard() {
    const text = buildFullAdScript();
    if (!text) {
        showAutoAdsNotice('Belum ada script untuk dikirim.', 'error');
        return;
    }
    const promptEl = document.getElementById('promptInput');
    if (promptEl) {
        promptEl.value = text;
        promptEl.dispatchEvent(new Event('input'));
    }
    showAutoAdsNotice('Script dikirim ke Storyboard prompt. Buka Storyboard untuk generate.', 'success');
}

function navGoAutoAds() {
    setActiveViewKey('autoads');
    setActiveSidebarItem('autoads');
    showAutoAdsView();
}
