/* ================================================================= */
/* TRENDORA AI — VIDEO TO PROMPT (AI REVERSE VIDEO VISION ENGINE)     */
/* Reverse-engineers any video into Midjourney, Flux, Kling, Runway   */
/* prompts & Director Cinematography breakdown using Gemini Vision.   */
/* ================================================================= */

const videoToPromptState = {
    file: null,
    videoUrl: null,
    duration: 0,
    width: 0,
    height: 0,
    aspectRatio: '16:9',
    frames: [],
    targetEngine: 'all',
    focusMode: 'full',
    customNotes: '',
    isExtracting: false,
    isAnalyzing: false,
    currentResult: null
};

/* ----------------------------------------------------------------- */
/* 1. INITIALIZATION & DRAG-AND-DROP                                 */
/* ----------------------------------------------------------------- */
function initVideoToPromptUI() {
    const dropZone = document.getElementById('videoToPromptDropZone');
    if (!dropZone || dropZone.dataset.initialized === 'true') return;
    dropZone.dataset.initialized = 'true';

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('border-amber-400', 'bg-amber-500/10', 'scale-[1.01]');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('border-amber-400', 'bg-amber-500/10', 'scale-[1.01]');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt && dt.files;
        if (files && files.length > 0) {
            handleVideoToPromptSelect(files[0]);
        }
    }, false);
}

document.addEventListener('DOMContentLoaded', () => {
    initVideoToPromptUI();
});

/* ----------------------------------------------------------------- */
/* 2. FILE SELECTION & RESET                                         */
/* ----------------------------------------------------------------- */
function showVideoToPromptNotice(msg, type = 'error') {
    const el = document.getElementById('videoToPromptNotice');
    if (!el) return;
    if (!msg) {
        el.className = 'hidden text-[11px] p-3 rounded-xl border font-medium';
        el.textContent = '';
        return;
    }
    if (type === 'error') {
        el.className = 'text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-medium block leading-relaxed';
    } else if (type === 'success') {
        el.className = 'text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-medium block leading-relaxed';
    } else {
        el.className = 'text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl font-medium block leading-relaxed';
    }
    el.innerHTML = msg;
}

function resetVideoToPrompt() {
    if (videoToPromptState.videoUrl) {
        try { URL.revokeObjectURL(videoToPromptState.videoUrl); } catch (_) {}
    }
    videoToPromptState.file = null;
    videoToPromptState.videoUrl = null;
    videoToPromptState.duration = 0;
    videoToPromptState.frames = [];
    videoToPromptState.isExtracting = false;
    videoToPromptState.isAnalyzing = false;
    videoToPromptState.currentResult = null;

    const input = document.getElementById('videoToPromptInput');
    if (input) input.value = '';

    const player = document.getElementById('videoToPromptPlayer');
    if (player) {
        player.pause();
        player.removeAttribute('src');
        player.load();
    }

    const previewWrap = document.getElementById('videoToPromptPreviewWrap');
    if (previewWrap) previewWrap.classList.add('hidden');

    const dropZone = document.getElementById('videoToPromptDropZone');
    if (dropZone) dropZone.classList.remove('hidden');

    const btnReset = document.getElementById('btnResetVideoToPrompt');
    if (btnReset) btnReset.classList.add('hidden');

    const btnGen = document.getElementById('btnGenerateVideoToPrompt');
    if (btnGen) {
        btnGen.disabled = true;
        const txt = document.getElementById('btnGenerateVideoToPromptText');
        if (txt) txt.textContent = 'Ekstrak & Bedah Prompt Video';
    }

    const strip = document.getElementById('videoToPromptFramesStrip');
    if (strip) strip.innerHTML = '';

    showVideoToPromptNotice('');

    // Revert results to empty state
    const emptyState = document.getElementById('videoToPromptEmptyState');
    if (emptyState) emptyState.classList.remove('hidden');

    const loadingState = document.getElementById('videoToPromptLoadingState');
    if (loadingState) loadingState.classList.add('hidden');

    const resContainer = document.getElementById('videoToPromptResultContainer');
    if (resContainer) resContainer.classList.add('hidden');
}

async function handleVideoToPromptSelect(file) {
    if (!file) return;

    if (!file.type || (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|m4v|avi)$/i))) {
        showVideoToPromptNotice('Format file tidak didukung. Mohon gunakan video berformat MP4, WebM, MOV, atau MKV.', 'error');
        return;
    }

    showVideoToPromptNotice('');
    resetVideoToPrompt();

    videoToPromptState.file = file;
    const objectUrl = URL.createObjectURL(file);
    videoToPromptState.videoUrl = objectUrl;

    const dropZone = document.getElementById('videoToPromptDropZone');
    if (dropZone) dropZone.classList.add('hidden');

    const previewWrap = document.getElementById('videoToPromptPreviewWrap');
    if (previewWrap) previewWrap.classList.remove('hidden');

    const btnReset = document.getElementById('btnResetVideoToPrompt');
    if (btnReset) btnReset.classList.remove('hidden');

    const player = document.getElementById('videoToPromptPlayer');
    if (player) {
        player.src = objectUrl;
        player.load();
    }

    const strip = document.getElementById('videoToPromptFramesStrip');
    if (strip) {
        strip.innerHTML = `
            <div class="col-span-5 text-center py-4 text-xs text-amber-300 font-mono flex items-center justify-center gap-2">
                <i class="fa-solid fa-spinner animate-spin"></i>
                <span>Mengekstrak keyframe visual di browser...</span>
            </div>
        `;
    }

    videoToPromptState.isExtracting = true;
    try {
        const extraction = await extractVideoKeyframes(file, 5);
        videoToPromptState.duration = extraction.duration;
        videoToPromptState.width = extraction.width;
        videoToPromptState.height = extraction.height;
        videoToPromptState.aspectRatio = extraction.aspectRatio;
        videoToPromptState.frames = extraction.frames;

        // Render extracted frames
        renderKeyframeThumbnails(extraction.frames);

        // Update Meta badge
        const meta = document.getElementById('videoToPromptVideoMeta');
        if (meta) {
            const mins = Math.floor(extraction.duration / 60);
            const secs = Math.floor(extraction.duration % 60);
            const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            meta.textContent = `${timeStr} • ${extraction.aspectRatio} (${extraction.width}x${extraction.height})`;
        }

        const badge = document.getElementById('videoToPromptFrameCountBadge');
        if (badge) badge.textContent = `${extraction.frames.length} Frame Aktif`;

        // Enable generate button
        const btnGen = document.getElementById('btnGenerateVideoToPrompt');
        if (btnGen) btnGen.disabled = false;

        showVideoToPromptNotice('✅ Video siap dianalisis! Klik tombol di bawah untuk membongkar prompt AI-nya.', 'success');
    } catch (err) {
        console.error('[VideoToPrompt] Error extracting frames:', err);
        showVideoToPromptNotice('Gagal mengekstrak frame dari video: ' + (err.message || 'Format tidak dapat dibaca oleh browser'), 'error');
        if (strip) strip.innerHTML = '<div class="col-span-5 text-center text-xs text-red-400 py-3">Gagal mengambil frame.</div>';
    } finally {
        videoToPromptState.isExtracting = false;
    }
}

/* ----------------------------------------------------------------- */
/* 3. CLIENT-SIDE KEYFRAME EXTRACTION (HTML5 CANVAS)                 */
/* ----------------------------------------------------------------- */
function formatVideoTime(sec) {
    const s = Math.max(0, Number(sec) || 0);
    const m = Math.floor(s / 60);
    const rem = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function detectAspectRatio(w, h) {
    if (!w || !h) return '16:9';
    const ratio = w / h;
    if (Math.abs(ratio - 16 / 9) < 0.15) return '16:9';
    if (Math.abs(ratio - 9 / 16) < 0.15) return '9:16';
    if (Math.abs(ratio - 1) < 0.15) return '1:1';
    if (Math.abs(ratio - 4 / 5) < 0.15) return '4:5';
    if (Math.abs(ratio - 21 / 9) < 0.2) return '21:9';
    if (ratio > 1.2) return '16:9';
    if (ratio < 0.8) return '9:16';
    return '1:1';
}

function extractVideoKeyframes(videoFile, frameCount = 5) {
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
            reject(new Error('Waktu pengambilan frame habis (timeout).'));
        }, 30000);

        video.onloadedmetadata = async () => {
            try {
                const duration = video.duration || 1;
                const width = video.videoWidth || 640;
                const height = video.videoHeight || 360;
                const aspectRatio = detectAspectRatio(width, height);

                // Scale frame to max 720px for optimal detail + fast network payload
                const maxDim = 720;
                const scale = Math.min(1, maxDim / Math.max(width, height));
                const canvasW = Math.round(width * scale);
                const canvasH = Math.round(height * scale);

                const canvas = document.createElement('canvas');
                canvas.width = canvasW;
                canvas.height = canvasH;
                const ctx = canvas.getContext('2d');

                // Generate timestamps evenly across video (e.g. 10%, 30%, 50%, 75%, 90%)
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
                                    timeStr: formatVideoTime(targetTime),
                                    dataUrl: dataUrl,
                                    base64: base64
                                });
                            } catch (e) {
                                console.warn('[VideoToPrompt] Frame draw error:', e);
                            }
                            resSeek();
                        };

                        video.addEventListener('seeked', onSeeked, { once: true });
                        video.currentTime = targetTime;

                        // Seek fallback safety
                        setTimeout(() => {
                            if (!seekDone) {
                                seekDone = true;
                                video.removeEventListener('seeked', onSeeked);
                                resSeek();
                            }
                        }, 2500);
                    });
                }

                clearTimeout(timeoutId);
                cleanup();

                if (frames.length === 0) {
                    throw new Error('Tidak ada frame yang berhasil diambil dari video ini.');
                }

                resolve({
                    duration,
                    width,
                    height,
                    aspectRatio,
                    frames
                });
            } catch (err) {
                clearTimeout(timeoutId);
                cleanup();
                reject(err);
            }
        };

        video.onerror = () => {
            clearTimeout(timeoutId);
            cleanup();
            reject(new Error('Browser gagal memutar video. Pastikan format video valid.'));
        };
    });
}

function renderKeyframeThumbnails(frames) {
    const strip = document.getElementById('videoToPromptFramesStrip');
    if (!strip) return;
    strip.innerHTML = '';

    frames.forEach(frame => {
        const item = document.createElement('div');
        item.className = 'relative rounded-xl overflow-hidden border border-white/15 bg-black/60 group aspect-video flex items-center justify-center';
        item.innerHTML = `
            <img src="${frame.dataUrl}" alt="Frame ${frame.index}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            <div class="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-amber-300 font-bold">
                ${frame.timeStr}
            </div>
            <div class="absolute top-1 left-1 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-300">
                #${frame.index}
            </div>
        `;
        strip.appendChild(item);
    });
}

/* ----------------------------------------------------------------- */
/* 4. AI PROMPT REVERSE ENGINEERING (GEMINI MULTIMODAL VISION)       */
/* ----------------------------------------------------------------- */
function buildVideoToPromptSystemPrompt(options) {
    const { aspectRatio, focusMode, targetEngine, customNotes } = options;

    return `You are TRENDORA AI's Executive Film Director and Principal AI Prompt Engineer.
Your mission is to perform REVERSE PROMPT ENGINEERING on a sequence of visual keyframes extracted from a real video.

VIDEO SPECIFICATIONS:
- Detected Aspect Ratio: ${aspectRatio}
- Preferred Target Engine: ${targetEngine}
- User Focus Mode: ${focusMode}
${customNotes ? `- Custom Director Notes from User: "${customNotes}"` : ''}

INSTRUCTIONS:
Analyze the sequential keyframes with extreme cinematic precision:
1. Identify the subject (character, clothing, hair, expression, accessories, product, or central action).
2. Deconstruct the lighting setup (key light, fill, backlight, color temperature, volumetric rays, chiaroscuro, natural vs studio).
3. Identify camera lenses, focal length, depth of field, bokeh, aspect ratio, framing, and angle (wide, close-up, low angle, overhead, etc.).
4. Deduce camera motion & dynamics between frames (dolly in/out, pan, orbital tracking, slow motion, handheld, drone swoop).
5. Extract color grading, film stock aesthetic, and atmosphere (cyberpunk, vintage 35mm, high-fashion RAW, anime, hyperrealistic 8k).

OUTPUT FORMAT:
You MUST reply with a single VALID JSON object (and nothing else, no markdown codeblock wrapper, no preamble).
Use this exact JSON schema:
{
  "title": "Short evocative title in English/Indonesian (e.g. Cyberpunk Rainy Alleyway Chase)",
  "genre": "Genre / Visual Aesthetic (e.g. Cinematic Sci-Fi Noir / Photorealistic Commercial)",
  "aspectRatio": "${aspectRatio}",
  "directorSummary": "1-2 sentence executive summary of the visual hook, story beat, and cinematic tone.",
  "imagePromptMidjourney": "Exhaustive, professional prompt for Midjourney v6.1 in English. Specify subject, action, environment, lighting, camera angle, lens, film stock, atmosphere, followed strictly by --ar ${aspectRatio.replace(':', ':')} --v 6.1 --style raw",
  "imagePromptFlux": "Detailed photorealistic RAW prompt for Flux.1 [dev/schnell] in English. Highlight natural skin textures, micro-details, authentic lighting, and composition.",
  "videoMotionPrompt": "Precision camera movement and temporal motion prompt for Kling AI 1.5, Runway Gen-3 Alpha, and Luma Dream Machine. Detail exact camera trajectory (e.g., slow cinematic push-in, subtle orbital pan), subject movement, speed dynamics, and physical consistency.",
  "cinematography": {
    "shotType": "Camera shot framing & angle (e.g., Medium Close-Up, Low-Angle Hero Shot)",
    "lighting": "Lighting description (e.g., Golden hour rim light with soft diffuse fill)",
    "cameraLens": "Camera simulation (e.g., 35mm Anamorphic Lens, f/1.8, Shallow Depth of Field)",
    "colorGrading": "Palette & tone (e.g., Moody Teal & Warm Amber, rich dynamic range)",
    "soundDesign": "Audio / SFX / Music mood recommendation (e.g., Atmospheric synth drone, rain ambient, heart-beat kick)"
  },
  "scenes": [
    {
      "sceneNum": 1,
      "visual": "Brief scene description",
      "imagePrompt": "Image prompt for scene 1",
      "motionPrompt": "Motion instructions for scene 1"
    }
  ],
  "negativePrompt": "blurry, low quality, distorted anatomy, extra limbs, cartoonish, oversaturated, jittery camera, text, watermark"
}`;
}

async function startVideoToPromptAnalysis() {
    if (!currentUser || !currentUser.loggedIn || currentUser.status !== 'active') {
        if (typeof showAuthView === 'function') showAuthView();
        return;
    }

    if (!videoToPromptState.frames || videoToPromptState.frames.length === 0) {
        showVideoToPromptNotice('Silakan upload video terlebih dahulu.', 'error');
        return;
    }

    const apiKey = typeof getGeminiApiKey === 'function' ? getGeminiApiKey() : '';
    if (!apiKey) {
        if (typeof openApiKeyModal === 'function') {
            openApiKeyModal('Silakan masukkan Gemini API Key Anda untuk mulai membedah video.');
        } else {
            showVideoToPromptNotice('Gemini API Key belum diatur. Silakan atur di menu navigasi atas.', 'error');
        }
        return;
    }

    showVideoToPromptNotice('');

    // Collect options
    const focusMode = (document.getElementById('videoToPromptFocusMode')?.value) || 'full';
    const targetEngine = (document.getElementById('videoToPromptTargetEngine')?.value) || 'all';
    const customNotes = (document.getElementById('videoToPromptCustomNotes')?.value || '').trim();

    videoToPromptState.focusMode = focusMode;
    videoToPromptState.targetEngine = targetEngine;
    videoToPromptState.customNotes = customNotes;
    videoToPromptState.isAnalyzing = true;

    // Toggle UI States
    const emptyState = document.getElementById('videoToPromptEmptyState');
    if (emptyState) emptyState.classList.add('hidden');

    const loadingState = document.getElementById('videoToPromptLoadingState');
    if (loadingState) loadingState.classList.remove('hidden');

    const resContainer = document.getElementById('videoToPromptResultContainer');
    if (resContainer) resContainer.classList.add('hidden');

    const btnGen = document.getElementById('btnGenerateVideoToPrompt');
    if (btnGen) {
        btnGen.disabled = true;
        const txt = document.getElementById('btnGenerateVideoToPromptText');
        if (txt) txt.textContent = 'Membedah Video...';
    }

    // Dynamic Loading Text Cycle
    const loadingSteps = [
        'Mengekstrak ciri khas visual dari rangkaian keyframe...',
        'Mendeteksi pencahayaan, jenis lensa, dan color grading...',
        'Menganalisis pergerakan kamera & tempo aksi video...',
        'Menyusun prompt sinematik siap pakai untuk Midjourney & Kling AI...'
    ];
    let stepIdx = 0;
    const loadingInterval = setInterval(() => {
        if (!videoToPromptState.isAnalyzing) {
            clearInterval(loadingInterval);
            return;
        }
        stepIdx = (stepIdx + 1) % loadingSteps.length;
        const descEl = document.getElementById('videoToPromptLoadingDesc');
        if (descEl) descEl.textContent = loadingSteps[stepIdx];
    }, 2800);

    try {
        const systemPrompt = buildVideoToPromptSystemPrompt({
            aspectRatio: videoToPromptState.aspectRatio,
            focusMode,
            targetEngine,
            customNotes
        });

        // Construct parts
        const contentsParts = [
            { text: systemPrompt },
            { text: `Berikut adalah ${videoToPromptState.frames.length} keyframe visual berturut-turut dari video referensi:` }
        ];

        videoToPromptState.frames.forEach(frame => {
            contentsParts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: frame.base64
                }
            });
        });

        // Candidate models list with dynamic discovery fallback
        const detectedModel = localStorage.getItem('trendora_detected_gemini_model');
        const candidateModels = [
            detectedModel,
            'gemini-2.0-flash',
            'gemini-2.5-flash-preview',
            'gemini-2.5-flash',
            'gemini-3-flash-preview',
            'gemini-2.0-flash-lite'
        ].filter(Boolean);

        // Deduplicate
        const uniqueModels = Array.from(new Set(candidateModels));

        let lastErr = '';
        let resultJson = null;

        for (const model of uniqueModels) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: contentsParts }],
                        generationConfig: {
                            temperature: 0.6,
                            maxOutputTokens: 3500
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    if (rawText) {
                        resultJson = parseVideoToPromptResponse(rawText);
                        if (resultJson) {
                            console.log(`[VideoToPrompt] Analisis sukses menggunakan model: ${model}`);
                            break;
                        }
                    }
                } else {
                    const errBody = await response.text().catch(() => '');
                    lastErr = `HTTP ${response.status}: ${errBody.slice(0, 120)}`;
                    console.warn(`[VideoToPrompt] Model ${model} returned error:`, lastErr);
                    if (response.status === 404 || errBody.includes('not found') || errBody.includes('not supported')) {
                        continue;
                    }
                }
            } catch (fetchErr) {
                lastErr = fetchErr.message;
            }
        }

        if (!resultJson) {
            throw new Error(lastErr || 'AI tidak mengembalikan analisis yang valid. Silakan coba kembali.');
        }

        // Render Results
        renderVideoToPromptResult(resultJson);
    } catch (err) {
        console.error('[VideoToPrompt] Analysis error:', err);
        showVideoToPromptNotice('❌ Gagal membedah video: ' + (err.message || 'Terjadi gangguan koneksi API.'), 'error');
        if (loadingState) loadingState.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
    } finally {
        clearInterval(loadingInterval);
        videoToPromptState.isAnalyzing = false;
        if (btnGen) {
            btnGen.disabled = false;
            const txt = document.getElementById('btnGenerateVideoToPromptText');
            if (txt) txt.textContent = 'Ekstrak & Bedah Prompt Video';
        }
    }
}

function parseVideoToPromptResponse(rawText) {
    if (!rawText) return null;
    let text = rawText.trim();

    // Strip markdown code fences if wrapped
    if (text.startsWith('```json')) {
        text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    } else if (text.startsWith('```')) {
        text = text.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
    }

    try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start >= 0 && end > start) {
            const cleanJson = text.substring(start, end + 1);
            return JSON.parse(cleanJson);
        }
    } catch (err) {
        console.warn('[VideoToPrompt] Direct JSON parse failed, trying fallback extraction:', err);
    }

    // Resilient fallback structure if JSON was slightly malformed
    return {
        title: 'Bedah Sinematik Video',
        genre: 'Cinematic AI',
        aspectRatio: videoToPromptState.aspectRatio || '16:9',
        directorSummary: text.slice(0, 250) + '...',
        imagePromptMidjourney: text.slice(0, 400) + ` --ar ${videoToPromptState.aspectRatio} --v 6.1 --style raw`,
        imagePromptFlux: text.slice(0, 350),
        videoMotionPrompt: 'Cinematic camera movement, natural subject motion, high dynamic range, smooth temporal continuity.',
        cinematography: {
            shotType: 'Cinematic Framing',
            lighting: 'Natural Ambient Lighting',
            cameraLens: '35mm Lens, Shallow Depth of Field',
            colorGrading: 'Rich Dynamic Contrast',
            soundDesign: 'Cinematic soundscape'
        },
        scenes: [],
        negativePrompt: 'blurry, low quality, distorted, extra limbs, bad anatomy'
    };
}

/* ----------------------------------------------------------------- */
/* 5. RESULT RENDERING & PERSISTENCE                                 */
/* ----------------------------------------------------------------- */
async function renderVideoToPromptResult(result) {
    videoToPromptState.currentResult = result;

    const loadingState = document.getElementById('videoToPromptLoadingState');
    if (loadingState) loadingState.classList.add('hidden');

    const resContainer = document.getElementById('videoToPromptResultContainer');
    if (resContainer) resContainer.classList.remove('hidden');

    // Header info
    const titleEl = document.getElementById('videoToPromptResultTitle');
    if (titleEl) titleEl.textContent = result.title || 'Hasil Bedah Video AI';

    const metaEl = document.getElementById('videoToPromptResultMeta');
    if (metaEl) {
        metaEl.textContent = `Aspect Ratio: ${result.aspectRatio || videoToPromptState.aspectRatio} • ${result.genre || 'Cinematic'}`;
    }

    // Director Summary
    const summaryEl = document.getElementById('videoToPromptDirectorSummary');
    if (summaryEl) summaryEl.textContent = `"${result.directorSummary || 'Tidak ada ringkasan.'}"`;

    // Midjourney
    const mjEl = document.getElementById('videoToPromptMjText');
    if (mjEl) mjEl.textContent = result.imagePromptMidjourney || '';

    // Flux
    const fluxEl = document.getElementById('videoToPromptFluxText');
    if (fluxEl) fluxEl.textContent = result.imagePromptFlux || '';

    // Motion Prompt
    const motionEl = document.getElementById('videoToPromptMotionText');
    if (motionEl) motionEl.textContent = result.videoMotionPrompt || '';

    // Cinematography
    const c = result.cinematography || {};
    const shotEl = document.getElementById('cinemaShotType');
    if (shotEl) shotEl.textContent = c.shotType || 'Cinematic Medium Shot';

    const lightEl = document.getElementById('cinemaLighting');
    if (lightEl) lightEl.textContent = c.lighting || 'Natural Ambient Light';

    const camEl = document.getElementById('cinemaCamera');
    if (camEl) camEl.textContent = c.cameraLens || '35mm Anamorphic, Shallow DOF';

    const colEl = document.getElementById('cinemaColor');
    if (colEl) colEl.textContent = c.colorGrading || 'Rich Dynamic Grading';

    const audEl = document.getElementById('cinemaAudio');
    if (audEl) audEl.textContent = c.soundDesign || 'Atmospheric cinematic audio';

    // Negative prompt
    const negEl = document.getElementById('videoToPromptNegText');
    if (negEl) negEl.textContent = result.negativePrompt || 'blurry, low quality, distorted, extra limbs, cartoonish';

    // Scene Breakdown (if multiple scenes present)
    const scenesWrap = document.getElementById('videoToPromptScenesWrap');
    const scenesList = document.getElementById('videoToPromptScenesList');
    const scenesCount = document.getElementById('videoToPromptScenesCount');

    if (Array.isArray(result.scenes) && result.scenes.length > 1) {
        if (scenesWrap) scenesWrap.classList.remove('hidden');
        if (scenesCount) scenesCount.textContent = `${result.scenes.length} Adegan`;
        if (scenesList) {
            scenesList.innerHTML = '';
            result.scenes.forEach(sc => {
                const scCard = document.createElement('div');
                scCard.className = 'rounded-xl p-3.5 bg-black/40 border border-white/10 space-y-2';
                scCard.innerHTML = `
                    <div class="flex items-center justify-between text-xs font-bold text-purple-300">
                        <span><i class="fa-solid fa-clapperboard mr-1"></i>Adegan ${sc.sceneNum || 1}: ${sc.visual || ''}</span>
                    </div>
                    <div class="space-y-1">
                        <div class="text-[10px] text-gray-400 font-mono">Image Prompt:</div>
                        <div class="text-[11px] text-gray-200 font-mono bg-black/60 p-2.5 rounded-lg border border-white/5 select-all leading-relaxed">${sc.imagePrompt || ''}</div>
                    </div>
                    ${sc.motionPrompt ? `
                    <div class="space-y-1">
                        <div class="text-[10px] text-cyan-400 font-mono">Motion Prompt:</div>
                        <div class="text-[11px] text-cyan-200 font-mono bg-black/60 p-2.5 rounded-lg border border-white/5 select-all leading-relaxed">${sc.motionPrompt}</div>
                    </div>` : ''}
                `;
                scenesList.appendChild(scCard);
            });
        }
    } else {
        if (scenesWrap) scenesWrap.classList.add('hidden');
    }

    // Save record to IndexedDB History
    try {
        const thumb = (videoToPromptState.frames[0] && videoToPromptState.frames[0].dataUrl) || '';
        const historyRecord = {
            id: 'v2p_' + Date.now(),
            tool: 'video-prompt',
            type: 'video-prompt',
            dataUrl: thumb,
            ts: new Date().toISOString(),
            configSnapshot: {
                title: result.title,
                genre: result.genre,
                aspectRatio: result.aspectRatio,
                directorSummary: result.directorSummary,
                imagePromptMidjourney: result.imagePromptMidjourney,
                imagePromptFlux: result.imagePromptFlux,
                videoMotionPrompt: result.videoMotionPrompt,
                cinematography: result.cinematography,
                scenes: result.scenes,
                negativePrompt: result.negativePrompt,
                frameCount: videoToPromptState.frames.length
            }
        };

        if (typeof saveImageGenHistory === 'function') {
            await saveImageGenHistory(historyRecord);
        }
    } catch (saveErr) {
        console.warn('[VideoToPrompt] Failed to save history:', saveErr);
    }

    showVideoToPromptNotice('✨ Prompt sinematik berhasil diekstrak! Anda bisa langsung menyalin atau mengirimkannya ke Storyboard.', 'success');
}

function loadVideoToPromptResultFromHistory(record) {
    if (!record || !record.configSnapshot) return;
    const cfg = record.configSnapshot;
    const resultObj = {
        title: cfg.title || 'Bedah Video (History)',
        genre: cfg.genre || 'Cinematic',
        aspectRatio: cfg.aspectRatio || '16:9',
        directorSummary: cfg.directorSummary || '',
        imagePromptMidjourney: cfg.imagePromptMidjourney || '',
        imagePromptFlux: cfg.imagePromptFlux || '',
        videoMotionPrompt: cfg.videoMotionPrompt || '',
        cinematography: cfg.cinematography || {},
        scenes: cfg.scenes || [],
        negativePrompt: cfg.negativePrompt || ''
    };

    videoToPromptState.aspectRatio = cfg.aspectRatio || '16:9';
    renderVideoToPromptResult(resultObj);
}

/* ----------------------------------------------------------------- */
/* 6. INTERACTIVE ACTIONS (COPY & FORWARD TO GENERATOR)             */
/* ----------------------------------------------------------------- */
function copyPromptBlock(elementId, btn) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.innerText || el.textContent || '';
    if (!text.trim()) return;

    try {
        navigator.clipboard.writeText(text.trim());
    } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = text.trim();
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    }

    if (btn) {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check text-emerald-400 mr-1"></i>Tersalin!';
        btn.classList.add('border-emerald-400', 'text-emerald-300');
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.classList.remove('border-emerald-400', 'text-emerald-300');
        }, 1800);
    }
}

function copyAllVideoToPromptResults() {
    const res = videoToPromptState.currentResult;
    if (!res) return;

    const fullReport = `🎬 **${res.title || 'TRENDORA AI — VIDEO TO PROMPT'}**
Aesthetic: ${res.genre || 'Cinematic'} | Aspect Ratio: ${res.aspectRatio || '16:9'}

💡 **DIRECTOR'S ESSENCE:**
${res.directorSummary || ''}

🎨 **AI IMAGE PROMPT (Midjourney v6.1):**
${res.imagePromptMidjourney || ''}

✨ **AI IMAGE PROMPT (Flux.1):**
${res.imagePromptFlux || ''}

🎥 **AI VIDEO MOTION PROMPT (Kling / Runway / Luma):**
${res.videoMotionPrompt || ''}

📐 **CINEMATOGRAPHY BREAKDOWN:**
- Shot Type: ${res.cinematography?.shotType || '-'}
- Lighting: ${res.cinematography?.lighting || '-'}
- Camera & Lens: ${res.cinematography?.cameraLens || '-'}
- Color Palette: ${res.cinematography?.colorGrading || '-'}
- Sound / SFX: ${res.cinematography?.soundDesign || '-'}

🚫 **NEGATIVE PROMPT:**
${res.negativePrompt || '-'}

Generated automatically with TRENDORA AI Vision Engine`;

    try {
        navigator.clipboard.writeText(fullReport);
    } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = fullReport;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    }

    showVideoToPromptNotice('📋 Semua paket prompt & analisis sinematografi berhasil disalin ke clipboard!', 'success');
}

function sendVideoPromptToStoryboard() {
    const res = videoToPromptState.currentResult;
    if (!res) {
        showVideoToPromptNotice('Belum ada hasil bedah video untuk dikirim.', 'error');
        return;
    }

    const storyInputText = `${res.title || 'Video Storyboard'}: ${res.directorSummary || ''}\n\nGaya Visual: ${res.genre || 'Cinematic'}. ${res.imagePromptMidjourney || ''}`;

    // Switch to storyboard
    if (typeof selectStoryboardMode === 'function') {
        selectStoryboardMode('custom');
    }
    if (typeof expandNavGroup === 'function') {
        expandNavGroup('storyboard');
    }
    if (typeof showAppView === 'function') {
        showAppView();
    }

    // Set topic / story in storyboard input
    setTimeout(() => {
        const input = document.getElementById('promptInput');
        if (input) {
            input.value = storyInputText;
            input.focus();
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Set matching aspect ratio in storyboard if select exists
        const arSelect = document.getElementById('aspectRatioSelect');
        if (arSelect && res.aspectRatio) {
            arSelect.value = res.aspectRatio;
            arSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 200);
}

function sendVideoPromptToFotoGenerate() {
    const res = videoToPromptState.currentResult;
    if (!res) {
        showVideoToPromptNotice('Belum ada hasil bedah video untuk dikirim.', 'error');
        return;
    }

    const promptText = res.imagePromptMidjourney || res.imagePromptFlux || '';

    // Switch to FotoGenerate
    if (typeof navGoFotoGenerate === 'function') {
        navGoFotoGenerate();
    }

    setTimeout(() => {
        const subjectInput = document.getElementById('fotoSubject');
        if (subjectInput) {
            subjectInput.value = promptText;
            subjectInput.focus();
            subjectInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        const arSelect = document.getElementById('fotoAspectRatio');
        if (arSelect && res.aspectRatio) {
            arSelect.value = res.aspectRatio;
            arSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 200);
}

