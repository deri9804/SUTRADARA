/* ========================================== */
/* PHASE 6A.8: VOICE OVER (TTS)                */
/* ========================================== */

const VOICE_PRESET_TO_GEMINI = {
    'Male Warm': 'Puck',
    'Male Deep': 'Puck',
    'Male Energetic': 'Puck',
    'Female Warm': 'Kore',
    'Female Professional': 'Kore',
    'Female Energetic': 'Kore'
};

const VOICE_STYLE_GUIDE = {
    'Natural': 'Deliver in a natural, conversational tone. Sound like a real person talking to a friend.',
    'Commercial': 'Deliver as a confident, persuasive commercial voiceover. Energetic but clear, suitable for ads and promos.',
    'Storytelling': 'Deliver as a narrator telling a story. Slightly slower, expressive, with natural cadence.',
    'Energetic': 'Deliver with high energy and enthusiasm. Upbeat, dynamic pacing.',
    'Calm': 'Deliver calmly and softly. Relaxed pacing, soothing tone.',
    'Dramatic': 'Deliver dramatically with strong contrast. Powerful, expressive, cinematic pacing.'
};

const TTS_LANG_MAP = {
    'Indonesian': 'Indonesian (Bahasa Indonesia)',
    'English': 'English (US)',
    'Auto': 'Auto-detect from the script content.'
};

function getVoicePlaybackRate(tempo) {
    const parsed = parseFloat(String(tempo || '1.0x').replace('x', ''));
    return Number.isFinite(parsed) && parsed > 0 ? Math.min(1.2, Math.max(0.8, parsed)) : 1;
}

function applyVoicePlaybackSettings() {
    const audio = document.getElementById('voiceOverAudio');
    if (!audio) return;
    const rate = getVoicePlaybackRate(state.voiceOver && state.voiceOver.tempo);
    audio.playbackRate = rate;
    audio.defaultPlaybackRate = rate;
    audio.preservesPitch = true;
    audio.mozPreservesPitch = true;
    audio.webkitPreservesPitch = true;
}

function updateVoiceDurationSection() {
    const v = state.voiceOver;
    const wrap = document.getElementById('voiceCustomDurationWrap');
    if (wrap) wrap.classList.toggle('hidden', v.duration !== 'Custom');
}

function buildVoiceOverPromptText() {
    const v = state.voiceOver;
    const lang = v.language || 'Auto';
    const langName = TTS_LANG_MAP[lang] || 'Auto-detect from the script content.';
    const styleName = v.style || 'Natural';
    const styleGuide = VOICE_STYLE_GUIDE[styleName] || VOICE_STYLE_GUIDE.Natural;
    const tempo = v.tempo || '1.0x';
    let durationHint = '';
    if (v.duration && v.duration !== 'Auto') {
        const secs = v.duration === 'Custom' ? (parseInt(v.customDuration) || 30) : parseInt(v.duration);
        if (secs > 0) durationHint = 'Target total spoken duration: approximately ' + secs + ' seconds. Keep natural conversational pacing and short natural pauses; do not speak unnaturally slowly or stretch syllables just to fill the target.';
    }
    const tempoHint = 'TEMPO CONTROL: Deliver at approximately ' + tempo + ' of natural speech. Keep articulation clear, pauses short and human, and never slow down unnaturally. The player will preserve the selected tempo during playback.';
    const script = (v.script || '').trim();
    return [
        'Language: ' + langName,
        'DELIVERY STYLE: ' + styleName + '. ' + styleGuide,
        tempoHint,
        durationHint,
        'Script to read:',
        '--- SCRIPT START ---',
        script,
        '--- SCRIPT END ---',
        'Read the script exactly as provided. Do not add words. Do not invent content.'
    ].filter(Boolean).join('\n\n');
}

async function generateVoiceOverAudio({ promptText, voiceName }) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent';
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' }
                    }
                }
            }
        })
    });
    if (!response.ok) throw new Error('TTS API HTTP ' + response.status);
    const data = await response.json();
    const audioData = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].inlineData && data.candidates[0].content.parts[0].inlineData.data;
    if (!audioData) throw new Error('No audio data returned.');
    const mime = (data.candidates[0].content.parts[0].inlineData.mimeType) || 'audio/L16;rate=24000';
    const sampleRateMatch = mime.match(/rate=(\d+)/);
    const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1]) : 24000;
    const pcm16 = base64ToPCM16(audioData);
    const wavBlob = pcmToWav(pcm16, sampleRate);
    return { wavBlob, sampleRate, mimeType: 'audio/wav' };
}

function showVoiceOverNotice(msg, type) {
    const el = document.getElementById('voiceOverNotice');
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

let currentVoiceOverBlob = null;
let currentVoiceOverDataUrl = null;

async function startVoiceOverGeneration() {
    if (!currentUser.loggedIn) {
        showAuthView();
        return;
    }
    const v = state.voiceOver;
    const script = (v.script || '').trim();
    if (!script) {
        showVoiceOverNotice('Script / Narasi wajib diisi.', 'error');
        const el = document.getElementById('voiceScript');
        if (el) el.focus();
        return;
    }
    const btn = document.getElementById('btnGenerateVoiceOver');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> <span>Generating...</span>';
    }
    const statusEl = document.getElementById('voiceOverStatus');
    if (statusEl) statusEl.innerHTML = '<span class="text-cyan-300"><i class="fa-solid fa-spinner animate-spin"></i> synthesizing voice...</span>';
    showVoiceOverNotice('Memanggil TTS...', 'info');

    try {
        const voiceName = VOICE_PRESET_TO_GEMINI[v.voice] || 'Kore';
        const promptText = buildVoiceOverPromptText();
        const { wavBlob } = await generateVoiceOverAudio({ promptText, voiceName });
        currentVoiceOverBlob = wavBlob;
        const dataUrl = URL.createObjectURL(wavBlob);
        currentVoiceOverDataUrl = dataUrl;
        const audio = document.getElementById('voiceOverAudio');
        if (audio) {
            audio.src = dataUrl;
            audio.load();
            applyVoicePlaybackSettings();
            try { await audio.play(); } catch (e) { /* autoplay may be blocked; user can press play */ }
        }
        const result = document.getElementById('voiceOverResult');
        if (result) result.classList.remove('hidden');
        if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">done</span>';
        showVoiceOverNotice('Voice berhasil di-generate.', 'success');

        // Save to history (audio dataUrl for persistence)
        const reader = new FileReader();
        reader.onload = function () {
            const audioDataUrl = reader.result;
            const configSnapshot = {
                script: v.script,
                language: v.language,
                voice: v.voice,
                voiceName: voiceName,
                style: v.style,
                tempo: v.tempo,
                duration: v.duration,
                customDuration: v.customDuration
            };
            const rec = {
                id: 'vo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
                ts: new Date().toISOString(),
                tool: 'voiceover',
                ownerId: getHistoryOwnerId(),
                parentId: null,
                version: 1,
                configSnapshot: configSnapshot,
                promptUsed: promptText,
                dataUrl: audioDataUrl,
                sourceDataUrl: null
            };
            saveImageGenHistory(rec);
        };
        reader.readAsDataURL(wavBlob);
    } catch (err) {
        console.error('[VoiceOver] Failed:', err);
        if (statusEl) statusEl.innerHTML = '<span class="text-red-400">failed</span>';
        showVoiceOverNotice('Gagal generate voice: ' + (err && err.message ? err.message : 'Unknown error'), 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate Voice</span>';
        }
    }
}

function downloadVoiceOverAudio() {
    if (!currentVoiceOverBlob) {
        showVoiceOverNotice('Belum ada hasil voice over. Generate dulu.', 'error');
        return;
    }
    const now = new Date();
    const stamp = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + '-' + String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    const filename = 'TRENDORA-ai-voiceover-' + stamp + '.wav';
    const a = document.createElement('a');
    const url = URL.createObjectURL(currentVoiceOverBlob);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function navGoVoiceOver() {
    setActiveViewKey('voiceover');
    setActiveSidebarItem('voiceover');
    showVoiceOverView();
}
