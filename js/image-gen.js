/* ----------------------------------------------------------------- */
/* PHASE 6A.1: GENERATE IMAGE — SUB-TOOL SELECTOR & FORM DISPATCHER   */
/* ----------------------------------------------------------------- */

const IMAGE_GEN_TOOLS = [
    { slug: 'foto', name: 'FotoGenerate', desc: 'Foto profesional dari subjek + style terstruktur.', icon: 'fa-camera-retro', active: true },
    { slug: 'thumbnail', name: 'Thumbnail', desc: 'Thumbnail YouTube/TikTok/Reels dengan komposisi click-through.', icon: 'fa-image', active: true },
    { slug: 'infographic', name: 'Infographic', desc: 'Infografis edukatif dengan hierarchy data yang jelas.', icon: 'fa-chart-pie', active: true },
    { slug: 'ugc', name: 'UGC / Product Ads', desc: 'Mockup produk, UGC content, marketplace composition.', icon: 'fa-bag-shopping', active: true },
    { slug: 'character', name: 'Character Sheet', desc: 'Character reference konsisten untuk project.', icon: 'fa-user-astronaut', active: true },
    { slug: 'poster', name: 'Poster & Social Media', desc: 'Poster event, banner, feed Instagram, dll.', icon: 'fa-palette', active: true }
];

function renderImageGenToolSelector() {
    const container = document.getElementById('imageGenToolSelector');
    if (!container) return;

    container.innerHTML = IMAGE_GEN_TOOLS.map(tool => {
        const isActive = state.imageGen.activeTool === tool.slug;
        const activeRing = isActive ? 'border-pink-500 ring-2 ring-pink-500/40 shadow-[0_0_30px_-10px_rgba(236,72,153,0.5)]' : 'border-white/10';
        const comingSoonOverlay = tool.active ? '' : `
            <div class="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center pointer-events-none">
                <span class="text-[10px] font-extrabold uppercase tracking-widest text-pink-200 bg-pink-500/20 border border-pink-500/40 px-2.5 py-1 rounded-full">Coming Soon</span>
            </div>`;
        const clickHandler = tool.active ? `selectImageGenTool('${tool.slug}')` : `notifyComingSoon('${tool.name}')`;
        return `
            <div onclick="${clickHandler}" class="relative glass-card glass-card-hover rounded-2xl p-6 border ${activeRing} cursor-pointer transition transform hover:-translate-y-0.5">
                <div class="flex flex-col items-center text-center space-y-3">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center">
                        <i class="fa-solid ${tool.icon} text-2xl text-pink-300"></i>
                    </div>
                    <h4 class="font-bold text-white text-sm tracking-wide">${tool.name}</h4>
                    <p class="text-[11px] text-gray-400 leading-snug">${tool.desc}</p>
                </div>
                ${comingSoonOverlay}
            </div>`;
    }).join('');
}

function selectImageGenTool(slug) {
    const tool = IMAGE_GEN_TOOLS.find(t => t.slug === slug);
    if (!tool || !tool.active) {
        notifyComingSoon(tool ? tool.name : slug);
        return;
    }

    state.imageGen.activeTool = slug;
    showImageGenNotice('','info');
    renderImageGenToolSelector();

    // Show the matching form, hide the others.
    const formIds = {
        foto: 'fotoGenForm',
        thumbnail: 'thumbnailGenForm',
        infographic: 'infographicGenForm',
        ugc: 'productAdsGenForm',
        character: 'characterGenForm',
        poster: 'posterGenForm'
    };
    Object.values(formIds).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === formIds[slug]) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    });
    if (slug === 'character' && typeof renderCharSlots === 'function') renderCharSlots();
}

function notifyComingSoon(name) {
    showImageGenNotice(`${name} — Coming Soon. Stay tuned untuk update berikutnya.`, 'info');
}

function renderImageGenToolForm() {
    const forms = {
        foto: 'fotoGenForm',
        thumbnail: 'thumbnailGenForm',
        infographic: 'infographicGenForm',
        ugc: 'productAdsGenForm',
        character: 'characterGenForm',
        poster: 'posterGenForm'
    };
    Object.values(forms).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const activeId = forms[state.imageGen.activeTool];
    if (activeId) {
        const el = document.getElementById(activeId);
        if (el) el.classList.remove('hidden');
    }
}

function showImageGenNotice(msg, type) {
    const noticeEl = document.getElementById('imageGenNotice');
    if (!noticeEl) return;
    if (!msg) {
        noticeEl.className = 'hidden text-[11px] p-3 rounded-xl border font-medium';
        noticeEl.textContent = '';
        return;
    }
    if (type === 'error') {
        noticeEl.className = 'text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-medium block';
    } else if (type === 'success') {
        noticeEl.className = 'text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-medium block';
    } else {
        noticeEl.className = 'text-[11px] text-pink-300 bg-pink-500/10 border border-pink-500/20 p-3 rounded-xl font-medium block';
    }
    noticeEl.textContent = msg;
}

function buildFotoPrompt(foto) {
    const parts = [];
    const subject = (foto.subject || '').trim();
    if (subject) {
        parts.push(`Professional photograph of ${subject}.`);
    } else {
        parts.push('Professional photograph.');
    }
    parts.push(`Style: ${foto.style}.`);
    parts.push(`Lighting: ${foto.lighting}.`);
    parts.push(`Mood: ${foto.mood}.`);
    parts.push('Sharp focus, high-end camera, high resolution, clean composition, professional photography.');
    const neg = (foto.negativePrompt || '').trim();
    if (neg) {
        parts.push(`Avoid: ${neg}.`);
    }
    return parts.join(' ');
}

async function generateFotoImage({ promptText, aspectRatio, references, negativePrompt }) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent';

    const contents = [{ role: "user", parts: [{ text: promptText }] }];
    (references || []).forEach(ref => {
        const m = (ref.dataUrl || '').match(/^data:(.+);base64,(.+)$/);
        if (m) contents[0].parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
    });
    if (negativePrompt && negativePrompt.trim()) {
        contents[0].parts.push({ text: `Avoid: ${negativePrompt.trim()}` });
    }

    const response = await fetchWithExponentialBackoff(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: contents,
            generationConfig: {
                responseModalities: ["IMAGE"],
                imageConfig: { aspectRatio: aspectRatio || "1:1" }
            }
        })
    });

    if (!response.ok) throw new Error("Gemini Image API HTTP " + response.status);

    const data = await response.json();
    const part = data.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
        return "data:" + part.inlineData.mimeType + ";base64," + part.inlineData.data;
    }
    throw new Error("No image data returned.");
}

function renderFotoResultCard(idx) {
    return `
        <div data-img-card class="glass-card rounded-2xl p-5 border border-white/10 shadow-xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-indigo-500"></div>
            <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] font-extrabold text-white uppercase tracking-widest">Variasi ${idx + 1}</span>
                <span id="fotoResultStatus_${idx}" class="text-[10px] text-gray-500 font-mono">queued</span>
            </div>
            <div id="fotoImgContainer_${idx}" class="relative bg-black/80 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center min-h-[260px] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.8)]">
                <div id="fotoImgLoading_${idx}" class="cinematic-progress-bar my-6">
                    <div class="cinematic-progress-fill"></div>
                    <p class="text-center text-[11px] text-gray-400 mt-3 font-semibold">Menghasilkan gambar...</p>
                </div>
                <img id="fotoImg_${idx}" class="hidden w-full h-auto object-contain rounded-2xl transition-opacity duration-500 opacity-0" />
            </div>
            <div id="fotoResultActions_${idx}" class="mt-3 flex flex-wrap justify-end gap-2 hidden">
                <button onclick="retryFotoImage(${idx})" class="text-[10px] bg-white/5 hover:bg-pink-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-pink-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                </button>
            </div>
        </div>`;
}

async function startFotoGeneration() {
    if (!currentUser.loggedIn) {
        showAuthView();
        return;
    }
    if (state.imageGen.isGenerating) return;

    const foto = state.imageGen.foto;
    if (!foto.subject || !foto.subject.trim()) {
        showImageGenNotice('Subjek Utama wajib diisi.', 'error');
        document.getElementById('fotoSubject').focus();
        return;
    }

    const variations = Math.max(1, Math.min(4, parseInt(foto.variations) || 1));
    foto.variations = variations;

    const labelEl = document.getElementById('fotoVariationsLabel');
    if (labelEl) labelEl.textContent = String(variations);

    const submitBtn = document.getElementById('btnGenerateFoto');
    const resultsContainer = document.getElementById('fotoGenResults');
    resultsContainer.innerHTML = `<div class="image-gen-grid" data-count="${variations}"></div>`;
    const grid = resultsContainer.firstElementChild;

    for (let i = 0; i < variations; i++) {
        grid.insertAdjacentHTML('beforeend', renderFotoResultCard(i));
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>Generating...</span>`;
    state.imageGen.isGenerating = true;
    showImageGenNotice(`Memproses ${variations} variasi gambar...`, 'info');

    const promptText = buildFotoPrompt(foto);
    const configSnapshot = {
        subject: foto.subject,
        style: foto.style,
        lighting: foto.lighting,
        mood: foto.mood,
        aspectRatio: foto.aspectRatio,
        negativePrompt: foto.negativePrompt,
        refs: state.fotoReference
    };
    const results = [];

    for (let i = 0; i < variations; i++) {
        const statusEl = document.getElementById(`fotoResultStatus_${i}`);
        const imgEl = document.getElementById(`fotoImg_${i}`);
        const loadingEl = document.getElementById(`fotoImgLoading_${i}`);
        const actionsEl = document.getElementById(`fotoResultActions_${i}`);

        if (statusEl) statusEl.innerHTML = '<span class="text-pink-300">generating...</span>';

        try {
            const imgDataUrl = await generateFotoImage({
                promptText,
                aspectRatio: foto.aspectRatio,
                references: state.fotoReference,
                negativePrompt: foto.negativePrompt
            });

            if (imgEl) {
                imgEl.src = imgDataUrl;
                imgEl.onload = () => imgEl.classList.remove('opacity-0');
                imgEl.classList.remove('hidden');
                imgEl.onclick = () => openImageLightbox(imgDataUrl);
            }
            if (loadingEl) loadingEl.classList.add('hidden');
            if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">done</span>';
            if (actionsEl) {
                const filename = buildDownloadFilename('foto');
                actionsEl.innerHTML = `
                    <button onclick="openEditImageModal('foto', ${i})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-pen mr-1"></i>Edit
                    </button>
                    <button onclick="downloadImage('${imgDataUrl}', '${filename}')" class="text-[10px] bg-white/5 hover:bg-pink-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-pink-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-download mr-1"></i>Download
                    </button>
                    <button onclick="retryFotoImage(${i})" class="text-[10px] bg-white/5 hover:bg-pink-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-pink-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                    </button>`;
                actionsEl.classList.remove('hidden');
            }

            const rec = saveOriginalToHistory('foto', imgDataUrl, promptText, configSnapshot);
            results.push({ dataUrl: imgDataUrl, promptUsed: promptText, historyId: rec ? rec.id : null });
        } catch (err) {
            console.error(`[FotoGenerate] Variation ${i + 1} failed:`, err);
            if (statusEl) statusEl.innerHTML = '<span class="text-red-400">failed</span>';
            if (loadingEl) {
                loadingEl.innerHTML = `
                    <div class="text-center p-6 space-y-2">
                        <i class="fa-solid fa-triangle-exclamation text-amber-400 text-2xl"></i>
                        <p class="text-[11px] text-red-300 font-bold uppercase tracking-widest">Generation failed</p>
                        <p class="text-[10px] text-gray-400">${(err?.message || 'Unknown error').replace(/[<>]/g,'')}</p>
                    </div>`;
            }
            if (actionsEl) actionsEl.classList.remove('hidden');
            results.push({ error: err?.message || 'Unknown error' });
        }
    }

    state.imageGen.lastResult = results;

    const failed = results.filter(r => r.error).length;
    if (failed === 0) {
        showImageGenNotice(`${variations} gambar berhasil di-generate.`, 'success');
    } else if (failed === variations) {
        showImageGenNotice(`Gagal generate semua variasi. Periksa API key atau koneksi Anda.`, 'error');
    } else {
        showImageGenNotice(`${variations - failed} dari ${variations} gambar berhasil.`, 'info');
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate Foto</span>`;
    state.imageGen.isGenerating = false;
}

async function retryFotoImage(idx) {
    if (state.imageGen.isGenerating) return;
    const foto = state.imageGen.foto;

    const statusEl = document.getElementById(`fotoResultStatus_${idx}`);
    const imgEl = document.getElementById(`fotoImg_${idx}`);
    const loadingEl = document.getElementById(`fotoImgLoading_${idx}`);
    const actionsEl = document.getElementById(`fotoResultActions_${idx}`);

    if (statusEl) statusEl.innerHTML = '<span class="text-pink-300">retrying...</span>';
    if (imgEl) imgEl.classList.add('hidden');
    if (loadingEl) {
        loadingEl.className = 'cinematic-progress-bar my-6';
        loadingEl.innerHTML = '<div class="cinematic-progress-fill"></div><p class="text-center text-[11px] text-gray-400 mt-3 font-semibold">Menghasilkan gambar...</p>';
        loadingEl.classList.remove('hidden');
    }

    try {
        const promptText = buildFotoPrompt(foto);
        const imgDataUrl = await generateFotoImage({
            promptText,
            aspectRatio: foto.aspectRatio,
            references: state.fotoReference,
            negativePrompt: foto.negativePrompt
        });
        if (imgEl) {
            imgEl.src = imgDataUrl;
            imgEl.onload = () => imgEl.classList.remove('opacity-0');
            imgEl.classList.remove('hidden');
            imgEl.onclick = () => openImageLightbox(imgDataUrl);
        }
        if (loadingEl) loadingEl.classList.add('hidden');
        if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">done</span>';
        if (actionsEl) {
            const filename = buildDownloadFilename('foto');
            actionsEl.innerHTML = `
                <button onclick="openEditImageModal('foto', ${idx})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-pen mr-1"></i>Edit
                </button>
                <button onclick="downloadImage('${imgDataUrl}', '${filename}')" class="text-[10px] bg-white/5 hover:bg-pink-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-pink-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-download mr-1"></i>Download
                </button>
                <button onclick="retryFotoImage(${idx})" class="text-[10px] bg-white/5 hover:bg-pink-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-pink-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                </button>`;
        }
        const configSnapshot = {
            subject: foto.subject,
            style: foto.style,
            lighting: foto.lighting,
            mood: foto.mood,
            aspectRatio: foto.aspectRatio,
            negativePrompt: foto.negativePrompt,
            refs: state.fotoReference
        };
        await persistImageGenLatest('foto', imgDataUrl, promptText, configSnapshot, idx);
    } catch (err) {
        console.error(`[FotoGenerate] Retry ${idx + 1} failed:`, err);
        if (statusEl) statusEl.innerHTML = '<span class="text-red-400">failed</span>';
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div class="text-center p-6 space-y-2">
                    <i class="fa-solid fa-triangle-exclamation text-amber-400 text-2xl"></i>
                    <p class="text-[11px] text-red-300 font-bold uppercase tracking-widest">Retry failed</p>
                    <p class="text-[10px] text-gray-400">${(err?.message || 'Unknown error').replace(/[<>]/g,'')}</p>
                </div>`;
        }
    }
}

function resetFotoForm() {
    if (state.imageGen.isGenerating) return;
    state.imageGen.foto.subject = '';
    state.imageGen.foto.negativePrompt = '';
    const subjectEl = document.getElementById('fotoSubject');
    const negativeEl = document.getElementById('fotoNegative');
    if (subjectEl) subjectEl.value = '';
    if (negativeEl) negativeEl.value = '';
    state.fotoReference = [];
    updateRefCardUI('fotoReference');
    document.getElementById('fotoGenResults').innerHTML = '';
    showImageGenNotice('Form direset.', 'info');
}

/* ========================================== */
/* PHASE 6A.3: THUMBNAIL GENERATOR             */
/* ========================================== */

function buildThumbnailPrompt(thumb) {
    const platform = thumb.platform || 'YouTube';
    const style = thumb.style || 'Viral';
    const mood = thumb.mood || 'Excited';
    const aspect = thumb.aspectRatio || '16:9';
    const title = (thumb.title || '').trim();
    const headline = (thumb.headline || '').trim();

    const platformGuidelines = {
        YouTube: 'YouTube 16:9 thumbnail. Compose for click-through rate: bold focal subject, expressive face or object, strong contrast, readable at small size.',
        TikTok: 'Vertical 9:16 TikTok thumbnail. Compose for feed scroll: bold focal subject, high contrast, expressive face, hook within the first second.',
        Reels: 'Vertical 9:16 Instagram Reels thumbnail. Compose for Reels grid: bold subject, expressive moment, clean safe margins for overlay UI.',
        Marketplace: 'E-commerce marketplace thumbnail. Compose for product listing: clean composition, product clearly visible, minimal distracting background, high clarity.'
    };

    const styleGuide = {
        Viral: 'Viral style: exaggerated expression, big emotions, saturated colors, dynamic element, sense of urgency or curiosity.',
        Clean: 'Clean style: minimal layout, soft contrast, neutral background, premium whitespace, single dominant subject.',
        Cinematic: 'Cinematic style: film-grade lighting, shallow depth of field, color graded, dramatic shadows, anamorphic feel.',
        Bold: 'Bold style: high contrast, oversized type, aggressive colors, strong direction, attention-grabbing shapes.',
        Professional: 'Professional style: trustworthy composition, balanced hierarchy, refined palette, polished and credible.'
    };

    const moodGuide = {
        Excited: 'Mood: excited, energetic, vibrant, sense of anticipation.',
        Dramatic: 'Mood: dramatic, intense, high contrast, emotional tension.',
        Premium: 'Mood: premium, refined, luxurious, understated elegance.',
        Fun: 'Mood: fun, playful, lighthearted, friendly.',
        Serious: 'Mood: serious, authoritative, weighty, credible.'
    };

    const parts = [];
    parts.push(platformGuidelines[platform] || platformGuidelines.YouTube);
    parts.push(styleGuide[style] || styleGuide.Viral);
    parts.push(moodGuide[mood] || moodGuide.Excited);
    if (title) parts.push('Content subject: ' + title + '.');
    if (headline) {
        parts.push('Display the headline text exactly as: "' + headline + '". Place it prominently with readable typography, high contrast against the background, and safe margins away from the edges.');
    } else {
        parts.push('No headline text on the thumbnail.');
    }
    parts.push('Strong visual hierarchy: one clear focal subject. Strong foreground/background separation. Professional lighting. Composition appropriate for ' + platform + ' at ' + aspect + ' aspect ratio. Avoid clutter, watermarks, blurry text.');
    return parts.join(' ');
}

async function generateThumbnailImage({ promptText, aspectRatio, references }) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent';

    const contents = [{ role: "user", parts: [{ text: promptText }] }];
    (references || []).forEach(ref => {
        const m = (ref.dataUrl || '').match(/^data:(.+);base64,(.+)$/);
        if (m) contents[0].parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
    });

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: contents,
            generationConfig: {
                responseModalities: ["IMAGE"],
                imageConfig: { aspectRatio: aspectRatio || "16:9" }
            }
        })
    });

    if (!response.ok) throw new Error("Gemini Image API HTTP " + response.status);
    const data = await response.json();
    const part = data.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
        return "data:" + part.inlineData.mimeType + ";base64," + part.inlineData.data;
    }
    throw new Error("No image data returned.");
}

function renderThumbnailResultCard(idx) {
    return `
        <div data-img-card class="glass-card rounded-2xl p-5 border border-white/10 shadow-xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-pink-500"></div>
            <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] font-extrabold text-white uppercase tracking-widest">Variasi ${idx + 1}</span>
                <span id="thumbResultStatus_${idx}" class="text-[10px] text-gray-500 font-mono">queued</span>
            </div>
            <div id="thumbImgContainer_${idx}" class="relative bg-black/80 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center min-h-[260px] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.8)]">
                <div id="thumbImgLoading_${idx}" class="cinematic-progress-bar my-6">
                    <div class="cinematic-progress-fill"></div>
                    <p class="text-center text-[11px] text-gray-400 mt-3 font-semibold">Menghasilkan thumbnail...</p>
                </div>
                <img id="thumbImg_${idx}" class="hidden w-full h-auto object-contain rounded-2xl transition-opacity duration-500 opacity-0" />
            </div>
            <div id="thumbResultActions_${idx}" class="mt-3 flex flex-wrap justify-end gap-2 hidden">
                <button onclick="retryThumbnailImage(${idx})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                </button>
            </div>
        </div>`;
}

async function startThumbnailGeneration() {
    if (!currentUser.loggedIn) {
        showAuthView();
        return;
    }
    if (state.imageGen.isGenerating) return;

    const thumb = state.imageGen.thumbnail;
    if (!thumb.title || !thumb.title.trim()) {
        showImageGenNotice('Judul / Topik wajib diisi.', 'error');
        const el = document.getElementById('thumbTitle');
        if (el) el.focus();
        return;
    }

    const variations = Math.max(1, Math.min(4, parseInt(thumb.variations) || 1));
    thumb.variations = variations;

    const submitBtn = document.getElementById('btnGenerateThumbnail');
    const resultsContainer = document.getElementById('thumbnailGenResults');
    resultsContainer.innerHTML = `<div class="image-gen-grid" data-count="${variations}"></div>`;
    const grid = resultsContainer.firstElementChild;

    for (let i = 0; i < variations; i++) {
        grid.insertAdjacentHTML('beforeend', renderThumbnailResultCard(i));
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>Generating...</span>`;
    state.imageGen.isGenerating = true;
    showImageGenNotice('Memproses ' + variations + ' thumbnail...', 'info');

    const promptText = buildThumbnailPrompt(thumb);
    const allRefs = [].concat(
        state.thumbnailSubjectReference || [],
        state.thumbnailProductReference || [],
        state.thumbnailStyleReference || []
    );
    const configSnapshot = {
        title: thumb.title,
        headline: thumb.headline,
        platform: thumb.platform,
        style: thumb.style,
        mood: thumb.mood,
        aspectRatio: thumb.aspectRatio,
        refs: {
            subject: state.thumbnailSubjectReference,
            product: state.thumbnailProductReference,
            style: state.thumbnailStyleReference
        }
    };
    const results = [];

    for (let i = 0; i < variations; i++) {
        const statusEl = document.getElementById('thumbResultStatus_' + i);
        const imgEl = document.getElementById('thumbImg_' + i);
        const loadingEl = document.getElementById('thumbImgLoading_' + i);
        const actionsEl = document.getElementById('thumbResultActions_' + i);

        if (statusEl) statusEl.innerHTML = '<span class="text-violet-300">generating...</span>';

        try {
            const imgDataUrl = await generateThumbnailImage({
                promptText,
                aspectRatio: thumb.aspectRatio,
                references: allRefs
            });

            if (imgEl) {
                imgEl.src = imgDataUrl;
                imgEl.onload = () => imgEl.classList.remove('opacity-0');
                imgEl.classList.remove('hidden');
                imgEl.onclick = () => openImageLightbox(imgDataUrl);
            }
            if (loadingEl) loadingEl.classList.add('hidden');
            if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">done</span>';
            if (actionsEl) {
                const filename = buildDownloadFilename('thumbnail');
                actionsEl.innerHTML = `
                    <button onclick="openEditImageModal('thumbnail', ${i})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-pen mr-1"></i>Edit
                    </button>
                    <button onclick="downloadImage('${imgDataUrl}', '${filename}')" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-download mr-1"></i>Download
                    </button>
                    <button onclick="retryThumbnailImage(${i})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                    </button>`;
                actionsEl.classList.remove('hidden');
            }
            const rec = saveOriginalToHistory('thumbnail', imgDataUrl, promptText, configSnapshot);
            results.push({ dataUrl: imgDataUrl, promptUsed: promptText, historyId: rec ? rec.id : null });
        } catch (err) {
            console.error('[Thumbnail] Variation ' + (i + 1) + ' failed:', err);
            if (statusEl) statusEl.innerHTML = '<span class="text-red-400">failed</span>';
            if (loadingEl) {
                loadingEl.innerHTML = `
                    <div class="text-center p-6 space-y-2">
                        <i class="fa-solid fa-triangle-exclamation text-amber-400 text-2xl"></i>
                        <p class="text-[11px] text-red-300 font-bold uppercase tracking-widest">Generation failed</p>
                        <p class="text-[10px] text-gray-400">${(err?.message || 'Unknown error').replace(/[<>]/g,'')}</p>
                    </div>`;
            }
            if (actionsEl) actionsEl.classList.remove('hidden');
            results.push({ error: err?.message || 'Unknown error' });
        }
    }

    state.imageGen.lastResult = results;

    const failed = results.filter(r => r.error).length;
    if (failed === 0) {
        showImageGenNotice(variations + ' thumbnail berhasil di-generate.', 'success');
    } else if (failed === variations) {
        showImageGenNotice('Gagal generate semua thumbnail. Periksa API key atau koneksi Anda.', 'error');
    } else {
        showImageGenNotice((variations - failed) + ' dari ' + variations + ' thumbnail berhasil.', 'info');
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate Thumbnail</span>`;
    state.imageGen.isGenerating = false;
}

async function retryThumbnailImage(idx) {
    if (state.imageGen.isGenerating) return;
    const thumb = state.imageGen.thumbnail;

    const statusEl = document.getElementById('thumbResultStatus_' + idx);
    const imgEl = document.getElementById('thumbImg_' + idx);
    const loadingEl = document.getElementById('thumbImgLoading_' + idx);
    const actionsEl = document.getElementById('thumbResultActions_' + idx);

    if (statusEl) statusEl.innerHTML = '<span class="text-violet-300">retrying...</span>';
    if (imgEl) imgEl.classList.add('hidden');
    if (loadingEl) {
        loadingEl.className = 'cinematic-progress-bar my-6';
        loadingEl.innerHTML = '<div class="cinematic-progress-fill"></div><p class="text-center text-[11px] text-gray-400 mt-3 font-semibold">Menghasilkan thumbnail...</p>';
        loadingEl.classList.remove('hidden');
    }

    const allRefs = [].concat(
        state.thumbnailSubjectReference || [],
        state.thumbnailProductReference || [],
        state.thumbnailStyleReference || []
    );

    try {
        const promptText = buildThumbnailPrompt(thumb);
        const imgDataUrl = await generateThumbnailImage({
            promptText,
            aspectRatio: thumb.aspectRatio,
            references: allRefs
        });
        if (imgEl) {
            imgEl.src = imgDataUrl;
            imgEl.onload = () => imgEl.classList.remove('opacity-0');
            imgEl.classList.remove('hidden');
            imgEl.onclick = () => openImageLightbox(imgDataUrl);
        }
        if (loadingEl) loadingEl.classList.add('hidden');
        if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">done</span>';
        if (actionsEl) {
            const filename = buildDownloadFilename('thumbnail');
            actionsEl.innerHTML = `
                <button onclick="openEditImageModal('thumbnail', ${idx})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-pen mr-1"></i>Edit
                </button>
                <button onclick="downloadImage('${imgDataUrl}', '${filename}')" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-download mr-1"></i>Download
                </button>
                <button onclick="retryThumbnailImage(${idx})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                </button>`;
        }
        const configSnapshot = {
            title: thumb.title,
            headline: thumb.headline,
            platform: thumb.platform,
            style: thumb.style,
            mood: thumb.mood,
            aspectRatio: thumb.aspectRatio,
            refs: {
                subject: state.thumbnailSubjectReference,
                product: state.thumbnailProductReference,
                style: state.thumbnailStyleReference
            }
        };
        await persistImageGenLatest('thumbnail', imgDataUrl, promptText, configSnapshot, idx);
    } catch (err) {
        console.error('[Thumbnail] Retry ' + (idx + 1) + ' failed:', err);
        if (statusEl) statusEl.innerHTML = '<span class="text-red-400">failed</span>';
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div class="text-center p-6 space-y-2">
                    <i class="fa-solid fa-triangle-exclamation text-amber-400 text-2xl"></i>
                    <p class="text-[11px] text-red-300 font-bold uppercase tracking-widest">Retry failed</p>
                    <p class="text-[10px] text-gray-400">${(err?.message || 'Unknown error').replace(/[<>]/g,'')}</p>
                </div>`;
        }
    }
}

function resetThumbnailForm() {
    if (state.imageGen.isGenerating) return;
    state.imageGen.thumbnail.title = '';
    state.imageGen.thumbnail.headline = '';
    const titleEl = document.getElementById('thumbTitle');
    const headlineEl = document.getElementById('thumbHeadline');
    if (titleEl) titleEl.value = '';
    if (headlineEl) headlineEl.value = '';
    state.thumbnailSubjectReference = [];
    state.thumbnailProductReference = [];
    state.thumbnailStyleReference = [];
    updateRefCardUI('thumbnailSubjectReference');
    updateRefCardUI('thumbnailProductReference');
    updateRefCardUI('thumbnailStyleReference');
    document.getElementById('thumbnailGenResults').innerHTML = '';
    showImageGenNotice('Form direset.', 'info');
}

/* ========================================== */
/* PHASE 6A.4: INFOGRAPHIC                    */
/* ========================================== */

function buildInfographicPrompt(info) {
    const type = info.type || 'Informational';
    const style = info.style || 'Modern';
    const colorTheme = info.colorTheme || 'Auto';
    const aspect = info.aspectRatio || '1:1';
    const title = (info.title || '').trim();
    const content = (info.content || '').trim();

    const typeGuide = {
        Informational: 'Single-subject informational infographic. Lead with a clear title, then a single dominant section that explains the topic with supporting icons and short labels.',
        Comparison: 'Comparison infographic. Two parallel columns or side-by-side blocks explicitly comparing two concepts, each with the same set of attributes. Use parallel layout, not narrative paragraphs.',
        Timeline: 'Timeline infographic. A left-to-right (or top-to-bottom) chronological axis with dated steps or milestones and a short caption per step.',
        Process: 'Process / steps infographic. A numbered sequence of steps (1, 2, 3, ...) connected by arrows or directional flow, each step with a short label and an icon.',
        List: 'List infographic. A vertical stack of items, each with a number or marker, an icon, and a short title plus one-line description.',
        Statistics: 'Statistics infographic. A few large numbers or percentages as the visual anchors, paired with short context labels and supporting icons or small charts.'
    };

    const styleGuide = {
        Modern: 'Modern editorial style: clean sans-serif typography, generous whitespace, flat icons, subtle grid, modern color palette.',
        Minimal: 'Minimal style: monochrome or two-tone, abundant whitespace, very thin dividers, restrained iconography, large headings.',
        Corporate: 'Corporate style: structured grid, navy/slate palette, professional icons, balanced hierarchy, formal feel.',
        Educational: 'Educational style: clear labelled sections, classroom-friendly icons, supporting subheads, friendly palette.',
        Creative: 'Creative style: bold typography, expressive illustrations, dynamic layout, playful color accents.'
    };

    const colorGuide = {
        Auto: 'Choose a color palette that complements the chosen style. Keep contrast high and accessibility in mind.',
        Vibrant: 'Vibrant palette: saturated primaries, energetic contrast, bold accents.',
        Pastel: 'Pastel palette: soft low-saturation tones, calm contrast, gentle accents.',
        Dark: 'Dark palette: deep background, bright accent colors, high contrast for light text.',
        Professional: 'Professional palette: navy / slate / muted teal, restrained accents, trust-inspiring contrast.'
    };

    const parts = [];
    parts.push('Create a single-frame infographic image, ' + aspect + ' aspect ratio.');
    parts.push(typeGuide[type] || typeGuide.Informational);
    parts.push(styleGuide[style] || styleGuide.Modern);
    parts.push(colorGuide[colorTheme] || colorGuide.Auto);
    parts.push('Clear visual hierarchy: one dominant title, then a small number of well-spaced sections. Professional spacing and consistent margins. Readable typography sized for the chosen aspect ratio.');
    if (title) parts.push('Display the INFOGRAPHIC TITLE exactly as: "' + title + '". Place it prominently at the top with strong hierarchy.');
    if (content) {
        parts.push('Use the following content data as the source of truth. Reproduce the data faithfully. Do not invent additional data points, do not omit items, do not paraphrase numbers.');
        parts.push('--- CONTENT START ---');
        parts.push(content);
        parts.push('--- CONTENT END ---');
    }
    parts.push('Use relevant visual icons or illustrations to support each section. Avoid decorative random text. Avoid making app UIs, social-media screenshots, or fake browser/device frames. Do not fabricate sources or attribution. Prioritize information readability above all.');
    return parts.join(' ');
}

async function generateInfographicImage({ promptText, aspectRatio, references }) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent';

    const contents = [{ role: 'user', parts: [{ text: promptText }] }];
    (references || []).forEach(ref => {
        const m = (ref.dataUrl || '').match(/^data:(.+);base64,(.+)$/);
        if (m) contents[0].parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: contents,
            generationConfig: {
                responseModalities: ['IMAGE'],
                imageConfig: { aspectRatio: aspectRatio || '1:1' }
            }
        })
    });
    if (!response.ok) throw new Error('Gemini Image API HTTP ' + response.status);
    const data = await response.json();
    const part = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0];
    if (part && part.inlineData) {
        return 'data:' + part.inlineData.mimeType + ';base64,' + part.inlineData.data;
    }
    throw new Error('No image data returned.');
}

function renderInfographicResultCard(idx) {
    return `
        <div data-img-card class="glass-card rounded-2xl p-5 border border-white/10 shadow-xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] font-extrabold text-white uppercase tracking-widest">Variasi ${idx + 1}</span>
                <span id="infoResultStatus_${idx}" class="text-[10px] text-gray-500 font-mono">queued</span>
            </div>
            <div id="infoImgContainer_${idx}" class="relative bg-black/80 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center min-h-[260px] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.8)]">
                <div id="infoImgLoading_${idx}" class="cinematic-progress-bar my-6">
                    <div class="cinematic-progress-fill"></div>
                    <p class="text-center text-[11px] text-gray-400 mt-3 font-semibold">Menghasilkan infographic...</p>
                </div>
                <img id="infoImg_${idx}" class="hidden w-full h-auto object-contain rounded-2xl transition-opacity duration-500 opacity-0" />
            </div>
            <div id="infoResultActions_${idx}" class="mt-3 flex flex-wrap justify-end gap-2 hidden">
                <button onclick="retryInfographicImage(${idx})" class="text-[10px] bg-white/5 hover:bg-blue-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-blue-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                </button>
            </div>
        </div>`;
}

async function startInfographicGeneration() {
    if (!currentUser.loggedIn) {
        showAuthView();
        return;
    }
    if (state.imageGen.isGenerating) return;

    const info = state.imageGen.infographic;
    if (!info.content || !info.content.trim()) {
        showImageGenNotice('Isi / Data wajib diisi.', 'error');
        const el = document.getElementById('infoContent');
        if (el) el.focus();
        return;
    }

    const variations = Math.max(1, Math.min(4, parseInt(info.variations) || 1));
    info.variations = variations;

    const submitBtn = document.getElementById('btnGenerateInfographic');
    const resultsContainer = document.getElementById('infographicGenResults');
    resultsContainer.innerHTML = `<div class="image-gen-grid" data-count="${variations}"></div>`;
    const grid = resultsContainer.firstElementChild;

    for (let i = 0; i < variations; i++) {
        grid.insertAdjacentHTML('beforeend', renderInfographicResultCard(i));
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>Generating...</span>`;
    state.imageGen.isGenerating = true;
    showImageGenNotice('Memproses ' + variations + ' infographic...', 'info');

    const promptText = buildInfographicPrompt(info);
    const configSnapshot = {
        title: info.title,
        content: info.content,
        type: info.type,
        style: info.style,
        colorTheme: info.colorTheme,
        aspectRatio: info.aspectRatio,
        refs: state.infoReference
    };
    const results = [];

    for (let i = 0; i < variations; i++) {
        const statusEl = document.getElementById('infoResultStatus_' + i);
        const imgEl = document.getElementById('infoImg_' + i);
        const loadingEl = document.getElementById('infoImgLoading_' + i);
        const actionsEl = document.getElementById('infoResultActions_' + i);

        if (statusEl) statusEl.innerHTML = '<span class="text-blue-300">generating...</span>';

        try {
            const imgDataUrl = await generateInfographicImage({
                promptText,
                aspectRatio: info.aspectRatio,
                references: state.infoReference
            });

            if (imgEl) {
                imgEl.src = imgDataUrl;
                imgEl.onload = () => imgEl.classList.remove('opacity-0');
                imgEl.classList.remove('hidden');
                imgEl.onclick = () => openImageLightbox(imgDataUrl);
            }
            if (loadingEl) loadingEl.classList.add('hidden');
            if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">done</span>';
            if (actionsEl) {
                const filename = buildDownloadFilename('infographic');
                actionsEl.innerHTML = `
                    <button onclick="openEditImageModal('infographic', ${i})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-pen mr-1"></i>Edit
                    </button>
                    <button onclick="downloadImage('${imgDataUrl}', '${filename}')" class="text-[10px] bg-white/5 hover:bg-blue-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-blue-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-download mr-1"></i>Download
                    </button>
                    <button onclick="retryInfographicImage(${i})" class="text-[10px] bg-white/5 hover:bg-blue-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-blue-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                    </button>`;
                actionsEl.classList.remove('hidden');
            }
            const rec = saveOriginalToHistory('infographic', imgDataUrl, promptText, configSnapshot);
            results.push({ dataUrl: imgDataUrl, promptUsed: promptText, historyId: rec ? rec.id : null });
        } catch (err) {
            console.error('[Infographic] Variation ' + (i + 1) + ' failed:', err);
            if (statusEl) statusEl.innerHTML = '<span class="text-red-400">failed</span>';
            if (loadingEl) {
                loadingEl.innerHTML = `
                    <div class="text-center p-6 space-y-2">
                        <i class="fa-solid fa-triangle-exclamation text-amber-400 text-2xl"></i>
                        <p class="text-[11px] text-red-300 font-bold uppercase tracking-widest">Generation failed</p>
                        <p class="text-[10px] text-gray-400">${(err?.message || 'Unknown error').replace(/[<>]/g,'')}</p>
                    </div>`;
            }
            if (actionsEl) actionsEl.classList.remove('hidden');
            results.push({ error: err?.message || 'Unknown error' });
        }
    }

    state.imageGen.lastResult = results;

    const failed = results.filter(r => r.error).length;
    if (failed === 0) {
        showImageGenNotice(variations + ' infographic berhasil di-generate.', 'success');
    } else if (failed === variations) {
        showImageGenNotice('Gagal generate semua infographic. Periksa API key atau koneksi Anda.', 'error');
    } else {
        showImageGenNotice((variations - failed) + ' dari ' + variations + ' infographic berhasil.', 'info');
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate Infographic</span>`;
    state.imageGen.isGenerating = false;
}

async function retryInfographicImage(idx) {
    if (state.imageGen.isGenerating) return;
    const info = state.imageGen.infographic;

    const statusEl = document.getElementById('infoResultStatus_' + idx);
    const imgEl = document.getElementById('infoImg_' + idx);
    const loadingEl = document.getElementById('infoImgLoading_' + idx);
    const actionsEl = document.getElementById('infoResultActions_' + idx);

    if (statusEl) statusEl.innerHTML = '<span class="text-blue-300">retrying...</span>';
    if (imgEl) imgEl.classList.add('hidden');
    if (loadingEl) {
        loadingEl.className = 'cinematic-progress-bar my-6';
        loadingEl.innerHTML = '<div class="cinematic-progress-fill"></div><p class="text-center text-[11px] text-gray-400 mt-3 font-semibold">Menghasilkan infographic...</p>';
        loadingEl.classList.remove('hidden');
    }

    try {
        const promptText = buildInfographicPrompt(info);
        const imgDataUrl = await generateInfographicImage({
            promptText,
            aspectRatio: info.aspectRatio,
            references: state.infoReference
        });
        if (imgEl) {
            imgEl.src = imgDataUrl;
            imgEl.onload = () => imgEl.classList.remove('opacity-0');
            imgEl.classList.remove('hidden');
            imgEl.onclick = () => openImageLightbox(imgDataUrl);
        }
        if (loadingEl) loadingEl.classList.add('hidden');
        if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">done</span>';
        if (actionsEl) {
            const filename = buildDownloadFilename('infographic');
            actionsEl.innerHTML = `
                <button onclick="openEditImageModal('infographic', ${idx})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-pen mr-1"></i>Edit
                </button>
                <button onclick="downloadImage('${imgDataUrl}', '${filename}')" class="text-[10px] bg-white/5 hover:bg-blue-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-blue-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-download mr-1"></i>Download
                </button>
                <button onclick="retryInfographicImage(${idx})" class="text-[10px] bg-white/5 hover:bg-blue-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-blue-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                </button>`;
        }
        const configSnapshot = {
            title: info.title,
            content: info.content,
            type: info.type,
            style: info.style,
            colorTheme: info.colorTheme,
            aspectRatio: info.aspectRatio,
            refs: state.infoReference
        };
        await persistImageGenLatest('infographic', imgDataUrl, promptText, configSnapshot, idx);
    } catch (err) {
        console.error('[Infographic] Retry ' + (idx + 1) + ' failed:', err);
        if (statusEl) statusEl.innerHTML = '<span class="text-red-400">failed</span>';
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div class="text-center p-6 space-y-2">
                    <i class="fa-solid fa-triangle-exclamation text-amber-400 text-2xl"></i>
                    <p class="text-[11px] text-red-300 font-bold uppercase tracking-widest">Retry failed</p>
                    <p class="text-[10px] text-gray-400">${(err?.message || 'Unknown error').replace(/[<>]/g,'')}</p>
                </div>`;
        }
    }
}

function resetInfographicForm() {
    if (state.imageGen.isGenerating) return;
    state.imageGen.infographic.title = '';
    state.imageGen.infographic.content = '';
    const titleEl = document.getElementById('infoTitle');
    const contentEl = document.getElementById('infoContent');
    if (titleEl) titleEl.value = '';
    if (contentEl) contentEl.value = '';
    state.infoReference = [];
    updateRefCardUI('infoReference');
    document.getElementById('infographicGenResults').innerHTML = '';
    showImageGenNotice('Form direset.', 'info');
}

/* ========================================== */
/* PHASE 6A.5: UGC / PRODUCT ADS             */
/* ========================================== */

function updateAdsModeSections() {
    const mode = state.imageGen.productAds.mode || 'Product Photo';
    const scene = document.getElementById('adsSectionScene');
    const ugc = document.getElementById('adsSectionUGC');
    const model = document.getElementById('adsSectionModel');
    const required = document.getElementById('adsProductRequired');
    if (scene) scene.classList.toggle('hidden', mode !== 'Product Photo');
    if (ugc) ugc.classList.toggle('hidden', mode !== 'UGC Visual');
    if (model) model.classList.toggle('hidden', mode !== 'Product + Model');
    if (required) required.classList.toggle('hidden', mode !== 'Product + Model');
}

function buildProductAdsPrompt(ads) {
    const mode = ads.mode || 'Product Photo';
    const style = ads.style || 'Professional';
    const mood = ads.mood || 'Confident';
    const aspect = ads.aspectRatio || '1:1';
    const productName = (ads.productName || '').trim();
    const productDesc = (ads.productDescription || '').trim();

    const styleGuide = {
        Professional: 'Professional advertising style: clean, polished, high-end commercial photography aesthetic, sharp focus, controlled lighting.',
        Casual: 'Casual authentic style: natural, relatable, lifestyle feeling, candid lighting, real-world texture.',
        Lifestyle: 'Lifestyle style: aspirational everyday context, warm natural lighting, environmental storytelling.',
        Luxury: 'Luxury style: premium materials, refined composition, deep contrast, elegant restraint.',
        Bold: 'Bold advertising style: striking contrast, high color energy, dynamic composition, attention-grabbing.'
    };

    const moodGuide = {
        Confident: 'Mood: confident, assured, decisive.',
        Casual: 'Mood: casual, relaxed, approachable.',
        Friendly: 'Mood: warm, friendly, inviting.',
        Premium: 'Mood: premium, refined, exclusive.',
        Energetic: 'Mood: energetic, dynamic, lively.'
    };

    const platformComposition = {
        '1:1': 'Format: square 1:1 — clean centered composition.',
        '4:5': 'Format: vertical 4:5 — Instagram-friendly portrait composition.',
        '9:16': 'Format: vertical 9:16 — TikTok/Reels-friendly vertical composition.',
        '16:9': 'Format: horizontal 16:9 — YouTube / marketplace banner composition.'
    };

    const parts = [];
    parts.push('Create a single-frame product advertising image, ' + aspect + ' aspect ratio.');
    parts.push(platformComposition[aspect] || platformComposition['1:1']);
    parts.push(styleGuide[style] || styleGuide.Professional);
    parts.push(moodGuide[mood] || moodGuide.Confident);

    if (mode === 'Product Photo') {
        const scene = ads.scene || 'Studio';
        const sceneGuide = {
            Studio: 'Studio scene: clean controlled studio lighting, seamless backdrop, product hero shot.',
            Lifestyle: 'Lifestyle scene: product placed in a real everyday environment that fits the target audience.',
            Minimal: 'Minimal scene: ultra-clean composition, generous whitespace, focus solely on the product.',
            Luxury: 'Luxury scene: rich materials, deep contrast, premium surfaces, elegant atmosphere.',
            Outdoor: 'Outdoor scene: natural daylight, environmental context, location-based feel.',
            Marketplace: 'Marketplace scene: clean white or neutral background, e-commerce product photography standard, well-lit, no distractions.'
        };
        parts.push(sceneGuide[scene] || sceneGuide.Studio);
        parts.push('Composition: product is the hero. Centered or rule-of-thirds. No human figure. No UI, no app screens, no social-media overlays.');
    } else if (mode === 'Product + Model') {
        parts.push('Composition: human model (gender ' + (ads.gender || 'unspecified') + ', age range ' + (ads.ageRange || 'unspecified') + ') is interacting with the product. Product is visible and identifiable in the frame.');
        if (ads.appearance) parts.push('Model appearance: ' + ads.appearance + '.');
        if (ads.pose) parts.push('Pose: ' + ads.pose + '.');
        if (ads.wardrobe) parts.push('Wardrobe: ' + ads.wardrobe + '.');
        if (ads.environment) parts.push('Environment: ' + ads.environment + '.');
        parts.push('Focus: model + product together. Neither overshadows the other. Product identity (shape, color, label, packaging) must remain clearly recognizable.');
        parts.push('No UI, no app screens, no social-media overlays.');
    } else if (mode === 'UGC Visual') {
        const ugcType = ads.ugcType || 'Creator Review';
        const ugcGuide = {
            'Creator Review': 'UGC creator review format: model holds product near face, expressive reaction, natural indoor lighting, smartphone-camera aesthetic.',
            'Product Holding': 'UGC product holding format: hand or hands holding product prominently, focused attention on product, soft natural lighting.',
            'Selfie Style': 'UGC selfie style: POV selfie with product visible in frame, expressive face, front-camera feel, natural lighting.',
            'Unboxing': 'UGC unboxing format: product partially out of packaging, hands interacting, fresh excitement, clean indoor setting.',
            'Product Demonstration': 'UGC product demonstration: model actively using or showing product features, mid-action pose, natural ambient lighting.',
            'Lifestyle UGC': 'UGC lifestyle format: model in casual real-world setting, product naturally integrated into the moment, warm natural light.'
        };
        parts.push(ugcGuide[ugcType] || ugcGuide['Creator Review']);
        parts.push('Style: authentic social-media creator feel, smartphone-camera look, natural skin tones, candid energy.');
        if (ads.environment) parts.push('Setting: ' + ads.environment + '.');
        parts.push('No UI, no social-media overlays, no app screens, no like/comment/share icons, no usernames.');
    } else if (mode === 'Marketplace') {
        parts.push('Marketplace e-commerce composition: clean white or neutral solid background, professional product-only photography, consistent lighting, well-lit subject, no environment distractions.');
        parts.push('Product fills 70-85% of the frame. Sharp focus on product edges and labels. No human figure, no UI, no decorative elements.');
    }

    if (productName) {
        parts.push('Product name: ' + productName + '.');
    }
    if (productDesc) {
        parts.push('Product description: ' + productDesc + '.');
    }

    parts.push('Preserve product identity strictly: shape, color, logo, label, packaging, material details. Do not replace, redesign, or rename the product. Do not invent additional branding or text.');
    parts.push('Use only what was provided. Do not invent fake users, fake metrics, fake social media screenshots, or unrelated text.');
    if (ads.negativePrompt && ads.negativePrompt.trim()) {
        parts.push('Avoid: ' + ads.negativePrompt.trim() + '.');
    }

    return parts.join(' ');
}

async function generateProductAdsImage({ promptText, aspectRatio, references }) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent';

    const contents = [{ role: 'user', parts: [{ text: promptText }] }];
    (references || []).forEach(ref => {
        const m = (ref.dataUrl || '').match(/^data:(.+);base64,(.+)$/);
        if (m) contents[0].parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: contents,
            generationConfig: {
                responseModalities: ['IMAGE'],
                imageConfig: { aspectRatio: aspectRatio || '1:1' }
            }
        })
    });
    if (!response.ok) throw new Error('Gemini Image API HTTP ' + response.status);
    const data = await response.json();
    const part = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0];
    if (part && part.inlineData) {
        return 'data:' + part.inlineData.mimeType + ';base64,' + part.inlineData.data;
    }
    throw new Error('No image data returned.');
}

function renderProductAdsResultCard(idx) {
    return `
        <div data-img-card class="glass-card rounded-2xl p-5 border border-white/10 shadow-xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-pink-500"></div>
            <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] font-extrabold text-white uppercase tracking-widest">Variasi ${idx + 1}</span>
                <span id="adsResultStatus_${idx}" class="text-[10px] text-gray-500 font-mono">queued</span>
            </div>
            <div id="adsImgContainer_${idx}" class="relative bg-black/80 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center min-h-[260px] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.8)]">
                <div id="adsImgLoading_${idx}" class="cinematic-progress-bar my-6">
                    <div class="cinematic-progress-fill"></div>
                    <p class="text-center text-[11px] text-gray-400 mt-3 font-semibold">Menghasilkan visual ads...</p>
                </div>
                <img id="adsImg_${idx}" class="hidden w-full h-auto object-contain rounded-2xl transition-opacity duration-500 opacity-0" />
            </div>
            <div id="adsResultActions_${idx}" class="mt-3 flex flex-wrap justify-end gap-2 hidden">
                <button onclick="retryProductAdsImage(${idx})" class="text-[10px] bg-white/5 hover:bg-orange-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-orange-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                </button>
            </div>
        </div>`;
}

async function startProductAdsGeneration() {
    if (!currentUser.loggedIn) {
        showAuthView();
        return;
    }
    if (state.imageGen.isGenerating) return;

    const ads = state.imageGen.productAds;

    if (ads.mode === 'Product + Model' && (!state.productAdsProductReference || state.productAdsProductReference.length === 0)) {
        showImageGenNotice('Mode Product + Model membutuhkan foto produk. Upload foto produk terlebih dahulu.', 'error');
        const el = document.getElementById('inputAdsProductRef');
        if (el) el.click();
        return;
    }

    const variations = Math.max(1, Math.min(4, parseInt(ads.variations) || 1));
    ads.variations = variations;

    const submitBtn = document.getElementById('btnGenerateProductAds');
    const resultsContainer = document.getElementById('productAdsGenResults');
    resultsContainer.innerHTML = `<div class="image-gen-grid" data-count="${variations}"></div>`;
    const grid = resultsContainer.firstElementChild;

    for (let i = 0; i < variations; i++) {
        grid.insertAdjacentHTML('beforeend', renderProductAdsResultCard(i));
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>Generating...</span>`;
    state.imageGen.isGenerating = true;
    showImageGenNotice('Memproses ' + variations + ' visual ads...', 'info');

    const promptText = buildProductAdsPrompt(ads);
    const allRefs = [].concat(
        state.productAdsProductReference || [],
        state.productAdsModelReference || [],
        state.productAdsStyleReference || []
    );
    const configSnapshot = {
        productName: ads.productName,
        productDescription: ads.productDescription,
        mode: ads.mode,
        scene: ads.scene,
        ugcType: ads.ugcType,
        gender: ads.gender,
        ageRange: ads.ageRange,
        appearance: ads.appearance,
        pose: ads.pose,
        wardrobe: ads.wardrobe,
        environment: ads.environment,
        style: ads.style,
        mood: ads.mood,
        aspectRatio: ads.aspectRatio,
        negativePrompt: ads.negativePrompt,
        refs: {
            product: state.productAdsProductReference,
            model: state.productAdsModelReference,
            style: state.productAdsStyleReference
        }
    };
    const results = [];

    for (let i = 0; i < variations; i++) {
        const statusEl = document.getElementById('adsResultStatus_' + i);
        const imgEl = document.getElementById('adsImg_' + i);
        const loadingEl = document.getElementById('adsImgLoading_' + i);
        const actionsEl = document.getElementById('adsResultActions_' + i);

        if (statusEl) statusEl.innerHTML = '<span class="text-orange-300">generating...</span>';

        try {
            const imgDataUrl = await generateProductAdsImage({
                promptText,
                aspectRatio: ads.aspectRatio,
                references: allRefs
            });

            if (imgEl) {
                imgEl.src = imgDataUrl;
                imgEl.onload = () => imgEl.classList.remove('opacity-0');
                imgEl.classList.remove('hidden');
                imgEl.onclick = () => openImageLightbox(imgDataUrl);
            }
            if (loadingEl) loadingEl.classList.add('hidden');
            if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">done</span>';
            if (actionsEl) {
                const filename = buildDownloadFilename('ugc');
                actionsEl.innerHTML = `
                    <button onclick="openEditImageModal('ugc', ${i})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-pen mr-1"></i>Edit
                    </button>
                    <button onclick="downloadImage('${imgDataUrl}', '${filename}')" class="text-[10px] bg-white/5 hover:bg-orange-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-orange-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-download mr-1"></i>Download
                    </button>
                    <button onclick="retryProductAdsImage(${i})" class="text-[10px] bg-white/5 hover:bg-orange-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-orange-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                    </button>`;
                actionsEl.classList.remove('hidden');
            }
            const rec = saveOriginalToHistory('ugc', imgDataUrl, promptText, configSnapshot);
            results.push({ dataUrl: imgDataUrl, promptUsed: promptText, historyId: rec ? rec.id : null });
        } catch (err) {
            console.error('[UGC/ProductAds] Variation ' + (i + 1) + ' failed:', err);
            if (statusEl) statusEl.innerHTML = '<span class="text-red-400">failed</span>';
            if (loadingEl) {
                loadingEl.innerHTML = `
                    <div class="text-center p-6 space-y-2">
                        <i class="fa-solid fa-triangle-exclamation text-amber-400 text-2xl"></i>
                        <p class="text-[11px] text-red-300 font-bold uppercase tracking-widest">Generation failed</p>
                        <p class="text-[10px] text-gray-400">${(err?.message || 'Unknown error').replace(/[<>]/g,'')}</p>
                    </div>`;
            }
            if (actionsEl) actionsEl.classList.remove('hidden');
            results.push({ error: err?.message || 'Unknown error' });
        }
    }

    state.imageGen.lastResult = results;

    const failed = results.filter(r => r.error).length;
    if (failed === 0) {
        showImageGenNotice(variations + ' visual ads berhasil di-generate.', 'success');
    } else if (failed === variations) {
        showImageGenNotice('Gagal generate semua visual ads. Periksa API key atau koneksi Anda.', 'error');
    } else {
        showImageGenNotice((variations - failed) + ' dari ' + variations + ' visual ads berhasil.', 'info');
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate Ads</span>`;
    state.imageGen.isGenerating = false;
}

async function retryProductAdsImage(idx) {
    if (state.imageGen.isGenerating) return;
    const ads = state.imageGen.productAds;

    const statusEl = document.getElementById('adsResultStatus_' + idx);
    const imgEl = document.getElementById('adsImg_' + idx);
    const loadingEl = document.getElementById('adsImgLoading_' + idx);
    const actionsEl = document.getElementById('adsResultActions_' + idx);

    if (statusEl) statusEl.innerHTML = '<span class="text-orange-300">retrying...</span>';
    if (imgEl) imgEl.classList.add('hidden');
    if (loadingEl) {
        loadingEl.className = 'cinematic-progress-bar my-6';
        loadingEl.innerHTML = '<div class="cinematic-progress-fill"></div><p class="text-center text-[11px] text-gray-400 mt-3 font-semibold">Menghasilkan visual ads...</p>';
        loadingEl.classList.remove('hidden');
    }

    const allRefs = [].concat(
        state.productAdsProductReference || [],
        state.productAdsModelReference || [],
        state.productAdsStyleReference || []
    );

    try {
        const promptText = buildProductAdsPrompt(ads);
        const imgDataUrl = await generateProductAdsImage({
            promptText,
            aspectRatio: ads.aspectRatio,
            references: allRefs
        });
        if (imgEl) {
            imgEl.src = imgDataUrl;
            imgEl.onload = () => imgEl.classList.remove('opacity-0');
            imgEl.classList.remove('hidden');
            imgEl.onclick = () => openImageLightbox(imgDataUrl);
        }
        if (loadingEl) loadingEl.classList.add('hidden');
        if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">done</span>';
        if (actionsEl) {
            const filename = buildDownloadFilename('ugc');
            actionsEl.innerHTML = `
                <button onclick="openEditImageModal('ugc', ${idx})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-pen mr-1"></i>Edit
                </button>
                <button onclick="downloadImage('${imgDataUrl}', '${filename}')" class="text-[10px] bg-white/5 hover:bg-orange-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-orange-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-download mr-1"></i>Download
                </button>
                <button onclick="retryProductAdsImage(${idx})" class="text-[10px] bg-white/5 hover:bg-orange-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-orange-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                </button>`;
        }
        const configSnapshot = {
            productName: ads.productName,
            productDescription: ads.productDescription,
            mode: ads.mode,
            scene: ads.scene,
            ugcType: ads.ugcType,
            gender: ads.gender,
            ageRange: ads.ageRange,
            appearance: ads.appearance,
            pose: ads.pose,
            wardrobe: ads.wardrobe,
            environment: ads.environment,
            style: ads.style,
            mood: ads.mood,
            aspectRatio: ads.aspectRatio,
            negativePrompt: ads.negativePrompt,
            refs: {
                product: state.productAdsProductReference,
                model: state.productAdsModelReference,
                style: state.productAdsStyleReference
            }
        };
        await persistImageGenLatest('ugc', imgDataUrl, promptText, configSnapshot, idx);
    } catch (err) {
        console.error('[UGC/ProductAds] Retry ' + (idx + 1) + ' failed:', err);
        if (statusEl) statusEl.innerHTML = '<span class="text-red-400">failed</span>';
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div class="text-center p-6 space-y-2">
                    <i class="fa-solid fa-triangle-exclamation text-amber-400 text-2xl"></i>
                    <p class="text-[11px] text-red-300 font-bold uppercase tracking-widest">Retry failed</p>
                    <p class="text-[10px] text-gray-400">${(err?.message || 'Unknown error').replace(/[<>]/g,'')}</p>
                </div>`;
        }
    }
}

function resetProductAdsForm() {
    if (state.imageGen.isGenerating) return;
    const ads = state.imageGen.productAds;
    ads.productName = '';
    ads.productDescription = '';
    const ids = ['adsProductName', 'adsProductDescription', 'adsGender', 'adsAgeRange', 'adsAppearance', 'adsPose', 'adsWardrobe', 'adsEnvironment', 'adsNegative'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    state.productAdsProductReference = [];
    state.productAdsModelReference = [];
    state.productAdsStyleReference = [];
    updateRefCardUI('productAdsProductReference');
    updateRefCardUI('productAdsModelReference');
    updateRefCardUI('productAdsStyleReference');
    document.getElementById('productAdsGenResults').innerHTML = '';
    showImageGenNotice('Form direset.', 'info');
    updateAdsModeSections();
}

/* ========================================== */
/* PHASE 6A.7: CHARACTER SHEET                 */
/* ========================================== */

const CHAR_SHEET_RATIO = '3:4';
const CHAR_SHEET_REF_MAX = 8;

function emptyCharSlot() {
    return { name: '', description: '', refs: [] };
}

function snapshotCharSlot(slot) {
    return {
        name: (slot && slot.name) || '',
        description: (slot && slot.description) || '',
        refs: ((slot && slot.refs) || []).slice()
    };
}

function buildAutoCaptionOverlayLock(config) {
    if (!config || config.visualStyle !== 'Auto Caption Overlay') return '';
    return `AUTO CAPTION OVERLAY — PREMIUM GRAPHIC STORYBOARD MODE.
This is NOT subtitle mode and NOT a plain caption bar. Design every panel as a finished vertical social-media advertising frame with intentional art direction.
Each panel must use a purposeful combination of: a bold headline, short supporting copy, benefit bullets or checklist when useful, callouts, arrows or icons, color-coded graphic shapes, product integration, readable contrast, safe margins, and visual hierarchy.
Vary the graphic composition from panel to panel: alternate headline placement, card shapes, callout direction, background treatment, product scale, and accent color while preserving brand coherence. Do not place one identical sentence in a bottom box on every panel.
Use only claims, product facts, prices, promotions, and CTA wording grounded in the user brief. Never invent a discount or promise.
Text hierarchy: headline 3-8 words; supporting copy 3-12 words; checklist maximum 3 short items; CTA only where the story and genre allow it.
Use ${config.language || 'Bahasa Indonesia'} for visible marketing text. Keep text large, readable, correctly spelled, and integrated with lighting and perspective. Do not create fake UI, social platform chrome, watermarks, or random text.`;
}

function ensureCharRoster() {
    const ch = state.imageGen.character;
    if (!ch.characters || !Array.isArray(ch.characters)) ch.characters = [];
    while (ch.characters.length < 5) ch.characters.push(emptyCharSlot());
    ch.characters = ch.characters.slice(0, 5).map(function (c) {
        return {
            name: (c && c.name) || '',
            description: (c && c.description) || '',
            refs: (c && Array.isArray(c.refs)) ? c.refs.map(function (ref) {
                if (typeof ref === 'string') return { name: '', dataUrl: ref };
                const dataUrl = ref && typeof ref.dataUrl === 'string'
                    ? ref.dataUrl
                    : ref && ref.dataUrl && typeof ref.dataUrl.dataUrl === 'string'
                        ? ref.dataUrl.dataUrl
                        : '';
                return { name: (ref && ref.name) || '', dataUrl: dataUrl };
            }).filter(function (ref) { return ref.dataUrl; }) : []
        };
    });
    const n = Math.max(1, Math.min(5, parseInt(ch.count, 10) || 1));
    ch.count = n;
    return n;
}

function onCharSlotField(el) {
    const i = parseInt(el.getAttribute('data-char-i'), 10);
    const field = el.getAttribute('data-char-field');
    if (isNaN(i) || !field) return;
    ensureCharRoster();
    state.imageGen.character.characters[i][field] = el.value;
}

function renderCharSlots() {
    const n = ensureCharRoster();
    const wrap = document.getElementById('charSlots');
    if (!wrap) return;
    const chars = state.imageGen.character.characters;
    let html = '';
    for (let i = 0; i < n; i++) {
        html += `
            <div class="rounded-2xl p-4 border border-white/10 bg-black/25 space-y-3">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-extrabold text-fuchsia-300 uppercase tracking-widest">Karakter ${i + 1}</span>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Nama Karakter</label>
                    <input type="text" id="charSlotName_${i}" data-char-i="${i}" data-char-field="name" maxlength="60" placeholder="Contoh: Rangga Pratama" oninput="onCharSlotField(this)" class="w-full glass-input rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500" />
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Deskripsi & Request Outfit</label>
                    <textarea id="charSlotDesc_${i}" data-char-i="${i}" data-char-field="description" rows="3" placeholder="Contoh: pria 28 tahun, sawo matang, rambut hitam undercut, rahang tegas, tinggi 178cm, kemeja putih, chino navy, sepatu sneakers putih" oninput="onCharSlotField(this)" class="w-full glass-input rounded-xl p-3 text-sm text-white placeholder-gray-500 resize-y"></textarea>
                </div>
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] font-bold text-gray-200 flex items-center gap-2 uppercase tracking-wide">
                            <i class="fa-solid fa-image-portrait text-fuchsia-400 text-sm"></i> Foto Referensi
                        </span>
                        <span id="badgeCharSheetRef_${i}" class="text-[10px] bg-fuchsia-900/50 text-fuchsia-300 font-extrabold px-2.5 py-0.5 rounded-full border border-fuchsia-500/30">0</span>
                    </div>
                    <div onclick="triggerUpload('inputCharSheetRef_${i}')" class="border border-dashed border-white/10 hover:border-fuchsia-500/50 rounded-xl p-4 text-center cursor-pointer transition bg-black/30 hover:bg-fuchsia-950/20 group">
                        <i class="fa-solid fa-cloud-arrow-up text-fuchsia-400 text-xl mb-1 block group-hover:scale-110 transition-transform"></i>
                        <span class="text-[10px] text-gray-400 font-semibold block">Tampak depan, samping, belakang, atau ekspresi. Bisa banyak (maks 8). Jika hanya foto depan, TRENDORA membuatkan sisanya.</span>
                    </div>
                    <input type="file" id="inputCharSheetRef_${i}" multiple accept="image/*" class="hidden" onchange="handleCharSheetFileSelect(this, ${i})">
                    <div id="previewCharSheetRef_${i}" class="flex flex-wrap gap-2 mt-3"></div>
                </div>
            </div>`;
    }
    wrap.innerHTML = html;
    for (let i = 0; i < n; i++) {
        const c = chars[i];
        const nameEl = document.getElementById('charSlotName_' + i);
        const descEl = document.getElementById('charSlotDesc_' + i);
        if (nameEl) nameEl.value = c.name || '';
        if (descEl) descEl.value = c.description || '';
        renderCharSlotRefs(i);
    }
}

function renderCharSlotRefs(idx) {
    ensureCharRoster();
    const slot = state.imageGen.character.characters[idx];
    const list = (slot && slot.refs) || [];
    const badge = document.getElementById('badgeCharSheetRef_' + idx);
    const preview = document.getElementById('previewCharSheetRef_' + idx);
    if (badge) badge.textContent = String(list.length);
    if (!preview) return;
    preview.innerHTML = list.map(function (item, refI) {
        return '<div class="relative w-12 h-12 rounded-lg overflow-hidden border border-fuchsia-500/30 group ring-1 ring-black/50 shadow-sm">' +
            '<img src="' + item.dataUrl + '" class="w-full h-full object-cover">' +
            '<button onclick="removeCharSheetRef(' + idx + ',' + refI + ')" class="absolute inset-0 bg-black/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition backdrop-blur-sm"><i class="fa-solid fa-trash-can"></i></button>' +
            '</div>';
    }).join('');
}

async function handleCharSheetFileSelect(input, idx) {
    const files = Array.from(input.files || []);
    input.value = '';
    if (!files.length) return;
    ensureCharRoster();
    const slot = state.imageGen.character.characters[idx];
    if (!slot.refs) slot.refs = [];
    const room = Math.max(0, CHAR_SHEET_REF_MAX - slot.refs.length);
    if (room <= 0) {
        alert('Maksimal ' + CHAR_SHEET_REF_MAX + ' foto per karakter.');
        return;
    }
    const take = files.slice(0, room);
    if (files.length > room) alert('Hanya ' + room + ' foto yang ditambah (maks ' + CHAR_SHEET_REF_MAX + ' per karakter).');
    for (let f = 0; f < take.length; f++) {
        const file = take[f];
        const dataUrl = await new Promise(function (resolve) {
            const reader = new FileReader();
            reader.onload = function (e) { resolve(e.target.result); };
            reader.readAsDataURL(file);
        });
        const compressed = (typeof compressRefImage === 'function') ? await compressRefImage(dataUrl) : { dataUrl: dataUrl };
        slot.refs.push({ name: file.name, dataUrl: compressed.dataUrl || dataUrl });
    }
    renderCharSlotRefs(idx);
}

function removeCharSheetRef(idx, refI) {
    ensureCharRoster();
    const slot = state.imageGen.character.characters[idx];
    if (!slot || !slot.refs) return;
    slot.refs.splice(refI, 1);
    renderCharSlotRefs(idx);
}

function buildCharacterSheetPrompt(slot) {
    const name = ((slot && slot.name) || '').trim();
    const description = ((slot && slot.description) || '').trim();
    const hasRefs = slot && slot.refs && slot.refs.length > 0;
    const parts = [];
    parts.push('Create ONE single image: a professional cinematic character reference sheet, portrait 3:4 aspect ratio, with a pure black background and bold black gutters.');
    parts.push('CHARACTER SHEET EDITORIAL LAYOUT LOCK (mandatory): exactly 7 panels of the SAME person, arranged as one designed contact sheet matching this blueprint. Panel A is one large full-body front view occupying the left side from near the top to near the bottom. Panel B is a half-body side profile in the upper-right. Panel C is a half-body three-quarter view in the middle-right. Panels D, E, F, and G are four equal face close-ups in one horizontal row across the bottom. The left full-body panel is visibly taller and wider than the two right panels. The two right panels are stacked vertically. The four bottom expression panels are aligned and equal width. Use thick black spacing between every panel. Do not use a 3x3 grid, equal cells, nine cells, thin divider lines, or any alternate arrangement. No extra panel, no 8th figure, no 10th figure, no overlapping people, no collage of different people.');
    parts.push('Panel content in exact order: A FULL BODY standing head-to-toe FRONT; B HALF BODY SIDE VIEW profile; C HALF BODY THREE-QUARTER / 3/4 VIEW; D FACE close-up SMILING; E FACE close-up FLAT / NEUTRAL; F FACE close-up LAUGHING with joyful open-mouth expression; G FACE close-up SAD / worried. Keep the same face, hairstyle, clothing, body, and accessories in every panel; only angle and expression change.');
    parts.push('Design treatment: black background and black gutters, clean light studio photo backgrounds inside the panels, bold condensed yellow uppercase title at the top center using the character name, and small black label boxes with bold yellow uppercase text overlapping the lower edge of each panel. Labels must read exactly: FULL BODY, SIDE VIEW, 3/4 VIEW, SMILING, FLAT, LAUGHING, SAD. Do not add any other text, logo, watermark, UI, or decorative elements.');
    if (name) parts.push('Character name: ' + name + '.');
    if (description) {
        parts.push('USER REQUEST — HIGHEST PRIORITY (follow this request exactly, including any requested outfit, clothing, costume, uniform, colors, materials, layers, accessories, footwear, hairstyle, makeup, era, or styling):');
        parts.push('--- CHARACTER DATA START ---');
        parts.push(description);
        parts.push('--- CHARACTER DATA END ---');
        parts.push('If the user request specifies an outfit or styling, it OVERRIDES the wardrobe visible in the reference photos. Keep the referenced face, identity, skin tone, body proportions, and other physical traits, but replace the clothing and styling with the exact user-requested design. Do not silently substitute, simplify, modernize, or revert the requested outfit.');
    }
    if (hasRefs) {
        parts.push('REFERENCE PHOTOS are attached. Use them primarily to lock THIS character identity: face, hair, skin tone, body proportions, and recognizable physical traits. If the user did not specify clothing or styling, also preserve the wardrobe from the photos. If the user did specify clothing or styling, follow the USER REQUEST instead and apply that requested outfit consistently to all 7 panels. If a view or expression is already in the photos, render that panel to match the identity. If only a front photo is attached, invent the other 6 panels from that same face without changing identity.');
    }
    parts.push('Identity lock: the SAME person in all 7 panels. Face shape, eyes, brows, nose, mouth, hair, skin tone, and body proportions stay identical. Apply one consistent outfit and styling across all 7 panels: use the exact USER REQUEST when provided; otherwise use the reference wardrobe or the description. Only camera angle or expression changes. Photoreal cinematic lighting, natural skin texture.');
    parts.push('No UI, no app screens, no social-media overlays, no extra people, no decorative text besides the character title and the 7 specified panel labels.');
    return parts.join(' ');
}

async function generateCharacterSheetImage({ promptText, aspectRatio, references }) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent';

    const contents = [{ role: 'user', parts: [{ text: promptText }] }];
    for (const ref of (references || [])) {
        const dataUrl = typeof ref === 'string' ? ref : ref && ref.dataUrl;
        if (typeof dataUrl !== 'string') continue;
        const m = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (m) contents[0].parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: contents,
            generationConfig: {
                responseModalities: ['IMAGE'],
                imageConfig: { aspectRatio: aspectRatio || '1:1' }
            }
        })
    });
    if (!response.ok) throw new Error('Gemini Image API HTTP ' + response.status);
    const data = await response.json();
    const part = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0];
    if (part && part.inlineData) {
        return 'data:' + part.inlineData.mimeType + ';base64,' + part.inlineData.data;
    }
    throw new Error('No image data returned.');
}

function renderCharacterSheetResultCard(idx, label) {
    const title = (label || ('Karakter ' + (idx + 1))).replace(/[<>]/g, '');
    return `
        <div data-img-card class="glass-card rounded-2xl p-5 border border-white/10 shadow-xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-indigo-500"></div>
            <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] font-extrabold text-white uppercase tracking-widest">${title}</span>
                <span id="charResultStatus_${idx}" class="text-[10px] text-gray-500 font-mono">queued</span>
            </div>
            <div id="charImgContainer_${idx}" class="relative bg-black/80 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center min-h-[260px] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.8)]">
                <div id="charImgLoading_${idx}" class="cinematic-progress-bar my-6">
                    <div class="cinematic-progress-fill"></div>
                    <p class="text-center text-[11px] text-gray-400 mt-3 font-semibold">Menghasilkan sheet ${title}...</p>
                </div>
                <img id="charImg_${idx}" class="hidden w-full h-auto object-contain rounded-2xl transition-opacity duration-500 opacity-0" />
            </div>
            <div id="charResultActions_${idx}" class="mt-3 flex flex-wrap justify-end gap-2 hidden">
                <button onclick="retryCharacterSheetImage(${idx})" class="text-[10px] bg-white/5 hover:bg-fuchsia-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-fuchsia-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                </button>
            </div>
        </div>`;
}

async function startCharacterSheetGeneration() {
    if (!currentUser.loggedIn) {
        showAuthView();
        return;
    }
    if (state.imageGen.isGenerating) return;

    const n = ensureCharRoster();
    const roster = state.imageGen.character.characters;
    for (let i = 0; i < n; i++) {
        const slot = roster[i];
        const hasName = slot.name && slot.name.trim();
        const hasDesc = slot.description && slot.description.trim();
        const hasRefs = slot.refs && slot.refs.length;
        if (!hasName && !hasDesc && !hasRefs) {
            showImageGenNotice('Isi minimal nama Karakter ' + (i + 1) + '.', 'error');
            const el = document.getElementById('charSlotName_' + i);
            if (el) el.focus();
            return;
        }
    }

    const submitBtn = document.getElementById('btnGenerateCharacter');
    const resultsContainer = document.getElementById('characterGenResults');
    resultsContainer.innerHTML = `<div class="image-gen-grid char-sheet-grid" data-count="${n}"></div>`;
    const grid = resultsContainer.firstElementChild;

    for (let i = 0; i < n; i++) {
        const label = (roster[i].name && roster[i].name.trim()) || ('Karakter ' + (i + 1));
        grid.insertAdjacentHTML('beforeend', renderCharacterSheetResultCard(i, label));
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>Generating...</span>`;
    state.imageGen.isGenerating = true;
    showImageGenNotice('Memproses ' + n + ' character sheet...', 'info');

    const results = [];

    for (let i = 0; i < n; i++) {
        const slot = snapshotCharSlot(roster[i]);
        const label = (slot.name && slot.name.trim()) || ('Karakter ' + (i + 1));
        const promptText = buildCharacterSheetPrompt(slot);
        const refs = slot.refs || [];
        const configSnapshot = {
            count: n,
            characters: [slot],
            characterName: slot.name,
            aspectRatio: CHAR_SHEET_RATIO,
            refs: refs
        };

        const statusEl = document.getElementById('charResultStatus_' + i);
        const imgEl = document.getElementById('charImg_' + i);
        const loadingEl = document.getElementById('charImgLoading_' + i);
        const actionsEl = document.getElementById('charResultActions_' + i);

        if (statusEl) statusEl.innerHTML = '<span class="text-fuchsia-300">generating...</span>';
        showImageGenNotice('Menghasilkan ' + label + ' (' + (i + 1) + '/' + n + ')...', 'info');

        try {
            const imgDataUrl = await generateCharacterSheetImage({
                promptText: promptText,
                aspectRatio: CHAR_SHEET_RATIO,
                references: refs
            });

            if (imgEl) {
                imgEl.src = imgDataUrl;
                imgEl.onload = () => imgEl.classList.remove('opacity-0');
                imgEl.classList.remove('hidden');
                imgEl.onclick = () => openImageLightbox(imgDataUrl);
            }
            if (loadingEl) loadingEl.classList.add('hidden');
            if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">done</span>';
            if (actionsEl) {
                const filename = buildDownloadFilename('character');
                actionsEl.innerHTML = `
                    <button onclick="openEditImageModal('character', ${i})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-pen mr-1"></i>Edit
                    </button>
                    <button onclick="downloadImage('${imgDataUrl}', '${filename}')" class="text-[10px] bg-white/5 hover:bg-fuchsia-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-fuchsia-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-download mr-1"></i>Download
                    </button>
                    <button onclick="retryCharacterSheetImage(${i})" class="text-[10px] bg-white/5 hover:bg-fuchsia-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-fuchsia-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                    </button>`;
                actionsEl.classList.remove('hidden');
            }
            const rec = saveOriginalToHistory('character', imgDataUrl, promptText, configSnapshot);
            results.push({ dataUrl: imgDataUrl, promptUsed: promptText, historyId: rec ? rec.id : null, slot: slot, refs: refs });
        } catch (err) {
            console.error('[CharacterSheet] Karakter ' + (i + 1) + ' failed:', err);
            if (statusEl) statusEl.innerHTML = '<span class="text-red-400">failed</span>';
            if (loadingEl) {
                loadingEl.innerHTML = `
                    <div class="text-center p-6 space-y-2">
                        <i class="fa-solid fa-triangle-exclamation text-amber-400 text-2xl"></i>
                        <p class="text-[11px] text-red-300 font-bold uppercase tracking-widest">Generation failed</p>
                        <p class="text-[10px] text-gray-400">${(err?.message || 'Unknown error').replace(/[<>]/g,'')}</p>
                    </div>`;
            }
            if (actionsEl) actionsEl.classList.remove('hidden');
            results.push({ error: err?.message || 'Unknown error', slot: slot, promptUsed: promptText, refs: refs });
        }
    }

    state.imageGen.lastResult = results;

    const failed = results.filter(r => r.error).length;
    if (failed === 0) {
        showImageGenNotice(n + ' character sheet berhasil di-generate.', 'success');
    } else if (failed === n) {
        showImageGenNotice('Gagal generate semua character sheet. Coba lagi.', 'error');
    } else {
        showImageGenNotice((n - failed) + ' dari ' + n + ' character sheet berhasil.', 'info');
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate Character Sheet</span>`;
    state.imageGen.isGenerating = false;
}

async function retryCharacterSheetImage(idx) {
    if (state.imageGen.isGenerating) return;
    ensureCharRoster();
    const prev = (state.imageGen.lastResult || [])[idx];
    const slot = (prev && prev.slot) ? prev.slot : snapshotCharSlot(state.imageGen.character.characters[idx] || emptyCharSlot());
    const promptText = (prev && prev.promptUsed) ? prev.promptUsed : buildCharacterSheetPrompt(slot);
    const refs = (prev && prev.refs) ? prev.refs : (slot.refs || []);

    const statusEl = document.getElementById('charResultStatus_' + idx);
    const imgEl = document.getElementById('charImg_' + idx);
    const loadingEl = document.getElementById('charImgLoading_' + idx);
    const actionsEl = document.getElementById('charResultActions_' + idx);

    if (statusEl) statusEl.innerHTML = '<span class="text-fuchsia-300">retrying...</span>';
    if (imgEl) imgEl.classList.add('hidden');
    if (loadingEl) {
        loadingEl.className = 'cinematic-progress-bar my-6';
        loadingEl.innerHTML = '<div class="cinematic-progress-fill"></div><p class="text-center text-[11px] text-gray-400 mt-3 font-semibold">Menghasilkan character sheet...</p>';
        loadingEl.classList.remove('hidden');
    }

    try {
        const imgDataUrl = await generateCharacterSheetImage({
            promptText: promptText,
            aspectRatio: CHAR_SHEET_RATIO,
            references: refs
        });
        if (imgEl) {
            imgEl.src = imgDataUrl;
            imgEl.onload = () => imgEl.classList.remove('opacity-0');
            imgEl.classList.remove('hidden');
            imgEl.onclick = () => openImageLightbox(imgDataUrl);
        }
        if (loadingEl) loadingEl.classList.add('hidden');
        if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">done</span>';
        if (actionsEl) {
            const filename = buildDownloadFilename('character');
            actionsEl.innerHTML = `
                <button onclick="openEditImageModal('character', ${idx})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-pen mr-1"></i>Edit
                </button>
                <button onclick="downloadImage('${imgDataUrl}', '${filename}')" class="text-[10px] bg-white/5 hover:bg-fuchsia-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-fuchsia-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-download mr-1"></i>Download
                </button>
                <button onclick="retryCharacterSheetImage(${idx})" class="text-[10px] bg-white/5 hover:bg-fuchsia-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-fuchsia-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                    </button>`;
        }
        const configSnapshot = {
            count: 1,
            characters: [slot],
            characterName: slot.name,
            aspectRatio: CHAR_SHEET_RATIO,
            refs: refs
        };
        await persistImageGenLatest('character', imgDataUrl, promptText, configSnapshot, idx, { slot: slot, refs: refs });
    } catch (err) {
        console.error('[CharacterSheet] Retry ' + (idx + 1) + ' failed:', err);
        if (statusEl) statusEl.innerHTML = '<span class="text-red-400">failed</span>';
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div class="text-center p-6 space-y-2">
                    <i class="fa-solid fa-triangle-exclamation text-amber-400 text-2xl"></i>
                    <p class="text-[11px] text-red-300 font-bold uppercase tracking-widest">Retry failed</p>
                    <p class="text-[10px] text-gray-400">${(err?.message || 'Unknown error').replace(/[<>]/g,'')}</p>
                </div>`;
        }
    }
}

function resetCharacterSheetForm() {
    if (state.imageGen.isGenerating) return;
    const ch = state.imageGen.character;
    ch.count = 1;
    ch.characters = [emptyCharSlot(), emptyCharSlot(), emptyCharSlot(), emptyCharSlot(), emptyCharSlot()];
    state.characterSheetReference = [];
    const resultsEl = document.getElementById('characterGenResults');
    if (resultsEl) resultsEl.innerHTML = '';
    renderCharSlots();
    const countWrap = document.getElementById('selectorCharCount');
    if (countWrap) {
        const btn = countWrap.querySelector('button[data-val="1"]');
        if (btn) btn.click();
    }
    showImageGenNotice('Form direset.', 'info');
}

/* ========================================== */
/* PHASE 6A.8: POSTER & SOCIAL MEDIA          */
/* ========================================== */

function updatePosterDesignTypeSection() {
    const p = state.imageGen.poster;
    const wrap = document.getElementById('posterCustomDesignTypeWrap');
    if (wrap) wrap.classList.toggle('hidden', p.designType !== 'Custom');
}

function updatePosterStyleSection() {
    const p = state.imageGen.poster;
    const wrap = document.getElementById('posterCustomStyleWrap');
    if (wrap) wrap.classList.toggle('hidden', p.style !== 'Custom');
}

function buildPosterPrompt(poster) {
    const designType = poster.designType || 'Social Media Post';
    const platform = poster.platform || 'Instagram Post';
    const style = poster.style || 'Modern';
    const aspect = poster.aspectRatio || '1:1';
    const mainMessage = (poster.mainMessage || '').trim();
    const details = (poster.details || '').trim();

    const designTypeGuide = {
        'Social Media Post': 'Designed as a feed-friendly social media post. Clear central subject, clear focal hierarchy, room for key text overlay.',
        'Promotional Poster': 'Promotional poster: strong focal product/promo, prominent headline area, visible CTA region, strong visual hierarchy.',
        'Event Poster': 'Event poster: date / venue / lineup hierarchy, focal artwork, prominent event title, supporting details.',
        'Sale / Discount': 'Sale / discount poster: bold discount % visual, original-vs-new price contrast, urgency cue, prominent CTA.',
        'Product Promotion': 'Product promotion: hero product centered or rule-of-thirds, supporting benefit callouts, brand mark area, CTA.',
        'Announcement': 'Announcement poster: clear headline, supporting context, date if relevant, optionally a CTA.',
        'Quote / Motivation': 'Quote / motivation poster: large readable quote as the hero, supportive minimal imagery, signature / attribution area.',
        'Custom': 'Custom design intent: ' + ((poster.customDesignType || '').trim() || 'a single-purpose announcement / promotional poster.') + ' Follow the user-provided intent precisely.'
    };

    const platformGuide = {
        'Instagram Post': 'Platform composition: Instagram square feed. Center-weighted, safe for IG compression, no UI overlays.',
        'Instagram Story': 'Platform composition: vertical 9:16 Story. Keep critical content in the top and bottom safe zones (avoid the very top and bottom 250px).',
        'Facebook': 'Platform composition: Facebook-friendly aspect ratio. Center-weighted, readable at small sizes.',
        'TikTok': 'Platform composition: TikTok-friendly vertical. Center-weighted, strong focal subject, no TikTok UI / overlays.',
        'YouTube Community': 'Platform composition: YouTube Community-tab post. Wide-friendly, readable thumbnail-safe area.',
        'Marketplace': 'Platform composition: marketplace / e-commerce product-card. Clean, product-first, minimal distractions.',
        'General': 'Platform composition: general-purpose poster. Safe for any digital placement.'
    };

    const styleGuide = {
        Modern: 'Modern style: clean sans-serif, generous whitespace, balanced grid, current color palette.',
        Minimal: 'Minimal style: monochrome or two-tone, ample whitespace, very thin dividers, restrained typography.',
        Bold: 'Bold style: oversized type, high contrast, saturation, dynamic layout, attention-grabbing.',
        Premium: 'Premium style: refined palette, restrained ornaments, sophisticated type, elegant spacing.',
        Elegant: 'Elegant style: serif accents, refined contrast, refined decorative elements, balanced composition.',
        Cinematic: 'Cinematic style: film-grade lighting, color graded, dramatic depth, atmospheric context.',
        Futuristic: 'Futuristic style: neon accents, geometric shapes, dynamic angles, digital gloss.',
        Playful: 'Playful style: rounded shapes, bright pop colors, casual typography, friendly energy.',
        Custom: 'Custom style: ' + ((poster.customStyle || '').trim() || 'follow the closest matching style from the available list.') + ' Apply it consistently.'
    };

    const parts = [];
    parts.push('Create a single-frame poster / social media visual, ' + aspect + ' aspect ratio.');
    parts.push(designTypeGuide[designType] || designTypeGuide['Social Media Post']);
    parts.push(platformGuide[platform] || platformGuide.General);
    parts.push(styleGuide[style] || styleGuide.Modern);

    if (mainMessage) {
        parts.push('Display the MAIN MESSAGE text exactly as: "' + mainMessage + '". Place it prominently with strong hierarchy, readable typography, high contrast, and safe margins.');
    }
    if (details) {
        parts.push('Additional details (use verbatim where applicable):');
        parts.push('--- DETAILS START ---');
        parts.push(details);
        parts.push('--- DETAILS END ---');
    }
    parts.push('No UI, no app screens, no social-media overlays, no like/comment/share icons, no usernames, no fake platform screenshots.');
    parts.push('No fabricated medical claims, no fabricated guarantees, no fabricated statistics. Use only what the user provided.');
    return parts.join(' ');
}

async function generatePosterImage({ promptText, aspectRatio, references }) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent';

    const contents = [{ role: 'user', parts: [{ text: promptText }] }];
    (references || []).forEach(ref => {
        const m = (ref.dataUrl || '').match(/^data:(.+);base64,(.+)$/);
        if (m) contents[0].parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: contents,
            generationConfig: {
                responseModalities: ['IMAGE'],
                imageConfig: { aspectRatio: aspectRatio || '1:1' }
            }
        })
    });
    if (!response.ok) throw new Error('Gemini Image API HTTP ' + response.status);
    const data = await response.json();
    const part = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0];
    if (part && part.inlineData) {
        return 'data:' + part.inlineData.mimeType + ';base64,' + part.inlineData.data;
    }
    throw new Error('No image data returned.');
}

function renderPosterResultCard(idx) {
    return `
        <div data-img-card class="glass-card rounded-2xl p-5 border border-white/10 shadow-xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-purple-500"></div>
            <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] font-extrabold text-white uppercase tracking-widest">Variasi ${idx + 1}</span>
                <span id="posterResultStatus_${idx}" class="text-[10px] text-gray-500 font-mono">queued</span>
            </div>
            <div id="posterImgContainer_${idx}" class="relative bg-black/80 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center min-h-[260px] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.8)]">
                <div id="posterImgLoading_${idx}" class="cinematic-progress-bar my-6">
                    <div class="cinematic-progress-fill"></div>
                    <p class="text-center text-[11px] text-gray-400 mt-3 font-semibold">Menghasilkan poster...</p>
                </div>
                <img id="posterImg_${idx}" class="hidden w-full h-auto object-contain rounded-2xl transition-opacity duration-500 opacity-0" />
            </div>
            <div id="posterResultActions_${idx}" class="mt-3 flex flex-wrap justify-end gap-2 hidden">
                <button onclick="retryPosterImage(${idx})" class="text-[10px] bg-white/5 hover:bg-rose-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-rose-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                </button>
            </div>
        </div>`;
}

async function startPosterGeneration() {
    if (!currentUser.loggedIn) {
        showAuthView();
        return;
    }
    if (state.imageGen.isGenerating) return;

    const poster = state.imageGen.poster;
    if (!poster.mainMessage || !poster.mainMessage.trim()) {
        showImageGenNotice('Main Message wajib diisi.', 'error');
        const el = document.getElementById('posterMessage');
        if (el) el.focus();
        return;
    }

    const variations = Math.max(1, Math.min(4, parseInt(poster.variations) || 1));
    poster.variations = variations;

    const submitBtn = document.getElementById('btnGeneratePoster');
    const resultsContainer = document.getElementById('posterGenResults');
    resultsContainer.innerHTML = `<div class="image-gen-grid" data-count="${variations}"></div>`;
    const grid = resultsContainer.firstElementChild;

    for (let i = 0; i < variations; i++) {
        grid.insertAdjacentHTML('beforeend', renderPosterResultCard(i));
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>Generating...</span>`;
    state.imageGen.isGenerating = true;
    showImageGenNotice('Memproses ' + variations + ' poster...', 'info');

    const promptText = buildPosterPrompt(poster);
    const allRefs = [].concat(
        state.posterReference || [],
        state.posterStyleReference || []
    );
    const configSnapshot = {
        mainMessage: poster.mainMessage,
        designType: poster.designType,
        customDesignType: poster.customDesignType,
        platform: poster.platform,
        style: poster.style,
        customStyle: poster.customStyle,
        aspectRatio: poster.aspectRatio,
        details: poster.details,
        refs: {
            product: state.posterReference,
            style: state.posterStyleReference
        }
    };
    const results = [];

    for (let i = 0; i < variations; i++) {
        const statusEl = document.getElementById('posterResultStatus_' + i);
        const imgEl = document.getElementById('posterImg_' + i);
        const loadingEl = document.getElementById('posterImgLoading_' + i);
        const actionsEl = document.getElementById('posterResultActions_' + i);

        if (statusEl) statusEl.innerHTML = '<span class="text-rose-300">generating...</span>';

        try {
            const imgDataUrl = await generatePosterImage({
                promptText,
                aspectRatio: poster.aspectRatio,
                references: allRefs
            });

            if (imgEl) {
                imgEl.src = imgDataUrl;
                imgEl.onload = () => imgEl.classList.remove('opacity-0');
                imgEl.classList.remove('hidden');
                imgEl.onclick = () => openImageLightbox(imgDataUrl);
            }
            if (loadingEl) loadingEl.classList.add('hidden');
            if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">done</span>';
            if (actionsEl) {
                const filename = buildDownloadFilename('poster');
                actionsEl.innerHTML = `
                    <button onclick="openEditImageModal('poster', ${i})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-pen mr-1"></i>Edit
                    </button>
                    <button onclick="downloadImage('${imgDataUrl}', '${filename}')" class="text-[10px] bg-white/5 hover:bg-rose-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-rose-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-download mr-1"></i>Download
                    </button>
                    <button onclick="retryPosterImage(${i})" class="text-[10px] bg-white/5 hover:bg-rose-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-rose-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                    </button>`;
                actionsEl.classList.remove('hidden');
            }
            const rec = saveOriginalToHistory('poster', imgDataUrl, promptText, configSnapshot);
            results.push({ dataUrl: imgDataUrl, promptUsed: promptText, historyId: rec ? rec.id : null });
        } catch (err) {
            console.error('[Poster] Variation ' + (i + 1) + ' failed:', err);
            if (statusEl) statusEl.innerHTML = '<span class="text-red-400">failed</span>';
            if (loadingEl) {
                loadingEl.innerHTML = `
                    <div class="text-center p-6 space-y-2">
                        <i class="fa-solid fa-triangle-exclamation text-amber-400 text-2xl"></i>
                        <p class="text-[11px] text-red-300 font-bold uppercase tracking-widest">Generation failed</p>
                        <p class="text-[10px] text-gray-400">${(err?.message || 'Unknown error').replace(/[<>]/g,'')}</p>
                    </div>`;
            }
            if (actionsEl) actionsEl.classList.remove('hidden');
            results.push({ error: err?.message || 'Unknown error' });
        }
    }

    state.imageGen.lastResult = results;

    const failed = results.filter(r => r.error).length;
    if (failed === 0) {
        showImageGenNotice(variations + ' poster berhasil di-generate.', 'success');
    } else if (failed === variations) {
        showImageGenNotice('Gagal generate semua poster. Periksa API key atau koneksi Anda.', 'error');
    } else {
        showImageGenNotice((variations - failed) + ' dari ' + variations + ' poster berhasil.', 'info');
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate Poster</span>`;
    state.imageGen.isGenerating = false;
}

async function retryPosterImage(idx) {
    if (state.imageGen.isGenerating) return;
    const poster = state.imageGen.poster;

    const statusEl = document.getElementById('posterResultStatus_' + idx);
    const imgEl = document.getElementById('posterImg_' + idx);
    const loadingEl = document.getElementById('posterImgLoading_' + idx);
    const actionsEl = document.getElementById('posterResultActions_' + idx);

    if (statusEl) statusEl.innerHTML = '<span class="text-rose-300">retrying...</span>';
    if (imgEl) imgEl.classList.add('hidden');
    if (loadingEl) {
        loadingEl.className = 'cinematic-progress-bar my-6';
        loadingEl.innerHTML = '<div class="cinematic-progress-fill"></div><p class="text-center text-[11px] text-gray-400 mt-3 font-semibold">Menghasilkan poster...</p>';
        loadingEl.classList.remove('hidden');
    }

    const allRefs = [].concat(
        state.posterReference || [],
        state.posterStyleReference || []
    );

    try {
        const promptText = buildPosterPrompt(poster);
        const imgDataUrl = await generatePosterImage({
            promptText,
            aspectRatio: poster.aspectRatio,
            references: allRefs
        });
        if (imgEl) {
            imgEl.src = imgDataUrl;
            imgEl.onload = () => imgEl.classList.remove('opacity-0');
            imgEl.classList.remove('hidden');
            imgEl.onclick = () => openImageLightbox(imgDataUrl);
        }
        if (loadingEl) loadingEl.classList.add('hidden');
        if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">done</span>';
        if (actionsEl) {
            const filename = buildDownloadFilename('poster');
            actionsEl.innerHTML = `
                <button onclick="openEditImageModal('poster', ${idx})" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-pen mr-1"></i>Edit
                </button>
                <button onclick="downloadImage('${imgDataUrl}', '${filename}')" class="text-[10px] bg-white/5 hover:bg-rose-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-rose-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-download mr-1"></i>Download
                </button>
                <button onclick="retryPosterImage(${idx})" class="text-[10px] bg-white/5 hover:bg-rose-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-rose-500/50 transition font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                </button>`;
        }
        const configSnapshot = {
            mainMessage: poster.mainMessage,
            designType: poster.designType,
            customDesignType: poster.customDesignType,
            platform: poster.platform,
            style: poster.style,
            customStyle: poster.customStyle,
            aspectRatio: poster.aspectRatio,
            details: poster.details,
            refs: {
                product: state.posterReference,
                style: state.posterStyleReference
            }
        };
        await persistImageGenLatest('poster', imgDataUrl, promptText, configSnapshot, idx);
    } catch (err) {
        console.error('[Poster] Retry ' + (idx + 1) + ' failed:', err);
        if (statusEl) statusEl.innerHTML = '<span class="text-red-400">failed</span>';
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div class="text-center p-6 space-y-2">
                    <i class="fa-solid fa-triangle-exclamation text-amber-400 text-2xl"></i>
                    <p class="text-[11px] text-red-300 font-bold uppercase tracking-widest">Retry failed</p>
                    <p class="text-[10px] text-gray-400">${(err?.message || 'Unknown error').replace(/[<>]/g,'')}</p>
                </div>`;
        }
    }
}

function resetPosterForm() {
    if (state.imageGen.isGenerating) return;
    const p = state.imageGen.poster;
    p.mainMessage = '';
    p.customDesignType = '';
    p.customStyle = '';
    p.details = '';
    const ids = ['posterMessage', 'posterCustomDesignType', 'posterCustomStyle', 'posterDetails'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    state.posterReference = [];
    state.posterStyleReference = [];
    updateRefCardUI('posterReference');
    updateRefCardUI('posterStyleReference');
    document.getElementById('posterGenResults').innerHTML = '';
    showImageGenNotice('Form direset.', 'info');
    updatePosterDesignTypeSection();
    updatePosterStyleSection();
}

function navGoPoster() {
    setActiveViewKey('imageGen-poster');
    setActiveSidebarItem('imageGen-poster');
    expandNavGroup('imageGen');
    showImageGenView();
    if (typeof selectImageGenTool === 'function') {
        selectImageGenTool('poster');
    }
}
