/* ================================================================= */
/* TRENDORA AI - MOTION TRANSFER & VIDEO CHARACTER SWAP              */
/* Video-to-Video character replacement, pose tracking, and V2V      */
/* prompt compilation (Kling AI, Runway Gen-3, Viggle, LivePortrait) */
/* ================================================================= */

const motionTransferState = {
    videoFile: null,
    videoObjectUrl: null,
    videoDuration: 0,
    videoWidth: 0,
    videoHeight: 0,
    aspectRatio: '16:9',
    keyframes: [],
    targetCharacterFile: null,
    targetCharacterDataUrl: null,
    targetCharacterName: '',
    mode: 'full_body', // 'full_body', 'face_swap', 'restyle'
    bgMode: 'keep_bg', // 'keep_bg', 'green_screen', 'ai_bg'
    engine: 'kling', // 'kling', 'runway', 'viggle', 'liveportrait'
    motionWeight: 85, // 0 - 100
    promptNotes: '',
    isAnalyzing: false,
    isRenderingN8n: false,
    analysisResult: null
};

function initMotionTransferUI() {
    // Populate character roster quick-picker if characters exist in state
    syncMotionTransferCharacterRoster();
}

function showMotionTransferNotice(msg, type = 'error') {
    const el = document.getElementById('motionTransferNotice');
    if (!el) return;
    el.classList.remove('hidden', 'border-red-500/30', 'bg-red-500/10', 'text-red-300', 'border-emerald-500/30', 'bg-emerald-500/10', 'text-emerald-300', 'border-amber-500/30', 'bg-amber-500/10', 'text-amber-300');
    if (type === 'error') {
        el.classList.add('border-red-500/30', 'bg-red-500/10', 'text-red-300');
    } else if (type === 'success') {
        el.classList.add('border-emerald-500/30', 'bg-emerald-500/10', 'text-emerald-300');
    } else {
        el.classList.add('border-amber-500/30', 'bg-amber-500/10', 'text-amber-300');
    }
    el.textContent = msg;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideMotionTransferNotice() {
    const el = document.getElementById('motionTransferNotice');
    if (el) el.classList.add('hidden');
}

function resetMotionTransfer() {
    if (motionTransferState.videoObjectUrl) {
        try { URL.revokeObjectURL(motionTransferState.videoObjectUrl); } catch (_) {}
    }
    motionTransferState.videoFile = null;
    motionTransferState.videoObjectUrl = null;
    motionTransferState.videoDuration = 0;
    motionTransferState.videoWidth = 0;
    motionTransferState.videoHeight = 0;
    motionTransferState.aspectRatio = '16:9';
    motionTransferState.keyframes = [];
    motionTransferState.targetCharacterFile = null;
    motionTransferState.targetCharacterDataUrl = null;
    motionTransferState.targetCharacterName = '';
    motionTransferState.isAnalyzing = false;
    motionTransferState.isRenderingN8n = false;
    motionTransferState.analysisResult = null;

    const vInput = document.getElementById('motionTransferVideoInput');
    if (vInput) vInput.value = '';
    const cInput = document.getElementById('motionTransferCharInput');
    if (cInput) cInput.value = '';

    const vDrop = document.getElementById('motionTransferVideoDropzone');
    const vPrev = document.getElementById('motionTransferVideoPreviewWrap');
    if (vDrop) vDrop.classList.remove('hidden');
    if (vPrev) vPrev.classList.add('hidden');

    const cDrop = document.getElementById('motionTransferCharDropzone');
    const cPrev = document.getElementById('motionTransferCharPreviewWrap');
    if (cDrop) cDrop.classList.remove('hidden');
    if (cPrev) cPrev.classList.add('hidden');

    const resCard = document.getElementById('motionTransferResultCard');
    if (resCard) resCard.classList.add('hidden');

    const kfWrap = document.getElementById('motionTransferKeyframesWrap');
    if (kfWrap) kfWrap.innerHTML = '<span class="text-gray-500 text-xs italic">Keyframes akan diekstrak otomatis saat video dipilih.</span>';

    hideMotionTransferNotice();
    updateMotionTransferActionBtn();
}

/* ================================================================= */
/* VIDEO HANDLING & KEYFRAME EXTRACTION                              */
/* ================================================================= */

async function handleMotionTransferVideoSelect(file) {
    if (!file) return;
    hideMotionTransferNotice();

    if (!file.type.startsWith('video/')) {
        showMotionTransferNotice('File harus berformat video (MP4, WebM, MOV).');
        return;
    }

    // Limit to 60MB for browser responsiveness
    if (file.size > 65 * 1024 * 1024) {
        showMotionTransferNotice('Ukuran video melebihi batas 60MB. Gunakan klip video berdurasi 3-15 detik.');
        return;
    }

    motionTransferState.videoFile = file;
    if (motionTransferState.videoObjectUrl) {
        try { URL.revokeObjectURL(motionTransferState.videoObjectUrl); } catch (_) {}
    }
    motionTransferState.videoObjectUrl = URL.createObjectURL(file);

    const player = document.getElementById('motionTransferSourcePlayer');
    if (player) {
        player.src = motionTransferState.videoObjectUrl;
        player.load();
    }

    const drop = document.getElementById('motionTransferVideoDropzone');
    const prev = document.getElementById('motionTransferVideoPreviewWrap');
    if (drop) drop.classList.add('hidden');
    if (prev) prev.classList.remove('hidden');

    const nameEl = document.getElementById('motionTransferVideoFileName');
    if (nameEl) nameEl.textContent = file.name;

    const sizeEl = document.getElementById('motionTransferVideoFileSize');
    if (sizeEl) sizeEl.textContent = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    // Extract keyframes & read metadata
    const kfWrap = document.getElementById('motionTransferKeyframesWrap');
    if (kfWrap) kfWrap.innerHTML = '<div class="flex items-center gap-2 text-cyan-300 text-xs py-2"><i class="fa-solid fa-circle-notch fa-spin"></i><span>Mengekstrak gerakan & keyframe video...</span></div>';

    try {
        const frames = await extractMotionVideoKeyframes(file, 4);
        motionTransferState.keyframes = frames;
        renderMotionTransferKeyframeThumbnails(frames);
    } catch (err) {
        console.warn('[Motion Transfer] Keyframe extract error:', err);
        if (kfWrap) kfWrap.innerHTML = '<span class="text-amber-400 text-xs">Peringatan: Gagal mengekstrak thumbnail keyframe, namun analisis tetap dapat dilanjutkan.</span>';
    }

    updateMotionTransferActionBtn();
}

function extractMotionVideoKeyframes(videoFile, frameCount = 4) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';

        const objectUrl = URL.createObjectURL(videoFile);
        video.src = objectUrl;

        const cleanup = () => {
            try { URL.revokeObjectURL(objectUrl); } catch (_) {}
            video.removeAttribute('src');
            video.load();
        };

        const timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('Waktu ekstraksi frame habis.'));
        }, 25000);

        video.onloadedmetadata = async () => {
            try {
                const duration = video.duration || 1;
                const width = video.videoWidth || 640;
                const height = video.videoHeight || 360;

                motionTransferState.videoDuration = Math.round(duration * 10) / 10;
                motionTransferState.videoWidth = width;
                motionTransferState.videoHeight = height;

                let ratio = '16:9';
                const r = width / height;
                if (r < 0.75) ratio = '9:16';
                else if (r >= 0.75 && r <= 1.25) ratio = '1:1';
                else ratio = '16:9';
                motionTransferState.aspectRatio = ratio;

                const metaBadge = document.getElementById('motionTransferVideoMetaBadge');
                if (metaBadge) {
                    metaBadge.textContent = `${duration.toFixed(1)}s • ${width}x${height} • ${ratio}`;
                }

                const maxDim = 640;
                const scale = Math.min(1, maxDim / Math.max(width, height));
                const canvasW = Math.round(width * scale);
                const canvasH = Math.round(height * scale);

                const canvas = document.createElement('canvas');
                canvas.width = canvasW;
                canvas.height = canvasH;
                const ctx = canvas.getContext('2d');

                const timestamps = [];
                const step = duration / (frameCount + 1);
                for (let i = 1; i <= frameCount; i++) {
                    timestamps.push(Math.min(duration - 0.05, Math.max(0.05, step * i)));
                }

                const frames = [];
                for (let i = 0; i < timestamps.length; i++) {
                    const targetTime = timestamps[i];
                    await new Promise((resSeek) => {
                        let seekDone = false;
                        const onSeeked = () => {
                            if (seekDone) return;
                            seekDone = true;
                            video.removeEventListener('seeked', onSeeked);
                            try {
                                ctx.drawImage(video, 0, 0, canvasW, canvasH);
                                const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
                                const base64 = dataUrl.split(',')[1] || '';
                                frames.push({
                                    index: i + 1,
                                    timestamp: targetTime,
                                    timeStr: targetTime.toFixed(1) + 's',
                                    dataUrl,
                                    base64
                                });
                            } catch (_) {}
                            resSeek();
                        };
                        video.addEventListener('seeked', onSeeked);
                        video.currentTime = targetTime;
                    });
                }

                clearTimeout(timeoutId);
                cleanup();
                resolve(frames);
            } catch (err) {
                clearTimeout(timeoutId);
                cleanup();
                reject(err);
            }
        };

        video.onerror = (e) => {
            clearTimeout(timeoutId);
            cleanup();
            reject(new Error('Gagal memuat file video.'));
        };
    });
}

function renderMotionTransferKeyframeThumbnails(frames) {
    const wrap = document.getElementById('motionTransferKeyframesWrap');
    if (!wrap) return;
    if (!frames || !frames.length) {
        wrap.innerHTML = '<span class="text-gray-500 text-xs italic">Tidak ada keyframe yang diekstrak.</span>';
        return;
    }
    wrap.innerHTML = frames.map(f => `
        <div class="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video flex items-center justify-center">
            <img src="${f.dataUrl}" alt="Frame ${f.index}" class="w-full h-full object-cover">
            <span class="absolute bottom-1 right-1 text-[9px] font-mono font-bold bg-black/75 px-1.5 py-0.5 rounded text-cyan-300 border border-white/10">
                ${f.timeStr}
            </span>
        </div>
    `).join('');
}

/* ================================================================= */
/* TARGET CHARACTER HANDLING & QUICK ROSTER IMPORT                   */
/* ================================================================= */

function handleMotionTransferCharacterSelect(file) {
    if (!file) return;
    hideMotionTransferNotice();

    if (!file.type.startsWith('image/')) {
        showMotionTransferNotice('File karakter harus berupa gambar (JPG, PNG, WebP).');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        motionTransferState.targetCharacterFile = file;
        motionTransferState.targetCharacterDataUrl = dataUrl;
        motionTransferState.targetCharacterName = file.name.replace(/\.[^/.]+$/, '');

        const drop = document.getElementById('motionTransferCharDropzone');
        const prev = document.getElementById('motionTransferCharPreviewWrap');
        if (drop) drop.classList.add('hidden');
        if (prev) prev.classList.remove('hidden');

        const imgEl = document.getElementById('motionTransferCharPreviewImg');
        if (imgEl) imgEl.src = dataUrl;

        const nameEl = document.getElementById('motionTransferCharFileName');
        if (nameEl) nameEl.textContent = file.name;

        updateMotionTransferActionBtn();
    };
    reader.readAsDataURL(file);
}

function syncMotionTransferCharacterRoster() {
    const sel = document.getElementById('motionTransferQuickRosterSelect');
    if (!sel) return;

    const roster = [];

    // Check state.characterReference
    if (Array.isArray(state.characterReference) && state.characterReference.length) {
        state.characterReference.forEach((c, idx) => {
            if (c && c.dataUrl) {
                roster.push({
                    name: c.extractedName || c.name || `Karakter Ref #${idx + 1}`,
                    dataUrl: c.dataUrl
                });
            }
        });
    }

    // Check state.imageGen.character slots
    if (state.imageGen && state.imageGen.character && Array.isArray(state.imageGen.character.characters)) {
        state.imageGen.character.characters.forEach((c, idx) => {
            if (c && c.imageUrl) {
                roster.push({
                    name: c.name || `Character Sheet #${idx + 1}`,
                    dataUrl: c.imageUrl
                });
            }
        });
    }

    if (roster.length === 0) {
        sel.innerHTML = '<option value="">(Belum ada karakter di Storyboard/Character Sheet)</option>';
        sel.disabled = true;
    } else {
        sel.disabled = false;
        sel.innerHTML = '<option value="">-- Pilih Karakter dari Storyboard --</option>' +
            roster.map((r, i) => `<option value="${i}">${r.name}</option>`).join('');
        sel.dataset.roster = JSON.stringify(roster);
    }
}

function onMotionTransferQuickRosterChange(idxVal) {
    if (idxVal === '' || idxVal === undefined) return;
    const sel = document.getElementById('motionTransferQuickRosterSelect');
    if (!sel || !sel.dataset.roster) return;

    try {
        const roster = JSON.parse(sel.dataset.roster);
        const item = roster[parseInt(idxVal, 10)];
        if (!item || !item.dataUrl) return;

        motionTransferState.targetCharacterDataUrl = item.dataUrl;
        motionTransferState.targetCharacterName = item.name;
        motionTransferState.targetCharacterFile = null;

        const drop = document.getElementById('motionTransferCharDropzone');
        const prev = document.getElementById('motionTransferCharPreviewWrap');
        if (drop) drop.classList.add('hidden');
        if (prev) prev.classList.remove('hidden');

        const imgEl = document.getElementById('motionTransferCharPreviewImg');
        if (imgEl) imgEl.src = item.dataUrl;

        const nameEl = document.getElementById('motionTransferCharFileName');
        if (nameEl) nameEl.textContent = item.name + ' (dari Storyboard)';

        updateMotionTransferActionBtn();
    } catch (e) {
        console.warn('Error loading roster item:', e);
    }
}

function setMotionTransferMode(mode) {
    motionTransferState.mode = mode;
    ['modeFullBody', 'modeFaceSwap', 'modeRestyle'].forEach(id => {
        const btn = document.getElementById('btnMt_' + id);
        if (btn) {
            if (btn.dataset.mode === mode) {
                btn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/40 transition';
            } else {
                btn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wide bg-black/40 text-gray-400 hover:text-white border border-white/10 hover:border-emerald-500/30 transition';
            }
        }
    });
}

function setMotionTransferEngine(engine) {
    motionTransferState.engine = engine;
}

function setMotionTransferBg(bgMode) {
    motionTransferState.bgMode = bgMode;
}

function setMotionTransferWeight(val) {
    motionTransferState.motionWeight = parseInt(val, 10) || 85;
    const label = document.getElementById('motionTransferWeightLabel');
    if (label) label.textContent = motionTransferState.motionWeight + '%';
}

function updateMotionTransferActionBtn() {
    const btn = document.getElementById('btnStartMotionTransfer');
    if (!btn) return;
    const ready = Boolean(motionTransferState.videoFile && motionTransferState.targetCharacterDataUrl);
    btn.disabled = !ready || motionTransferState.isAnalyzing;
    if (!ready) {
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

/* ================================================================= */
/* GEMINI VISION MOTION ANALYSIS & PROMPT SYNTHESIS                  */
/* ================================================================= */

function buildMotionTransferSystemPrompt(opts) {
    return `You are a World-Class AI Video-to-Video (V2V), Motion Transfer, and Actor Replacement Director.
Your task is to analyze the motion, body skeleton, gesture, and camera path from the source video keyframes, and seamlessly replace the actor with the target character reference image.

TRANSFER MODE: "${opts.mode.toUpperCase()}"
- FULL_BODY: Replace the entire person, anatomy, outfit, and hairstyle with the target character while keeping the exact body motion, timing, gestures, and environment.
- FACE_SWAP: Keep the original actor's body, outfit, physics, and background, but seamlessly swap the face, eyes, facial expressions, and hairstyle with the target character.
- RESTYLE: Transform the character into a stylized/cinematic variant while retaining 1:1 motion fidelity.

BACKGROUND POLICY: "${opts.bgMode.toUpperCase()}"
- KEEP_BG: Match the exact background, lighting, shadow direction, ambient reflections, and spatial depth of the source video.
- GREEN_SCREEN: Isolate the character on an even studio green screen.
- AI_BG: Re-imagine the background to cinematically complement the new character while keeping the camera tracking trajectory.

TARGET ENGINE: "${opts.engine.toUpperCase()}"
MOTION FIDELITY WEIGHT: ${opts.motionWeight}%

OUTPUT REQUIREMENT:
Respond ONLY with a valid, clean JSON object (no markdown, no backticks, no preamble):
{
  "motionDirective": "Precise breakdown of the physical actions, movement trajectory, cadence, gestures, and timing across the scene",
  "characterLockPrompt": "Detailed visual description of the new character (facial features, hair, clothing, textures) ensuring consistency with the reference image",
  "cameraMotionVector": "Exact camera movement instruction (e.g. tracking shot with subtle handheld shake, fixed 50mm lens, eye-level)",
  "lightingAndCompositing": "Instructions on how the character interacts with the ambient light, rim light, and shadows in the scene",
  "klingV2vPrompt": "Optimized prompt for Kling AI 1.5 Video-to-Video / Elements mode with --motion parameter",
  "runwayGen3Prompt": "Optimized prompt for Runway Gen-3 Alpha Video-to-Video with Motion Guidance notation",
  "viggleDomoPrompt": "Pose tracking prompt for Viggle AI / DomoAI actor replacement",
  "compiledMasterPrompt": "Complete, production-ready master prompt for AI video generation that combines all elements into one cohesive directive",
  "negativePrompt": "Essential negative keywords preventing face distortions, jitter, duplicate limbs, floating artifacts, anatomical deformities"
}`;
}

async function startMotionTransferAnalysis() {
    if (!motionTransferState.videoFile || !motionTransferState.targetCharacterDataUrl) {
        showMotionTransferNotice('Pastikan Anda telah mengunggah Video Sumber dan Foto Karakter Pengganti.');
        return;
    }

    const customNotes = document.getElementById('motionTransferCustomNotes')?.value?.trim() || '';
    motionTransferState.promptNotes = customNotes;

    motionTransferState.isAnalyzing = true;
    updateMotionTransferActionBtn();
    hideMotionTransferNotice();

    const loadingSteps = [
        'Menganalisis kerangka gerak tubuh & gesture dari video sumber...',
        'Memetakan fitur wajah & busana karakter pengganti...',
        'Menyinkronkan arah pencahayaan, bayangan & depth background...',
        'Mengompilasi parameter Video-to-Video (Kling AI, Runway, Viggle)...'
    ];
    let stepIdx = 0;
    const loadingCard = document.getElementById('motionTransferLoadingCard');
    const loadingText = document.getElementById('motionTransferLoadingDesc');
    if (loadingCard) loadingCard.classList.remove('hidden');

    const loadingInterval = setInterval(() => {
        if (!motionTransferState.isAnalyzing) {
            clearInterval(loadingInterval);
            return;
        }
        stepIdx = (stepIdx + 1) % loadingSteps.length;
        if (loadingText) loadingText.textContent = loadingSteps[stepIdx];
    }, 2500);

    try {
        const sysPrompt = buildMotionTransferSystemPrompt({
            mode: motionTransferState.mode,
            bgMode: motionTransferState.bgMode,
            engine: motionTransferState.engine,
            motionWeight: motionTransferState.motionWeight
        });

        const contentsParts = [
            { text: sysPrompt },
            { text: `CATATAN KHUSUS PENGGUNA: ${customNotes || 'Tidak ada catatan tambahan.'}` },
            { text: 'Berikut adalah FOTO KARAKTER PENGGANTI (TARGET):' }
        ];

        // Add character image
        const charMatch = motionTransferState.targetCharacterDataUrl.match(/^data:(image\/[a-z0-9+.-]+);base64,(.+)$/i);
        if (charMatch) {
            contentsParts.push({
                inlineData: {
                    mimeType: charMatch[1],
                    data: charMatch[2]
                }
            });
        }

        contentsParts.push({ text: `Berikut adalah ${motionTransferState.keyframes.length} keyframe visual berturut-turut dari VIDEO SUMBER (MOTION SOURCE):` });
        motionTransferState.keyframes.forEach(k => {
            contentsParts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: k.base64
                }
            });
        });

        const detectedModel = localStorage.getItem('trendora_detected_gemini_model');
        const candidateModels = [
            detectedModel,
            'gemini-2.0-flash',
            'gemini-2.5-flash-preview',
            'gemini-2.5-flash',
            'gemini-3-flash-preview',
            'gemini-2.0-flash-lite'
        ].filter(Boolean);

        const uniqueModels = Array.from(new Set(candidateModels));
        let resultJson = null;
        let lastErr = '';

        const fetchCaller = (typeof fetchWithExponentialBackoff === 'function')
            ? fetchWithExponentialBackoff
            : (u, opt) => fetch(u, opt);

        for (const model of uniqueModels) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
            try {
                const response = await fetchCaller(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: contentsParts }],
                        generationConfig: {
                            temperature: 0.5,
                            maxOutputTokens: 3000
                        }
                    })
                }, 2, 35000);

                if (response && response.ok) {
                    const data = await response.json();
                    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    resultJson = parseMotionTransferResponse(rawText);
                    if (resultJson) break;
                } else if (response) {
                    const errData = await response.json().catch(() => ({}));
                    lastErr = errData?.error?.message || `HTTP ${response.status}`;
                }
            } catch (netErr) {
                lastErr = netErr.message;
            }
        }

        if (!resultJson) {
            throw new Error('Gagal menghasilkan analisis motion transfer: ' + (lastErr || 'Koneksi AI tidak merespons.'));
        }

        motionTransferState.analysisResult = resultJson;
        saveMotionTransferHistory(resultJson);
        renderMotionTransferResult(resultJson);

        showMotionTransferNotice('Motion Transfer & Character Swap berhasil dikompilasi!', 'success');
    } catch (err) {
        console.error('[Motion Transfer] Error:', err);
        showMotionTransferNotice(err.message || 'Terjadi kesalahan saat memproses motion transfer.');
    } finally {
        clearInterval(loadingInterval);
        motionTransferState.isAnalyzing = false;
        if (loadingCard) loadingCard.classList.add('hidden');
        updateMotionTransferActionBtn();
    }
}

function parseMotionTransferResponse(rawText) {
    if (!rawText) return null;
    let clean = rawText.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    clean = clean.trim();

    try {
        return JSON.parse(clean);
    } catch (e) {
        const start = clean.indexOf('{');
        const end = clean.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
            try {
                return JSON.parse(clean.slice(start, end + 1));
            } catch (_) {}
        }
    }
    return null;
}

/* ================================================================= */
/* RENDER RESULTS & UI INTERACTION                                  */
/* ================================================================= */

function renderMotionTransferResult(res) {
    const card = document.getElementById('motionTransferResultCard');
    if (!card) return;
    card.classList.remove('hidden');

    // Dual Comparison
    const motionSrcImg = document.getElementById('motionTransferResultSrcImg');
    const charTargetImg = document.getElementById('motionTransferResultCharImg');
    if (motionSrcImg && motionTransferState.keyframes.length) {
        motionSrcImg.src = motionTransferState.keyframes[0].dataUrl;
    }
    if (charTargetImg && motionTransferState.targetCharacterDataUrl) {
        charTargetImg.src = motionTransferState.targetCharacterDataUrl;
    }

    // Directives
    const dirEl = document.getElementById('motionTransferResultDirective');
    if (dirEl) dirEl.textContent = res.motionDirective || 'Gerakan subjek dipertahankan 1:1.';

    const charLockEl = document.getElementById('motionTransferResultCharLock');
    if (charLockEl) charLockEl.textContent = res.characterLockPrompt || 'Identitas karakter terkunci.';

    const camEl = document.getElementById('motionTransferResultCamera');
    if (camEl) camEl.textContent = res.cameraMotionVector || 'Kamera mengikuti lintasan asli.';

    // Compiled Prompts
    const masterEl = document.getElementById('motionTransferCompiledMaster');
    if (masterEl) masterEl.textContent = res.compiledMasterPrompt || '';

    const klingEl = document.getElementById('motionTransferKlingPrompt');
    if (klingEl) klingEl.textContent = res.klingV2vPrompt || res.compiledMasterPrompt || '';

    const runwayEl = document.getElementById('motionTransferRunwayPrompt');
    if (runwayEl) runwayEl.textContent = res.runwayGen3Prompt || res.compiledMasterPrompt || '';

    const viggleEl = document.getElementById('motionTransferVigglePrompt');
    if (viggleEl) viggleEl.textContent = res.viggleDomoPrompt || res.compiledMasterPrompt || '';

    const negEl = document.getElementById('motionTransferNegPrompt');
    if (negEl) negEl.textContent = res.negativePrompt || 'deformed anatomy, duplicate limbs, distorted face, jitter, blurry, bad hands';

    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copyMotionPromptBlock(elementId, btn) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.innerText || el.textContent || '';
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check text-emerald-400 mr-1"></i>Tersalin!';
        setTimeout(() => { btn.innerHTML = original; }, 2000);
    }).catch(() => {
        showMotionTransferNotice('Gagal menyalin otomatis. Silakan blok dan salin manual.', 'warning');
    });
}

/* ================================================================= */
/* N8N DIRECT PIPELINE EXECUTION & STORYBOARD INGESTION              */
/* ================================================================= */

async function renderMotionTransferToN8n() {
    const webhookUrl = getN8nWebhookUrl ? getN8nWebhookUrl() : localStorage.getItem('n8n_webhook_url');
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
        if (typeof openN8nModal === 'function') {
            openN8nModal('Silakan masukkan URL Webhook n8n Anda untuk merender video.');
        } else {
            showMotionTransferNotice('URL Webhook n8n belum disetel. Buka menu N8N di header untuk mengatur.');
        }
        return;
    }

    if (!motionTransferState.analysisResult) {
        showMotionTransferNotice('Harap lakukan analisis motion transfer terlebih dahulu sebelum mengirim ke n8n.');
        return;
    }

    const btn = document.getElementById('btnMotionTransferN8n');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-1"></i><span>Mengirim ke n8n...</span>';
    }

    const payload = {
        event: 'motion_transfer_render',
        action: 'video_to_video_character_swap',
        transfer_mode: motionTransferState.mode,
        engine: motionTransferState.engine,
        background_mode: motionTransferState.bgMode,
        motion_fidelity: motionTransferState.motionWeight,
        aspect_ratio: motionTransferState.aspectRatio,
        duration: motionTransferState.videoDuration || '5s',
        source_video_name: motionTransferState.videoFile ? motionTransferState.videoFile.name : 'source_motion',
        source_keyframes_count: motionTransferState.keyframes.length,
        source_keyframes: motionTransferState.keyframes.map(k => k.dataUrl),
        target_character_image: motionTransferState.targetCharacterDataUrl,
        target_character_name: motionTransferState.targetCharacterName || 'Target Character',
        compiled_master_prompt: motionTransferState.analysisResult.compiledMasterPrompt,
        kling_prompt: motionTransferState.analysisResult.klingV2vPrompt,
        runway_prompt: motionTransferState.analysisResult.runwayGen3Prompt,
        negative_prompt: motionTransferState.analysisResult.negativePrompt,
        user_phone: (currentUser && currentUser.phone) || localStorage.getItem('trendora_wa_phone') || '',
        user_email: (currentUser && currentUser.email) || '',
        timestamp: new Date().toISOString()
    };

    try {
        let success = false;
        if (typeof dispatchPayloadToN8n === 'function') {
            const resp = await dispatchPayloadToN8n(webhookUrl, payload);
            success = Boolean(resp && resp.ok);
        } else {
            const resp = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            success = resp.ok;
        }

        if (success) {
            showMotionTransferNotice('Paket Motion Transfer terkirim ke n8n! Video hasil render akan otomatis diproses dan dikirim ke nomor WA Anda.', 'success');
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-300 mr-1"></i><span>Terkirim ke n8n!</span>';
                btn.className = 'py-3 px-6 rounded-2xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-bold uppercase tracking-wider text-xs';
            }
        } else {
            throw new Error('Gagal mengirim ke n8n.');
        }
    } catch (err) {
        console.error('[Motion Transfer N8N] Error:', err);
        showMotionTransferNotice('Gagal mengirim ke n8n: ' + err.message);
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles mr-1"></i><span>Render Video via n8n</span>';
        }
    }
}

function sendMotionTransferToStoryboard() {
    if (!motionTransferState.analysisResult) {
        showMotionTransferNotice('Belum ada hasil motion transfer untuk dikirim ke Storyboard.');
        return;
    }

    const promptText = motionTransferState.analysisResult.compiledMasterPrompt || '';
    if (!promptText) return;

    if (typeof navGoStoryboard === 'function') navGoStoryboard();
    const promptInput = document.getElementById('promptInput');
    if (promptInput) {
        promptInput.value = (promptInput.value ? promptInput.value + '\n\n' : '') +
            `[SCENE MOTION TRANSFER]\n${promptText}`;
        showCanvasNotice('Prompt Motion Transfer disuntikkan ke Storyboard!', 'success');
    }
}

/* ================================================================= */
/* HISTORY PERSISTENCE                                               */
/* ================================================================= */

function saveMotionTransferHistory(result) {
    try {
        const histKey = 'trendora_motion_transfer_history';
        const raw = localStorage.getItem(histKey);
        const list = raw ? JSON.parse(raw) : [];

        const record = {
            id: 'mt_' + Date.now(),
            createdAt: new Date().toISOString(),
            mode: motionTransferState.mode,
            engine: motionTransferState.engine,
            characterName: motionTransferState.targetCharacterName,
            characterDataUrl: motionTransferState.targetCharacterDataUrl ? motionTransferState.targetCharacterDataUrl.slice(0, 500) + '...' : '',
            videoName: motionTransferState.videoFile ? motionTransferState.videoFile.name : '',
            duration: motionTransferState.videoDuration,
            aspectRatio: motionTransferState.aspectRatio,
            result: result
        };

        list.unshift(record);
        if (list.length > 20) list.pop();
        localStorage.setItem(histKey, JSON.stringify(list));
    } catch (_) {}
}
