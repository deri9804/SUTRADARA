/* ----------------------------------------------------------------- */
/* STORYBOARD SETTINGS INTERACTION & STATE BINDING                   */
/* ----------------------------------------------------------------- */
function initPillSelectors() {
    if (!state.voiceOver) {
        state.voiceOver = {
            script: '', language: 'Indonesian', voice: 'Female Warm', style: 'Natural',
            tempo: '1.0x', duration: '10s', customDuration: 30
        };
    }
    bindPillSelector('#selectorScenes', (val) => state.sceneCount = parseInt(val));
    bindPillSelector('#selectorFrames', (val) => state.shotsPerScene = parseInt(val));
    bindPillSelector('#selectorDuration', (val) => state.durationPerScene = val);
    bindPillSelector('#selectorRatio', (val) => state.aspectRatio = val);
    bindPillSelector('#selectorEpisodes', (val) => state.episodeCount = Math.min(5, Math.max(1, parseInt(val) || 1)));
    bindPillSelector('#selectorFotoStyle', (val) => state.imageGen.foto.style = val);
    bindPillSelector('#selectorFotoLighting', (val) => state.imageGen.foto.lighting = val);
    bindPillSelector('#selectorFotoMood', (val) => state.imageGen.foto.mood = val);
    bindPillSelector('#selectorFotoRatio', (val) => state.imageGen.foto.aspectRatio = val);
    bindPillSelector('#selectorFotoVariations', (val) => state.imageGen.foto.variations = parseInt(val));
    bindPillSelector('#selectorThumbPlatform', (val) => state.imageGen.thumbnail.platform = val);
    bindPillSelector('#selectorThumbStyle', (val) => state.imageGen.thumbnail.style = val);
    bindPillSelector('#selectorThumbMood', (val) => state.imageGen.thumbnail.mood = val);
    bindPillSelector('#selectorThumbRatio', (val) => state.imageGen.thumbnail.aspectRatio = val);
    bindPillSelector('#selectorThumbVariations', (val) => state.imageGen.thumbnail.variations = parseInt(val));
    bindPillSelector('#selectorInfoType', (val) => state.imageGen.infographic.type = val);
    bindPillSelector('#selectorInfoStyle', (val) => state.imageGen.infographic.style = val);
    bindPillSelector('#selectorInfoColor', (val) => state.imageGen.infographic.colorTheme = val);
    bindPillSelector('#selectorInfoRatio', (val) => state.imageGen.infographic.aspectRatio = val);
    bindPillSelector('#selectorInfoVariations', (val) => state.imageGen.infographic.variations = parseInt(val));
    bindPillSelector('#selectorAdsMode', (val) => {
        state.imageGen.productAds.mode = val;
        if (typeof updateAdsModeSections === 'function') updateAdsModeSections();
    });
    bindPillSelector('#selectorAdsScene', (val) => state.imageGen.productAds.scene = val);
    bindPillSelector('#selectorAdsUGCType', (val) => state.imageGen.productAds.ugcType = val);
    bindPillSelector('#selectorAdsStyle', (val) => state.imageGen.productAds.style = val);
    bindPillSelector('#selectorAdsMood', (val) => state.imageGen.productAds.mood = val);
    bindPillSelector('#selectorAdsRatio', (val) => state.imageGen.productAds.aspectRatio = val);
    bindPillSelector('#selectorAdsVariations', (val) => state.imageGen.productAds.variations = parseInt(val));
    bindPillSelector('#selectorCharCount', (val) => {
        state.imageGen.character.count = Math.max(1, Math.min(5, parseInt(val, 10) || 1));
        renderCharSlots();
    });
    bindPillSelector('#selectorPosterDesignType', (val) => {
        state.imageGen.poster.designType = val;
        if (typeof updatePosterDesignTypeSection === 'function') updatePosterDesignTypeSection();
    });
    bindPillSelector('#selectorPosterPlatform', (val) => state.imageGen.poster.platform = val);
    bindPillSelector('#selectorPosterStyle', (val) => {
        state.imageGen.poster.style = val;
        if (typeof updatePosterStyleSection === 'function') updatePosterStyleSection();
    });
    bindPillSelector('#selectorPosterRatio', (val) => state.imageGen.poster.aspectRatio = val);
    bindPillSelector('#selectorPosterVariations', (val) => state.imageGen.poster.variations = parseInt(val));
    bindPillSelector('#selectorVoiceLanguage', (val) => state.voiceOver.language = val);
    bindPillSelector('#selectorVoiceStyle', (val) => state.voiceOver.style = val);
    bindPillSelector('#selectorVoiceTempo', (val) => {
        state.voiceOver.tempo = val;
        applyVoicePlaybackSettings();
    });
    bindPillSelector('#selectorVoiceDuration', (val) => {
        state.voiceOver.duration = val;
        if (typeof updateVoiceDurationSection === 'function') updateVoiceDurationSection();
    });
    bindPillSelector('#selectorAutoAdsPlatform', (val) => state.imageGen.autoAds.platform = val);
    bindPillSelector('#selectorAutoAdsDuration', (val) => state.imageGen.autoAds.duration = val);

    document.getElementById('promptInput').addEventListener('input', (e) => state.story = e.target.value);
    document.getElementById('selectAudioMode').addEventListener('change', (e) => {
        state.audioMode = e.target.value;
        updateSummaryPill();
    });
    document.getElementById('selectLanguage').addEventListener('change', (e) => {
        state.language = e.target.value;
        updateSummaryPill();
    });
    document.getElementById('selectAnimationStyle')?.addEventListener('change', (e) => {
        state.animationStyle = e.target.value;
        if (state.storyboardMode === 'animation') state.visualStyle = e.target.value;
        syncAnimationCustomStyleUI();
        updateSummaryPill();
    });
    document.getElementById('selectAnimationGenre')?.addEventListener('change', (e) => {
        state.animationGenre = e.target.value;
        updateSummaryPill();
    });
    document.getElementById('inputAnimationCustomStyle')?.addEventListener('input', (e) => {
        state.animationCustomStyle = e.target.value;
        updateSummaryPill();
    });
    document.getElementById('fotoSubject').addEventListener('input', (e) => state.imageGen.foto.subject = e.target.value);
    document.getElementById('fotoNegative').addEventListener('input', (e) => state.imageGen.foto.negativePrompt = e.target.value);
    document.getElementById('thumbTitle').addEventListener('input', (e) => state.imageGen.thumbnail.title = e.target.value);
    document.getElementById('thumbHeadline').addEventListener('input', (e) => state.imageGen.thumbnail.headline = e.target.value);
    document.getElementById('infoTitle').addEventListener('input', (e) => state.imageGen.infographic.title = e.target.value);
    document.getElementById('infoContent').addEventListener('input', (e) => state.imageGen.infographic.content = e.target.value);
    document.getElementById('adsProductName').addEventListener('input', (e) => state.imageGen.productAds.productName = e.target.value);
    document.getElementById('adsProductDescription').addEventListener('input', (e) => state.imageGen.productAds.productDescription = e.target.value);
    document.getElementById('adsGender').addEventListener('input', (e) => state.imageGen.productAds.gender = e.target.value);
    document.getElementById('adsAgeRange').addEventListener('input', (e) => state.imageGen.productAds.ageRange = e.target.value);
    document.getElementById('adsAppearance').addEventListener('input', (e) => state.imageGen.productAds.appearance = e.target.value);
    document.getElementById('adsPose').addEventListener('input', (e) => state.imageGen.productAds.pose = e.target.value);
    document.getElementById('adsWardrobe').addEventListener('input', (e) => state.imageGen.productAds.wardrobe = e.target.value);
    document.getElementById('adsEnvironment').addEventListener('input', (e) => state.imageGen.productAds.environment = e.target.value);
    document.getElementById('adsNegative').addEventListener('input', (e) => state.imageGen.productAds.negativePrompt = e.target.value);

    document.getElementById('posterMessage').addEventListener('input', (e) => state.imageGen.poster.mainMessage = e.target.value);
    document.getElementById('posterCustomDesignType').addEventListener('input', (e) => state.imageGen.poster.customDesignType = e.target.value);
    document.getElementById('posterCustomStyle').addEventListener('input', (e) => state.imageGen.poster.customStyle = e.target.value);
    document.getElementById('posterDetails').addEventListener('input', (e) => state.imageGen.poster.details = e.target.value);
    document.getElementById('voiceScript').addEventListener('input', (e) => state.voiceOver.script = e.target.value);
    document.getElementById('voiceCustomDuration').addEventListener('input', (e) => state.voiceOver.customDuration = parseInt(e.target.value) || 30);
    document.getElementById('adsProductNameInput')?.addEventListener('input', (e) => state.autoAds.productName = e.target.value);
    document.getElementById('adsBenefits')?.addEventListener('input', (e) => state.autoAds.benefits = e.target.value);
    document.getElementById('adsTargetAudience')?.addEventListener('input', (e) => state.autoAds.audience = e.target.value);
    const voiceSelect = document.getElementById('selectorVoice');
    if (voiceSelect) {
        voiceSelect.addEventListener('change', (e) => { state.voiceOver.voice = e.target.value; });
    }

    setPillValue('#selectorScenes', state.sceneCount, 'sceneCount');
    setPillValue('#selectorFrames', state.shotsPerScene, 'shotsPerScene');
    setPillValue('#selectorDuration', state.durationPerScene, 'durationPerScene');
    setPillValue('#selectorRatio', state.aspectRatio, 'aspectRatio');
    setPillValue('#selectorEpisodes', state.episodeCount, 'episodeCount');
    const audioSelect = document.getElementById('selectAudioMode');
    if (audioSelect) audioSelect.value = state.audioMode;
    const languageSelect = document.getElementById('selectLanguage');
    if (languageSelect) languageSelect.value = state.language;
    const animationStyleSelect = document.getElementById('selectAnimationStyle');
    if (animationStyleSelect) animationStyleSelect.value = state.animationStyle;
    const animationGenreSelect = document.getElementById('selectAnimationGenre');
    if (animationGenreSelect) animationGenreSelect.value = state.animationGenre;
    applyStoryboardModeStyleDefaults(state.storyboardMode);
    syncAnimationCustomStyleUI();
    setPillValue('#selectorFotoStyle', state.imageGen.foto.style, 'imageGen.foto.style');
    setPillValue('#selectorFotoLighting', state.imageGen.foto.lighting, 'imageGen.foto.lighting');
    setPillValue('#selectorFotoMood', state.imageGen.foto.mood, 'imageGen.foto.mood');
    setPillValue('#selectorFotoRatio', state.imageGen.foto.aspectRatio, 'imageGen.foto.aspectRatio');
    setPillValue('#selectorFotoVariations', state.imageGen.foto.variations, 'imageGen.foto.variations');
    setPillValue('#selectorThumbPlatform', state.imageGen.thumbnail.platform, 'imageGen.thumbnail.platform');
    setPillValue('#selectorThumbStyle', state.imageGen.thumbnail.style, 'imageGen.thumbnail.style');
    setPillValue('#selectorThumbMood', state.imageGen.thumbnail.mood, 'imageGen.thumbnail.mood');
    setPillValue('#selectorThumbRatio', state.imageGen.thumbnail.aspectRatio, 'imageGen.thumbnail.aspectRatio');
    setPillValue('#selectorThumbVariations', state.imageGen.thumbnail.variations, 'imageGen.thumbnail.variations');
    setPillValue('#selectorInfoType', state.imageGen.infographic.type, 'imageGen.infographic.type');
    setPillValue('#selectorInfoStyle', state.imageGen.infographic.style, 'imageGen.infographic.style');
    setPillValue('#selectorInfoColor', state.imageGen.infographic.colorTheme, 'imageGen.infographic.colorTheme');
    setPillValue('#selectorInfoRatio', state.imageGen.infographic.aspectRatio, 'imageGen.infographic.aspectRatio');
    setPillValue('#selectorInfoVariations', state.imageGen.infographic.variations, 'imageGen.infographic.variations');
    setPillValue('#selectorAdsMode', state.imageGen.productAds.mode, 'imageGen.productAds.mode');
    setPillValue('#selectorAdsScene', state.imageGen.productAds.scene, 'imageGen.productAds.scene');
    setPillValue('#selectorAdsUGCType', state.imageGen.productAds.ugcType, 'imageGen.productAds.ugcType');
    setPillValue('#selectorAdsStyle', state.imageGen.productAds.style, 'imageGen.productAds.style');
    setPillValue('#selectorAdsMood', state.imageGen.productAds.mood, 'imageGen.productAds.mood');
    setPillValue('#selectorAdsRatio', state.imageGen.productAds.aspectRatio, 'imageGen.productAds.aspectRatio');
    setPillValue('#selectorAdsVariations', state.imageGen.productAds.variations, 'imageGen.productAds.variations');
    setPillValue('#selectorCharCount', String(state.imageGen.character.count || 1), 'imageGen.character.count');
    renderCharSlots();
    setPillValue('#selectorPosterDesignType', state.imageGen.poster.designType, 'imageGen.poster.designType');
    setPillValue('#selectorPosterPlatform', state.imageGen.poster.platform, 'imageGen.poster.platform');
    setPillValue('#selectorPosterStyle', state.imageGen.poster.style, 'imageGen.poster.style');
    setPillValue('#selectorPosterRatio', state.imageGen.poster.aspectRatio, 'imageGen.poster.aspectRatio');
    setPillValue('#selectorPosterVariations', state.imageGen.poster.variations, 'imageGen.poster.variations');
    setPillValue('#selectorVoiceLanguage', state.voiceOver.language, 'voiceOver.language');
    setPillValue('#selectorVoiceStyle', state.voiceOver.style, 'voiceOver.style');
    setPillValue('#selectorVoiceTempo', state.voiceOver.tempo, 'voiceOver.tempo');
    setPillValue('#selectorVoiceDuration', state.voiceOver.duration, 'voiceOver.duration');
    setPillValue('#selectorAutoAdsPlatform', state.imageGen.autoAds.platform, 'imageGen.autoAds.platform');
    setPillValue('#selectorAutoAdsDuration', state.imageGen.autoAds.duration, 'imageGen.autoAds.duration');
    const vs = document.getElementById('selectorVoice');
    if (vs) {
        const opts = Array.from(vs.options || []);
        if (opts.some(o => o.value === state.voiceOver.voice)) vs.value = state.voiceOver.voice;
    }

    if (typeof updateAdsModeSections === 'function') updateAdsModeSections();
    if (typeof renderCharSlots === 'function') renderCharSlots();
    if (typeof updatePosterDesignTypeSection === 'function') updatePosterDesignTypeSection();
    if (typeof updatePosterStyleSection === 'function') updatePosterStyleSection();
    if (typeof updateVoiceDurationSection === 'function') updateVoiceDurationSection();
}

function bindPillSelector(containerSelector, onSelect) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.className = 'flex-1 py-1.5 text-xs rounded-lg text-gray-400 hover:text-white transition');
            btn.className = 'flex-1 py-1.5 text-xs rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md transition transform scale-[1.02]';
            const val = btn.getAttribute('data-val');
            onSelect(val);
            updateSummaryPill();
        });
    });
}

function parseUserAnimationStyles(raw) {
    return String(raw || '')
        .split(/\n+|[,;+|]+|\s+dan\s+|\s+and\s+/i)
        .map(part => part.replace(/^[\s\-•*]+/, '').trim())
        .filter(Boolean)
        .slice(0, 8);
}

function resolveAnimationStyleName(config) {
    const cfg = config || state;
    if (String(cfg.animationStyle || '') === 'Custom Style') {
        const listed = parseUserAnimationStyles(cfg.animationCustomStyle);
        return listed.join(' + ') || 'Custom animation style specified by user';
    }
    return String(cfg.animationStyle || 'Auto Director Animation');
}

function isDioramaAnimationStyle(config) {
    if (!config || config.storyboardMode !== 'animation') return false;
    const style = config.animationStyle === 'Custom Style'
        ? parseUserAnimationStyles(config.animationCustomStyle).join(' ')
        : resolveAnimationStyleName(config);
    return /diorama|mini\s*world|miniatur|tiny\s*world|dunia\s*miniatur/i.test(style);
}

function syncAnimationCustomStyleUI() {
    const wrap = document.getElementById('animationCustomStyleWrap');
    const input = document.getElementById('inputAnimationCustomStyle');
    const show = state.storyboardMode === 'animation' && state.animationStyle === 'Custom Style';
    if (wrap) wrap.classList.toggle('hidden', !show);
    if (input && input.value !== (state.animationCustomStyle || '')) input.value = state.animationCustomStyle || '';
}

function updateSummaryPill() {
    const epBit = state.episodeCount > 1 ? (state.episodeCount + ' Episode • ') : '';
    const animBit = state.storyboardMode === 'animation'
        ? (' • ' + (state.animationStyle === 'Custom Style'
            ? (parseUserAnimationStyles(state.animationCustomStyle).join(' + ') || 'Custom Style')
            : (state.animationStyle || 'Animasi')))
        : '';
    const pillText = `${epBit}${state.sceneCount} Adegan • ${state.shotsPerScene} Shot • ${state.durationPerScene} • ${state.audioMode.split(' (')[0]} • ${state.language}${animBit}`;
    const pillEl = document.getElementById('summaryPillText');
    if (pillEl) pillEl.textContent = pillText;
    const createSpan = document.querySelector('#btnCreateStoryboard span');
    if (createSpan) createSpan.textContent = state.episodeCount > 1 ? 'CREATE EPISODE 1' : 'CREATE STORYBOARD';
}

/* ----------------------------------------------------------------- */
/* MULTIMODAL REFERENCE UPLOAD HANDLERS                              */
/* ----------------------------------------------------------------- */
function triggerUpload(inputId) {
    document.getElementById(inputId).click();
}

function showCanvasNotice(message, tone = 'warning') {
    const colors = tone === 'error'
        ? ['bg-red-950/95', 'border-red-400/50', 'text-red-100']
        : ['bg-amber-950/95', 'border-amber-400/50', 'text-amber-100'];
    let notice = document.getElementById('canvasNotice');
    if (!notice) {
        notice = document.createElement('div');
        notice.id = 'canvasNotice';
        notice.setAttribute('role', 'alert');
        notice.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-[10000] max-w-[min(92vw,520px)] px-5 py-3 rounded-xl border shadow-2xl text-sm font-bold text-center transition-opacity duration-200';
        document.body.appendChild(notice);
    }
    notice.classList.remove('bg-red-950/95', 'border-red-400/50', 'text-red-100', 'bg-amber-950/95', 'border-amber-400/50', 'text-amber-100');
    notice.classList.add(...colors);
    notice.textContent = message;
    notice.classList.remove('opacity-0', 'pointer-events-none');
    notice.style.cursor = tone === 'error' ? 'pointer' : '';
    notice.title = tone === 'error' ? 'Klik untuk menutup' : '';
    notice.onclick = () => {
        notice.classList.add('opacity-0', 'pointer-events-none');
        clearTimeout(notice.hideTimer);
    };
    clearTimeout(notice.hideTimer);
    notice.hideTimer = setTimeout(() => {
        notice.classList.add('opacity-0', 'pointer-events-none');
    }, tone === 'error' ? 14000 : 5000);
}

function isDialogueFailureMessage(message) {
    return /dialog|audio|spoken|speaker|turn|cta|over_duration_word_budget|two_active_people_need_real_back_and_forth|missing_two_way_turns|blank_audio|generic_or_template_audio/i.test(String(message || ''));
}

function getDialogueRecoveryMessage(sceneNumber, repairFailed = false) {
    const prefix = sceneNumber ? 'Dialog adegan ' + sceneNumber + ' ' : 'Dialog ';
    return repairFailed
        ? prefix + 'terdeteksi kurang maksimal dan belum berhasil diperbaiki otomatis. Silakan perbaiki dialog secara manual, lalu tekan "Simpan Dialog".'
        : prefix + 'terdeteksi kurang maksimal. Kamu bisa menekan "Regenerate" untuk memperbaikinya.';
}

function getUserFacingStoryboardError(error, sceneNumber) {
    const message = error && error.message ? error.message : '';
    return isDialogueFailureMessage(message)
        ? getDialogueRecoveryMessage(sceneNumber, true)
        : message || 'Terjadi kesalahan saat membuat storyboard.';
}

function showStoryboardRunNotice(message) {
    const el = document.getElementById('storyboardRunNotice');
    if (!el) return;
    el.textContent = message || '';
    el.classList.toggle('hidden', !message);
}

function hideStoryboardRunNotice() {
    showStoryboardRunNotice('');
}

const STORYBOARD_REF_CATS = ['characterReference', 'productReference', 'locationReference'];
const STORYBOARD_REF_MAX_PER_CAT = 7;
const STORYBOARD_REF_MAX_TOTAL = 21;
const CHARACTER_REF_MAX = 4;
const REF_ROLE_LABEL = {
    characterReference: 'Lock wajah, tubuh, rambut, pakaian karakter agar konsisten di setiap scene.',
    productReference: 'Lock bentuk, warna, logo, ukuran, material produk agar tidak drift.',
    locationReference: 'Lock arsitektur, pencahayaan, dan latar lokasi agar feel-nya konsisten.'
};

function storyboardRefCount() {
    return STORYBOARD_REF_CATS.reduce((n, c) => n + ((state[c] && state[c].length) || 0), 0);
}

function storyboardRefCountByCat(cat) {
    return (state[cat] && state[cat].length) || 0;
}

function updateStoryboardRefQuota() {
    if (Array.isArray(state.characterReference) && state.characterReference.length > CHARACTER_REF_MAX) {
        state.characterReference = state.characterReference.slice(0, CHARACTER_REF_MAX);
    }
    const counts = STORYBOARD_REF_CATS.map(c => storyboardRefCountByCat(c));
    const el = document.getElementById('storyboardRefQuota');
    if (el) {
        const total = counts.reduce((a, b) => a + b, 0);
        el.textContent = 'Referensi: ' + total + ' / ' + STORYBOARD_REF_MAX_TOTAL + ' foto · karakter ' + counts[0] + '/' + CHARACTER_REF_MAX + ', produk ' + counts[1] + '/7, lokasi ' + counts[2] + '/7';
    }
    STORYBOARD_REF_CATS.forEach(cat => {
        const badge = document.getElementById(refBadgeIdFor(cat));
        if (badge) {
            const c = storyboardRefCountByCat(cat);
            badge.textContent = c + '/' + STORYBOARD_REF_MAX_PER_CAT;
            badge.classList.toggle('opacity-50', c === 0);
        }
    });
}

function refBadgeIdFor(category) {
    const map = { characterReference: 'badgeCharRef', productReference: 'badgeProductRef', locationReference: 'badgeLocRef' };
    return map[category] || '';
}

function compressRefImage(dataUrl) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            const sourceSizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);
            let maxEdge = 1280;
            let quality = 0.82;
            if (sourceSizeKB > 4000) { maxEdge = 1024; quality = 0.72; }
            else if (sourceSizeKB > 2000) { maxEdge = 1152; quality = 0.78; }
            let w = img.width, h = img.height;
            if (w > maxEdge || h > maxEdge) {
                if (w > h) { h = Math.round(h * maxEdge / w); w = maxEdge; }
                else { w = Math.round(w * maxEdge / h); h = maxEdge; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve({ dataUrl: compressed, sourceSizeKB: sourceSizeKB, maxEdge: maxEdge, quality: quality, outputSizeKB: Math.round((compressed.length * 3) / 4 / 1024) });
        };
        img.onerror = () => resolve({ dataUrl: dataUrl, sourceSizeKB: Math.round((dataUrl.length * 3) / 4 / 1024), maxEdge: 0, quality: 0, outputSizeKB: Math.round((dataUrl.length * 3) / 4 / 1024) });
        img.src = dataUrl;
    });
}

function handleFileSelect(input, category) {
    const files = Array.from(input.files || []);
    input.value = '';
    if (!files.length) return;
    const isSb = STORYBOARD_REF_CATS.indexOf(category) !== -1;
    const categoryLimit = category === 'characterReference' ? CHARACTER_REF_MAX : STORYBOARD_REF_MAX_PER_CAT;
    if (isSb) {
        const perCatRoom = Math.max(0, categoryLimit - storyboardRefCountByCat(category));
        const totalRoom = Math.max(0, STORYBOARD_REF_MAX_TOTAL - storyboardRefCount());
        const room = Math.min(perCatRoom, totalRoom);
        if (room <= 0) {
            const reason = perCatRoom <= 0 ? ('Kategori ini sudah penuh (' + categoryLimit + ' foto).') : ('Total referensi sudah penuh (' + STORYBOARD_REF_MAX_TOTAL + ' foto).');
            alert(reason);
            return;
        }
        if (files.length > room) alert('Hanya ' + room + ' foto ditambah — batas ' + (perCatRoom <= 0 ? categoryLimit + '/kategori' : STORYBOARD_REF_MAX_TOTAL + ' total') + '.');
        files.splice(room);
    }
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            let dataUrl = e.target.result;
            let compressed = false;
            if (isSb) {
                if (storyboardRefCountByCat(category) >= categoryLimit) return;
                if (storyboardRefCount() >= STORYBOARD_REF_MAX_TOTAL) return;
                const result = await compressRefImage(dataUrl);
                dataUrl = result.dataUrl;
                compressed = result.sourceSizeKB > result.outputSizeKB + 10;
            }
            if (!state[category]) state[category] = [];
            state[category].push({ name: file.name, dataUrl: dataUrl, compressed: compressed });
            updateRefCardUI(category);
            if (isSb) updateStoryboardRefQuota();
        };
        reader.readAsDataURL(file);
    });
}

function removeRefFile(category, index) {
    state[category].splice(index, 1);
    if (category === 'productReference' && (!state.productReference || !state.productReference.length)) resetProductLock();
    updateRefCardUI(category);
    if (STORYBOARD_REF_CATS.indexOf(category) !== -1) updateStoryboardRefQuota();
}

function updateRefCardUI(category) {
    let badgeId, previewId, colorClass;
    if (category === 'characterReference') { badgeId = 'badgeCharRef'; previewId = 'previewCharRef'; colorClass = 'border-pink-500/30'; }
    else if (category === 'productReference') { badgeId = 'badgeProductRef'; previewId = 'previewProductRef'; colorClass = 'border-amber-500/30'; }
    else if (category === 'locationReference') { badgeId = 'badgeLocRef'; previewId = 'previewLocRef'; colorClass = 'border-cyan-500/30'; }
    else if (category === 'fotoReference') { badgeId = 'badgeFotoRef'; previewId = 'previewFotoRef'; colorClass = 'border-pink-500/30'; }
    else if (category === 'thumbnailSubjectReference') { badgeId = 'badgeThumbSubjectRef'; previewId = 'previewThumbSubjectRef'; colorClass = 'border-rose-500/30'; }
    else if (category === 'thumbnailProductReference') { badgeId = 'badgeThumbProductRef'; previewId = 'previewThumbProductRef'; colorClass = 'border-amber-500/30'; }
    else if (category === 'thumbnailStyleReference') { badgeId = 'badgeThumbStyleRef'; previewId = 'previewThumbStyleRef'; colorClass = 'border-violet-500/30'; }
    else if (category === 'infoReference') { badgeId = 'badgeInfoRef'; previewId = 'previewInfoRef'; colorClass = 'border-blue-500/30'; }
    else if (category === 'productAdsProductReference') { badgeId = 'badgeAdsProductRef'; previewId = 'previewAdsProductRef'; colorClass = 'border-amber-500/30'; }
    else if (category === 'productAdsModelReference') { badgeId = 'badgeAdsModelRef'; previewId = 'previewAdsModelRef'; colorClass = 'border-rose-500/30'; }
    else if (category === 'productAdsStyleReference') { badgeId = 'badgeAdsStyleRef'; previewId = 'previewAdsStyleRef'; colorClass = 'border-violet-500/30'; }
    else if (category === 'characterSheetReference') { badgeId = 'badgeCharacterSheetRef'; previewId = 'previewCharacterSheetRef'; colorClass = 'border-fuchsia-500/30'; }
    else if (category === 'posterReference') { badgeId = 'badgePosterRef'; previewId = 'previewPosterRef'; colorClass = 'border-rose-500/30'; }
    else if (category === 'posterStyleReference') { badgeId = 'badgePosterStyleRef'; previewId = 'previewPosterStyleRef'; colorClass = 'border-violet-500/30'; }
    else { return; }

    const badge = document.getElementById(badgeId);
    const container = document.getElementById(previewId);
    if (!badge || !container) return;
    const list = state[category] || [];

    badge.textContent = list.length;
    container.innerHTML = list.map((item, idx) => `
        <div class="relative w-12 h-12 rounded-lg overflow-hidden border ${colorClass} group ring-1 ring-black/50 shadow-sm">
            <img src="${item.dataUrl}" class="w-full h-full object-cover">
            <button onclick="removeRefFile('${category}', ${idx})" class="absolute inset-0 bg-black/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition backdrop-blur-sm"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `).join('');
}

function safeExternalUrl(value) {
    try {
        const url = new URL(value || '');
        return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';
    } catch (e) {
        return '#';
    }
}

async function fetchWithTimeout(url, options, timeoutMs = 30000) {
    const controller = new AbortController();
    const parent = options && options.signal;
    const onParentAbort = () => controller.abort();
    if (parent) {
        if (parent.aborted) controller.abort();
        else parent.addEventListener('abort', onParentAbort);
    }
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const opts = Object.assign({}, options || {}, { signal: controller.signal });
        return await fetch(url, opts);
    } finally {
        clearTimeout(timer);
        if (parent) parent.removeEventListener('abort', onParentAbort);
    }
}

async function fetchWithExponentialBackoff(url, options, maxRetries = 3, timeoutMs) {
    let delay = 1000;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (options && options.signal && storyboardCancelled) {
            const e = new Error('CANCELLED');
            e.code = 'CANCELLED';
            throw e;
        }
        try {
            const response = await fetchWithTimeout(url, options, timeoutMs || 30000);
            if (response.ok) return response;
            if ([400, 401, 403, 404].includes(response.status)) {
                const body = await response.text().catch(() => '');
                let msg = "Gemini request rejected (" + response.status + ")";
                try {
                    const parsed = JSON.parse(body);
                    if (parsed && parsed.error && parsed.error.message) msg += ": " + parsed.error.message;
                } catch (_) {
                    if (body) msg += ": " + body.slice(0, 150);
                }
                const error = new Error(msg);
                error.status = response.status;
                error.permanent = true;
                throw error;
            }
            if (response.status === 429 || response.status >= 500) {
                const body = await response.text().catch(() => '');
                throw new Error(`Gemini API error (${response.status})${body ? `: ${body.slice(0, 240)}` : ''}`);
            }
            if (attempt === maxRetries - 1) {
                const body = await response.text().catch(() => '');
                throw new Error(`Gemini API error (${response.status})${body ? `: ${body.slice(0, 240)}` : ''}`);
            }
        } catch (err) {
            if (err.permanent) throw err;
            if (err.code === 'CANCELLED' || storyboardCancelled) {
                const e = new Error('CANCELLED');
                e.code = 'CANCELLED';
                throw e;
            }
            if (err.name === 'AbortError') {
                if (storyboardCancelled) {
                    const e = new Error('CANCELLED');
                    e.code = 'CANCELLED';
                    throw e;
                }
                throw new Error('Request timeout after ' + (delay * 2) + 'ms.');
            }
            if (attempt === maxRetries - 1) throw err;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
    }
    throw new Error('Gemini request failed.');
}

/* ----------------------------------------------------------------- */
/* DIRECTOR ENGINE & GENERATION PIPELINE                             */
/* ----------------------------------------------------------------- */

const funnyTexts = [
    "TRENDORA lagi nyalain otak premium...",
    "Lagi fokus, jangan ganggu ya! 🎬",
    "Mikirin angle kamera yang kece...",
    "Ngomong sama Gemini biar bantuin...",
    "Studi scene dulu, baru action!",
    "Lighting check... camera ready... 🎥",
    "Karakter udah mulai ngomong sendiri...",
    "Cerita mau dibawa kemana ya...",
    "Momen bagus! Jangan sampai ilang!",
    "TRENDORA lagi jatuh cinta sama naskah ini...",
    "Setuju, ini emang gonna be epic!",
    "Tambahin sedikit drama biar meledak...",
    "AI lagi mode max effort nih...",
    "Ini naskah bakal jadi legend...",
    "Almost there... kita hampir selesai...",
    "Final check... this is gonna be good!",
];
let funnyIdx = 0;
let funnyInterval = null;
let loadingPercentage = 0;
let loadingPercentageInterval = null;
let loadingPercentageCeiling = 19;
let loadingHeartbeatTick = 0;
let scenePercentage = 0;
let scenePercentageInterval = null;
let scenePercentageCeiling = 19;

// ============================================================
// STAGE-BASED NARRATIVE LOADING ENGINE
// ============================================================
// Replaces the old single-target tick with named stages, each
// carrying a target percent, a status label, and a rotation of
// substep messages that play while the auto-tick is running.
// This way the bar keeps moving AND the text keeps updating
// during long waits (e.g. AI blueprint generation), instead of
// jumping from 50% to 100% with no in-between motion.
const LOADING_STAGES = {
    detect:   { order: 1, target: 14,  label: 'Mendeteksi genre & menganalisa brief',
                substeps: ['Membaca cerita dari pengguna...', 'Mencocokkan pola naskah dengan gaya yang tepat...'] },
    analyze:  { order: 2, target: 28,  label: 'Menganalisa referensi visual',
                substeps: ['Mengamati foto produk & karakter...', 'Mengekstrak detail visual penting...'] },
    blueprint:{ order: 3, target: 52,  label: 'Menyusun blueprint adegan',
                substeps: ['Merancang fungsi tiap adegan...', 'Membagi beat cerita per scene...', 'Menyusun shot timeline & kamera...'] },
    dialogue: { order: 4, target: 78,  label: 'Menulis dialog & voice direction',
                substeps: ['Menulis dialog natural per karakter...', 'Memvalidasi konsistensi speaker...', 'Memperbaiki pelanggaran secara bertahap...'] },
    quality:  { order: 5, target: 92,  label: 'Quality gate & validasi silang',
                substeps: ['Memeriksa kontinuitas visual & audio...', 'Menyusun shot timeline final...', 'Mengunci style, cast, dan continuity...'] },
    finalize: { order: 6, target: 99,  label: 'Menyusun hasil akhir',
                substeps: ['Merakit prompt gambar & video...', 'Menyimpan ke history...'] }
};

let loadingStageOrder = 0;
let loadingSubstepIdx = 0;
let loadingActiveSubsteps = [];
let loadingSubstepInterval = null;
let loadingLastBeatAt = 0;
let loadingStageEnteredAt = 0;
let loadingDisplayPercent = 0;
let loadingTargetPercent = 0;

function loadingEasing(percent) {
    // Identity easing. The "fast at start, slow at end" feel comes
    // from the step-size formula in startLoadingEngine (large step
    // when far from target, small step when close). Applying a
    // easeOutCubic curve on top of the displayed value made low
    // percentages inflate wildly (10% -> 27.1%, 50% -> 87.5%),
    // which made the bar appear to jump to ~100% as soon as we
    // hit the 'dialogue' stage. Keep this function as an identity
    // so the displayed number always matches the actual progress.
    return Math.max(0, Math.min(100, Number(percent) || 0));
}

function refreshLoadingSubsteps(stage) {
    if (!stage) {
        loadingActiveSubsteps = [];
        return;
    }
    loadingActiveSubsteps = (stage.substeps || []).slice();
}

function applyLoadingPercent(value) {
    const safe = Math.max(0, Math.min(100, Number(value) || 0));
    loadingPercentage = safe;
    const eased = loadingEasing(safe);
    loadingDisplayPercent = eased;
    const percentageEl = document.getElementById('loadingPercentage');
    const progressEl = document.querySelector('#loadingView .cinematic-progress-fill');
    const text = eased.toFixed(1) + '%';
    if (percentageEl) percentageEl.textContent = text;
    if (progressEl) {
        progressEl.style.width = eased + '%';
        progressEl.style.animation = 'none';
    }
}

function setLoadingStatusText(text) {
    const statusEl = document.getElementById('loadingStatusText');
    if (!statusEl) return;
    statusEl.style.opacity = '0';
    const next = String(text || '');
    setTimeout(() => {
        const el = document.getElementById('loadingStatusText');
        if (!el) return;
        if (document.getElementById('loadingView') && document.getElementById('loadingView').classList.contains('hidden')) return;
        el.textContent = next;
        el.style.opacity = '1';
    }, 220);
}

function setLoadingStageDots(currentOrder) {
    const stages = Object.values(LOADING_STAGES).sort((a, b) => a.order - b.order);
    const total = stages.length;
    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById('stageDot' + i);
        if (!dot) continue;
        const fillRatio = (currentOrder - 1) / Math.max(1, total - 1);
        const dotThreshold = fillRatio * 4;
        if (i <= Math.round(dotThreshold) || (i === 1 && currentOrder >= 1)) {
            dot.className = 'loading-stage-dot w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)] transition-all duration-500';
        } else {
            dot.className = 'loading-stage-dot w-2.5 h-2.5 rounded-full bg-purple-500/40 transition-all duration-500';
        }
    }
}

function advanceLoadingStage(stageKey, opts) {
    const stage = LOADING_STAGES[stageKey];
    if (!stage) return;
    const isFirstEnter = loadingStageOrder < stage.order;
    loadingStageOrder = Math.max(loadingStageOrder, stage.order);
    if (isFirstEnter) {
        loadingStageEnteredAt = Date.now();
        refreshLoadingSubsteps(stage);
        loadingSubstepIdx = 0;
    } else {
        refreshLoadingSubsteps(stage);
    }
    const overrideLabel = opts && typeof opts.labelOverride === 'string' ? opts.labelOverride : null;
    const overrideSubstep = opts && typeof opts.substepOverride === 'string' ? opts.substepOverride : null;
    const stageLabel = overrideLabel || stage.label;
    const stageSubsteps = loadingActiveSubsteps.slice();
    if (overrideSubstep) {
        stageSubsteps.unshift(overrideSubstep);
    }
    const displaySubstep = stageSubsteps[Math.min(loadingSubstepIdx, stageSubsteps.length - 1)] || stageLabel;
    setLoadingStatusText(displaySubstep);
    // Smoothly raise the target percent; never snap backward.
    const newTarget = Math.max(loadingTargetPercent, stage.target);
    loadingTargetPercent = newTarget;
    // Always nudge the percent at least to the floor of the new target minus 1,
    // so even an instant stage change feels like progress, not a teleport.
    const floor = Math.max(loadingDisplayPercent, stage.target - 4);
    if (floor > loadingPercentage) applyLoadingPercent(floor);
    setLoadingStageDots(loadingStageOrder);
    loadingLastBeatAt = Date.now();
}

function rotateLoadingSubstep() {
    if (!loadingActiveSubsteps.length) return;
    loadingSubstepIdx = (loadingSubstepIdx + 1) % loadingActiveSubsteps.length;
    const stage = Object.values(LOADING_STAGES).find(s => s.order === loadingStageOrder);
    if (!stage) return;
    const text = loadingActiveSubsteps[loadingSubstepIdx];
    setLoadingStatusText(text);
}

function startLoadingEngine() {
    stopLoadingEngine();
    loadingStageOrder = 0;
    loadingSubstepIdx = 0;
    loadingActiveSubsteps = [];
    loadingLastBeatAt = Date.now();
    loadingStageEnteredAt = Date.now();
    loadingDisplayPercent = 0;
    loadingTargetPercent = 0;
    applyLoadingPercent(0);
    setLoadingStageDots(0);
    loadingPercentageInterval = setInterval(() => {
        loadingHeartbeatTick++;
        const target = loadingTargetPercent || 0;
        const current = loadingPercentage;
        if (current < target) {
            const remaining = target - current;
            // Slow down as we approach the target so the user feels
            // real-time progress, but never freeze at the same value
            // while waiting for the next stage.
            const sinceLastBeat = Date.now() - loadingLastBeatAt;
            const stuck = sinceLastBeat > 4500 && current < target - 0.4;
            let step;
            if (remaining > 30) step = remaining * 0.045 + 0.25;
            else if (remaining > 10) step = remaining * 0.035 + 0.12;
            else if (remaining > 2) step = remaining * 0.06;
            else step = Math.max(0.18, remaining * 0.45);
            if (stuck) step = Math.max(step, 0.4);
            const next = Math.min(target, current + step);
            applyLoadingPercent(next);
        }
        // Rotate substep text every ~2.2s within the active stage.
        if (loadingHeartbeatTick % 25 === 0) {
            rotateLoadingSubstep();
        }
    }, 90);
}

function stopLoadingEngine() {
    if (loadingPercentageInterval) {
        clearInterval(loadingPercentageInterval);
        loadingPercentageInterval = null;
    }
    if (loadingSubstepInterval) {
        clearInterval(loadingSubstepInterval);
        loadingSubstepInterval = null;
    }
    loadingActiveSubsteps = [];
}

function completeLoadingToHundred() {
    // Smooth final ramp from current percent to 100% instead of teleporting.
    const start = loadingDisplayPercent;
    const startAt = Date.now();
    const duration = 380;
    if (loadingPercentageInterval) {
        clearInterval(loadingPercentageInterval);
        loadingPercentageInterval = null;
    }
    const tick = setInterval(() => {
        const elapsed = Date.now() - startAt;
        const t = Math.max(0, Math.min(1, elapsed / duration));
        const eased = 1 - Math.pow(1 - t, 3);
        const value = start + (100 - start) * eased;
        applyLoadingPercent(value);
        if (t >= 1) {
            clearInterval(tick);
            applyLoadingPercent(100);
        }
    }, 30);
}

function setScenePercentage(value) {
    scenePercentage = Math.max(0, Math.min(100, Number(value) || 0));
    const button = document.getElementById('btnGenerateScene_' + sceneGenerationIndex);
    const text = scenePercentage.toFixed(2) + '%';
    if (button && scenePercentage < 100) {
        button.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-1"></i>' + text;
        button.setAttribute('aria-valuenow', String(scenePercentage));
    }
}

function setScenePhase(start, ceiling) {
    scenePercentage = Math.max(scenePercentage, Math.min(100, Number(start) || 0));
    scenePercentageCeiling = Math.max(scenePercentage, Math.min(100, Number(ceiling) || scenePercentage));
    setScenePercentage(scenePercentage);
}

function finishSceneGenerationUI(sceneIdx) {
    setScenePhase(100, 100);
    setScenePercentage(100);
    const loader = document.getElementById('sceneImgLoading_' + sceneIdx);
    if (loader) loader.classList.add('hidden');
    const loadingView = document.getElementById('loadingView');
    if (loadingView) loadingView.classList.add('hidden');
    const resultView = document.getElementById('resultView');
    if (resultView) resultView.classList.remove('hidden');
    const button = document.getElementById('btnGenerateScene_' + sceneIdx);
    if (button) {
        button.innerHTML = '<i class="fa-solid fa-check mr-1"></i>Generated';
        button.classList.add('bg-emerald-500/20', 'text-emerald-100');
        button.setAttribute('aria-valuenow', '100');
    }
    stopFunnyRotator();
}

function setStage(stage) {
    const stageNum = Math.max(0, Math.min(6, Number(stage) || 0));
    const keyByOrder = ['detect', 'analyze', 'blueprint', 'dialogue', 'quality', 'finalize'];
    const stageKey = keyByOrder[Math.max(0, stageNum - 1)];
    if (stageKey && LOADING_STAGES[stageKey]) {
        advanceLoadingStage(stageKey);
        return;
    }
    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById('stageDot' + i);
        if (!dot) continue;
        if (i <= stageNum) {
            dot.className = 'loading-stage-dot w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)] transition-all duration-500';
        } else {
            dot.className = 'loading-stage-dot w-2.5 h-2.5 rounded-full bg-purple-500/40 transition-all duration-500';
        }
    }
}

function updateLoadingStatus(text, stage) {
    if (typeof text === 'string' && text) {
        setLoadingStatusText(text);
    }
    if (stage) {
        setStage(stage);
    }
}

function startFunnyRotator() {
    startLoadingEngine();
    advanceLoadingStage('detect');
}

function stopFunnyRotator() {
    stopLoadingEngine();
    if (scenePercentageInterval) {
        clearInterval(scenePercentageInterval);
        scenePercentageInterval = null;
    }
}

function isPlacePromotion(config) {
    const story = String(config && config.story || '').toLowerCase();
    const mode = String(config && config.storyboardMode || 'custom');
    if (!['commercial', 'custom'].includes(mode)) return false;
    // Require the place to be the object of the promotion, not merely a filming backdrop.
    return /\b(?:promosi(?:kan)?|promo|iklan|jual|menjual|dijual|sewa|menyewakan|disewakan|pasarkan|memasarkan|pemasaran)\b(?:\s+(?:video|sebuah|sebidang|sepetak|unit|ini|untuk|tentang|tempat|usaha|bisnis)){0,4}\s+(?:warung|restoran|rumah\s+makan|kafe|cafe|kedai|bengkel|salon|barbershop|laundry|klinik|gym|studio|hotel|villa|vila|penginapan|homestay|resort|tempat\s+wisata|wisata|toko|ruko|rumah|apartemen|kos|kost|properti|property|sawah|lahan|tanah|kebun|perkebunan|gudang|gedung|kantor|tempat|lokasi)\b/i.test(story)
        || /\b(?:sawah|lahan|tanah|rumah|ruko|apartemen|kebun|properti)\b.{0,45}\b(?:dijual|disewakan)\b/i.test(story);
}

function buildPlacePromotionContract(config) {
    if (!isPlacePromotion(config)) return '';
    return 'PLACE / PROPERTY PROMOTION ? OVERRIDES generic product advertising instructions. The promoted subject is the actual venue, business, building, rice field or land described in the brief, not a portable object. Build attention through relevant real activity, reveal the actual place and supported features, then invite a visit, enquiry, viewing, purchase or rental as requested. Never make the place slide, drop, float, be caught or held, or change scale. Preserve valid scene-specific actions. With one scene include both opening and closing CTA. Preserve every registered character identity. Register the referenced site in masterVisualIdentity.locations with stable locationId and concrete visible architecture, terrain, vegetation, access, layout, colors and signage. Multiple photos may show different views of one site; do not invent separate properties or unseen connecting geography. Photos in Product Ref may depict the promoted site: classify each visually, use site photos as location evidence and genuine goods only as goods. Do not invent a hero product just because Product Ref is populated. Preserve existing readable signs as physical features, never add advertising overlays. Do not invent price, land area, boundaries, ownership, certificates, zoning, yield, investment returns, facilities, opening hours or contact details. Use supplied facts only; visible access does not establish legal access. Address and spelling follow the user. Captions and hashtags must promote this place. No invented facts to fill missing information.';
}

function detectCommercialIntent(storyText) {
    const text = String(storyText || '').toLowerCase();
    return /(\b(?:buat|bikin|jadikan|ubah menjadi)\s+(?:video\s+)?(?:iklan|advertisement|promosi|promo|marketing|komersial)|\b(?:iklan|advertisement|promosi|marketing|komersial|campaign|kampanye|cta|call to action|endorse|branding)\b|\b(?:promosikan|dipromosikan|tingkatkan penjualan|naikkan penjualan|agar orang membeli|ajakan membeli|beli sekarang|order sekarang|pesan sekarang|klik link|link bio)\b|\b(?:jual|jualan|menjual)\s+(?:produk|barang|ini|itu)\b)/i.test(text);
}

function foreignDemographicExceptionRequested(storyText, config) {
    const text = String(storyText || '').toLowerCase();
    if (config && config.characterReference && config.characterReference.length) return true;
    return /\b(?:bule|orang asing|foreigner|foreign|caucasian|barat|western|amerika|american|usa|united states|inggris|british|english|eropa|europe|european|prancis|french|jerman|german|belanda|dutch|australia|australian|jepang|japanese|korea|korean|tiongkok|chinese|china|turki|turkish|india|indian|rusia|russian)\b/i.test(text)
        || /\b(?:di|ke|dari|asal|berasal dari|tinggal di|bertemu dengan|berjumpa dengan|traveling ke|berlibur ke)\b.{0,40}\b(?:luar negeri|amerika|usa|eropa|inggris|london|new york|paris|tokyo|jepang|korea|cina|china|australia|jerman|prancis)\b/i.test(text);
}

function buildLocalDemographicLock(config) {
    if (isCreativeMiniatureBuild(config)) {
        return 'MINIATURE BUILD DEMOGRAPHIC: If human hands are visible, prefer Indonesian/local skin tone. Do not invent a face, full body, or foreign-looking character. Hands-only is correct.';
    }
    if (foreignDemographicExceptionRequested(config && config.story, config)) return 'DEMOGRAPHIC EXCEPTION: The user explicitly requested a foreign setting, nationality, ethnicity, or supplied a character reference. Follow only that explicit request and do not generalize it to unrequested characters.';
    return 'LOCAL DEMOGRAPHIC HARD LOCK — DEFAULT INDONESIAN CONTEXT: Every visible human character, speaking character, model, customer, background extra with a readable face, and newly invented supporting cast must look Indonesian/local to the story setting: Indonesian facial features, local skin tones from sawo matang to dark brown, black or dark-brown hair, and dark-brown eyes. FOREIGNER/BULE/Caucasian/Western-looking/foreign-looking characters are strictly forbidden. Do not invent foreign nationality, ethnicity, accent, appearance, or setting. This rule applies to advertisements and stories alike unless the user explicitly requests a foreign person, nationality, ethnicity, foreign setting, or supplies a reference image. If the prompt is ambiguous, choose Indonesian/local appearance.';
}

function detectGenre(storyText, hasProductRef) {
    const t = (storyText || '').toLowerCase();
    const packs = {
        advertisement: ['iklan', 'promo', 'diskon', 'harga', 'beli sekarang', 'gratis', 'limited', 'offer', 'campaign', 'brand', 'testimoni', 'review', 'best seller', 'hot deal', 'flash sale', 'endorse', 'olshop', 'katalog', 'launching', 'preorder', 'cta'],
        horror: ['horror', 'horor', 'hantu', 'setan', 'pocong', 'kuntilanak', 'seram', 'menyeramkan', 'teror', 'kutukan', 'angker', 'nightmare', 'jeritan', 'kuburan', 'posses'],
        dramatic: ['sedih', 'haru', 'menangis', 'kehilangan', 'patah hati', 'drama', 'cinta', 'romantis', 'love', 'kisah', 'tragis', 'perpisahan', 'kematian', 'meninggal', 'air mata', 'duka', 'nostalgia'],
        comedy: ['komedi', 'lucu', 'kocak', 'parodi', 'humor', 'ngakak', 'gokil', 'prank', 'satire', 'standup'],
        educational: ['edukasi', 'tutorial', 'cara membuat', 'belajar', 'tips', 'how to', 'penjelasan', 'step by step'],
        action: ['action', 'kejar', 'tembak', 'ledak', 'perang', 'fight', 'perkelahian', 'stunt', 'chase'],
        documentary: ['dokumenter', 'documentary', 'observasi', 'realita', 'wawancara', 'fakta'],
        asmr: ['asmr', 'tanpa dialog', 'tanpa suara', 'whisper', 'bisikan', 'berbisik', 'tingles', 'ear to ear', 'personal attention'],
        podcast: ['podcast', 'talkshow', 'talk show'],
        monologue: ['monolog', 'monologue']
    };
    const scores = {};
    let best = 'neutral', bestScore = 0;
    Object.keys(packs).forEach(g => {
        let s = packs[g].filter(k => t.includes(k)).length;
        scores[g] = s;
        if (s > bestScore) { bestScore = s; best = g; }
    });
    if ((scores.asmr || 0) > 0) return 'asmr';
    const ad = scores.advertisement || 0;
    const story = (scores.dramatic || 0) + (scores.horror || 0) + (scores.comedy || 0) + (scores.educational || 0) + (scores.action || 0) + (scores.documentary || 0) + (scores.podcast || 0) + (scores.monologue || 0);
    if (ad > 0 && story > 0) return 'hybrid';
    return bestScore > 0 ? best : 'neutral';
}

function directorCommercialMode(storyText) {
    return detectCommercialIntent(storyText) ? 'explicit' : 'story-only';
}

function isSimpleCommercialBrief(storyText) {
    const text = String(storyText || '').trim();
    if (!detectCommercialIntent(text) || storyRequestedCastCount(text) > 0) return false;
    return !/(\b(?:bersama|dengan|dan)\s+(?:seorang|satu|dua|tiga|orang|pria|wanita|model|karakter|teman|pasangan|customer|pelanggan|pembeli|penjual)\b|\b(?:dua|tiga|empat|lima|2|3|4|5)\s+(?:orang|karakter|model|talent|pemeran|pria|wanita)\b)/i.test(text);
}

function storyRequestsInteractiveCast(storyText) {
    const text = String(storyText || '').toLowerCase();
    return /\b(?:dua|kedua|2)\s+(?:orang|pemeran|karakter|ini)\b.{0,80}\b(?:bertengkar|pertengkaran|berdebat|berdialog|berbicara|saling\s+(?:marah|berbicara|menjawab|merespons))\b|\b(?:suami\s+istri|istri\s+suami|pasangan)\b.{0,80}\b(?:bertengkar|pertengkaran|berdebat|berdialog|berbicara|saling\s+(?:marah|berbicara|menjawab|merespons))\b|\b(?:berkenalan|kenalan|mengobrol|ngobrol|bercakap(?:-cakap)?|berbicara|berdialog|berdebat|bertengkar|pertengkaran|berargumentasi|bernegosiasi|menawar|tawar[- ]?menawar|jual\s+beli|tanya\s+jawab|saling\s+mengenal|saling\s+berbicara|berinteraksi|bertemu|berpamitan|pamitan|mengucapkan\s+selamat\s+tinggal)\b.{0,50}\b(?:dengan|bersama|harga|penjual|pembeli|customer|pelanggan|anak|ibu|istri|wife|suami|husband|ayah|bapak|father|son|pak|bu)\b|\b(?:dengan|bersama)\b.{0,50}\b(?:berkenalan|kenalan|mengobrol|ngobrol|bercakap(?:-cakap)?|berbicara|berdialog|berdebat|bertengkar|pertengkaran|berargumentasi|bernegosiasi|menawar|tawar[- ]?menawar|jual\s+beli|tanya\s+jawab|saling\s+mengenal|saling\s+berbicara|berinteraksi|berpamitan|pamitan|mengucapkan\s+selamat\s+tinggal)\b|\b(?:anak|ibu|istri|wife|suami|husband|ayah|bapak|father|son)\b.{0,20}\b(?:dan|with|versus|vs)\b.{0,20}\b(?:anak|ibu|istri|wife|suami|husband|ayah|bapak|father|son)\b/i.test(text);
}

function dialoguePlanExplicitlyRequiresTwoWay(scene) {
    const plan = scene && scene.dialoguePlan && typeof scene.dialoguePlan === 'object'
        ? scene.dialoguePlan
        : {};
    const mode = String(plan.mode || '').toLowerCase();
    const pattern = String(plan.turnPattern || '').toLowerCase();
    return /\b(?:two-way|interactive|conversation|dialogue|percakapan|dialog)\b/.test(mode)
        || /character_\d+\s*->\s*character_\d+/.test(pattern);
}

function sceneRequestsInteractiveCast(scene, storyText) {
    const sceneText = [
        scene && scene.title,
        scene && scene.storyPurpose,
        scene && scene.sceneBeat,
        scene && scene.dialogueOrNarration,
        scene && scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction,
        scene && scene.dialoguePlan && scene.dialoguePlan.participants,
        scene && scene.dialoguePlan && scene.dialoguePlan.relationship,
        scene && scene.dialoguePlan && scene.dialoguePlan.visualAnchor
    ].filter(Boolean).join(' ');
    const plannedParticipants = scene && scene.dialoguePlan && Array.isArray(scene.dialoguePlan.participants)
        ? scene.dialoguePlan.participants.filter(participant => /^CHARACTER_\d+$/i.test(String(participant)))
        : [];
    const dialoguePlanText = [
        scene && scene.dialoguePlan && scene.dialoguePlan.mode,
        scene && scene.dialoguePlan && scene.dialoguePlan.turnPattern,
        scene && scene.dialoguePlan && scene.dialoguePlan.linePurpose
    ].filter(Boolean).join(' ');
    const planRequiresInteraction = plannedParticipants.length >= 2
        && (dialoguePlanExplicitlyRequiresTwoWay(scene) || /two-way|interactive|conversation|dialogue|percakapan|dialog|CHARACTER_1\s*->\s*CHARACTER_2/i.test(dialoguePlanText));
    if (planRequiresInteraction || storyRequestsInteractiveCast(storyText)) return true;
    const explicitTwoPersonScene = /\b(?:mengobrol|ngobrol|bercakap(?:-cakap)?|berdialog|berdebat|bertengkar|berinteraksi|berbalas|saling\s+(?:menjawab|merespons|menanggapi)|berbeda\s+pendapat|perbedaan\s+pendapat|memanas|menuntut\s+penjelasan|conversation|argue|arguing|confronts?)\b/i.test(sceneText);
    const sceneInteraction = /\b(?:menawar|tawar[- ]?menawar|jual\s+beli|negosiasi|pertengkaran|bertengkar|berdebat|argumentasi|berbalas|saling\s+(?:menjawab|merespons|menanggapi|berbicara)|berbeda\s+pendapat|perbedaan\s+pendapat|memanas|menuntut\s+penjelasan|shouting match|argue|arguing|blocks? the (?:door|doorway)|enters? and blocks?|confronts?)\b/i.test(sceneText);
    const productOnlyLanguage = /\b(?:product[- ]only|product hero|single model|one model|product display|product beauty|beauty shot)\b/i.test([storyText, sceneText].filter(Boolean).join(' '));
    return !productOnlyLanguage && (sceneInteraction || explicitTwoPersonScene);
}

function activeSceneCharacterIds(scene) {
    const participants = scene && scene.dialoguePlan && Array.isArray(scene.dialoguePlan.participants)
        ? scene.dialoguePlan.participants
            .map(participant => String(participant).toUpperCase())
            .filter(participant => /^CHARACTER_[1-4]$/.test(participant))
        : [];
    return [...new Set(participants)];
}

function isSingleCharacterFinalAftermath(scene, breakdown) {
    if (scene && scene._singleCharacterFinalAftermath === true) return true;
    const isFinalScene = breakdown && Array.isArray(breakdown.scenes)
        ? breakdown.scenes.indexOf(scene) === breakdown.scenes.length - 1
        : false;
    if (!isFinalScene) return false;
    const text = [
        scene && scene.title,
        scene && scene.storyPurpose,
        scene && scene.sceneBeat,
        scene && scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction,
        scene && scene.dialoguePlan && scene.dialoguePlan.visualAnchor
    ].filter(Boolean).join(' ');
    return /\b(?:alone|sendirian|closed door|pintu tertutup|empty room|ruangan kosong|left the frame|keluar frame|already left|sudah pergi|menyesal|regret|silence hits|keheningan|stares at the door|menatap pintu)\b/i.test(text)
        && !/\b(?:both|keduanya|together|bersama|two[- ]way|berdua)\b/i.test(text);
}

function dialogueCharacterSpeakers(value) {
    return new Set((normalizeDialogueText(value).match(/\bCHARACTER_(\d+)\s*:/gi) || [])
        .map(label => label.match(/\d+/)[0]));
}

function dialogueTurnLines(value) {
    const text = normalizeDialogueText(value);
    const lines = [];
    const turnPattern = /(?:^|\n)\s*((?:\[[^\]]+\]\s*)?CHARACTER_\d+\s*:\s*)([\s\S]*?)(?=\n\s*(?:\[[^\]]+\]\s*)?CHARACTER_\d+\s*:\s*|$)/gi;
    let match;
    while ((match = turnPattern.exec(text))) lines.push((match[1] + match[2]).trim());
    return lines;
}

function chooseDialogueTurnPlan(scene) {
    const text = [scene && scene.title, scene && scene.storyPurpose, scene && scene.sceneBeat, scene && scene.sceneVisualPlan?.visualAction, scene && scene.dialoguePlan && scene.dialoguePlan.participants].filter(Boolean).join(' ').toLowerCase();
    const participants = (scene && scene.dialoguePlan && Array.isArray(scene.dialoguePlan.participants))
        ? scene.dialoguePlan.participants.filter(id => /^character_\d+$/i.test(String(id)))
        : [];
    // Monologue: only one character registered for this scene → one turn.
    if (participants.length === 1) {
        return { count: 1, pattern: 'CHARACTER_1 only (monologue — no other speaker, do NOT invent CHARACTER_2)' };
    }
    const ending = /\b(?:ending|final|resolution|payoff|goodbye|farewell|leave|leaves|leaving|pergi|meninggalkan|berpamitan|berpisah|sendirian|alone|closing|penutup)\b/i.test(text);
    if (ending) return { count: 2, pattern: 'CHARACTER_1 -> CHARACTER_2' };
    const reverse = /\b(?:challenge|ditantang|dituduh|menolak|menyangkal|confront|konfrontasi|protes|complaint|complain)\b/i.test(text);
    return { count: 3, pattern: reverse ? 'CHARACTER_2 -> CHARACTER_1 -> CHARACTER_2' : 'CHARACTER_1 -> CHARACTER_2 -> CHARACTER_1' };
}

function dialogueSceneFunction(scene) {
    const text = [
        scene && scene.title,
        scene && scene.storyPurpose,
        scene && scene.sceneBeat,
        scene && scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction,
        scene && scene.dialoguePlan && scene.dialoguePlan.dramaticObjective,
        scene && scene.dialoguePlan && scene.dialoguePlan.relationship
    ].filter(Boolean).join(' ').toLowerCase();
    if (/(bertengkar|pertengkar|berdebat|konfrontasi|menuduh|menyalahkan|marah|memanas|argument|fight|argue)/i.test(text)) {
        return { name: 'conflict', rule: 'Use a concrete accusation or demand, then a specific denial, counter-claim, refusal, or consequence. Escalate or change the relationship; do not repeat the same plea.' };
    }
    if (/(dokter|pasien|doctor|patient|periksa|diagnos|keluhan|gejala|clinic|rumah sakit)/i.test(text)) {
        return { name: 'consultation', rule: 'Use a concrete symptom or concern, then a focused question, answer, finding, or next instruction. Do not use generic greetings or narration.' };
    }
    if (/(kenalan|perkenalan|bertemu pertama|first meeting|introduc)/i.test(text)) {
        return { name: 'introduction', rule: 'Reveal a specific identity, intention, or need, then respond with a distinct impression, question, or invitation that moves the meeting forward.' };
    }
    if (/(tawar|negosiasi|harga|jual beli|menawar|negotia|deal|offer)/i.test(text)) {
        return { name: 'negotiation', rule: 'Make a concrete offer, request, objection, or counter-offer. Each turn must change the terms or decision; never repeat the same request.' };
    }
    if (/(berpamitan|berpisah|perpisahan|pergi|meninggalkan|goodbye|farewell|departure)/i.test(text)) {
        return { name: 'farewell', rule: 'One character makes a specific request, confession, or reason; the other must answer with a distinct decision, boundary, or emotional consequence, not the same request repeated.' };
    }
    if (/(sedih|duka|kehilangan|menangis|rindu|memaafkan|haru|grief|emotional)/i.test(text)) {
        return { name: 'emotional exchange', rule: 'Expose a specific hidden feeling or fact, then answer with recognition, resistance, or a changed emotional choice. Avoid generic comfort phrases.' };
    }
    return { name: 'scene exchange', rule: 'Anchor every line to the visible action and relationship. Each reply must add information, a reaction, a decision, or a changed intention; never restate the previous line.' };
}

function buildSceneIntentContract(scene, config, sceneIdx, breakdown) {
    const fn = dialogueSceneFunction(scene);
    const participants = activeSceneCharacterIds(scene);
    const interactive = sceneRequiresInteractiveDialogue(scene, config);
    const finalScene = breakdown && Array.isArray(breakdown.scenes)
        ? sceneIdx === breakdown.scenes.length - 1
        : false;
    const singleFinalAftermath = isSingleCharacterFinalAftermath(scene, breakdown);
    const functionRules = {
        introduction: 'VISUAL: first meeting, natural social distance, eye contact or a simple greeting/self-introduction. FORBID hand-holding, hugging, kissing, couple intimacy, or romantic posing unless explicitly requested. DIALOGUE: identity/intention -> distinct question/response; do not use conflict or relationship-repair language.',
        conflict: 'VISUAL: visible opposing objectives, readable blocking, tense reactions, and changing positions; do not stage a calm greeting. DIALOGUE: accusation/demand -> specific answer, refusal, counterclaim, or consequence; every turn must change the confrontation.',
        consultation: 'VISUAL: one person seeks help and the other observes, examines, or explains. DIALOGUE: concrete symptom/concern -> focused question or finding -> actionable answer; no generic small talk.',
        negotiation: 'VISUAL: both parties face a concrete object, offer, price, or decision. DIALOGUE: offer/request -> objection -> changed terms or decision.',
        farewell: 'VISUAL: motivated departure preparation and emotional distance; do not repeat an earlier meeting. DIALOGUE: reason/request -> distinct decision or boundary; ending belongs only to the final planned scene.',
        'emotional exchange': 'VISUAL: intimate but situation-specific reaction. DIALOGUE: specific feeling/fact -> recognition, resistance, or changed choice; avoid generic comfort.',
        'scene exchange': 'VISUAL and DIALOGUE must serve the current scene beat only; each response adds a fact, reaction, question, decision, or consequence.'
    };
    return [
        'SCENE INTENT CONTRACT — HARD, CURRENT SCENE ONLY.',
        'FUNCTION: ' + fn.name + '. ' + (functionRules[fn.name] || functionRules['scene exchange']),
        'ACTIVE PARTICIPANTS: ' + (singleFinalAftermath ? 'CHARACTER_1 only' : (participants.length ? participants.join(', ') : 'scene-appropriate single performer')) + '. ' + (singleFinalAftermath ? 'FINAL AFTERMATH LOCK: CHARACTER_2 has already exited and MUST NOT appear, speak, answer, react, or be referenced as visible in this scene. Show CHARACTER_1 alone processing regret.' : (interactive ? 'All listed active participants must be visibly involved and exchange complete turns.' : 'Do not invent a second speaking character.')),
        'STORY BEAT: ' + [scene && scene.storyPurpose, scene && scene.sceneBeat, scene && scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction].filter(Boolean).join(' | '),
        finalScene ? 'EPISODE/STORY POSITION: final scene payoff only. Do not restart an earlier beat or move the ending elsewhere.' : 'EPISODE/STORY POSITION: execute only this scene beat; do not repeat the opening or resolve the whole story early.'
    ].join('\n');
}

function sceneRequiresInteractiveDialogue(scene, config) {
    if (creativeShapeSkipsInteractive(config)) return false;
    return dialoguePlanExplicitlyRequiresTwoWay(scene)
        || sceneRequestsInteractiveCast(scene, config && config.story)
        || sceneReferencesTwoCharacters(scene);
}

function normalizeDialogueTurnFormat(value, scene) {
    const source = normalizeDialogueText(value);
    let sourceLines = dialogueTurnLines(source);
    if (!sourceLines.length && sceneRequestsInteractiveCast(scene, state.story)) {
        sourceLines = source.split('\n')
            .map(line => line.trim())
            .filter(line => /^(?:\[[^\]]+\]\s*)?"[^"\n]+"\s*$/i.test(line));
        const plan = chooseDialogueTurnPlan(scene);
        sourceLines = sourceLines.slice(0, plan.count).map((line, index) => plan.pattern.split(' -> ')[index] + ': ' + line);
    }
    const speakerTurns = sourceLines.map(line => {
        const match = line.match(/^(?:\[([^\]]+)\]\s*)?CHARACTER_(\d+)\s*:\s*([\s\S]+)$/i);
        if (!match) return line;
        const expression = match[1] ? '[' + match[1].trim() + '] ' : '';
        const content = match[3].trim().replace(/^"|"$/g, '').trim();
        return expression + 'CHARACTER_' + match[2] + ': "' + content.replace(/"/g, '\\"') + '"';
    });
    // Preserve trailing non-character lines (CTA, NARRATOR, raw quoted action) that
    // dialogueTurnLines would otherwise drop because they don't match CHARACTER_N:
    const speakerTurnSet = new Set(speakerTurns);
    const preservedTrailers = source.split('\n')
        .map(line => line.trim())
        .filter(line => line && !speakerTurnSet.has(line) && !/^CHARACTER_\d+\s*:/i.test(line));
    return [...speakerTurns, ...preservedTrailers].join('\n');
}

function prepareInteractiveDialogueCandidate(value, scene, config, identity) {
    let candidate = normalizeDialogueSpeakerLabels(value, identity);
    candidate = normalizeDialogueTurnFormat(candidate, scene);
    candidate = normalizeDialogueSpeakerTurns(candidate, scene, config, identity);
    return normalizeDialogueTurnFormat(candidate, scene);
}

function hasValidInteractiveDialogue(value, scene, config, forceInteractive = false) {
    if (!forceInteractive && !sceneRequiresInteractiveDialogue(scene, config)) return true;
    const lines = dialogueTurnLines(value);
    const speakers = dialogueCharacterSpeakers(value);
    // 3B: relaxed from strict 2-3 to 2-4 turns so natural exchanges with a breath/setup line are not rejected
    const activeIds = activeSceneCharacterIds(scene);
    const requiredIds = activeIds.length >= 2 ? activeIds.slice(0, 2) : ['CHARACTER_1', 'CHARACTER_2'];
    if (lines.length < requiredIds.length || lines.length > 4) return false;
    if (requiredIds.some(id => !speakers.has(id.replace('CHARACTER_', '')))) return false;
    if (lines.some(line => !/CHARACTER_\d+\s*:\s*"(?:[^"\\]|\\.)+"\s*$/i.test(line))) return false;
    const labels = lines.map(line => Number(line.match(/CHARACTER_(\d+)/i)[1]));
    if (labels.some(label => !activeIds.length
        ? (label !== 1 && label !== 2)
        : !activeIds.some(id => Number(id.replace('CHARACTER_', '')) === label))) return false;
    const contents = lines.map(line => line.replace(/^(?:\[[^\]]+\]\s*)?CHARACTER_\d+\s*:\s*/i, '').replace(/^"|"$/g, '').toLowerCase());
    if (contents.length >= 2) {
        const stopWords = new Set(['yang', 'untuk', 'dengan', 'tidak', 'dari', 'kamu', 'aku', 'saya', 'atau', 'this', 'that', 'please', 'tolong']);
        for (let i = 1; i < contents.length; i++) {
            const previousWords = new Set(contents[i - 1].split(/\W+/).filter(word => word.length > 3 && !stopWords.has(word)));
            const currentWords = contents[i].split(/\W+/).filter(word => word.length > 3 && !stopWords.has(word));
            const overlap = currentWords.filter(word => previousWords.has(word)).length;
            if (previousWords.size >= 5 && overlap / previousWords.size > 0.7) return false;
        }
        const firstAction = contents[0].replace(/\b(?:please|tolong|dengar(?:kan)?|denger(?:in)?|tunggu)\b/g, '').trim();
        const secondAction = contents[1].replace(/\b(?:please|tolong|dengar(?:kan)?|denger(?:in)?|tunggu)\b/g, '').trim();
        if (firstAction.length > 18 && secondAction.length > 18 && (firstAction.includes(secondAction) || secondAction.includes(firstAction))) return false;
    }
    const intent = dialogueSceneFunction(scene).name;
    const combined = contents.join(' ');
    if (intent === 'introduction' && /kita perlu bicara|jujur duluan|aku dengar kamu|cukup\. kita bicara|ada yang harus aku bilang/i.test(combined)) return false;
    // 3B: dropped the no-consecutive-same-speaker rule — allow e.g. CHARACTER_1 -> CHARACTER_1 -> CHARACTER_2
    // if the scene beat requires a self-correction or setup line.
    return true;
}

function isCommercialStoryboardMode(config, breakdown) {
    return String(config && config.storyboardMode || '').toLowerCase() === 'commercial'
        || String(breakdown && breakdown.contentGenre || '').toLowerCase() === 'advertisement';
}

function enforceCommercialSceneContract(breakdown, config) {
    if (!isCommercialStoryboardMode(config, breakdown) || !Array.isArray(breakdown && breakdown.scenes)) return;
    if (isPlacePromotion(config)) return;
    breakdown.scenes.forEach((scene, index) => {
        if (!scene) return;
        const isFirst = index === 0;
        const isLast = index === breakdown.scenes.length - 1;
        const role = isFirst ? 'commercial hook and problem identification'
            : isLast ? 'commercial payoff and CTA'
                : 'commercial product demonstration and benefit proof';
        const action = isFirst
            ? 'Show the user problem through one concrete physical action, then reveal the product as the answer.'
            : isLast
                ? 'Show the product integrated in the scene delivering the final benefit, then finish with a clear CTA.'
                : 'Show the product physically used in the scene and make its benefit visible through a concrete action.';
        scene.sceneVisualPlan = Object.assign({}, scene.sceneVisualPlan || {}, {
            sceneFunction: role,
            visualAction: action,
            intentName: role
        });
        scene.dialoguePlan = Object.assign({}, scene.dialoguePlan || {}, {
            mode: 'commercial progression',
            sceneIntent: role,
            dramaticObjective: isFirst ? 'Name the problem and create curiosity for the product solution.'
                : isLast ? 'Confirm the product benefit and deliver the CTA.'
                    : 'Demonstrate the product benefit and advance toward the CTA.'
        });
        const forbidden = /\b(?:first meeting|introduction|perkenalan|berkenalan|natural social distance|simple greeting|self-introduction)\b/i;
        if (forbidden.test(String(scene.storyPurpose || '') + ' ' + String(scene.sceneBeat || ''))) {
            scene.storyPurpose = action;
            scene.sceneBeat = role + ': ' + action;
        }
    });
}

function validateCommercialDialogueContract(breakdown, config) {
    if (!isCommercialStoryboardMode(config, breakdown) || isSilentAudioMode(config)) return;
    const scenes = Array.isArray(breakdown && breakdown.scenes) ? breakdown.scenes : [];
    const duration = String(config && config.durationPerScene || '10s');
    const budget = dialogueWordBudget(scene, config);
    for (let index = 0; index < scenes.length; index++) {
        const scene = scenes[index];
        const dialogueText = normalizeDialogueText(scene && scene.dialogueOrNarration);
        const lines = dialogueText
            .split(/(?=(?:\[[^\]]+\]\s*)?(?:CHARACTER_\d+|VOICEOVER|NARRATOR)\s*:)/i)
            .map(line => line.trim())
            .filter(line => /^(?:\[[^\]]+\]\s*)?(?:CHARACTER_\d+|VOICEOVER|NARRATOR)\s*:/i.test(line));
        const forbiddenIntent = /\b(?:first meeting|introduction|perkenalan|berkenalan|natural social distance|simple greeting|self-introduction)\b/i;
        const intentText = [scene && scene.sceneVisualPlan && scene.sceneVisualPlan.sceneFunction, scene && scene.dialoguePlan && scene.dialoguePlan.sceneIntent, scene && scene.storyPurpose].filter(Boolean).join(' ');
        if (forbiddenIntent.test(intentText)) {
            throw new Error('Scene iklan ' + (index + 1) + ' masih memakai scene intent introduction, bukan alur iklan.');
        }
        const spokenText = lines.join(' ').replace(/^(?:\[[^\]]+\]\s*)?(?:CHARACTER_\d+|VOICEOVER|NARRATOR)\s*:\s*/i, '');
        const wordCount = spokenText.split(/\s+/).filter(Boolean).length;
        if (!lines.length) {
            scene.dialogueNeedsRepair = true;
            console.warn('[Commercial Dialogue] Scene ' + (index + 1) + ' tidak memiliki dialog berlabel. Shot count tidak digunakan sebagai validator dialog.');
        } else if (wordCount > budget.maxWords) {
            scene.dialogueNeedsRepair = true;
            console.warn('[Commercial Dialogue] Scene ' + (index + 1) + ' melebihi batas durasi: ' + wordCount + ' kata, maksimum sekitar ' + budget.maxWords + '.');
        }
    }
}

function validateInteractiveDialogueContract(breakdown, config) {
    const cast = Array.isArray(breakdown && breakdown.masterVisualIdentity && breakdown.masterVisualIdentity.characters)
        ? breakdown.masterVisualIdentity.characters.filter(character => /^CHARACTER_\d+$/i.test(String(character && character.characterId || '')))
        : [];
    const invalidScene = (breakdown && breakdown.scenes || []).find((scene, index) =>
        sceneRequestsInteractiveCast(scene, config && config.story) &&
        !hasValidInteractiveDialogue(scene && scene.dialogueOrNarration, scene, config)
    );
    if (invalidScene) {
        const sceneNumber = invalidScene.sceneNumber || ((breakdown.scenes || []).indexOf(invalidScene) + 1);
        throw new Error('Dialog adegan ' + sceneNumber + ' belum memenuhi percakapan dua arah CHARACTER_1 dan CHARACTER_2.');
    }
}

function normalizeDialogueExpressions(value, scene) {
    const text = normalizeDialogueText(value);
    if (!text) return text;
    const emotion = String(scene && scene.audioDirection && (scene.audioDirection.sceneEmotion || scene.audioDirection.emotion) || '').toLowerCase();
    let expressions = ['fokus pada aksi', 'menimbang respons', 'menahan emosi', 'mengubah keputusan'];
    if (/angry|marah|bertengkar|konfrontasi|fight|heated|tense/.test(emotion)) expressions = ['tense', 'frustrated', 'heated', 'defiant'];
    else if (/happy|joy|senang|gembira|excited|antusias/.test(emotion)) expressions = ['smiling', 'bright', 'excited', 'playful'];
    else if (/sad|grief|sedih|duka|cry|menangis/.test(emotion)) expressions = ['hurt', 'hesitant', 'softly emotional', 'vulnerable'];
    else if (/fear|takut|cemas|horror|terrified/.test(emotion)) expressions = ['uneasy', 'startled', 'nervous', 'relieved'];
    else if (/suspicious|curiga|skeptis|doubt/.test(emotion)) expressions = ['guarded', 'skeptical', 'measured', 'probing'];
    return text.split('\n').map((line, index) => {
        const match = line.match(/^(?:\[([^\]]+)\]\s*)?CHARACTER_(\d+)\s*:\s*(.+)$/i);
        if (!match) return line;
        const expression = match[1] && match[1].trim() ? match[1].trim() : expressions[index % expressions.length];
        return '[' + expression + '] CHARACTER_' + match[2] + ': ' + match[3].trim();
    }).join('\n');
}

function explicitModelRequest(storyText) {
    const text = String(storyText || '').toLowerCase();
    if (storyRequestsInteractiveCast(text)) return false;
    return /\b(?:diperagakan|diperankan|dibawakan|didemokan|digunakan)\s+(?:oleh|dengan)?\s*(?:seorang|satu|pria|wanita|perempuan|lelaki|laki-laki|model|talent|aktor|aktris)\b|\b(?:model|talent|aktor|aktris|pria|wanita|perempuan|lelaki|laki-laki)\s+(?:muda|cantik|ganteng|elegan|profesional|berjalan|memakai|menggunakan|memperagakan)\b|\b(?:dengan|bersama)\s+(?:seorang|satu|pria|wanita|perempuan|model|talent|aktor|aktris)\b/i.test(text);
}

function isProductOnlyCommercialBrief(storyText, config) {
    if (isPlacePromotion(config)) return false;
    return detectCommercialIntent(storyText) && !(config && config.characterReference && config.characterReference.length) && !explicitModelRequest(storyText) && storyRequestedCastCount(storyText) === 0;
}

function restrictSimpleCommercialCast(breakdown, config) {
    if (!breakdown) return;
    const identity = breakdown.masterVisualIdentity;
    const productOnly = isProductOnlyCommercialBrief(config && config.story, config);
    const simpleWithModel = isSimpleCommercialBrief(config && config.story) || explicitModelRequest(config && config.story) || !!(config && config.characterReference && config.characterReference.length);
    if (!productOnly && !simpleWithModel) return;
    if (identity && Array.isArray(identity.characters)) {
        const referenceCount = Math.min(CHARACTER_REF_MAX, (config && config.characterReference && config.characterReference.length) || 0);
        identity.characters = productOnly ? [] : identity.characters.slice(0, Math.max(1, referenceCount));
    }
    const extraCharacterLine = /^.*CHARACTER_(?:[2-9]|[1-9]\d+).*$/gim;
    (breakdown.scenes || []).forEach(scene => {
        if (!scene || typeof scene !== 'object') return;
        scene.masterImagePrompt = String(scene.masterImagePrompt || '').replace(extraCharacterLine, '').trim();
        scene.masterVideoPrompt = String(scene.masterVideoPrompt || '').replace(extraCharacterLine, '').trim();
        scene.dialogueOrNarration = String(scene.dialogueOrNarration || '').replace(extraCharacterLine, '').trim();
        if (productOnly) {
            scene.masterImagePrompt = scene.masterImagePrompt.replace(/\b(?:model|talent|aktor|aktris|pria|wanita|perempuan|lelaki|man|woman|male|female)\b/gi, 'product-focused composition');
            scene.masterVideoPrompt = scene.masterVideoPrompt.replace(/\b(?:model|talent|aktor|aktris|pria|wanita|perempuan|lelaki|man|woman|male|female)\b/gi, 'product-focused composition');
            // Product-only commercial: no visual cast, so strip CHARACTER_N speaker turns,
            // but keep VOICEOVER / NARRATOR / CTA / closing action lines for the audio track.
            scene.dialogueOrNarration = String(scene.dialogueOrNarration || '')
                .split('\n')
                .filter(line => !/^\s*(?:\[[^\]]+\]\s*)?CHARACTER_\d+\s*:/i.test(line))
                .join('\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        }
    });
}

function getGenreInstruction(genre) {
    const book = {
        advertisement: `GENRE EXECUTION — IKLAN (WAJIB DIPATUHI):
HOOK DETIK 1–3 — EXTREME VISUAL HOOK WAJIB: Panel/shot PERTAMA scene 1 HARUS membuka dengan kejadian visual ekstrem yang membuat orang berhenti scroll sebelum produk dijual. TRENDORA wajib memilih SATU perangkat hook paling kuat dan relevan, bukan template berulang. Contoh hanya inspirasi: membanting barang ke meja, sorot helikopter, karakter mengintip lalu tiba-tiba masuk frame, lompat tembok, benda jatuh ditangkap dramatis, chase kecil, impossible close-up impact, reaksi manusia yang shock, atau interupsi visual absurd tapi masuk akal. Jangan selalu pakai contoh yang sama; ciptakan opsi lain sesuai produk/lokasi/cast.
BODY: manfaat produk lewat aksi dan gambar, bukan ceramah. Tunjukkan, jangan jelaskan.
CTA SCENE TERAKHIR — WAJIB, DILARANG MONOTON: Jangan pernah default "Beli sekarang di link bio" / "Dapatkan oferta spesial hari ini". Setiap generate WAJIB CTA yang terasa baru: benefit-led, curiosity, social-proof, whispered invitation, pertanyaan, limited-moment, atau diucapkan karakter sesuai produk. Natural, tidak memaksa, hanya di akhir scene terakhir pada [AUDIO / DIALOGUE].`,
        horror: `GENRE EXECUTION — HORROR: Bangun dread, bukan jump-scare murahan. Negative space, withheld reveal, kamera sebagai voyeur, lighting sebagai ancaman, sound off-screen lebih dulu daripada monster. Puncak di scene terakhir. DILARANG CTA. DILARANG lucu. DILARANG over-explaining.`,
        dramatic: `GENRE EXECUTION — DRAMA: Interioritas karakter, momen yang earned, diam sebagai alat. Kamera dekat, lighting emosional, pacing tidak terburu-buru. JANGAN sisipkan CTA. Ending berdiri sendiri secara naratif kecuali user eksplisit minta CTA.`,
        comedy: `GENRE EXECUTION — KOMEDI: Setup visual di shot awal, timing ketat, payoff di akhir. Visual gag lebih kuat dari dialog lucu. DILARANG CTA kecuali brief-nya jelas iklan lucu. Jangan overacting kasar kecuali diminta.`,
        educational: `GENRE EXECUTION — EDUKASI: Satu ide per beat, metafora visual, progressive reveal. Kejelasan di atas gaya. Recap singkat di akhir jika membantu. CTA hanya jika user minta.`,
        action: `GENRE EXECUTION — ACTION: Geografi ruang jelas, kamera kinetik, impact frames, continuity gerak. Shot 1 langsung terasa momentum. DILARANG CTA kecuali brief iklan.`,
        documentary: `GENRE EXECUTION — DOKUMENTER: Observational, authentic. Jangan dramatisasi berlebihan. CTA dilarang kecuali diminta.`,
        hybrid: `GENRE EXECUTION — CAMPURAN CERITA + IKLAN (AMAN):
Cerita/emosi/konflik tetap UTAMA. Produk masuk sebagai product placement yang earned — terlihat dipakai/disentuh dalam alur, bukan merebut plot jadi infomercial.
Hook tetap kuat di detik 1–3. Jangan buka dengan hard-sell.
PENJUALAN hanya diselipkan NATURAL di tengah cerita melalui dialog/aksi singkat, bukan sebagai closing. Contoh pola: "Sandal kamu kok bagus?" "Iya nih, sandal merk X lagi promo." Setelah itu balik ke konflik/emosi cerita.
CTA AKHIR DILARANG: scene terakhir harus payoff cerita, bukan ajakan beli/klik/order/DM/klaim promo.
Jangan mengganti genre cerita (drama/horror/komedi) menjadi iklan murni. Keduanya harus hidup bersama.
Caption & hashtag: produk + inti cerita. Bukan lokasi syuting.`,
        asmr: `GENRE EXECUTION — ASMR / TANPA DIALOG: Close-up tekstur, aksi taktil, tangan/objek, dan sound design non-verbal. DILARANG dialog, bisikan berkalimat, lip-sync, narrator, dan CTA audio. Foley, crinkle, tap, breath tanpa kata, dan room tone yang membawa scene.`,
        podcast: `GENRE EXECUTION — PODCAST: Percakapan atau host talk. Giliran natural, topik maju, reaksi pendengar. Jangan paksa konflik sinematik atau CTA iklan.`,
        monologue: `GENRE EXECUTION — MONOLOG: Satu pembicara. Pikiran interior atau sapaan langsung. Jangan mengarang CHARACTER_2 kecuali brief menyebutnya.`,
        neutral: `GENRE EXECUTION — GENERAL: Tentukan sendiri genre paling jujur dari niat user, lalu eksekusi sebagai TRENDORA senior. CTA hanya jika alur secara natural menuntun ke action.`
    };
    return book[genre] || book.neutral;
}

function genreLoadingText(genre) {
    return ({
        advertisement: 'Deteksi: VIDEO IKLAN — hook visual + CTA non-monoton...',
        horror: 'Deteksi: HORROR — atmosfer, dread, withheld reveal...',
        dramatic: 'Deteksi: DRAMA — fokus narasi emosional, tanpa CTA...',
        comedy: 'Deteksi: KOMEDI — timing dan visual gag...',
        educational: 'Deteksi: EDUKASI — kejelasan dan progressive reveal...',
        action: 'Deteksi: ACTION — momentum dan impact frames...',
        documentary: 'Deteksi: DOKUMENTER — observational dan authentic...',
        hybrid: 'Deteksi: CERITA + IKLAN — narasi utama, produk menyatu natural...',
        asmr: 'Deteksi: ASMR — tekstur, foley, tanpa dialog...',
        podcast: 'Deteksi: PODCAST — percakapan/host talk...',
        monologue: 'Deteksi: MONOLOG — satu pembicara...',
        neutral: 'Deteksi: KONTEN GENERAL — analyzing story arc...'
    })[genre] || 'Deteksi: KONTEN GENERAL — analyzing story arc...';
}

function spokenWordBudget(duration) {
    const d = String(duration || '8s');
    if (d.indexOf('5') === 0) return { minWords: 10, maxWords: 20, minLines: 2, maxLines: 3 };
    if (d.indexOf('8') === 0) return { minWords: 15, maxWords: 30, minLines: 2, maxLines: 3 };
    return { minWords: 14, maxWords: 24, minLines: 2, maxLines: 3 };
}

function dialogueWordBudget(scene, config) {
    const duration = String(config && config.durationPerScene || '8s');
    if (sceneRequiresSingleSpeaker(scene, config)) {
        // Single-speaker: tetap ringkas (1-3 baris) untuk adegan atau VO.
        if (duration.indexOf('5') === 0) return { minWords: 12, maxWords: 24, minLines: 1, maxLines: 3 };
        if (duration.indexOf('8') === 0) return { minWords: 18, maxWords: 34, minLines: 1, maxLines: 3 };
        return { minWords: 18, maxWords: 32, minLines: 1, maxLines: 3 };
    }
    // V5.0 (Dialog Fix): multi-speaker butuh lebih banyak baris untuk back-and-forth
    // natural. Sebelumnya max 3 baris untuk semua durasi — 30s scene jadi silent 25+ detik.
    if (duration.indexOf('5') === 0) return { minWords: 14, maxWords: 28, minLines: 2, maxLines: 2 };
    if (duration.indexOf('8') === 0) return { minWords: 18, maxWords: 34, minLines: 2, maxLines: 3 };
    if (duration.indexOf('10') === 0) return { minWords: 22, maxWords: 40, minLines: 3, maxLines: 4 };
    if (duration.indexOf('15') === 0) return { minWords: 28, maxWords: 50, minLines: 3, maxLines: 4 };
    if (duration.indexOf('30') === 0) return { minWords: 40, maxWords: 70, minLines: 4, maxLines: 6 };
    return { minWords: 50, maxWords: 90, minLines: 4, maxLines: 6 }; // 45s+
}

const ASMR_AUDIO_MODE = 'ASMR / No Dialogue (Ambience & Foley)';

function isSilentAudioMode(config) {
    return /No Voice|ASMR/i.test(String(config && config.audioMode || ''));
}

function isAsmrAudioMode(config) {
    if (/ASMR/i.test(String(config && config.audioMode || ''))) return true;
    return isSilentAudioMode(config) && (storyRequestsSilentAsmr(config && config.story) || detectCreativeShape(config && config.story) === 'asmr');
}

function storyRequestsSilentAsmr(storyText) {
    return /\b(?:asmr|tanpa\s+dialog|tanpa\s+suara|no\s+dialogue|no\s+dialog|no\s+voice|whisper(?:ing)?|bisikan|berbisik|tingles|ear\s+to\s+ear|personal\s+attention|hanya\s+suara|sound\s+only|foley\s+only)\b/i.test(String(storyText || ''));
}

function detectCreativeShape(storyText) {
    const t = String(storyText || '').toLowerCase();
    if (storyRequestsSilentAsmr(t)) return 'asmr';
    if (/\b(?:podcast|talk\s*show|obrolan radio)\b/i.test(t)) return 'podcast';
    if (/\b(?:monolog|monologue|soliloquy|bicara sendiri)\b/i.test(t)) return 'monologue';
    if (/\b(?:komedi|lucu|kocak|parodi|humor|prank|gag)\b/i.test(t)) return 'comedy';
    if (/\b(?:horror|horor|hantu|seram|menyeramkan)\b/i.test(t)) return 'horror';
    return 'story';
}

function storyRequestsMiniatureBuild(storyText) {
    const t = String(storyText || '').toLowerCase();
    if (/\b(?:miniatur|miniature|diorama|maket|mini world|dunia mini|tiny world|skala mini|versi kecil|ukuran mini|tiny house|tiny hut|tiny boat)\b/i.test(t)) return true;
    if (/\b(?:rumah kecil|gubuk kecil|perahu kecil|jembatan kecil|desa kecil|kampung kecil)\b/i.test(t)) return true;
    if (/\b(?:tangan (?:manusia|raksasa|besar)|giant hands?|macro hands?)\b/i.test(t)
        && /\b(?:merakit|rakit|membangun|membuat|pasang|memasang|menyusun|dirakit)\b/i.test(t)) return true;
    return false;
}

function isCreativeMiniatureBuild(config) {
    const cfg = config || state;
    return String(cfg.storyboardMode || '').toLowerCase() === 'drama' && storyRequestsMiniatureBuild(cfg.story);
}

function buildCreativeMiniatureBuildContract(config) {
    if (!isCreativeMiniatureBuild(config)) return '';
    return `KONTEN KREATIF — MINIATURE BUILD / GIANT HANDS CONTRACT — HARD.
This is a photoreal process video in Creative Content mode, not character drama and not an animation medium.
SCALE INVERSION (MANDATORY): Life-size adult human HANDS are giant relative to the set. Every object the user asked to build or show (house, hut, boat, bridge, village, product, or any assembled thing) MUST appear as a crafted MINIATURE / tiny version. Never restore real-world object-to-hand scale. A house must be smaller than a palm. A boat must be smaller than a forearm. Fingers can pinch roofs, walls, stones, nets, and tools.
HANDS ONLY: Show one or two photoreal human hands assembling the miniature. Do NOT invent a full-body CHARACTER_1, talking face, wardrobe, or second social cast unless the user explicitly asked to show a person. Hands may use Indonesian/local skin tone.
PROCESS ARC: Scene 1 starts from empty/raw ground or first materials. Middle scenes add structure piece by piece (foundation, walls, roof, details). The final scene shows the completed miniature world. Do not skip to the finished object in scene 1. Do not invent interpersonal conflict, romance, or sales CTA.
CAMERA: macro / close tabletop, tilt-shift or shallow diorama depth, real materials (wood, sand, water, moss, bamboo, stone, metal tools). Photoreal live-action look is required.
AUDIO: prefer non-verbal construction foley. Do not force spoken dialogue.`;
}

function creativeShapeSkipsInteractive(config) {
    if (isSilentAudioMode(config)) return true;
    if (isCreativeMiniatureBuild(config)) return true;
    const shape = detectCreativeShape(config && config.story);
    return shape === 'asmr' || shape === 'monologue';
}

function applyCreativeAudioAutoDetect(config) {
    if (!config) return false;
    const current = String(config.audioMode || '');
    if (/Character Dialogue|Voice-Over Narrator|Character \+ Narrator/i.test(current)) return false;
    if (isSilentAudioMode(config)) return false;
    if (!storyRequestsSilentAsmr(config.story)) return false;
    config.audioMode = ASMR_AUDIO_MODE;
    const select = document.getElementById('selectAudioMode');
    if (select) select.value = ASMR_AUDIO_MODE;
    if (typeof updateSummaryPill === 'function') updateSummaryPill();
    return true;
}

function buildCreativeDialogueContract(config) {
    if (isCreativeMiniatureBuild(config)) {
        return 'No spoken lines required. Construction foley only. Do not invent CHARACTER dialogue for assembling hands.';
    }
    const shape = detectCreativeShape(config && config.story);
    if (shape === 'asmr') return 'No spoken lines. Visual texture and non-verbal sound only.';
    if (shape === 'monologue') return 'One speaker only. Interior thought or direct address. Do not invent CHARACTER_2.';
    if (shape === 'podcast') return 'Natural host or guest conversation, or solo host talk. Topic progression, not cinematic conflict.';
    if (shape === 'comedy') return 'Short optional lines that support the gag. Visual payoff first. No sales CTA unless requested.';
    if (shape === 'horror') return 'Sparse, earned lines. Sound off-screen may carry more than speech. No CTA.';
    return 'Every turn must serve the brief. Use conflict only if the story contains it. Avoid sales language unless explicitly requested.';
}

function buildDramaModeContract(config) {
    if (isCreativeMiniatureBuild(config)) return buildCreativeMiniatureBuildContract(config);
    const shape = detectCreativeShape(config && config.story);
    const book = {
        asmr: 'CREATIVE MODE — ASMR / NO DIALOGUE: Prioritize close-up tactile action, material texture, hand/object interaction, microphone-near sound design, and non-verbal pacing. Do not invent conflict, conversation, or CTA audio.',
        podcast: 'CREATIVE MODE — PODCAST: Treat this as conversation or host talk. Natural turns, topic progression, and listening reactions. Do not force cinematic conflict, visual stunts, or advertising CTA.',
        monologue: 'CREATIVE MODE — MONOLOG: One speaker. Interior thought or direct address. Do not invent a second speaking character or two-way argument unless the brief names one.',
        comedy: 'CREATIVE MODE — COMEDY: Visual gag, timing, and payoff. Dialogue is optional seasoning. Do not force dramatic conflict or sales structure.',
        horror: 'CREATIVE MODE — HORROR: Dread, withheld reveal, sound off-screen. Dialogue may be sparse. No CTA.',
        story: 'CREATIVE MODE — STORY: Follow the user brief. Use conflict and emotional turn only when the story contains them. Podcast, monologue, comedy, and ASMR must not be rewritten as a fight scene or advertisement.'
    };
    return book[shape] || book.story;
}

function buildSilentAudioBlueprintRules(config) {
    const asmr = isAsmrAudioMode(config);
    return `SILENT / NO-VOICE / ASMR AUDIO CONTRACT — HARD.
dialogueOrNarration MUST be an empty string for every scene.
Do not write CHARACTER_N spoken lines, VOICEOVER, NARRATOR, CTA audio, lip-sync, whispered words, or any audible speech.
dialoguePlan.mode must be "silent ambience". Participants may list visible CHARACTER_IDs for staging only, not as speakers.
audioDirection.spokenAudio, dialogue, and voiceOver must be false.
audioDirection.soundDesign MUST be concrete and scene-specific: name the room tone, the material being touched, and the foley that syncs to the visible action (for example wet lather, paper crinkle, finger tap, fabric rustle, water drip). Never write a generic phrase such as "natural ambience only".
${asmr ? 'ASMR: close-mic tactile sound, slow texture, binaural intimacy, breath without words. No whispered sentences.' : 'NO VOICE: naturalistic scene distance. Foley only when contact or motion is visible.'}
Do not invent conversation, sales CTA audio, or conflict that only exists to force dialogue.`;
}

function buildBlueprintSpeakerContract(config) {
    if (isSilentAudioMode(config) || isCreativeMiniatureBuild(config)) {
        return isCreativeMiniatureBuild(config)
            ? 'For each scene, do not invent a speaking cast. dialoguePlan.mode must be silent construction foley. dialogueOrNarration SHOULD be empty. Participants may be omitted or listed as assembling hands only. SCENE INTENT CONTRACT: sceneVisualPlan must show the next miniature-build step, not a dramatic argument.'
            : 'For each scene, dialoguePlan.participants must list the CHARACTER_IDs who are actively visible for staging only, not as speakers. Set dialoguePlan.mode to silent ambience. dialogueOrNarration MUST be an empty string. audioDirection.spokenAudio, dialogue, and voiceOver must be false. SCENE INTENT CONTRACT: sceneVisualPlan.sceneFunction, dialoguePlan.sceneIntent, and audioDirection must describe the same current visual beat without spoken words.';
    }
    return 'For each scene, dialoguePlan.participants must list the CHARACTER_IDs who are actively visible and socially involved in that scene (not passive background extras). If two or more characters are active in a scene, set dialoguePlan.mode to two-way character dialogue and dialogueOrNarration must be a real back-and-forth exchange. If only one character is active, dialogueOrNarration may use only CHARACTER_1 and/or VOICEOVER. SCENE INTENT CONTRACT: sceneVisualPlan.sceneFunction, dialoguePlan.sceneIntent, audioDirection, and dialogueOrNarration must describe the same current beat.';
}

function promptContainsSpokenDialogue(text) {
    const source = String(text || '');
    if (!source.trim()) return false;
    if (/^\s*\[AUDIO\s*\/\s*DIALOGUE\]\s*$/im.test(source)) return true;
    return /(?:\[[^\]]+\]\s*)?(?:CHARACTER_\d+|VOICEOVER|NARRATOR|CTA)\s*:\s*["“']/.test(source);
}

function getVoiceModeContract(config) {
    const mode = String(config && config.audioMode || 'Auto Director (Kontekstual)').trim();
    if (/ASMR/i.test(mode)) {
        return 'VOICE MODE: ASMR / NO DIALOGUE. No spoken words, whispered sentences, lip-sync, narrator, or CTA audio. Use close-mic non-verbal sound: texture, foley, tapping, crinkles, breath without words, and room tone.';
    }
    if (/No Voice/i.test(mode)) {
        return 'VOICE MODE: NO VOICE / VISUAL & AMBIENCE ONLY. Remove all dialogue, character speech, voice-over, narration, CTA audio, lip-sync, and vocal performance. Use only natural ambience, foley, music if explicitly requested, and scene-specific sound effects.';
    }
    if (/Voice-Over Narrator/i.test(mode) && !/Character/i.test(mode)) {
        return 'VOICE MODE: VOICE-OVER NARRATOR ONLY. No CHARACTER_N may speak and no visible character lip-sync is allowed. Use one separate narrator voice for narration; characters may act silently. Keep the narrator voice consistent across every scene and episode.';
    }
    if (/Character \+ Narrator/i.test(mode)) {
        return 'VOICE MODE: CHARACTER + NARRATOR. Use locked character voices for registered CHARACTER_N speakers and one separate locked narrator voice for VOICEOVER/NARRATOR. Narrator must not impersonate a character; characters must not deliver narrator lines. Use each layer only when it advances the scene.';
    }
    if (/Character Dialogue \/ Lip-Sync/i.test(mode)) {
        return 'VOICE MODE: CHARACTER DIALOGUE / LIP-SYNC ONLY. Use only registered CHARACTER_N voices. Every spoken character line requires visible mouth movement and matching lip-sync. No VOICEOVER, NARRATOR, or narrator-style exposition.';
    }
    return 'VOICE MODE: AUTO DIRECTOR (CONTEXTUAL). Choose the smallest effective audio arrangement from locked character dialogue, separate narrator, or both based on the story and scene. Do not mix modes arbitrarily; once a voice identity is assigned, keep it consistent across all scenes and episodes.';
}

function collectSilentSceneSoundContext(scene, config, identity) {
    const product = identity ? productDisplayName(identity, '') : '';
    const shots = Array.isArray(scene && scene.shots) ? scene.shots.map(shot => shot && shot.action).filter(Boolean).join(' ') : '';
    return [
        config && config.story,
        scene && scene.title,
        scene && scene.storyPurpose,
        scene && scene.sceneBeat,
        scene && scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction,
        scene && scene.locationId,
        scene && scene.timeOfDay,
        product,
        shots
    ].filter(Boolean).join(' ').toLowerCase();
}

function inferSilentFoleyPalette(scene, config, identity) {
    const t = collectSilentSceneSoundContext(scene, config, identity);
    const cues = [];
    if (/(sabun|soap|foam|busa|lather|mandi busa)/i.test(t)) cues.push('wet soap foam, bubbles popping, slick lather on skin or dish');
    if (/(air|water|cuci|wash|splash|tetes|drip|pour|tuang)/i.test(t)) cues.push('water pour, drip, and light splash with close wetness');
    if (/(kertas|paper|crinkle|bungkus|wrapping|packaging|plastik|plastic)/i.test(t)) cues.push('paper or plastic crinkle, peel, and rustle near the mic');
    if (/(kayu|wood|tap|ketuk|knock|meja kayu)/i.test(t)) cues.push('wooden tap, grain scrape, and hollow knock');
    if (/(logam|metal|sendok|spoon|fork|gelas|glass|kaca|botol kaca)/i.test(t)) cues.push('metal or glass clink, scrape, and resonant set-down');
    if (/(kain|fabric|handuk|towel|pakaian|cloth|selimut)/i.test(t)) cues.push('soft fabric rustle, fold, and brush');
    if (/(makan|chew|crunch|gigit|eat|food|kue|snack)/i.test(t)) cues.push('close-mic chewing or crunch, no spoken words');
    if (/(sikat|brush|sisir|comb|rambut|hair)/i.test(t)) cues.push('brush strokes, bristle texture, and fiber movement');
    if (/(pasir|sand|tanah|soil|batu|stone|kerikil)/i.test(t)) cues.push('grain pour, grit, and small stone shifts');
    if (/(api|fire|lilin|candle|crackl)/i.test(t)) cues.push('soft flame crackle and warm air movement');
    if (/(angin|wind|daun|leaf|hutan|forest|taman)/i.test(t)) cues.push('light wind, leaf rustle, and distant outdoor bed');
    if (/(hujan|rain)/i.test(t)) cues.push('rain on roof or window, drip into a vessel');
    if (/(tangan|hand|jari|finger|sentuh|touch|usap|rub|tap)/i.test(t)) cues.push('skin-on-object friction, finger taps, and slow tactile rubs');
    if (/(produk|product|botol|bottle|box|kotak|kemasan)/i.test(t)) cues.push('package handling, cap twist, and object set-down with contact');
    if (/(malam|night|jangkrik|cricket)/i.test(t)) cues.push('night hush with distant insects, no voices');
    if (!cues.length) {
        cues.push('precise foley of the visible hand or object contact');
        cues.push('surface texture of whatever is being touched in frame');
    }
    return Array.from(new Set(cues)).slice(0, 4);
}

function inferSilentRoomTone(scene, config, identity) {
    const t = collectSilentSceneSoundContext(scene, config, identity);
    if (/(kamar mandi|bathroom|mandi)/i.test(t)) return 'tiled bathroom ambience with short wet reflections';
    if (/(kamar|bedroom|bed|kasur)/i.test(t)) return 'quiet bedroom room tone, close and intimate';
    if (/(dapur|kitchen)/i.test(t)) return 'still kitchen air with faint appliance hum, no speech';
    if (/(hutan|forest|taman|garden|outdoor|luar)/i.test(t)) return 'soft outdoor bed: distant leaves or air, no crowd';
    if (/(studio|mic|microphone|asmr)/i.test(t)) return 'dry close-mic studio hush with a very low noise floor';
    if (/(malam|night)/i.test(t)) return 'night interior hush';
    return 'quiet interior room tone matched to the location';
}

function inferSilentSoundDesign(scene, config, identity) {
    const asmr = isAsmrAudioMode(config);
    const foley = inferSilentFoleyPalette(scene, config, identity);
    const room = inferSilentRoomTone(scene, config, identity);
    const visual = String((scene && scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction) || (scene && scene.sceneBeat) || 'the visible action');
    return {
        spokenAudio: false,
        dialogue: false,
        voiceOver: false,
        sceneEmotion: asmr ? 'calm tactile focus' : 'quiet observational presence',
        intensity: asmr ? '4/10 close-mic' : '3/10 naturalistic',
        pacing: asmr ? 'slow, lingering on texture' : 'natural scene rhythm',
        soundTexture: foley.join('; '),
        roomTone: room,
        performanceNotes: asmr
            ? 'Hands and objects move for the microphone; mouth stays closed; no whispered words.'
            : 'Characters act silently; sound comes only from environment and physical contact.',
        soundDesign: (asmr ? 'ASMR close-mic: ' : 'Non-verbal sound: ') + room + '. Foley: ' + foley.join('; ') + '. Sync to: ' + visual + '.'
    };
}

function ensureSilentSoundDesign(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes) || !isSilentAudioMode(config)) return;
    const identity = breakdown.masterVisualIdentity || {};
    breakdown.scenes.forEach(scene => {
        if (!scene || typeof scene !== 'object') return;
        const inferred = inferSilentSoundDesign(scene, config, identity);
        const existing = scene.audioDirection && typeof scene.audioDirection === 'object' ? scene.audioDirection : {};
        const generic = !existing.soundDesign || /natural ambience and scene-specific/i.test(existing.soundDesign);
        scene.audioDirection = Object.assign({}, inferred, existing, {
            spokenAudio: false,
            dialogue: false,
            voiceOver: false,
            soundDesign: generic ? inferred.soundDesign : existing.soundDesign,
            roomTone: existing.roomTone || inferred.roomTone,
            soundTexture: existing.soundTexture || inferred.soundTexture
        });
    });
}

function buildSilentAmbienceBlock(scene, config, identity) {
    const asmr = isAsmrAudioMode(config);
    const inferred = inferSilentSoundDesign(scene, config, identity || {});
    const existing = scene && scene.audioDirection || {};
    const foley = inferSilentFoleyPalette(scene, config, identity || {});
    const room = existing.roomTone || inferred.roomTone;
    const duration = String(config && config.durationPerScene || '10s');
    const action = String((scene && scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction) || (scene && scene.sceneBeat) || 'the visible physical action');
    const shotLines = Array.isArray(scene && scene.shots)
        ? scene.shots.slice(0, 8).map(shot => {
            const tc = shot.timecode || [shot.startTime, shot.endTime].filter(value => value || value === 0).join('-');
            const raw = String(shot.action || action).replace(/^Concrete visible action for [^:]+:\s*/i, '');
            return '- Shot ' + (shot.shotNumber || '') + (tc ? ' (' + tc + ')' : '') + ': foley of ' + raw;
        }).join('\n')
        : '';
    return [
        '[AUDIO / AMBIENCE & SOUND EFFECTS]',
        (asmr ? 'ASMR CLOSE-MIC BED' : 'NATURAL AMBIENCE BED') + ' — duration ' + duration + '.',
        'ROOM TONE: ' + room + '.',
        'FOLEY (sync to picture): ' + foley.join('; ') + '.',
        'SYNC TO VISIBLE ACTION: ' + action + '.',
        shotLines ? 'SHOT FOLEY:\n' + shotLines : '',
        asmr
            ? 'MIC: intimate binaural/close-mic, slow tactile detail, no whispered sentences, no mouth words, no lip-sync.'
            : 'MIC: naturalistic scene distance. No dialogue, voice-over, narration, or lip-sync.',
        'LAYER: room tone throughout; foley only when contact or motion is visible; optional music only if the user asked for it.',
        'FORBIDDEN: spoken words, whispered speech, CHARACTER_N lines, VOICEOVER, NARRATOR, CTA audio, mouth-made language.'
    ].filter(Boolean).join('\n');
}

function replaceOrAppendSilentAmbience(prompt, scene, config, identity) {
    const block = buildSilentAmbienceBlock(scene, config, identity);
    const source = String(prompt || '').trim();
    if (!source) return block;
    if (/\[AUDIO\s*\/\s*AMBIENCE/i.test(source)) {
        const generic = /Use only natural ambience, foley, music if requested, and scene-specific sound effects/i.test(source)
            || /no spoken dialogue, voice-over, narration, lip-sync, vocal performance, or audible speech\. Use only visual ambience/i.test(source);
        if (!generic) return source;
        return source.replace(/\[AUDIO\s*\/\s*AMBIENCE[^\]]*\][\s\S]*$/i, block).trim();
    }
    return source + '\n\n' + block;
}

function enforceSilentAudioMode(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes) || !isSilentAudioMode(config)) return;
    breakdown.scenes.forEach(scene => {
        if (!scene || typeof scene !== 'object') return;
        scene.dialogueOrNarration = '';
        scene.dialogueNeedsRepair = false;
        scene.dialogueViolations = [];
        scene.dialogueEngineViolations = [];
        if (scene.audioDirection && typeof scene.audioDirection === 'object') {
            scene.audioDirection = Object.assign({}, scene.audioDirection, {
                spokenAudio: false,
                dialogue: false,
                voiceOver: false
            });
        }
        const identity = breakdown.masterVisualIdentity || (state && state.directorData && state.directorData.masterVisualIdentity) || {};
        const stripSpoken = prompt => {
            if (typeof prompt !== 'string' || !prompt) return prompt;
            return prompt
                .replace(/\[AUDIO\s*\/\s*DIALOGUE\][\s\S]*?(?=\n(?:\[AUDIO\s*\/\s*AMBIENCE|NEGATIVE|ASPECT RATIO|VIDEO PROMPT|SCENE:|SETTING:|CAST:|CAMERA AND STYLE:)|$)/gi, '')
                .split('\n')
                .filter(line => !/^\s*(?:\[[^\]]+\]\s*)?(?:CHARACTER_\d+|VOICEOVER|NARRATOR|CTA)\s*:\s*["“']/.test(line))
                .join('\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        };
        if (typeof scene.masterImagePrompt === 'string') {
            scene.masterImagePrompt = stripSpoken(scene.masterImagePrompt);
        }
        if (typeof scene.masterVideoPrompt === 'string') {
            scene.masterVideoPrompt = replaceOrAppendSilentAmbience(
                stripSpoken(scene.masterVideoPrompt).replace(/\n{3,}/g, '\n\n').trim(),
                scene,
                config,
                identity
            );
        }
    });
}

function buildModeDialogueContract(config, scene) {
    if (isSilentAudioMode(config) || isCreativeMiniatureBuild(config)) {
        return isCreativeMiniatureBuild(config)
            ? 'MODE DIALOGUE CONTRACT: MINIATURE BUILD. dialogueOrNarration may stay empty. Do not invent spoken lines for assembling hands. Use construction foley only unless the user asked for speech.'
            : 'MODE DIALOGUE CONTRACT: SILENT / NO VOICE / ASMR. No spoken lines. dialogueOrNarration must stay empty. Visible characters may appear but must not speak, lip-sync, whisper words, or deliver voice-over.';
    }
    const mode = String(config && config.storyboardMode || 'custom');
    const contracts = {
        commercial: 'Every spoken line must advance hook, product proof, benefit, objection, or a natural CTA. Never use unrelated story exposition.',
        drama: buildCreativeDialogueContract(config),
        animation: 'Keep lines short and playable with visible expressive action, clear staging, and rhythmic timing. Dialogue must support the animated action, not describe a shot list.',
        shortFilm: 'Dialogue must move the character arc through setup, escalation, turning point, climax, or resolution. Avoid isolated filler.',
        education: 'Each line must teach, clarify, demonstrate, question, or summarize the selected subject. Do not invent unsupported facts.',
        documentary: 'Spoken content must distinguish observation, attributed fact, context, interview, or conclusion. Never invent a quote or claim.',
        custom: 'Dialogue must directly serve the user brief and the current scene beat.'
    };
    const duration = String(config && config.durationPerScene || '10s');
    const budget = spokenWordBudget(duration);
    const participants = scene && scene.dialoguePlan && Array.isArray(scene.dialoguePlan.participants)
        ? scene.dialoguePlan.participants.join(', ')
        : 'scene participants';
    return `MODE DIALOGUE CONTRACT (${mode}): ${isPlacePromotion(config) ? buildPlacePromotionContract(config) : (contracts[mode] || contracts.custom)} Active participants: ${participants}. Target ${budget.minWords}-${budget.maxWords} words in ${budget.minLines}-${budget.maxLines} complete playable lines for ${duration}.`;
}

function validateDialogueEngine(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes) || isSilentAudioMode(config) || isCreativeMiniatureBuild(config)) return;
    breakdown.scenes.forEach((scene, index) => {
        if (!scene || typeof scene !== 'object') return;
        const budget = dialogueWordBudget(scene, config);
        if (scene.dialogueDeferred === true) {
            scene.dialogueEngine = {
                mode: String(config && config.storyboardMode || 'custom'),
                targetWords: budget.minWords + '-' + budget.maxWords,
                targetLines: budget.minLines + '-' + budget.maxLines,
                participants: scene.dialoguePlan && Array.isArray(scene.dialoguePlan.participants)
                    ? scene.dialoguePlan.participants.filter(id => /^CHARACTER_\d+$/i.test(String(id)))
                    : [],
                contract: buildModeDialogueContract(config, scene),
                valid: null,
                deferred: true,
                violations: []
            };
            scene.dialogueEngineViolations = [];
            scene.dialogueViolations = (scene.dialogueViolations || []).filter(code => code !== 'empty_dialogue');
            scene.dialogueNeedsRepair = scene.dialogueViolations.length > 0;
            return;
        }
        const dialogue = String(scene.dialogueOrNarration || extractDialogueLines(scene.masterVideoPrompt || '') || '').trim();
        const speakers = dialogueLineSpeakers(dialogue);
        const participants = scene.dialoguePlan && Array.isArray(scene.dialoguePlan.participants)
            ? scene.dialoguePlan.participants.filter(id => /^CHARACTER_\d+$/i.test(String(id)))
            : [];
        const wordCount = dialogue.replace(/(?:\[[^\]]+\]\s*)?(?:CHARACTER_\d+|VOICEOVER|NARRATOR)\s*:\s*/gi, '')
            .split(/\s+/).filter(Boolean).length;
        const violations = [];
        if (!dialogue) violations.push('empty_dialogue');
        if (wordCount > budget.maxWords) violations.push('over_duration_word_budget');
        if (dialoguePlanExplicitlyRequiresTwoWay(scene) && participants.length >= 2) {
            const activeSpeakers = Array.from(new Set(speakers.filter(speaker => /^CHARACTER_/i.test(speaker))));
            if (activeSpeakers.length < 2) violations.push('missing_two_way_turns');
            if (speakers.some(speaker => /^(VOICEOVER|NARRATOR)$/i.test(speaker))) violations.push('voiceover_replaced_character_reply');
        }
        if (speakers.some(speaker => /^CHARACTER_/i.test(speaker) && !participants.includes(speaker))) {
            violations.push('unregistered_scene_speaker');
        }
        scene.dialogueEngine = {
            mode: String(config && config.storyboardMode || 'custom'),
            targetWords: budget.minWords + '-' + budget.maxWords,
            targetLines: budget.minLines + '-' + budget.maxLines,
            participants: participants,
            contract: buildModeDialogueContract(config, scene),
            valid: violations.length === 0,
            violations: violations
        };
        scene.dialogueEngineViolations = violations;
        const previousViolations = Array.isArray(scene.dialogueViolations) ? scene.dialogueViolations : [];
        const engineCodes = ['empty_dialogue', 'over_duration_word_budget', 'under_duration_word_budget', 'missing_two_way_turns', 'voiceover_replaced_character_reply', 'unregistered_scene_speaker', 'two_active_people_need_real_back_and_forth'];
        const retainedViolations = previousViolations.filter(code => engineCodes.indexOf(code) < 0);
        scene.dialogueViolations = Array.from(new Set(retainedViolations.concat(violations)));
        scene.dialogueNeedsRepair = scene.dialogueViolations.length > 0;
        if (violations.length) {
            console.warn('[Dialogue Engine] Scene ' + (scene.sceneNumber || index + 1) + ' violations:', violations);
        }
    });
}

function deferBlueprintDialogueUntilSceneGeneration(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes) || isSilentAudioMode(config) || isCreativeMiniatureBuild(config)) return;
    breakdown.scenes.forEach(scene => {
        if (!scene || typeof scene !== 'object') return;
        scene.dialogueOrNarration = '';
        scene.dialogueDeferred = true;
        scene.dialogueNeedsRepair = false;
        scene.dialogueViolations = [];
        scene.dialogueEngineViolations = [];
        if (!scene.dialogueSource) scene.dialogueSource = 'scene-generation-pending';
    });
}

function sceneRequiresSingleSpeaker(scene, config) {
    if (scene && scene._singleCharacterFinalAftermath === true) return true;
    if (sceneRequiresInteractiveDialogue(scene, config)) return false;
    const participants = scene && scene.dialoguePlan && Array.isArray(scene.dialoguePlan.participants)
        ? scene.dialoguePlan.participants.filter(participant => /^CHARACTER_\d+$/i.test(String(participant)))
        : [];
    if (participants.length === 1) return true;
    const requested = storyRequestedCastCount(config && config.story);
    return requested === 1 || (requested === 0 && !!(config && config.characterReference && config.characterReference.length));
}

function sceneHasTwoActiveSpeakers(scene) {
    if (dialoguePlanExplicitlyRequiresTwoWay(scene)) return true;
    // V5.0 (Dialog Fix): kalau plan sudah mendaftarkan 2+ peserta CHARACTER_N,
    // hormati itu sebagai sinyal 2-speaker — bahkan ketika mode/turnPattern
    // belum di-flag "two-way" oleh Director. Sebelumnya gate ini return false
    // untuk scene Tony-Aisah (participants=2 tapi mode default), sehingga
    // violation "two_active_people_need_real_back_and_forth" tidak pernah fire.
    const participants = scene && scene.dialoguePlan && Array.isArray(scene.dialoguePlan.participants)
        ? scene.dialoguePlan.participants.filter(p => /^CHARACTER_\d+$/i.test(String(p)))
        : [];
    return participants.length >= 2;
}

function sceneReferencesTwoCharacters(scene) {
    const text = [
        scene && scene.title,
        scene && scene.storyPurpose,
        scene && scene.sceneBeat,
        scene && scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction,
        scene && scene.dialoguePlan && scene.dialoguePlan.relationship
    ].filter(Boolean).join(' ');
    return /\bCHARACTER_1\b[\s\S]{0,500}\bCHARACTER_2\b|\bCHARACTER_2\b[\s\S]{0,500}\bCHARACTER_1\b/i.test(text);
}

// V5.0 (Dialog Fix): deteksi apakah scene menyebut 2+ nama karakter terdaftar
// (speakerName/characterId/role) di text scene. Return { count, ids } — count >= 2
// artinya scene menampilkan 2+ karakter berbeda secara eksplisit (Tony menghampiri
// Aisah, Rina memanggil Ibunya, dll). Sebelumnya sceneReferencesTwoCharacters hanya
// trigger kalau scene sudah pakai string "CHARACTER_1" / "CHARACTER_2" literal,
// sehingga scene Tony-Aisah dengan deskripsi nama generik tidak pernah 2+ pilihan.
// Pola regex: word boundary di awal, plus possessive suffix optional (ayahnya,
// ibunya, suamiku, dll) — possessive -nya/-ku/-mu common di bahasa Indonesia.
function sceneMentionsMultipleCastNames(scene, roster) {
    if (!scene || !Array.isArray(roster) || roster.length < 2) return { count: 0, ids: [] };
    const text = [
        scene.title,
        scene.storyPurpose,
        scene.sceneBeat,
        scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction,
        scene.dialoguePlan && scene.dialoguePlan.relationship,
        scene.dialoguePlan && scene.dialoguePlan.visualAnchor,
        scene.continuityFromPrevious,
        scene.continuityToNext
    ].filter(Boolean).join(' ');
    if (!text) return { count: 0, ids: [] };
    const matched = new Set();
    roster.forEach((character, index) => {
        if (!character) return;
        const id = String(character.characterId || ('CHARACTER_' + (index + 1))).toUpperCase();
        const aliases = [
            character.speakerName,
            character.name,
            character.role,
            String(character.characterId || '')
        ].filter(Boolean).map(alias => String(alias).trim().toLowerCase()).filter(alias => alias.length >= 3);
        for (const alias of aliases) {
            // Word boundary di awal + optional possessive suffix di akhir.
            // Hindari false positive: 'rina' tidak match di 'Marina' karena \b.
            const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const wordRegex = new RegExp('\\b' + escaped + '(?:nya|ku|mu)?\\b', 'i');
            if (wordRegex.test(text)) {
                matched.add(id);
                break;
            }
        }
    });
    const ids = Array.from(matched);
    return { count: ids.length, ids: ids };
}

function sanitizeFallbackSubject(rawSubject) {
    // V5.0 (Isu #3 follow-up): the fallback subject used to be
    // raw sceneBeat / storyPurpose text, which often contained
    // English story fragments the user pasted in ("Rina types
    // rapidly, enjoying the sound of her new mechanical keyboard").
    // Those fragments then leaked into the dialog as raw quoted
    // text. Now: strip anything that looks like raw prompt bleed,
    // collapse the remaining Indonesian phrase, and fall back to
    // a neutral subject if the result is empty or still looks
    // like an English heavy prompt.
    const source = String(rawSubject || '').replace(/["\r\n]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!source) return 'momen ini';
    const tokens = source.split(' ');
    const englishHeavy = tokens.filter(token => /^[a-zA-Z][a-zA-Z'-]*$/.test(token) && !['dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'dengan', 'yang', 'ini', 'itu', 'saya', 'aku', 'kamu', 'mereka'].includes(token.toLowerCase())).length;
    const isPromptBleed = englishHeavy / Math.max(1, tokens.length) > 0.4
        || /^(?:rina|cin|custom|scene|adegan|shot|panel|prompt)/i.test(source)
        || /\b(?:types?\s+rapidly|enjoying\s+the\s+sound|frustrated\s+with|ghosting|mechanical\s+keyboard)/i.test(source);
    if (isPromptBleed) return 'produknya';
    const clipped = source.length > 36 ? source.slice(0, 33) + '...' : source;
    return clipped;
}

// V5.0 (D-2): scan user story for product / subject nouns so the
// fallback template can be specific ("keyboard", "sepatu", "tas",
// "hp", etc.) instead of the generic "produknya". Returns an
// array of lowercase keywords in order of appearance. Empty if
// the story has no recognisable product noun.
function extractUserStoryKeywords(config) {
    const story = String(config && config.story || '');
    if (!story) return [];
    const productPattern = new RegExp('\\b(?:keyboard|mouse|laptop|hp|handphone|smartphone|tablet|sepatu|sandal|tas|ransel|selempang|baju|kaos|kemeja|celana|rok|jaket|hoodie|sweater|jam\\s+tangan|kacamata|headset|earphone|speaker|monitor|tv|kamera|drone|router|modem|charger|kabel\\s+data|powerbank|dompet|ikat\\s+pinggang|parfum|sabun|shampoo|kosmetik|skincare|lotion|serum|obat|vitamin|minyak\\s+goreng|biskuit|kopi|teh|air\\s+mineral|susu|roti|lampu|kunci|gembok|payung|topi|gelang|kalung|cincin|anting|figure|action\\s+figure|boardgame|puzzle|mainan|kendaraan|mobil|motor|sepeda|skuter|sepeda\\s+listrik|skuter\\s+listrik|helm|ban|sadel|rantai|rem|karpet|sarung|bantal|guling|selimut|handuk|sprei|tirai|gorden|sapu|pel|ember|botol|gelas|piring|mangkuk|sendok|garpu|panci|wajan|kompor|setrika|lemari|meja|kursi|rak|lemari\\s+es|ac|kipas\\s+angin|dispenser|water\\s+heater|rice\\s+cooker|blender|mixer|toaster|microwave|oven|kulkas|vacuum\\s+cleaner|mesin\\s+cuci)\\b', 'gi');
    const matches = story.match(productPattern) || [];
    const deduped = [];
    matches.forEach(match => {
        const lower = String(match).toLowerCase().trim();
        if (lower && deduped.indexOf(lower) === -1) deduped.push(lower);
    });
    return deduped;
}

// V5.0 (D-1): extract keywords from scene context (beat, visual
// action, story purpose) so we can check whether the dialog
// actually references the scene content. Returns a Set of
// normalised (lowercase, length>=4, no-stopword) tokens.
function extractSceneContextKeywords(scene) {
    const text = [
        scene && scene.title,
        scene && scene.storyPurpose,
        scene && scene.sceneBeat,
        scene && scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction,
        scene && scene.dialoguePlan && scene.dialoguePlan.linePurpose,
        scene && scene.dialoguePlan && scene.dialoguePlan.sceneIntent,
        scene && scene.dialoguePlan && scene.dialoguePlan.dramaticObjective
    ].filter(Boolean).join(' ').toLowerCase();
    if (!text) return new Set();
    const stopwords = new Set(['yang', 'untuk', 'dengan', 'tidak', 'dari', 'kamu', 'aku', 'saya', 'atau', 'ini', 'itu', 'akan', 'telah', 'sedang', 'masih', 'sudah', 'belum', 'bisa', 'dapat', 'harus', 'mau', 'ingin', 'hendak', 'sangat', 'sekali', 'pada', 'dalam', 'oleh', 'antara', 'tetapi', 'melainkan', 'sedangkan', 'yakni', 'bahwa', 'adalah', 'yaitu', 'kita', 'mereka', 'kami', 'beliau', 'ia', 'dia', 'lagi', 'juga', 'hanya', 'saja', 'bahkan', 'justru', 'kemudian', 'setelah', 'sebelum', 'ketika', 'saat', 'waktu', 'tempat', 'orang', 'anak', 'pria', 'wanita', 'perempuan', 'laki', 'seorang', 'sang', 'si', 'pak', 'bu', 'mas', 'mbak', 'om', 'tante', 'adek', 'kakak', 'adik', 'ayah', 'ibu', 'bapak', 'kak', 'dek', 'bang', 'juga']);
    const tokens = text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const result = new Set();
    tokens.forEach(token => {
        if (token.length >= 4 && !stopwords.has(token)) result.add(token);
    });
    return result;
}

// V5.0 (D-1): check whether a candidate dialog references the
// scene context. Returns { matches: [...keywords matched], ratio }.
// Used by both the violation gate and the post-audit fallback
// to prefer specific output.
function dialogueReferencesSceneContext(dialogue, scene) {
    const text = String(dialogue || '').toLowerCase();
    const keywords = extractSceneContextKeywords(scene);
    if (!keywords.size) return { matches: [], ratio: 1, hasContext: false };
    const matches = [];
    keywords.forEach(keyword => {
        if (text.indexOf(keyword) !== -1) matches.push(keyword);
    });
    return {
        matches,
        ratio: matches.length / keywords.size,
        hasContext: true
    };
}

// V5.0 (D-2): pick the most concrete topic word available for
// the fallback template. Priority: 1) recognised product nouns
// from the user story (keyboard, sepatu, tas, hp, ...), 2) the
// longest concrete keyword from the scene context, 3) generic
// "produknya" as last resort. Picking the longest context keyword
// (when no product noun is found) tends to surface concrete
// scene-relevant words instead of stopwords like "mau" / "kali".
function pickFallbackTopic(config, scene) {
    const userKeywords = extractUserStoryKeywords(config);
    if (userKeywords.length) return userKeywords[0];
    const sceneKeywords = Array.from(extractSceneContextKeywords(scene))
        .filter(keyword => keyword.length >= 5)
        .sort((a, b) => b.length - a.length);
    if (sceneKeywords.length) return sceneKeywords[0];
    return 'produknya';
}

// V5.0 (D-3): pick one of several template variants at random
// so repeated regenerations of the same scene don't all collapse
// to the same "templated" line. Variants are kept short and
// grammatically equivalent so the post-audit fallback still
// passes the structure checks.
function pickVariant(variants) {
    if (!Array.isArray(variants) || !variants.length) return '';
    return variants[Math.floor(Math.random() * variants.length)];
}

// V5.0 (S-1): derive the target number of fallback lines from the
// user-selected scene duration. Earlier the helper always
// returned a single short line (~8 words), leaving a 10s scene
// with a 3-second gap of silence. Word budget per scene is
// defined in `spokenWordBudget` and `dialogueWordBudget`; we
// reuse those targets here so the fallback respects the same
// duration rule that Gemini is told to follow.
function pickFallbackLineCount(duration, interactive) {
    const d = String(duration || '10s');
    // V5.0 (Dialog Fix): multi-speaker butuh lebih banyak baris untuk back-and-forth.
    // Single-speaker tetap ringkas.
    if (interactive) {
        if (d.indexOf('5') === 0) return 2;
        if (d.indexOf('8') === 0) return 3;
        if (d.indexOf('10') === 0) return 4;
        if (d.indexOf('15') === 0) return 4;
        return 6; // 30s+
    }
    if (d.indexOf('5') === 0) return 1;
    if (d.indexOf('8') === 0) return 2;
    if (d.indexOf('10') === 0) return 3;
    if (d.indexOf('15') === 0) return 3;
    if (d.indexOf('30') === 0) return 4;
    return 4;
}

// V5.0 (S-3): detect whether the current storyboard mode is a
// commercial / advertisement. The fallback uses this to switch
// into a hook → body → soft-close persuasion structure instead
// of the neutral informational structure.
function isCommercialSceneContext(config) {
    if (!config) return false;
    const storyboardMode = String(config.storyboardMode || '').toLowerCase();
    if (storyboardMode === 'commercial') return true;
    if (detectCommercialIntent(config.story)) return true;
    if (isPlacePromotion(config)) return true;
    return false;
}

// V5.0 (S-1 + S-2 + S-3): single-speaker multi-line templates.
// Each scene function has duration-aware variants (1 / 2 / 3-4
// lines) plus an optional commercial-persuasion variant. The
// caller picks the variant matching the user-selected duration
// and audio mode so a 10s scene always emits 2-3 short lines
// rather than one short line with several seconds of silence.
function singleSpeakerTemplates(sceneFunction, S, topic, duration, config) {
    const commercial = isCommercialSceneContext(config);
    const intro = {
        1: [
                '[antusias] ' + S + ': "Hai, aku mau bahas ' + topic + ' yang biasanya orang lewatin."'
            ],
        2: [
                '[antusias] ' + S + ': "Hai, aku bahas ' + topic + ' yang biasanya orang lewatin."\n[fokus] ' + S + ': "' + topic + ' ini punya keunggulan yang jarang kamu temuin."',
                '[ramah] ' + S + ': ' + (commercial ? '"Aku pengen cerita soal ' + topic + ' hari ini dan kenapa ini beda."\n[fokus] ' + S + ': "' + topic + ' ini layak kamu cek sendiri, aku udah buktikan."' : '"Aku pengen cerita soal ' + topic + ' hari ini."\n[fokus] ' + S + ': "' + topic + ' ini biasanya bikin orang penasaran."')
            ],
        3: [
                '[antusias] ' + S + ': "Hai, aku bahas ' + topic + ' yang biasanya orang lewatin."\n[fokus] ' + S + ': "' + topic + ' ini punya keunggulan yang jarang kamu temuin di tempat lain."\n[tertarik] ' + S + ': "Yuk, aku tunjukin kenapa ' + topic + ' ini worth it."',
                commercial
                    ? '[ramah] ' + S + ': ' + '"Aku pengen cerita soal ' + topic + ' hari ini."\n[fokus] ' + S + ': "' + topic + ' ini beda dari yang lain, aku udah buktikan sendiri."\n[hangat] ' + S + ': "Yuk, kamu cek dulu sebelum putuskan."'
                    : '[ramah] ' + S + ': ' + '"Aku pengen cerita soal ' + topic + ' hari ini."\n[fokus] ' + S + ': "' + topic + ' ini biasanya bikin orang penasaran."\n[tertarik] ' + S + ': "Lanjut, biar aku jelasin detailnya."'
            ],
        4: [
                '[antusias] ' + S + ': "Hai, aku bahas ' + topic + ' yang biasanya orang lewatin."\n[fokus] ' + S + ': "' + topic + ' ini punya keunggulan yang jarang kamu temuin di tempat lain."\n[serius] ' + S + ': "Aku udah coba sendiri dan ' + topic + ' ini bener-bener bantu."\n[hangat] ' + S + ': "Yuk, aku tunjukin kenapa ' + topic + ' ini layak kamu cek sekarang."'
            ]
    };
    const farewell = {
        1: [
                '[hangat] ' + S + ': "Oke, segitu dulu info soal ' + topic + ' hari ini."'
            ],
        2: [
                '[hangat] ' + S + ': "Oke, segitu dulu info soal ' + topic + ' hari ini."\n[santai] ' + S + ': "Kita cukupkan sampai sini dulu ya."',
                '[ramah] ' + S + ': "Sampai sini dulu cerita soal ' + topic + '."\n[hangat] ' + S + ': "Sampai jumpa, mudah-mudahan bermanfaat."'
            ],
        3: [
                '[hangat] ' + S + ': "Oke, segitu dulu info soal ' + topic + ' hari ini."\n[santai] ' + S + ': ' + (commercial ? '"Biar kamu coba sendiri ' + topic + ' ini."\n[positif] ' + S + ": " + (commercial ? '"Ayo, jangan sampai kehabisan."' : '"Semoga hari kamu menyenangkan."') : '"Kita cukupkan sampai sini dulu ya."\n[positif] ' + S + ': "Semoga hari kamu menyenangkan."')
            ],
        4: [
                '[hangat] ' + S + ': "Oke, segitu dulu info soal ' + topic + ' hari ini."\n[santai] ' + S + ': "Aku udah bahas poin-poin pentingnya."\n[positif] ' + S + ': "Semoga kamu sekarang punya gambaran yang lebih jelas."\n[ramah] ' + S + ': "Sampai ketemu di kesempatan berikutnya ya."'
            ]
    };
    const consultation = {
        1: [
                '[fokus] ' + S + ': "Biar aku jelasin dulu poin-poin soal ' + topic + '."'
            ],
        2: [
                '[fokus] ' + S + ': "Biar aku jelasin dulu poin-poin soal ' + topic + '."\n[siap] ' + S + ': "Tanya aja, aku bantu jawab."',
                '[siap] ' + S + ': "Tanya aja soal ' + topic + '."\n[fokus] ' + S + ': "Aku bantu jelasin dari awal sampai akhir."'
            ],
        3: [
                '[fokus] ' + S + ': "Biar aku jelasin dulu poin-poin soal ' + topic + '."\n[siap] ' + S + ': "Tanya aja, aku bantu jawab."\n[hangat] ' + S + ': "Aku mau pastiin kamu paham detailnya."'
            ],
        4: [
                '[fokus] ' + S + ': "Biar aku jelasin dulu poin-poin soal ' + topic + '."\n[siap] ' + S + ': "Tanya aja, aku bantu jawab."\n[hangat] ' + S + ': "Aku mau pastiin kamu paham detailnya."\n[netral] ' + S + ': "Kalau ada yang kurang jelas, aku ulangi pelan-pelan."'
            ]
    };
    const negotiation = {
        1: [
                '[berhitung] ' + S + ': "Oke, kita hitung dulu angka-angka buat ' + topic + '."'
            ],
        2: [
                '[tegas] ' + S + ': "Aku butuh kepastian dulu soal ' + topic + '."\n[berhitung] ' + S + ': "Kita hitung bareng biar angkanya pas."',
                '[netral] ' + S + ': "Untuk ' + topic + ', kita perlu angka yang pas."\n[tegas] ' + S + ': "Tawarmu belum cukup, aku butuh lebih."'
            ],
        3: [
                '[tegas] ' + S + ': "Aku butuh kepastian dulu soal ' + topic + '."\n[berhitung] ' + S + ': "Kita hitung bareng biar angkanya pas."\n[netral] ' + S + ': "Kita sepakati dulu ketentuannya."'
            ],
        4: [
                '[tegas] ' + S + ': "Aku butuh kepastian dulu soal ' + topic + '."\n[berhitung] ' + S + ': "Kita hitung bareng biar angkanya pas."\n[netral] ' + S + ': "Kita sepakati dulu ketentuannya."\n[hangat] ' + S + ': "Kalau udah cocok, aku lanjut."'
            ]
    };
    const conflict = {
        1: [
                '[tegang] ' + S + ': "Aku harus ambil sikap soal ' + topic + ' sekarang."'
            ],
        2: [
                '[tegang] ' + S + ': "Aku harus ambil sikap soal ' + topic + ' sekarang."\n[marah] ' + S + ': "Ini udah lewat batas, kita harus selesaikan."',
                '[marah] ' + S + ': "Ini soal ' + topic + ', kita harus selesaikan sekarang."\n[tegang] ' + S + ': "Aku dengar kamu, tapi ini udah lewat waktu."'
            ],
        3: [
                '[tegang] ' + S + ': "Aku harus ambil sikap soal ' + topic + ' sekarang."\n[marah] ' + S + ': "Ini udah lewat batas, kita harus selesaikan."\n[netral] ' + S + ': "Aku mau jelasin sudut pandangnya, dengarkan dulu."'
            ],
        4: [
                '[tegang] ' + S + ': "Aku harus ambil sikap soal ' + topic + ' sekarang."\n[marah] ' + S + ': "Ini udah lewat batas, kita harus selesaikan."\n[netral] ' + S + ': "Aku mau jelasin sudut pandangnya, dengarkan dulu."\n[tegas] ' + S + ': "Setelah itu kita putuskan bareng."'
            ]
    };
    const emotionalExchange = {
        1: [
                '[tenang] ' + S + ': "Aku perlu waktu buat mikirin ' + topic + ' ini dulu."'
            ],
        2: [
                '[tenang] ' + S + ': "Aku perlu waktu buat mikirin ' + topic + ' ini dulu."\n[reflektif] ' + S + ': "Soal ' + topic + ' ini, aku belum yakin jawabannya."'
            ],
        3: [
                '[tenang] ' + S + ': "Aku perlu waktu buat mikirin ' + topic + ' ini dulu."\n[reflektif] ' + S + ': "Soal ' + topic + ' ini, aku belum yakin jawabannya."\n[lembut] ' + S + ': "Tapi aku mau coba dulu."'
            ],
        4: [
                '[tenang] ' + S + ': "Aku perlu waktu buat mikirin ' + topic + ' ini dulu."\n[reflektif] ' + S + ': "Soal ' + topic + ' ini, aku belum yakin jawabannya."\n[lembut] ' + S + ': "Tapi aku mau coba dulu."\n[hangat] ' + S + ': "Kamu doain ya biar hasilnya bagus."'
            ]
    };
    const defaultTemplates = {
        1: [
                '[netral] ' + S + ': "Ini momen yang tepat buat bahas ' + topic + '."'
            ],
        2: [
                '[netral] ' + S + ': "Ini momen yang tepat buat bahas ' + topic + '."\n[fokus] ' + S + ': "Aku mau jelasin detailnya."',
                '[santai] ' + S + ': ' + (commercial ? '"Aku bahas ' + topic + ' bareng kamu di sini."\n[netral] ' + S + ': "' + topic + ' ini worth it kamu cek."' : '"Aku bahas ' + topic + ' bareng kamu di sini."\n[netral] ' + S + ': "Coba kita lihat dari awal."')
            ],
        3: [
                '[netral] ' + S + ': "Ini momen yang tepat buat bahas ' + topic + '."\n[fokus] ' + S + ': "Aku mau jelasin detailnya."\n[tertarik] ' + S + ': "Lanjut, biar aku mulai dari sekarang."'
            ],
        4: [
                '[netral] ' + S + ': "Ini momen yang tepat buat bahas ' + topic + '."\n[fokus] ' + S + ': "Aku mau jelasin detailnya."\n[tertarik] ' + S + ': "Lanjut, biar aku mulai dari sekarang."\n[hangat] ' + S + ': "Kamu pasti dapet insight yang berguna."'
            ]
    };
    const map = {
        introduction: intro,
        farewell: farewell,
        'emotional exchange': emotionalExchange,
        consultation: consultation,
        negotiation: negotiation,
        conflict: conflict,
        'scene exchange': defaultTemplates
    };
    const slot = map[sceneFunction] || defaultTemplates;
    return slot[duration] || slot[Math.max(...Object.keys(slot).map(Number).filter(n => n <= duration))] || slot[1];
}

function buildFallbackSceneAudio(scene, config, interactive) {
    if (!scene || isSilentAudioMode(config) || isCreativeMiniatureBuild(config)) return '';
    const sceneFunction = dialogueSceneFunction(scene).name;
    const isAftermath = sceneFunction === 'farewell'
        || (Number(scene && scene.sceneNumber) === Number(config && config.sceneCount) && sceneFunction === 'emotional exchange');
    const speakerOne = (activeSceneCharacterIds(scene)[0]) || 'CHARACTER_1';
    // V5.0 (D-2): prefer concrete topic over generic "produknya".
    const topic = pickFallbackTopic(config, scene);
    // V5.0 (S-1 + Dialog Fix): pass `interactive` agar multi-speaker dapat lebih banyak baris.
    const targetLines = pickFallbackLineCount(config && config.durationPerScene, interactive);

    // V5.0 (S-2 + S-3): single-speaker fallback now emits
    // multiple short lines tuned to the duration, with an
    // optional commercial-persuasion structure (hook → body →
    // close) for ads. Variants are randomised via pickVariant so
    // repeated regenerations show different output.
    if (!interactive && !isAftermath) {
        const variants = singleSpeakerTemplates(sceneFunction, speakerOne, topic, targetLines, config);
        return pickVariant(variants);
    }

    if (interactive) {
        const activeIds = activeSceneCharacterIds(scene);
        const speakerTwo = activeIds[1] || 'CHARACTER_2';
        const commercial = isCommercialSceneContext(config);
        const buildMulti = (lines) => lines.map((line, idx) => (idx % 2 === 0 ? '[' + line.emo + '] ' + speakerOne : '[' + line.emo + '] ' + speakerTwo) + ': "' + line.text + '"').join('\n');
        // For multi-speaker we don't use singleSpeakerTemplates
        // because the turn structure differs. Build directly from
        // duration-aware inline variants so each scene function
        // matches the same target line count.
        const mul = (function() {
            const s1 = speakerOne;
            const s2 = speakerTwo;
            switch (sceneFunction) {
                case 'introduction':
                    if (targetLines <= 2) return pickVariant([
                        buildMulti([{ emo: 'ramah', text: 'Kita bahas ' + topic + ' sekarang.' }, { emo: 'tertarik', text: 'Baik, aku siap dengerin.' }]),
                        buildMulti([{ emo: 'netral', text: 'Aku mau mulai dari ' + topic + '.' }, { emo: 'siap', text: 'Lanjutkan, aku dengar.' }])
                    ]);
                    if (targetLines <= 3) return pickVariant([
                        buildMulti([{ emo: 'ramah', text: 'Kita bahas ' + topic + ' sekarang.' }, { emo: 'tertarik', text: 'Baik, aku siap dengerin.' }, { emo: 'fokus', text: 'Aku mulai dari kenapa ' + topic + ' ini beda.' }]),
                        commercial
                            ? buildMulti([{ emo: 'antusias', text: 'Hai, aku mau bahas ' + topic + ' yang biasanya orang lewatin.' }, { emo: 'tertarik', text: 'Wah, kenapa?' }, { emo: 'fokus', text: 'Karena ' + topic + ' ini punya keunggulan yang jarang kamu temuin.' }])
                            : buildMulti([{ emo: 'antusias', text: 'Hai, aku mau bahas ' + topic + ' hari ini.' }, { emo: 'tertarik', text: 'Wah, kenapa?' }, { emo: 'fokus', text: 'Karena ' + topic + ' ini sering bikin orang penasaran.' }])
                    ]);
                    return pickVariant([
                        buildMulti([{ emo: 'ramah', text: 'Kita bahas ' + topic + ' sekarang.' }, { emo: 'tertarik', text: 'Baik, aku siap dengerin.' }, { emo: 'fokus', text: 'Aku mulai dari kenapa ' + topic + ' ini beda.' }, { emo: 'siap', text: 'Silakan, aku dengerin.' }]),
                        commercial
                            ? buildMulti([{ emo: 'antusias', text: 'Hai, aku mau bahas ' + topic + ' yang biasanya orang lewatin.' }, { emo: 'tertarik', text: 'Wah, kenapa?' }, { emo: 'fokus', text: 'Karena ' + topic + ' ini punya keunggulan yang jarang kamu temuin.' }, { emo: 'hangat', text: 'Yuk, kamu cek sendiri sebelum putuskan.' }])
                            : buildMulti([{ emo: 'antusias', text: 'Hai, aku mau bahas ' + topic + ' hari ini.' }, { emo: 'tertarik', text: 'Wah, kenapa?' }, { emo: 'fokus', text: 'Karena ' + topic + ' ini sering bikin orang penasaran.' }, { emo: 'siap', text: 'Lanjut, aku dengerin.' }])
                    ]);
                case 'farewell':
                    if (targetLines <= 2) return pickVariant([
                        buildMulti([{ emo: 'lega', text: 'Sampai jumpa, ' + topic + '.' }, { emo: 'hangat', text: 'Aku doakan yang terbaik buat kamu.' }]),
                        buildMulti([{ emo: 'hangat', text: 'Oke, kita cukupkan sampai di sini untuk ' + topic + '.' }, { emo: 'ramah', text: 'Setuju, sampai jumpa.' }])
                    ]);
                    return pickVariant([
                        buildMulti([{ emo: 'lega', text: 'Sampai jumpa, ' + topic + '.' }, { emo: 'hangat', text: 'Aku doakan yang terbaik buat kamu.' }, { emo: 'santai', text: 'Semoga harimu menyenangkan.' }]),
                        buildMulti([{ emo: 'hangat', text: 'Oke, kita cukupkan sampai di sini untuk ' + topic + '.' }, { emo: 'ramah', text: 'Setuju, sampai jumpa.' }, { emo: 'positif', text: 'Semoga ' + topic + ' bermanfaat buat kamu.' }])
                    ]);
                case 'emotional exchange':
                    if (targetLines <= 2) return pickVariant([
                        buildMulti([{ emo: 'tenang', text: 'Aku tahu ini soal ' + topic + '.' }, { emo: 'terbuka', text: 'Aku dengar kamu. Ceritakan lebih jauh.' }]),
                        buildMulti([{ emo: 'lembut', text: 'Tentang ' + topic + ', aku butuh waktu.' }, { emo: 'tenang', text: 'Oke, aku ngerti.' }])
                    ]);
                    return pickVariant([
                        buildMulti([{ emo: 'tenang', text: 'Aku tahu ini soal ' + topic + '.' }, { emo: 'terbuka', text: 'Aku dengar kamu. Ceritakan lebih jauh.' }, { emo: 'lembut', text: 'Aku ngerti perasaan kamu.' }]),
                        buildMulti([{ emo: 'lembut', text: 'Tentang ' + topic + ', aku butuh waktu.' }, { emo: 'tenang', text: 'Oke, aku ngerti.' }, { emo: 'hangat', text: 'Kita jalanin pelan-pelan ya.' }])
                    ]);
                case 'consultation':
                    if (targetLines <= 2) return pickVariant([
                        buildMulti([{ emo: 'fokus', text: 'Soal ' + topic + ', aku butuh penjelasan.' }, { emo: 'siap', text: 'Oke, aku jelaskan dari awal.' }]),
                        buildMulti([{ emo: 'netral', text: 'Tolong jelasin detail ' + topic + '.' }, { emo: 'fokus', text: 'Aku coba jabarkan.' }])
                    ]);
                    return pickVariant([
                        buildMulti([{ emo: 'fokus', text: 'Soal ' + topic + ', aku butuh penjelasan.' }, { emo: 'siap', text: 'Oke, aku jelaskan dari awal.' }, { emo: 'tertarik', text: 'Aku mau pastiin kamu paham detailnya.' }]),
                        buildMulti([{ emo: 'netral', text: 'Tolong jelasin detail ' + topic + '.' }, { emo: 'fokus', text: 'Aku coba jabarkan.' }, { emo: 'siap', text: 'Tanya aja, aku bantu jawab.' }])
                    ]);
                case 'negotiation':
                    if (targetLines <= 2) return pickVariant([
                        buildMulti([{ emo: 'tegas', text: 'Kita harus selesaikan ' + topic + ' hari ini.' }, { emo: 'berhitung', text: 'Aku dengar tawaranmu, tapi syaratnya belum pas.' }]),
                        buildMulti([{ emo: 'netral', text: 'Untuk ' + topic + ', kita perlu angka yang pas.' }, { emo: 'tegas', text: 'Tawarmu belum cukup.' }])
                    ]);
                    return pickVariant([
                        buildMulti([{ emo: 'tegas', text: 'Kita harus selesaikan ' + topic + ' hari ini.' }, { emo: 'berhitung', text: 'Aku dengar tawaranmu, tapi syaratnya belum pas.' }, { emo: 'netral', text: 'Kita sepakati dulu ketentuannya.' }]),
                        buildMulti([{ emo: 'netral', text: 'Untuk ' + topic + ', kita perlu angka yang pas.' }, { emo: 'tegas', text: 'Tawarmu belum cukup.' }, { emo: 'hangat', text: 'Kalau udah cocok, kita lanjut.' }])
                    ]);
                case 'conflict':
                    if (targetLines <= 2) return pickVariant([
                        buildMulti([{ emo: 'tegang', text: 'Soal ' + topic + ', kita harus bicara sekarang.' }, { emo: 'menahan emosi', text: 'Aku dengar, kita cari jalan keluarnya.' }]),
                        buildMulti([{ emo: 'marah', text: 'Untuk ' + topic + ', aku butuh jawaban.' }, { emo: 'tegang', text: 'Aku juga butuh penjelasan.' }])
                    ]);
                    return pickVariant([
                        buildMulti([{ emo: 'tegang', text: 'Soal ' + topic + ', kita harus bicara sekarang.' }, { emo: 'menahan emosi', text: 'Aku dengar, kita cari jalan keluarnya.' }, { emo: 'netral', text: 'Kita dengerin dulu sudut pandang masing-masing.' }]),
                        buildMulti([{ emo: 'marah', text: 'Untuk ' + topic + ', aku butuh jawaban.' }, { emo: 'tegang', text: 'Aku juga butuh penjelasan.' }, { emo: 'serius', text: 'Kita putusin sekarang, gak bisa nunggu lagi.' }])
                    ]);
                default:
                    if (targetLines <= 2) return pickVariant([
                        buildMulti([{ emo: 'netral', text: 'Ini soal ' + topic + '.' }, { emo: 'siap', text: 'Lanjutkan, aku dengar.' }]),
                        buildMulti([{ emo: 'netral', text: 'Kita masuk ke ' + topic + ' sekarang.' }, { emo: 'siap', text: 'Oke, aku ngerti.' }])
                    ]);
                    return pickVariant([
                        buildMulti([{ emo: 'netral', text: 'Ini soal ' + topic + '.' }, { emo: 'siap', text: 'Lanjutkan, aku dengar.' }, { emo: 'fokus', text: 'Aku mau dengar detail lengkapnya.' }]),
                        commercial
                            ? buildMulti([{ emo: 'antusias', text: 'Hai, aku bahas ' + topic + ' yang biasanya orang lewatin.' }, { emo: 'tertarik', text: 'Wah, kenapa?' }, { emo: 'fokus', text: 'Karena ' + topic + ' ini beda dari yang lain.' }])
                            : buildMulti([{ emo: 'antusias', text: 'Hai, aku bahas ' + topic + ' hari ini.' }, { emo: 'tertarik', text: 'Wah, kenapa?' }, { emo: 'fokus', text: 'Karena ' + topic + ' ini menarik untuk dibahas.' }])
                    ]);
            }
        })();
        return mul;
    }
    if (isAftermath) {
        return '[menyesal] CHARACTER_1: "Andai saja aku bicara dari awal tentang ' + topic + '..."';
    }
    return '';
}

function ensureInteractiveDialogueFallbacks(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes) || isSilentAudioMode(config) || creativeShapeSkipsInteractive(config)) return;
    breakdown.scenes.forEach((scene, index) => {
        if (!scene || scene._singleCharacterFinalAftermath) return;
        if (scene.dialogueDeferred === true) return;
        const interactive = sceneRequiresInteractiveDialogue(scene, config) || sceneHasTwoActiveSpeakers(scene);
        if (!interactive || hasValidInteractiveDialogue(scene.dialogueOrNarration, scene, config, true)) return;
        const fallback = buildFallbackSceneAudio(scene, config, true);
        const candidate = prepareInteractiveDialogueCandidate(fallback, scene, config, breakdown.masterVisualIdentity);
        if (!hasValidInteractiveDialogue(candidate, scene, config, true)) {
            console.warn('[Dialogue Fallback] Scene ' + (scene.sceneNumber || index + 1) + ' two-way dialogue could not be formed; visual generation continues.');
            scene.dialogueNeedsRepair = true;
            scene.dialogueViolations = Array.from(new Set((scene.dialogueViolations || []).concat(['two_active_people_need_real_back_and_forth'])));
            return;
        }
        scene.dialogueOrNarration = candidate;
        scene.dialogueNeedsRepair = false;
        scene.dialogueViolations = [];
        scene.dialogueEngineViolations = [];
        scene.dialogueRepairSource = 'deterministic scene-beat fallback';
    });
}

function ensureSceneCharacterRoster(breakdown, config) {
    if (!breakdown) return;
    if (!breakdown.masterVisualIdentity || typeof breakdown.masterVisualIdentity !== 'object') breakdown.masterVisualIdentity = {};
    const identity = breakdown.masterVisualIdentity;
    if (!Array.isArray(identity.characters)) identity.characters = [];
    // V5.0 (Isu #1): persistent voice bindings live on identity so
    // they survive scene-by-scene regeneration of character objects.
    if (!identity.voiceBindings || typeof identity.voiceBindings !== 'object') identity.voiceBindings = {};
    const storyText = String(config && config.story || '');
    // Single-speaker detection: the brief mentions exactly one person
    // (e.g. "seorang pria", "seorang ibu") OR no person at all. In
    // both cases we MUST NOT auto-inject CHARACTER_2 just because a
    // single scene text happened to mention interactive keywords.
    const requestedCast = storyRequestedCastCount(storyText);
    const isMonologue = requestedCast <= 1;
    (breakdown.scenes || []).forEach(scene => {
        const needsTwo = !isMonologue
            && (sceneReferencesTwoCharacters(scene) || sceneRequestsInteractiveCast(scene, config && config.story));
        if (!needsTwo || identity.characters.some(character => character && character.characterId === 'CHARACTER_2')) return;
        identity.characters.push({
            characterId: 'CHARACTER_2',
            role: 'supporting cast and active scene participant',
            identity: 'Registered second participant from the current scene. Keep face, age stage, body, hair, skin, and posture consistent across every scene.',
            faceLock: 'Frozen face identity for CHARACTER_2.',
            hairLock: 'Frozen hair style, length, color, and texture for CHARACTER_2.',
            skinLock: 'Frozen skin tone and complexion for CHARACTER_2.',
            bodyLock: 'Frozen height, posture, body type, and movement silhouette for CHARACTER_2.',
            distinguishingFeatures: 'Distinctive visual anchors chosen from the current scene.',
            voice: 'Unique frozen voice for CHARACTER_2; preserve the same pitch, timbre, age stage, and speaking style.',
            wardrobeDefault: 'Wardrobe established by the current scene; preserve its color and design anchor.',
            wardrobeByBeat: []
        });
    });
}

function dialogueTurnBudget(scene, config) {
    const plan = chooseDialogueTurnPlan(scene);
    const base = dialogueWordBudget(scene, config);
    return Object.assign({}, base, { minLines: 1, maxLines: Math.max(3, plan.count) });
}

function buildDialogueDurationLock(config, scene) {
    if (isSilentAudioMode(config)) {
        return 'DIALOGUE DURATION LOCK: Audio mode is silent. Do not add spoken dialogue or narration.';
    }
    const budget = dialogueTurnBudget(scene, config);
    return `DIALOGUE DURATION LOCK — match the selected scene duration (${(config && config.durationPerScene) || '10s'}).
Target spoken content: ${budget.minWords}-${budget.maxWords} words total, using a natural number of complete lines or turns. Dialogue line count is independent from shot count: one sentence may continue across multiple shots and fill the selected duration.
Do not force one line per shot, do not split a sentence merely because the shot changes, and do not rush the delivery. Leave natural pauses and finish every line before the scene ends.
Use dialogue, voiceover, breath, reaction, or short narration that supports the beat. Keep it natural and playable; do not cram a speech.`;
}

function buildAdvertisementAudioContract(config, scene) {
    if (isSilentAudioMode(config)) return '';
    if (isPlacePromotion(config)) return 'PLACE PROMOTION AUDIO: Use the configured language and registered speakers. Describe only supported features of the promoted place. In the final scene invite the requested visit, viewing, enquiry, purchase or rental. Do not invent prices, ownership, area, facilities or contact details.';
    const genre = detectGenre(config && config.story, !!(config && config.productReference && config.productReference.length));
    if (genre !== 'advertisement' && !detectCommercialIntent(config && config.story)) return '';
    const interactive = sceneRequestsInteractiveCast(scene, config && config.story);
    const finalScene = scene && Number(scene.sceneNumber) === Number(config && config.sceneCount);
    const finalCtaRequired = String(config && config.storyboardMode || '').toLowerCase() === 'commercial'
        || detectCommercialIntent(config && config.story);
    if (interactive) {
        return `ADVERTISEMENT AUDIO CONTRACT — SPOKEN AUDIO IS MANDATORY. This is an advertisement with multiple people. Use real natural Indonesian conversation, never silent action-only direction. Use only the number of complete turns justified by the scene dialogue plan; shot count does not determine dialogue count, and one sentence may span the selected duration and multiple shots. Every line must respond to the previous line and support the product action. ${finalScene && finalCtaRequired ? 'The closing spoken line must contain a natural product-specific CTA.' : 'Do not add a CTA before the final scene.'}`;
    }
    const singleSpeaker = sceneRequiresSingleSpeaker(scene, config);
    return `ADVERTISEMENT AUDIO CONTRACT — SPOKEN AUDIO IS MANDATORY. ${singleSpeaker ? 'This brief has exactly one requested visible person. CHARACTER_1 is the ONLY allowed character speaker. CHARACTER_2, CHARACTER_3, and every other CHARACTER_ID are FORBIDDEN in dialogue, even if a model invents them. Voice-over is allowed only as an additional narrator.' : 'This advertisement has one visible speaker or no requested dialogue partner.'} Use a natural number of short complete lines, a concise VOICEOVER, or a natural combination of CHARACTER_1 and VOICEOVER. One sentence may fill the selected duration and continue across multiple shots; never make dialogue count equal shot count. Never leave the audio block empty and never replace spoken content with labels such as CTA, closing action, or sound design only. ${finalScene && finalCtaRequired ? 'End with one natural product-specific CTA in spoken audio.' : 'Build audio around the visible product action and benefit without premature hard-sell.'}`;
}

function buildNaturalDialogueDirectorRules(config) {
    if (isSilentAudioMode(config)) return buildSilentAudioBlueprintRules(config);
    if (isCreativeMiniatureBuild(config)) {
        return 'MINIATURE BUILD AUDIO: Keep dialogueOrNarration empty unless the user explicitly requested speech. Do not invent CHARACTER_N conversation. Describe construction foley in audioDirection.soundDesign.';
    }
    const genre = detectGenre(config && config.story, !!(config && config.productReference && config.productReference.length));
    const budget = spokenWordBudget(config && config.durationPerScene);
    return `NATURAL DIALOGUE DIRECTOR V4.5 — HARD CONTRACT.
${buildModeDialogueContract(config, null)}
Write dialogue as part of the scene blueprint, after deciding the visible action. The spoken lines must be about what the audience can see in the current scene: product, object, place, gesture, relationship, conflict, or emotional turn.
Do not rely on category templates. Infer the relevant subject from the user's brief and current visual action, then make every line respond to that subject in a fresh, scene-specific way. Never use generic motivational filler.
Genre decision: current hint is ${genre}. If this is a pure ad, Scene 1 needs a natural hook and the final scene needs one product-specific CTA. If this is promotional hybrid, keep the story-led middle but end with one natural product-specific CTA. If this is drama/conflict/horror/comedy, build pressure across scenes and place the decisive emotional reveal, consequence, climax, or comedic gong in the final spoken turn of the final scene; do not spend that payoff early. If this is education, end with the clearest takeaway.
Speaker rule: one visible seller/person = CHARACTER_1 and/or VOICEOVER only. Never invent CHARACTER_2. Two active visible people = real two-way conversation; no monologue and no VOICEOVER replacing a reply.
Each line must have a dramatic job: hook, question, accusation, objection, answer, proof, decision, emotional reveal, product insert, or CTA. No empty greetings unless the scene is specifically an introduction.
Avoid template lines: "kita perlu bicara", "aku dengar kamu", "jujur duluan", "ada yang harus aku bilang", "ini cocok untuk kamu", "beli sekarang di link bio", or any reusable slogan unless the user wrote it.
Budget: ${budget.minWords}-${budget.maxWords} spoken words total, ${budget.minLines}-${budget.maxLines} short playable lines, complete sentences, natural ${config && config.language ? config.language : 'Bahasa Indonesia'}.`;
}

// V5.0 (user request): hard-ban list of words/phrases the AI
// Director must NEVER emit as spoken dialogue. These are evaluated
// (a) in the pre-flight prompt so Gemini knows to avoid them, (b)
// in normalizeCandidateAfterReceive so any slip-through is
// stripped before the audit, and (c) in sceneDialogueViolations
// so any remaining occurrence escalates as a repairable violation.
// The list is intentionally small and explicit — extend with
// care, and document the user-facing reason in CHANGELOG.
const BANNED_DIALOGUE_TERMS = [
    { pattern: /\bsumpah(?:an|kan|ilah)?\b/gi, code: 'ban_sumpah', reason: '"sumpah" terlalu sering muncul sebagai filler kasual; pakai ekspresi lain yang lebih spesifik.' }
];

function findBannedDialogueTerms(value) {
    const text = String(value || '');
    if (!text) return [];
    const hits = [];
    BANNED_DIALOGUE_TERMS.forEach(entry => {
        const matches = text.match(entry.pattern);
        if (matches && matches.length) {
            hits.push({ code: entry.code, reason: entry.reason, samples: Array.from(new Set(matches.map(m => String(m).toLowerCase()))) });
        }
    });
    return hits;
}

// Strip every line whose quoted spoken text contains any banned
// term. Returns the cleaned dialogue AND a list of dropped terms
// so the caller can log/notify the user. Em-dash and ellipsis
// replacements are intentionally NOT done here — better to drop
// the offending line and let repair fall back to the template
// than to silently rewrite the line in surprising ways.
function stripBannedDialogueTerms(value) {
    const source = String(value || '');
    if (!source) return { dialogue: '', dropped: [] };
    const lines = source.split(/\r?\n/);
    const dropped = [];
    const kept = [];
    lines.forEach(rawLine => {
        const line = String(rawLine || '');
        const hits = findBannedDialogueTerms(line);
        if (hits.length) {
            hits.forEach(hit => {
                hit.samples.forEach(sample => dropped.push(sample));
            });
            try { console.warn('[V5.0 Banned Term] Dropped line containing: ' + hits.map(h => h.samples.join(',')).join(' / ') + '.'); } catch (_) {}
            return;
        }
        kept.push(line);
    });
    return { dialogue: kept.join('\n').replace(/\n{3,}/g, '\n\n').trim(), dropped: Array.from(new Set(dropped)) };
}

function dialogueLooksGeneric(value) {
    const text = String(value || '').toLowerCase();
    if (!text.trim()) return true;
    return /(kita perlu bicara|aku dengar kamu|jujur duluan|ada yang harus aku bilang|aku tidak menyangka|hari ini tidak berjalan seperti yang kubayangkan|ini cocok untuk kamu|beli sekarang di link bio|dapatkan sekarang|jangan lewatkan kesempatan ini)/i.test(text);
}

function sceneDialogueSubject(scene, config) {
    const identity = state && state.directorData && state.directorData.masterVisualIdentity
        ? state.directorData.masterVisualIdentity
        : {};
    const rawProduct = identity && (identity.product || identity.objectProduct);
    const productName = rawProduct
        ? productDisplayName(identity, '')
        : '';
    if (productName) return productName;
    const words = String(scene && (scene.storyPurpose || scene.sceneBeat || scene.title) || '')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 4)
        .join(' ');
    return words || 'momen ini';
}

function pickDialogueVariant(list) {
    if (!Array.isArray(list) || !list.length) return '';
    return list[Math.floor(Math.random() * list.length)];
}

function buildFamilyCareFallback(scene, config, interactive) {
    return '';
}

function resetProductLock() {
    state.productLock = { name: "", brand: "", size: "", material: "", color: "", texture: "", keyDetails: "" };
    const sizeInput = document.getElementById('productSizeInput');
    if (sizeInput) sizeInput.value = '';
}

function dialogueLineSpeakers(value) {
    return String(value || '').split('\n')
        .map(line => {
            const match = line.match(/^\s*(?:\[[^\]]+\]\s*)?(CHARACTER_\d+|VOICEOVER|NARRATOR)\s*:/i);
            return match ? match[1].toUpperCase() : '';
        })
        .filter(Boolean);
}

function dialogueHasNaturalCta(value, config) {
    // Inspect spoken sentences, never labels such as "CTA" or scene metadata.
    const text = String(value || '');
    const quotes = [...text.matchAll(/["“]([^"”]+)["”]/g)].map(match => match[1]);
    const spoken = quotes.length ? quotes.join(' ') : text;
    const invite = /\b(?:yuk|ayo|mari|silakan|silahkan|langsung|segera|jangan lupa|jangan lewatkan|let's|please)\b/i;
    const action = /\b(?:mampir(?:lah)?|berkunjung|singgah|datang(?:lah)?|kunjungi(?:lah)?|pesan|order|hubungi|booking|reservasi|daftar|checkout|beli|jadwalkan|visit|book|contact|buy)\b/i;
    return spoken.split(/[.!?\n]+/).some(sentence => {
        if (/\b(?:jangan|tidak perlu|tak perlu|nggak usah|gak usah|don't|do not)\s+(?:\w+\s+){0,1}(?:mampir|datang|beli|pesan|hubungi|kunjungi|booking)\b/i.test(sentence)) return false;
        if (invite.test(sentence) && action.test(sentence)) return true;
        return /(?:^|[:,;]\s*)\s*(?:mampir(?:lah)?|kunjungi(?:lah)?|hubungi|pesan|order|booking|reservasi|daftar|checkout|beli|jadwalkan|visit|book|contact|buy)\b/i.test(sentence)
            || /\b(?:cek|lihat|klik|scan)\s+(?:sekarang\s+)?(?:link|tautan|katalog|menu|penawaran|jadwal|ketersediaan|kode qr)\b/i.test(sentence);
    });
}

async function ensureFinalCommercialCta(breakdown, config, sceneIndex) {
    if (!requiresFinalCommercialCta(breakdown, config) || isSilentAudioMode(config)) return;
    const index = (breakdown.scenes || []).length - 1;
    if (index < 0 || (sceneIndex !== undefined && sceneIndex !== index)) return;
    const scene = breakdown.scenes[index];
    if (!dialogueHasNaturalCta(scene && scene.dialogueOrNarration, config)) {
        scene.dialogueNeedsRepair = true;
        scene.dialogueViolations = Array.from(new Set((scene.dialogueViolations || []).concat(['final_cta_missing'])));
        console.warn('[Commercial CTA] Final scene is missing a natural spoken CTA.');
    }
}

function requiresFinalCommercialCta(breakdown, config) {
    if (!isCommercialStoryboardMode(config, breakdown) || isSilentAudioMode(config)) return false;
    return String(config && config.storyboardMode || '').toLowerCase() === 'commercial'
        || detectCommercialIntent(config && config.story);
}

function sceneDialogueViolations(scene, config, breakdown, index) {
    const violations = [];
    if (!scene || isSilentAudioMode(config) || isCreativeMiniatureBuild(config)) return violations;
    const dialogue = String(scene.dialogueOrNarration || '').trim();
    const genre = storyboardGenre(breakdown || { scenes: [scene] }, config);
    const isFinalScene = breakdown && Array.isArray(breakdown.scenes)
        ? index === breakdown.scenes.length - 1
        : Number(scene.sceneNumber) === Number(config && config.sceneCount);
    const interactive = sceneRequiresInteractiveDialogue(scene, config) || sceneHasTwoActiveSpeakers(scene);
    const singleSpeaker = sceneRequiresSingleSpeaker(scene, config);
    const speakers = dialogueLineSpeakers(dialogue);
    if (!dialogue) violations.push('blank_audio');
    if (dialogueLooksGeneric(dialogue)) violations.push('generic_or_template_audio');
    // V5.0 (user request): hard ban on specific dialogue terms.
    // Each match emits a per-term code so the user sees WHICH
    // word was flagged, not a generic violation.
    const bannedHits = findBannedDialogueTerms(dialogue);
    if (bannedHits.length) {
        bannedHits.forEach(hit => violations.push('banned_dialogue_term_' + hit.code));
    }
    // V5.0 (D-1): dialog must reference at least one keyword
    // from the scene context. If 0 references, the dialog is
    // structurally valid but content-wise off-topic — Gemini
    // produced something that passes format checks but talks
    // about nothing relevant to the scene beat / visual action.
    // Only flag if the scene actually HAS context to reference
    // (extractSceneContextKeywords returns empty for scenes
    // without meaningful metadata). Exclude very short scenes
    // (<3 lines) because the per-line keyword hit rate is
    // naturally low and a strict gate would over-fire.
    const sceneContext = extractSceneContextKeywords(scene);
    const spokenOnly = (dialogue.match(/"[^"]+"/g) || []).join(' ').toLowerCase()
        || dialogue.toLowerCase();
    if (sceneContext.size >= 3) {
        let hits = 0;
        sceneContext.forEach(keyword => {
            if (spokenOnly.indexOf(keyword) !== -1) hits++;
        });
        if (hits === 0) violations.push('dialogue_off_topic');
    }
    if (singleSpeaker && speakers.some(speaker => /^CHARACTER_(?:[2-9]|[1-9]\d+)$/.test(speaker))) {
        violations.push('single_person_scene_has_extra_character');
    }
    if (interactive && !hasValidInteractiveDialogue(dialogue, scene, config, true)) {
        violations.push('two_active_people_need_real_back_and_forth');
    }
    if (!detectCommercialIntent(config && config.story) && /\b(?:produk ini|produk perawatan|klaim promo|checkout|beli sekarang|order sekarang)\b/i.test(dialogue)) {
        violations.push('product_or_sales_language_in_non_ad_story');
    }
    if (genre === 'hybrid' && isFinalScene && !detectCommercialIntent(config && config.story) && /\b(?:cta|beli sekarang|order sekarang|pesan sekarang|klik link|link bio|dm sekarang|checkout|klaim promo|dapatkan sekarang|shop now|buy now|order now|get yours)\b/i.test(dialogue)) {
        violations.push('hybrid_final_scene_should_resolve_story_not_sell');
    }
    const structureViolations = dialogueStructureViolations(dialogue, index, breakdown && breakdown.scenes ? breakdown.scenes.length : 1, config);
    return Array.from(new Set(violations.concat(structureViolations)));
}

function enforceNaturalDialogueContracts(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes) || isSilentAudioMode(config) || isCreativeMiniatureBuild(config)) return;
    const genre = storyboardGenre(breakdown, config);
    breakdown.scenes.forEach((scene, index) => {
        if (!scene || typeof scene !== 'object') return;
        if (scene.dialogueDeferred === true) return;
        const singleSpeaker = sceneRequiresSingleSpeaker(scene, config);
        const interactive = sceneRequiresInteractiveDialogue(scene, config) || sceneHasTwoActiveSpeakers(scene);
        if (!scene.dialogueOrNarration && scene._singleCharacterFinalAftermath === true) {
            scene.dialogueOrNarration = buildFallbackSceneAudio(scene, config, false);
        }
        if (singleSpeaker) {
            scene.dialogueOrNarration = String(scene.dialogueOrNarration || '')
                .split('\n')
                .filter(line => !/^\s*(?:\[[^\]]+\]\s*)?CHARACTER_(?:[2-9]|[1-9]\d+)\s*:/i.test(line))
                .join('\n')
                .trim();
            if (scene.dialoguePlan) {
                scene.dialoguePlan.participants = ['CHARACTER_1'];
                scene.dialoguePlan.mode = 'single seller / single performer audio';
            }
        }
        if (interactive && scene.dialoguePlan) {
            scene.dialoguePlan.mode = 'two-way character dialogue';
            scene.dialoguePlan.participants = activeSceneCharacterIds(scene).length >= 2 ? activeSceneCharacterIds(scene).slice(0, 2) : ['CHARACTER_1', 'CHARACTER_2'];
        }
        if (genre === 'hybrid' && index === breakdown.scenes.length - 1 && !detectCommercialIntent(config && config.story)) {
            const ctaRe = /\b(?:cta|beli sekarang|order sekarang|pesan sekarang|klik link|link bio|dm sekarang|checkout|klaim promo|claim promo|dapatkan sekarang|shop now|buy now|order now|get yours)\b[:\s"“”\-]*/gi;
            scene.dialogueOrNarration = String(scene.dialogueOrNarration || '').replace(ctaRe, '').trim();
        }
        scene.dialogueOrNarration = deduplicateDialogueLines(enforceDialogueCastAndLength(scene.dialogueOrNarration, scene, config));
        const violations = sceneDialogueViolations(scene, config, breakdown, index);
        scene.dialogueNeedsRepair = violations.length > 0;
        scene.dialogueViolations = violations;
    });
}

function hasAdvertisementAudio(value) {
    return /\b(?:CHARACTER_\d+|VOICEOVER)\s*:/i.test(String(value || ''));
}

function spokenAudioLineCount(value) {
    return String(value || '').split('\n')
        .map(line => line.trim())
        .filter(line => /^(?:\[[^\]]+\]\s*)?(?:CHARACTER_\d+|VOICEOVER|NARRATOR)\s*:/i.test(line))
        .length;
}

function needsLivelierAudio(scene, config, value) {
    if (!scene || isSilentAudioMode(config)) return false;
    return spokenAudioLineCount(value) < 2 && !sceneRequestsInteractiveCast(scene, config && config.story);
}

function buildAudioPerformanceLock(scene, config) {
    if (!scene || isSilentAudioMode(config) || isCreativeMiniatureBuild(config)) return '';
    const direction = scene.audioDirection || {};
    const emotion = direction.sceneEmotion || direction.emotion || 'emotion appropriate to the scene beat';
    const intensity = direction.intensity || '5/10';
    const pacing = direction.pacing || 'natural, varied pacing with intentional pauses';
    const texture = direction.soundTexture || 'clear human delivery with audible emotional texture';
    const performance = direction.performanceNotes || 'facial expression, eye focus, breathing, and body language must visibly match the emotion';
    return `AUDIO PERFORMANCE / ACTING LOCK — do not deliver every line in a flat neutral tone.
SCENE EMOTION: ${emotion}. INTENSITY: ${intensity}. PACING: ${pacing}. SOUND TEXTURE: ${texture}.
PERFORMANCE: ${performance}. Every CHARACTER_ID must have a distinct emotional delivery when speaking: adjust pitch, volume, tempo, stress, pauses, breath, facial expression, eye focus, posture, and gesture to the scene. Voice identity stays consistent, but emotional performance must change with the story.`;
}

function inferAudioDirection(scene) {
    const text = [scene && scene.title, scene && scene.storyPurpose, scene && scene.dialogueOrNarration, scene && scene.masterVideoPrompt].filter(Boolean).join(' ').toLowerCase();
    if (/(marah|bertengkar|konfrontasi|kesal|angry|furious|fight)/i.test(text)) return { sceneEmotion: 'angry confrontation', intensity: '8/10', pacing: 'fast with clipped phrases and sharp stress', soundTexture: 'raised voice, tense breathing, hard consonants', performanceNotes: 'furrowed brows, tense jaw, direct eye contact, forceful gestures' };
    if (/(sedih|menangis|kehilangan|duka|sad|cry|grief)/i.test(text)) return { sceneEmotion: 'grief and vulnerability', intensity: '7/10', pacing: 'slow with emotional pauses', soundTexture: 'quiet breath, restrained voice, slight tremble', performanceNotes: 'wet eyes, lowered gaze, heavy shoulders, small restrained movements' };
    if (/(takut|ketakutan|horor|horror|cemas|fear|terrified)/i.test(text)) return { sceneEmotion: 'fear and uncertainty', intensity: '8/10', pacing: 'uneven, hesitant, with short breaths', soundTexture: 'low trembling voice, breath held between words', performanceNotes: 'wide alert eyes, frozen posture, nervous glances, protective body tension' };
    if (/(senang|gembira|tertawa|bahagia|happy|joy|excited)/i.test(text)) return { sceneEmotion: 'joy and excitement', intensity: '7/10', pacing: 'lively with rising intonation', soundTexture: 'bright energetic voice and natural laughter', performanceNotes: 'open smile, bright eyes, relaxed shoulders, expressive hands' };
    if (/(curiga|skeptis|mencurigakan|suspicious|doubt)/i.test(text)) return { sceneEmotion: 'suspicion and guarded curiosity', intensity: '6/10', pacing: 'measured with emphasis on key words', soundTexture: 'controlled low voice with deliberate pauses', performanceNotes: 'narrowed eyes, slight head tilt, guarded posture, restrained gestures' };
    if (/(lega|syukur|haru|relief|grateful|tender|surat|letter|suara hati|internal thought)/i.test(text)) return { sceneEmotion: 'tender relief and sincerity', intensity: '6/10', pacing: 'gentle, reflective, with warm pauses', soundTexture: 'soft intimate voice and released breath', performanceNotes: 'soft eyes, subtle smile or moist eyes, relaxed posture, delicate gestures' };
    if (/(iklan|promosi|cta|produk|manfaat|advertisement|sell)/i.test(text)) return { sceneEmotion: 'confident, inviting persuasion', intensity: '6/10', pacing: 'clear, rhythmic, and natural rather than announcer-like', soundTexture: 'warm confident delivery with crisp words', performanceNotes: 'direct eye contact, confident posture, authentic smile, purposeful product gesture' };
    return { sceneEmotion: 'natural scene emotion derived from the story beat', intensity: '5/10', pacing: 'varied natural pacing with intentional pauses', soundTexture: 'clear human voice with audible breath and feeling', performanceNotes: 'face, eyes, posture, and gestures visibly support the spoken meaning' };
}

function ensureAudioDirection(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes)) return;
    if (isSilentAudioMode(config)) {
        ensureSilentSoundDesign(breakdown, config);
        return;
    }
    breakdown.scenes.forEach(scene => {
        if (!scene.audioDirection || typeof scene.audioDirection !== 'object') scene.audioDirection = inferAudioDirection(scene);
    });
}

function normalizeDialogueSpeakerTurns(value, scene, config, identity) {
    const text = normalizeDialogueText(value);
    if (!text || isSilentAudioMode(config) || /Voice-Over Narrator/i.test(String(config && config.audioMode || ''))) return text;
    const normalizedVoiceover = text.replace(/^CHARACTER_(\d+)\s*:\s*\(VO\)\s*/gim, 'VOICEOVER: ');
    if (scene && scene._singleCharacterFinalAftermath === true) {
        return normalizedVoiceover.split('\n')
            .filter(line => !/^CHARACTER_[2-9]\d*\s*:/i.test(line))
            .join('\n')
            .trim();
    }
    if (/\b(?:VOICEOVER|NARRATOR|SOUND DESIGN)\s*:/i.test(normalizedVoiceover) && !sceneRequestsInteractiveCast(scene, config && config.story)) return normalizedVoiceover;
    const referencedCharacters = Array.from(new Set(((scene && scene.masterImagePrompt) || '').match(/CHARACTER_\d+/g) || []));
    const identityCastSize = Array.isArray(identity && identity.characters) ? identity.characters.length : 0;
    // Cast lock: only respect the RELABEL-into-CHARACTER_2 behaviour when the
    // registered cast truly contains 2+ speakers. The previous version used
    // `safeCastSize = identityCastSize || characterCount` which could read a
    // forced CHARACTER_2 added by ensureSceneCharacterRoster from a single-speaker
    // brief, and then turn a monologue into an alternating two-character exchange.
    // We now honour the actual identity.castSize and the explicit participants
    // list from the dialogue plan; if neither shows two speakers, leave the
    // single-speaker dialogue alone.
    const plan = (scene && scene.dialoguePlan) || {};
    const planSpeakers = Array.isArray(plan.participants)
        ? plan.participants.filter(id => /^CHARACTER_\d+$/i.test(String(id)))
        : [];
    const safeCastSize = planSpeakers.length > 1 ? planSpeakers.length : identityCastSize;
    const speakerLineRe = /^CHARACTER_\d+\s*:/i;
    const allLines = normalizedVoiceover.split('\n');
    const trailers = allLines.filter(line => !speakerLineRe.test(line));
    const labeledTurns = allLines.map(turn => {
        const match = turn.match(/^CHARACTER_(\d+)\s*:\s*(.+)$/i);
        return match ? { speaker: Number(match[1]), line: match[2].trim() } : null;
    }).filter(Boolean);
    const uniqueSpeakers = new Set(labeledTurns.map(turn => turn.speaker));
    if (!labeledTurns.length) return normalizedVoiceover;
    // Single-speaker output must stay single-speaker, even if identity.castSize
    // somehow shows 2 characters — the source dialogue chose one voice, do not
    // synthesise an alternating exchange out of it.
    if (uniqueSpeakers.size === 1) return normalizedVoiceover;
    // Two-speaker output that happens to label both lines with the same speaker
    // is rare; we only relabel if the dialogue plan explicitly requested an
    // alternating pattern (e.g. CHARACTER_1 -> CHARACTER_2). Otherwise the
    // original speaker label is preserved.
    if (labeledTurns.length >= 2 && planSpeakers.length >= 2) {
        const turnPatternWantsAlternate = /character_\d+\s*->\s*character_\d+/i.test(String(plan.turnPattern || ''));
        if (turnPatternWantsAlternate) {
            const relabeled = labeledTurns.map((turn, index) => 'CHARACTER_' + planSpeakers[index % planSpeakers.length].replace(/^CHARACTER_(\d+)$/i, '$1') + ': ' + turn.line);
            return [...relabeled, ...trailers].join('\n');
        }
    }
    return normalizedVoiceover;
}

function enforceDialogueCastAndLength(value, scene, config) {
    let text = normalizeDialogueText(value);
    if (!text) return text;
    const singleSpeaker = sceneRequiresSingleSpeaker(scene, config);
    if (singleSpeaker) {
        text = text.split('\n')
            .filter(line => !/^\s*(?:\[[^\]]+\]\s*)?CHARACTER_(?:[2-9]|[1-9]\d+)\s*:/i.test(line))
            .join('\n');
    }
    const budget = dialogueWordBudget(scene, config);
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const speakerLineRe = /^(?:\[[^\]]+\]\s*)?(?:CHARACTER_\d+|VOICEOVER|NARRATOR)\s*:/i;
    let words = 0;
    const keptLines = [];
    for (const line of lines) {
        if (!speakerLineRe.test(line)) {
            keptLines.push(line);
            continue;
        }
        const cleanLine = line.replace(/(:\s*")\s*\[[^\]]+\]\s*/i, '$1');
        const lineWords = cleanLine.replace(/^[^:]+:\s*/, '').match(/[\p{L}\p{N}]+/gu) || [];
        if (words + lineWords.length <= budget.maxWords || !keptLines.some(kept => speakerLineRe.test(kept))) {
            keptLines.push(cleanLine);
            words += lineWords.length;
        }
    }
    return keptLines.join('\n');
}

function buildNoTextArtifactLock(config) {
    const overlayActive = config && config.visualStyle === 'Auto Caption Overlay' && config.visualStyleExplicitOverlay === true;
    if (overlayActive) {
        // V5.0 (Isu #2): overlay mode is now strict opt-in. Even
        // when enabled, no contact info / numbers / handles.
        return `TEXT ARTIFACT CONTROL LOCK — Auto Caption Overlay (V5.0 opt-in).
Only intentional, readable overlay text requested by the prompt is permitted. CTA visuals MUST contain absolutely no text, captions, subtitles, logos, watermarks, shopping-cart/basket graphics, badges, phone numbers, WhatsApp numbers, social media handles, URLs, or promotional overlays. No accidental hex codes, CSS color strings, random letters, UI text, duplicate panel numbers, watermark text, broken subtitles, camera labels such as MS/CU/OTS/ECU/WS, or nonsense glyphs. The opt-in overlay mode is the ONLY context in which visible marketing text is allowed, and even then it must never include contact details, brand logos, or third-party marks.`;
    }
    // V5.0 (Isu #2): universal absolute no-text rule — every panel,
    // every frame, every scene. No exceptions.
    return `ABSOLUTE NO TEXT / NO OVERLAY LOCK (V5.0 Isu #2) — applies to every panel of every scene in every episode.
The image MUST be visually clean. The ONLY visible glyphs allowed inside the image are the tiny per-panel numbers 1, 2, 3, … in the corner of each panel, placed exactly once each, in ascending order.
BANNED visible artifacts (exhaustive list — none of these may appear anywhere in any frame, panel, storyboard cell, image, video still, or background of the visual output):
- Subtitle bars, caption bars, lower-thirds, banners, ticker text, or any text strip
- Logos, brand marks, watermarks, signatures, stamps, third-party brand identities
- Shopping cart / basket / trolley icons, badges, stickers, or graphics (including a clean minimalist icon)
- CTA text, slogans, taglines, hooks written as visible words, or promo copy
- Phone numbers of any kind: WhatsApp, mobile, hotline, SMS short-code, customer service, "Hubungi", "Kontak", "WA"
- Email addresses, contact forms, "Email us"
- URLs, hyperlinks, link previews, "Link bio", "Link di bio", "Klik link"
- QR codes, barcodes, scannable graphics
- Social media handles: @username, #hashtag rendered as visible text, IG handles, TikTok handles, YouTube channel names, X/Twitter handles
- Price tags, discount badges, "SALE", "%", "Rp", "USD", voucher graphics, coupon graphics
- Buttons, popups, notifications, app screens, fake UI, fake DM, fake comment, fake like counter
- Camera shot labels (MS, CU, MCU, ECU, WS, OTS, POV) rendered as text
- Color codes (#ffff80, #FF0000), CSS color names (red, blue, rgb-…), prompt fragments
- Random letters, repeated numbers, duplicate panel labels, gibberish, nonsense glyphs
- File names, ".png", ".jpg", prompt snippets visible in the image
- Cartoon speech bubbles, thought bubbles, comic-style text boxes
- Animated infographic elements that include visible words (icons are allowed only if they contain zero text)
This rule applies to BOTH still storyboard images AND every frame of the generated video, including the first frame, the last frame, every transition, every panel, and every background element. The visual must look like a clean cinematic photograph of the scene — nothing else.`;
}

function buildCtaVisualCleanLock(scene, config) {
    const sceneNumber = Number(scene && scene.sceneNumber);
    const sceneTotal = Number(config && config.sceneCount);
    // V5.0 (Isu #2): inspect ONLY the explicit shot-level action
    // and the scene's CTA action flag, not the broad scene
    // narrative. The previous regex matched common Indonesian words
    // like "pesan", "beli", "order" inside descriptive narrative
    // ("kami memesan ruangan", "ia membeli buku") which caused every
    // scene to be flagged as a CTA scene and the lock to fire
    // constantly. Now the lock only fires when a shot action or
    // dedicated CTA metadata explicitly says "this is a CTA".
    const shotActions = Array.isArray(scene && scene.shots) ? scene.shots.map(shot => shot && shot.action).filter(Boolean).join(' | ') : '';
    const ctaActionFlag = scene && (scene.ctaAction === true || scene.isCtaScene === true);
    const sceneText = [
        ctaActionFlag ? 'EXPLICIT_CTA_SCENE' : '',
        shotActions
    ].filter(Boolean).join(' ');
    // Narrow CTA regex — match strong CTA intent only.
    const explicitCta = /\b(?:cta\s+(?:scene|shot|panel)|call[\s-]+to[\s-]+action|shop\s*now\s+(?:overlay|card)|buy\s*now\s+(?:overlay|card)|order\s*now\s+(?:overlay|card)|checkout\s+(?:overlay|card)|keranjang\s+(?:icon|gambar)|troli\s+(?:icon|gambar)|beli\s+sekarang\s+(?:overlay|card)|pesan\s+sekarang\s+(?:overlay|card)|klik\s+(?:link|keranjang)\s+(?:overlay|card)|link\s+bio\s+(?:overlay|card)|dapatkan\s+sekarang\s+(?:overlay|card)|kunjungi\s+toko\s+(?:overlay|card)|whatsapp\s+(?:number|overlay)|wa\s+number|telephone\s+number|phone\s+number|hotline|kontak\s+kami)\b/i.test(sceneText);
    const finalCommercialScene = sceneNumber > 0
        && sceneTotal > 0
        && sceneNumber === sceneTotal
        && (String(config && config.storyboardMode || '').toLowerCase() === 'commercial'
            || detectCommercialIntent(config && config.story)
            || isPlacePromotion(config));
    if (!explicitCta && !finalCommercialScene) return '';
    return `CTA VISUAL CLEAN FRAME LOCK — ABSOLUTE (V5.0 Isu #2): This panel/frame MUST be visually clean — no exceptions, no compromises.
BANNED inside any frame or storyboard panel of this scene (visual):
- Any shopping cart / basket / trolley icon, badge, sticker, or graphic
- Any written CTA, call-to-action sentence, slogan, tagline, or promo line
- Any caption, subtitle, lower-third, banner, or overlay text
- Any logo, brand mark, watermark, signature, stamp, or third-party brand
- Any phone number, WhatsApp number, SMS short-code, hotline, email address
- Any URL, link, QR code, barcode, @handle, social media username, or website
- Any price tag, discount badge, voucher, coupon, ticket, or receipt graphic
- Any button, sticker, popup, notification, UI element, or app screen
- Any fake social media post, fake DM, fake comment, fake like counter
- Any intentional camera shot label (MS, CU, MCU, ECU, WS, OTS)
- Any hex color, CSS name, prompt fragment, or random gibberish text
- Any "CTA", "Shop Now", "Buy Now", "Order Now", "Beli Sekarang", "Pesan Sekarang", "Link Bio", "DM sekarang", "WhatsApp", "WA", "Hubungi", "Kontak" rendered as visible text anywhere
The CTA must live ONLY in the spoken dialogue line (when voice is enabled). The visual action of this scene stays as an ordinary clean cinematic frame with the same composition language as the rest of the storyboard. Do not create a separate CTA end-card or post-credits graphic.`;
}

// Voice roster is intentionally limited to two Gemini TTS voices —
// Kore (female) and Puck (male) — so a character's gender maps
// deterministically to one voice. This guarantees that the same
// character keeps the same voice across every scene and episode,
// and prevents the earlier bug where a male CHARACTER_3 could end
// up with the female voice "Kore" because Kore was mis-categorised
// in the male default list.
const GEMINI_TTS_VOICES = ['Kore', 'Puck'];
const FEMALE_TTS_VOICE = 'Kore';
const MALE_TTS_VOICE = 'Puck';
// V5.0 (Isu #1): expanded regex so the gender sniff catches more
// Indonesian + English role terms — including job titles and kinship
// cues that previously fell through to the MALE fallback and made
// female characters sound male in later scenes.
const VOICE_NAME_BY_GENDER_AGE = [
    {
        re: /(?:pria|lelaki|cowok|father|ayah|suami|husband|bapak|kakek|grandpa|anak\s+laki-laki|teen\s*boy|male\s+character|man|men|gentleman|paman|om|abang|kang|mas|mas\.|pak\s+bpk|bapak|adik\s+laki-laki|anak\s+pria|putra|putra\s+putri|putra\s+tunggal|kakak\s+laki-laki|adik\s+laki-laki|ayah\s+kandung|ayah\s+angkat|kakek\s+nenek|kakek\s+dan\s+nenek|kakek\s+nenek\s+kandung|kakek\s+buyut|simbah|simbah\.|eyang|eyang\s+kakek|eyang\.|bule\.|dokter\s+pria|dokter\s+laki-laki|guru\s+pria|guru\s+laki-laki|guru\s+pa\s*sd|guru\s+pa\s*smp|guru\s+pa\s*sma|guru\s+pa\s*tk|suster|rahib|pastor|ustadz|ustadz\.|ustad|santri\s+laki-laki|santri\s+cowok|siswa\s+laki-laki|sepatu\s+roda|tsm)+\b/i,
        names: [MALE_TTS_VOICE]
    },
    {
        re: /(?:wanita|perempuan|cewek|gadis|mother|ibu|istri|wife|mama|nenek|grandma|anak\s+perempuan|teen\s*girl|female\s+character|woman|women|lady|mbak|mbk\.|ning|ningsih|tante|tante\.|bibi|adik\s+perempuan|putri|putri\s+tunggal|kakak\s+perempuan|adik\s+perempuan|ibu\s+kandung|ibu\s+angkat|nenek\s+kandung|nenek\s+buyut|simbah\.|eyang|eyang\s+nenek|bidan|dokter\s+wanita|dokter\s+perempuan|guru\s+wanita|guru\s+perempuan|guru\s+bu\s*sd|guru\s+bu\s*smp|guru\s+bu\s*sma|guru\s+bu\s*tk|apoteker\s+wanita|apoteker\s+perempuan|perawat\s+wanita|perawat\s+perempuan|suster|pastor\s+wanita|ustadzah|ustadzah\.|santri\s+perempuan|santri\s+cewek|siswi\s+perempuan|mahasiswi|mahasiswi\.|pelajar\s+perempuan|pekerja\s+wanita|pekerja\s+perempuan|karyawati|sekretaris\s+wanita|pramugari|pramusaji\s+wanita|penjual\s+wanita|penjaga\s+wanita|model\s+wanita|model\s+perempuan|aktris|penyanyi\s+wanita|penyanyi\s+perempuan|ratu|sultan\s+wanita|putri\s+raja|putri\s+ratu|nyonya|ibu\s+rumah\s+tangga|irt|ibu\s+rt|pengacara\s+perempuan|pengacara\s+wanita|jaksa\s+perempuan|jaksa\s+wanita|wartawati|wartawan\s+perempuan|wartawan\s+wanita|jurnalis\s+perempuan|jurnalis\s+wanita|konten\s+kreator\s+perempuan|kreator\s+wanita|youtuber\s+wanita|tiktoker\s+wanita|selebgram\s+wanita|influencer\s+wanita|penulis\s+wanita|penulis\s+perempuan|kartunis\s+wanita|desainer\s+wanita|arsitek\s+perempuan|programmer\s+wanita|developer\s+wanita|engineer\s+wanita|insinyur\s+perempuan|dokter\s+gigi\s+perempuan|dokter\s+gigi\s+wanita|dokter\s+hewan\s+perempuan|dokter\s+hewan\s+wanita|chef\s+wanita|koki\s+wanita|barista\s+wanita|pelayan\s+wanita|pramuniaga\s+wanita|sales\s+wanita|salesgirl|waitress|tentara\s+wanita|polwan|polisi\s+wanita|tn|i|tn\.|tn\s+i|pemuda\s+wanita|remaja\s+perempuan|gadis\s+remaja|gadis\s+muda|wanita\s+muda|wanita\s+tua|wanita\s+paruh\s+baya|wanita\s+dewasa|perempuan\s+dewasa|perempuan\s+muda|perempuan\s+tua|perempuan\s+paruh\s+baya|janda|janda\s+anak|janda\s+muda|janda\s+tua|gadis\s+deso|gadis\s+desa|gadis\s+kota|cewek\s+desa|cewek\s+kota|ibu\s+muda|ibu\s+tua|ibu\s+paruh\s+baya|ibu\s+rumah\s+tangga|nyonya\s+besar|nyonya\s+rumah|nyonya\s+rt|raja\s+wanita|sultan\s+perempuan)+\b/i,
        names: [FEMALE_TTS_VOICE]
    }
];

function normalizeGeminiVoiceName(value) {
    const requested = String(value || '').trim().toLowerCase();
    return GEMINI_TTS_VOICES.find(name => name.toLowerCase() === requested) || '';
}

// V5.0 (Isu #1): resolveVoiceFromCues() — single source of truth for
// turning character cues (gender field, identity text, role text,
// registered name alias) into a Kore/Puck decision. The earlier
// helper used a regex list with a MALE_TTS_VOICE fallback that
// silently flipped female characters to Puck when the keyword
// list didn't match. The new helper:
//   1. Tries an explicit voice field (highest trust).
//   2. Tries a stored binding from a prior successful inference
//      (cross-scene persistence — fixes the drift between scenes).
//   3. Tries the gender field.
//   4. Tries the expanded role/identity keyword regex.
//   5. Tries registered-name alias (e.g. "istri" / "suami" /
//      relationship map).
//   6. Returns '' (empty) AND logs a warning instead of silently
//      defaulting to MALE. Callers must treat '' as "ask the
//      user" rather than guess.
function resolveVoiceFromCues(character, index, persistentBindings) {
    if (!character || typeof character !== 'object') return '';
    const explicit = normalizeGeminiVoiceName(character.voiceName || character.ttsVoice);
    if (explicit) return explicit;
    const id = character.characterId || ('CHARACTER_' + (index + 1));
    if (persistentBindings && typeof persistentBindings === 'object' && persistentBindings[id]) {
        const stored = normalizeGeminiVoiceName(persistentBindings[id]);
        if (stored) return stored;
    }
    const gender = String(character.gender || '').toLowerCase();
    if (/female|perempuan|wanita/i.test(gender)) return FEMALE_TTS_VOICE;
    if (/male|pria|laki/i.test(gender)) return MALE_TTS_VOICE;
    const text = String((character.identity || character.role || character.speakerName || character.name || '')).toLowerCase();
    if (text) {
        for (const rule of VOICE_NAME_BY_GENDER_AGE) {
            if (rule.re.test(text)) return rule.names[0];
        }
    }
    try {
        if (typeof console !== 'undefined' && console && typeof console.warn === 'function') {
            console.warn('[V5.0 Voice Lock] Could not confidently infer gender for ' + id + ' (gender="' + gender + '", identity="' + String(character.identity || '').slice(0, 120) + '"). Returning empty voice; caller must decide.');
        }
    } catch (_) { /* noop */ }
    return '';
}

function inferVoiceFromGender(character, persistentBindings) {
    return resolveVoiceFromCues(character, character && character.__idx, persistentBindings);
}

function assignDefaultVoiceName(character, index, persistentBindings) {
    // V5.0 (Isu #1): index kept for API compatibility; the binding
    // store is now the cross-call authority. If a character was
    // previously bound, return the stored voice rather than
    // re-running the keyword sniff and risking a flip.
    const voice = resolveVoiceFromCues(character, index, persistentBindings);
    return voice;
}

// Persistent binding storage. Stored on masterVisualIdentity so it
// travels alongside the cast across scene regenerations within the
// same breakdown, and on the root state so it survives a full
// storyboard rebuild.
function getVoiceBindingsStore(identity, fallback) {
    if (identity && typeof identity === 'object') {
        if (!identity.voiceBindings || typeof identity.voiceBindings !== 'object') {
            identity.voiceBindings = {};
        }
        return identity.voiceBindings;
    }
    if (fallback && typeof fallback === 'object') {
        if (!fallback.voiceBindings || typeof fallback.voiceBindings !== 'object') {
            fallback.voiceBindings = {};
        }
        return fallback.voiceBindings;
    }
    return null;
}

function buildVoiceLockBlock(identity) {
    const chars = Array.isArray(identity && identity.characters) ? identity.characters : [];
    if (!chars.length) return '';
    return buildVoiceLock(identity, 'the selected language');
}

// Per-scene voice assignment so the video prompt explicitly tells
// the AI which CHARACTER_N is tied to which voice preset. This
// keeps TTS playback consistent with the video the AI generates
// (e.g. don't have CHARACTER_1 visually speak a man's lines if
// their locked voice is "Kore" / female).
function buildSceneVoiceCastBlock(scene, identity, config) {
    if (!scene) return '';
    if (config && isSilentAudioMode(config)) return '';
    if (config && isCreativeMiniatureBuild(config)) return '';
    const chars = Array.isArray(identity && identity.characters) ? identity.characters : [];
    if (!chars.length) return '';
    const cast = scene.voiceCast || {};
    const bindings = (identity && typeof identity.voiceBindings === 'object') ? identity.voiceBindings : null;
    const rows = chars.map((character, index) => {
        const id = character.characterId || ('CHARACTER_' + (index + 1));
        const name = character.speakerName || character.name || '';
        // V5.0 (Isu #1): consult voiceBindings BEFORE falling back,
        // so cross-scene regeneration can't silently re-pick the
        // wrong voice when the new identity text doesn't match.
        const voiceName = cast[id]
            || character.voiceName
            || character.ttsVoice
            || (bindings && bindings[id])
            || assignDefaultVoiceName(character, index, bindings);
        return `${id}${name ? ' (' + name + ')' : ''} -> voice preset ${voiceName || '(unresolved)'}`;
    });
    return `CHARACTER VOICE LOCK (this scene only) — each registered character is permanently tied to the voice preset shown below. The video must respect these assignments: the visual performance, lipsync cues, and any speaking cues generated in the video must match the locked voice identity. Never substitute, swap, or rename a voice preset for a character.\n${rows.join('\n')}`;
}

function buildIndonesianAccentLock(config) {
    const lang = (config && config.language) || 'Bahasa Indonesia';
    if (!/indonesia/i.test(lang)) return '';
    return '[Audio: ' + lang + ', Authentic Native Indonesian Accent] All spoken dialogue and voice-over lines MUST be performed with authentic native Indonesian pronunciation, natural pacing, and emotional weight appropriate to each line. Do not flatten delivery; do not switch to English pronunciation mid-line.';
}

function buildLanguageDeliveryLock(config) {
    const lang = String(config && config.language || '');
    if (/nigerian\s+english|naija/i.test(lang)) {
        return '[Audio: Nigerian English (Naija English)] Perform all spoken lines in natural Nigerian English with authentic Nigerian cadence and locally natural expressions where appropriate. Keep the language respectful and natural; avoid caricature, forced slang, or switching to another language unless the user requests it.';
    }
    return buildIndonesianAccentLock(config);
}

function toNaturalDialogueFormat(dialogue, identity) {
    if (!dialogue) return '';
    return String(dialogue).split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed) return line;
        const m = trimmed.match(/^(\[[^\]]+\]\s*)?(CHARACTER_\d+)\s*:\s*(.+)$/i);
        if (!m) {
            const vo = trimmed.match(/^(VOICEOVER|NARRATOR|SOUND DESIGN)\s*:\s*(.+)$/i);
            if (vo) return vo[1].toUpperCase() + ': "' + vo[2].trim().replace(/^"|"$/g, '') + '"';
            return line;
        }
        const expression = m[1] || '';
        const speaker = m[2].toUpperCase();
        const content = m[3].trim()
            .replace(/^\[voice:[^\]]+\]\s*/i, '')
            .replace(/^(?:speaks clearly saying|says in measured delivery)\s*:\s*/i, '')
            .replace(/^"|"$/g, '');
        return expression + speaker + ': "' + content.replace(/"/g, '\\"') + '"';
    }).join('\n');
}

function getMaxWordsForDuration(duration, scene, config) {
    if (scene && config && sceneRequiresSingleSpeaker(scene, config)) {
        return dialogueWordBudget(scene, config).maxWords;
    }
    const d = String(duration || '8s');
    if (d.indexOf('5') === 0) return 12;
    if (d.indexOf('8') === 0) return 20;
    return 25;
}

function trimDialogueToMaxWords(text, maxWords) {
    if (!text || typeof text !== 'string') return '';
    const t = text.trim();
    if (t.startsWith('[') && t.endsWith(']')) return t;
    const words = t.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return t;
    const sliced = words.slice(0, maxWords).join(' ');
    const cleaned = sliced.replace(/[,;:\-\s]+$/, '');
    return /[.!?…]$/.test(cleaned) ? cleaned : cleaned + '.';
}

function enforceHardWordLimit(value, scene, config) {
    // Cyberton-style hard cut per scene. Speaker lines get trimmed at word boundary;
    // CTA / closing / ASMR lines pass through untouched.
    const speakerLineRe = /^(?:\[[^\]]+\]\s*)?CHARACTER_\d+\s*:/i;
    const maxWords = getMaxWordsForDuration(config && config.durationPerScene, scene, config);
    return String(value || '').split('\n').map(line => {
        if (!speakerLineRe.test(line.trim())) return line;
        return trimDialogueToMaxWords(line, maxWords);
    }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function enforceVoiceContinuity(breakdown) {
    const identity = breakdown && breakdown.masterVisualIdentity;
    const characters = Array.isArray(identity && identity.characters) ? identity.characters : [];
    if (!characters.length) return;

    // V5.0 (Isu #1): persistent voice bindings. Once a character
    // has been assigned a voice in any prior call, that voice is
    // reused for every subsequent scene regeneration. This stops
    // the female→male drift that happened when Gemini regenerated
    // a character object whose new identity text no longer matched
    // the (previously narrow) gender keyword list.
    const bindings = (identity && typeof identity.voiceBindings === 'object') ? identity.voiceBindings : null;

    characters.forEach((character, index) => {
        if (!character || typeof character !== 'object') return;
        const id = character.characterId || ('CHARACTER_' + (index + 1));
        let voiceName = normalizeGeminiVoiceName(character.voiceName || character.ttsVoice);
        if (!voiceName) {
            voiceName = assignDefaultVoiceName(character, index, bindings);
        }
        // If inference still returned empty, keep whatever was bound
        // before. Never overwrite a valid Kore/Puck with an empty.
        if (!voiceName && bindings && bindings[id]) {
            voiceName = normalizeGeminiVoiceName(bindings[id]) || bindings[id];
        }
        if (!voiceName) {
            // Last resort: log and stick with the prior field value
            // so we don't introduce a silent MALE flip.
            voiceName = normalizeGeminiVoiceName(character.voiceName || character.ttsVoice) || '';
            if (!voiceName) {
                try { console.warn('[V5.0 Voice Lock] enforceVoiceContinuity: no authoritative voice for ' + id + '. Leaving character.voiceName unchanged.'); } catch (_) {}
            }
        }
        if (voiceName) {
            character.voiceName = voiceName;
            character.ttsVoice = voiceName;
            if (bindings) bindings[id] = voiceName;
        }
    });

    const voiceByCharacterId = new Map(
        characters.map((character, index) => [
            character.characterId || ('CHARACTER_' + (index + 1)),
            character.voiceName || (bindings && bindings[character.characterId || ('CHARACTER_' + (index + 1))]) || ''
        ])
    );
    (Array.isArray(breakdown.scenes) ? breakdown.scenes : []).forEach(scene => {
        if (!scene || typeof scene !== 'object') return;
        scene.voiceCast = characters.reduce((cast, character, index) => {
            const id = character.characterId || ('CHARACTER_' + (index + 1));
            cast[id] = voiceByCharacterId.get(id) || (bindings && bindings[id]) || '';
            return cast;
        }, {});
    });
}

function deduplicateDialogueLines(value) {
    // Defends against AI rewrites that emit identical VOICEOVER / NARRATOR / CTA lines
    // multiple times. Keeps the first occurrence of each line, preserves order, and
    // collapses runs of duplicate empty lines.
    if (!value || typeof value !== 'string') return value;
    const seen = new Set();
    const kept = [];
    String(value).split('\n').forEach(rawLine => {
        const line = rawLine.replace(/\s+$/, '');
        const key = line.trim().toLowerCase();
        if (!key) {
            if (kept.length && kept[kept.length - 1] === '') return;
            kept.push('');
            return;
        }
        if (seen.has(key)) return;
        seen.add(key);
        kept.push(line);
    });
    while (kept.length && kept[kept.length - 1] === '') kept.pop();
    return kept.join('\n');
}

function dialogueScenePositionInstruction(sceneIdx, sceneCount, config) {
    const genre = detectGenre(config && config.story, !!(config && config.productReference && config.productReference.length));
    const isPromotion = genre === 'advertisement' || detectCommercialIntent(config && config.story);
    const isFinal = sceneIdx === Math.max(0, sceneCount - 1);
    if (isPromotion) {
        if (sceneIdx === 0) return 'PROMOTION STRUCTURE: This is the opening scene. Start with a concrete, product-specific hook in the first spoken line. Do not start with a greeting or generic slogan.';
        if (isFinal) return 'PROMOTION STRUCTURE: This is the final scene. End with one natural, product-specific CTA spoken in the last line. Do not introduce a new story beat after the CTA.';
        return 'PROMOTION STRUCTURE: This is a middle scene. Focus on a concrete problem, demonstration, reaction, or benefit. Do not use the final CTA yet.';
    }
    if (genre === 'drama' || genre === 'comedy' || genre === 'horror') {
        if (isFinal) return 'STORY STRUCTURE: This is the final scene. Place the emotional climax, reveal, consequence, or comedic gong in the final spoken turn. Build toward it; do not explain the ending too early.';
        return 'STORY STRUCTURE: Build pressure, discovery, or comic setup for a later payoff. Do not spend the final reveal or gong in this scene.';
    }
    return 'STORY STRUCTURE: Make the dialogue advance the current beat and end with a clear new decision, realization, question, or consequence.';
}

function dialogueStructureViolations(dialogue, sceneIdx, sceneCount, config) {
    const text = normalizeDialogueText(dialogue);
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const violations = [];
    const genre = detectGenre(config && config.story, !!(config && config.productReference && config.productReference.length));
    const isPromotion = genre === 'advertisement' || detectCommercialIntent(config && config.story);
    if (!isPromotion || !lines.length) return violations;
    const spokenLines = lines.filter(line => /^(?:\[[^\]]+\]\s*)?(?:CHARACTER_\d+|VOICEOVER|NARRATOR)\s*:/i.test(line));
    const firstLine = spokenLines[0] || '';
    const lastLine = spokenLines[spokenLines.length - 1] || '';
    if (sceneIdx === 0 && /^(?:\[[^\]]+\]\s*)?(?:CHARACTER_\d+|VOICEOVER|NARRATOR)\s*:\s*["']?(?:halo|hai|hi|hello|selamat pagi|selamat siang|selamat malam)\b/i.test(firstLine)) {
        violations.push('opening_hook_missing');
    }
    if (sceneIdx === Math.max(0, sceneCount - 1)
        && requiresFinalCommercialCta({ scenes: Array.from({ length: sceneCount }, () => ({})) }, config)
        && !dialogueHasNaturalCta(lastLine, config)) {
        violations.push('final_cta_missing');
    }
    return violations;
}

const DIALOGUE_VIOLATION_GUIDANCE = {
    blank_audio: 'Dialog kosong. Tulis dialog yang konkret sesuai aksi visual scene ini.',
    generic_or_template_audio: 'Dialog terasa generik atau template (frasa seperti "kita perlu bicara", "aku dengar kamu", "jujur duluan"). Ganti dengan kalimat spesifik yang lahir dari situasi, konflik, dan beat scene ini.',
    single_person_scene_has_extra_character: 'Scene ini hanya menampilkan satu orang, namun dialog menyebut CHARACTER_2 atau lebih. Hapus semua baris selain CHARACTER_1 (atau VOICEOVER). Jika butuh variasi, tulis beberapa giliran CHARACTER_1 dengan ekspresi berbeda.',
    two_active_people_need_real_back_and_forth: 'Scene punya dua karakter aktif, namun dialog tidak menunjukkan percakapan bolak-balik yang nyata. Setiap baris harus menjawab, menolak, atau mengubah konsekuensi dari baris sebelumnya. Jangan ulang permintaan yang sama atau bagi satu kalimat ke dua speaker.',
    product_or_sales_language_in_non_ad_story: 'Story ini bukan iklan, namun dialog memuat bahasa jual-beli (mis. "produk ini", "beli sekarang"). Hapus dan ganti dengan reaksi natural karakter terhadap objek/konflik scene.',
    hybrid_final_scene_should_resolve_story_not_sell: 'Scene terakhir ini hybrid (cerita + produk). Akhiri dengan resolusi cerita, bukan ajakan jual.',
    opening_hook_missing: 'Scene pertama untuk iklan harus membuka dengan hook yang menarik (bukan sapaan generik seperti "halo"/"hai"). Mulai dengan hook yang spesifik pada produk/keadaan.',
    final_cta_missing: 'Scene terakhir untuk iklan harus menutup dengan ajakan natural (mis. "cek [produk]", "kunjungi", "pesan"). Buat CTA yang terasa organik dari dialog, bukan slogan.',
    empty_dialogue: 'Dialog kosong untuk scene bersuara. Tulis dialog yang sesuai beat.',
    over_duration_word_budget: 'Terlalu banyak kata untuk durasi scene. Pangkas hingga sesuai budget kata (cek durasi scene).',
    missing_two_way_turns: 'Scene ini butuh percakapan dua arah tetapi hanya satu karakter yang bicara atau tidak ada giliran balasan yang nyata. Tulis respons yang benar-benar menanggapi.',
    voiceover_replaced_character_reply: 'VOICEOVER/NARRATOR menggantikan giliran CHARACTER yang seharusnya menjawab. Ganti VOICEOVER menjadi baris karakter sesuai peserta aktif scene.',
    unregistered_scene_speaker: 'Ada speaker yang tidak terdaftar sebagai karakter scene (mis. CHARACTER_3 padahal hanya CHARACTER_1 dan CHARACTER_2 yang aktif). Hapus atau ganti ke speaker yang sesuai.',
    // V5.0 banned-term entries. The key suffix matches the
    // `code` field in BANNED_DIALOGUE_TERMS so the user gets a
    // clear, term-specific explanation rather than a generic
    // "fix this" message.
    banned_dialogue_term_ban_sumpah: 'Kata "sumpah" (dan variasinya: sumpahan, bersumpah, dsb.) diharamkan dalam dialog karena terlalu sering muncul sebagai filler kasual. Ganti dengan ekspresi lain yang lebih spesifik untuk situasi scene — mis. "serius", "jujur", "aku janji", atau ungkapan yang lahir dari beat scene.',
    // V5.0 (D-1): off-topic violation guidance.
    dialogue_off_topic: 'Dialog lolos validasi struktur tapi TIDAK menyebut konteks scene (beat, visual action, story purpose). Harus ada minimal satu kata kunci spesifik dari scene — mis. menyebut nama produk, aksi yang terlihat di frame, atau topik beat. Kalau dialog hanya berisi kalimat generik seperti "kita bahas produknya", Gemini akan return lagi hal yang sama — coba regenerate dengan menambahkan detail produk/nama di brief, atau edit dialog secara manual.'
};

function getDialogueViolationGuidance(violationNames) {
    const list = Array.from(new Set((violationNames || []).filter(Boolean)));
    if (!list.length) return '';
    return list.map((name, index) => {
        const desc = DIALOGUE_VIOLATION_GUIDANCE[name] || 'Perbaiki pelanggaran ' + name + '.';
        return (index + 1) + '. [' + name + '] ' + desc;
    }).join('\n');
}

function auditSceneDialogue(scene, dialogue, sceneIdx, sceneCount, config, breakdown) {
    if (!scene) return ['blank_audio'];
    const probe = Object.assign({}, scene, { dialogueOrNarration: String(dialogue || '').trim() });
    return Array.from(new Set(
        sceneDialogueViolations(probe, config, breakdown, sceneIdx)
            .concat(dialogueStructureViolations(probe.dialogueOrNarration, sceneIdx, sceneCount, config))
    ));
}

function auditSceneDialogueForRegenerate(scene, dialogue, sceneIdx, sceneCount, config, breakdown) {
    if (!scene) return ['blank_audio'];
    const normalized = deduplicateDialogueLines(
        enforceDialogueCastAndLength(dialogue, scene, config)
    );
    scene.dialogueOrNarration = normalized;
    return Array.from(new Set(
        sceneDialogueViolations(scene, config, breakdown, sceneIdx)
            .concat(dialogueStructureViolations(normalized, sceneIdx, sceneCount, config))
    ));
}

function buildRepairCastContext(identity) {
    return (Array.isArray(identity && identity.characters) ? identity.characters : []).map(character => {
        const wardrobe = character.wardrobeDefault || character.wardrobe || '';
        return {
            id: character.characterId,
            name: character.speakerName || character.name || '',
            gender: character.gender || inferCharacterGender(character) || 'not specified',
            role: character.role || '',
            relationship: character.relationship || '',
            voice: character.voice || '',
            identity: character.identity || '',
            faceLock: character.faceLock || '',
            hairLock: character.hairLock || '',
            skinLock: character.skinLock || '',
            bodyLock: character.bodyLock || '',
            distinguishingFeatures: character.distinguishingFeatures || '',
            wardrobe: wardrobe
        };
    });
}

function buildCharacterLockText(cast) {
    if (!Array.isArray(cast) || !cast.length) return '';
    const lines = cast.map(character => {
        const id = character.id || 'CHARACTER_N';
        const name = character.name ? ' — ' + character.name : '';
        const identityParts = [
            character.identity,
            character.faceLock ? 'face=' + character.faceLock : '',
            character.hairLock ? 'hair=' + character.hairLock : '',
            character.skinLock ? 'skin=' + character.skinLock : '',
            character.bodyLock ? 'body=' + character.bodyLock : '',
            character.distinguishingFeatures ? 'features=' + character.distinguishingFeatures : '',
            character.wardrobe ? 'wardrobe=' + character.wardrobe : '',
            character.voice ? 'voice=' + character.voice : ''
        ].filter(Boolean).join(' | ');
        return id + name + ': ' + (identityParts || '(no trait lock)');
    });
    return 'CAST TRAIT LOCK (per-character, frozen):\n' + lines.join('\n');
}

function backfillCastBible(identity) {
    if (!identity || typeof identity !== 'object') return;
    const bible = ensureContinuityBible(identity);
    if (Array.isArray(bible.castBible) && bible.castBible.length) return;
    const chars = Array.isArray(identity.characters) ? identity.characters : [];
    bible.castBible = chars.map(character => {
        const id = character.characterId || 'CHARACTER_N';
        const name = character.speakerName || character.name || id;
        const trait = [
            character.identity,
            character.faceLock,
            character.hairLock,
            character.skinLock,
            character.bodyLock,
            character.distinguishingFeatures,
            character.wardrobeDefault || character.wardrobe,
            character.voice ? 'voice: ' + character.voice : ''
        ].filter(Boolean).join(' | ');
        return id + ' — ' + name + ' — ' + trait;
    });
    if (Array.isArray(bible.wardrobeBible) && !bible.wardrobeBible.length) {
        bible.wardrobeBible = chars.map(character => {
            const wardrobe = character.wardrobeDefault || character.wardrobe || '';
            return (character.characterId || 'CHARACTER_N') + ' — ' + wardrobe;
        }).filter(line => !line.endsWith(' — '));
    }
    identity.continuityBible = bible;
}

function annotateDialogueForRepair(dialogue, violationNames) {
    const lines = String(dialogue || '').split('\n');
    const labels = {
        blank_audio: 'KOSONG',
        generic_or_template_audio: 'GENERIK',
        single_person_scene_has_extra_character: 'SPEAKER-PINDAH',
        two_active_people_need_real_back_and_forth: 'BUKAN-BALIK-BALIK',
        product_or_sales_language_in_non_ad_story: 'BAHASA-JUAL',
        hybrid_final_scene_should_resolve_story_not_sell: 'BUKAN-JUAL',
        opening_hook_missing: 'HOOK-HILANG',
        final_cta_missing: 'CTA-HILANG',
        empty_dialogue: 'KOSONG',
        over_duration_word_budget: 'KEBIJAKAN-KATA',
        missing_two_way_turns: 'BUKAN-BALIK-BALIK',
        voiceover_replaced_character_reply: 'VOICEOVER-PENGGANTI',
        unregistered_scene_speaker: 'SPEAKER-TIDAK-TERDAFTAR'
    };
    const tagSet = new Set((violationNames || []).map(name => labels[name]).filter(Boolean));
    if (!tagSet.size) return lines.join('\n');
    const tagText = '[' + Array.from(tagSet).join('|') + ']';
    return tagText + '\n' + lines.join('\n') + '\n' + tagText;
}

async function auditAndRepairSceneDialogue(scene, dialogue, sceneIdx, sceneCount, config, breakdown, identity, status) {
    let candidate = String(dialogue || '').trim();
    let violations = auditSceneDialogue(scene, candidate, sceneIdx, sceneCount, config, breakdown);
    if (!violations.length) return { dialogue: candidate, violations: [] };

    const repairCast = buildRepairCastContext(identity);
    const previousDialogue = scene.dialogueOrNarration || '';

    const attemptStrategies = [
        { focus: 'structure', directive: 'Fokus pada STRUKTUR: perbaiki speaker, jumlah giliran, dan format baris. Pertahankan sebanyak mungkin frasa asli yang masih konkret.' },
        { focus: 'content', directive: 'Fokus pada KONTEN: ganti frasa generik/template dengan kalimat spesifik dari beat scene. Pertahankan struktur speaker yang sudah benar.' },
        { focus: 'rewrite', directive: 'Tulis ULANG dialog dari nol mengikuti brief pelanggaran di bawah. Jangan pertahankan frasa lama yang menyebabkan pelanggaran.' }
    ];

    const lastAccepted = { dialogue: candidate, violations };

    for (let attempt = 0; attempt < attemptStrategies.length; attempt++) {
        const strategy = attemptStrategies[attempt];
        try {
            if (status && attempt > 0) {
                status.textContent = 'Memperbaiki dialog (' + (attempt + 1) + '/3)...';
                status.className = 'text-[10px] text-cyan-300 mt-2 font-mono';
            }
            const repaired = await repairDialogueWithGemini(
                scene,
                config,
                repairCast,
                violations,
                breakdown,
                sceneIdx,
                {
                    focus: strategy.focus,
                    directive: strategy.directive,
                    violationGuidance: getDialogueViolationGuidance(violations),
                    previousBrokenDialogue: annotateDialogueForRepair(candidate, violations),
                    attemptNumber: attempt + 1
                }
            );
            const prepared = prepareInteractiveDialogueCandidate(repaired, scene, config, identity) || repaired;
            const normalized = deduplicateDialogueLines(enforceDialogueCastAndLength(prepared, scene, config));
            const probeViolations = auditSceneDialogue(scene, normalized, sceneIdx, sceneCount, config, breakdown);
            if (!probeViolations.length) {
                return { dialogue: normalized, violations: [] };
            }
            lastAccepted.dialogue = normalized;
            lastAccepted.violations = probeViolations;
            candidate = normalized;
            violations = probeViolations;
        } catch (repairError) {
            console.warn('[Dialogue Audit] Repair attempt ' + (attempt + 1) + ' failed:', repairError && repairError.message);
        }
    }
    // Restore original scene state so caller can decide what to do
    scene.dialogueOrNarration = previousDialogue;
    return lastAccepted;
}

// V5.0 (Isu #3): aggressive post-receive normalization for the
// first-draft dialogue. The Gemini Director occasionally ships
// text that fails downstream audits even though it's structurally
// close. This helper fixes the four most common failure modes in
// a deterministic, auditable way BEFORE the audit pipeline runs:
//
//   1. Strip lines that reference CHARACTER_3+ when only the
//      registered CHARACTER_1/2 are supposed to be active.
//   2. Strip pure-NARRATOR / SOUND-DESIGN labels that the model
//      invents as filler.
//   3. Re-attach dangling speaker labels to the previous line
//      when the model split one utterance across two lines.
//   4. Drop the redundant opening greeting when the previous
//      scene ended on the same beat.
// The helper NEVER invents new speaker turns; if a multi-speaker
// scene comes back with only one speaker, the audit layer (not
// this helper) is responsible for detecting and escalating.
function normalizeCandidateAfterReceive(candidate, scene, isSingleSpeaker, activeIds) {
    if (!candidate) return '';
    const safeActive = Array.isArray(activeIds) && activeIds.length
        ? activeIds
        : (scene && Array.isArray(scene.dialoguePlan && scene.dialoguePlan.participants)
            ? scene.dialoguePlan.participants
            : ['CHARACTER_1', 'CHARACTER_2']);
    const allowedIndices = safeActive
        .map(id => String(id || '').match(/CHARACTER_(\d+)/i))
        .filter(Boolean)
        .map(m => Number(m[1]));
    const maxAllowedIndex = allowedIndices.length ? Math.max.apply(null, allowedIndices) : 2;
    const minAllowedIndex = allowedIndices.length ? Math.min.apply(null, allowedIndices) : 1;

    let lines = String(candidate).split(/\r?\n/);

    // 1. Drop lines referencing characters not in activeIds when
    //    activeIds is well-defined and the scene is multi-speaker.
    if (!isSingleSpeaker && allowedIndices.length) {
        lines = lines.filter(line => {
            const m = line.match(/^\s*(?:\[[^\]]+\]\s*)?CHARACTER_(\d+)\s*:/i);
            if (!m) return true;
            const idx = Number(m[1]);
            if (idx < minAllowedIndex || idx > maxAllowedIndex) {
                try { console.warn('[V5.0 Dialogue Normalize] Dropped out-of-range CHARACTER_' + idx + ' line; expected range ' + minAllowedIndex + '..' + maxAllowedIndex + '.'); } catch (_) {}
                return false;
            }
            return true;
        });
    }

    // 2. Drop NARRATOR / SOUND DESIGN lines that are not dialogue.
    lines = lines.filter(line => {
        if (/^\s*(?:\[[^\]]+\]\s*)?(?:NARRATOR|SOUND\s*DESIGN)\s*:/i.test(line)) {
            try { console.warn('[V5.0 Dialogue Normalize] Dropped narrator/sound-design line — dialogue must come from CHARACTER_/VOICEOVER only.'); } catch (_) {}
            return false;
        }
        return true;
    });

    // 3. Merge a dangling speaker label into the previous line
    //    when the previous line has no closing quote.
    const merged = [];
    for (let i = 0; i < lines.length; i++) {
        const current = String(lines[i] || '').trim();
        if (!current) { merged.push(''); continue; }
        const previous = merged[merged.length - 1];
        if (previous
            && /"\s*$/.test(previous)
            && /^\s*(?:\[[^\]]+\]\s*)?(?:CHARACTER_\d+|VOICEOVER)\s*:/i.test(current)) {
            merged[merged.length - 1] = previous + ' ' + current;
        } else {
            merged.push(current);
        }
    }
    lines = merged.filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''));

    // V5.0 (user request): if any line still contains a banned
    // dialogue term after the structural cleanup above, drop
    // those lines before the audit pipeline sees them. Stripping
    // is preferred over auto-replacement because the latter can
    // produce surprising rewrites; dropping is conservative and
    // lets the deterministic fallback catch the loss.
    const stripped = stripBannedDialogueTerms(lines.join('\n'));
    if (stripped.dropped.length) {
        try { console.warn('[V5.0 Banned Term] Stripped banned terms before audit: ' + stripped.dropped.join(', ') + '.'); } catch (_) {}
    }

    return stripped.dialogue.trim();
}

async function generateSceneDialogue(sceneIdx, options = {}) {
    const silent = options && options.silent === true;
    const scene = state.directorData?.scenes?.[sceneIdx];
    if (!scene || isSilentAudioMode(state)) {
        if (!silent) showCanvasNotice(isSilentAudioMode(state) ? 'Mode audio saat ini tidak memakai dialog.' : 'Data scene tidak ditemukan.', 'warning');
        return;
    }
    state.language = resolveStoryboardLanguage(state);
    backfillCastBible(state.directorData && state.directorData.masterVisualIdentity);
    const variation = Boolean(String(scene.dialogueOrNarration || '').trim());
    const button = document.getElementById('btnGenerateDialogue_' + sceneIdx);
    const status = document.getElementById('dialogueStatus_' + sceneIdx);
    if (button && !silent) {
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-1"></i>Menulis...';
    }
    if (status && !silent) {
        status.textContent = variation ? 'Membuat variasi dialog baru...' : 'Membuat dialog dari aksi scene...';
        status.className = 'text-[10px] text-cyan-300 mt-2 font-mono';
    }
    try {
        const identity = state.directorData.masterVisualIdentity || {};
        const cast = buildRepairCastContext(identity);
        const sceneCount = Array.isArray(state.directorData.scenes) ? state.directorData.scenes.length : 1;
        const previous = sceneIdx > 0 ? state.directorData.scenes[sceneIdx - 1] : null;
        const next = sceneIdx < sceneCount - 1 ? state.directorData.scenes[sceneIdx + 1] : null;
        const participantsFromPlan = (scene && scene.dialoguePlan && Array.isArray(scene.dialoguePlan.participants))
            ? scene.dialoguePlan.participants.filter(participant => /^CHARACTER_\d+$/i.test(String(participant)))
            : [];
        const registeredCastSize = Array.isArray(cast) ? cast.length : 0;
        // V5.0 (Isu #3 follow-up + Dialog Fix): kalau Director sudah mendaftarkan
        // 2+ peserta aktif di dialoguePlan (mis. Tony+Aisah), hormati sebagai
        // 2-speaker — JANGAN override dengan single-speaker berdasarkan cerita
        // yang generic. Untuk Rina-alone iklan, participants=1 → userStorySinglePerson
        // tetap apply, jadi Rina-fix sebelumnya masih aman.
        const participantsFromPlanCount = participantsFromPlan.length;
        const userStorySinglePerson = participantsFromPlanCount >= 2
            ? false
            : storyRequestedCastCount(state.story) <= 1;
        const effectiveSpeakerCount = participantsFromPlanCount >= 2
            ? participantsFromPlanCount
            : (userStorySinglePerson ? 1 : (participantsFromPlanCount > 0 ? participantsFromPlanCount : registeredCastSize));
        const isSingleSpeakerRegenerate = effectiveSpeakerCount <= 1;
        const durationSeconds = String(state.durationPerScene || '10s');
        const durationWordBudget = dialogueWordBudget(scene, state);
        const minWords = durationWordBudget.minWords;
        const maxWords = durationWordBudget.maxWords;
        const minLines = Math.max(1, Number(durationWordBudget.minLines) || 2);
        const maxLines = Math.max(minLines, Number(durationWordBudget.maxLines) || 4);
        const durationLineBudget = isSingleSpeakerRegenerate
            ? `1-${Math.max(2, maxLines)} playable lines`
            : `${minLines}-${maxLines} playable lines`;
        const preFlightBlock = `REGENERATE PRE-FLIGHT AUDIT — facts computed from user state, must be obeyed exactly:
REGISTERED CAST SIZE: ${registeredCastSize}.
ACTIVE PARTICIPANTS FOR THIS SCENE: ${participantsFromPlan.length ? participantsFromPlan.join(', ') : '(none — default to single speaker)'}.
EFFECTIVE SPEAKER COUNT: ${effectiveSpeakerCount}.
SELECTED SCENE DURATION: ${durationSeconds}.
TARGET SPOKEN WORDS: ${minWords}-${maxWords} total.
TARGET LINE COUNT: ${durationLineBudget}.
SPEAKER RULE: ${isSingleSpeakerRegenerate
    ? 'This scene is a SINGLE-SPEAKER scene. Only CHARACTER_1 (or VOICEOVER) may speak. NEVER invent CHARACTER_2, CHARACTER_3, or any other speaking character. The output dialogue must contain ONLY lines starting with CHARACTER_1: or VOICEOVER:.'
    : 'This scene is a MULTI-SPEAKER scene. Use exactly the listed active participants and alternate their turns naturally.'}
If the brief mentions other people (e.g. "anaknya", "ibunya"), treat them as off-screen references — they are NOT speakers in this scene unless the active participants list explicitly includes them.

V5.0 HARD CONSTRAINTS (Isu #3) — non-negotiable:
- Output ONLY valid lines starting with [emotion] CHARACTER_N: "..." or [emotion] VOICEOVER: "..."
- Every line MUST end with a closing double-quote character.
- Do NOT include any line without a speaker label.
- Do NOT include NARRATOR, SOUND DESIGN, or any narrator-style filler.
- ${isSingleSpeakerRegenerate
    ? 'EXACTLY 1 distinct speaker allowed (CHARACTER_1 or VOICEOVER). NO CHARACTER_2, NO CHARACTER_3, NO extra speakers.'
    : 'EXACTLY ' + (participantsFromPlan.length || 2) + ' distinct speaker(s) required, alternating turns. Min ' + Math.max(2, Number(durationWordBudget.minLines) || 2) + ' lines, max ' + maxLines + ' lines.'}
- Every line must be 4-15 words; total spoken words ${minWords}-${maxWords}.
- No generic opener like "halo", "hai", "apa kabar"; open with the scene beat itself.
- BANNED TERMS (V5.0 user request): NEVER use the word "sumpah" or any of its variants (sumpahan, bersumpah, sumpahi, dsb.) in any speaker line. Use a more specific expression that fits the scene beat — e.g. "serius", "jujur", "aku janji", or a concrete reaction.`;
        const request = {
            systemInstruction: { parts: [{ text: `You are the dialogue writer for one storyboard scene. Return JSON only: {"dialogueOrNarration":"..."}.
Write fresh, specific, natural spoken dialogue in ${state.language || 'Indonesian'}. Use only the registered active participants from the scene plan. Preserve the scene's facts, relationship, visual action, and audio mode.
Do not write planning notes, narration of visible action, generic greetings, motivational filler, or reusable slogans. Each line must have a distinct dramatic job and should respond to the immediate situation. Natural dialogue may include short interruptions, hesitation, subtext, or an incomplete phrase when appropriate; do not force every line to sound formal.

${preFlightBlock}

CHARACTER LOCK (HARD):
- Each CHARACTER_N has a frozen face, hair, skin, body, wardrobe anchor, voice, role, and relationship. Do NOT swap, merge, rename, or invent characters.
- CHARACTER_1 is the registered CHARACTER_1; CHARACTER_2 is the registered CHARACTER_2. They are NOT interchangeable.
- Each character's dialogue must sound like someone who LOOKS like the locked face/body description and TALKS like the locked voice. Use the wardrobe anchor when relevant for context but do not describe it in the dialogue.
- Speakers must match the dialoguePlan.participants for this scene. If the plan lists one participant, only that CHARACTER may speak (plus optional VOICEOVER). If two, both must alternate.

${buildCharacterLockText(cast)}
${dialogueScenePositionInstruction(sceneIdx, sceneCount, state)}
${variation ? 'VARIATION MODE: Create a genuinely different version. Change the conversational angle, emotional pressure, information order, or ending beat, not just synonyms. Keep the same factual scene constraints.' : 'FIRST DRAFT MODE: Choose the most specific conversational angle supported by the visible action.'}
Keep the selected duration (${state.durationPerScene || '10s'}): concise and playable, without cramming words. Return speaker labels using the existing format, for example [guarded] CHARACTER_1: "..."` }] },
            contents: [{ role: 'user', parts: [{ text: JSON.stringify({
                story: state.story,
                cast,
                scene: {
                    sceneNumber: scene.sceneNumber || sceneIdx + 1,
                    title: scene.title || '',
                    storyPurpose: scene.storyPurpose || '',
                    sceneBeat: scene.sceneBeat || '',
                    visualAction: scene.sceneVisualPlan?.visualAction || '',
                    dialoguePlan: scene.dialoguePlan || {},
                    participants: scene.dialoguePlan?.participants || [],
                    currentDialogue: variation ? scene.dialogueOrNarration || '' : '',
                    dialogueDeferred: scene.dialogueDeferred === true,
                    previousSceneEnding: previous?.dialogueOrNarration || previous?.continuityToNext || '',
                    nextScenePurpose: next?.storyPurpose || next?.sceneBeat || ''
                }
            }) }] }],
            generationConfig: { responseMimeType: 'application/json' }
        };
        const result = await invokeStoryboardTextRequest(request);
        const raw = (result?.candidates?.[0]?.content?.parts || []).filter(part => !part.thought).map(part => part.text || '').join('') || result?.text || '';
        const parsed = parseGeminiJsonResponse(raw);
        let candidate = prepareInteractiveDialogueCandidate(String(parsed?.dialogueOrNarration || '').trim(), scene, state, identity);
        // V5.0 (Isu #3): aggressive post-receive normalization. The
        // Gemini Director frequently (a) hallucinates CHARACTER_3+
        // when only CHARACTER_1/2 are active, (b) collapses a
        // 2-speaker scene into a 1-line monologue, (c) emits only
        // one character for the whole scene, or (d) repeats the
        // same opening greeting across scenes. Fix each of these
        // here so the audit pipeline sees cleaner text.
        candidate = normalizeCandidateAfterReceive(candidate, scene, isSingleSpeakerRegenerate, activeSceneCharacterIds(scene));
        // Post-receive guard: if the active speaker count is 1, the AI may still
        // hallucinate CHARACTER_2+. Strip those lines immediately so the rest of
        // the pipeline (audit, video prompt, TTS) only sees the allowed speakers.
        if (isSingleSpeakerRegenerate && candidate) {
            candidate = candidate.split('\n')
                .filter(line => !/^\s*(?:\[[^\]]+\]\s*)?CHARACTER_(?:[2-9]|[1-9]\d+)\s*:/i.test(line))
                .join('\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        }
        if (!candidate) throw new Error('Model mengembalikan dialog kosong.');
        const previousDialogue = scene.dialogueOrNarration || '';
        const audit = await auditAndRepairSceneDialogue(
            scene,
            candidate,
            sceneIdx,
            sceneCount,
            state,
            state.directorData,
            identity,
            status
        );
        const violations = audit.violations;
        if (violations.length) {
            // V5.0 (Isu #3): one last attempt with the
            // deterministic scene-beat fallback before we surface
            // the failure to the user. The fallback guarantees a
            // valid 2-speaker turn for interactive scenes and a
            // single-speaker line for closing monologs — even when
            // Gemini keeps refusing to cooperate.
            const needsTwo = !isSingleSpeakerRegenerate
                && (sceneRequiresInteractiveDialogue(scene, state) || sceneHasTwoActiveSpeakers(scene));
            if (needsTwo) {
                const fallback = buildFallbackSceneAudio(scene, state, true);
                const prepared = prepareInteractiveDialogueCandidate(fallback, scene, state, identity) || fallback;
                const normalized = deduplicateDialogueLines(enforceDialogueCastAndLength(prepared, scene, state));
                if (hasValidInteractiveDialogue(normalized, scene, state, true)) {
                    scene.dialogueOrNarration = normalized;
                    scene.dialogueDeferred = false;
                    scene.dialogueNeedsRepair = false;
                    scene.dialogueViolations = [];
                    scene.dialogueEngineViolations = [];
                    scene.dialogueRepairSource = 'deterministic scene-beat fallback (post-audit)';
                    try { console.warn('[V5.0 Dialogue] Scene ' + (scene.sceneNumber || sceneIdx + 1) + ' fell back to deterministic 2-speaker template after Gemini repair exhausted attempts.'); } catch (_) {}
                } else {
                    scene.dialogueOrNarration = previousDialogue;
                    const guidance = getDialogueViolationGuidance(violations);
                    const baseMessage = getDialogueRecoveryMessage(scene.sceneNumber || sceneIdx + 1, true);
                    const detailedMessage = baseMessage + (guidance ? '\n\nDetail pelanggaran:\n' + guidance : '');
                    const error = new Error(detailedMessage);
                    error.code = 'DIALOGUE_REPAIR_FAILED';
                    error.dialogueViolations = Array.from(new Set(violations));
                    throw error;
                }
            } else if (isSingleSpeakerRegenerate) {
                // V5.0 (Isu #3 follow-up): single-speaker fallback
                // path. The user story describes one character
                // (Rina-alone ads are the common case), so we use
                // the dedicated single-speaker template instead
                // of throwing. The template sanitises the subject
                // (no English story bleed) and never invents
                // CHARACTER_2.
                const singleFallback = buildFallbackSceneAudio(scene, state, false);
                if (singleFallback) {
                    scene.dialogueOrNarration = singleFallback;
                    scene.dialogueDeferred = false;
                    scene.dialogueNeedsRepair = false;
                    scene.dialogueViolations = [];
                    scene.dialogueEngineViolations = [];
                    scene.dialogueRepairSource = 'deterministic single-speaker fallback (post-audit)';
                    try { console.warn('[V5.0 Dialogue] Scene ' + (scene.sceneNumber || sceneIdx + 1) + ' fell back to deterministic single-speaker template after Gemini repair exhausted attempts.'); } catch (_) {}
                } else {
                    scene.dialogueOrNarration = previousDialogue;
                    const guidance = getDialogueViolationGuidance(violations);
                    const baseMessage = getDialogueRecoveryMessage(scene.sceneNumber || sceneIdx + 1, true);
                    const detailedMessage = baseMessage + (guidance ? '\n\nDetail pelanggaran:\n' + guidance : '');
                    const error = new Error(detailedMessage);
                    error.code = 'DIALOGUE_REPAIR_FAILED';
                    error.dialogueViolations = Array.from(new Set(violations));
                    throw error;
                }
            } else {
                scene.dialogueOrNarration = previousDialogue;
                const guidance = getDialogueViolationGuidance(violations);
                const baseMessage = getDialogueRecoveryMessage(scene.sceneNumber || sceneIdx + 1, true);
                const detailedMessage = baseMessage + (guidance ? '\n\nDetail pelanggaran:\n' + guidance : '');
                const error = new Error(detailedMessage);
                error.code = 'DIALOGUE_REPAIR_FAILED';
                error.dialogueViolations = Array.from(new Set(violations));
                throw error;
            }
        } else {
            scene.dialogueOrNarration = audit.dialogue;
            scene.dialogueDeferred = false;
            scene.dialogueRevision = (Number(scene.dialogueRevision) || 0) + 1;
            scene.dialogueSource = variation ? 'user-regenerated' : 'user-generated';
        }
        const config = Object.assign({}, state, { story: state.story });
        applyStoryboardSceneLocks(state.directorData, sceneIdx, config);
        const dialogueArea = document.getElementById('dialogueText_' + sceneIdx);
        const videoArea = document.getElementById('masterVideoPrompt_' + sceneIdx);
        if (dialogueArea) dialogueArea.value = scene.dialogueOrNarration;
        if (videoArea) videoArea.value = scene.masterVideoPrompt || '';
        if (status) {
            const fallbackSource = (scene.dialogueRepairSource === 'deterministic scene-beat fallback (post-audit)'
                || scene.dialogueRepairSource === 'deterministic single-speaker fallback (post-audit)')
                ? ' (menggunakan template fallback otomatis)'
                : '';
            status.textContent = 'Dialog tersimpan dan prompt video sudah disinkronkan' + fallbackSource + '.';
            status.className = 'text-[10px] text-emerald-300 mt-2 font-mono';
        }
        if (!silent) await persistCurrentStoryboardHistory();
    } catch (error) {
        if (silent) throw error;
        // V5.0 (Isu #3): when generation fails, mark the scene so
        // the result card shows a clear red "needs repair" badge
        // instead of silently looking green. Also clear
        // dialogueDeferred so future status queries can detect it.
        if (error && error.code === 'DIALOGUE_REPAIR_FAILED') {
            scene.dialogueNeedsRepair = true;
            scene.dialogueDeferred = false;
            scene.dialogueViolations = Array.isArray(error.dialogueViolations) ? error.dialogueViolations.slice() : [];
        }
        if (status) {
            const failurePrefix = '⚠ Dialog scene ' + (scene.sceneNumber || sceneIdx + 1) + ' GAGAL — ';
            const failureBody = error && error.code === 'DIALOGUE_REPAIR_FAILED'
                ? error.message
                : getDialogueRecoveryMessage(scene.sceneNumber || sceneIdx + 1, true);
            status.textContent = failurePrefix + failureBody;
            status.className = 'text-[10px] text-red-400 font-mono mt-2 font-bold';
        }
        showCanvasNotice(error && error.code === 'DIALOGUE_REPAIR_FAILED'
            ? error.message
            : getDialogueRecoveryMessage(scene.sceneNumber || sceneIdx + 1, true), 'warning');
    } finally {
        if (button && !silent) {
            button.disabled = false;
            button.innerHTML = '<i class="fa-solid fa-arrows-rotate mr-1"></i>Regenerate';
        }
    }
}

async function saveEditedSceneDialogue(sceneIdx) {
    const scene = state.directorData?.scenes?.[sceneIdx];
    const area = document.getElementById('dialogueText_' + sceneIdx);
    if (!scene || !area) return;
    const value = area.value.trim();
    const previous = scene.dialogueOrNarration || '';
    const previousVideoPrompt = scene.masterVideoPrompt || '';
    const previousRevision = scene.dialogueRevision;
    const previousSource = scene.dialogueSource;
    const previousDeferred = scene.dialogueDeferred;
    if (value === previous.trim()) {
        // Nothing actually changed; still re-sync the prompt in case it was stale.
        recompileSceneVideoPromptOnly(state.directorData, sceneIdx, Object.assign({}, state, { story: state.story }));
        const videoAreaSame = document.getElementById('masterVideoPrompt_' + sceneIdx);
        if (videoAreaSame) videoAreaSame.value = scene.masterVideoPrompt || '';
        showCanvasNotice('Dialog tidak berubah. Prompt video tetap sinkron.', 'info');
        return;
    }
    scene.dialogueOrNarration = value;
    const sceneCount = Array.isArray(state.directorData?.scenes) ? state.directorData.scenes.length : 1;
    const violations = sceneDialogueViolations(scene, state, state.directorData, sceneIdx)
        .concat(dialogueStructureViolations(scene.dialogueOrNarration, sceneIdx, sceneCount, state));
    if (violations.length) {
        scene.dialogueOrNarration = previous;
        area.value = previous;
        const status = document.getElementById('dialogueStatus_' + sceneIdx);
        const guidance = getDialogueViolationGuidance(violations);
        const baseMessage = getDialogueRecoveryMessage(scene.sceneNumber || sceneIdx + 1, true);
        const message = baseMessage + (guidance ? '\n\nDetail pelanggaran:\n' + guidance : '');
        if (status) {
            status.textContent = message.split('\n')[0];
            status.className = 'text-[10px] text-amber-300 mt-2 font-mono';
        }
        showCanvasNotice(message, 'warning');
        return;
    }
    try {
        scene.dialogueRevision = (Number(scene.dialogueRevision) || 0) + 1;
        scene.dialogueSource = 'user-edited';
        scene.dialogueDeferred = false;
        // Lightweight recompile: only rebuild the audio block of the existing video prompt.
        // We intentionally do NOT call applyStoryboardSceneLocks here because its aggressive
        // normalization (enforceHardWordLimit, deduplicateDialogueLines) can re-mutate the
        // user's manual edit and trigger the rollback path, which is what makes the save
        // button look like it fails to update the video prompt.
        recompileSceneVideoPromptOnly(state.directorData, sceneIdx, Object.assign({}, state, { story: state.story }));
        const savedScene = state.directorData.scenes[sceneIdx];
        const videoArea = document.getElementById('masterVideoPrompt_' + sceneIdx);
        if (area) area.value = savedScene.dialogueOrNarration || '';
        if (videoArea) videoArea.value = savedScene.masterVideoPrompt || '';
        const status = document.getElementById('dialogueStatus_' + sceneIdx);
        if (status) {
            status.textContent = 'Dialog disimpan. Prompt video sudah disinkronkan.';
            status.className = 'text-[10px] text-emerald-300 mt-2 font-mono';
        }
        await persistCurrentStoryboardHistory();
        showCanvasNotice('Dialog disimpan. Prompt video scene sudah diperbarui.', 'success');
    } catch (error) {
        scene.dialogueOrNarration = previous;
        scene.masterVideoPrompt = previousVideoPrompt;
        scene.dialogueRevision = previousRevision;
        scene.dialogueSource = previousSource;
        scene.dialogueDeferred = previousDeferred;
        area.value = previous;
        const videoArea = document.getElementById('masterVideoPrompt_' + sceneIdx);
        if (videoArea) videoArea.value = previousVideoPrompt;
        console.warn('[Save Dialogue] Recompile failed:', error && error.message);
        const message = getDialogueRecoveryMessage(scene.sceneNumber || sceneIdx + 1, true);
        const status = document.getElementById('dialogueStatus_' + sceneIdx);
        if (status) {
            status.textContent = message;
            status.className = 'text-[10px] text-amber-300 mt-2 font-mono';
        }
        showCanvasNotice(message, 'warning');
    }
}

function enforceCastSpeakerAlignment(scene, config, identity) {
    // Strip CHARACTER_N speaker lines whose index is out of bounds for the registered cast,
    // and strip ALL CHARACTER_N speakers when the audio mode is voice-over only.
    if (!scene || !scene.dialogueOrNarration) return scene;
    const audioMode = (config && config.audioMode) || '';
    const isVoOnly = /Voice-Over Narrator/i.test(audioMode) && !/Character/i.test(audioMode);
    const isCharacterOnly = /Character Dialogue \/ Lip-Sync/i.test(audioMode);
    const isCharacterNarrator = /Character \+ Narrator/i.test(audioMode);
    const charLineRe = /^(?:\[[^\]]+\]\s*)?CHARACTER_(\d+)\s*:/i;
    const chars = Array.isArray(identity && identity.characters) ? identity.characters : [];
    const maxSpeakerIndex = chars.length; // CHARACTER_1..CHARACTER_N
    const keptLines = String(scene.dialogueOrNarration).split('\n').filter(line => {
        const match = line.trim().match(charLineRe);
        if (!match) return true;
        const speakerIndex = Number(match[1]);
        if (speakerIndex > maxSpeakerIndex) return false;
        if (isVoOnly) return false;
        return true;
    });
    scene.dialogueOrNarration = keptLines.join('\n')
        .split('\n')
        .filter(line => !(isCharacterOnly && /^\s*(?:\[[^\]]+\]\s*)?(?:VOICEOVER|NARRATOR)\s*:/i.test(line)))
        .filter(line => !(isCharacterNarrator && /^\s*(?:\[[^\]]+\]\s*)?SOUND DESIGN\s*:/i.test(line)))
        .join('\n')
        .replace(/\n{3,}/g, '\n\n').trim();
    return scene;
}

function enforceCastAlignmentAcrossScenes(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes)) return;
    const identity = breakdown.masterVisualIdentity || {};
    breakdown.scenes.forEach(scene => enforceCastSpeakerAlignment(scene, config, identity));
}

function buildFinalSceneAntiRepeatLock(breakdown, sceneIdx, config) {
    const scenes = Array.isArray(breakdown && breakdown.scenes) ? breakdown.scenes : [];
    if (!scenes.length || sceneIdx !== scenes.length - 1) return '';
    const shots = Math.max(1, Number(config && config.shotsPerScene) || 1);
    return `FINAL SCENE ANTI-REPEAT LOCK — payoff must not feel like duplicated panels.
This is the final scene. Every panel must have a distinct purpose, framing, action, and emotional value.
Do not repeat the same pose, same over-the-shoulder view, same back-facing reflection, same close-up, same product-on-table shot, or same standing-at-window composition across multiple panels.
For ${shots} panel(s), build a clear progression: setup/arrival -> meaningful object/action -> reaction/decision -> final payoff image. If there are more panels, add escalation or detail inserts without duplicating composition.
Panel numbers must be unique and sequential. The last panel must be a new visual beat that closes the scene, not a recycled close-up from the previous panel.`;
}

function buildCharacterForensicRenderLock(identity, scene, config) {
    if (isCreativeMiniatureBuild(config || state)) {
        return 'MINIATURE BUILD FORENSIC LOCK — keep the same photoreal adult hands across every panel: same skin tone, same nail shape, same scale versus the miniature set. Do not introduce a face, full body, extra person, or life-size building. The assembled object stays miniature in every panel.';
    }
    const chars = Array.isArray(identity && identity.characters) ? identity.characters : [];
    if (!chars.length) return '';
    const beat = scene && scene.wardrobeBeat;
    const rows = chars.map((c, i) => {
        const id = c.characterId || ('CHARACTER_' + (i + 1));
        const wardrobeHit = Array.isArray(c.wardrobeByBeat) ? c.wardrobeByBeat.find(b => b && b.beat === beat) : null;
        return [
            id,
            c.speakerName || c.name ? 'name=' + (c.speakerName || c.name) : '',
            c.gender ? 'gender=' + c.gender : 'gender=not explicitly specified; preserve the registered identity without guessing',
            c.role ? 'role=' + c.role : '',
            c.identity ? 'identity=' + c.identity : '',
            c.faceLock ? 'face=' + c.faceLock : '',
            c.hairLock ? 'hair=' + c.hairLock : '',
            c.skinLock ? 'skin=' + c.skinLock : '',
            c.bodyLock ? 'body=' + c.bodyLock : '',
            c.distinguishingFeatures ? 'features=' + c.distinguishingFeatures : '',
            'wardrobe=' + ((wardrobeHit && wardrobeHit.wardrobe) || c.wardrobeDefault || c.wardrobe || 'locked outfit'),
            wardrobeHit && wardrobeHit.changeReason ? 'wardrobeChangeReason=' + wardrobeHit.changeReason : ''
        ].filter(Boolean).join('; ');
    });
    return `CHARACTER FORENSIC RENDER LOCK — every registered character is equally important.
Do not treat CHARACTER_2, CHARACTER_3, or later cast as generic extras. They must remain the same person in every panel where they appear.
FORBIDDEN: age-shift, face-swap, ethnicity drift, hairline change, hair length/style swap, body/posture redesign, beautification averaging, anime/cartoon conversion, or merging one character into another.
ROSTER:
${rows.join('\n')}
WARDROBE HARD RULE: the attached character photo/character sheet is the primary wardrobe plate when no explicit outfit is supplied. Reproduce the exact visible garment silhouette, colors, layers, sleeves, neckline, fabric/texture, accessories, footwear, and condition. Do not silently restyle, modernize, beautify, simplify, or replace it. A wardrobe change is valid only when the current scene explicitly contains a new day/time-skip or historical era, a user-requested outfit, or a physically necessary context such as sleepwear, uniform, rain-soaked clothing, formal event, or sport. A new location alone is not permission to change clothes.`;
}

function inferCharacterGender(character) {
    const explicit = String(character && (character.gender || character.sex || character.jenisKelamin) || '').trim();
    if (explicit) return explicit;
    const source = [character && character.role, character && character.identity, character && character.relationship]
        .filter(Boolean).join(' ').toLowerCase();
    if (/\b(?:female|woman|women|girl|perempuan|wanita|istri|ibu|mother|daughter|sister|saudari|cewek)\b/i.test(source)) return 'female / perempuan';
    if (/\b(?:male|man|men|boy|pria|laki-laki|suami|ayah|father|son|saudara|cowok)\b/i.test(source)) return 'male / pria';
    return '';
}

function buildDialogueCastLock(identity, scene) {
    const chars = Array.isArray(identity && identity.characters) ? identity.characters : [];
    const activeIds = activeSceneCharacterIds(scene);
    const selected = activeIds.length
        ? chars.filter(c => activeIds.includes(c.characterId))
        : chars;
    const rows = (selected.length ? selected : chars).map((c, i) => {
        const id = c.characterId || ('CHARACTER_' + (i + 1));
        const gender = c.gender || inferCharacterGender(c);
        return [
            id,
            c.speakerName || c.name ? 'name=' + (c.speakerName || c.name) : '',
            gender ? 'gender=' + gender : 'gender=not specified; do not invent one',
            c.role ? 'role=' + c.role : 'role=registered story role',
            c.relationship ? 'relationship=' + c.relationship : '',
            c.voice ? 'voice=' + c.voice : ''
        ].filter(Boolean).join('; ');
    });
    if (!rows.length) return '';
    return `DIALOGUE CAST IDENTITY LOCK — speaker IDs are fixed people, not interchangeable labels.
${rows.join('\n')}
Use the exact registered identity, gender only when explicitly locked above, relationship, role, and voice for each speaker. Never merge two speakers into one thought, assign a line to the wrong person, or let wardrobe color determine identity.`;
}

function buildStrictVisualConsistencyGate(breakdown, sceneIdx, config) {
    const scene = Array.isArray(breakdown && breakdown.scenes) ? breakdown.scenes[sceneIdx] : {};
    const identity = (breakdown && breakdown.masterVisualIdentity) || {};
    const visualStyleSetting = config && config.visualStyle === 'Custom Style' ? config.customStyle : config && config.visualStyle;
    const resolvedVisualStyle = config && config.storyboardMode === 'animation'
        ? resolveAnimationStyleName(config)
        : (visualStyleSetting === 'Auto' || !visualStyleSetting ? 'Realistic Photography' : visualStyleSetting);
    const styleKey = String(resolvedVisualStyle || '').toLowerCase();
    const realisticLike = /realistic|photography|cinematic|auto/.test(styleKey) && !(config && config.storyboardMode === 'animation');
    return `STRICT VISUAL CONSISTENCY GATE — render contract for Scene ${sceneIdx + 1}.
This gate overrides creativity when there is any conflict.
${buildCharacterForensicRenderLock(identity, scene, config)}
STYLE HARD GATE: selected style is "${resolvedVisualStyle}". ${realisticLike ? 'RENDER EVERY PANEL AS A DSLR PHOTOGRAPH, not as illustration, not as 3D render, not as animation. Treat each shot as if photographed by a Sony A7IV with 85mm portrait lens at f/1.8 in natural daylight. Visible skin pores and natural skin texture (no plastic skin, no doll-like eyes), real fabric weave and seams on clothing, real metallic paint reflections on car body, real-world lens optics with subtle bokeh, color science of actual daylight (not stylized palette). Shallow depth of field where framing allows. FORBIDDEN in every panel: cartoon, comic, manga, anime, cel-shading, vector art, 2D illustration, painterly look, watercolor, paper cutout, simplified line art, mixed media, plastic skin, doll-like face, stylized 3D render look, toy-like proportions, oversaturated color grading.' : buildAnimationMediumContract(config, resolvedVisualStyle) + ' Keep this exact selected medium in every panel. Do not drift into photorealism or another illustration/animation style.'}
TEXT HARD GATE: spoken dialogue, voiceover, CTA, narrator lines, subtitles, speech bubbles, quotes, and translated lines are AUDIO ONLY. They must never appear as visible words in the image unless Auto Caption Overlay is selected.
IDENTITY HARD GATE: wardrobe color is NOT identity. Keeping a blue/orange/red shirt is not valid if the face, age stage, hair, body, skin, or role changes. Never replace CHARACTER_2/3/4/etc. with a different person while preserving only clothing color.
PANEL HARD GATE: exactly ${(config && config.shotsPerScene) || 'the requested number of'} panels, unique sequential panel numbers only, no duplicate panel labels, no missing panels, no merged cells, no extra panels.
DRIFT REPAIR: if the previous attempt showed text artifacts, style drift, age drift, face drift, or CHARACTER_2 inconsistency, correct those issues instead of preserving them.`;
}

function buildRegenerateStrictLock(breakdown, sceneIdx, config) {
    const scene = Array.isArray(breakdown && breakdown.scenes) ? breakdown.scenes[sceneIdx] : null;
    if (!scene) return '';
    return `REGENERATE STRICT LOCK — fresh image, same locked scene.
Regenerate ONLY Scene ${sceneIdx + 1}: ${scene.title || 'Untitled'}.
Allowed changes: camera angle, lens feel, character pose/expression, blocking, lighting nuance, micro-composition, and visual polish inside the same story beat.
Forbidden changes: new story event, new locationId, new timeOfDay, new wardrobeBeat, new city/country, new product design/size, new named cast, missing registered cast, face/hair/body drift, style switch, scene mixing, copied neighboring scene, duplicate panels, extra/missing panel numbers, text artifacts, or any visible prompt/color-code text.
The regenerated image must still follow exactly ${Math.max(1, Number(config && config.shotsPerScene) || 1)} storyboard panel(s), aspect ratio ${(config && config.aspectRatio) || '9:16'}, and the current scene isolation lock.`;
}

function buildVoiceLock(identity, language) {
    const chars = Array.isArray(identity && identity.characters) ? identity.characters : [];
    if (!chars.length) return '';
    const bindings = (identity && typeof identity.voiceBindings === 'object') ? identity.voiceBindings : null;
    const rows = chars.map((character, index) => {
        const id = character.characterId || ('CHARACTER_' + (index + 1));
        const name = character.speakerName || character.name || '';
        const voice = character.voice || ('Unique frozen voice for ' + id + '.');
        // V5.0 (Isu #1): honor persistent binding first.
        const voiceName = normalizeGeminiVoiceName(character.voiceName || character.ttsVoice)
            || (bindings && normalizeGeminiVoiceName(bindings[id]))
            || assignDefaultVoiceName(character, index, bindings);
        return `${id}${name ? ' (' + name + ')' : ''}: voice preset=${voiceName || '(unresolved)'}; ${voice}`;
    });
    return `VOICE CAST LOCK — assign one permanent voice identity to each registered character for the entire storyboard and every episode. Never swap, merge, randomize, or reset voices between scenes. Keep the same voice preset, age impression, pitch range, timbre, resonance, accent, speaking rhythm, breath profile, and emotional baseline; emotion may change intensity but must not change the person's identity. Spoken language: ${language || 'Bahasa Indonesia'}.
${rows.join('\n')}
VOICE OUTPUT RULE: Every CHARACTER_N line must be performed by its exact registered voice. Voice-over/narrator is a separate voice and must never impersonate a character.`;
}

function normalizeDialogueSpeakerLabels(text, identity) {
    const chars = Array.isArray(identity && identity.characters) ? identity.characters : [];
    const aliases = new Map();
    chars.forEach((character, index) => {
        const id = 'CHARACTER_' + (index + 1);
        [character.characterId, character.speakerName, character.role].filter(Boolean).forEach(alias => {
            aliases.set(String(alias).trim().toLowerCase(), id);
        });
    });
    aliases.set('suami', 'CHARACTER_1');
    aliases.set('istri', 'CHARACTER_2');
    aliases.set('ayah', 'CHARACTER_1');
    aliases.set('ibu', 'CHARACTER_2');
    return String(text || '').split('\n').map(line => line.replace(
        /^(\s*(?:\[[^\]]+\]\s*)?)([^:\n]+)(\s*:\s*)/,
        (match, prefix, label, suffix) => {
            const normalizedLabel = String(label).trim().toLowerCase();
            const characterId = aliases.get(normalizedLabel) || (/^CHARACTER_\d+$/i.test(normalizedLabel) ? normalizedLabel.toUpperCase() : '');
            return characterId ? prefix + characterId + suffix : match;
        }
    )).join('\n');
}

function storyboardGridLock(shots, ratio, textRule) {
    const n = Math.max(1, Math.min(6, Number(shots) || 1));
    const clean = textRule || 'No extra captions, titles, or labels besides tiny corner numbers.';
    const overlayMode = /Auto Caption Overlay|intentional.*overlay/i.test(clean);

    // Cell aspect ratio math (concrete fractions — diffusion models follow math better than adjectives)
    const ratioMap = { '9:16': 9/16, '16:9': 16/9, '1:1': 1, '4:5': 4/5, '5:4': 5/4, '3:4': 3/4, '4:3': 4/3 };
    const canvasRatio = ratioMap[ratio] || 9/16;
    const isPortraitCanvas = canvasRatio < 1;
    const sixPanelGeometry = isPortraitCanvas
        ? { rows: 3, cols: 2, cellWFrac: 1/2, cellHFrac: 1/3, layout: 'portrait' }
        : { rows: 2, cols: 3, cellWFrac: 1/3, cellHFrac: 1/2, layout: 'landscape' };
    const cellGeometry = {
        1: { rows: 1, cols: 1, cellWFrac: 1,     cellHFrac: 1    },
        2: { rows: 1, cols: 2, cellWFrac: 1/2,   cellHFrac: 1    },
        3: { rows: 1, cols: 3, cellWFrac: 1/3,   cellHFrac: 1    },
        4: { rows: 2, cols: 2, cellWFrac: 1/2,   cellHFrac: 1/2  },
        5: { rows: 3, cols: 2, cellWFrac: 1/2,   cellHFrac: 1/3  },
        6: sixPanelGeometry
    };
    const geo = cellGeometry[n];
    const cellAspect = (geo.cellWFrac * canvasRatio) / geo.cellHFrac;
    const cellMath = `CELL MATH (NON-NEGOTIABLE): canvas ${ratio || '9:16'}, ${geo.rows} row(s) × ${geo.cols} column(s). Each cell = exactly ${(geo.cellWFrac*100).toFixed(2)}% canvas width × ${(geo.cellHFrac*100).toFixed(2)}% canvas height. Each cell aspect ratio ≈ ${cellAspect.toFixed(2)}:1 (w:h). Cells are MATHEMATICAL fractions, not artistic interpretation.`;

    // Strict equal-cell rules — each layout MUST produce equal-sized cells
    const equal = [
        n === 5
            ? 'CELL GEOMETRY EXCEPTION FOR 5 PANELS: Panels 1, 2, 4, and 5 are equal half-width cells; Panel 3 is the single full-width middle cell exactly as specified below. Do not create any other geometry.'
            : 'EQUAL CELLS — NON-NEGOTIABLE: every panel has IDENTICAL width AND identical height. ECU/close-up happens INSIDE the cell — it must NEVER resize, stretch, or enlarge that cell.',
        'FORBIDDEN: merged cells, L-shaped cells, oversized cells, empty blur cells, overlapping frames, collage layout, extra panels, partial panels, duplicate panels, or ragged edges.',
        'BLACK GUTTERS: thin even black dividers between ALL adjacent cells. Each gutter width = max(8px, 1.5% of canvas width). No gutter = grid failure.'
    ].join(' ');
    const map = {
        1: [
            'LAYOUT: 1 full-bleed frame filling 100% canvas. No grid lines. No extra panels. No split-screen.',
            'FORBIDDEN: showing more than one angle, side-by-side, or multi-panel layout of any kind.'
        ].join(' '),
        2: [
            'LAYOUT: 1 horizontal row × 2 equal columns.',
            'Left cell = Panel 1. Right cell = Panel 2.',
            'Each cell = exactly 50% canvas width × 100% canvas height. No deviation.'
        ].join(' '),
        3: [
            'LAYOUT: 1 horizontal row × 3 equal columns.',
            'Left=Panel 1. Center=Panel 2. Right=Panel 3.',
            'Each cell = exactly 33.33% canvas width × 100% canvas height. All cells identical.'
        ].join(' '),
        4: [
            'LAYOUT: 2 horizontal rows × 2 equal columns (standard 2×2 grid).',
            'Top-left=Panel 1. Top-right=Panel 2. Bottom-left=Panel 3. Bottom-right=Panel 4.',
            'Each cell = exactly 50% canvas width × 50% canvas height. All 4 cells identical. Black gutters between all 4 sides.'
        ].join(' '),
        5: [
            'LAYOUT — render EXACTLY 5 panels (not 4, not 6, not 7). 3 rows in (2, 1, 2) pattern.',
            'PANEL NUMBER MAP (binding, follow exactly): P1 top-left. P2 top-right. P3 middle-center (full width, spans entire row). P4 bottom-left. P5 bottom-right. Each number 1–5 appears EXACTLY once.',
            'WRONG examples — DO NOT render like this: 6 panels total, 2×3 grid, 3 cells in bottom row, 4-panel 2×2 layout, split image across two cells, duplicate panel numbers, missing number labels.',
            'RIGHT pattern — render like this: row 1 = 2 equal cells side by side. Row 2 = 1 wide cell spanning full width. Row 3 = 2 equal cells side by side. Total = 5 panels. STOP at 5.',
            'NEVER split a single image across two cells. Each cell = ONE complete shot.',
            'NEVER duplicate panel numbers. 1, 2, 3, 4, 5 appear EXACTLY once each.',
            'NEVER leave a cell without its tiny number label in the top-left corner.',
            'If tempted to add a 6th panel, REMOVE one instead — never add.',
            'All cells visually equal-sized. Thin black gutters between cells. Middle cell vertically centered in its row.'
        ].join(' '),
        6: isPortraitCanvas ? [
            'LAYOUT: 3 horizontal rows × 2 equal columns (portrait-safe 3×2 grid).',
            'Row 1: Panel 1 (left) · Panel 2 (right). Row 2: Panel 3 (left) · Panel 4 (right). Row 3: Panel 5 (left) · Panel 6 (right).',
            'Each cell = exactly 50% canvas width × 33.33% canvas height. All 6 cells identical. Black gutters between all adjacent cells.',
            'FORBIDDEN: any row with unequal column widths. FORBIDDEN: merging cells. FORBIDDEN: 2 rows or 3 columns on portrait canvas.'
        ].join(' ') : [
            'LAYOUT: 2 horizontal rows × 3 equal columns (landscape-safe 2×3 grid).',
            'Top row: Panel 1 (left) · Panel 2 (center) · Panel 3 (right). Bottom row: Panel 4 (left) · Panel 5 (center) · Panel 6 (right).',
            'Each cell = exactly 33.33% canvas width × 50% canvas height. All 6 cells identical. Black gutters between all adjacent cells.',
            'FORBIDDEN: any row with unequal column widths. FORBIDDEN: merging cells. FORBIDDEN: 3 rows on landscape canvas.'
        ].join(' ')
    };
    const numRule = overlayMode
        ? `PANEL COUNT: render EXACTLY ${n} panels — no more, no less. Panel numbering: one tiny DIGIT ONLY, 1 to ${n}, in the top-left corner of each cell. Never prefix it with P, Panel, Shot, S, or any letter. Marketing overlay text is allowed only when intentionally designed by the Auto Caption Overlay contract.`
        : `PANEL COUNT: render EXACTLY ${n} panels — no more, no less. Panel numbering: one tiny DIGIT ONLY, 1 to ${n}, in the top-left corner of each cell. Never render P1, P2, P3, P4, P5, P6, Panel 1, Shot 1, S1, or any letter beside the number. Font-size max 2% of cell width, color #ffffff80. No other text, labels, captions, titles, initials, abbreviations, or letters on the image.`;
    const ratioLock = `CANVAS ASPECT RATIO: ${ratio || '9:16'}. Compose and crop for this ratio only. Do not change ratio.`;
    const refRule = 'REFERENCE IMAGES: distribute reference content across panels according to the LAYOUT above. Do NOT fuse references into a single unified composition. Each panel uses references independently as the scene requires.';
    return [
        'STORYBOARD GRID LOCK — MANDATORY. Violating any rule below = grid failure.',
        map[n],
        cellMath,
        equal,
        numRule,
        refRule,
        ratioLock,
        clean,
        overlayMode ? 'FORBIDDEN accidental text: PANEL, SHOT, FRAME, CELL, GRID, storyboard, shot list, prompt fragments, camera abbreviations, fake UI, and gibberish. Intentional marketing overlay text is allowed.' : 'NO LETTERS EXCEPT REQUIRED DIGITS: never render captions, subtitles, dialogue, speech bubbles, titles, logos, watermarks, labels, UI, camera abbreviations, prompt fragments, initials, P1/P2-style prefixes, or random letters. Write only one tiny bare sequential digit 1–' + n + ' in each cell, exactly once.',
        overlayMode ? 'Do not use plain subtitle styling. Render intentional overlay typography and graphic hierarchy only.' : 'Every panel number must be a bare digit, unique, sequential, and physically placed in its own cell. Never repeat a number, add a letter prefix, or place two numbers in one cell.',
        'Image must look like a clean printed storyboard or animatic contact sheet — nothing else.'
    ].join(' ');
}

function sanitizeStoryboardImagePrompt(prompt) {
    return String(prompt || '')
        .replace(/\bECU\b/gi, 'extreme close detail')
        .replace(/\bMCU\b/gi, 'close medium portrait')
        .replace(/\bCU\b/gi, 'close portrait')
        .replace(/\bOTS\b/gi, 'over the shoulder view')
        .replace(/\bWS\b/gi, 'wide view')
        .replace(/\bMS\b/gi, 'medium view')
        .replace(/\b(?:P|S)(\d+)\b/gi, '$1');
}

function buildCastLock(identity, config) {
    if (isCreativeMiniatureBuild(config || state)) {
        return `MINIATURE BUILD CAST LOCK — HANDS ONLY.
Do not register a speaking CHARACTER_1 with a face, outfit, or full body unless the user explicitly asked to show a person.
Visible humans are adult photoreal HANDS only, giant relative to the miniature set. Fingers pick up stones, wood, nets, walls, roofs, and tools.
No second social character. No eyeline conversation. No wardrobe. Skin tone may follow local Indonesian default.
The miniature world (house, boat, hut, village, or any assembled object) is the visual hero.`;
    }
    if (!identity) return '';
    const chars = Array.isArray(identity.characters) ? identity.characters : [];
    const lines = chars.map(c => {
        const registeredName = c.speakerName || c.name || '';
        const wardrobe = c.wardrobeDefault || c.wardrobe || '';
        return [
            `${c.characterId || 'CHARACTER_1'}${registeredName ? ' — REGISTERED NAME: ' + registeredName : ''} IDENTITY (FROZEN): ${c.identity || ''}.`,
            c.faceLock ? `FACE LOCK: ${c.faceLock}.` : '',
            c.hairLock ? `HAIR LOCK: ${c.hairLock}.` : '',
            c.skinLock ? `SKIN LOCK: ${c.skinLock}.` : '',
            c.bodyLock ? `BODY / POSTURE LOCK: ${c.bodyLock}.` : '',
            c.distinguishingFeatures ? `DISTINGUISHING FEATURES: ${c.distinguishingFeatures}.` : '',
            c.role ? `ROLE: ${c.role}.` : '',
            wardrobe ? `WARDROBE / COLOR ANCHOR: ${wardrobe}.` : '',
            c.referenceLock ? `REFERENCE LOCK: ${c.referenceLock}.` : ''
        ].filter(Boolean).join(' ');
    });
    if (!lines.length && identity.character) lines.push(`CHARACTER_1 IDENTITY (FROZEN): ${identity.character}.`);
    if (!lines.length) return '';
    return 'CAST IDENTITY LOCK — faces, bodies, hair, skin, age stage, wardrobe/color anchors, and distinguishing features are FROZEN for the whole video. Do not redesign anyone.\n' + lines.join('\n') + '\nCAST COUNT LOCK: render exactly the named cast required by the scene. Do not add, remove, merge, swap roles, swap wardrobe colors, or turn children into teens/adults unless the story explicitly says this scene is a future/time-skip/adult version.\nONLY REGISTERED CAST MAY BE VISUALLY IMPORTANT: do not invent an unregistered person, model, customer, friend, woman, man, or face. If this roster contains one character, show only CHARACTER_1 as a visible person; any background crowd must be faceless, distant, blurred, or cropped and must not read as a second main person.\nTIMELINE AGE RULE: age progression is allowed ONLY on explicit future/time-skip scenes, and must look like the same person at a later age. Otherwise keep the current age stage exactly.\nBackground extras: faces not prominent, never become new named characters.';
}

function storyRequestedCastCount(story) {
    const text = String(story || '').toLowerCase();
    if (storyRequestsRelationship(text, 'wife')) return 2;
    if (storyRequestsRelationship(text, 'mother')) return 2;
    if (storyRequestsInteractiveCast(text)) return 2;
    const wordMap = {
        satu: 1, seorang: 1, one: 1,
        dua: 2, two: 2,
        tiga: 3, three: 3,
        empat: 4, four: 4,
        lima: 5, five: 5,
        enam: 6, six: 6
    };
    const personWords = '(orang|pemeran|pemain|cast|aktor|aktris|anak|karakter|character|kids?|children|teman|sahabat|pendaki|nenek|kakek|lansia|ibu|istri|wife|bapak|ayah|suami|husband|mama|papa|pria|wanita|cewek|cowok|gadis|pemuda|model|talent|host|seller|pembeli|penjual|customer|creator|influencer)';
    const othersSuffix = '(lain|lainnya|others?|other\\s+people|additional)';

    const othersDigit = text.match(new RegExp('\\b([1-6])\\s*' + personWords + '\\s+' + othersSuffix + '\\b', 'i'));
    if (othersDigit) return Number(othersDigit[1]) + 1;
    for (const [word, count] of Object.entries(wordMap)) {
        const re = new RegExp('\\b' + word + '\\s+' + personWords + '\\s+' + othersSuffix + '\\b', 'i');
        if (re.test(text)) return count + 1;
    }

    const digit = text.match(new RegExp('\\b([1-6])\\s*' + personWords + '\\b', 'i'));
    if (digit) return Number(digit[1]);
    for (const [word, count] of Object.entries(wordMap)) {
        const re = new RegExp('\\b' + word + '\\s*' + personWords + '\\b', 'i');
        if (re.test(text)) return count;
    }
    if (/(\bibunya\b|\bibuku\b|\bibu\s+nya\b|\bmother\b|\bher\s+mother\b|\bhis\s+mother\b)/i.test(text)) return 2;
    if (/\b(?:orang|pria|wanita|karakter|tokoh|model|talent)\s+ini\b|\bfoto\s+ini\b|\bthis\s+(?:person|man|woman|character)\b/i.test(text)) return 1;
    return 0;
}

function storyRequestsRelationship(storyText, relationship) {
    const text = String(storyText || '').toLowerCase();
    if (relationship === 'wife') return /\b(?:istri|wife|my\s+wife|his\s+wife|her\s+husband|suami\s+istri)\b/i.test(text);
    if (relationship === 'mother') return /\b(?:anak\s+dan\s+ibu|ibu\s+dan\s+anak|child\s+and\s+mother|mother\s+and\s+child|ibunya|ibuku|ibu\s+nya|mother|mom|mama)\b/i.test(text);
    return false;
}

function buildStoryIntentContract(storyText) {
    const text = String(storyText || '').toLowerCase();
    const beats = [];
    if (storyRequestsRelationship(text, 'wife')) {
        beats.push({ beat: 'explicit confrontation between CHARACTER_1 and his wife', characters: ['CHARACTER_1', 'CHARACTER_2'], relationship: 'CHARACTER_2 is the female wife of CHARACTER_1', mustAppear: true, requiredEmotion: 'specific marital conflict grounded in the stated scene' });
    }
    if (storyRequestsRelationship(text, 'mother')) {
        beats.push({ beat: 'explicit interaction between CHARACTER_1 and his mother', characters: ['CHARACTER_1', 'CHARACTER_2'], relationship: 'CHARACTER_2 is the mother of CHARACTER_1', mustAppear: true, requiredEmotion: 'specific parent-child conflict grounded in the stated scene' });
    }
    if (/(diterima|lulus|terpilih|resmi menjadi|accepted|selected|become)\s+.{0,30}(astronot|astronaut)/i.test(text)) {
        beats.push({ beat: 'accepted and becoming an astronaut', characters: ['CHARACTER_1'], mustAppear: true });
    }
    if (/(berpamitan|pamitan|mengucapkan selamat tinggal|berpisah|farewell|saying goodbye|goodbye)/i.test(text)) {
        const parent = /\bibunya\b|\bibu\s+nya\b|\bmother\b/i.test(text) ? 'mother' : 'the specified person';
        beats.push({ beat: 'explicit farewell with ' + parent, characters: ['CHARACTER_1', 'CHARACTER_2'], mustAppear: true, requiredEmotion: 'tender, emotional farewell' });
    }
    if (/(\bibunya\b|\bibu\s+nya\b|\bmother\b)/i.test(text) && !beats.some(item => item.beat.indexOf('farewell') !== -1)) {
        beats.push({ beat: 'mother appears as a meaningful relationship, not a background extra', characters: ['CHARACTER_1', 'CHARACTER_2'], mustAppear: true });
    }
    if (!beats.length) return '';
    return `STORY INTENT CONTRACT — MANDATORY, DO NOT OMIT OR REPLACE WITH A GENERIC MONTAGE:
The user's explicit events and relationships are binding story beats. Every beat below must appear visibly in at least one dedicated scene or clearly readable scene beat. Preserve the exact relationship and action; do not merely mention it in narration.
${beats.map((item, index) => `${index + 1}. ${item.beat}; required characters=${item.characters.join(', ')}; relationship=${item.relationship || 'as stated by the user'}; emotion=${item.requiredEmotion || 'appropriate to the stated event'}; mustAppear=${item.mustAppear}`).join('\n')}
If a beat requires CHARACTER_2, register CHARACTER_2 with the correct relationship and give both characters a meaningful visual interaction and dialogue when audio is enabled.`;
}

function maxCharacterIdReferenced(breakdown) {
    const text = JSON.stringify(breakdown || {});
    const hits = text.match(/CHARACTER_(\d+)/g) || [];
    return hits.reduce((max, hit) => Math.max(max, Number(hit.replace('CHARACTER_', '')) || 0), 0);
}

function getSceneWardrobeBeat(scene, index) {
    const raw = String(scene && scene.wardrobeBeat || '').trim();
    if (raw) return raw;
    const loc = String(scene && scene.locationId || 'LOC_DEFAULT').trim();
    const time = String(scene && scene.timeOfDay || 'continuous').trim();
    return (loc + '-' + time).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || ('scene-' + (index + 1));
}

function sceneAllowsWardrobeChange(scene, previousScene, story) {
    const text = [
        story || '',
        scene && scene.title,
        scene && scene.timeOfDay,
        scene && scene.wardrobeBeat,
        scene && scene.masterImagePrompt,
        scene && scene.masterVideoPrompt,
        scene && scene.dialogueOrNarration
    ].filter(Boolean).join(' ').toLowerCase();
    const prevLoc = previousScene && previousScene.locationId;
    const locChanged = prevLoc && scene && scene.locationId && prevLoc !== scene.locationId;
    const explicitTimeOrDay = /(keesokan hari|hari berikutnya|besok pagi|besok malam|pagi berikutnya|malam berikutnya|hari yang berbeda|beberapa hari kemudian|seminggu kemudian|tahun kemudian|masa depan|jaman dulu|zaman dulu|masa lampau|historical|period piece|new day|next day|tomorrow|different day|days later|a week later|years later|future|past era|historical setting)/i.test(text);
    const explicitOutfitChange = /(ganti baju|berganti pakaian|berganti outfit|pakaian baru|outfit baru|memakai .* (?:baru|berbeda)|kenakan .* (?:baru|berbeda)|ubah .* (?:pakaian|outfit|kostum)|change clothes|change outfit|new outfit|different outfit|wears? .* instead|costume change|wardrobe change)/i.test(text);
    const contextualRequirement = /(seragam|piyama|baju tidur|pakaian tidur|baju kerja|pakaian kerja|pakaian sekolah|hujan deras|basah kuyup|pesta|pernikahan|pemakaman|olahraga|gym|kolam renang|pantai|salju|seragam kerja|uniform|pajamas?|sleepwear|workwear|school clothes|heavy rain|soaked|wedding|funeral|sport|gym|swimming pool|snow)/i.test(text);
    return explicitTimeOrDay || explicitOutfitChange || contextualRequirement || (!!locChanged && explicitTimeOrDay);
}

function ensureContinuityBible(identity) {
    if (!identity || typeof identity !== 'object') return {};
    const bible = identity.continuityBible && typeof identity.continuityBible === 'object'
        ? identity.continuityBible
        : {};
    identity.continuityBible = Object.assign({
        castBible: [],
        wardrobeBible: [],
        locationBible: [],
        productBible: [],
        rules: [
            'Every named or visually important person must be registered as CHARACTER_N before appearing.',
            'Face, body, hair, skin tone, age stage, role, and distinguishing marks are frozen unless the story explicitly time-skips.',
            'Wardrobe from an attached character photo or character sheet is the primary outfit lock. In the same day, time, setting, and continuity beat, repeat the exact visible outfit, colors, layers, accessories, footwear, hairstyle relation, and condition. Change wardrobe only for an explicit new day/time-skip/historical era, an explicit user outfit instruction, or a setting requirement that physically necessitates different clothing (sleep, uniform, rain-soaked, formal event, sport, etc.); otherwise reject model-invented wardrobe changes.',
            'Locations are frozen by locationId: architecture, props, color palette, lighting family, and background anchors must repeat when the same locationId returns.',
            'Hero product is frozen by product bible: exact design, shape, color, material, label/logo position, proportions, real-world size, and scale versus body must remain identical.'
        ]
    }, bible);
    return identity.continuityBible;
}

function characterBibleLine(c) {
    const parts = [
        c.characterId || 'CHARACTER_1',
        c.speakerName || c.name ? 'name=' + (c.speakerName || c.name) : '',
        c.role ? 'role=' + c.role : '',
        c.identity ? 'identity=' + c.identity : '',
        c.faceLock ? 'face=' + c.faceLock : '',
        c.hairLock ? 'hair=' + c.hairLock : '',
        c.skinLock ? 'skin=' + c.skinLock : '',
        c.bodyLock ? 'body=' + c.bodyLock : '',
        c.distinguishingFeatures ? 'features=' + c.distinguishingFeatures : '',
        c.wardrobeDefault ? 'wardrobeDefault=' + c.wardrobeDefault : '',
        c.referenceLock ? 'reference=' + c.referenceLock : ''
    ];
    return parts.filter(Boolean).join('; ');
}

function wardrobeBibleLine(entry) {
    return [entry.characterId, entry.beat, entry.wardrobe, entry.changeReason ? 'reason=' + entry.changeReason : 'locked continuity']
        .filter(Boolean).join('; ');
}

function locationBibleLine(loc) {
    return [
        loc.locationId || 'LOC_DEFAULT',
        loc.name || '',
        loc.lock || loc.backgroundAnchor || '',
        loc.lighting ? 'lighting=' + loc.lighting : '',
        loc.colorPalette ? 'palette=' + loc.colorPalette : ''
    ].filter(Boolean).join('; ');
}

function productBibleLine(product) {
    if (!product) return '';
    if (typeof product === 'string') return 'HERO_PRODUCT; identity=' + product + '; design/size/scale frozen from this description.';
    return [
        product.name || product.brand || product.type || 'HERO_PRODUCT',
        product.look ? 'look=' + product.look : '',
        product.shapeLock ? 'shape=' + product.shapeLock : '',
        product.colorMaterialLock ? 'colorMaterial=' + product.colorMaterialLock : '',
        product.labelLogoLock ? 'labelLogo=' + product.labelLogoLock : '',
        product.detailLock ? 'details=' + product.detailLock : '',
        product.realWorldSize ? 'realWorldSize=' + product.realWorldSize : '',
        product.scaleVsBody ? 'scaleVsBody=' + product.scaleVsBody : '',
        product.referenceLock ? 'reference=' + product.referenceLock : ''
    ].filter(Boolean).join('; ');
}

function knownSceneLeakTerms(text) {
    const t = String(text || '').toLowerCase();
    const termMap = [
        { re: /(gym|fitness|barbell|dumbbell|squat|bench press|rack|workout|latihan beban|angkat beban|alat fitness|cermin gym|sportswear|tank top|sport bra)/i, terms: ['gym', 'fitness equipment', 'barbell', 'dumbbell', 'squat rack', 'workout bench', 'gym mirror', 'sportswear', 'tank top', 'sport bra'] },
        { re: /(living room|ruang tamu|sofa|couch|coffee table|meja tamu|lemari pajangan|foto keluarga|family photo|lampu meja|karpet|vase|vas bunga)/i, terms: ['living room', 'sofa', 'coffee table', 'display cabinet', 'family photos', 'table lamp', 'rug', 'flower vase'] },
        { re: /(bedroom|kamar tidur|ranjang|bed|selimut|pillow|bantal|nightstand|lemari pakaian|piyama|pajama)/i, terms: ['bedroom', 'bed', 'blanket', 'pillow', 'nightstand', 'wardrobe cabinet', 'pajamas'] },
        { re: /(office|kantor|desk|meja kerja|laptop|cubicle|meeting room|ruang rapat|whiteboard)/i, terms: ['office', 'work desk', 'laptop', 'cubicle', 'meeting room', 'whiteboard'] },
        { re: /(market|pasar|stall|kios|lapak|vendor|dagangan|keranjang|crowd|keramaian)/i, terms: ['market', 'stall', 'vendor kiosk', 'basket', 'crowd', 'street merchandise'] },
        { re: /(cafe|kafe|coffee shop|barista|espresso|meja kafe|kursi kafe|menu board)/i, terms: ['cafe', 'coffee shop', 'barista counter', 'espresso machine', 'cafe table', 'menu board'] },
        { re: /(street|jalan|trotoar|traffic|lalu lintas|mobil|motor|zebra cross|sidewalk)/i, terms: ['street', 'sidewalk', 'traffic', 'cars', 'motorcycles', 'zebra crossing'] }
    ];
    const out = [];
    termMap.forEach(item => {
        if (item.re.test(t)) item.terms.forEach(term => {
            if (!out.includes(term)) out.push(term);
        });
    });
    return out;
}

function buildSceneContextText(scene) {
    if (!scene) return '';
    const shots = Array.isArray(scene.shots) ? scene.shots.map(s => [s.action, s.camera].filter(Boolean).join(' ')).join(' ') : '';
    return [scene.title, scene.locationId, scene.timeOfDay, scene.wardrobeBeat, scene.masterImagePrompt, scene.masterVideoPrompt, scene.dialogueOrNarration, shots].filter(Boolean).join(' ');
}

function buildSceneIsolationLock(breakdown, sceneIdx) {
    const scenes = Array.isArray(breakdown && breakdown.scenes) ? breakdown.scenes : [];
    const scene = scenes[sceneIdx] || {};
    const currentText = buildSceneContextText(scene);
    const currentTerms = knownSceneLeakTerms(currentText);
    const forbidden = [];
    scenes.forEach((other, i) => {
        if (i === sceneIdx) return;
        knownSceneLeakTerms(buildSceneContextText(other)).forEach(term => {
            if (!currentTerms.includes(term) && !forbidden.includes(term)) forbidden.push(term);
        });
    });
    const otherScenes = scenes
        .map((other, i) => i === sceneIdx ? '' : 'Scene ' + (i + 1) + ': ' + [other.locationId, other.timeOfDay, other.wardrobeBeat, other.title].filter(Boolean).join(' / '))
        .filter(Boolean)
        .join('\n');
    const forbiddenLine = forbidden.length
        ? '\nFORBIDDEN FOREIGN SCENE ELEMENTS: Do NOT show ' + forbidden.join(', ') + ' unless the CURRENT scene explicitly asks for them.'
        : '';
    return `SCENE ISOLATION LOCK — render ONLY Scene ${sceneIdx + 1}.
CURRENT SCENE IDENTITY: locationId=${scene.locationId || 'current'}; timeOfDay=${scene.timeOfDay || 'continuous'}; wardrobeBeat=${scene.wardrobeBeat || 'default'}; title=${scene.title || 'Untitled'}.
All panels in this storyboard image belong to this CURRENT scene only. Do not import, flashback, preview, echo, blend, or accidentally paste action, wardrobe, props, background, lighting, or location from any other scene.
Scene-to-scene continuity means narrative order only; it does NOT mean visual mixing.
OTHER SCENES ARE NOT TARGETS:
${otherScenes || 'None'}${forbiddenLine}`;
}

function storyboardGenre(breakdown, config) {
    const raw = String((breakdown && breakdown.contentGenre) || '').toLowerCase().trim();
    const allowed = ['advertisement', 'horror', 'dramatic', 'comedy', 'educational', 'action', 'documentary', 'hybrid', 'neutral', 'asmr', 'podcast', 'monologue'];
    const commercialIntent = detectCommercialIntent(config && config.story);
    if (!commercialIntent && (raw === 'advertisement' || raw === 'hybrid')) {
        return detectGenre(config && config.story, false);
    }
    if (allowed.includes(raw)) return raw;
    return detectGenre(config && config.story, !!(config && config.productReference && config.productReference.length));
}

function productDisplayName(identity, fallback) {
    const raw = identity && (identity.product || identity.objectProduct);
    if (raw && typeof raw === 'object') {
        return raw.name || raw.brand || raw.label || raw.type || raw.look || fallback || 'produk ini';
    }
    return String(raw || fallback || 'produk ini').trim() || fallback || 'produk ini';
}

function isLongStoryboard(config, breakdown) {
    const sceneCount = Number((config && config.sceneCount) || (breakdown && breakdown.scenes && breakdown.scenes.length) || 0);
    const shotsPerScene = Number((config && config.shotsPerScene) || 0);
    return sceneCount >= 4 || (sceneCount * shotsPerScene) >= 20;
}

function buildStorySpineLines(breakdown) {
    const scenes = Array.isArray(breakdown && breakdown.scenes) ? breakdown.scenes : [];
    return scenes.map((scene, i) => {
        const bits = [
            'Scene ' + (i + 1),
            scene.title || 'Untitled',
            scene.locationId || 'LOC_CURRENT',
            scene.timeOfDay || 'continuous',
            scene.wardrobeBeat || 'default'
        ];
        const purpose = String(scene.storyPurpose || scene.beatPurpose || scene.summary || '').trim();
        return bits.join(' / ') + (purpose ? ' / purpose=' + purpose : '');
    }).join('\n');
}

function inferScenePurpose(index, total, genre) {
    if (index === 0) return genre === 'advertisement' ? 'extreme hook and clear problem/desire setup' : 'hook and story setup';
    if (index === total - 1) return genre === 'advertisement' ? 'final benefit proof and CTA payoff' : 'story payoff without new subplot';
    if (total >= 5 && index === Math.floor(total / 2)) return genre === 'hybrid' ? 'natural mid-story product insertion without hard sell' : 'turning point / reveal';
    if (index < total / 2) return 'escalation from the previous scene';
    return 'consequence and setup for final payoff';
}

function enforceLongStoryboardRules(breakdown, config) {
    if (!isLongStoryboard(config, breakdown) || !breakdown || !Array.isArray(breakdown.scenes)) return;
    const genre = storyboardGenre(breakdown, config);
    breakdown.longStoryboardDiscipline = true;
    breakdown.scenes.forEach((scene, i) => {
        if (!scene || typeof scene !== 'object') return;
        if (!scene.storyPurpose) scene.storyPurpose = inferScenePurpose(i, breakdown.scenes.length, genre);
        if (!scene.title) scene.title = 'Scene ' + (i + 1) + ' - ' + scene.storyPurpose;
    });
}

function buildLongStoryboardDisciplineLock(breakdown, sceneIdx, config) {
    if (!isLongStoryboard(config, breakdown)) return '';
    const scenes = Array.isArray(breakdown && breakdown.scenes) ? breakdown.scenes : [];
    const scene = scenes[sceneIdx] || {};
    const prev = sceneIdx > 0 ? scenes[sceneIdx - 1] : null;
    const next = sceneIdx < scenes.length - 1 ? scenes[sceneIdx + 1] : null;
    const identity = (breakdown && breakdown.masterVisualIdentity) || {};
    const castCount = Array.isArray(identity.characters) ? identity.characters.length : maxCharacterIdReferenced(breakdown);
    const locCount = Array.isArray(identity.locations) ? identity.locations.length : 0;
    const spine = buildStorySpineLines(breakdown) || 'Scene spine must follow the user story in order.';
    return `LONG STORYBOARD DISCIPLINE LOCK — active because this storyboard has many scenes/shots.
CURRENT SCENE ONLY: Scene ${sceneIdx + 1} must execute its own beat: ${scene.title || 'Untitled'}.
STORY SPINE — do not invent a new story, genre, country, job, cast, product, or subplot outside this spine:
${spine}
CAST DISCIPLINE: Use only registered CHARACTER_1..CHARACTER_${Math.max(1, castCount)} unless the user explicitly requested more people. Background extras may be faceless/non-speaking only; they must not become new main characters.
LOCATION DISCIPLINE: Reuse the registered locationId system (${locCount || 'locked locations'}). Do not introduce a new city/country/office/home/fantasy setting unless the current scene explicitly names it.
WARDROBE DISCIPLINE: Keep wardrobeBeat=${scene.wardrobeBeat || 'default'} for this scene. Wardrobe may change only when wardrobeBeat changes with a story reason.
CONTINUITY CHECKPOINT: previous end=${prev ? [prev.title, prev.locationId, prev.wardrobeBeat].filter(Boolean).join(' / ') : 'opening scene'}; next purpose=${next ? [next.title, next.locationId, next.wardrobeBeat].filter(Boolean).join(' / ') : 'final payoff'}.
DRIFT FORBIDDEN: No sudden business pitch, Tokyo/foreign landmark, new relative, new romantic subplot, age jump, style switch, random meeting, or product/category change unless those details exist in the user's story or the locked spine.`;
}

function buildSceneDeltaLock(breakdown, sceneIdx) {
    const scenes = breakdown && breakdown.scenes;
    if (!Array.isArray(scenes) || sceneIdx <= 0 || !scenes[sceneIdx - 1]) return '';
    const prev = scenes[sceneIdx - 1];
    const prevMaster = String(prev.masterImagePrompt || '').trim();
    const sentences = prevMaster
        ? prevMaster.split(/(?<=[.!?])\s+/).filter(Boolean).slice(-2)
        : [];
    const recap = sentences.length
        ? sentences.join(' ')
        : ('Scene "' + (prev.title || 'previous') + '" ended at ' + (prev.locationId || 'same location') + ' during ' + (prev.timeOfDay || 'same time of day') + '.');
    const prevChars = Array.from(new Set((prevMaster.match(/CHARACTER_\d+/g) || []))).sort();
    const carryover = prevChars.length
        ? 'CARRYOVER UNCHANGED FROM PREV SCENE: ' + prevChars.join(', ') + ' must keep faceLock/hairLock/skinLock/bodyLock/wardrobeBeat exactly as scene ' + (sceneIdx) + '. No drift, no swap, no merge.'
        : '';
    return ['PREVIOUS SCENE END RECAP — continue the story from this exact end state: ' + recap, carryover].filter(Boolean).join('\n');
}

function buildExtremeAdHookLock(breakdown, sceneIdx, config) {
    if (isPlacePromotion(config)) return buildPlacePromotionContract(config);
    const genre = storyboardGenre(breakdown, config);
    if ((genre !== 'advertisement' && genre !== 'hybrid') || sceneIdx !== 0) return '';
    const plan = breakdown && breakdown.hookPlan ? breakdown.hookPlan : {};
    const hookType = plan.hookType || 'fresh product-driven pattern interrupt';
    const visualAction = plan.visualAction || 'Create one specific surprising physical action involving the hero product, not a static product display.';
    const audienceEffect = plan.audienceEffect || 'immediate surprise, curiosity, and desire to keep watching';
    return `EXTREME COMMERCIAL HOOK LOCK — ADVERTISEMENT / HYBRID.
Panel 1 / Shot 1 / second 0-3 MUST be a scroll-stopping extreme visual incident before normal selling begins.
SELECTED HOOK TYPE: ${hookType}.
MANDATORY VISUAL ACTION: ${visualAction}
AUDIENCE EFFECT: ${audienceEffect}.
Panel 1 must visibly show the beginning, peak, or immediate consequence of this exact action. The first frame cannot be a static product beauty shot.
The hook must be fresh, story-relevant, physically readable, and connected to the product. Examples are inspiration only, not templates: a sudden object impact, a dramatic catch, an impossible close-up transition, a brief chase, a surreal scale contrast, a shocking reaction, or an absurd interruption.
Do not always use the same stunt. Do not open with logo, smiling model, product on table, flat unboxing, talking head, or "Hai guys". The product benefit must become clear AFTER the hook.`;
}

function ensureSceneVisualPlans(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes)) return;
    const genre = storyboardGenre(breakdown, config);
    const isCommercial = !isPlacePromotion(config) && (genre === 'advertisement' || genre === 'hybrid');
    const miniaturePlans = [
        ['empty site', 'show raw ground or first miniature materials before construction', 'macro wide of the tiny site with giant hands entering', 'finished house or beauty product shot'],
        ['foundation', 'giant fingers place the first stones, posts, or base pieces', 'overhead or three-quarter macro of the miniature foundation', 'repeat the empty-site framing'],
        ['structure', 'assemble walls, hull, roof frame, or main body piece by piece', 'closer insert of fingers pinching miniature parts', 'duplicate the foundation composition'],
        ['detailing', 'add texture, tools, nets, moss, water, or craft details', 'extreme close-up of tactile miniature craft', 'repeat the structure pose'],
        ['completed miniature', 'reveal the finished tiny world still dwarfed by the hands', 'slightly wider macro of the completed diorama', 'recycled in-progress framing']
    ];
    const plans = isCreativeMiniatureBuild(config)
        ? miniaturePlans
        : isCommercial
        ? [
            ['impact hook', 'one arresting physical event that introduces the product', 'dynamic wide or low angle with immediate motion', 'static product display, ordinary beauty shot'],
            ['reveal and discovery', 'uncover a surprising product detail through movement or environment', 'tracking shot, oblique angle, or controlled transition', 'repeat the opening impact or same table composition'],
            ['sensory proof', 'make material, texture, function, or benefit tangible through a visual action', 'macro insert, tactile close-up, reflection, or unusual perspective', 'repeat the previous reveal framing'],
            ['human or environmental reaction', 'show the product changing a moment, mood, or behavior', 'reaction framing, over-shoulder, orbit, or motivated handheld movement', 'repeat a product-only hero pose'],
            ['payoff and invitation', 'resolve the visual idea with the clearest product payoff', 'confident final composition with a new silhouette and depth arrangement', 'recycle any earlier panel composition'],
            ['final CTA close', 'deliver the product invitation or CTA as a decisive closing image without introducing a new event', 'clean hero lockup with a distinct camera distance and visual finish', 'repeat the payoff framing or earlier product placement']
        ]
        : [
            ['opening image', 'establish the story world through a specific visual action', 'intentional opening composition', 'generic establishing shot'],
            ['development', 'advance the story through a new action or discovery', 'change shot scale and camera relationship', 'repeat the opening composition'],
            ['turning point', 'create a meaningful visual change', 'use a distinct angle, blocking, or visual motif', 'duplicate the previous beat'],
            ['consequence', 'show the result through behavior or environment', 'new spatial relationship and rhythm', 'repeat the same pose'],
            ['payoff', 'close the story with a fresh final image', 'distinct final composition', 'recycled framing']
        ];
    breakdown.scenes.forEach((scene, index) => {
        if (!scene || typeof scene !== 'object') return;
        const existing = scene.sceneVisualPlan && typeof scene.sceneVisualPlan === 'object' ? scene.sceneVisualPlan : {};
        const fallback = isPlacePromotion(config)
            ? [breakdown.scenes.length === 1 ? 'place introduction and invitation' : index === breakdown.scenes.length - 1 ? 'place invitation' : 'place discovery',
                'Reveal the referenced place through a concrete camera movement or registered presenter action, showing only supported features and inviting the requested enquiry or visit at the closing beat.',
                'Preserve site geography and use motivated changes in camera distance', 'invented facilities, boundaries or portable-product stunts']
            : plans[Math.min(index, plans.length - 1)];
        scene.sceneVisualPlan = Object.assign({
            sceneFunction: fallback[0],
            visualAction: fallback[1],
            cameraStrategy: fallback[2],
            avoidRepeating: fallback[3]
        }, existing);
        const intent = dialogueSceneFunction(scene);
        scene.sceneVisualPlan.intentName = intent.name;
    });
}

function buildSceneVisualPlanLock(breakdown, sceneIdx) {
    const scene = breakdown && breakdown.scenes && breakdown.scenes[sceneIdx];
    const plan = scene && scene.sceneVisualPlan;
    if (!plan) return '';
    return `SCENE VISUAL PLAN — unique creative function for Scene ${sceneIdx + 1}.
FUNCTION: ${plan.sceneFunction || 'distinct scene beat'}.
MANDATORY VISUAL ACTION: ${plan.visualAction || 'advance the story through a new visual action'}.
CAMERA STRATEGY: ${plan.cameraStrategy || 'use a fresh camera relationship'}.
DO NOT REPEAT: ${plan.avoidRepeating || 'any earlier scene composition, action, or framing'}.
Continuity means preserve identity and world logic, not duplicate composition. This scene must look unmistakably different from neighboring scenes while remaining part of the same story.`;
}

function ensureDialoguePlans(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes)) return;
    ensureSceneCharacterRoster(breakdown, config);
    const roster = Array.isArray(breakdown.masterVisualIdentity && breakdown.masterVisualIdentity.characters)
        ? breakdown.masterVisualIdentity.characters : [];
    breakdown.scenes.forEach((scene, index) => {
        if (!scene || typeof scene !== 'object') return;
        const existing = scene.dialoguePlan && typeof scene.dialoguePlan === 'object' ? scene.dialoguePlan : {};
        const finalSingleAftermath = isSingleCharacterFinalAftermath(scene, breakdown);
        if (finalSingleAftermath) {
            scene._singleCharacterFinalAftermath = true;
            scene.dialoguePlan = Object.assign({}, existing, {
                participants: ['CHARACTER_1'],
                mode: 'single-character emotional aftermath',
                turnPattern: 'CHARACTER_1 only',
                visualAnchor: 'CHARACTER_1 alone after CHARACTER_2 has exited',
                forbidden: 'CHARACTER_2 visible presence, dialogue, reply, reaction, or re-entry'
            });
        }
        const referenceCount = Math.min(CHARACTER_REF_MAX, (config && config.characterReference && config.characterReference.length) || 0);
        const existingParticipants = Array.isArray(existing.participants)
            ? existing.participants.filter(participant => /^CHARACTER_\d+$/i.test(String(participant)))
            : [];
        // V5.0 (Dialog Fix): kalau scene menyebut 2+ nama karakter terdaftar (mis.
        // "Tony menghampiri Aisah"), anggap 2-speaker walaupun cerita tidak
        // punya keyword interaksi eksplisit ("ngobrol", "bertengkar", dll).
        const castNameMatches = sceneMentionsMultipleCastNames(scene, roster);
        const interactive = !finalSingleAftermath && !creativeShapeSkipsInteractive(config) && (dialoguePlanExplicitlyRequiresTwoWay(scene)
            || sceneRequestsInteractiveCast(scene, config && config.story)
            || sceneReferencesTwoCharacters(scene)
            || castNameMatches.count >= 2);
        const singleSpeaker = sceneRequiresSingleSpeaker(scene, config);
        const participants = Array.isArray(existing.participants) && existing.participants.length
            ? existing.participants
            : interactive
                ? (castNameMatches.count >= 2 ? castNameMatches.ids.slice(0, 2) : ['CHARACTER_1', 'CHARACTER_2'])
                : singleSpeaker
                    ? ['CHARACTER_1']
                : (roster[0] ? [roster[0].characterId || 'CHARACTER_1'] : ['VOICEOVER']);
        if (referenceCount >= 2 && storyRequestsInteractiveCast(config && config.story)) {
            participants.splice(0, participants.length, ...Array.from({ length: referenceCount }, (_, i) => 'CHARACTER_' + (i + 1)));
        }
        if (sceneReferencesTwoCharacters(scene)) {
            participants.splice(0, participants.length, 'CHARACTER_1', 'CHARACTER_2');
        }
        if (castNameMatches.count >= 2 && !Array.isArray(existing.participants)) {
            participants.splice(0, participants.length, ...castNameMatches.ids.slice(0, 2));
        }
        scene.dialoguePlan = Object.assign({
            mode: interactive ? 'two-way character dialogue' : 'scene-appropriate spoken audio',
            participants: participants,
            dramaticObjective: scene.storyPurpose || scene.sceneVisualPlan?.visualAction || scene.title || 'advance the scene naturally',
            visualAnchor: scene.sceneVisualPlan?.visualAction || scene.sceneBeat || scene.title || 'the visible scene action',
            relationship: interactive ? 'the relationship and immediate social context stated by the story' : 'the relationship implied by the scene',
            trigger: interactive ? 'the visible action or first line starts the exchange' : 'the scene action or emotional beat',
            linePurpose: interactive ? 'each line must reveal intention, answer the previous turn, and move the interaction forward' : 'support the scene beat without generic filler',
            turnPattern: interactive ? chooseDialogueTurnPlan(scene).pattern : 'follow the selected audio mode',
            tone: interactive ? 'specific, responsive, natural, and emotionally grounded' : 'specific to the scene beat',
            forbidden: 'generic filler, repeated information, unrelated exposition, or monologue when participants interact'
        }, existing);
        if (finalSingleAftermath) {
            scene.dialoguePlan.participants = ['CHARACTER_1'];
            scene.dialoguePlan.mode = 'single-character emotional aftermath';
            scene.dialoguePlan.turnPattern = 'CHARACTER_1 only';
            scene.dialoguePlan.visualAnchor = 'CHARACTER_1 alone after CHARACTER_2 has exited';
            scene.dialoguePlan.forbidden = 'CHARACTER_2 visible presence, dialogue, reply, reaction, or re-entry';
        }
        const intent = dialogueSceneFunction(scene);
        scene.dialoguePlan.sceneIntent = intent.name;
        scene.dialoguePlan.intentRule = intent.rule;
        if (interactive) {
            scene.dialoguePlan.participants = ['CHARACTER_1', 'CHARACTER_2'];
            scene.dialoguePlan.turnPattern = chooseDialogueTurnPlan(scene).pattern;
        } else if (singleSpeaker) {
            scene.dialoguePlan.participants = ['CHARACTER_1'];
            scene.dialoguePlan.turnPattern = 'CHARACTER_1 only, or CHARACTER_1 with optional VOICEOVER';
        }
        if (isSilentAudioMode(config)) {
            scene.dialoguePlan.mode = 'silent ambience';
            scene.dialoguePlan.turnPattern = 'no spoken turns';
            scene.dialoguePlan.linePurpose = 'no spoken audio; visual action and non-verbal sound only';
            scene.dialoguePlan.forbidden = 'spoken dialogue, voice-over, narration, lip-sync, whispered words, CTA audio';
            scene.dialogueOrNarration = '';
            scene.dialogueNeedsRepair = false;
            scene.dialogueViolations = [];
            scene.dialogueEngineViolations = [];
        }
    });
}

function buildDialoguePlanLock(scene) {
    const plan = scene && scene.dialoguePlan;
    if (!plan) return '';
    const participants = Array.isArray(plan.participants) ? plan.participants.join(', ') : 'scene-appropriate speakers';
    return `DIALOGUE PLAN LOCK — this is the scene's dramatic audio blueprint.
MODE: ${plan.mode || 'scene-appropriate spoken audio'}.
PARTICIPANTS: ${participants}.
DRAMATIC OBJECTIVE: ${plan.dramaticObjective || 'advance the scene naturally'}.
VISUAL ANCHOR: ${plan.visualAnchor || 'the visible scene action'}.
RELATIONSHIP: ${plan.relationship || 'the relationship implied by the scene'}.
TRIGGER: ${plan.trigger || 'the visible action or emotional beat'}.
LINE PURPOSE: ${plan.linePurpose || 'support the scene beat without generic filler'}.
TURN PATTERN: ${plan.turnPattern || 'follow the selected audio mode'}.
TONE: ${plan.tone || 'specific and emotionally grounded'}.
FORBIDDEN: ${plan.forbidden || 'generic filler or unrelated exposition'}.
Every spoken line must respond to the immediately preceding action or line. Dialogue must reveal intention, create a reaction, or change the scene state. Do not make the characters recite the image prompt.`;
}

function buildDialogueStagingLock(scene, config) {
    if (!scene || isSilentAudioMode(config) || /Voice-Over Narrator/i.test(String(config && config.audioMode || ''))) return '';
    const interactive = sceneRequiresInteractiveDialogue(scene, config) || sceneHasTwoActiveSpeakers(scene);
    if (!interactive) return '';
    return `DIALOGUE STAGING / EYELINE LOCK — HARD.
When CHARACTER_1 speaks, CHARACTER_1 must visibly face and look toward CHARACTER_2's actual on-screen position. When CHARACTER_2 speaks, CHARACTER_2 must visibly face and look toward CHARACTER_1's actual on-screen position. Maintain consistent screen direction and a readable shot-reverse-shot axis; preserve left/right eyeline continuity across cuts.
Use over-the-shoulder, profile two-shot, or matched reverse angles that clearly show the listener and speaker relationship. Do not make both characters face away from each other. Do not make either character look directly into the camera, at the viewer, or past the other character unless the user explicitly requests a fourth-wall break or a deliberate reaction to camera. The camera is an observer, not a conversation partner. Every speaking turn requires visible mouth/lip-sync, eye focus on the other participant, and a responsive listener reaction.`;
}

function ensureCommercialHookPlan(breakdown, config) {
    if (isPlacePromotion(config)) return;
    const genre = storyboardGenre(breakdown, config);
    if (!breakdown || (genre !== 'advertisement' && genre !== 'hybrid')) return;
    const existing = breakdown.hookPlan && typeof breakdown.hookPlan === 'object' ? breakdown.hookPlan : {};
    const productName = productDisplayName(breakdown.masterVisualIdentity || {}, 'hero product');
    const productOnly = isProductOnlyCommercialBrief(config && config.story, config);
    breakdown.hookPlan = Object.assign({
        hookType: productOnly ? 'surreal product interruption' : 'sudden human-product pattern interrupt',
        visualAction: productOnly
            ? productName + ' enters frame with a sudden controlled slide or drop, stops at the exact visual beat, and reveals its key detail through a dramatic macro move.'
            : 'The locked lead character reacts to a sudden product-driven interruption, catches or reveals ' + productName + ' in one sharp readable movement, then turns the surprise into product use.',
        timing: '0-3 seconds, Panel 1 / Shot 1',
        audienceEffect: 'surprise, curiosity, and immediate product attention',
        productRole: 'hero product remains clearly recognizable during the hook',
        safetyNote: 'dramatic but controlled; no harmful action and no damage to the product'
    }, existing);
}

function buildGenreSalesLock(breakdown, sceneIdx, config) {
    if (isSilentAudioMode(config)) return '';
    if (isPlacePromotion(config)) return buildPlacePromotionContract(config);
    const genre = storyboardGenre(breakdown, config);
    const scenes = Array.isArray(breakdown && breakdown.scenes) ? breakdown.scenes : [];
    const isLast = sceneIdx === scenes.length - 1;
    if (genre === 'advertisement') {
        return `ADVERTISEMENT SALES STRUCTURE LOCK.
This is a pure ad. Scene 1 must open with the EXTREME AD HOOK. The final scene MUST end with a clear CTA in [AUDIO / DIALOGUE] or closing action, but it must be fresh, specific to the product, and not the generic "beli sekarang di link bio". CTA belongs only at the end, never as visible text unless Auto Caption Overlay is enabled.
${isLast ? 'FINAL CTA REQUIRED HERE: include one concise CTA tied to the product benefit, offer, store/action, or curiosity close.' : 'CTA FORBIDDEN IN THIS SCENE: build hook, proof, demo, emotion, or desire first.'}`;
    }
    if (genre === 'hybrid') {
        const middleStart = Math.max(0, Math.floor(scenes.length / 2) - 1);
        const middleEnd = Math.min(scenes.length - 1, middleStart + 1);
        const inMiddle = sceneIdx >= middleStart && sceneIdx <= middleEnd;
        const productName = productDisplayName(breakdown.masterVisualIdentity || {}, 'produk itu');
        return `HYBRID STORY-FIRST SALES LOCK.
This is cerita + iklan. Story, emotion, conflict, and payoff are the main engine. DO NOT turn the video into a hard-sell ad.
Product/sales mention is allowed only as natural mid-story insertion, preferably through character interaction or behavior, for example: "Sandal kamu kok bagus?" "Iya, ini ${productName} lagi promo." Keep it short and grounded.
${inMiddle ? 'MID-STORY PRODUCT INSERT ALLOWED HERE: mention/show the product organically inside the scene conflict or conversation.' : 'PRODUCT HARD-SELL FORBIDDEN HERE: keep focus on story beat; product may be visible only if natural.'}
FINAL CTA FORBIDDEN: the last scene must pay off the story, not ask viewers to buy, click, order, DM, check link, claim promo, or follow.`;
    }
    return '';
}

function enforceStoryboardGenreRules(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes)) return;
    const genre = storyboardGenre(breakdown, config);
    breakdown.contentGenre = genre;
    const scenes = breakdown.scenes;
    // CTA is optional during validation. If the model produces one, it belongs
    // only to the final advertisement scene; earlier scenes remain story-led.
    if (isPlacePromotion(config)) return;
    if (genre === 'hybrid' && scenes.length && !detectCommercialIntent(config && config.story)) {
        const last = scenes[scenes.length - 1];
        const ctaRe = /\b(?:cta|call to action|beli sekarang|order sekarang|pesan sekarang|klik link|link bio|dm sekarang|checkout|claim promo|klaim promo|dapatkan sekarang|coba sekarang|kunjungi toko|shop now|buy now|order now|learn more|get yours)\b[:\s"“”\-]*/gi;
        last.dialogueOrNarration = String(last.dialogueOrNarration || '').replace(ctaRe, '').trim();
        last.masterImagePrompt = String(last.masterImagePrompt || '').replace(ctaRe, '').trim();
        last.masterVideoPrompt = String(last.masterVideoPrompt || '').replace(ctaRe, '').trim();
    }
}

function ensureStoryboardAudioDialogue(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes) || isSilentAudioMode(config)) return;
    breakdown.scenes.forEach(scene => {
        if (scene && String(scene.dialogueOrNarration || '').trim()) {
            scene.dialogueOrNarration = normalizeDialogueSpeakerLabels(scene.dialogueOrNarration, breakdown.masterVisualIdentity);
            scene.dialogueOrNarration = normalizeDialogueSpeakerTurns(scene.dialogueOrNarration, scene, config);
            scene.dialogueOrNarration = normalizeDialogueExpressions(scene.dialogueOrNarration, scene);
        }
    });
}

function normalizeCharacterName(value) {
    const name = String(value || '')
        .replace(/\.[a-z0-9]{2,5}$/i, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!name || /^(?:unnamed|unknown|character|person|image|img|photo|foto|pasted image|screenshot|whatsapp image|scan|file|untitled)(?:\s+\d+)?$/i.test(name)) return '';
    if (/^(?:character|person|image|img|photo|foto)[ _-]?\d+$/i.test(name)) return '';
    return name.slice(0, 60);
}

function getRegisteredCharacterNames(config) {
    const configured = Array.isArray(config && config.characterNames) ? config.characterNames : [];
    const sheetCharacters = state.imageGen && state.imageGen.character && Array.isArray(state.imageGen.character.characters)
        ? state.imageGen.character.characters
        : [];
    return configured.concat(sheetCharacters.map(character => character && character.name || ''))
        .map(normalizeCharacterName)
        .filter(Boolean)
        .filter((name, index, names) => names.indexOf(name) === index);
}

function getCharacterReferenceName(ref, index, config) {
    const registeredNames = getRegisteredCharacterNames(config);
    return registeredNames[index] || normalizeCharacterName(ref && (ref.characterName || ref.name));
}

function normalizeContinuityBible(breakdown, config) {
    if (!breakdown) return;
    if (!breakdown.masterVisualIdentity || typeof breakdown.masterVisualIdentity !== 'object') {
        breakdown.masterVisualIdentity = {};
    }
    const identity = breakdown.masterVisualIdentity;
    const requestedCast = storyRequestedCastCount(config && config.story);
    const wifeRequested = storyRequestsRelationship(config && config.story, 'wife');
    const motherRequested = storyRequestsRelationship(config && config.story, 'mother');
    const productOnly = isProductOnlyCommercialBrief(config && config.story, config);
    const expected = productOnly
        ? 0
        : requestedCast > 0
        ? requestedCast
        : Math.max(
            maxCharacterIdReferenced(breakdown),
            Array.isArray(identity.characters) ? identity.characters.length : 0,
            Array.isArray(config && config.characterReference) ? config.characterReference.length : 0,
            getRegisteredCharacterNames(config).length
        );
    if (expected > 0) {
        const target = Math.min(6, expected);
        const chars = Array.isArray(identity.characters) ? identity.characters.slice(0, target) : [];
        for (let i = chars.length; i < target; i++) {
            chars.push({
                characterId: 'CHARACTER_' + (i + 1),
                role: i === 0 ? 'lead' : 'supporting cast',
                identity: 'Auto-created named character from user story. Keep face, age stage, body, skin, hair, and distinguishing features consistent across every scene.',
                faceLock: 'Director-created stable face lock for CHARACTER_' + (i + 1) + ': same facial structure, eyes, nose, jaw, expression range, and age stage every scene.',
                hairLock: 'Director-created stable hair lock.',
                skinLock: 'Director-created stable skin tone lock.',
                bodyLock: 'Director-created stable height, posture, and body type lock.',
                distinguishingFeatures: 'Director-created distinguishing visual anchors.',
                wardrobeDefault: (config && config.characterReference && config.characterReference.length) ? 'PRIMARY REFERENCE OUTFIT LOCK: inspect the attached character photo or character sheet and reproduce the exact visible outfit, layers, colors, fabric, accessories, and footwear. Do not redesign it unless an explicit wardrobe-change condition is present.' : 'Director-locked default outfit; preserve it unless the story explicitly requires a justified change.',
                referenceLock: (config && config.characterReference && config.characterReference.length) ? 'Attached character photo/character sheet is the master identity and outfit reference. Match the exact visible face, hair, body, outfit, layers, accessories, footwear, and garment condition.' : '',
                voice: 'Unique frozen voice for CHARACTER_' + (i + 1) + ': same age stage, pitch, accent, timbre, and speaking style unless explicit future/time-skip.',
                wardrobeDefault: 'Distinct wardrobe/color anchor chosen by the director; keep it stable inside the same wardrobeBeat.',
                wardrobeByBeat: []
            });
        }
        identity.characters = chars.map((c, i) => {
            const id = c.characterId || ('CHARACTER_' + (i + 1));
            const registeredName = normalizeCharacterName(c.speakerName || c.name || c.characterName) || getCharacterReferenceName(config && config.characterReference && config.characterReference[i], i, config);
            // V5.0 (Isu #1): ensure voiceBindings exists on identity
            // so downstream enforceVoiceContinuity() / buildVoiceLock
            // can read the persistent Kore/Puck assignment.
            if (!identity.voiceBindings || typeof identity.voiceBindings !== 'object') identity.voiceBindings = {};
            const bindings = identity.voiceBindings;
            const normalized = Object.assign({}, c, {
                characterId: id,
                name: registeredName,
                speakerName: registeredName,
                gender: c.gender || c.sex || c.jenisKelamin || '',
                role: c.role || (i === 0 ? 'lead' : 'supporting cast'),
                identity: c.identity || 'Auto-created named character from user story. Keep face, age stage, body, skin, hair, and distinguishing features consistent across every scene.',
                faceLock: c.faceLock || c.face || 'Frozen face: same facial structure, eyes, nose, jaw, age stage, and expression range every scene.',
                hairLock: c.hairLock || c.hair || 'Frozen hair style, length, color, and texture.',
                skinLock: c.skinLock || c.skin || 'Frozen skin tone and visible complexion.',
                bodyLock: c.bodyLock || c.body || 'Frozen height, posture, body type, and movement silhouette.',
                distinguishingFeatures: c.distinguishingFeatures || c.features || c.ciriKhas || 'Frozen distinctive anchors chosen by the director.',
                wardrobeDefault: c.wardrobeDefault || c.wardrobe || ((config && config.characterReference && config.characterReference.length) ? 'PRIMARY REFERENCE OUTFIT LOCK: reproduce the exact visible outfit from the attached character photo or character sheet, including layers, colors, fabric, accessories, footwear, and garment condition. No model-invented replacement.' : 'Distinct wardrobe/color anchor chosen by the director; keep it stable inside the same wardrobeBeat.'),
                referenceLock: c.referenceLock || ((config && config.characterReference && config.characterReference.length) ? 'Attached character photo/character sheet is the master identity and outfit reference. Match exact visible outfit, layers, accessories, footwear, and garment condition unless an explicit new day, historical era, user outfit instruction, or physically necessary setting change is present.' : ''),
                voice: c.voice || ('Unique frozen voice for ' + id + ': same age stage, pitch, accent, timbre, and speaking style unless explicit future/time-skip.'),
                // V5.0 (Isu #1): honor the persistent binding, then
                // any explicit voice on the character, then run the
                // improved inferrer.
                voiceName: normalizeGeminiVoiceName(c.voiceName || c.ttsVoice) || normalizeGeminiVoiceName(bindings[id]) || assignDefaultVoiceName(c, i, bindings),
                wardrobeByBeat: Array.isArray(c.wardrobeByBeat) ? c.wardrobeByBeat : []
            });
            if (typeof normalized.voiceName === 'string' && normalized.voiceName) {
                bindings[id] = normalized.voiceName;
            }
            if (wifeRequested && i === 1) {
                normalized.gender = 'female / perempuan';
                normalized.role = 'wife of CHARACTER_1; female spouse';
                normalized.identity = 'Female wife of CHARACTER_1; ' + normalized.identity;
                normalized.faceLock += ' Female facial identity; do not render as male.';
                normalized.bodyLock += ' Female body presentation; do not render as male.';
                normalized.referenceLock = (normalized.referenceLock ? normalized.referenceLock + ' ' : '') + 'CHARACTER_2 is the female wife of CHARACTER_1.';
            }
            if (motherRequested && i === 1) {
                normalized.gender = 'female / perempuan';
                normalized.role = 'mother of CHARACTER_1; adult female parent';
                normalized.identity = 'Adult female mother of CHARACTER_1; ' + normalized.identity;
                normalized.faceLock += ' Adult female facial identity; do not render as male.';
                normalized.bodyLock += ' Adult female body presentation; do not render as male.';
                normalized.referenceLock = (normalized.referenceLock ? normalized.referenceLock + ' ' : '') + 'CHARACTER_2 is the adult female mother of CHARACTER_1.';
            }
            return normalized;
        });
    }
    if (!identity.character && Array.isArray(identity.characters) && identity.characters.length) {
        identity.character = identity.characters.map(c => `${c.characterId}: ${c.identity}`).join(' | ');
    }
    const rawProduct = identity.product || identity.objectProduct;
    const userProductLock = config && config.productLock && (config.productLock.name || config.productLock.brand || config.productLock.size || config.productLock.material || config.productLock.color || config.productLock.texture || config.productLock.keyDetails);
    if (rawProduct || (!isPlacePromotion(config) && ((config && config.productReference && config.productReference.length) || userProductLock))) {
        const productObj = rawProduct && typeof rawProduct === 'object' ? rawProduct : {};
        const rawText = typeof rawProduct === 'string' ? rawProduct : '';
        const userLock = (config && config.productLock) || {};
        const productName = userLock.name || userLock.brand || productObj.name || productObj.brand || productObj.type || rawText || 'Hero product from attached reference';
        const hasProductRef = !!(config && config.productReference && config.productReference.length);
        identity.product = Object.assign({}, productObj, {
            name: productName,
            look: [userLock.name, userLock.brand, productObj.look, productObj.description, rawText].filter(Boolean).join(' — ') || 'Match the attached product reference exactly.',
            shapeLock: productObj.shapeLock || productObj.shape || 'Freeze the exact silhouette, proportions, thickness, edges, openings/caps/straps/handles, and product category. Do not morph into a different model.',
            colorMaterialLock: [userLock.color, userLock.material, userLock.texture, productObj.colorMaterialLock || productObj.material || productObj.color].filter(Boolean).join('; ') || 'Freeze exact dominant colors, accent colors, finish, texture, and material response.',
            labelLogoLock: productObj.labelLogoLock || productObj.logo || productObj.branding || 'Freeze label/logo placement, orientation, size, typography block, and visible markings. Do not invent new branding.',
            detailLock: [userLock.keyDetails, productObj.detailLock || productObj.details].filter(Boolean).join('; ') || 'Freeze all visible distinctive details, seams, buttons, cap, outsole, bottle neck, label shape, pattern, packaging edges, and surface marks.',
            realWorldSize: userLock.size || productObj.realWorldSize || 'Infer and freeze real-world size for this product category; keep it physically plausible in every panel.',
            scaleVsBody: productObj.scaleVsBody || 'Freeze ratio versus adult hand, face, torso, foot, table, and environment. Close-up may fill the frame, but any visible body/object reference must preserve true scale.',
            referenceLock: productObj.referenceLock || (hasProductRef ? 'Attached product reference is the master design plate and scale plate. Match it before any text description.' : 'Use the product description as the master design plate.')
        });
        identity.objectProduct = identity.objectProduct || productName;
    }
    if (!Array.isArray(identity.locations)) identity.locations = [];
    const scenes = Array.isArray(breakdown.scenes) ? breakdown.scenes : [];
    if (!identity.locations.length && scenes.length) {
        identity.locations.push({
            locationId: scenes[0].locationId || 'LOC_DEFAULT',
            name: 'Primary location',
            lock: 'Director-created location lock: same architecture, background anchors, key props, color palette, depth, and lighting family whenever this locationId appears.'
        });
    }
    const locById = {};
    identity.locations = identity.locations.map((l, i) => {
        const id = l.locationId || ('LOC_' + String(i + 1).padStart(2, '0'));
        const loc = Object.assign({}, l, {
            locationId: id,
            name: l.name || id,
            lock: l.lock || l.backgroundAnchor || 'Same architecture, background anchors, key props, color palette, depth, and lighting family whenever this locationId appears.',
            backgroundAnchor: l.backgroundAnchor || l.lock || 'Same visible background anchors and prop placement.'
        });
        locById[id] = loc;
        return loc;
    });
    let previousScene = null;
    scenes.forEach((scene, i) => {
        if (!scene.locationId) scene.locationId = (previousScene && previousScene.locationId) || (identity.locations[0] && identity.locations[0].locationId) || 'LOC_DEFAULT';
        if (!locById[scene.locationId]) {
            const loc = {
                locationId: scene.locationId,
                name: scene.locationId,
                lock: 'New director-created location lock: freeze architecture, background anchors, key props, color palette, depth, and lighting family for every return to this location.',
                backgroundAnchor: 'Keep the same visible background anchors and prop placement whenever this locationId returns.'
            };
            identity.locations.push(loc);
            locById[scene.locationId] = loc;
        }
        scene.wardrobeBeat = getSceneWardrobeBeat(scene, i);
        previousScene = scene;
    });
    const bible = ensureContinuityBible(identity);
    const wardrobeRows = [];
    const seenWardrobe = {};
    const chars = Array.isArray(identity.characters) ? identity.characters : [];
    chars.forEach(c => {
        if (!Array.isArray(c.wardrobeByBeat)) c.wardrobeByBeat = [];
        let prevBeat = '';
        let prevWardrobe = c.wardrobeDefault || c.wardrobe || 'Director-locked default outfit and color anchor.';
        scenes.forEach((scene, i) => {
            const beat = scene.wardrobeBeat || 'default';
            let hit = c.wardrobeByBeat.find(b => b && b.beat === beat);
            const allowChange = i === 0 || sceneAllowsWardrobeChange(scene, scenes[i - 1], config && config.story);
            const hasReferenceWardrobe = !!(config && config.characterReference && config.characterReference.length);
            const referenceOutfit = c.wardrobeDefault || c.wardrobe || '';
            if (i === 0 && hasReferenceWardrobe && referenceOutfit) {
                hit = hit || { beat: beat };
                hit.wardrobe = referenceOutfit;
                hit.changeReason = 'primary attached character photo/character sheet outfit lock';
                if (c.wardrobeByBeat.indexOf(hit) === -1) c.wardrobeByBeat.push(hit);
            }
            if (!hit) {
                hit = {
                    beat: beat,
                    wardrobe: allowChange ? (prevWardrobe || c.wardrobeDefault || c.wardrobe || 'Director-locked outfit for ' + beat + '.') : prevWardrobe,
                    changeReason: allowChange ? (i === 0 ? 'establish first wardrobe beat' : 'new day/location/context beat') : 'same continuity beat'
                };
                c.wardrobeByBeat.push(hit);
            } else if (!allowChange && prevWardrobe) {
                hit.wardrobe = prevWardrobe;
                hit.changeReason = 'forced same wardrobe: no explicit new day/place/context';
            } else if (!hit.changeReason) {
                hit.changeReason = allowChange ? 'allowed wardrobe beat' : 'same continuity beat';
            }
            const key = (c.characterId || '') + '|' + beat;
            if (!seenWardrobe[key]) {
                wardrobeRows.push({
                    characterId: c.characterId,
                    beat: beat,
                    wardrobe: hit.wardrobe || c.wardrobeDefault || c.wardrobe || '',
                    changeReason: hit.changeReason || ''
                });
                seenWardrobe[key] = 1;
            }
            prevBeat = beat;
            prevWardrobe = hit.wardrobe || prevWardrobe;
        });
        if (!c.wardrobeDefault && c.wardrobeByBeat[0]) c.wardrobeDefault = c.wardrobeByBeat[0].wardrobe;
    });
    bible.castBible = chars.map(characterBibleLine);
    bible.wardrobeBible = wardrobeRows.map(wardrobeBibleLine);
    bible.locationBible = identity.locations.map(locationBibleLine);
    bible.productBible = identity.product ? [productBibleLine(identity.product)].filter(Boolean) : [];
    identity.styleLock = buildStoryboardStyleLock(config);
    normalizeStoryboardShotTimeline(breakdown, config);
    backfillCastBible(identity);
}

function describeAnimationMedium(style) {
    const key = String(style || '').toLowerCase();
    if (!key.trim()) return '';
    if (/diorama|mini world|miniatur|tiny world|dunia miniatur/.test(key)) {
        return 'MANDATORY DIORAMA MINI WORLD MEDIUM — HARD OVERRIDE: show an immersive, fully animated miniature world that fills the entire frame, not a physical model displayed on a table. All people must be small, stylized miniature-world characters/figurines with coherent animated materials and proportions; preserve character identity through stylized features only. ABSOLUTELY NO real-life people, photoreal human faces or skin, life-size bodies, giant hands, or live-action footage. ABSOLUTELY NO table, tabletop, table edge, display stand/base, studio tabletop, or room around a model. Use tiny architecture, model-scale plants and props, crafted textures, and miniature-world lighting. Camera is inside/at the scale of the miniature world, following its characters and action; never shoot down at a model on a table. No photoreal full-scale streets or life-size human proportions.';
    }
    if (/claymation/.test(key)) {
        return 'MANDATORY CLAYMATION MEDIUM: background and environment must be hand-built plasticine/clay sets with visible sculpted forms, fingerprints, soft clay edges, miniature scale, practical stop-motion lighting, and clay-textured props. No photographic room, realistic landscape, real fabric, photorealistic skin, or live-action background.';
    }
    if (/wool|thread/.test(key)) {
        return 'MANDATORY WOOL THREAD STOP-MOTION MEDIUM: background and environment must be constructed from wool, yarn, thread, felt, and textile fibers with visible loops and woven texture. Characters, props, sky, ground, and architecture must share the same fiber-built material language. No realistic photography or live-action background.';
    }
    if (/paper|cut-out|collage/.test(key)) {
        return 'MANDATORY PAPER CUT-OUT MEDIUM: background and environment must be layered paper, cardstock, folded shapes, collage edges, paper grain, and visible cut silhouettes. Use flat or shallow dimensional paper staging everywhere. No realistic room, photographic landscape, or live-action background.';
    }
    if (/hand-drawn|2d/.test(key)) {
        return 'MANDATORY HAND-DRAWN 2D MEDIUM: background and environment must use coherent illustrated linework, hand-drawn shapes, painted 2D backgrounds, cel or brush shading, and animation-ready flat perspective. No photographic textures, realistic lens bokeh, or live-action background.';
    }
    if (/anime/.test(key)) {
        return 'MANDATORY ANIME CINEMATIC MEDIUM: background and environment must be fully illustrated anime cinematic art with consistent linework, stylized perspective, designed color keys, and anime lighting. No photorealistic room, realistic landscape, or live-action background.';
    }
    if (/3d/.test(key) || /pixar|disney/.test(key)) {
        return 'MANDATORY STYLIZED 3D ANIMATION MEDIUM: background and environment must be modeled and rendered in the same stylized 3D world as the characters, with coherent simplified geometry, stylized materials, animation proportions, and non-photoreal lighting. No live-action photography, realistic architectural textures, or DSLR look.';
    }
    if (/auto director/.test(key)) {
        return 'MANDATORY ANIMATION MEDIUM: all backgrounds, environments, characters, props, lighting, and camera rendering must be animated in one coherent non-photoreal style. Never use a realistic photographic background behind animated subjects.';
    }
    return 'MANDATORY USER STYLE "' + String(style).trim() + '": treat this exact user-named look as a locked animation medium. Infer its materials, scale, lighting, motion, texture, and camera language, then apply that look to every frame, character, prop, and environment. Do not rename, dilute, or convert it into photoreal live-action.';
}

function buildUserAnimationStyleContract(config) {
    if (!config || config.storyboardMode !== 'animation' || String(config.animationStyle || '') !== 'Custom Style') return '';
    const listed = parseUserAnimationStyles(config.animationCustomStyle);
    if (!listed.length) return 'USER-DEFINED ANIMATION STYLE CONTRACT — the custom field is empty; do not invent a replacement preset.';
    const lines = listed.map((name, index) => (index + 1) + '. "' + name + '" — understand this style as a production medium (materials, lighting, scale, camera, texture, motion) and apply it fully. Do not ignore, rename, or replace it.');
    return `USER-DEFINED ANIMATION STYLE CONTRACT — HARD.
The user specified ${listed.length} style${listed.length > 1 ? 's' : ''} that MUST all be understood and applied together in every scene, shot, character, prop, background, lighting setup, and camera:
${lines.join('\n')}
Combine them into one coherent animated world. Do not drop any listed style. Do not substitute a nearby preset unless the user named it. If styles appear to conflict, keep all of them visible rather than choosing one.`;
}

function buildStoryboardStyleLock(config) {
    const selected = String(config && config.storyboardMode === 'animation'
        ? resolveAnimationStyleName(config)
        : (config && config.visualStyle || 'Auto')).trim();
    const custom = String(config && config.storyboardMode === 'animation'
        ? (config.animationCustomStyle || '')
        : (config && config.customStyle || '')).trim();
    const style = config && config.storyboardMode === 'animation'
        ? selected
        : (selected === 'Custom Style' ? (custom || 'Custom style specified by user') : selected);
    const mediumContract = buildAnimationMediumContract(config, style);
    return {
        requested: custom || selected,
        resolved: style,
        lock: `STYLE LOCK — Use exactly "${style}" in every scene, shot, storyboard image, background, environment, character, prop, and video prompt. ${mediumContract} Preserve the same medium, rendering language, material response, lighting behavior, color treatment, scale language, and camera language. Never replace or dilute the user style.`
    };
}

function buildAnimationMediumContract(config, style) {
    if (!config || config.storyboardMode !== 'animation') {
        return 'Use the selected non-animation visual medium without introducing an animation treatment.';
    }
    const names = String(config.animationStyle || '') === 'Custom Style'
        ? parseUserAnimationStyles(config.animationCustomStyle)
        : [style || config.animationStyle || 'Auto Director Animation'];
    const mediumBits = names.map(name => describeAnimationMedium(name)).filter(Boolean);
    const unique = Array.from(new Set(mediumBits));
    const medium = unique.length
        ? unique.join(' ')
        : describeAnimationMedium(style || 'Auto Director Animation');
    return [medium, buildUserAnimationStyleContract(config)].filter(Boolean).join(' ');
}

function buildShotTimelineLock(scene, config) {
    const shots = Array.isArray(scene && scene.shots) ? scene.shots : [];
    if (!shots.length) return 'SHOT TIMELINE LOCK — No valid shot list was supplied; create the required shot timeline before writing prompts.';
    return 'SHOT TIMELINE LOCK — The video must explicitly follow this timecoded progression in order. Do not summarize it as a generic scene:\n' +
        shots.map(shot => `SHOT ${shot.shotNumber} (${shot.timecode || `${shot.startTime}-${shot.endTime}s`}): ACTION=${shot.action || 'specified scene action'}; CAMERA=${shot.camera || 'continuous motivated camera'}.`).join('\n') +
        '\nEvery shot must visibly perform its listed action during its listed time range, then hand off its end state to the next shot.';
}

function buildExplicitShotTimeline(scene, config) {
    const duration = Math.max(1, parseInt(String(config && config.durationPerScene || '10').match(/\d+/)?.[0] || '10', 10));
    const shots = Array.isArray(scene && scene.shots) ? scene.shots : [];
    if (!shots.length) return '';
    return '[SHOT TIMELINE — MANDATORY TIME-BLOCKED ACTIONS]\n' +
        `Total video duration: ${duration}s. Execute every shot in order; do not skip, merge, or invent time ranges.\n` +
        shots.map(shot => {
            const start = Number.isFinite(Number(shot.startTime)) ? Number(shot.startTime).toFixed(2) : '0.00';
            const end = Number.isFinite(Number(shot.endTime)) ? Number(shot.endTime).toFixed(2) : duration.toFixed(2);
            return `SHOT ${shot.shotNumber}: ${start}-${end} seconds — ACTION: ${shot.action || 'perform the specified scene action'} — CAMERA: ${shot.camera || 'motivated continuous camera movement'}.`;
        }).join('\n') +
        '\nThe visible action, product interaction, character movement, and camera change must match each exact time block.';
}

function buildProductIntegrationLock(identity, scene, hasProductRef) {
    if (isPlacePromotion(state) && !(identity && identity.product)) return "";
    if (isCreativeMiniatureBuild(state)) {
        return `MINIATURE SCALE INTEGRATION LOCK — every assembled object is a TINY crafted version. Life-size human hands are GIANT relative to the set. A house, hut, boat, bridge, or product must sit in the palm or between fingers. Never enlarge the object to real-world hand scale. Keep contact, occlusion, and shadows of giant fingers on miniature wood, stone, sand, and water. Photoreal materials. No pasted overlay.`;
    }
    const product = identity && identity.product;
    if (!product && !hasProductRef) return '';
    const location = (scene && (scene.locationId || scene.timeOfDay)) || 'the locked scene location';
    return `PRODUCT-IN-SCENE INTEGRATION LOCK — The product is a real physical object inside ${location}, not a pasted overlay, floating cutout, collage element, or separate reference image. Place it on or within the actual scene surface/environment with correct perspective, depth, contact shadow, occlusion, reflections, material response, and the same lighting direction/color/temperature as the location. Preserve one global real-world scale ratio in every shot: never enlarge the product merely because the camera is closer, never shrink it in a wide shot, and always compare it against the hand, table, torso, and room. Preserve true scale and camera parallax. If a character holds or uses it, show believable hand contact, grip, occlusion, and body interaction. If it rests on a table or prop, show contact and cast shadow. Keep the exact product design, label, logo, cap, color, material, and proportions from the reference. The product must be narratively and physically present in the listed shot action, with no sudden teleportation or pasted-on appearance.`;
}

function normalizeStoryboardShotTimeline(breakdown, config) {
    const durationSeconds = Math.max(1, parseInt(String(config && config.durationPerScene || '10').match(/\d+/)?.[0] || '10', 10));
    const scenes = Array.isArray(breakdown && breakdown.scenes) ? breakdown.scenes : [];
    scenes.forEach(scene => {
        const requested = Math.max(1, Number(config && config.shotsPerScene) || (Array.isArray(scene.shots) ? scene.shots.length : 1));
        const source = Array.isArray(scene.shots) ? scene.shots : [];
        const shots = [];
        for (let index = 0; index < requested; index++) {
            const previous = source[index] || {};
            const startTime = Math.round((index * durationSeconds / requested) * 100) / 100;
            const endTime = Math.round(((index + 1) * durationSeconds / requested) * 100) / 100;
            const action = String(previous.action || '').trim();
            const concreteAction = !action || /one arresting physical event|continue the current scene action|same action|as above/i.test(action)
                ? `Concrete visible action for ${startTime.toFixed(2)}-${endTime.toFixed(2)}s: continue the current scene beat with a specific character, product, prop, or camera interaction.`
                : action;
            shots.push(Object.assign({}, previous, {
                shotNumber: index + 1,
                startTime,
                endTime,
                timecode: `${startTime.toFixed(2)}-${endTime.toFixed(2)}s`,
                action: concreteAction,
                camera: previous.camera || 'Maintain continuity camera direction and composition.'
            }));
        }

        scene.shots = shots;
        scene.styleLock = breakdown.masterVisualIdentity && breakdown.masterVisualIdentity.styleLock
            ? breakdown.masterVisualIdentity.styleLock
            : buildStoryboardStyleLock(config);
    });
}

function compileProductionBlueprint(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes)) {
        throw new Error('Production blueprint tidak memiliki daftar scene yang valid.');
    }
    const duration = Math.max(1, parseInt(String(config && config.durationPerScene || '10').match(/\d+/)?.[0] || '10', 10));
    const shotCount = Math.max(1, Number(config && config.shotsPerScene) || 1);
    const scenePlans = breakdown.scenes.map((scene, index) => {
        if (!scene || typeof scene !== 'object') throw new Error('Production blueprint scene ' + (index + 1) + ' tidak valid.');
        if (!scene.title || !scene.storyPurpose || !scene.sceneBeat) throw new Error('Production blueprint scene ' + (index + 1) + ' belum memiliki title, storyPurpose, dan sceneBeat.');
        if (!scene.sceneVisualPlan || !scene.sceneVisualPlan.sceneFunction || !scene.sceneVisualPlan.visualAction) throw new Error('Production blueprint scene ' + (index + 1) + ' belum memiliki fungsi dan aksi visual.');
        if (!scene.dialoguePlan || !Array.isArray(scene.dialoguePlan.participants)) throw new Error('Production blueprint scene ' + (index + 1) + ' belum memiliki dialoguePlan peserta aktif.');
        if (!Array.isArray(scene.shots) || scene.shots.length !== shotCount) throw new Error('Production blueprint scene ' + (index + 1) + ' harus memiliki tepat ' + shotCount + ' shot.');
        scene.continuityFromPrevious = scene.continuityFromPrevious || (index === 0 ? 'Opening state established by the story brief.' : 'Continue from the previous scene end state without resetting character, location, prop, or emotion.');
        scene.continuityToNext = scene.continuityToNext || (index === breakdown.scenes.length - 1 ? 'Final scene resolves the selected story beat.' : 'End on a readable state that motivates the next scene.');
        scene.shots.forEach((shot, shotIndex) => {
            if (!shot || !shot.action || !shot.camera || !Number.isFinite(Number(shot.startTime)) || !Number.isFinite(Number(shot.endTime))) throw new Error('Production blueprint scene ' + (index + 1) + ' shot ' + (shotIndex + 1) + ' belum memiliki timecode, aksi, dan kamera lengkap.');
            if (Number(shot.startTime) < 0 || Number(shot.endTime) <= Number(shot.startTime) || Number(shot.endTime) > duration + 0.01) throw new Error('Timecode scene ' + (index + 1) + ' shot ' + (shotIndex + 1) + ' berada di luar durasi ' + duration + 's.');
        });
        return { sceneNumber: index + 1, title: scene.title, function: scene.sceneVisualPlan.sceneFunction, beat: scene.sceneBeat, participants: scene.dialoguePlan.participants, shotCount: scene.shots.length, duration: duration, continuityFromPrevious: scene.continuityFromPrevious, continuityToNext: scene.continuityToNext };
    });
    breakdown.productionPlan = { mode: config && config.storyboardMode || 'custom', durationPerScene: config && config.durationPerScene || duration + 's', shotsPerScene: shotCount, scenes: scenePlans };
    return breakdown.productionPlan;
}

function sceneHasExplicitAgeProgression(scene, story) {
    const text = [
        story || '',
        scene && scene.title,
        scene && scene.timeOfDay,
        scene && scene.masterImagePrompt,
        scene && scene.masterVideoPrompt,
        scene && scene.dialogueOrNarration
    ].filter(Boolean).join(' ').toLowerCase();
    return /(masa depan|dewasa|tumbuh besar|besar dan sukses|tahun kemudian|bertahun-tahun kemudian|kelak|future|grown up|grown-up|adult|years later|time[- ]?skip|older version)/i.test(text);
}

function buildTimelineAgeLock(scene, config) {
    if (sceneHasExplicitAgeProgression(scene, config && config.story)) {
        return 'TIMELINE AGE LOCK — EXPLICIT FUTURE/TIME-SKIP ALLOWED: characters may appear older/adult only because this scene states a future or years-later beat. Keep each adult version recognizably derived from the same child identity: same facial structure, skin/hair logic, posture, role, and emotional continuity. Do not randomize ethnicity, face, or role.';
    }
    return 'TIMELINE AGE LOCK — NO UNSCRIPTED AGE CHANGE: this scene is not an explicit future/time-skip beat. Keep each named character at the exact current age stage. Children remain children; adults remain adults. No sudden teen/adult transformation.';
}

function stripLeadingStoryboardGridLocks(prompt) {
    let out = String(prompt || '').trim();
    while (/^STORYBOARD GRID LOCK/i.test(out)) {
        const cut = out.indexOf('\n\n');
        if (cut < 0) return '';
        out = out.slice(cut + 2).trim();
    }
    return out;
}

function buildProductLock(identity, hasProductRef, config) {
    if (isPlacePromotion(config || state) && !(identity && identity.product)) return "";
    if (isCreativeMiniatureBuild(config || state)) {
        const raw = identity && (identity.product || identity.objectProduct);
        const p = (raw && typeof raw === 'object') ? raw : null;
        const look = (p && [p.name, p.look].filter(Boolean).join(' — ')) || (typeof raw === 'string' ? raw : 'the user-requested object');
        return `MINIATURE OBJECT + GIANT HAND SCALE LOCK — HARD.
OBJECT: ${look}.
This object is a CRAFTED MINIATURE, not life-size. Adult human hands are giant next to it. Keep the object smaller than a palm in every panel, including close-ups.
Do not restore true-to-life building/product-to-body scale. Do not enlarge the object beside a face or hand to "look realistic".
If a product reference photo is attached, keep its design details but shrink it to miniature scale versus the hands.
FRAMING ≠ SIZE: a close-up may fill the frame with the tiny object, but fingers beside it must still look giant.`;
    }
    const raw = identity && (identity.product || identity.objectProduct);
    const p = (raw && typeof raw === 'object') ? raw : null;
    const look = (p && [p.name, p.look].filter(Boolean).join(' — ')) || (typeof raw === 'string' ? raw : '');
    if (!look && !hasProductRef) return '';
    const shape = (p && p.shapeLock) || 'Freeze silhouette, proportions, thickness, edges, openings/caps/straps/handles, and product category.';
    const colorMaterial = (p && p.colorMaterialLock) || 'Freeze exact colors, accent colors, material, texture, finish, reflectivity, and surface feel.';
    const labelLogo = (p && p.labelLogoLock) || 'Freeze label/logo placement, orientation, size, typography block, and visible markings. Do not invent or move branding.';
    const details = (p && p.detailLock) || 'Freeze every distinctive detail visible in the reference/description. No random extra accessories, labels, patterns, buttons, caps, straps, soles, or packaging changes.';
    const size = (p && p.realWorldSize) || 'AUTO SCALE: infer a plausible real-world size from the product category and reference proportions; mark it as inferred, not as a verified manufacturer specification.';
    const scale = (p && p.scaleVsBody) || 'AUTO SCALE LOCK: preserve the inferred physical proportion versus adult hand, face, torso, foot, table, and environment. A handheld product must not become head-sized in a portrait.';
    const reference = (p && p.referenceLock) || (hasProductRef ? 'Attached product photo is the master design plate and scale plate.' : '');
    return `PRODUCT IDENTITY + SCALE LOCK — hero product design AND real-world size are FROZEN across every scene and panel.
PRODUCT: ${look || 'Use the attached product photo.'}
SHAPE / SILHOUETTE: ${shape}
COLOR / MATERIAL / FINISH: ${colorMaterial}
LABEL / LOGO / MARKINGS: ${labelLogo}
DISTINCTIVE DETAILS: ${details}
REAL-WORLD SIZE: ${size}
SCALE VS BODY: ${scale}
FRAMING ≠ SIZE: Extreme close-up or macro shot may fill the frame, but it changes framing only, never physical dimensions. If a hand, face, or body is visible, the product-to-body ratio MUST stay identical. Do not enlarge the product next to a face. Do not shrink it in a wide shot.
PRODUCT DRIFT FORBIDDEN: Do not change product model, category, colorway, label shape, logo position, cap/strap/sole/package shape, material, thickness, or size from one panel/scene to another.
${reference}
${hasProductRef ? 'Attached product photo overrides generic imagination. Match its proportions and detail hierarchy exactly before stylizing.' : ''}`.trim();
}

function buildSponsoredStoryPropLock(config, identity) {
    const mode = String(config && config.storyboardMode || '').toLowerCase();
    const story = String(config && config.story || '');
    const hasReference = !!(config && config.productReference && config.productReference.length);
    const hasProduct = !!(identity && (identity.product || identity.objectProduct)) || hasReference;
    const commercial = detectCommercialIntent(story) || mode === 'commercial';
    if (!hasProduct || commercial || !['drama', 'shortfilm', 'shortFilm', 'animation', 'documentary', 'custom'].includes(mode)) return '';
    const damageAllowed = /\b(?:banting|dibanting|pecahkan|dipecahkan|rusak|hancur|jatuh|smash|slam|break|broken|damage|damaged)\b/i.test(story);
    return `SPONSORED STORY PROP LOCK — The attached product is a narrative prop/sponsor element, NOT an advertisement.
Keep the product reference identity, silhouette, color, material, markings, and realistic scale consistent whenever it is visible. Integrate it naturally into the characters' actions and the current dramatic beat. Do not add product praise, sales language, pricing, CTA, brand promotion, product beauty shots, or commercial narration unless the user explicitly requests them. The story conflict and character decisions remain the priority.
${damageAllowed ? 'CONTROLLED STORY DAMAGE EXCEPTION: The brief explicitly requires the prop to be struck, slammed, dropped, or damaged. Show that exact action only at the requested beat; preserve the pre-impact identity and make any post-impact damage physically plausible and continuous. Do not silently replace it with an undamaged duplicate.' : 'Do not damage, destroy, duplicate, enlarge, or transform the prop unless the current scene explicitly requires that action.'}`;
}

    function buildProductOnlyVisualLock(config) {
if (isPlacePromotion(config)) return "";
if (!isProductOnlyCommercialBrief(config && config.story, config)) return '';
return 'PRODUCT-ONLY VISUAL LOCK — no human subject is requested. Show only the hero product and its environment/interactions with hands only when essential and anonymous. Do not invent a model, actor, customer, face, body, person, character, dialogue partner, or human-centered lifestyle scene. Product remains the sole visual hero from first frame to final frame.';
    }

function buildContinuityBibleLock(identity) {
    if (!identity) return '';
    const bible = ensureContinuityBible(identity);
    const cast = Array.isArray(bible.castBible) ? bible.castBible : [];
    const wardrobe = Array.isArray(bible.wardrobeBible) ? bible.wardrobeBible : [];
    const locations = Array.isArray(bible.locationBible) ? bible.locationBible : [];
    const products = Array.isArray(bible.productBible) ? bible.productBible : [];
    const parts = [];
    if (cast.length) parts.push('CAST BIBLE:\n' + cast.join('\n'));
    if (wardrobe.length) parts.push('WARDROBE BIBLE:\n' + wardrobe.join('\n'));
    if (locations.length) parts.push('LOCATION BIBLE:\n' + locations.join('\n'));
    if (products.length) parts.push('PRODUCT BIBLE:\n' + products.join('\n'));
    if (!parts.length) return '';
    return 'CONTINUITY BIBLE LOCK - HARD CONTRACT. The details below override any later vague wording such as same/changed/new/random. Every scene, regenerate, and edit must obey it. New supporting cast must become a CHARACTER_N entry before appearing. Wardrobe may change only when the scene has a justified wardrobeBeat. Hero product design, real-world size, and product-to-body scale may change only if the user explicitly changes the product.\n' + parts.join('\n\n');
}

function buildSettingLock(identity, scene) {
    const locs = Array.isArray(identity && identity.locations) ? identity.locations : [];
    const loc = locs.find(l => l.locationId === scene.locationId) || locs[0];
    const locText = loc
        ? `${loc.locationId || ''} ${loc.name || ''}: ${loc.lock || loc.backgroundAnchor || ''}`
        : (identity && identity.location) || '';
    const locAnchor = loc && loc.backgroundAnchor ? '\nBACKGROUND ANCHOR: ' + loc.backgroundAnchor : '';
    const chars = Array.isArray(identity && identity.characters) ? identity.characters : [];
    const beat = scene.wardrobeBeat || '';
    const wardrobeLines = chars.map(c => {
        const hit = (c.wardrobeByBeat || []).find(b => b.beat === beat);
        const reason = hit && hit.changeReason ? ' [' + hit.changeReason + ']' : '';
        return `${c.characterId || 'CHARACTER_1'}: ${(hit && hit.wardrobe) || c.wardrobeDefault || c.wardrobe || ''}${reason}`;
    }).filter(s => !s.endsWith(': '));
    if (!wardrobeLines.length && identity && identity.wardrobe) wardrobeLines.push(identity.wardrobe);
    return `SCENE SETTING LOCK — this scene only.
LOCATION (${scene.locationId || 'current'}): ${locText}${locAnchor}
TIME OF DAY: ${scene.timeOfDay || (identity && identity.lighting) || ''}
WARDROBE BEAT (${beat || 'default'}): ${wardrobeLines.join(' | ')}
Stay in this location until a motivated transition. Do not teleport. Wardrobe changes only on a justified beat (new day, new place/context, sleep, work, weather, or explicit user request). If not justified, reuse the previous locked outfit exactly word-for-word.`;
}

function enforceCleanVideoOpening(prompt) {
    let body = String(prompt || '').trim();
    if (!body) return body;
    body = body.replace(/\[VIDEO FRAME ZERO CONTRACT\][\s\S]*?\[END VIDEO FRAME ZERO CONTRACT\]\s*/g, '').trim();
    body = body.replace(/Create one continuous full-screen video from the attached storyboard image\./gi, 'Create a full-screen moving scene using the references only to preserve identity and scene details.');
    const lock = [
        '[VIDEO FRAME ZERO CONTRACT]',
        'MANDATORY OUTPUT: Start directly inside Shot 1 at timestamp 00:00.000. The very first decoded frame and every subsequent frame must show only the actual scene at full-screen size, in the selected visual style, with scene motion beginning immediately.',
        'REFERENCE USE ONLY: Any attached storyboard/contact sheet is off-screen planning material for character identity, wardrobe, location and shot order. It is NOT a start frame, opening image, background, overlay or footage to animate. Reconstruct Shot 1 as a complete scene filling the video frame; preserve the original locked faces, bodies, outfits, products and locations.',
        'ABSOLUTE BAN FOR THE ENTIRE VIDEO: zero frames of storyboard grids, photo grids, contact sheets, panels, borders between panels, panel numbers, collages, split screens, thumbnails or reference-sheet previews. No one-frame flash, freeze-frame of the sheet, slideshow, fade from the sheet, pan across panels, or zoom/crop transition from a grid into the scene.',
        // V5.0 (Isu #2 follow-up — video): explicit no-CTA/no-text
        // override injected at frame zero so the AI is reminded
        // before every frame that the visual must remain clean.
        // Without this the model frequently adds "BELI SEKARANG"
        // or "BUY NOW" overlays in the final shot even when
        // other prompts say no text — frame zero is the strongest
        // anchor Gemini honours.
        'CLEAN SCREEN ABSOLUTE: every frame of every shot must be visually clean. ZERO visible text inside the rendered video — no captions, no subtitles, no logos, no watermarks, no "BELI SEKARANG" / "BUY NOW" / "ORDER NOW" / "SHOP NOW" / "PESAN SEKARANG" / "LINK BIO" / "HUBUNGI" / "KONTAK" / "WHATSAPP" / no phone numbers / no emails / no @handles / no URLs / no QR codes / no SALE/Rp badges / no buttons / no shopping cart icons / no CTA graphics. The CTA lives in the spoken dialogue, NEVER in the visual frame.',
        'SHOT EXECUTION: Show shots sequentially over time, never simultaneously as tiles. Frame 0 already contains the scene itself; do not spend opening time revealing or transitioning out of the reference image. Keep the requested duration, action, visual style, continuity and dialogue unchanged.',
        '[END VIDEO FRAME ZERO CONTRACT]'
    ].join('\n');
    return lock + '\n\n' + body;
}

function buildPromptCompilerBlocks(breakdown, scene, config, sceneIdx, type) {
    const identity = breakdown && breakdown.masterVisualIdentity || {};
    const silent = isSilentAudioMode(config);
    const sceneNumber = Number(scene && scene.sceneNumber) || sceneIdx + 1;
    const hashtags = Array.isArray(breakdown && breakdown.hashtags)
        ? breakdown.hashtags.map(tag => String(tag || '').trim()).filter(Boolean).join(' ')
        : String(breakdown && breakdown.hashtags || '').trim();
    const continuity = buildContinuityBibleLock(identity);
    const context = [
        'SCENE CONTEXT BLOCK',
        'Scene ' + sceneNumber + ': ' + [scene && scene.title, scene && scene.storyPurpose, scene && scene.sceneBeat].filter(Boolean).join(' — '),
        'Scene function: ' + String(scene && scene.sceneVisualPlan && scene.sceneVisualPlan.sceneFunction || ''),
        'Visual action: ' + String(scene && scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction || ''),
        'Continuity from previous: ' + String(scene && scene.continuityFromPrevious || ''),
        'Continuity to next: ' + String(scene && scene.continuityToNext || '')
    ].join('\n');
    const action = [buildExplicitShotTimeline(scene, config), buildSettingLock(identity, scene)].filter(Boolean).join('\n\n');
    const audio = silent
        ? buildSilentAmbienceBlock(scene, config, identity)
        : ['AUDIO / DIALOGUE BLOCK', getVoiceModeContract(config), buildDialogueDurationLock(config, scene), buildAudioPerformanceLock(scene, config), scene && scene.dialogueOrNarration ? '[AUDIO / DIALOGUE]\\n' + normalizeDialogueTurnFormat(scene.dialogueOrNarration, scene) : ''].filter(Boolean).join('\n');
    const negatives = [
        'NEGATIVE RULES BLOCK',
        'No identity drift, cast changes, product drift, wardrobe drift, teleportation, invented facts, generic filler, or unrelated scene beats.',
        'No storyboard grid, contact sheet, split-screen, collage, panel layout, fake UI, random text, watermark, or prompt fragments.',
        buildCtaVisualCleanLock(scene, config),
        isDioramaAnimationStyle(config) ? buildAnimationMediumContract(config, resolveAnimationStyleName(config)) : '',
        silent ? 'No speech, dialogue, voice-over, narrator, lip-sync, vocalization, or spoken words.' : ''
    ].filter(Boolean).join('\n');
    const output = [
        'OUTPUT FORMAT BLOCK',
        type === 'image'
            ? `Create one clean storyboard contact sheet with exactly ${config.shotsPerScene} equal panels in ${config.aspectRatio}; preserve readable action per panel.`
            : `Create one continuous full-screen ${config.aspectRatio} video. Execute every timecoded shot in order with motivated camera movement; never show the storyboard layout.`,
        'Visual style: ' + (identity.styleLock && identity.styleLock.resolved || 'Realistic Photography'),
        hashtags ? 'Story tags metadata: ' + hashtags : ''
    ].filter(Boolean).join('\n');
    return { continuity, context, action, audio, negatives, output };
}

function applyStoryboardLocks(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes)) return;
    restrictSimpleCommercialCast(breakdown, config);
    enforceSilentAudioMode(breakdown, config);
    ensureCommercialHookPlan(breakdown, config);
    ensureSceneVisualPlans(breakdown, config);
    ensureDialoguePlans(breakdown, config);
    breakdown.scenes.forEach(scene => {
        if (scene && scene.dialogueOrNarration) {
            scene.dialogueOrNarration = normalizeDialogueSpeakerTurns(scene.dialogueOrNarration, scene, config, breakdown.masterVisualIdentity);
            scene.dialogueOrNarration = normalizeDialogueTurnFormat(scene.dialogueOrNarration, scene);
            scene.dialogueOrNarration = enforceHardWordLimit(scene.dialogueOrNarration, scene, config);
            scene.dialogueOrNarration = deduplicateDialogueLines(scene.dialogueOrNarration);
        }
    });
    enforceSilentAudioMode(breakdown, config);
    normalizeContinuityBible(breakdown, config);
    enforceStoryboardGenreRules(breakdown, config);
    enforceLongStoryboardRules(breakdown, config);
    enforceVoiceContinuity(breakdown);
    enforceCastAlignmentAcrossScenes(breakdown, config);
    ensureStoryboardAudioDialogue(breakdown, config);
    ensureAudioDirection(breakdown, config);
    const visualStyleSetting = config.visualStyle === 'Custom Style' ? config.customStyle : config.visualStyle;
    const resolvedVisualStyle = config.storyboardMode === 'animation'
        ? resolveAnimationStyleName(config)
        : (visualStyleSetting === 'Auto' ? 'Realistic Photography' : visualStyleSetting);
    const characterLock = "don't change the face and characteristic from attached photo.";
    const visualStyleLock = `VISUAL STYLE LOCK: Use exactly ${resolvedVisualStyle} in this scene and every other scene. Keep the same medium, rendering method, character design language, material response, color treatment, lighting language, camera optics, texture, and motion language. Never switch visual medium or style unless explicitly requested. ${config.storyboardMode === 'animation' ? buildAnimationMediumContract(config, resolvedVisualStyle) : ''}`;
    const silentAudio = isSilentAudioMode(config);
    const audioContinuityNote = silentAudio
        ? 'AUDIO CONTINUITY: Keep the same non-verbal palette across every scene and episode: room tone family, foley materials, mic distance, loudness, and seamless texture transitions. No spoken language. Foley must stay synced to visible contact.'
        : `AUDIO CONTINUITY: Keep the ${config.language} spoken language, pronunciation, emotional tone, room tone, ambience, music bed, sound-effects palette, loudness balance, and seamless audio transition coherent across every scene and episode.`;
    const noTextArtifactLock = buildNoTextArtifactLock(config);
    const overlayLock = buildAutoCaptionOverlayLock(config);
    const voiceLock = silentAudio ? '' : buildVoiceLock(breakdown.masterVisualIdentity, config.language);
    const localDemographicLock = buildLocalDemographicLock(config);
    const continuityBibleLock = buildContinuityBibleLock(breakdown.masterVisualIdentity);
    const cameraLockImage = isDioramaAnimationStyle(config)
        ? 'CAMERA VARIETY LOCK: Keep the camera inside the immersive miniature world at character/world scale. Show varied miniature-level angles and distances. Never show a tabletop, table edge, display base, studio around a model, photoreal human, or giant person.'
        : isCreativeMiniatureBuild(config)
        ? 'CAMERA VARIETY LOCK: Macro / tabletop miniature coverage. Vary ECU of fingers on tiny parts, overhead of the mini site, and slightly wider completed-diorama views. No life-size architecture. No full-body portrait of a person.'
        : 'CAMERA VARIETY LOCK: Vary the visual distance and angle INSIDE each equal grid cell, from intimate detail to close portrait, medium view, wider view, and over-the-shoulder perspective. Do not resize a cell to show a close-up. All cells stay the same size. Do not render any camera abbreviations or labels as visible text.';
    const cameraLockVideo = 'CAMERA VARIETY LOCK: Vary shot size and angle over TIME in one continuous shot (ECU, CU, MCU, MS, OTS, insert, low/high). Never show two shots on screen at once. Never split-screen.';
    const dialogueLanguageLock = 'DIALOGUE LANGUAGE LOCK: All spoken dialogue and voice-over lines in [AUDIO / DIALOGUE] MUST be performed in ' + config.language + '. Visual direction may remain in English, but do not translate or replace spoken lines with English.';
    const voiceModeLock = getVoiceModeContract(config);
    const cleanVideoLock = 'CLEAN VIDEO OPENING — NON-NEGOTIABLE (ABSOLUTE): Second 0 is a single live cinematic frame of Shot 1, full-screen, no exceptions, no compromises. FORBIDDEN for the ENTIRE clip — especially the first 1–2 seconds AND every subsequent moment: storyboard grid, multi-panel layout, comic frames, black gutters, panel numbers, split-screen, contact sheet, animatic, collage, side-by-side composition. The video is one camera recording one scene with continuous real motion — NEVER animate, arrange, or sequence the storyboard panels. The audience must NEVER see a single frame that resembles a storyboard layout.';
    const castLock = buildCastLock(breakdown.masterVisualIdentity, config);
    const productLock = buildProductLock(breakdown.masterVisualIdentity, !!(config.productReference && config.productReference.length), config);
    const miniatureLock = buildCreativeMiniatureBuildContract(config);
    const sponsoredStoryPropLock = buildSponsoredStoryPropLock(config, breakdown.masterVisualIdentity);
    const productOnlyLock = buildProductOnlyVisualLock(config);
    const photoLock = (config.characterReference && config.characterReference.length) ? characterLock : '';
    const ratioLock = `ASPECT RATIO LOCK: This video MUST be exactly ${config.aspectRatio}. Compose, frame, and crop for ${config.aspectRatio} only. Do not switch to another ratio.`;
    const gridLock = storyboardGridLock(config.shotsPerScene, config.aspectRatio, (config.visualStyle === 'Auto Caption Overlay' && config.visualStyleExplicitOverlay === true) ? 'Overlay text only if Auto Caption Overlay is on AND the user explicitly opted in.' : 'No extra captions or titles besides tiny corner numbers.');
    const headings = ['STRICT VISUAL CONSISTENCY GATE', 'CHARACTER FORENSIC RENDER LOCK', 'NO TEXT ARTIFACT LOCK', 'TEXT ARTIFACT CONTROL LOCK', 'FINAL SCENE ANTI-REPEAT LOCK', 'LONG STORYBOARD DISCIPLINE LOCK', 'EXTREME COMMERCIAL HOOK LOCK', 'EXTREME AD HOOK LOCK', 'ADVERTISEMENT SALES STRUCTURE LOCK', 'HYBRID STORY-FIRST SALES LOCK', 'SCENE ISOLATION LOCK', 'CONTINUITY BIBLE LOCK', 'CAST IDENTITY LOCK', 'VOICE CAST LOCK', 'DIALOGUE DURATION LOCK', 'DIALOGUE STAGING / EYELINE LOCK', 'TIMELINE AGE LOCK', 'PRODUCT IDENTITY + SCALE LOCK', 'PRODUCT SCALE LOCK', 'SCENE SETTING LOCK', 'CAMERA VARIETY LOCK', 'VISUAL STYLE LOCK', 'AUDIO CONTINUITY LOCK', 'ASPECT RATIO LOCK', 'STORYBOARD GRID LOCK', 'CLEAN VIDEO OPENING'];
    const photoRe = new RegExp(characterLock.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const stripRe = new RegExp('\\n*(?:' + headings.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*(?:—|:)?').join('|') + ')[\\s\\S]*$', 'g');

    breakdown.scenes.forEach((scene, sceneIdx) => {
        const dialogueDurationLock = buildDialogueDurationLock(config, scene);
        const strictVisualGate = buildStrictVisualConsistencyGate(breakdown, sceneIdx, config);
        const longDisciplineLock = buildLongStoryboardDisciplineLock(breakdown, sceneIdx, config);
        const sceneIsolationLock = buildSceneIsolationLock(breakdown, sceneIdx);
        const genreSalesLock = buildGenreSalesLock(breakdown, sceneIdx, config);
        const finalAntiRepeatLock = buildFinalSceneAntiRepeatLock(breakdown, sceneIdx, config);
        const audioPerformanceLock = buildAudioPerformanceLock(scene, config);
        const dialogueCastLock = buildDialogueCastLock(breakdown.masterVisualIdentity, scene);
        const advertisementAudioContract = buildAdvertisementAudioContract(config, scene);
        const extremeHookLock = buildExtremeAdHookLock(breakdown, sceneIdx, config);
        const sceneVisualPlanLock = buildSceneVisualPlanLock(breakdown, sceneIdx);
        const dialoguePlanLock = buildDialoguePlanLock(scene);
        const dialogueStagingLock = buildDialogueStagingLock(scene, config);
        const sceneIntentLock = buildSceneIntentContract(scene, config, sceneIdx, breakdown);
        const settingLock = buildSettingLock(breakdown.masterVisualIdentity, scene);
        const timelineAgeLock = buildTimelineAgeLock(scene, config);
        const productIntegrationLock = buildProductIntegrationLock(
            breakdown.masterVisualIdentity,
            scene,
            !!(config.productReference && config.productReference.length)
        );
        const promptBlocksImage = buildPromptCompilerBlocks(breakdown, scene, config, sceneIdx, 'image');
        const promptBlocksVideo = buildPromptCompilerBlocks(breakdown, scene, config, sceneIdx, 'video');
        scene.promptCompiler = {
            version: 'V4.0-phase-5',
            sceneNumber: sceneIdx + 1,
            assetRefs: {
                character: (config.characterReference || []).map((_, index) => 'CHARACTER_' + (index + 1)),
                product: (config.productReference || []).length ? ['PRODUCT_1'] : [],
                location: (config.locationReference || []).length ? ['LOCATION_1'] : []
            },
            blocks: ['continuity', 'sceneContext', 'action', 'composition', 'dialogueAudio', 'negativeRules', 'outputFormat'],
            silentAudio: isSilentAudioMode(config),
            hashtags: breakdown.hashtags || []
        };
        const ctaVisualCleanLock = buildCtaVisualCleanLock(scene, config);
        const dioramaCastLock = isDioramaAnimationStyle(config)
            ? 'DIORAMA CAST LOCK: All characters are small, stylized miniature-world characters. Never show a real person, photoreal human, life-size body, giant hands, or a person standing over the miniature world.'
            : '';
        const extrasImage = [miniatureLock, strictVisualGate, localDemographicLock, noTextArtifactLock, overlayLock, productOnlyLock, sponsoredStoryPropLock, finalAntiRepeatLock, longDisciplineLock, extremeHookLock, sceneVisualPlanLock, sceneIntentLock, silentAudio ? '' : dialogueStagingLock, genreSalesLock, sceneIsolationLock, continuityBibleLock, castLock, voiceLock, timelineAgeLock, productLock, settingLock, cameraLockImage, visualStyleLock, audioContinuityNote, photoLock, dioramaCastLock, ctaVisualCleanLock].filter(Boolean).join('\n\n');
        const compactCastLock = isCreativeMiniatureBuild(config)
            ? 'HANDS ONLY: photoreal adult human hands assembling the miniature. No full-body character, no face unless the user asked for one. The assembled object stays tiny versus the hands.'
            : (breakdown.masterVisualIdentity && Array.isArray(breakdown.masterVisualIdentity.characters)
        ? breakdown.masterVisualIdentity.characters.map(character => `${character.characterId || 'registered character'} — ${character.speakerName || character.name || 'unnamed'}; ${character.gender || inferCharacterGender(character) || 'gender not specified'}; ${character.role || 'registered character'}; identity remains consistent.`).join('\n')
            : 'Use only the registered cast and preserve each identity exactly.');
        const storyboardBlueprintLock = `STORYBOARD BLUEPRINT LOCK — Use the attached storyboard image as the mandatory visual blueprint and source of truth for this video. Preserve the exact same character identity, apparent age, facial features, body proportions, wardrobe, product design, environment, lighting language, composition logic, and visual style shown in the reference image. Animate the reference image without redesigning, aging up, replacing, restyling, or changing any character, product, setting, or visual medium. The final video must look like the same storyboard world brought to life.`;
        scene.masterImagePrompt = [gridLock, promptBlocksImage.continuity, promptBlocksImage.context, promptBlocksImage.action, ((scene.masterImagePrompt || '').replace(photoRe, '').replace(stripRe, '')).trim(), extrasImage, promptBlocksImage.negatives, promptBlocksImage.output].filter(Boolean).join('\n\n');
        let audioBlock;
        if (silentAudio || isCreativeMiniatureBuild(config)) {
            scene.dialogueOrNarration = '';
            audioBlock = buildSilentAmbienceBlock(scene, config, breakdown.masterVisualIdentity);
        } else {
            const pulled = pullDialogueSection(scene.masterVideoPrompt, scene.dialogueOrNarration);
            const promptDialogue = pulled.block
                ? pulled.block.replace(/^\s*\[AUDIO\s*\/\s*DIALOGUE\]\s*/i, '')
                : extractDialogueLines(scene.masterVideoPrompt);
            const normalizedDialogue = normalizeDialogueSpeakerTurns(
                scene.dialogueOrNarration || promptDialogue || buildFallbackSceneAudio(scene, config, false),
                scene,
                config,
                breakdown.masterVisualIdentity
            );
            const formattedDialogue = normalizeDialogueTurnFormat(normalizedDialogue, scene);
            const expressiveDialogue = normalizeDialogueExpressions(formattedDialogue, scene);
            if (expressiveDialogue) scene.dialogueOrNarration = expressiveDialogue;
            const voiceCastLock = buildVoiceLockBlock(breakdown.masterVisualIdentity);
            const languageDeliveryLock = buildLanguageDeliveryLock(config);
            const audioBlockHead = (languageDeliveryLock || voiceCastLock)
                ? (languageDeliveryLock ? languageDeliveryLock + '\n\n' : '') + (voiceCastLock ? voiceCastLock + '\n\n' : '')
                : '';
            const spokenDialogue = expressiveDialogue
                || normalizedDialogue
                || scene.dialogueOrNarration
                || buildFallbackSceneAudio(scene, config, true);
            const naturalDialogue = deduplicateDialogueLines(toNaturalDialogueFormat(spokenDialogue, breakdown.masterVisualIdentity));
            audioBlock = naturalDialogue
                ? audioBlockHead + voiceModeLock + '\n[AUDIO / DIALOGUE]\n' + naturalDialogue
                : voiceModeLock + '\n' + promptBlocksVideo.audio;
        }
        const compactVideoPrompt = [
            'VIDEO PROMPT — Create one continuous full-screen video from the attached storyboard image. Start at frame 0 with live motion in the scene; the storyboard image is reference-only and must never appear on screen.',
            'SCENE: ' + [scene.title, scene.storyPurpose, scene.sceneBeat, scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction].filter(Boolean).join(' — '),
            buildExplicitShotTimeline(scene, config),
            'SETTING: ' + [scene.locationId, scene.timeOfDay, scene.wardrobeBeat].filter(Boolean).join(' — '),
            isDioramaAnimationStyle(config)
                ? 'CAST: Only miniature-world animated characters at their own small-world scale. No real-life person, photoreal human, life-size body, or giant hands.'
                : isCreativeMiniatureBuild(config)
                ? 'CAST: Photoreal giant human hands only. Do not add a full-body person, face, or speaking character unless the user asked for one.\n' + compactCastLock
                : 'CAST: Preserve the registered faces, age, hair, skin, body, wardrobe anchors, gender, and roles. Do not add, remove, merge, replace, or rename visible characters.\n' + compactCastLock,
            buildSceneVoiceCastBlock(scene, breakdown.masterVisualIdentity, config),
            'CAMERA AND STYLE: ' + [resolvedVisualStyle, config.aspectRatio, isDioramaAnimationStyle(config) ? 'immersive animated miniature world, camera at miniature-world scale, no table or real person' : isCreativeMiniatureBuild(config) ? 'macro tabletop camera, photoreal miniature set, giant hands, natural lighting' : 'motivated camera movement with natural lighting, depth, and physical motion'].filter(Boolean).join(' —'),
            storyboardBlueprintLock,
            miniatureLock,
            productLock,
            productIntegrationLock,
            sponsoredStoryPropLock,
            isDioramaAnimationStyle(config) ? buildAnimationMediumContract(config, resolvedVisualStyle) : '',
            ctaVisualCleanLock,
            'PRODUCT REFERENCE PRIORITY: The attached storyboard image is the primary visual reference for the hero product. Animate the exact product already visible in that image; do not redesign, substitute, reinterpret, regenerate, or change its proportions while adding motion.',
            silentAudio
                ? 'AUDIO MODE: spoken language is disabled. Execute the [AUDIO / AMBIENCE & SOUND EFFECTS] block: room tone plus foley synced to visible contact. No speech.'
                : 'AUDIO LANGUAGE: Spoken lines and voice-over must be performed in ' + config.language + '.',
            voiceModeLock,
            'NEGATIVE: no storyboard grid, contact sheet, split-screen, collage, panel layout, thumbnail sheet, storyboard preview, random text, watermark, identity drift, product drift, wardrobe drift, or unrelated action.',
            // V5.0 (Isu #2 follow-up — video): the promptBlocksVideo.negatives
            // block was computed but never appended to the actual
            // video prompt sent to Gemini. Without it the model had no
            // instruction to keep CTA text like "BELI SEKARANG" out
            // of the rendered frames. Append it here.
            promptBlocksVideo.negatives,
            // V5.0 (Isu #2 follow-up — video): an explicit absolute
            // rule that overrides anything the model might infer
            // from the user brief. Screen stays clean.
            'ABSOLUTE VIDEO FRAME LOCK (V5.0 Isu #2): the rendered video MUST keep every single frame of every shot visually clean — no exception, no override, no compromise. The ONLY visible glyphs allowed in any frame are the tiny panel numbers (1-N) inside the corner of the storyboard image used as reference; those panel numbers must NOT appear inside the rendered video output itself. BANNED in every frame of every shot: any subtitle, caption, lower-third, banner, headline, logo, brand mark, watermark, badge, sticker, QR code, barcode, shopping cart icon, CTA text, "BELI SEKARANG" / "BUY NOW" / "ORDER NOW" / "SHOP NOW" / "PESAN SEKARANG" / "LINK BIO" / "HUBUNGI" / "KONTAK" / "WHATSAPP" / any phone number / any email / any @handle / any URL / any price tag / any SALE/Rp/USD badge / any button / any fake UI / any camera label (MS/CU/OTS/ECU/WS) rendered as text. The CTA must live ONLY in the spoken dialogue line. The visual frame must look like a clean cinematic photograph of the scene.',
            ratioLock,
            silentAudio ? '' : dialogueCastLock,
            audioBlock
        ].filter(Boolean).join('\n\n');
        // 5F: defense in depth — strip any pre-existing duplicate audioBlock that may have
        // leaked from earlier pipeline passes. Keep only the FIRST and LAST [AUDIO / DIALOGUE]
        // blocks, drop any extras in between.
        let finalPrompt = compactVideoPrompt;
        const audioBlocks = finalPrompt.match(/\[AUDIO\s*\/\s*DIALOGUE\][^\[]*/g);
        if (audioBlocks && audioBlocks.length > 1) {
            const lastBlock = audioBlocks[audioBlocks.length - 1];
            let firstSeen = false;
            finalPrompt = finalPrompt.replace(/\[AUDIO\s*\/\s*DIALOGUE\][^\[]*/g, (m) => {
                if (m === lastBlock) return m;
                if (!firstSeen) {
                    firstSeen = true;
                    return m;
                }
                return '';
            }).replace(/\n{3,}/g, '\n\n');
        }
        scene.masterVideoPrompt = enforceCleanVideoOpening(deduplicateDialogueLines(finalPrompt));
        if (isSilentAudioMode(config) || isCreativeMiniatureBuild(config)) {
            if (isSilentAudioMode(config)) enforceSilentAudioMode({ scenes: [scene] }, config);
            else {
                scene.dialogueOrNarration = '';
                if (typeof scene.masterVideoPrompt === 'string') {
                    scene.masterVideoPrompt = replaceOrAppendSilentAmbience(
                        scene.masterVideoPrompt,
                        scene,
                        config,
                        breakdown.masterVisualIdentity
                    );
                }
            }
        }
        if (sceneRequiresSingleSpeaker(scene, config)) {
            scene.masterVideoPrompt = scene.masterVideoPrompt
                .split('\n')
                .filter(line => !/^\s*(?:\[[^\]]+\]\s*)?CHARACTER_(?:[2-9]|[1-9]\d+)\s*:/i.test(line))
                .join('\n');
        }
    });
}

function applyStoryboardSceneLocks(breakdown, sceneIdx, config) {
    const isolated = Object.assign({}, breakdown, {
        scenes: (breakdown.scenes || []).map(scene => Object.assign({}, scene))
    });
    applyStoryboardLocks(isolated, config);
    if (isolated.scenes[sceneIdx]) breakdown.scenes[sceneIdx] = isolated.scenes[sceneIdx];
}

function buildSceneAudioBlockOnly(scene, config, identity) {
    const silentAudio = isSilentAudioMode(config) || isCreativeMiniatureBuild(config);
    if (silentAudio) {
        return buildSilentAmbienceBlock(scene, config, identity);
    }
    const voiceCastLock = buildVoiceLockBlock(identity);
    const languageDeliveryLock = buildLanguageDeliveryLock(config);
    const voiceModeLock = getVoiceModeContract(config);
    const dialogueCastLock = buildDialogueCastLock(identity || {}, scene);
    const audioBlockHead = (languageDeliveryLock || voiceCastLock)
        ? (languageDeliveryLock ? languageDeliveryLock + '\n\n' : '') + (voiceCastLock ? voiceCastLock + '\n\n' : '')
        : '';
    const dialogueSource = String(scene.dialogueOrNarration || '').trim();
    if (!dialogueSource) {
        return audioBlockHead + voiceModeLock + (dialogueCastLock ? '\n\n' + dialogueCastLock : '');
    }
    const normalizedDialogue = normalizeDialogueSpeakerTurns(dialogueSource, scene, config, identity);
    const formattedDialogue = normalizeDialogueTurnFormat(normalizedDialogue, scene);
    const expressiveDialogue = normalizeDialogueExpressions(formattedDialogue, scene);
    const spokenDialogue = expressiveDialogue || formattedDialogue || normalizedDialogue || dialogueSource;
    const naturalDialogue = deduplicateDialogueLines(toNaturalDialogueFormat(spokenDialogue, identity));
    if (!naturalDialogue) {
        return audioBlockHead + voiceModeLock + (dialogueCastLock ? '\n\n' + dialogueCastLock : '');
    }
    return audioBlockHead + voiceModeLock + (dialogueCastLock ? '\n\n' + dialogueCastLock + '\n\n' : '') + '[AUDIO / DIALOGUE]\n' + naturalDialogue;
}

function replaceAudioBlockInPrompt(prompt, newAudioBlock) {
    if (!prompt) return prompt;
    const trimmed = String(prompt);
    const re = /\[AUDIO\s*\/\s*DIALOGUE\][\s\S]*?(?=\n\n\[|\n*$)/;
    if (re.test(trimmed)) {
        return trimmed.replace(re, newAudioBlock).replace(/\n{3,}/g, '\n\n');
    }
    return trimmed.replace(/\s*$/, '') + '\n\n' + newAudioBlock;
}

function recompileSceneVideoPromptOnly(breakdown, sceneIdx, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes)) return null;
    const scene = breakdown.scenes[sceneIdx];
    if (!scene) return null;
    const identity = breakdown.masterVisualIdentity || {};
    const previousPrompt = scene.masterVideoPrompt || '';
    const silentAudio = isSilentAudioMode(config) || isCreativeMiniatureBuild(config);
    if (silentAudio) {
        if (typeof previousPrompt === 'string' && previousPrompt) {
            scene.masterVideoPrompt = replaceOrAppendSilentAmbience(previousPrompt, scene, config, identity);
        }
        return scene.masterVideoPrompt;
    }
    const newAudioBlock = buildSceneAudioBlockOnly(scene, config, identity);
    const updated = replaceAudioBlockInPrompt(previousPrompt, newAudioBlock);
    scene.masterVideoPrompt = enforceCleanVideoOpening(deduplicateDialogueLines(updated));
    return scene.masterVideoPrompt;
}

let continuingEpisode = false;

function freezeEpisodeBible(breakdown) {
    if (!breakdown) return;
    if (state.currentEpisode <= 1 || !state.episodeBible) {
        state.episodeBible = breakdown.masterVisualIdentity || state.episodeBible;
        return;
    }
    const bible = state.episodeBible;
    const fresh = breakdown.masterVisualIdentity || {};
    const seen = {};
    const locations = [];
    const characters = [];
    (bible.characters || []).concat(fresh.characters || []).forEach(character => {
        const id = character && character.characterId;
        if (!character || (id && seen[id])) return;
        if (id) seen[id] = 1;
        characters.push(character);
    });
    (bible.locations || []).concat(fresh.locations || []).forEach(l => {
        const id = (l && l.locationId) || '';
        if (id && seen[id]) return;
        if (id) seen[id] = 1;
        if (l) locations.push(l);
    });
    breakdown.masterVisualIdentity = Object.assign({}, fresh, {
        characters: characters.length ? characters : (bible.characters || fresh.characters),
        character: bible.character || fresh.character,
        wardrobe: bible.wardrobe || fresh.wardrobe,
        product: bible.product || fresh.product,
        objectProduct: bible.objectProduct || fresh.objectProduct,
        visualStyle: bible.visualStyle || fresh.visualStyle,
        locations: locations.length ? locations : (bible.locations || fresh.locations)
    });
}

function previousEpisodeBrief() {
    const prev = (state.episodeSeries || [])[state.episodeSeries.length - 1];
    if (!prev || !prev.breakdown || !prev.breakdown.scenes) return '';
    const last = prev.breakdown.scenes[prev.breakdown.scenes.length - 1] || {};
    return 'PREVIOUS EPISODE ' + prev.episode + ' END: title="' + (last.title || '') + '" location=' + (last.locationId || '') + ' time=' + (last.timeOfDay || '') + ' beat=' + (last.wardrobeBeat || '') + ' spoken="' + String(last.dialogueOrNarration || '').slice(0, 220) + '"';
}

function normalizeSeriesPlan(breakdown, config) {
    if (!breakdown || !config || Number(config.episodeCount) <= 1) return;
    const total = Math.min(5, Math.max(1, Number(config.episodeCount) || 1));
    const existing = Array.isArray(breakdown.seriesPlan) ? breakdown.seriesPlan : [];
    const prior = Array.isArray(config.seriesPlan) ? config.seriesPlan : [];
    const phases = [
        ['opening and inciting incident', 'Establish the world, characters, central need, and the first irreversible problem.', 'End with a question, discovery, or complication; do not resolve the central conflict.'],
        ['rising pressure and investigation', 'Develop the consequence of the first episode and reveal new information or resistance.', 'End with a stronger obstacle, difficult choice, or unresolved revelation.'],
        ['escalation and turning point', 'Force the characters to act on the central problem and pay a meaningful cost.', 'End at the turning point or lowest point, before the final resolution.'],
        ['final approach and confrontation', 'Bring the characters to the decisive confrontation and prepare the final choice.', 'End with the decisive choice or confrontation ready to resolve.'],
        ['resolution and payoff', 'Resolve the central conflict, show the consequence, and close the character arc.', 'End with the story payoff and a stable new state.']
    ];
    const plan = Array.from({ length: total }, (_, index) => {
        const source = prior[index] || existing[index] || {};
        const phase = phases[Math.min(index, phases.length - 1)];
        return {
            episode: index + 1,
            purpose: String(source.purpose || phase[0]).trim(),
            beginningState: String(source.beginningState || (index === 0 ? 'Story begins from the user brief.' : 'Continue directly from the previous episode ending.')).trim(),
            mainDevelopment: String(source.mainDevelopment || phase[1]).trim(),
            requiredBeats: Array.isArray(source.requiredBeats) && source.requiredBeats.length
                ? source.requiredBeats
                : [phase[1], phase[2]],
            endingState: String(source.endingState || phase[2]).trim(),
            transitionToNext: String(source.transitionToNext || (index < total - 1 ? 'Leave an active unresolved consequence for the next episode.' : 'Close the central story with a clear payoff.')).trim()
        };
    });
    breakdown.seriesPlan = plan;
    const current = plan[Math.max(0, Math.min(total - 1, Number(config.currentEpisode || 1) - 1))];
    if (!current || !Array.isArray(breakdown.scenes)) return;
    breakdown.episodeContract = {
        episode: current.episode,
        totalEpisodes: total,
        purpose: current.purpose,
        beginningState: current.beginningState,
        endingState: current.endingState,
        requiredBeats: current.requiredBeats
    };
    breakdown.scenes.forEach((scene, index) => {
        if (!scene || typeof scene !== 'object') return;
        scene.episodeNumber = current.episode;
        scene.episodeTotal = total;
        scene.episodePurpose = current.purpose;
        scene.episodeRequiredBeats = current.requiredBeats;
        scene.episodeEndingState = current.endingState;
        const isFinalEpisode = current.episode === total;
        const guard = isFinalEpisode
            ? 'This is the final episode: resolve the central conflict only through the planned final payoff.'
            : 'This is not the final episode: do not resolve the central conflict, do not deliver the final payoff, and do not end the whole story. Leave a concrete unresolved consequence for the next episode.';
        scene.storyPurpose = [scene.storyPurpose, 'EPISODE ' + current.episode + ' ARC: ' + current.purpose, guard].filter(Boolean).join(' — ');
        scene.sceneBeat = [scene.sceneBeat, 'Required episode beat: ' + String(current.requiredBeats[Math.min(index, current.requiredBeats.length - 1)] || current.mainDevelopment), guard].filter(Boolean).join(' — ');
    });
}

function seriesProgressBrief() {
    return (state.episodeSeries || []).sort((a, b) => Number(a.episode) - Number(b.episode)).map(episode => {
        const scenes = episode.breakdown && Array.isArray(episode.breakdown.scenes) ? episode.breakdown.scenes : [];
        return 'EPISODE ' + episode.episode + ' COMPLETED ARC: ' + scenes.map(scene => [scene.title, scene.storyPurpose, scene.sceneBeat].filter(Boolean).join(' — ')).join(' | ');
    }).join('\n');
}

function isCurrentEpisodeComplete() {
    const episode = (state.episodeSeries || []).find(item => item.episode === state.currentEpisode);
    const sceneCount = Array.isArray(state.directorData && state.directorData.scenes)
        ? state.directorData.scenes.length
        : Number(state.sceneCount) || 0;
    if (!episode || !sceneCount) return false;
    return Array.from({ length: sceneCount }, (_, index) => {
        const cached = episode.images && episode.images[index];
        return Boolean(cached || getSceneImageDataUrl(index));
    }).every(Boolean);
}

async function continueNextEpisode() {
    if (storyboardGenerating || sceneGenerationActive) {
        const activeScene = sceneGenerationIndex >= 0 ? sceneGenerationIndex + 1 : 1;
        showCanvasNotice('sabar Boss, pak TRENDORA masih masak adegan ' + activeScene);
        return;
    }
    const cap = Math.min(5, Number(state.episodeCount) || 1);
    if (state.currentEpisode >= cap) return;
    if (!isCurrentEpisodeComplete()) {
        showCanvasNotice('Selesaikan dulu episode ' + state.currentEpisode + ' Boss..');
        return;
    }
    const completed = (state.episodeSeries || []).find(item => item.episode === state.currentEpisode);
    if (completed && completed.breakdown) {
        state.seriesPlan = completed.breakdown.seriesPlan || state.seriesPlan;
        state.episodeBible = completed.breakdown.masterVisualIdentity || state.episodeBible;
    }
    continuingEpisode = true;
    state.currentEpisode += 1;
    await startGeneration();
}

async function repairInteractiveDialogueForScene(scene, config, cast) {
    const turnPlan = chooseDialogueTurnPlan(scene);
    const dialogueFunction = dialogueSceneFunction(scene);
    const sceneIntent = buildSceneIntentContract(scene, config);
    const request = {
        systemInstruction: { parts: [{ text: `You are a dialogue editor. Rewrite only the spoken dialogue for one storyboard scene.
Return JSON only: {"dialogueOrNarration":"..."}.
This is a real conversation between active scene participants, not a monologue. Use 2 or 3 complete short turns, never more than 3, alternating at least two CHARACTER_IDs listed in the scene's dialoguePlan.participants. Each speaker must have a different immediate objective: the second speaker must answer, reject, correct, reveal, or change the consequence of the first speaker's line, never repeat its request with different wording. The preferred pattern is ${turnPlan.pattern}, but any alternating 2-3 turn pattern is valid if it fits the scene.
SCENE DIALOGUE FUNCTION: ${dialogueFunction.name}. ${dialogueFunction.rule} The exchange must progress from one turn to the next; never split one monologue into two lines.
${sceneIntent}
Every turn must be one complete natural sentence inside double quotes and on its own line. Each reply must respond to the immediately previous line and the visible action. Do not split one thought between speakers. Do not repeat the same request, address, or sentence core across adjacent turns. Do not use VOICEOVER, NARRATOR, continuation fragments, standalone expression lines, or explanatory prose.
If the visual action says a character leaves, that character must finish speaking before leaving; do not give that character dialogue after departure.
Add one specific bracketed acting expression before each speaker label. Spoken language: ${config.language}.` }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify({
            story: config.story,
            cast,
            scene: {
                title: scene.title || '',
                storyPurpose: scene.storyPurpose || '',
                sceneBeat: scene.sceneBeat || '',
                visualAction: scene.sceneVisualPlan?.visualAction || '',
                dialoguePlan: scene.dialoguePlan || {},
                currentDialogue: scene.dialogueOrNarration || '(possibly corrupted; rewrite from the scene, do not split or preserve it)'
            }
        }) }] }],
        generationConfig: { responseMimeType: 'application/json' }
    };
    const result = await invokeStoryboardTextRequest(request);
    const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text || result?.text || '';
    const parsed = parseGeminiJsonResponse(raw);
    return String(parsed?.dialogueOrNarration || '').trim();
}

async function repairAdvertisementAudioForScene(scene, config, cast) {
    const request = {
        systemInstruction: { parts: [{ text: `Write only the mandatory spoken audio for this one advertisement scene. Return JSON: {"dialogueOrNarration":"..."}. Use Indonesian, natural human delivery, and never return an empty value. For two people use at most 3 labeled turns; for one person use concise CHARACTER_1 dialogue, VOICEOVER, or both. Tie every line to the visible product action. Add a product-specific CTA only if this is the final scene. Never return only the words CTA, closing action, or sound design.` }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify({ story: config.story, cast, scene, audioMode: config.audioMode, language: config.language }) }] }],
        generationConfig: { responseMimeType: 'application/json' }
    };
    const result = await invokeStoryboardTextRequest(request);
    const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text || result?.text || '';
    const parsed = parseGeminiJsonResponse(raw);
    return String(parsed?.dialogueOrNarration || '').trim();
}

async function repairSingleSpeakerAudioForScene(scene, config, cast) {
    const dialogueFunction = dialogueSceneFunction(scene);
    const request = {
        systemInstruction: { parts: [{ text: `Rewrite only the spoken audio for this one scene. Return JSON: {"dialogueOrNarration":"..."}. Use a natural number of short, complete lines appropriate for the selected duration, with a maximum of 24 spoken words for a 10-second scene. Dialogue count is independent from shot count: one sentence may fill the complete duration and continue across multiple shots. Use only CHARACTER_1, with optional VOICEOVER when allowed. Never use CHARACTER_2 or any other character. Make the lines feel like a natural progression: reaction or setup, then product/story meaning or payoff. Keep every line tied to the visible scene action and the registered identity. DIALOGUE FUNCTION: ${dialogueFunction.name}. ${dialogueFunction.rule} Do not output explanations, sound design, labels such as CTA alone, or long narration. Spoken language: ${config.language}.` }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify({ story: config.story, cast, scene: { title: scene.title, storyPurpose: scene.storyPurpose, sceneBeat: scene.sceneBeat, visualAction: scene.sceneVisualPlan?.visualAction, dialoguePlan: scene.dialoguePlan, currentDialogue: scene.dialogueOrNarration } }) }] }],
        generationConfig: { responseMimeType: 'application/json' }
    };
    const result = await invokeStoryboardTextRequest(request);
    const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text || result?.text || '';
    const parsed = parseGeminiJsonResponse(raw);
    return String(parsed?.dialogueOrNarration || '').trim();
}

async function repairDialogueWithGemini(scene, config, cast, violations, breakdown, index, repairOptions) {
    const genre = storyboardGenre(breakdown || { scenes: [scene] }, config);
    const singleSpeaker = sceneRequiresSingleSpeaker(scene, config);
    const interactive = sceneRequiresInteractiveDialogue(scene, config) || sceneHasTwoActiveSpeakers(scene);
    const sceneIntent = buildSceneIntentContract(scene, config, index, breakdown);
    const turnPlan = chooseDialogueTurnPlan(scene);
    const opts = repairOptions || {};
    const attemptNumber = Number(opts.attemptNumber) || 1;
    const focus = String(opts.focus || '');
    const directive = String(opts.directive || '');
    const violationGuidance = String(opts.violationGuidance || '');
    const previousBrokenDialogue = String(opts.previousBrokenDialogue || '');
    const attemptDirective = directive || (
        attemptNumber === 1 ? 'Perbaiki struktur dan format speaker tanpa mengubah frasa yang masih konkret.' :
        attemptNumber === 2 ? 'Perbaiki konten: ganti frasa generik dengan kalimat spesifik dari beat scene ini.' :
        'Tulis ulang dialog dari awal mengikuti brief pelanggaran. Abaikan frasa lama yang menyebabkan pelanggaran.'
    );
    const attemptConstraint = focus === 'rewrite'
        ? '\nYou may completely rewrite the dialogue from scratch using the violation guidance as your brief.'
        : focus === 'content'
            ? '\nKeep the speaker structure but replace generic/template phrases with scene-specific lines.'
            : '\nMinimal changes only: keep most original lines, fix only the structural issues.';
    const request = {
        systemInstruction: { parts: [{ text: `You are the creative dialogue brain behind TRENDORA AI. Repair only the spoken audio for one storyboard scene.
Return JSON only: {"dialogueOrNarration":"..."}.

Your job is not to follow templates. Read the scene as a director: what is visible, who wants what, what just changed, and what must be heard right now. Write fresh Indonesian dialogue from the current beat, not from cached memory or reusable examples.

UNIVERSAL CONTRACT:
- Match the visible action, story purpose, scene beat, scene intent, audio direction, and dialogue plan.
- One visible seller/person means only CHARACTER_1 may speak, with optional VOICEOVER. Never invent CHARACTER_2.
- Two active visible people means real back-and-forth conversation. Each reply must respond to the previous turn.
- Assign each line to the correct registered person using the supplied gender, role, relationship, voice lock, face/hair/body locks, and wardrobe; CHARACTER_1 and CHARACTER_2 are not interchangeable.
- Never make two speakers repeat the same request or split one sentence between them. The second turn must answer, reject, correct, reveal, or change the consequence of the first.
- If it is an advertisement, Scene 1 needs a natural hook and the final scene needs a natural CTA tied to the visible offer. End with a direct audience invitation to visit, enquire, reserve or purchase as appropriate. "Cek bangunannya" and other descriptions are not invitations. Create fresh wording grounded in this scene, the audience need and supplied facts; avoid repeating existing closing lines in the supplied context. No fixed slogans, invented discount, scarcity, contact details or claims. Fit the invitation inside the duration budget by rewriting, not padding.
- If it is a hybrid story with product, the final scene resolves the story instead of hard-selling.
- If it is conflict, the lines must sound like conflict: accusation, refusal, demand, consequence, apology, or decision tied to the actual object/problem in the scene.
- Never output generic filler, placeholder slogans, meta explanation, sound-only notes, or lines that ignore the image.

CHARACTER CONSISTENCY (HARD):
- Each character has a frozen face, hair, body, skin, wardrobe anchor, voice, role, and relationship. Use these exact traits when writing or revising dialogue.
- Do NOT swap, merge, rename, or replace characters. CHARACTER_1 is always the registered CHARACTER_1.
- If a character has faceLock like "round face, almond eyes, mole on left cheek", that character is the only one allowed to have those traits in this scene.

FORMAT:
Use ${turnPlan.count} short playable turn(s) when possible, no more than 3. ${interactive ? 'Use alternating active characters from dialoguePlan.participants.' : singleSpeaker ? 'Use only CHARACTER_1 and/or VOICEOVER.' : 'Use only speakers justified by the scene.'}
Each spoken line must be on its own line:
[specific acting expression in Indonesian] CHARACTER_N: "complete natural sentence"
or
[specific delivery in Indonesian] VOICEOVER: "complete natural sentence"

Spoken language: ${config.language}. Content genre: ${genre}.

VIOLATIONS TO FIX (use this exact guidance to repair):
${violationGuidance || 'Violations: ' + (violations || []).join(', ') || 'none.'}

ATTEMPT STRATEGY (attempt ${attemptNumber} of 3):
${attemptDirective}
${attemptConstraint}
${previousBrokenDialogue ? '\nPREVIOUS BROKEN DIALOGUE (annotated):\n' + previousBrokenDialogue + '\nUse these annotations as a guide for what to KEEP and what to REPLACE.' : ''}
${sceneIntent}` }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify({
            story: config.story,
            contentGenre: genre,
            audioMode: config.audioMode,
            language: config.language,
            sceneNumber: scene.sceneNumber || index + 1,
            isFinalScene: breakdown && Array.isArray(breakdown.scenes) ? index === breakdown.scenes.length - 1 : false,
            cast,
            speakerPlan: {
                singleSpeaker,
                interactive,
                turnPattern: turnPlan.pattern,
                participants: scene.dialoguePlan && scene.dialoguePlan.participants
            },
            scene: {
                title: scene.title || '',
                storyPurpose: scene.storyPurpose || '',
                sceneBeat: scene.sceneBeat || '',
                sceneFunction: scene.sceneVisualPlan && scene.sceneVisualPlan.sceneFunction || '',
                visualAction: scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction || '',
                conflictObject: scene.sceneVisualPlan && scene.sceneVisualPlan.conflictObject || '',
                productRole: scene.sceneVisualPlan && scene.sceneVisualPlan.productRole || '',
                dialoguePlan: scene.dialoguePlan || {},
                audioDirection: scene.audioDirection || {},
                currentDialogue: scene.dialogueOrNarration || ''
            },
            repairAttempt: attemptNumber,
            violationBrief: violations || []
        }) }] }],
        generationConfig: { responseMimeType: 'application/json' }
    };
    const result = await invokeStoryboardTextRequest(request);
    const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text || result?.text || '';
    const parsed = parseGeminiJsonResponse(raw);
    return String(parsed?.dialogueOrNarration || '').trim();
}

async function repairDialogueViolations(breakdown, config) {
    if (!breakdown || !Array.isArray(breakdown.scenes) || isSilentAudioMode(config)) return;
    backfillCastBible(breakdown.masterVisualIdentity);
    enforceNaturalDialogueContracts(breakdown, config);
    const cast = buildRepairCastContext(breakdown.masterVisualIdentity);
    for (let index = 0; index < breakdown.scenes.length; index++) {
        const scene = breakdown.scenes[index];
        let violations = sceneDialogueViolations(scene, config, breakdown, index);
        if (!violations.length) continue;
        const originalDialogue = String(scene.dialogueOrNarration || '').trim();
        let accepted = '';
        const attemptStrategies = [
            { focus: 'structure', directive: 'Fokus STRUKTUR: perbaiki speaker, jumlah giliran, format baris. Pertahankan frasa asli yang masih konkret.' },
            { focus: 'content', directive: 'Fokus KONTEN: ganti frasa generik/template dengan kalimat spesifik dari beat scene. Pertahankan struktur speaker yang benar.' },
            { focus: 'rewrite', directive: 'Tulis ULANG dari awal mengikuti brief pelanggaran. Abaikan frasa lama yang menyebabkan pelanggaran.' }
        ];
        for (let attempt = 0; attempt < attemptStrategies.length; attempt++) {
            const strategy = attemptStrategies[attempt];
            try {
                const candidateRaw = await repairDialogueWithGemini(scene, config, cast, violations, breakdown, index, {
                    focus: strategy.focus,
                    directive: strategy.directive,
                    violationGuidance: getDialogueViolationGuidance(violations),
                    previousBrokenDialogue: annotateDialogueForRepair(scene.dialogueOrNarration || '', violations),
                    attemptNumber: attempt + 1
                });
                const candidate = prepareInteractiveDialogueCandidate(candidateRaw, scene, config, breakdown.masterVisualIdentity) || candidateRaw;
                const normalized = deduplicateDialogueLines(enforceDialogueCastAndLength(candidate, scene, config));
                const previous = scene.dialogueOrNarration;
                scene.dialogueOrNarration = normalized;
                enforceNaturalDialogueContracts(breakdown, config);
                violations = sceneDialogueViolations(scene, config, breakdown, index);
                if (!violations.length) {
                    accepted = normalized;
                    break;
                }
                scene.dialogueOrNarration = previous;
                violations = sceneDialogueViolations(scene, config, breakdown, index);
            } catch (error) {
                console.warn('[Dialogue Repair] Scene ' + (scene.sceneNumber || index + 1) + ' attempt ' + (attempt + 1) + ' failed:', error && error.message);
            }
        }
        if (accepted) {
            scene.dialogueOrNarration = accepted;
            scene.dialogueNeedsRepair = false;
            scene.dialogueViolations = [];
        } else {
            scene.dialogueOrNarration = originalDialogue;
            scene.dialogueNeedsRepair = true;
            scene.dialogueViolations = violations;
            console.warn('[Dialogue Repair] Scene ' + (scene.sceneNumber || index + 1) + ' still has violations:', violations);
        }
    }
}

async function runDirectorDialoguePass(breakdown, config, repairAttempt = false) {
    if (!breakdown || !Array.isArray(breakdown.scenes) || isSilentAudioMode(config)) return;
    if (breakdown.scenes.length && breakdown.scenes.every(scene => scene && scene.dialogueDeferred === true)) return;
    backfillCastBible(breakdown.masterVisualIdentity);
    const cast = buildRepairCastContext(breakdown.masterVisualIdentity);
    const scenes = breakdown.scenes.map((scene, index) => ({
        sceneNumber: scene.sceneNumber || index + 1,
        title: scene.title || '',
        storyPurpose: scene.storyPurpose || '',
        visualAction: scene.sceneVisualPlan?.visualAction || '',
        sceneBeat: scene.sceneBeat || '',
        location: scene.locationId || '',
        dialoguePlan: scene.dialoguePlan || {},
        currentDialogue: scene.dialogueOrNarration || ''
    }));
    const sceneFunctions = breakdown.scenes.map((scene, index) => ({
        function: dialogueSceneFunction(scene),
        intentContract: buildSceneIntentContract(scene, config, index, breakdown)
    }));
    const castSize = Array.isArray(breakdown.masterVisualIdentity && breakdown.masterVisualIdentity.characters) ? breakdown.masterVisualIdentity.characters.length : 0;
    const castContract = castSize <= 1
        ? `\nCAST SIZE LOCK — This storyboard has exactly ${castSize} registered character${castSize === 1 ? '' : 's'}. You MUST use only CHARACTER_1 (or VOICEOVER for narrator). NEVER use CHARACTER_2 or any higher CHARACTER_ID. Natural single-character flow is written as consecutive CHARACTER_1 turns with varying expressions and reactions, NOT as a two-person conversation. Two-character scenes are NOT valid here.\n`
        : castSize >= 2
            ? `\nCAST SIZE LOCK — This storyboard has ${castSize} registered characters. Read each scene's dialoguePlan.participants as the active cast. If it lists 2 or more CHARACTER_IDs, the audio MUST be a two-way exchange between at least two listed characters; never replace a response with VOICEOVER. If it lists only one, use that character for monologue or optional VOICEOVER. Never invent a CHARACTER_ID not registered in the cast.\n`
            : '';
    const request = {
        systemInstruction: { parts: [{ text: `You are a senior Indonesian drama director polishing the dialogue of a finished storyboard. You have read the visual action, story purpose, scene beat, dialogue plan, registered cast, and current blueprint dialogue for every scene. Use each supplied registered cast name exactly; never replace it with "unnamed", "unknown", or a generic CHARACTER label in descriptive cast text. The blueprint dialogue is the primary script. Keep it when it is specific and natural; rewrite only when it is generic, violates speaker rules, misses the scene's product/conflict/emotion, or puts sales/CTA in the wrong scene.

VOICE: Write like a person who has been on set. Specific, grounded, surprising. If the scene is a fight, write accusations, demands, refusals, exits — name the actual thing they are fighting about from the visual action. If it is a tender scene, write the unspoken thing the character is feeling. If it is a sale, write a concrete hook about the visible product, not a generic slogan.
SCENE FUNCTION: For each scene, infer whether it is conflict, consultation, introduction, negotiation, farewell, emotional exchange, or another scene exchange. Follow that function: each reply must add a fact, reaction, decision, question, or consequence. Never split one monologue into two lines, repeat the same request, or use generic filler.

LANGUAGE: All spoken lines MUST be in ${config.language}. Do not use English unless the user explicitly asked.

${buildModeDialogueContract(config, null)}

PACING: Each scene duration is ${config.durationPerScene || '10s'}. Aim for ${spokenWordBudget(config.durationPerScene).minWords}-${spokenWordBudget(config.durationPerScene).maxWords} spoken words across 2-4 short playable turns. Each turn is one complete sentence, playable in 1-3 seconds. Leave breathing room. Do not pad with greetings, do not summarize the scene, do not narrate the action.

WHAT TO AVOID: filler like "kita perlu bicara", "aku dengar kamu", "jujur duluan"; meta-commentary like "in this scene we see"; repeated phrases across scenes; placeholder dialogue you have written in other projects. Every scene must feel written fresh from THIS scene's specifics — the action, the location, the relationship, the thing at stake right now.

CHARACTER LOCK (HARD):
- Each CHARACTER_N has a frozen face, hair, skin, body, wardrobe, voice, role, relationship. Do NOT swap, merge, rename, or invent characters.
- CHARACTER_1 is always CHARACTER_1. CHARACTER_2 is always CHARACTER_2. They are NEVER interchangeable.
- Speakers must match the dialoguePlan.participants for each scene.

${buildCharacterLockText(cast)}

OUTPUT: Return JSON only, no markdown: {"scenes":[{"sceneNumber":1,"dialogueOrNarration":"..."}]}. The dialogueOrNarration is the audio block WITHOUT the [AUDIO / DIALOGUE] header. Format lines as either:
- character: [specific Indonesian expression] CHARACTER_N: "kalimat lengkap natural"
- voice-over: [specific delivery] VOICEOVER: "kalimat narasi natural"
The bracket expression is optional but encouraged — use a different, scene-appropriate one per turn. ${castContract}Respect the existing dialoguePlan and cast identities. The plan is the brief, not the script.${repairAttempt ? '\nThis is a repair attempt after a previous result violated the speaker contract. Rebuild the violating scene dialogue from its visual action and dialoguePlan.' : ''}` }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify({ story: config.story, audioMode: config.audioMode, cast: cast, scenes: scenes, sceneFunctions: sceneFunctions, seriesPlan: config.seriesPlan || state.seriesPlan || null, currentEpisode: config.currentEpisode || state.currentEpisode || 1 }) }] }],
        generationConfig: { responseMimeType: 'application/json' }
    };
    try {
        const result = await invokeStoryboardTextRequest(request);
        const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text || result?.text || '';
        const parsed = parseGeminiJsonResponse(raw);
        if (!Array.isArray(parsed?.scenes)) throw new Error('Dialogue pass returned invalid scenes.');
        parsed.scenes.forEach(item => {
            const scene = breakdown.scenes.find((entry, index) => (entry.sceneNumber || index + 1) === Number(item.sceneNumber));
            if (scene && typeof item.dialogueOrNarration === 'string' && item.dialogueOrNarration.trim()) {
                const candidate = prepareInteractiveDialogueCandidate(item.dialogueOrNarration.trim(), scene, config, breakdown.masterVisualIdentity) || item.dialogueOrNarration.trim();
                const requiresTwoSpeakers = sceneRequiresInteractiveDialogue(scene, config);
                // 3D: tolerate format more — accept any candidate that mentions CHARACTER_1
                // and (for interactive) has at least 2 alternating or responsive turns. Keep original
                // director dialogue if the rewrite is generic or fails interaction contract.
                const mentions = (line) => /CHARACTER_\d+|VOICEOVER|NARRATOR/i.test(line);
                const candidateLines = candidate.split('\n').filter(mentions);
                const directorLines = String(scene.dialogueOrNarration || '').split('\n').filter(mentions);
                const isRewriteBetter = candidateLines.length > 0 && (
                    candidate.toLowerCase().indexOf('kita perlu bicara') < 0 &&
                    candidate.toLowerCase().indexOf('jujur duluan') < 0 &&
                    candidate.toLowerCase().indexOf('aku dengar kamu') < 0 &&
                    candidate.toLowerCase().indexOf('ada yang tidak beres') < 0 &&
                    candidate.toLowerCase().indexOf('aku tidak menyangka') < 0
                );
                const passesContract = !requiresTwoSpeakers || hasValidInteractiveDialogue(candidate, scene, config);
                if (passesContract && isRewriteBetter) {
                    scene.dialogueOrNarration = candidate;
                } else if (passesContract && directorLines.length === 0) {
                    scene.dialogueOrNarration = candidate;
                } else if (!passesContract) {
                    console.warn('[Dialogue Pass] Rejected candidate for scene', item.sceneNumber, requiresTwoSpeakers ? '(failed interactive contract)' : '(empty)');
                }
            }
        });
        const invalidScenes = breakdown.scenes.filter(scene =>
            sceneRequiresInteractiveDialogue(scene, config) &&
            !hasValidInteractiveDialogue(scene.dialogueOrNarration, scene, config)
        );
        if (invalidScenes.length) {
            for (const scene of invalidScenes) {
                let repaired = '';
                for (let attempt = 0; attempt < 2; attempt++) {
                    repaired = await repairInteractiveDialogueForScene(scene, config, cast);
                    if (hasValidInteractiveDialogue(repaired, scene, config)) break;
                }
                if (hasValidInteractiveDialogue(repaired, scene, config)) {
                    scene.dialogueOrNarration = repaired;
                } else {
                    scene.dialogueNeedsRepair = true;
                    scene.dialogueViolations = sceneDialogueViolations(scene, config, breakdown, breakdown.scenes.indexOf(scene));
                    console.warn('[Dialogue Pass] Scene ' + (scene.sceneNumber || breakdown.scenes.indexOf(scene) + 1) + ' kept blueprint dialogue after repair failed.');
                }
            }
        }
        await repairDialogueViolations(breakdown, config);
        enforceCastAlignmentAcrossScenes(breakdown, config);
        breakdown.scenes.forEach(scene => {
            if (scene && scene.dialogueOrNarration) scene.dialogueOrNarration = deduplicateDialogueLines(scene.dialogueOrNarration);
        });
    } catch (error) {
        console.warn('[Dialogue Pass] Kept original director dialogue:', error.message);
    }
}

function buildSceneSpecificFallback(scene, config, interactive) {
    return '';
}

async function analyzeProductReferenceImage(refs) {
    if (!refs || !refs.length) return null;
    const parts = [{ text: 'You are analyzing product reference photos for a video storyboard. Extract concrete, visual-only details you can actually observe in the photo. Do NOT invent specs.\nReturn JSON only:\n{\n  "name": "product name visible in photo or empty if unclear",\n  "brand": "brand/merk visible in photo or empty if unclear",\n  "size": "real-world size inferred from product category (e.g. sandal dewasa ~26cm, botol 250ml, laptop 14 inch) or empty if completely unclear",\n  "material": "dominant material you can see (e.g. EVA foam, matte plastic, leather, fabric, glass)",\n  "color": "dominant color with accents (e.g. hitam doff dengan aksen oranye)",\n  "texture": "surface texture you can see (e.g. rubber grip, glossy finish, fabric weave, mesh)",\n  "keyDetails": "visible distinctive features: cap, strap, sole, label placement, logo position, packaging, visible markings, seams, buttons"'
    }];
    refs.forEach((ref, idx) => {
        if (!ref || !ref.dataUrl) return;
        const match = ref.dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!match) return;
        parts.push({ text: 'PRODUCT PHOTO ' + (idx + 1) });
        parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    });
    parts.push({ text: 'Final reminder: return JSON only, empty string for any field you cannot observe. Be specific and concrete, not generic.' });
    try {
        const result = await invokeStoryboardTextRequest({
            contents: [{ role: 'user', parts }],
            generationConfig: { responseMimeType: 'application/json' }
        });
        const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text || result?.text || '';
        return parseGeminiJsonResponse(raw);
    } catch (err) {
        console.warn('[Product vision] analysis failed:', err && err.message);
        return null;
    }
}

async function startGeneration() {
    if (storyboardGenerating) return;
    const isContinue = continuingEpisode;
    continuingEpisode = false;
    const promptEl = document.getElementById('promptInput');
    if (promptEl && !isContinue) state.story = promptEl.value;

    if (!state.story.trim()) {
        alert("Silakan masukkan cerita atau konsep video Anda terlebih dahulu.");
        return;
    }
    state.language = resolveStoryboardLanguage(state);
    const languageSelect = document.getElementById('selectLanguage');
    if (languageSelect && Array.from(languageSelect.options).some(option => option.value === state.language)) {
        languageSelect.value = state.language;
    }
    updateSummaryPill();

    if (state.storyboardMode === 'animation' && state.animationStyle === 'Custom Style' && !parseUserAnimationStyles(state.animationCustomStyle).length) {
        alert('Tulis style animasi custom terlebih dahulu. TRENDORA akan menerapkan semua style yang kamu input.');
        syncAnimationCustomStyleUI();
        const customInput = document.getElementById('inputAnimationCustomStyle');
        if (customInput) customInput.focus();
        return;
    }

    hideStoryboardRunNotice();
    if (!isContinue && applyCreativeAudioAutoDetect(state)) {
        showCanvasNotice('Audio disetel ke ASMR / tanpa dialog karena brief Anda.', 'warning');
    }
    if (!isContinue && isCreativeMiniatureBuild(state)) {
        showCanvasNotice('Deteksi miniatur: objek dirakit dalam skala kecil, tangan manusia tetap raksasa.', 'warning');
    }

    // Cross-context guard: warn user when the active storyboard mode
    // and the story content look mismatched (e.g. commercial mode but
    // no product, or creative mode but story has clear commercial
    // intent). Skip when continuing an existing episode to avoid
    // disrupting multi-episode flow.
    //
    // Modal choices:
    //   Pindah  -> switch to the recommended menu; transfer all
    //              inputs/uploads/settings via the existing
    //              navGoStoryboardMode pipeline; stay on the form
    //              so the user reviews then clicks Generate again.
    //   Batal   -> stay on the current form with everything as-is.
    const generateButtonEarly = document.getElementById('btnCreateStoryboard');
    if (generateButtonEarly) generateButtonEarly.disabled = true;
    if (!isContinue) {
        const mismatch = shouldWarnMenuMismatch(state);
        if (mismatch) {
            const continueChoice = await openMenuMismatchModal(
                mismatch.headline,
                mismatch.message,
                mismatch.modeLabel
            );
            if (continueChoice) {
                // Pindah: switch menu + transfer all state, but DO NOT
                // auto-start generation. User reviews the form first.
                try {
                    const targetMode = mismatch.targetMode;
                    if (targetMode && targetMode !== state.storyboardMode) {
                        // Use the dedicated switcher that updates
                        // EVERY form control (pills, dropdowns,
                        // prompt, refs, title, sidebar). The generic
                        // navGoStoryboardMode leaves pill selectors
                        // stale because they were only initialised
                        // once at app boot.
                        switchStoryboardModeWithTransfer(targetMode);
                        showCanvasNotice('Berpindah ke ' + (mismatch.otherMenuLabel || targetMode) + '. Input & aset sudah dipindahkan. Periksa, lalu klik Generate lagi.', 'success');
                    }
                } catch (switchErr) {
                    console.warn('[Menu Mismatch] switchStoryboardModeWithTransfer failed:', switchErr && switchErr.message);
                }
            }
            // Both Pindah and Batal abort generation here; user must
            // click Generate again on whichever menu they end up on.
            if (generateButtonEarly) generateButtonEarly.disabled = false;
            return;
        }
    }

    if (!isContinue) {
        state.currentEpisode = 1;
        state.episodeBible = null;
        state.seriesPlan = null;
        state.episodePlate = null;
        state.episodeSeries = [];
        currentStoryboardHistoryId = null;
        if (!state.productReference || !state.productReference.length) resetProductLock();
    }
    state.episodeCount = Math.min(5, Math.max(1, Number(state.episodeCount) || 1));

    storyboardGenerating = true;
    storyboardGenerationMode = state.storyboardMode;
    storyboardCancelled = false;
    storyboardAbortCtrl = new AbortController();
    // Button already disabled earlier before the menu-mismatch modal;
    // re-assert in case the modal path was skipped.
    const generateButton = document.getElementById('btnCreateStoryboard');
    if (generateButton) generateButton.disabled = true;

    state.directorData = null;
    const directorIntentEl = document.getElementById('directorIntentContainer');
    if (directorIntentEl) directorIntentEl.innerHTML = '';
    const socialPackEl = document.getElementById('socialPackContainer');
    if (socialPackEl) socialPackEl.innerHTML = '';
    document.getElementById('scenesContainer').innerHTML = '';
    const episodeBarEl = document.getElementById('episodeBar');
    if (episodeBarEl) episodeBarEl.innerHTML = '';

    document.getElementById('creatorFormView').classList.add('hidden');
    document.getElementById('resultView').classList.add('hidden');
    document.getElementById('loadingView').classList.remove('hidden');
    startFunnyRotator();
    advanceLoadingStage('detect');

    try {
        const detectedGenre = detectGenre(state.story, !!(state.productReference && state.productReference.length));
        const epLabel = state.episodeCount > 1 ? ('Episode ' + state.currentEpisode + '/' + state.episodeCount + ' — ') : '';
        const genreLabel = genreLoadingText(detectedGenre);
        advanceLoadingStage('detect', { substepOverride: epLabel + genreLabel });
        const productSizeInput = document.getElementById('productSizeInput');
        const manualProductSize = productSizeInput ? productSizeInput.value.trim() : '';
        if (!state.productLock || typeof state.productLock !== 'object') resetProductLock();
        if (manualProductSize) state.productLock.size = manualProductSize;
        if (state.productReference && state.productReference.length && !isContinue && !isPlacePromotion(state)) {
            advanceLoadingStage('analyze', { substepOverride: 'Menganalisa foto produk...' });
            const vision = await analyzeProductReferenceImage(state.productReference);
            if (vision && typeof vision === 'object') {
                state.productLock = {
                    name: String(vision.name || '').trim(),
                    brand: String(vision.brand || '').trim(),
                    size: manualProductSize || String(vision.size || '').trim(),
                    material: String(vision.material || '').trim(),
                    color: String(vision.color || '').trim(),
                    texture: String(vision.texture || '').trim(),
                    keyDetails: String(vision.keyDetails || '').trim()
                };
            }
        } else if (!isContinue) {
            resetProductLock();
        }
        if (isContinue && !Array.isArray(state.seriesPlan)) {
            const completed = (state.episodeSeries || []).find(item => item.episode === state.currentEpisode - 1);
            state.seriesPlan = completed && completed.breakdown && completed.breakdown.seriesPlan || null;
            state.episodeBible = completed && completed.breakdown && completed.breakdown.masterVisualIdentity || state.episodeBible;
        }
        advanceLoadingStage('blueprint');
        let breakdown;
        const preparationAttempts = (isPlacePromotion(state) || state.storyboardMode === 'drama' || isSilentAudioMode(state)) ? 2 : 1;
        try {
            for (let preparationAttempt = 0; preparationAttempt < preparationAttempts; preparationAttempt++) {
                try {
        breakdown = await generateStoryboardBlueprint(state);
        // Keep the usable blueprint immediately so a later optional
        // validation/normalization failure cannot discard the result.
        state.directorData = breakdown;
        normalizeSeriesPlan(breakdown, state);
        if (state.seriesPlan && state.episodeCount > 1) breakdown.seriesPlan = state.seriesPlan;
        deferBlueprintDialogueUntilSceneGeneration(breakdown, state);
        validateStoryboardBreakdown(breakdown);
        throwIfStoryboardCancelled();
        restrictSimpleCommercialCast(breakdown, state);
        ensureCommercialHookPlan(breakdown, state);
        ensureSceneVisualPlans(breakdown, state);
        ensureDialoguePlans(breakdown, state);
        validateModeSpecificStoryPlan(breakdown, state);
        compileProductionBlueprint(breakdown, state);
        enforceCommercialSceneContract(breakdown, state);
        normalizeContinuityBible(breakdown, state);
        enforceStoryboardGenreRules(breakdown, state);
        enforceCommercialSceneContract(breakdown, state);
        advanceLoadingStage('dialogue');
        await runDirectorDialoguePass(breakdown, state);
        enforceNaturalDialogueContracts(breakdown, state);
        validateDialogueEngine(breakdown, state);
        enforceStoryboardGenreRules(breakdown, state);
        enforceCommercialSceneContract(breakdown, state);
        ensureInteractiveDialogueFallbacks(breakdown, state);
        enforceNaturalDialogueContracts(breakdown, state);
        validateDialogueEngine(breakdown, state);
        validateCommercialDialogueContract(breakdown, state);
        applyStoryboardLocks(breakdown, state);
        normalizeSeriesPlan(breakdown, state);
        enforceNaturalDialogueContracts(breakdown, state);
        ensureInteractiveDialogueFallbacks(breakdown, state);
        validateDialogueEngine(breakdown, state);
        advanceLoadingStage('quality');
        runStoryboardQualityGate(breakdown, state);

                    break;
                } catch (error) {
                    if (storyboardCancelled || error.code === 'CANCELLED') throw error;
                    const salvage = (usableStoryboardScenes(state.directorData).length && state.directorData)
                        || (usableStoryboardScenes(error.breakdown).length && error.breakdown)
                        || (usableStoryboardScenes(breakdown).length && breakdown)
                        || null;
                    if (salvage) {
                        state.directorData = salvage;
                        breakdown = salvage;
                    }
                    if (error.code === 'QUALITY_GATE' && salvage) {
                        salvage._generationNotes = (salvage._generationNotes || []).concat(error.message || 'Quality Gate');
                        tryFinalizePartialBlueprint(salvage, state);
                        break;
                    }
                    if (salvage && (error.permanent || preparationAttempt === preparationAttempts - 1)) {
                        salvage._generationNotes = (salvage._generationNotes || []).concat(error.message || 'validasi parsial');
                        console.warn('[Storyboard] Continuing with partial blueprint:', error.message);
                        tryFinalizePartialBlueprint(salvage, state);
                        break;
                    }
                    if (error.permanent || preparationAttempt === preparationAttempts - 1) throw error;
                    state._blueprintRepairIssue = String(error.message || '').slice(0, 500);
                    console.warn('[Storyboard] Retrying blueprint internally.');
                }
            }
        } finally {
            delete state._blueprintRepairIssue;
        }
        advanceLoadingStage('finalize');
        if (breakdown.seriesPlan) state.seriesPlan = breakdown.seriesPlan;
        else if (state.seriesPlan) breakdown.seriesPlan = state.seriesPlan;
        freezeEpisodeBible(breakdown);

        if (!breakdown.contentGenre) breakdown.contentGenre = detectedGenre;
        state.directorData = breakdown;
        updateLoadingStatus("Blueprint selesai! Pilih adegan untuk mulai generate...", 2);
        throwIfStoryboardCancelled();

        renderDirectorIntent(breakdown);
        renderSocialPack(breakdown);
        await renderStoryboardResults(breakdown);
        throwIfStoryboardCancelled();
        completeLoadingToHundred();
        setTimeout(() => {
            stopFunnyRotator();
            document.getElementById('loadingView').classList.add('hidden');
            document.getElementById('resultView').classList.remove('hidden');
        }, 420);
    } catch (err) {
        const cancelled = storyboardCancelled || err.code === 'CANCELLED' || err.message === 'CANCELLED';
        if (!cancelled) console.warn("Director Generation Error:", err);
        stopFunnyRotator();
        setStage(0);
        document.getElementById('loadingView').classList.add('hidden');
        if (cancelled) {
            if (isContinue) {
                state.currentEpisode = Math.max(1, state.currentEpisode - 1);
                document.getElementById('resultView').classList.remove('hidden');
                const prev = (state.episodeSeries || []).find(e => e.episode === state.currentEpisode);
                if (prev) showEpisode(prev.episode);
                else document.getElementById('creatorFormView').classList.remove('hidden');
            } else {
                state.episodeBible = null;
                state.episodePlate = null;
                state.episodeSeries = [];
                document.getElementById('creatorFormView').classList.remove('hidden');
            }
        } else {
            console.warn("[Storyboard internal failure]", err.code || err.status || err.name);
            if (isContinue) {
                state.currentEpisode = Math.max(1, state.currentEpisode - 1);
                document.getElementById('resultView').classList.remove('hidden');
                const prev = (state.episodeSeries || []).find(e => e.episode === state.currentEpisode);
                if (prev) showEpisode(prev.episode);
            } else if (usableStoryboardScenes(state.directorData).length || usableStoryboardScenes(err && err.breakdown).length) {
                if (!usableStoryboardScenes(state.directorData).length && err.breakdown) state.directorData = err.breakdown;
                tryFinalizePartialBlueprint(state.directorData, state);
                try {
                    renderDirectorIntent(state.directorData);
                    renderSocialPack(state.directorData);
                    await renderStoryboardResults(state.directorData);
                    document.getElementById('resultView').classList.remove('hidden');
                    if (isDialogueFailureMessage(err && err.message)) {
                        showCanvasNotice(getDialogueRecoveryMessage('', false), 'warning');
                    }
                } catch (renderError) {
                    console.error('[Storyboard partial result render failed]', renderError);
                    document.getElementById('creatorFormView').classList.remove('hidden');
                    const renderMsg = 'Storyboard gagal ditampilkan: ' + (renderError.message || 'hasil tidak dapat dirender.');
                    showStoryboardRunNotice(renderMsg);
                    showCanvasNotice(renderMsg, 'error');
                }
            } else {
                document.getElementById('creatorFormView').classList.remove('hidden');
                const failMsg = 'Storyboard gagal dibuat: ' + (err.message || 'silakan coba lagi.');
                showStoryboardRunNotice(failMsg);
                showCanvasNotice(failMsg, 'error');
            }
        }
    } finally {
        stopFunnyRotator();
        storyboardGenerating = false;
        storyboardGenerationMode = null;
        storyboardCancelled = false;
        storyboardAbortCtrl = null;
        if (generateButton) generateButton.disabled = false;
    }
}

function tryFinalizePartialBlueprint(breakdown, config) {
    if (!usableStoryboardScenes(breakdown).length) return;
    try { ensureSceneVisualPlans(breakdown, config); } catch (error) { console.warn('[Partial] visual plans', error && error.message); }
    try { ensureDialoguePlans(breakdown, config); } catch (error) { console.warn('[Partial] dialogue plans', error && error.message); }
    try { compileProductionBlueprint(breakdown, config); } catch (error) { console.warn('[Partial] production blueprint', error && error.message); }
    try { applyStoryboardLocks(breakdown, config); } catch (error) { console.warn('[Partial] storyboard locks', error && error.message); }
}

function usableStoryboardScenes(breakdown) {
    if (!breakdown || typeof breakdown !== 'object') return [];
    let scenes = breakdown.scenes;
    if (scenes && typeof scenes === 'object' && !Array.isArray(scenes)) {
        scenes = Object.values(scenes);
        breakdown.scenes = scenes;
    }
    return Array.isArray(scenes) ? scenes.filter(scene => scene && typeof scene === 'object') : [];
}

function validateStoryboardBreakdown(breakdown) {
    breakdown = normalizeStoryboardResponse(breakdown);
    if (!breakdown || typeof breakdown !== 'object') {
        throw new Error('Format breakdown storyboard tidak valid.');
    }
    const scenes = usableStoryboardScenes(breakdown);
    breakdown.scenes = scenes;
    if (!scenes.length) throw new Error('Format breakdown storyboard tidak valid: scenes kosong.');
    const expected = Number(state.sceneCount);
    if (scenes.length !== expected) {
        breakdown._sceneCountNote = 'Jumlah adegan ' + scenes.length + '/' + expected + '. Hasil tetap dipakai; Anda bisa mengedit tiap shot.';
        console.warn('[Storyboard] ' + breakdown._sceneCountNote);
    }
    validateExplicitStoryBeats(breakdown);
    breakdown.scenes.forEach((scene, index) => {
        if (!scene || typeof scene !== 'object') throw new Error(`Data adegan ${index + 1} tidak valid.`);
        if (typeof scene.masterImagePrompt !== 'string') scene.masterImagePrompt = '';
        if (typeof scene.masterVideoPrompt !== 'string') scene.masterVideoPrompt = '';
        if (scene.title !== undefined && typeof scene.title !== 'string') scene.title = 'Adegan ' + (index + 1);
    });
    normalizeStoryboardShotTimeline(breakdown, state);
    return breakdown;
}

function validateExplicitStoryBeats(breakdown) {
    const story = String(state.story || '').toLowerCase();
    const collectSceneText = source => (source && source.scenes || []).map(scene => [
        scene.title,
        scene.storyPurpose,
        scene.sceneBeat,
        scene.sceneVisualPlan && scene.sceneVisualPlan.sceneFunction,
        scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction,
        scene.dialoguePlan && scene.dialoguePlan.dramaticObjective,
        scene.dialoguePlan && scene.dialoguePlan.visualAnchor,
        scene.masterImagePrompt,
        scene.masterVideoPrompt,
        scene.dialogueOrNarration
    ].filter(Boolean).join(' ')).join(' ');
    const previousEpisodesText = (state.episodeSeries || [])
        .filter(episode => Number(episode.episode) < Number(state.currentEpisode || 1))
        .map(episode => collectSceneText(episode.breakdown))
        .join(' ');
    const seriesPlanText = JSON.stringify(breakdown.seriesPlan || state.seriesPlan || '').toLowerCase();
    const sceneText = (collectSceneText(breakdown) + ' ' + previousEpisodesText + ' ' + seriesPlanText).toLowerCase();
    if (/(diterima|lulus|terpilih|resmi menjadi|accepted|selected|become)\s+.{0,30}(astronot|astronaut)/i.test(story) && !/(astronot|astronaut|space mission|space program|cosmonaut)/i.test(sceneText)) {
        throw new Error('Peristiwa wajib "diterima menjadi astronot" belum muncul di scene.');
    }
    const farewellStorySignal = /\b(?:berpamitan|mengucapkan selamat tinggal|selamat tinggal|perpisahan terakhir|saying goodbye|\bfarewell\b|\bgoodbye\b)\b/i;
    const farewellSceneSignal = /\b(?:berpamitan|pamitan|selamat tinggal|berpisah|perpisahan|farewell|goodbye|saying goodbye|melepas|perpisahan terakhir)\b/i;
    if (farewellStorySignal.test(story) && !farewellSceneSignal.test(sceneText)) {
        const note = 'Sinyal pamitan di brief belum terdeteksi di teks scene; generate tetap dilanjutkan.';
        breakdown._generationNotes = (breakdown._generationNotes || []).concat(note);
        console.warn('[Storyboard] ' + note);
    }
}

function buildStoryboardModeContract(config) {
    const mode = (config && config.storyboardMode) || 'custom';
    const profile = STORYBOARD_MODE_REGISTRY[mode] || STORYBOARD_MODE_REGISTRY.custom;
    if (isPlacePromotion(config)) return 'ACTIVE PRODUCTION MODE: ' + profile.label + '\n' + buildPlacePromotionContract(config) + '\n' + buildModeDialogueContract(config, null);
    const contracts = {
        commercial: 'COMMERCIAL MODE ONLY: Follow hook, problem/need, product solution, benefit/proof, and CTA. If there is one scene, include hook through CTA inside that scene. Do not add unrequested humor, drama, or subplot.',
        drama: buildDramaModeContract(config),
        animation: 'ANIMATION MODE ONLY: Prioritize readable visual action, expressive poses, staging, motion timing, and one consistent animation medium.',
        shortFilm: 'SHORT FILM MODE ONLY: Build setup, escalation, turning point, climax, and resolution across the selected scenes. Do not insert advertising structure unless requested.',
        education: 'EDUCATION MODE ONLY: Teach one clear subject through objective, explanation, visual example, and takeaway. Do not add unrelated dramatic or commercial beats.',
        documentary: 'DOCUMENTARY MODE ONLY: Use factual, observational, or attributed narration. Do not invent unsupported facts, quotes, events, or claims.',
        custom: 'CUSTOM MODE: Follow the user brief precisely and do not add an unrequested genre structure.'
    };
    const animationAddendum = mode === 'animation'
        ? `\nANIMATION STYLE LOCK: ${resolveAnimationStyleName(config)}. ${buildAnimationMediumContract(config, resolveAnimationStyleName(config))}\nThe director MUST understand and apply every user-specified animation style in every scene. Do not ignore, rename, or replace a user style.\nANIMATION CONTENT DETECTION: ${config.animationGenre || 'Auto Director Detection'}. If Auto, infer the dominant tone from the user's story as humor/comedy, education, drama, action, or another justified genre. The animation medium does not determine the genre.`
        : '';
    const silentAddendum = isSilentAudioMode(config)
        ? '\nSILENT AUDIO OVERRIDE: Do not require spoken dialogue, conflict-driven conversation, CTA audio, or lip-sync. Visual action and non-verbal sound design carry the scene.'
        : '';
    const miniatureAddendum = isCreativeMiniatureBuild(config)
        ? '\n' + buildCreativeMiniatureBuildContract(config)
        : '';
    return `ACTIVE PRODUCTION MODE: ${profile.label}. MODE FOCUS: ${profile.focus}\n${contracts[mode] || contracts.custom}${animationAddendum}${silentAddendum}${miniatureAddendum}\nDURATION CONTRACT: The selected duration is ${config.durationPerScene}. Scale shot timing, ${isSilentAudioMode(config) || isCreativeMiniatureBuild(config) ? 'non-verbal sound design, pauses, and visual density' : 'dialogue word count, pauses, and information density'} to fill this duration naturally.`;
}

function validateModeSpecificStoryPlan(breakdown, config) {
    const mode = String(config && config.storyboardMode || 'custom');
    const scenes = Array.isArray(breakdown && breakdown.scenes) ? breakdown.scenes : [];
    if (!scenes.length) throw new Error('Story plan tidak memiliki scene untuk divalidasi.');
    const sceneText = scenes.map(scene => [
        scene.title, scene.storyPurpose, scene.sceneBeat,
        scene.sceneVisualPlan && scene.sceneVisualPlan.sceneFunction,
        scene.sceneVisualPlan && scene.sceneVisualPlan.visualAction,
        scene.dialoguePlan && scene.dialoguePlan.dramaticObjective,
        scene.dialoguePlan && scene.dialoguePlan.sceneIntent,
        scene.continuityFromPrevious, scene.continuityToNext
    ].filter(Boolean).join(' ').toLowerCase());
    const fullText = sceneText.join(' ');
    const requiredByMode = {
        commercial: [
            ['hook', 'opening', 'attention', 'impact', 'masalah', 'problem', 'need'],
            ['product', 'produk', 'solution', 'solusi', 'benefit', 'manfaat', 'proof', 'bukti'],
            ['cta', 'call to action', 'ajak', 'undang', 'beli', 'pesan']
        ],
        drama: [
            ['objective', 'tujuan', 'want', 'ingin', 'need', 'mau'],
            ['conflict', 'konflik', 'obstacle', 'hambatan', 'tension', 'pertentangan'],
            ['turn', 'emotional', 'emosi', 'realization', 'menyadari', 'berubah'],
            ['consequence', 'konsekuensi', 'result', 'akibat', 'payoff', 'dampak']
        ],
        animation: [
            ['action', 'aksi', 'movement', 'gerak', 'motion', 'timing'],
            ['expression', 'ekspresi', 'pose', 'gesture', 'gestur'],
            ['staging', 'blocking', 'komposisi', 'ruang']
        ],
        shortFilm: [
            ['setup', 'opening', 'pengenalan', 'awal'],
            ['escalation', 'escalate', 'naik', 'pengembangan', 'tekanan'],
            ['turning point', 'turn', 'titik balik', 'climax', 'klimaks'],
            ['resolution', 'resolution', 'resolusi', 'penyelesaian', 'ending']
        ],
        education: [
            ['objective', 'tujuan', 'learning', 'belajar', 'pelajari'],
            ['explanation', 'penjelasan', 'explain', 'jelaskan', 'konsep'],
            ['example', 'contoh', 'demonstration', 'demonstrasi'],
            ['takeaway', 'kesimpulan', 'ringkasan', 'ingat']
        ],
        documentary: [
            ['fact', 'fakta', 'evidence', 'data', 'observ'],
            ['context', 'konteks', 'background', 'latar'],
            ['interview', 'wawancara', 'observation', 'observasi', 'source', 'narasumber'],
            ['conclusion', 'kesimpulan', 'dampak', 'implication']
        ]
    };
    const required = requiredByMode[mode] || [];
    const beatAudit = required.map((terms, index) => ({
        beat: index + 1,
        terms: terms,
        matched: terms.some(term => fullText.includes(term))
    }));
    // Beat labels are guidance, not a language-dependent hard gate.
    // The structural fields below are the reliable contract because the
    // director may write valid Indonesian or scene-specific descriptions.
    if (mode === 'drama') {
        const shape = detectCreativeShape(config && config.story);
        const relaxed = isSilentAudioMode(config) || isCreativeMiniatureBuild(config) || shape === 'asmr' || shape === 'comedy' || shape === 'podcast' || shape === 'monologue';
        const hasObjective = scenes.some(scene => {
            const plan = scene.dialoguePlan || {};
            return !!(plan.dramaticObjective || plan.sceneIntent || scene.storyPurpose);
        });
        const hasConflictOrTurn = scenes.some(scene => {
            const text = [
                scene.storyPurpose,
                scene.sceneBeat,
                scene.sceneVisualPlan && scene.sceneVisualPlan.sceneFunction,
                scene.dialoguePlan && scene.dialoguePlan.dramaticObjective,
                scene.dialoguePlan && scene.dialoguePlan.sceneIntent
            ].filter(Boolean).join(' ');
            return text.trim().length > 20;
        });
        if (relaxed) {
            const hasBeat = scenes.some(scene => String(scene.storyPurpose || scene.sceneBeat || '').trim().length > 12);
            if (!hasBeat) {
                throw new Error('Story plan konten kreatif belum memiliki beat visual yang cukup spesifik.');
            }
        } else if (!hasObjective || !hasConflictOrTurn) {
            throw new Error('Story plan mode drama belum memiliki tujuan dan perkembangan adegan yang cukup spesifik.');
        }
    }
    breakdown.modeBeatAudit = {
        mode: mode,
        lexicalHints: beatAudit,
        languageIndependent: true
    };
    scenes.forEach((scene, index) => {
        const plan = scene.sceneVisualPlan || {};
        const dialogue = scene.dialoguePlan || {};
        if (!scene.storyPurpose || !scene.sceneBeat || !plan.sceneFunction || !plan.visualAction) {
            throw new Error('Scene ' + (index + 1) + ' belum memiliki intent, beat, dan aksi visual yang dapat diaudit.');
        }
        const skipDialogueIntent = isSilentAudioMode(config) || isCreativeMiniatureBuild(config) || detectCreativeShape(config && config.story) === 'asmr';
        if (!skipDialogueIntent && !dialogue.dramaticObjective && !dialogue.sceneIntent) {
            throw new Error('Scene ' + (index + 1) + ' belum memiliki tujuan dialog yang terhubung ke beat visual.');
        }
    });
    return true;
}

function runStoryboardQualityGate(breakdown, config, options = {}) {
    const failures = [];
    const scenes = Array.isArray(breakdown && breakdown.scenes) ? breakdown.scenes : [];
    const expectedScenes = Number(config && config.sceneCount) || scenes.length;
    const expectedShots = Number(config && config.shotsPerScene) || 1;
    if (!breakdown || typeof breakdown !== 'object') failures.push('breakdown storyboard tidak valid');
    if (scenes.length !== expectedScenes) {
        if (scenes.length > 0) {
            breakdown._sceneCountNote = breakdown._sceneCountNote || ('jumlah scene ' + scenes.length + '/' + expectedScenes);
        } else {
            failures.push(`jumlah scene ${scenes.length}/${expectedScenes}`);
        }
    }
    if (!Array.isArray(breakdown && breakdown.hashtags) && !String(breakdown && breakdown.hashtags || '').trim()) {
        failures.push('hashtags/tagar tidak tersedia');
    }
    if (!breakdown || !breakdown.productionPlan) failures.push('productionPlan tidak tersedia');
    scenes.forEach((scene, index) => {
        const label = 'scene ' + (scene.sceneNumber || index + 1);
        if (!scene || typeof scene !== 'object') {
            failures.push(label + ' tidak valid');
            return;
        }
        if (!scene.continuityFromPrevious || !scene.continuityToNext) failures.push(label + ' kehilangan continuity transition');
        if (!Array.isArray(scene.shots) || scene.shots.length !== expectedShots) failures.push(label + ' memiliki jumlah shot tidak sesuai');
        (scene.shots || []).forEach((shot, shotIndex) => {
            if (!shot || !shot.action || !shot.camera || !shot.timecode || !Number.isFinite(Number(shot.startTime)) || !Number.isFinite(Number(shot.endTime))) {
                failures.push(label + ' shot ' + (shotIndex + 1) + ' kehilangan timecode/action/camera');
            }
        });
        if (!String(scene.masterImagePrompt || '').trim()) failures.push(label + ' tidak memiliki image prompt');
        if (!String(scene.masterVideoPrompt || '').trim()) failures.push(label + ' tidak memiliki video prompt');
        if (!scene.promptCompiler || !Array.isArray(scene.promptCompiler.blocks)) failures.push(label + ' tidak memiliki prompt compiler metadata');
        if (!isSilentAudioMode(config) && scene.dialogueEngineViolations && scene.dialogueEngineViolations.length) {
            const shape = detectCreativeShape(config && config.story);
            const blocking = (shape === 'comedy' || shape === 'asmr' || isCreativeMiniatureBuild(config))
                ? scene.dialogueEngineViolations.filter(code => code !== 'empty_dialogue')
                : scene.dialogueEngineViolations;
            if (blocking.length) {
                failures.push(label + ' masih memiliki pelanggaran dialog: ' + blocking.join(', '));
            }
        }
        if (isSilentAudioMode(config)) {
            if (String(scene.dialogueOrNarration || '').trim()) {
                failures.push(label + ' mode silent masih memiliki dialogueOrNarration');
            }
            if (promptContainsSpokenDialogue(scene.masterImagePrompt) || promptContainsSpokenDialogue(scene.masterVideoPrompt)) {
                failures.push(label + ' mode silent masih memuat spoken dialogue');
            }
        }
        if (options.requireRenderedAssets && (options.sceneIndex === undefined || options.sceneIndex === index) && !(scene.finalAssetState && scene.finalAssetState.imageDataUrl)) {
            failures.push(label + ' belum memiliki final asset image');
        }
    });
    if (failures.length) {
        const error = new Error('Quality Gate gagal: ' + failures.join('; ') + '.');
        error.code = 'QUALITY_GATE';
        throw error;
    }
    breakdown.qualityGate = {
        passed: true,
        checkedAt: new Date().toISOString(),
        sceneCount: scenes.length,
        shotsPerScene: expectedShots,
        silentAudio: isSilentAudioMode(config),
        renderedAssets: !!options.requireRenderedAssets
    };
    return true;
}

function parseGeminiJsonResponse(value) {
    if (typeof value !== 'string') return value;
    const source = value.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const start = source.search(/[\[{]/);
    if (start < 0) throw new Error('Respons Gemini tidak mengandung JSON.');
    let depth = 0;
    let quote = false;
    let escaped = false;
    for (let index = start; index < source.length; index++) {
        const char = source[index];
        if (quote) {
            if (escaped) escaped = false;
            else if (char === '\\') escaped = true;
            else if (char === '"') quote = false;
            continue;
        }
        if (char === '"') { quote = true; continue; }
        if (char === '{' || char === '[') depth++;
        else if (char === '}' || char === ']') {
            depth--;
            if (depth === 0) return JSON.parse(source.slice(start, index + 1));
        }
    }
    throw new Error('JSON respons Gemini tidak lengkap.');
}

async function invokeStoryboardTextRequest(request) {
    if (isPlacePromotion(state)) {
        request = structuredClone(request);
        request.contents = request.contents || [{ role: 'user', parts: [] }];
        request.contents[request.contents.length - 1].parts.push({ text: buildPlacePromotionContract(state) });
    }
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';
    const response = await fetchWithExponentialBackoff(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: storyboardAbortCtrl ? storyboardAbortCtrl.signal : undefined
    }, 3, 90000);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error?.message || 'Gemini text request failed: HTTP ' + response.status);
    return data;
}

async function generateStoryboardBlueprint(config) {
    config.language = resolveStoryboardLanguage(config);
    const episodeTotal = Math.min(5, Number(config.episodeCount) || 1);
    const seriesContext = episodeTotal > 1
        ? `
SERIES CONTINUITY CONTRACT: This is one continuous story divided into ${episodeTotal} episodes, not ${episodeTotal} separate stories. ${config.currentEpisode > 1 ? 'Continue from the established story and do not restart the opening, repeat the original inciting incident, or reset the characters.' : 'Design the complete story arc before dividing it into episodes.'}
Return a seriesPlan array with exactly ${episodeTotal} entries, one per episode. Each entry must contain episode, purpose, beginningState, mainDevelopment, requiredBeats, endingState, and transitionToNext. The current episode must execute only its assigned portion of this plan.
${config.currentEpisode > 1 && config.seriesPlan ? 'LOCKED SERIES PLAN FROM EPISODE 1 — USE THIS PLAN VERBATIM; do not rewrite its purposes or move its beats:\n' + JSON.stringify(config.seriesPlan) : ''}
${config.currentEpisode > 1 ? 'COMPLETED EPISODE PROGRESS — continue after this material:\n' + seriesProgressBrief() + '\n' + previousEpisodeBrief() : ''}
CURRENT EPISODE CONTRACT: Episode ${config.currentEpisode || 1} of ${episodeTotal}. Execute only its purpose, beginningState, requiredBeats, and endingState. ${Number(config.currentEpisode || 1) < episodeTotal ? 'This is NOT the final episode. Do not resolve the central conflict, do not use the final payoff, and end with an active consequence for the next episode.' : 'This is the final episode. Resolve the central conflict only now, according to the locked plan.'}`
        : '';
    const registeredNames = getRegisteredCharacterNames(config);
    const referenceParts = [
        { label: 'CHARACTER REFERENCE PHOTO — each attached photo is a different registered cast member. Reference 1 = CHARACTER_1, Reference 2 = CHARACTER_2, Reference 3 = CHARACTER_3, Reference 4 = CHARACTER_4. Preserve each identity and use these people as the story cast. If a reference is a character sheet, read any clearly visible title/name printed on the sheet (for example SILVIA) and use it as that character’s canonical registered name. Never output "unnamed" when a name is visible or supplied in the character roster. Do not guess a name that cannot be read.', refs: (config.characterReference || []).slice(0, CHARACTER_REF_MAX), characterRefs: true },
        { label: 'PRODUCT REFERENCE PHOTO — use only for product identity, never as a person.', refs: config.productReference },
        { label: 'LOCATION REFERENCE PHOTO — use only for environment and location identity.', refs: config.locationReference }
    ].reduce((parts, group) => {
        (group.refs || []).forEach((ref, index) => {
            if (!ref || !ref.dataUrl) return;
            const match = ref.dataUrl.match(/^data:(.+);base64,(.+)$/);
            if (!match) return;
            parts.push({ text: group.characterRefs
                ? group.label + ' Reference ' + (index + 1) + ' = CHARACTER_' + (index + 1) + (registeredNames[index] ? ' — registered name: ' + registeredNames[index] : '') + '.'
                : group.label + ' Reference ' + (index + 1) + '.' });
            parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
        });
        return parts;
    }, [{ text: JSON.stringify({ story: config.story, storyboardMode: config.storyboardMode, animationStyle: config.animationStyle, animationCustomStyle: config.animationCustomStyle, animationGenre: config.animationGenre, sceneCount: config.sceneCount, shotsPerScene: config.shotsPerScene, duration: config.durationPerScene, language: config.language, visualStyle: config.visualStyle, registeredCharacterNames: registeredNames }) }]);
    if (config._blueprintRepairIssue) referenceParts.push({ text: 'INTERNAL VALIDATION REPAIR: The prior candidate failed: ' + config._blueprintRepairIssue + '. Fix this issue in the replacement blueprint without changing reference identities, supplied facts, selected scene count or duration.' });
    const request = {
        systemInstruction: { parts: [{ text: `You are a senior story planner and dialogue director. Create only a compact storyboard blueprint, not image prompts and not video prompts. ${buildStoryboardModeContract(config)} ${getVoiceModeContract(config)} Return JSON only with contentGenre, socialCaption, hashtags, masterVisualIdentity, scenes${episodeTotal > 1 ? ', and seriesPlan' : ''}. Create exactly ${config.sceneCount} scenes for the CURRENT episode only. Each scene must contain sceneNumber, title, storyPurpose, locationId, timeOfDay, wardrobeBeat, sceneBeat, sceneVisualPlan, dialoguePlan, audioDirection, dialogueOrNarration, continuityFromPrevious, continuityToNext, and shots. The sceneVisualPlan must include sceneFunction and visualAction. The shots array is mandatory and must contain exactly ${config.shotsPerScene} entries. Every shot must include shotNumber, startTime, endTime, timecode, action, and camera. Write concrete timecoded actions for every shot, such as "0-3s: character reaches for the product" and "3-5s: character lifts and examines the product"; never use vague phrases like "one arresting physical event". Register every visible or narratively important character in masterVisualIdentity.characters, including every attached character reference in upload order as CHARACTER_1 through CHARACTER_4; never omit, merge, or downgrade an attached person to a background extra. For each referenced character, inspect the attached photo/character sheet and set wardrobeDefault to the exact visible outfit, including garment layers, colors, fabric/texture, accessories, footwear, and condition. If the user gives no outfit instruction, the reference outfit is the primary lock. Change it only for an explicit new day/time-skip, historical era, user outfit instruction, or a physically necessary setting requirement; a new location alone is not permission to change clothes. ${buildBlueprintSpeakerContract(config)} For animation, honor the selected animationStyle exactly and set contentGenre from the user story: when animationGenre is Auto Director Detection, classify the story as humor/comedy, education, drama, action, or another justified genre instead of assuming a generic cartoon tone. For conflict, consultation, negotiation, farewell, promo, hybrid product insert, or emotional payoff, specify the concrete visual objective and the turn-by-turn change. ${buildNaturalDialogueDirectorRules(config)} Never move the final resolution into an earlier episode or repeat an already completed episode beat. ${buildLocalDemographicLock(config)} ${seriesContext} Create socialCaption as a specific 1-3 line ready-to-post caption in ${config.language}, and hashtags as an array of 8-12 relevant hashtags. Both must describe what the user wants to sell or have people watch, not the filming location. Keep the story fresh, causal, and continuous. Do not write image prompts, locks, explanations, or markdown. Do not add output keys other than those explicitly requested above.` }] },
        contents: [{ role: 'user', parts: referenceParts }],
        generationConfig: { responseMimeType: 'application/json' }
    };
    let lastUsable = null;
    for (let attempt = 0; attempt < 2; attempt++) {
        throwIfStoryboardCancelled();
        const result = await invokeStoryboardTextRequest(request);
        const raw = (result?.candidates?.[0]?.content?.parts || []).map(part => part.text || '').join('') || result?.text || '';
        let breakdown = null;
        try {
            breakdown = normalizeStoryboardResponse(parseGeminiJsonResponse(raw));
        } catch (parseError) {
            if (attempt === 0) {
                request.contents[0].parts.push({ text: 'The previous blueprint could not be processed: ' + String(parseError.message).slice(0, 240) + '. Return a complete JSON storyboard matching the required schema and exact scene count. Preserve all original reference identities and supplied facts.' });
                continue;
            }
            if (lastUsable) return lastUsable;
            throw parseError;
        }
        const scenes = usableStoryboardScenes(breakdown);
        if (scenes.length) lastUsable = breakdown;
        try {
            validateStoryboardBreakdown(breakdown);
        } catch (validError) {
            if (scenes.length) {
                lastUsable = breakdown;
                if (attempt === 0 && scenes.length !== Number(config.sceneCount)) {
                    request.contents[0].parts.push({ text: 'Return exactly ' + config.sceneCount + ' scenes for this episode. Keep the same cast and story. Previous attempt had ' + scenes.length + ' scenes.' });
                    continue;
                }
                breakdown._generationNotes = (breakdown._generationNotes || []).concat(String(validError.message || 'validasi parsial'));
                return breakdown;
            }
            if (attempt === 0) {
                request.contents[0].parts.push({ text: 'The previous blueprint could not be processed: ' + String(validError.message).slice(0, 240) + '. Return a complete JSON storyboard matching the required schema and exact scene count. Preserve all original reference identities and supplied facts.' });
                continue;
            }
            throw validError;
        }
        if (breakdown.scenes.length !== Number(config.sceneCount)) {
            lastUsable = breakdown;
            if (attempt === 0) {
                request.contents[0].parts.push({ text: 'Return exactly ' + config.sceneCount + ' scenes for this episode. Keep the same cast and story facts. Previous attempt had ' + breakdown.scenes.length + ' scenes.' });
                continue;
            }
            breakdown._sceneCountNote = breakdown._sceneCountNote || ('Jumlah adegan ' + breakdown.scenes.length + '/' + config.sceneCount + '. Hasil tetap dipakai.');
            return breakdown;
        }
        return breakdown;
    }
    if (lastUsable) return lastUsable;
}

function normalizeStoryboardResponse(value) {
    let current = value;
    if (typeof current === 'string') {
        try {
            current = parseGeminiJsonResponse(current);
        } catch (error) {
            throw new Error('Respons blueprint storyboard bukan JSON yang dapat diproses.');
        }
    }
    if (Array.isArray(current)) return { scenes: current };
    if (!current || typeof current !== 'object') return current;
    const candidates = [
        current,
        current.storyboard,
        current.blueprint,
        current.storyPlan,
        current.storyboardBlueprint,
        current.data,
        current.result,
        current.output
    ].filter(candidate => candidate !== null && candidate !== undefined);
    for (const candidate of candidates) {
        let candidateValue = candidate;
        if (typeof candidateValue === 'string') {
            try {
                candidateValue = parseGeminiJsonResponse(candidateValue);
            } catch (error) {
                continue;
            }
        }
        if (!candidateValue || typeof candidateValue !== 'object') continue;
        let scenes = candidateValue.scenes || candidateValue.scenePlan || candidateValue.scenePlans;
        if (typeof scenes === 'string') {
            try {
                scenes = parseGeminiJsonResponse(scenes);
            } catch (error) {
                scenes = null;
            }
        }
        if (scenes && typeof scenes === 'object' && !Array.isArray(scenes)) {
            const keys = Object.keys(scenes);
            if (keys.length && keys.every(key => /^\d+$/.test(key))) {
                scenes = keys.sort((a, b) => Number(a) - Number(b)).map(key => scenes[key]);
            } else if (Array.isArray(scenes.items)) {
                scenes = scenes.items;
            } else if (keys.length && keys.every(key => /^(?:scene|adegan)[ _-]?\d+$/i.test(key))) {
                scenes = keys.sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0])).map(key => scenes[key]);
            }
        }
        if (Array.isArray(scenes)) {
            return candidateValue === current
                ? Object.assign(current, { scenes: scenes })
                : Object.assign({}, current, candidateValue, { scenes: scenes });
        }
    }
    return current;
}

async function generateScenePromptPackage(config, scene, cast) {
    const silent = isSilentAudioMode(config);
    const interactive = sceneRequestsInteractiveCast(scene, config.story) || sceneReferencesTwoCharacters(scene);
    const singleSpeaker = sceneRequiresSingleSpeaker(scene, config);
    const turnPlan = chooseDialogueTurnPlan(scene);
    const sceneIntent = buildSceneIntentContract(scene, config);
    const advertisementAudioContract = silent ? '' : buildAdvertisementAudioContract(config, scene);
    const dialogueCastLock = silent ? '' : buildDialogueCastLock(state.directorData?.masterVisualIdentity || {}, scene);
    const speakerContract = silent
        ? 'SILENT AUDIO HARD LOCK: dialogueOrNarration MUST be an empty string. No CHARACTER_N speech, VOICEOVER, NARRATOR, lip-sync, or spoken words.'
        : (singleSpeaker
            ? 'SINGLE SPEAKER HARD LOCK: only CHARACTER_1 may speak or appear as a named performer in this scene. Do not output CHARACTER_2 or any other CHARACTER_ID. Optional VOICEOVER may be used as a separate narrator.'
            : '');
    const blueprintDialogue = silent ? '' : normalizeDialogueText(scene && scene.dialogueOrNarration);
    const silentAmbienceGuide = silent
        ? buildSilentAmbienceBlock(scene, config, state.directorData && state.directorData.masterVisualIdentity)
        : '';
    const dialogueSourceLock = silent
        ? 'BLUEPRINT AUDIO LOCK: Keep dialogueOrNarration empty. masterVideoPrompt MUST contain a detailed [AUDIO / AMBIENCE & SOUND EFFECTS] block with room tone, material foley synced to visible contact, and a hard ban on speech. Do not write a generic "no dialogue" sentence. Use this bed as the minimum:\n' + silentAmbienceGuide
        : (blueprintDialogue
            ? 'BLUEPRINT DIALOGUE LOCK: The scene blueprint already contains the approved spoken script. Preserve its meaning, speaker count, sales timing, and natural wording. You may only lightly fix formatting or replace it if it violates the speaker contract, uses generic template filler, adds a forbidden CTA, or does not match the visible action.'
            : 'BLUEPRINT DIALOGUE MISSING: write the dialogue now from the scene visual action and dialoguePlan.');
    const spokenLineInstruction = silent
        ? 'Do not write spoken lines. Put the [AUDIO / AMBIENCE & SOUND EFFECTS] block at the end of masterVideoPrompt. Name the actual materials and contacts in frame (water, paper, fabric, skin, wood, glass, packaging). Sync foley to each shot action.'
        : `${interactive ? 'Use a natural number of complete turns justified by the scene dialogue plan. Two active characters should respond to each other, but do not force one line per shot and do not split a sentence because the shot changes.' : 'Use one or more short, complete spoken lines when audio is enabled. A single sentence may span the full selected duration and multiple visual shots. Do not force dialogue count to equal shot count.'} Every spoken line must be on its own line with a specific bracketed expression and a complete double-quoted sentence. For ${config.durationPerScene}, keep spoken content sized to the selected duration, never write a long explanation, and ensure the lines create a clear progression from setup/reaction to meaning/payoff. Spoken language: ${config.language}.`;
    const referenceParts = [{ text: JSON.stringify({ story: config.story, storyboardMode: config.storyboardMode, cast, registeredCharacterNames: getRegisteredCharacterNames(config), scene, styleLock: state.directorData?.masterVisualIdentity?.styleLock || buildStoryboardStyleLock(config), audioMode: config.audioMode, language: config.language, visualStyle: config.visualStyle, customStyle: config.customStyle, animationStyle: config.animationStyle, animationCustomStyle: config.animationCustomStyle, aspectRatio: config.aspectRatio, shotsPerScene: config.shotsPerScene, duration: config.durationPerScene }) }];
    (config.characterReference || []).slice(0, CHARACTER_REF_MAX).forEach((ref, index) => {
        if (!ref || !ref.dataUrl) return;
        const match = ref.dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!match) return;
        const referenceName = getCharacterReferenceName(ref, index, config);
        referenceParts.push({ text: 'CHARACTER REFERENCE PHOTO ' + (index + 1) + ' = CHARACTER_' + (index + 1) + (referenceName ? ' — registered name: ' + referenceName : '') + ' — exact identity for this registered cast member; do not substitute or merge with another character. If this is a character sheet, read a clearly visible printed title/name and use it as the canonical name; never write "unnamed" when that name is visible.' });
        referenceParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    });
    const request = {
        systemInstruction: { parts: [{ text: `You are a scene prompt director. Write prompts for exactly one storyboard scene. ${buildStoryboardModeContract(config)} STYLE LOCK: ${buildStoryboardStyleLock(config).lock} ${buildShotTimelineLock(scene, config)} ${buildProductIntegrationLock(state.directorData?.masterVisualIdentity || {}, scene, !!(config.productReference && config.productReference.length))} ${dialogueCastLock} REGISTERED NAME RULE: when a cast member has a supplied or clearly visible character-sheet name, use that exact name in CAST descriptions and never write "unnamed" or "unknown". SHOT TIMELINE HARD RULE: In masterVideoPrompt, write an explicit [SHOT TIMELINE] section listing every shot as "SHOT N — start-end seconds — concrete action — camera". Never collapse the shot sequence into a generic paragraph. Return JSON only with dialogueOrNarration, masterImagePrompt, and masterVideoPrompt. The image prompt must describe exactly ${config.shotsPerScene} panels in ${config.aspectRatio}, ${config.visualStyle} style. The video prompt must describe one continuous full-screen scene, not a storyboard grid. Every attached character reference is a separate registered cast member in upload order: Reference 1 = CHARACTER_1, Reference 2 = CHARACTER_2, Reference 3 = CHARACTER_3, Reference 4 = CHARACTER_4. Do not omit, merge, replace, or downgrade any attached character into a background extra; include each registered character when the scene logic calls for them. VIDEO OPENING HARD LOCK: for frame 0 through 1.0 seconds, output only the actual moving scene full-screen. Never show, flash, animate, transition from, or recreate the storyboard grid, contact sheet, panel layout, collage, split-screen, thumbnail sheet, or any storyboard reference image as an on-screen graphic. ${sceneIntent} ${buildLocalDemographicLock(config)} ${buildNaturalDialogueDirectorRules(config)} ${dialogueSourceLock} ${advertisementAudioContract} ${speakerContract} ${spokenLineInstruction} Keep all details consistent with the supplied cast and scene blueprint. Do not add explanations or markdown.` }] },
        contents: [{ role: 'user', parts: referenceParts }],
        generationConfig: { responseMimeType: 'application/json' }
    };
    const result = await invokeStoryboardTextRequest(request);
    const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text || result?.text || '';
    const parsed = parseGeminiJsonResponse(raw);
    if (parsed && typeof parsed === 'object') {
        if (silent) {
            parsed.dialogueOrNarration = '';
            parsed.dialogueNeedsRepair = false;
            if (parsed.masterVideoPrompt) {
                parsed.masterVideoPrompt = replaceOrAppendSilentAmbience(
                    parsed.masterVideoPrompt,
                    scene,
                    config,
                    state.directorData && state.directorData.masterVisualIdentity
                );
            }
        } else {
            if (blueprintDialogue && (!parsed.dialogueOrNarration || dialogueLooksGeneric(parsed.dialogueOrNarration))) {
                parsed.dialogueOrNarration = blueprintDialogue;
            }
            parsed.dialogueOrNarration = deduplicateDialogueLines(parsed.dialogueOrNarration);
            parsed.dialogueOrNarration = enforceDialogueCastAndLength(parsed.dialogueOrNarration, scene, config);
            const needsInteractive = sceneRequestsInteractiveCast(scene, config.story) || sceneReferencesTwoCharacters(scene) || sceneHasTwoActiveSpeakers(scene);
            const normalized = prepareInteractiveDialogueCandidate(parsed.dialogueOrNarration, scene, config, {
                characters: cast
            });
            parsed.dialogueOrNarration = normalized || parsed.dialogueOrNarration;
            if ((needsInteractive && !hasValidInteractiveDialogue(parsed.dialogueOrNarration, scene, config, true)) || !String(parsed.dialogueOrNarration || '').trim()) {
                parsed.dialogueNeedsRepair = true;
            }
        }
    }
    return parsed;
}

async function generateGeminiDirectorBreakdown(config) {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';
    const visualStyleSetting = config.visualStyle === 'Custom Style' ? config.customStyle : config.visualStyle;
    const resolvedVisualStyle = config.storyboardMode === 'animation'
        ? resolveAnimationStyleName(config)
        : (visualStyleSetting === 'Auto' ? 'Realistic Photography' : visualStyleSetting);
    const animationMediumContract = buildAnimationMediumContract(config, resolvedVisualStyle);
    // V5.0 (Isu #2): universal NO-TEXT default. Even when not in
    // "Auto Caption Overlay" mode, the AI Director must NEVER add
    // visible text, logos, watermarks, phone numbers, social media
    // handles, or CTA graphics to any panel. The overlay mode now
    // requires an explicit opt-in flag (visualStyleExplicitOverlay)
    // so a stale setting cannot silently re-enable text output.
    const overlayEnabled = config.visualStyle === 'Auto Caption Overlay' && config.visualStyleExplicitOverlay === true;
    const storyboardTextRule = overlayEnabled
        ? 'OPT-IN OVERLAY MODE: include intentional cinematic overlay text directly in panels (readable ' + config.language + ' captions, icons, callouts). This is the ONLY situation where visible marketing text is allowed. NEVER add any phone number, WhatsApp contact, social media handle (@username), email, URL, QR code, brand logo, watermark, or third-party brand mark anywhere in any panel — even in overlay mode.'
        : 'ABSOLUTE NO-TEXT RULE (default, no opt-in): every panel must be visually clean. ZERO visible text inside the image — no captions, no subtitles, no logos, no watermarks, no titles, no UI text, no CTA text, no badges, no stickers, no shopping cart icons, no price tags, no buttons, no QR codes, no URLs, no @handles, no WhatsApp numbers, no phone numbers, no email, no social media handles, no fake UI mockups, no camera shot labels (MS/CU/OTS/ECU/WS), no random letters, no hex codes, no CSS color names, no prompt fragments, no file names, no gibberish. The ONLY permitted text inside the image is the tiny per-panel number 1-N placed exactly once in a corner of each panel.';

    const budget = spokenWordBudget(config.durationPerScene);
    const silentMode = isSilentAudioMode(config);
    const voOnly = /Voice-Over Narrator/i.test(config.audioMode || '') && !/Character/i.test(config.audioMode || '');
    const characterOnly = /Character Dialogue \/ Lip-Sync/i.test(config.audioMode || '');
    const characterNarrator = /Character \+ Narrator/i.test(config.audioMode || '');
    const autoDirector = /Auto Director/i.test(config.audioMode || '');
    const dialogRules = silentMode ? `
DIALOGUE RULE: Audio mode is silent. dialogueOrNarration MUST be empty. No spoken lines.` : voOnly ? `
DIALOGUE RULE: Voice-over narrator only. One narrator voice, frozen. Target ${budget.minWords}-${budget.maxWords} words total for this ${config.durationPerScene} scene across ${budget.minLines}-${budget.maxLines} short lines. Do not output only one tiny sentence for 8s/10s scenes unless the user explicitly asks for silence. No two-character argument unless the user asked.` : `
${autoDirector ? `AUTO DIRECTOR AUDIO — ADAPTIVE STORYTELLING:
- You are the audio director, not a voice-over-only generator. Choose per scene whether the audio uses character dialogue, voice-over, or both.
- Use CHARACTER dialogue when a character is visibly interacting, demonstrating/using the product, reacting to another person, or when lip-sync adds intimacy and persuasion.
- Use VOICEOVER for internal thoughts, a letter being read, a memory, an opening context, invisible exposition, or a cinematic bridge between scenes.
- Combine them when narration establishes meaning and a character response or CTA creates payoff. In an advertisement, a natural character CTA is preferred in the final scene when a character is present; do not force voice-over.
- Do not repeat the same audio pattern in every scene. Make the choice serve the scene beat, visual action, and user story.
- Every non-silent scene MUST contain an actual [AUDIO / DIALOGUE] block with spoken lines, not a description of audio and not only the words "CTA" or "closing action".
- Label each line exactly as VOICEOVER, CHARACTER_ID, or SOUND DESIGN. Keep spoken words in ${config.language}.
- Target ${budget.minWords}-${budget.maxWords} spoken words in 2-3 short playable lines for ${config.durationPerScene}, never more than 3 character turns; do not fill every scene with narration by default.
` : characterOnly ? `CHARACTER DIALOGUE ONLY — HARD RULE:
- Use only spoken lines from visible CHARACTER_ID speakers with lip-sync. No narrator, voice-over, internal monologue, or invisible announcer.
- Every non-silent scene MUST contain an actual [AUDIO / DIALOGUE] block with CHARACTER_ID lines.
` : characterNarrator ? `CHARACTER + NARRATOR MODE:
- Character dialogue and voice-over are both allowed. Use each only when it serves the scene; do not default to voice-over.
- Every non-silent scene MUST contain an actual [AUDIO / DIALOGUE] block and may contain both VOICEOVER and CHARACTER_ID lines.
` : `ATURAN DIALOG — WAJIB:
- Setiap scene dengan audio harus terasa hidup sesuai durasi ${config.durationPerScene}: TARGET ${budget.minWords}-${budget.maxWords} kata total, ${budget.minLines}-${budget.maxLines} baris pendek. Jangan biarkan adegan 8s/10s hanya punya satu kalimat kecil.
- Adegan EMOSIONAL PERSONAL (ayah-anak, reuni, perpisahan, monolog dalam, momen emosional, syukur, sedih, lega): MINIMAL ${Math.max(3, budget.minLines)} turn/baris. Boleh 2 karakter saling balas ATAU 1 karakter dengan voiceover narasi (internal thoughts, perasaan, kilas balik singkat). TIDAK BOLEH cuma 1 baris untuk scene 8s+ kecuali user meminta sunyi.
- Jika adegan melibatkan 2 orang atau lebih yang BERINTERAKSI (pertengkaran, tawar-menawar, jual beli, tanya-jawab, negosiasi, ramah tamah): WAJIB dialog DUA ARAH. Minimal ${Math.max(3, budget.minLines)} giliran, 2 pembicara berbeda (CHARACTER_1 lalu CHARACTER_2). Dilarang monolog satu orang.
- Format [AUDIO / DIALOGUE]:
  CHARACTER_1: "kalimat pendek yang natural"
  CHARACTER_2: "balasan pendek yang menggerakkan emosi/aksi"
- RITME AMAN GOOGLE FLOW: Tiap baris 5–12 kata. Total jangan melewati ${budget.maxWords} kata dan jangan lebih dari ${budget.maxLines} baris. Bukan ceramah, tapi cukup panjang untuk mengisi ${config.durationPerScene}.
- Untuk jual beli: satu line membuka kebutuhan/penawaran, line berikutnya memberi syarat/keberatan, line terakhir mengubah keputusan.
- Untuk emosional personal: satu line menyebut tindakan/kenangan konkret yang terlihat, line berikutnya merespons perasaan, line terakhir mengubah jarak emosional.
- Untuk ribut: satu line menuduh/menuntut hal spesifik, line berikutnya menolak/menjelaskan, line terakhir menaikkan konsekuensi.
- Lip-sync dan eyeline mengikuti giliran bicara. Karakter saling berhadapan saat dialog.
- Bahasa spoken: ${config.language}. Suara tiap CHARACTER_ID BEKU di semua scene/episode.
- Jika hanya satu orang di frame dan tidak ada lawan bicara: gunakan ${budget.minLines}-${budget.maxLines} baris spoken content yang sesuai mode, bukan satu kalimat pendek.`}`;

    const interactionDialogRule = storyRequestsInteractiveCast(config.story) ? `
INTERACTIVE CAST CONTRACT — The user's story explicitly describes two or more people interacting. Register every attached character reference in upload order, show the active participants as meaningful performers, and use exactly 2 or 3 alternating spoken turns based on each scene's dialoguePlan, never more than 3. The [AUDIO / DIALOGUE] block must include at least two active CHARACTER_ID speakers and must never be a CHARACTER_1 monologue or be replaced by VOICEOVER.` : '';

    const gridInstruction = storyboardGridLock(config.shotsPerScene, config.aspectRatio, storyboardTextRule);

    const genreHint = detectGenre(config.story, !!(config.productReference && config.productReference.length));
    const commercialMode = directorCommercialMode(config.story);
    const overlayLock = buildAutoCaptionOverlayLock(config);
    const simpleCommercialBrief = isSimpleCommercialBrief(config.story);
    const productOnlyBrief = isProductOnlyCommercialBrief(config.story, config);
    const modelRequested = explicitModelRequest(config.story) || !!(config.characterReference && config.characterReference.length);
    const storyIntentContract = buildStoryIntentContract(config.story);
    const relationshipRule = storyRequestsRelationship(config.story, 'wife')
        ? 'RELATIONSHIP CAST LOCK — CHARACTER_1 is the husband/lead and CHARACTER_2 is his wife. CHARACTER_2 MUST be visibly female, an adult woman, and the spouse in every scene where this relationship appears. Never render CHARACTER_2 as male, a generic man, or an unrelated person.'
        : storyRequestsRelationship(config.story, 'mother')
            ? 'RELATIONSHIP CAST LOCK — CHARACTER_1 is the child and CHARACTER_2 is the mother. CHARACTER_2 MUST be visibly female, an adult woman, and the parent in every scene where this relationship appears. Never render CHARACTER_2 as male, a generic man, or an unrelated person.'
            : '';
    const hookPlanRule = `COMMERCIAL HOOK PLAN — MANDATORY DECISION: Before writing scenes, choose exactly one hookType and one concrete visualAction for the first 0-3 seconds. The action must be visibly readable in Scene 1 Panel 1 / Shot 1, connected to the product, and different from a static beauty shot. Do not list multiple alternatives. Record it in hookPlan.`;
    const directorDecision = productOnlyBrief
        ? `DIRECTOR DECISION — PRODUCT-ONLY COMMERCIAL DEFAULT:
The user gave a short commercial brief without requesting a person or model. Build a premium product-led advertisement with the hero product as the only visual subject. Do not invent a model, actor, customer, friend, dialogue partner, named character, face, or unrelated subplot. Expand creativity through product choreography, macro detail, camera, lighting, environment, motion, sound design, typography, and a natural CTA. masterVisualIdentity.characters MUST be an empty array.`
        : modelRequested
            ? `DIRECTOR DECISION — EXPLICIT MODEL REQUEST:
The user explicitly requested a model/character or supplied a character reference. Create or use exactly one lead character (CHARACTER_1) unless the user explicitly requests more. Freeze the character's face, hair, age, body, wardrobe anchors, and voice across every scene. Do not invent supporting characters or subplot. Build the advertisement around the product and the locked lead character.`
            : simpleCommercialBrief
                ? `DIRECTOR DECISION — SIMPLE COMMERCIAL BRIEF:
The user gave a short commercial brief without requesting multiple people. Choose one lead character only, one hero product, one coherent use scenario, and one strong location. Do not invent supporting characters, customers, friends, dialogue partners, unrelated conflict, or subplot. Expand creativity through concept, hook, blocking, camera, lighting, rhythm, product demonstration, and sound design. Structure the ad as hook -> product use -> benefit proof -> natural CTA. Auto Director may use opening voice-over, character dialogue during product use, and a character CTA at the end when visually appropriate.`
        : 'DIRECTOR DECISION — EXPAND WITH DISCIPLINE: infer the strongest concept from the brief, but add characters or subplots only when explicitly requested or essential to the stated story.';
    const longStoryboardMode = isLongStoryboard(config);
    const longStoryboardInstruction = longStoryboardMode ? `
LONG STORYBOARD DISCIPLINE MODE — AKTIF:
- Karena storyboard berisi ${config.sceneCount} adegan x ${config.shotsPerScene} shot, kamu WAJIB berpikir bertahap: DIRECTOR BIBLE -> SCENE SPINE -> PER-SCENE PROMPT.
- Sebelum menulis detail panel, tetapkan satu STORY SPINE internal: scene 1 sampai scene ${config.sceneCount} masing-masing hanya punya satu fungsi naratif. Jangan membuat scene belakang seperti cerita baru.
- Scene 1 = hook/establishing. Scene tengah = escalation/proof/konflik/turn. Scene terakhir = payoff cerita atau CTA hanya jika contentGenre advertisement.
- Batasi karakter utama pada cast yang tercatat di masterVisualIdentity.characters. Jangan menambah pemeran penting di scene 4/5/6 kecuali user eksplisit meminta. Background extras harus non-speaking dan tidak menjadi karakter baru.
- Batasi lokasi: gunakan locationId yang masuk akal dari cerita. Untuk cerita sederhana, maksimal 1-2 lokasi utama kecuali user jelas meminta perjalanan/pindah tempat.
- Jangan tiba-tiba mengganti negara, profesi, genre, usia, style visual, jenis produk, relationship, konflik utama, atau kota hanya agar adegan banyak terasa penuh.
- Setiap scene wajib punya storyPurpose singkat secara implisit di title/masterPrompt: hook, escalation, reveal, proof, emotional turn, atau payoff. Tidak boleh filler.
- Panel/shot dalam satu scene harus memperdalam scene itu, bukan melompat ke adegan lain.` : '';
    const systemPrompt = `
TRENDORA AI V4.0 SACRED DIRECTOR ENGINE.
Anda adalah TRENDORA senior, script doctor, creative director iklan, editor rhythm, dan penjaga continuity dalam satu kepala. Anda tidak mengisi template. Anda membaca maksud tersembunyi user, lalu membuat treatment yang terasa seperti dipikirkan manusia berpengalaman.

SACRED FLOW — URUTAN BERPIKIR WAJIB, JANGAN DIBALIK:
1. USER MIND READING: tangkap niat utama user, emosi yang tersirat, produk/objek yang diselipkan, genre alami, target penonton, dan alasan video ini menarik ditonton. Jika user menulis cerita tapi menyelipkan iklan/produk, jangan paksa jadi iklan polos. Jadikan produk bagian organik dari cerita.
2. CREATIVE TREATMENT FIRST: sebelum memikirkan grid, tentukan hook, konflik kecil, visual motif, rhythm, reveal, payoff, ending, dan CTA hanya untuk 100% iklan. Untuk komedi, bangun setup-payoff. Untuk 100% iklan, buat extreme visual hook dan CTA akhir yang terasa fresh. Untuk hybrid, cerita tetap menjadi tulang punggung, produk hanya diselipkan natural di tengah, dan CTA akhir dilarang.
3. CONTINUITY BIBLE SECOND: setelah treatment matang, kunci karakter, jumlah cast, outfit, produk, lokasi, suara, dan scale. Jangan biarkan kreativitas merusak identitas.
4. PRODUCTION RENDER LAST: baru setelah itu tulis scene, panel, image prompt, dan video prompt. Grid adalah wadah produksi, bukan otak kreatif.

OUTPUT TONE:
- Human, specific, cinematic, surprising but grounded.
- No generic ad formula. No stock-template "problem-solution-CTA" unless it truly fits.
- Every scene must have a reason to exist: hook, escalation, proof, twist, emotion, or payoff.
- If the prompt is odd or absurd, lean into the absurdity with taste. Jangan menormalkan ide nyeleneh menjadi iklan hambar.

ANDA ADALAH TRENDORA AI SENIOR — dewasa, tenang, genius. Bukan generator template.
Setiap keputusan kamera, lighting, blocking, audio, dan ending HARUS terasa sengaja dan earned. Dilarang output generik.
DIRECTOR INTELLIGENCE — WAJIB:
1. BACA NIAT: pahami apa yang user benar-benar mau, meski input hanya 1 kalimat.
2. KLASIFIKASI GENRE SENDIRI: hint sistem hanya petunjuk awal (${genreHint}). Kamu wajib menilai ulang dari niat cerita. Pilih: advertisement, horror, dramatic, comedy, educational, action, documentary, hybrid (cerita+iklan), atau neutral. Jika cerita DAN iklan/produk sama-sama ada, pilih hybrid hanya jika niat komersialnya eksplisit. Product reference hanya mengunci bentuk/identitas objek; itu TIDAK otomatis berarti iklan.
2B. COMMERCIAL INTENT GATE: status niat komersial sistem adalah "${commercialMode}". Jika status "story-only", jangan memilih advertisement atau hybrid, jangan membuat CTA, jangan membuat hard-sell, dan perlakukan aktivitas seperti menjual, memasak, bekerja, berdagang, atau menggunakan produk sebagai bagian dari cerita. Jika status "explicit", iklan atau hybrid boleh dipilih sesuai konteks.
3. KEMBANGKAN INPUT SEDERHANA: lengkapi karakter, wardrobe per beat, lokasi, waktu, lighting, kamera, sound, dan busur emosi — TANPA mengubah niat inti dan TANPA mengarang klaim produk/fakta yang tidak ada di brief. Wajah/identitas pemain BEKU; wardrobe dan setting BOLEH dikembangkan jika cerita pindah hari atau tempat.
4. EKSEKUSI SESUAI GENRE FINAL: seluruh storyboard menyesuaikan genre itu, bukan formula satu-untuk-semua.
5. Tulis "contentGenre" di JSON sesuai keputusan finalmu.
5B. GENRE SALES LAW: Jika contentGenre="advertisement", scene 1 panel 1 wajib EXTREME VISUAL HOOK yang tidak monoton dan scene terakhir wajib CTA. Jika contentGenre="hybrid", fokus cerita, sisipkan produk/penjualan hanya di tengah cerita secara natural, dan DILARANG CTA di scene terakhir.
${longStoryboardInstruction}
${overlayLock}
${directorDecision}
${hookPlanRule}
${storyIntentContract}
${relationshipRule}
SCENE VISUAL VARIETY: Beri setiap scene satu sceneVisualPlan yang berbeda fungsi, aksi utama, dan strategi kamera. Pertahankan produk, karakter, dan dunia tetap konsisten, tetapi jangan mengulang komposisi, pose, ukuran shot, atau product placement dari scene sebelumnya.
6. CONTINUITY BIBLE: isi characters (identity beku + faceLock + hairLock + skinLock + bodyLock + distinguishingFeatures + voice unik + wardrobeDefault + wardrobeByBeat + color/wardrobe anchor), locations (locationId + lock + backgroundAnchor), product (look + shapeLock + colorMaterialLock + labelLogoLock + detailLock + realWorldSize + scaleVsBody + referenceLock), continuityBible, dan tiap scene wajib locationId, timeOfDay, wardrobeBeat.
6B. CAST COUNT LOCK: jika user menyebut jumlah karakter/orang/anak/nenek/kakek/lansia/pria/wanita/model/talent tertentu, buat tepat jumlah itu di masterVisualIdentity.characters. Contoh "3 nenek" = CHARACTER_1 sampai CHARACTER_3, semuanya nenek/lansia perempuan yang konsisten sampai cerita eksplisit menyebut time-skip/masa depan.
6B2. CAST FORENSIC LOCK: jika user menyebut 4 pemeran, buat CHARACTER_1 sampai CHARACTER_4. Setiap karakter wajib punya faceLock, hairLock, skinLock, bodyLock, distinguishingFeatures, wardrobeDefault, dan voice yang berbeda. Jangan ada karakter bernama/terlihat penting tanpa CHARACTER_ID.
6B3. SUPPORTING CAST EQUAL PRIORITY: CHARACTER_2, CHARACTER_3, dan seterusnya TIDAK BOLEH dianggap figuran generik. Mereka harus terkunci sama ketatnya dengan CHARACTER_1: usia, wajah, rambut, kulit, bentuk tubuh, postur, outfit beat, dan suara tetap sama di semua scene/panel.
6B4. LOCAL DEMOGRAPHIC DEFAULT: Untuk konteks Bahasa Indonesia / default Indonesian, supporting cast WAJIB mengikuti demografi lokal Indonesia (kulit sawo matang hingga coklat gelap, rambut hitam/coklat gelap, mata coklat gelap) kecuali user secara eksplisit meminta demografi lain (mis. "orang bule", "Caucasian", "asing", nama negara/ethnic spesifik). Dilarang CHARACTER_N utama / terlihat penting tampak Caucasian / bule / foreign-looking tanpa permintaan user. Background extras boleh faceless/blur; jika wajahnya terlihat, harus konsisten dengan setting lokal.
6C. AGE TIMELINE: karakter boleh tumbuh dewasa HANYA jika alur menyebut masa depan/time-skip/tahun kemudian/dewasa. Jika begitu, adult version tetap harus terlihat sebagai orang yang sama (struktur wajah, kulit/rambut, postur, role). Jika tidak ada time-skip, usia tidak boleh berubah.
7. SERIES: Kerjakan HANYA episode ${(Number(config.currentEpisode) || 1)} dari ${Math.min(5, Number(config.episodeCount) || 1)}. Jangan tulis episode lain di JSON ini. Episode ini harus terasa lengkap dan WOW, lalu menyambung serial jika masih ada part berikutnya.
8. DIALOG: Pertengkaran, jual-beli, tawar-menawar, tanya-jawab = dialog DUA ARAH, pendek, tidak terpotong. Suara tiap karakter BEKU di semua scene/episode.
8B. AUDIO PERFORMANCE: Untuk setiap scene ber-audio, isi audioDirection dengan sceneEmotion, intensity 1-10, pacing, soundTexture, dan performanceNotes. Tulis arahan delivery per pembicara di [AUDIO / DIALOGUE] dengan format [specific expression] CHARACTER_N: "...": pitch, volume, tempo, stress, pause, breath, facial expression, eye focus, posture, dan gesture. Setiap giliran wajib memiliki ekspresi spesifik yang kaya dan sesuai niat karakter; jangan gunakan delivery atau ekspresi flat/default jika emosi scene berubah.
8C. DIALOGUE TURN FORMAT: Jika ada dua atau lebih karakter yang berinteraksi, dialogueOrNarration dan blok [AUDIO / DIALOGUE] WAJIB memakai satu baris per giliran dengan label pembicara yang jelas: CHARACTER_1: "..." lalu CHARACTER_2: "...". Jangan menggabungkan seluruh percakapan menjadi satu paragraf. Jangan menulis header [AUDIO / DIALOGUE] lebih dari sekali.
8D. DIALOGUE PLAN FIRST: sebelum menulis dialogueOrNarration, buat dialoguePlan untuk setiap scene dengan mode, participants, dramaticObjective, trigger, turnPattern, tone, dan forbidden. dialoguePlan harus berasal dari aksi visual, hubungan karakter, dan perubahan emosi scene yang sama. Setiap baris dialog wajib merespons baris/aksi sebelumnya, membawa niat karakter, dan mengubah atau memperjelas keadaan scene. Dilarang mengisi dialog dengan kalimat generik, ringkasan prompt, atau monolog jika dua peserta terlihat dan berinteraksi.
8E. AUDIO MUST MATCH PICTURE: Tulis dialog setelah menentukan aksi visual scene. Sebut atau respons hanya pada objek, tempat, tindakan, hubungan, dan emosi yang benar-benar ada di scene ini. Jangan membawa dialog, voice-over, CTA, konflik, atau informasi dari scene lain. Jika dialog tidak dapat dijelaskan oleh visual anchor scene ini, tulis ulang dialognya.
9. SOCIAL PACK — BUKAN TEMPLATE, WAJIB SESUAI YANG DIJUAL:
Tentukan SUBJEK POSTINGAN dulu: apa yang user ingin orang beli / tonton. Caption dan hashtag HANYA tentang subjek itu.
- Jika iklan produk atau jasa: subjek = produk/jasa/offer yang diminta user. Jangan sebut lokasi syuting, set, studio, kamar, atau properti pendukung kecuali ITU yang dijual.
- Caption harus menjual atau mengajak menonton subjek utama, bukan mempromosikan latar visual yang kebetulan muncul.
- socialCaption: 1-3 baris, bahasa ${config.language}, spesifik, terdengar kreator pintar, sebut nama produk jika ada. Dilarang rumus "Upgrade X lo. Y: empuknya gak masuk akal". Dilarang klaim yang tidak ada di brief.
- hashtags: 8-12 tag search-intent untuk produk/konten itu. Dilarang tag set/lokasi syuting (#GamingSetup #TechLifestyle) jika bukan itu yang dijual.
LANGUAGE RULE — KETAT:
- Semua visual direction, camera work, lighting, editing, sound design, overlay design → WAJIB dalam Bahasa Inggris.
- Hanya dialogue, voice-over narration, dan quoted on-screen text → gunakan ${config.language}.
- JANGAN pernah menerjemahkan seluruh visual prompt ke ${config.language}.
VISUAL STYLE LOCK — MUTLAK:
Gaya visual yang dipilih: "${resolvedVisualStyle}".
- Terapkan secara IDENTIK ke setiap scene, shot, panel, image prompt, dan video prompt.
- ${animationMediumContract}
- Jika Realistic Photography: photorealistic anatomy, skin texture, optics, lens behavior, lighting physics.
- Jika animation: pertahankan medium animasi yang sama persis — linework, shading, texture, proporsi, motion language, termasuk background dan environment.
- JANGAN pernah mencampur realistic, anime, 3D CGI, illustration, atau rendering language berbeda dalam satu video.
STYLE HARD GATE: Jika style adalah Auto/Realistic Photography/Cinematic, SEMUA panel wajib photorealistic/cinematic. DILARANG total: cartoon, comic, manga, anime, cel-shading, vector art, 2D illustration, painterly, watercolor, paper cutout, line-art, mixed media.
ATURAN JUMLAH KETAT: Field "scenes" WAJIB berisi tepat ${config.sceneCount} adegan, masing-masing mencakup presisi ${config.shotsPerScene} shot sesuai layout grid di bawah. Tidak boleh kurang, tidak boleh lebih.
JSON SCHEMA — WAJIB DIIKUTI PERSIS:
{
  "contentGenre": "advertisement",
    "hookPlan": { "hookType": "...", "visualAction": "...", "timing": "0-3 seconds, Scene 1 Panel 1 / Shot 1", "audienceEffect": "...", "productRole": "...", "safetyNote": "..." },
  "directorIntent": {
    "userMindReading": "Apa sebenarnya maksud user, termasuk motif cerita/iklan tersembunyi",
    "creativeTreatment": "Hook, konflik, rhythm, visual motif, payoff, CTA/punchline jika relevan",
    "whyThisWillWork": "Alasan keputusan TRENDORA terasa kuat untuk penonton"
  },
  "socialCaption": "1-3 baris caption siap posting",
  "hashtags": ["#tag1", "#tag2"],
  "masterVisualIdentity": {
    "characters": [{ "characterId": "CHARACTER_1", "role": "lead", "identity": "Wajah, struktur wajah, age stage/usia timeline, warna kulit, rambut, mata, bentuk tubuh, postur, ciri khas — BEKU", "faceLock": "Bentuk wajah, mata, hidung, mulut, rahang, ekspresi khas — BEKU", "hairLock": "Panjang rambut, garis rambut, tekstur, warna, gaya ikat/urai — BEKU", "skinLock": "Warna kulit dan complexion — BEKU", "bodyLock": "Tinggi, bentuk tubuh, postur, siluet gerak — BEKU", "distinguishingFeatures": "Ciri pembeda spesifik agar tidak tertukar karakter lain", "referenceLock": "Jika dari foto referensi: wajah, tubuh, rambut, kulit, dan outfit terlihat mengikuti foto", "voice": "Identitas suara unik: gender/usia/pitch/accent/timbre/speaking style — BEKU", "wardrobeDefault": "Outfit default + color anchor spesifik", "wardrobeByBeat": [{ "beat": "bedroom-night", "wardrobe": "Piyama spesifik", "changeReason": "establish first wardrobe beat" }] }],
    "locations": [{ "locationId": "LOC_BEDROOM", "name": "Bedroom", "lock": "Arsitektur, furnitur, dinding, jendela, lampu — identitas ruangan yang dikunci", "backgroundAnchor": "Elemen background yang wajib sama saat locationId ini muncul lagi" }],
    "continuityBible": { "castBible": ["CHARACTER_1; face=...; hair=...; skin=...; body=...; wardrobe=..."], "wardrobeBible": ["CHARACTER_1; beat=bedroom-night; wardrobe=...; reason=..."], "locationBible": ["LOC_BEDROOM; sofa kiri; jendela belakang; lampu meja kanan"] },
    "character": "Ringkasan identitas beku seluruh pemain",
    "wardrobe": "Ringkasan wardrobe default",
    "location": "Ringkasan dunia/lokasi",
    "product": { "name": "Nama produk", "look": "Warna, material, bentuk, branding — BEKU", "shapeLock": "Siluet, proporsi, ketebalan, cap/strap/sole/package shape — BEKU", "colorMaterialLock": "Warna utama, aksen, material, tekstur, finish — BEKU", "labelLogoLock": "Posisi label/logo/marking dan proporsi branding — BEKU", "detailLock": "Detail pembeda kecil yang wajib sama di semua panel", "realWorldSize": "Ukuran nyata, mis. sendal dewasa ~26cm, tebal sol 3cm", "scaleVsBody": "Vs tangan dewasa: memenuhi telapak. Vs kepala: jauh lebih kecil. Vs kaki: ukuran footwear asli.", "referenceLock": "Jika ada product ref: attached photo adalah master design plate dan scale plate" },
    "objectProduct": "Ringkasan produk untuk UI",
    "lighting": "Bahasa cahaya default",
    "visualStyle": "${resolvedVisualStyle}"
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Judul Adegan",
      "storyPurpose": "Fungsi adegan dalam spine: hook / escalation / reveal / product insert / payoff / CTA only if advertisement",
      "locationId": "LOC_BEDROOM",
      "timeOfDay": "night",
      "wardrobeBeat": "bedroom-night",
    "sceneVisualPlan": { "sceneFunction": "...", "visualAction": "...", "cameraStrategy": "...", "avoidRepeating": "..." },
"dialoguePlan": { "mode": "...", "participants": ["CHARACTER_1", "CHARACTER_2"], "dramaticObjective": "...", "visualAnchor": "...", "relationship": "...", "trigger": "...", "linePurpose": "...", "turnPattern": "...", "tone": "...", "forbidden": "..." },
    "audioDirection": { "sceneEmotion": "...", "intensity": 1, "pacing": "...", "soundTexture": "...", "performanceNotes": "..." },
    "overlayDesign": { "headline": "...", "supportingText": "...", "benefitBullets": ["..."], "callouts": ["..."], "iconography": "...", "colorSystem": "...", "typography": "...", "textPlacement": "...", "animation": "...", "timing": "..." },
      "masterImagePrompt": "...",
      "masterVideoPrompt": "...",
    "dialogueOrNarration": "CHARACTER_1: \"...\"\\nCHARACTER_2: \"...\" (one labeled line per turn; use VOICEOVER only for narration)"
    }
  ]
}
CONTINUITY BIBLE — WAJIB (FRESH + KONSISTEN):
A. IDENTITY BEKU: wajah, tubuh, kulit, rambut, age stage, wardrobe/color anchor, dan ciri khas CHARACTER_N identik di semua scene. Dilarang parafrase identitas. Dilarang menambah/menghapus pemain bernama. Extra: wajah tidak menonjol, jangan jadi karakter baru.
A1. FORENSIC CHARACTER LOCK: Setiap CHARACTER_N wajib ditulis sebagai bukti visual berulang: faceLock, hairLock, skinLock, bodyLock, distinguishingFeatures. CHARACTER_2 tidak boleh berubah tipe rambut, panjang rambut, bentuk wajah, atau usia. CHARACTER_3, CHARACTER_4, dst mengikuti aturan yang sama.
A2. AGE PROGRESSION: jika cerita meminta masa depan/tahun kemudian/anak tumbuh besar, buat versi dewasa yang tetap jelas turunan karakter yang sama. Jika scene bukan future/time-skip, jangan ubah anak menjadi remaja/dewasa atau dewasa menjadi usia lain.
A3. AUDIO PERFORMANCE: setiap karakter berbicara dengan emosi, ritme, dan intensitas yang sesuai perkembangan adegan. Jangan menulis nama preset TTS, voice ID, atau instruksi penguncian suara di naskah dialog.
B. WARDROBE PER BEAT: outfit dikunci per wardrobeBeat (lokasi + waktu). Ganti HANYA jika cerita memaksa: ganti hari, ganti tempat, tidur, kerja, hujan. Contoh: malam di kamar = piyama; keesokan hari ke pasar = outfit luar, BUKAN piyama. Dalam SATU beat, wardrobe identik kata-per-kata. Jangan pakai outfit yang sama seumur film jika beat sudah berganti.
C. LOKASI PER ADEGAN: tiap scene punya locationId. Selama scene di LOC_MARKET, background WAJIB pasar yang sama (arsitektur, stall, cahaya, keramaian). Dilarang teleport. Pindah hanya dengan transisi yang dijelaskan (keluar rumah, jalan, sampai pasar). Setelah pindah, kunci lokasi baru sampai pindah lagi.
C2. SCENE ISOLATION: tiap scene adalah target visual tunggal. Jangan pernah memasukkan lokasi/properti/wardrobe/aktivitas scene lain ke scene sekarang. Jika scene sekarang ruang tamu, jangan tampilkan gym/barbell/sportwear kecuali scene sekarang eksplisit meminta gym.
D. KAMERA FRESH: DILARANG semua shot full-body. Variasikan ECU, CU, MCU, MS, OTS, insert tangan/objek, low/high angle. Shot berikutnya wajib ganti ukuran atau angle. Ulangi framing hanya jika ada alasan.
E. PRODUCT SCALE — BEKU: Jika ada produk, kunci desain DAN ukuran nyata di semua panel. Close-up boleh memenuhi frame, tapi jika tangan/wajah/tubuh terlihat, rasio produk:tubuh WAJIB sama. Dilarang sendal sebesar kepala di portrait. Dilarang barang mengecil di wide shot. Cantumkan realWorldSize dan scaleVsBody di setiap image/video prompt. Jika ada product reference photo, itu acuan desain dan skala.
F. GENRE IKLAN VS HYBRID:
- 100% IKLAN: wajib extreme visual hook di scene 1 panel 1/detik 1-3. Jangan monoton; jangan selalu memakai perangkat yang sama. TRENDORA boleh menciptakan hook lain yang lebih relevan daripada contoh. Wajib CTA di scene terakhir.
- HYBRID CERITA+IKLAN: cerita menang. Sisipkan produk/promo hanya di tengah cerita lewat dialog/aksi pendek dan natural. Scene terakhir DILARANG CTA; ending harus payoff cerita.
ATURAN WAJIB UNTUK MASTER IMAGE PROMPT:
1. Cantumkan semua CHARACTER_ID yang muncul dengan identity + faceLock + hairLock + skinLock + bodyLock + outfit lock untuk wardrobeBeat + locationId. Dilarang shortcut "same character / same wardrobe / unchanged".
2. Rincikan visual HANYA untuk ${config.shotsPerScene} panel: PANEL 1–PANEL ${config.shotsPerScene}. Dilarang menulis PANEL lebih dari itu.
3. Scene N+1 wajib CONTINUITY naratif dari end state scene N, tapi tidak boleh mencampur visual scene N jika locationId/wardrobeBeat sudah berbeda.
4. SPOKEN DIALOGUE SEPARATION: dialogue, CTA, jokes, narrator lines, speech bubbles, subtitles, captions, slogan text, and quoted lines MUST NOT appear as visible text inside the image unless Auto Caption Overlay is selected. They belong only in dialogueOrNarration and masterVideoPrompt [AUDIO / DIALOGUE].
5. TEXT ARTIFACT BAN: kecuali Auto Caption Overlay, jangan tulis caption, subtitle, UI text, watermark, hex code (#ffff80), CSS color, prompt fragment, duplicate panel number, atau huruf acak di dalam gambar. Panel number kecil harus unik dan berurutan.
5B. DIALOGUE IS AUDIO ONLY: kalimat di dialogueOrNarration atau [AUDIO / DIALOGUE] adalah suara, bukan tulisan di gambar. Jangan render speech bubble/subtitle seperti "Permisi, Mas" atau "Monggo" di panel.
6. FINAL SCENE ANTI-REPEAT: khusus scene terakhir, setiap panel wajib beda framing/action/emotional value. Jangan mengulang shot jendela, close-up wajah, produk di meja, atau pose reflektif yang sama. Panel terakhir harus payoff visual baru.
7. Akhiri dengan SCENE ISOLATION NOTE dan AUDIO CONTINUITY NOTE (Bahasa Inggris).

ATURAN WAJIB UNTUK MASTER VIDEO PROMPT:
STRUKTUR: [START] → [SHOT PROGRESSION] → [CAMERA WORK] → [END STATE]
        ASPECT RATIO: ${config.aspectRatio} — jangan ganti. DIALOG: dialogueOrNarration berada di blok [AUDIO / DIALOGUE] pada bagian awal prompt. Tulis dialog yang segar, spesifik terhadap konflik dan aksi scene, tanpa nama preset TTS, voice ID, atau instruksi suara beku.
${interactionDialogRule}${dialogRules}
CLEAN VIDEO OPENING — NON-NEGOTIABLE: Detik pertama video WAJIB SATU frame cinematic Shot 1 full-screen. BUKAN grid, BUKAN panel, BUKAN animatic, BUKAN contact sheet, BUKAN multi-panel layout, BUKAN komik frame, BUKAN black gutter, BUKAN panel number. Video adalah satu camera merekam satu scene dengan continuous real motion — JANGAN animate atau arrange the storyboard panels. FORBIDDEN untuk seluruh clip, terutama detik 1–2 DAN setiap saat setelahnya: storyboard grid, multi-panel layout, comic frames, black gutters, panel numbers, split-screen, contact sheet, animatic, collage. Penonton TIDAK BOLEH melihat frame yang terlihat seperti storyboard.
STYLE CONTINUITY LOCK: Setiap masterImagePrompt dan masterVideoPrompt harus menyebutkan gaya visual "${visualStyleSetting}" secara eksplisit. Jangan pernah mencampur realistic, anime, 3D CGI, illustration, atau rendering language berbeda.
AUDIO CONTINUITY: Setiap masterVideoPrompt harus menjaga bahasa ${config.language}, pronunciation, emotional tone, room tone, ambience, music bed, sound-effects palette, loudness balance, dan transisi audio yang seamless dari scene sebelumnya. Jangan menambahkan nama preset TTS, voice ID, atau instruksi penguncian suara ke dalam dialog.
${config.visualStyle === 'Auto Caption Overlay' ? 'AUTO CAPTION OVERLAY DIRECTOR MODE: Create an exceptionally cinematic, maximal, creative motion-graphics package directly visible in every storyboard image and video prompt, not plain text. Design layered kinetic typography, icons, pictograms, callouts, animated infographic charts, data cards, particles, light streaks, depth layers, parallax, tracked labels, HUD accents, transitions, and sound-synced visual beats whenever relevant. For every scene specify hierarchy, short readable headline/caption in ' + config.language + ', iconography, shape system, color, typography, texture, depth, lighting integration, safe placement, entrance animation, timing, object/camera tracking, exit animation, easing, and audio-reactive or beat-synced motion. Use only information grounded in the user prompt and never invent claims. Let the director choose as many tasteful effects as the scene supports while keeping the subject legible and premium, like a high-budget film title sequence, broadcast package, and branded commercial combined. This mode is explicitly exempt from clean-screen, no-text, no-caption, and no-overlay rules.' : 'CLEAN TEXT RULE: Do not create captions, watermark, logo, subtitle, or overlay text.'}
${(config.characterReference && config.characterReference.length) ? 'CHARACTER REFERENCE KEYWORD — HARUS ADA DI SETIAP SCENE: Tulis persis kalimat "don\'t change the face and characteristic from attached photo." Face, skin, hair, and body from the attached photo are frozen. If outfit is visible in the attached photo and user did not request wardrobe changes, preserve that outfit/color anchor across every scene. Wardrobe may change ONLY when the story explicitly requires a different day/place/context, and then the new wardrobe must be locked by wardrobeBeat.' : ''}
${(config.productReference && config.productReference.length) ? 'PRODUCT REFERENCE — HARD DESIGN PLATE: attached product photo is the master design AND real-world scale plate. Freeze exact product category, silhouette, proportions, thickness, colorway, material, label/logo position, markings, packaging/strap/cap/sole shape, and distinctive details. Keep the same size versus hands, face, feet, table, and body in every panel. Close-up may fill the frame without changing true size. Do not redesign, simplify, rebrand, recolor, enlarge, shrink, or swap the product.' : ''}
HINT GENRE DARI SISTEM: ${genreHint}. Koreksi jika niat cerita berbeda, lalu eksekusi 100% sesuai genre final.
${getGenreInstruction(genreHint)}
Jika genre final berbeda dari hint, abaikan aturan hint di atas. Pakai: iklan=EXTREME visual hook detik 1–3 + CTA tidak monoton di akhir; horror=dread/withheld reveal tanpa CTA; drama=emosi earned tanpa CTA; komedi=setup-payoff; edukasi=satu ide per beat; action=momentum; dokumenter=authentic; hybrid=cerita utama + produk/promo natural di tengah cerita + CTA akhir dilarang.
`;

    const epN = Number(config.currentEpisode) || 1;
    const epTotal = Math.min(5, Number(config.episodeCount) || 1);
    let episodeBlock = '';
    if (epTotal > 1) {
        episodeBlock = 'EPISODE ' + epN + ' of ' + epTotal + '. This chapter must feel complete and cinematic on its own. Do not dump the entire remaining plot into this JSON. ';
        if (epN === 1) episodeBlock += 'Opening: hook hard, do not resolve the whole story, end with a reason to continue.';
        else if (epN === epTotal) episodeBlock += 'FINALE: pay off the series. If advertisement, put CTA only here.';
        else episodeBlock += 'Middle: advance the story, no full recap, no finale CTA.';
        if (epN > 1) {
            episodeBlock += '\n' + previousEpisodeBrief();
            episodeBlock += '\nCAST/PRODUCT FROZEN from episode 1. Do not redesign faces or product scale. New locations OK if the story moves.';
            if (config.episodeBible) {
                episodeBlock += '\n' + buildCastLock(config.episodeBible, config);
                const pLock = buildProductLock(config.episodeBible, !!(config.productReference && config.productReference.length), config);
                if (pLock) episodeBlock += '\n' + pLock;
            }
        }
    }
    const userQuery = `Konsep Story: ${config.story}.
Genre hint: ${genreHint}. Commercial intent: ${commercialMode}. Product reference: ${(config.productReference && config.productReference.length) ? 'YES' : 'NO'}. Character reference: ${(config.characterReference && config.characterReference.length) ? 'YES' : 'NO'} (${Math.min(CHARACTER_REF_MAX, (config.characterReference || []).length)} attached cast members, mapped in upload order to CHARACTER_1 through CHARACTER_4). Location reference: ${(config.locationReference && config.locationReference.length) ? 'YES' : 'NO'}.
Jumlah Adegan: ${config.sceneCount}. Shot per adegan: ${config.shotsPerScene}. Aspect Ratio: ${config.aspectRatio}. Audio Mode: ${config.audioMode}. Bahasa: ${config.language}. Visual Style: ${resolvedVisualStyle}.
${episodeBlock}
BRIEF V4.0: Input mungkin sangat sederhana atau nyeleneh. Jangan jadi template. Baca dulu maksud tersembunyi user, lalu buat treatment seperti TRENDORA senior: hook, conflict, rhythm, reveal, payoff, dan CTA hanya jika 100% iklan. Jika 100% iklan, buka dengan extreme visual hook yang fresh dan wajib CTA akhir. Jika hybrid cerita+iklan, integrasikan produk sebagai sisipan organik di tengah cerita dan jangan beri CTA di akhir. Wajah pemain beku. Outfit mengikuti reference/beat. Lokasi dikunci per adegan. Kamera bervariasi, jangan full-body terus. Jika ada produk, kunci ukuran nyata vs tubuh — jangan membesar di close-up portrait atau mengecil di wide. Caption & hashtag HANYA tentang yang dijual/ditonton, bukan lokasi syuting.`;

    const payloadParts = [{ text: userQuery }];
    const allRefs = [
        ...(config.characterReference || []),
        ...(config.productReference || []),
        ...(config.locationReference || [])
    ];
    allRefs.forEach(ref => {
        if (ref && ref.dataUrl) {
            const match = ref.dataUrl.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                payloadParts.push({
                    inlineData: {
                        mimeType: match[1],
                        data: match[2]
                    }
                });
            }
        }
    });

    const payload = {
        contents: [{ parts: payloadParts }],
        generationConfig: { responseMimeType: "application/json" },
        systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const response = await fetchWithExponentialBackoff(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: storyboardAbortCtrl ? storyboardAbortCtrl.signal : undefined
    }, 3, 90000);
    const result = await response.json();
    const breakdownText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!breakdownText) throw new Error("Gagal menerima data breakdown TRENDORA.");

    // Robust multi-strategy JSON parsing
    let breakdown;
    const raw = breakdownText.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

    // Strategy 1: direct parse
    try {
        breakdown = JSON.parse(raw);
    } catch (e1) {
        // Strategy 2: find balanced JSON object bounds
        let endPos = -1, depth = 0, inStr = false, escaped = false;
        for (let i = raw.indexOf('{'); i < raw.length; i++) {
            const ch = raw[i];
            if (escaped) { escaped = false; continue; }
            if (ch === '\\') { escaped = true; continue; }
            if (ch === '"') { inStr = !inStr; continue; }
            if (inStr) continue;
            if (ch === '{') { if (depth === 0) endPos = i; depth++; }
            else if (ch === '}') { depth--; if (depth === 0) { endPos = i; break; } }
        }
        if (endPos >= 0) {
            try {
                breakdown = JSON.parse(raw.substring(raw.indexOf('{'), endPos + 1));
            } catch (e2) {
                // Strategy 3: extract scenes array and rebuild breakdown
                const scenesMatch = raw.match(/"scenes"\s*:\s*\[([\s\S]*)\]\s*[,}]/);
                if (scenesMatch) {
                    try {
                        const scenes = JSON.parse('[' + scenesMatch[1] + ']');
                        if (Array.isArray(scenes) && scenes.length > 0) {
                            breakdown = { masterVisualIdentity: null, scenes: scenes };
                        }
                    } catch (e3) { /* scenes parse failed, fall through to error */ }
                }
                if (!breakdown) {
                    // Strategy 4: last resort — try extracting scene blocks via regex
                    const sceneBlocks = raw.match(/\{[^{}]*"sceneNumber"\s*:\s*\d+[\s\S]*?\}(?=\s*[,}\]]|$)/g);
                    if (sceneBlocks && sceneBlocks.length > 0) {
                        const scenes = sceneBlocks.map(b => {
                            try { return JSON.parse(b); } catch { return null; }
                        }).filter(Boolean);
                        if (scenes.length > 0) breakdown = { masterVisualIdentity: null, scenes: scenes };
                    }
                }
                if (!breakdown) {
                    throw new Error("Respons API tidak dapat diparse: " + e2.message + " (position " + e2.message.match(/\d+/)?.[0] + ")");
                }
            }
        } else {
            throw new Error("Tidak dapat menemukan struktur JSON dalam respons API.");
        }
    }

    // Normalize: support both {scenes:[...]} and {scenes:{scene1,scene2}} or direct array
    if (breakdown && breakdown.scenes && typeof breakdown.scenes === 'object' && !Array.isArray(breakdown.scenes)) {
        breakdown.scenes = Object.values(breakdown.scenes);
    }
    if (breakdown && Array.isArray(breakdown) && !breakdown.scenes) {
        breakdown = { masterVisualIdentity: null, scenes: breakdown };
    }
    if (!breakdown || !Array.isArray(breakdown.scenes)) {
        throw new Error("Format breakdown tidak valid: respons API tidak mengandung array scenes.");
    }

    return breakdown;
}

function normalizeDialogueText(value) {
    return String(value || '')
        .replace(/\\"/g, '"')
        .replace(/\\r\\n|\\n/g, '\n')
        .replace(/\s*[|¦]\s*/g, '\n')
        .replace(/\s+(?=(?:(?:\[[^\]]+\]\s*)?CHARACTER_\d+|VOICEOVER|NARRATOR|SOUND DESIGN)\s*:)/gi, '\n')
        .replace(/^[ \t]*\[AUDIO\s*\/\s*DIALOGUE\][ \t]*\n?/gim, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !/^\[[^\]]+\]$/.test(line))
        .join('\n');
}

function pullDialogueSection(prompt, spokenFallback) {
    const src = prompt || '';
    const heading = '(?:STRICT VISUAL CONSISTENCY GATE|CHARACTER FORENSIC RENDER LOCK|NO TEXT ARTIFACT LOCK|TEXT ARTIFACT CONTROL LOCK|FINAL SCENE ANTI-REPEAT LOCK|LONG STORYBOARD DISCIPLINE LOCK|SCENE ISOLATION LOCK|CONTINUITY BIBLE LOCK|CAST IDENTITY LOCK:|VOICE CAST LOCK:|DIALOGUE DURATION LOCK|AUDIO PERFORMANCE \/ ACTING LOCK|PRODUCT IDENTITY \\+ SCALE LOCK:|PRODUCT SCALE LOCK:|SCENE SETTING LOCK:|CAMERA VARIETY LOCK:|VISUAL STYLE LOCK:|AUDIO CONTINUITY LOCK:|ASPECT RATIO LOCK:|STORYBOARD GRID LOCK:|CLEAN VIDEO OPENING:)';
    const re = new RegExp('(?:^|\\n)\\s*\\[AUDIO\\s*\\/\\s*DIALOGUE\\]\\s*\\n[\\s\\S]*?(?=\\n\\s*(?:\\[AUDIO\\s*\\/\\s*DIALOGUE\\]|' + heading + ')|$)', 'gi');
    const matches = [...src.matchAll(re)];
    const dialogueLines = matches.map(match => normalizeDialogueText(match[0]).replace(/^\[AUDIO\s*\/\s*DIALOGUE\]\s*/i, '')).filter(Boolean);
    let block = dialogueLines.length ? '[AUDIO / DIALOGUE]\n' + Array.from(new Set(dialogueLines.join('\n').split('\n').map(line => line.trim()).filter(Boolean))).join('\n') : '';
    let rest = matches.length ? matches.reduceRight((text, match) => text.slice(0, match.index) + text.slice(match.index + match[0].length), src).trim() : src;
    if (!block && spokenFallback && String(spokenFallback).trim()) {
        block = '[AUDIO / DIALOGUE]\n' + normalizeDialogueText(spokenFallback);
    }
    return { rest, block };
}

function extractDialogueLines(prompt) {
    return normalizeDialogueText(prompt).split('\n')
        .map(line => line.trim())
        .filter(line => /^(?:\[[^\]]+\]\s*)?(?:CHARACTER_\d+|VOICEOVER|NARRATOR)\s*:/i.test(line))
        .join('\n');
}

function moveAudioDialogueToBottom(prompt, spokenFallback) {
    const pulled = pullDialogueSection(prompt, spokenFallback);
    if (!pulled.block) return pulled.rest;
    return pulled.rest.replace(/\n{3,}/g, '\n\n').trim() + '\n\n' + pulled.block;
}

/* ----------------------------------------------------------------- */
/* RESULTS RENDERING & STORYBOARD IMAGE PIPELINE                     */
/* ----------------------------------------------------------------- */
function renderSocialPack(breakdown) {
    const el = document.getElementById('socialPackContainer');
    if (!el) return;
    const caption = (breakdown && breakdown.socialCaption) ? String(breakdown.socialCaption).trim() : '';
    let tags = breakdown && breakdown.hashtags;
    if (Array.isArray(tags)) {
        tags = tags
            .map(tag => String(tag || '').trim().replace(/^#+/, ''))
            .filter(Boolean)
            .map(tag => '#' + tag.replace(/\s+/g, ''))
            .join(' ');
    } else {
        tags = tags ? String(tags).trim() : '';
        tags = tags
            .split(/\s+/)
            .filter(Boolean)
            .map(tag => '#' + tag.replace(/^#+/, '').replace(/\s+/g, ''))
            .join(' ');
    }
    if (!caption && !tags) { el.innerHTML = ''; return; }
    el.innerHTML = `
        <div class="glass-card rounded-2xl p-5 mb-6 border border-cyan-500/25 shadow-lg">
            <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div class="flex items-center space-x-2 text-cyan-300 font-extrabold text-xs tracking-wide">
                    <i class="fa-solid fa-hashtag text-cyan-400"></i>
                    <span>CAPTION & HASHTAG SIAP COPY</span>
                </div>
                <button type="button" onclick="copySocialPack()" class="text-[10px] bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-100 px-3 py-1.5 rounded-lg border border-cyan-500/30 font-bold uppercase tracking-wide">
                    <i class="fa-solid fa-copy mr-1"></i>Copy Semua
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Caption</span>
                        <button type="button" onclick="copyText('socialCaptionOut')" class="text-[10px] text-gray-400 hover:text-white"><i class="fa-solid fa-copy mr-1"></i>Copy</button>
                    </div>
                    <textarea id="socialCaptionOut" rows="3" class="w-full bg-black/40 rounded-xl p-3 text-xs text-gray-200 resize-none border border-white/5 focus:border-cyan-500/40 outline-none">${escapeHtml(caption)}</textarea>
                </div>
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hashtag</span>
                        <button type="button" onclick="copyText('socialHashtagOut')" class="text-[10px] text-gray-400 hover:text-white"><i class="fa-solid fa-copy mr-1"></i>Copy</button>
                    </div>
                    <textarea id="socialHashtagOut" rows="3" class="w-full bg-black/40 rounded-xl p-3 text-xs text-gray-200 resize-none border border-white/5 focus:border-cyan-500/40 outline-none">${escapeHtml(tags)}</textarea>
                </div>
            </div>
        </div>
    `;
}

function renderDirectorIntent(breakdown) {
    return;
}

function renderEpisodeBar() {
    const el = document.getElementById('episodeBar');
    const label = document.getElementById('resultEpisodeLabel');
    const total = Math.min(5, Number(state.episodeCount) || 1);
    const cur = Number(state.currentEpisode) || 1;
    if (label) {
        label.textContent = total > 1
            ? ('Episode ' + cur + ' / ' + total + ' — tiap part mandiri, cerita menyambung')
            : 'Storyboard Composite Sheets & Timed Motion Prompts';
    }
    if (!el) return;
    if (total <= 1) { el.innerHTML = ''; return; }
    const doneCount = (state.episodeSeries || []).length;
    const tabs = (state.episodeSeries || []).map(ep => {
        const on = ep.episode === cur;
        return `<button type="button" onclick="showEpisode(${ep.episode})" class="min-w-[108px] px-5 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wider border-2 transition shadow-md ${on ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-300 shadow-purple-500/30' : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-purple-400/50'}">Episode ${ep.episode}</button>`;
    }).join('');
    const canNext = doneCount > 0 && doneCount < total;
    const nextBtn = canNext
        ? `<button type="button" onclick="continueNextEpisode()" class="px-5 py-3 btn-gradient-primary text-white text-xs font-extrabold rounded-xl uppercase tracking-wide"><i class="fa-solid fa-forward mr-1"></i>Lanjut Episode ${doneCount + 1} / ${total}</button>`
        : '';
    el.innerHTML = `<div class="flex items-center justify-between gap-3 flex-wrap bg-black/30 border border-purple-500/20 rounded-2xl p-4">
        <div class="flex items-center gap-3 flex-wrap">${tabs}</div>
        ${nextBtn}
    </div>`;
}

function showEpisode(n) {
    const ep = (state.episodeSeries || []).find(e => e.episode === n);
    if (!ep) return;
    state.currentEpisode = n;
    currentStoryboardHistoryId = ep.historyId || currentStoryboardHistoryId;
    state.directorData = ep.breakdown;
    renderDirectorIntent(ep.breakdown);
    renderSocialPack(ep.breakdown);
    renderEpisodeBar();
    renderStoryboardResults(ep.breakdown, ep.images);
}

function copySocialPack() {
    const c = document.getElementById('socialCaptionOut')?.value || '';
    const h = document.getElementById('socialHashtagOut')?.value || '';
    const text = [c, h].filter(Boolean).join('\n\n');
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => alert('Caption & hashtag disalin.')).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            alert('Caption & hashtag disalin.');
        });
    } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        alert('Caption & hashtag disalin.');
    }
}

function resolveStoryboardLanguage(config) {
    const requested = String(config && config.language || '').trim();
    if (requested && !/^auto$/i.test(requested)) return requested;
    const story = String(config && config.story || '');
    const indonesianSignals = (story.match(/\b(?:yang|dan|dengan|untuk|dari|ini|itu|tidak|akan|saya|aku|kamu|kita|mereka|sebuah|seorang|buat|bikin|cerita|tentang|adegan|dialog)\b/gi) || []).length;
    const englishSignals = (story.match(/\b(?:the|and|with|for|from|this|that|not|will|you|we|they|a|an|story|about|scene|dialogue)\b/gi) || []).length;
    return indonesianSignals >= englishSignals ? 'Bahasa Indonesia' : 'English';
}

function revealCompletedScenePrompts(sceneIdx, scene) {
    if (!scene || !scene.sceneGenerated) return;
    const imagePrompt = document.getElementById('masterImagePrompt_' + sceneIdx);
    const videoPrompt = document.getElementById('masterVideoPrompt_' + sceneIdx);
    scene.masterVideoPrompt = enforceCleanVideoOpening(scene.masterVideoPrompt);
    if (imagePrompt) imagePrompt.value = scene.masterImagePrompt || '';
    if (videoPrompt) videoPrompt.value = scene.masterVideoPrompt || '';
    document.getElementById('scenePromptPanel_' + sceneIdx)?.classList.remove('hidden');
}

async function renderStoryboardResults(breakdown, cachedImages) {
    (breakdown.scenes || []).forEach(scene => { scene.masterVideoPrompt = enforceCleanVideoOpening(scene.masterVideoPrompt); });
    const scenesContainer = document.getElementById('scenesContainer');
    scenesContainer.innerHTML = breakdown.scenes.map((scene, idx) => `
        <div class="glass-card rounded-2xl p-4 lg:p-6 border border-white/10 shadow-2xl relative overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-500"></div>
            <div class="flex items-stretch gap-4 border-b border-white/10 pb-5 mb-6 flex-wrap">
                <div class="w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-purple-400/40 bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-900/30 flex flex-col items-center justify-center">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-purple-100">Episode ${state.currentEpisode}</span>
                    <strong class="text-5xl leading-none font-black tracking-tight">${scene.sceneNumber || (idx + 1)}</strong>
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-indigo-100">Adegan</span>
                </div>
                <div class="min-w-[180px] flex-1 flex flex-col justify-center">
                    <div class="flex items-center gap-2 flex-wrap mb-1.5">
                        <span class="text-[10px] font-extrabold uppercase tracking-[0.18em] text-cyan-300">Episode ${state.currentEpisode} · Adegan ${scene.sceneNumber || (idx + 1)}</span>
                    </div>
                    <h3 class="text-white font-extrabold text-lg lg:text-xl leading-tight drop-shadow-sm">${scene.title || 'Continuous Narrative Arc'}</h3>
                    <div class="flex items-center gap-2 flex-wrap mt-3">
                        <span class="text-[10px] bg-black/40 text-gray-300 px-2.5 py-1 rounded-lg border border-white/10 font-mono shadow-inner flex items-center gap-1.5"><i class="fa-solid fa-stopwatch text-gray-400"></i> ${state.durationPerScene}</span>
                        <span class="text-[10px] bg-black/40 text-gray-300 px-2.5 py-1 rounded-lg border border-white/10 font-mono shadow-inner flex items-center gap-1.5"><i class="fa-solid fa-border-all text-gray-400"></i> ${state.shotsPerScene} Shot</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 self-center ml-auto">
                    <button id="btnGenerateScene_${idx}" onclick="generateStoryboardScene(${idx})" class="scene-generate-btn px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 text-[11px] font-bold rounded-lg border border-emerald-500/40 transition"><i class="fa-solid fa-play mr-1"></i>${scene.sceneGenerated ? 'Generated' : 'Generate Scene'}</button>
                </div>
            </div>
            ${scene.continuityToNext ? `<div class="text-[10px] text-gray-500 mb-5"><span class="text-cyan-400 font-bold">Transisi ke scene berikutnya:</span> ${escapeHtml(scene.continuityToNext)}</div>` : ''}

            <!-- Storyboard Canvas Preview (Constrained for elegance) -->
            <div class="max-w-2xl mx-auto mb-8">
                <div id="sceneImgContainer_${idx}" class="relative bg-black/90 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center min-h-[320px] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.8)]">
                    <div id="sceneImgLoading_${idx}" class="hidden absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-black/75 backdrop-blur-sm">
                        <!-- Neon ring loader -->
                        <div class="relative w-16 h-16 flex items-center justify-center">
                            <div class="absolute inset-0 rounded-full border-2 border-purple-500/20"></div>
                            <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-pink-500 animate-spin" style="animation-duration:1s"></div>
                            <div class="absolute inset-2 rounded-full border-2 border-transparent border-b-cyan-500 animate-spin" style="animation-duration:1.5s;animation-direction:reverse"></div>
                            <div class="absolute inset-4 rounded-full border-2 border-transparent border-r-yellow-400 animate-spin" style="animation-duration:0.8s;animation-direction:reverse"></div>
                        </div>
                        <p class="text-[11px] text-white/60 font-medium tracking-wide">tunggu sebentar ya Bos,<br>masih di masakin...</p>
                    </div>
                    <img id="sceneImg_${idx}" class="hidden w-full h-auto object-contain rounded-2xl transition-opacity duration-500 opacity-0" onload="this.classList.remove('opacity-0')" />
                </div>
            </div>

            <div class="flex justify-center gap-2 mb-6 flex-wrap">
                <button id="btnEditScene_${idx}" onclick="openSceneImageEditModal(${idx})" ${cachedImages?.[idx] ? '' : 'disabled'} class="scene-action-btn px-4 py-2 bg-pink-600/30 hover:bg-pink-600/50 text-pink-200 text-xs font-bold rounded-xl border border-pink-500/40 transition"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i>Edit Gambar Adegan</button>
                <button id="btnRegenerateScene_${idx}" onclick="regenerateSceneImage(${idx})" ${cachedImages?.[idx] ? '' : 'disabled'} class="scene-action-btn px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold rounded-xl border border-purple-500/40 transition"><i class="fa-solid fa-arrows-rotate mr-1"></i>Generate Ulang</button>
                <button id="downloadImgBtn_${idx}" onclick="downloadSceneImage(${idx})" class="hidden px-4 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 text-xs font-bold rounded-xl border border-cyan-500/40 transition"><i class="fa-solid fa-download mr-1"></i>Download Gambar</button>
                <button id="btnRenderSceneN8n_${idx}" onclick="renderSceneToN8n(${idx})" class="scene-action-btn px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 text-xs font-bold rounded-xl border border-emerald-500/40 transition flex items-center gap-1.5"><i class="fa-solid fa-film text-emerald-400"></i><span>Render Video (n8n)</span></button>
            </div>

            <!-- Image & Video Prompts (Compact 2-col on desktop) -->
            <div id="scenePromptPanel_${idx}" class="${scene.sceneGenerated || cachedImages?.[idx] || scene.finalAssetState?.imageDataUrl ? '' : 'hidden'} grid grid-cols-1 md:grid-cols-2 gap-6">
                ${isSilentAudioMode(state) ? '' : `
                <div class="glass-card p-5 rounded-2xl border border-cyan-500/20 md:col-span-2">
                    <div class="flex items-center justify-between gap-3 flex-wrap mb-3">
                        <label class="text-[10px] font-bold text-cyan-300 flex items-center gap-2 uppercase tracking-widest">
                            <i class="fa-solid fa-comments text-cyan-400"></i>
                            <span>Dialog Scene</span>
                        </label>
                        <div class="flex items-center gap-2">
                            <button id="btnGenerateDialogue_${idx}" onclick="generateSceneDialogue(${idx})" class="text-[10px] bg-cyan-600/25 hover:bg-cyan-600/45 text-cyan-200 px-3 py-1.5 rounded-lg border border-cyan-500/35 font-bold transition">
                                <i class="fa-solid fa-arrows-rotate mr-1"></i>Regenerate
                            </button>
                            <button onclick="saveEditedSceneDialogue(${idx})" class="text-[10px] bg-emerald-600/25 hover:bg-emerald-600/45 text-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-500/35 font-bold transition">
                                <i class="fa-solid fa-floppy-disk mr-1"></i>Simpan Dialog
                            </button>
                        </div>
                    </div>
                    <textarea id="dialogueText_${idx}" rows="4" class="w-full bg-black/40 rounded-xl p-3.5 text-[12px] text-gray-200 resize-y font-mono leading-relaxed border border-white/5 focus:border-cyan-500/50 outline-none transition" placeholder="Dialog scene belum dibuat. Klik Regenerate.">${escapeHtml(scene.dialogueOrNarration || '')}</textarea>
                    <div id="dialogueStatus_${idx}" class="text-[10px] ${scene.dialogueNeedsRepair ? 'text-amber-300' : scene.dialogueOrNarration ? 'text-emerald-300' : 'text-gray-500'} mt-2 font-mono">${scene.dialogueNeedsRepair ? escapeHtml(getDialogueRecoveryMessage(scene.sceneNumber || idx + 1, false)) : scene.dialogueOrNarration ? 'Dialog sudah dibuat dan prompt video siap digunakan.' : 'Dialog dibuat saat adegan diproses.'}</div>
                </div>
                `}
                <div class="glass-card p-5 rounded-2xl border border-white/5 flex flex-col">
                    <div class="flex justify-between items-center mb-3">
                        <label class="text-[10px] font-bold text-purple-300 flex items-center gap-2 uppercase tracking-widest">
                            <i class="fa-solid fa-image text-purple-400"></i>
                            <span>Image Prompt</span>
                        </label>
                        <button onclick="copyText('masterImagePrompt_${idx}')" class="text-[10px] bg-white/5 hover:bg-white/10 text-gray-300 px-2.5 py-1 rounded border border-white/10 transition font-mono flex items-center gap-1"><i class="fa-solid fa-copy"></i> Copy</button>
                    </div>
                    <textarea id="masterImagePrompt_${idx}" rows="5" class="w-full bg-black/40 rounded-xl p-3.5 text-[11px] text-gray-300 resize-none font-mono leading-relaxed border border-white/5 flex-1 focus:border-purple-500/50 outline-none transition">${escapeHtml(scene.masterImagePrompt || '')}</textarea>
                </div>

                <div class="glass-card p-5 rounded-2xl border border-white/5 flex flex-col">
                    <div class="flex justify-between items-center mb-3 flex-wrap gap-2">
                        <label class="text-[10px] font-bold text-purple-300 flex items-center gap-2 uppercase tracking-widest">
                            <i class="fa-solid fa-video text-purple-400"></i>
                            <span>Video Prompt</span>
                        </label>
                        <div class="flex items-center space-x-2">
                            ${isSilentAudioMode(state) ? '' : `<button id="btnGenVoice_${idx}" onclick="generateAIVoiceForScene(${idx})" class="text-[10px] bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 px-3 py-1 rounded-lg border border-purple-500/30 font-bold flex items-center gap-1.5 transition">
                                <i class="fa-solid fa-microphone text-purple-400"></i> AI Voice
                            </button>`}
                            <button onclick="copyText('masterVideoPrompt_${idx}')" class="text-[10px] bg-white/5 hover:bg-white/10 text-gray-300 px-2.5 py-1 rounded border border-white/10 transition font-mono flex items-center gap-1"><i class="fa-solid fa-copy"></i> Copy</button>
                        </div>
                    </div>
                    <textarea id="masterVideoPrompt_${idx}" rows="5" class="w-full bg-black/40 rounded-xl p-3.5 text-[11px] text-gray-300 resize-none font-mono leading-relaxed border border-white/5 flex-1 focus:border-purple-500/50 outline-none transition">${escapeHtml(scene.masterVideoPrompt)}</textarea>
                    <div id="voiceStatus_${idx}" class="hidden text-[10px] text-purple-300 mt-2 font-mono bg-purple-900/20 p-2 rounded-lg text-center"></div>
                    <div id="voiceAudioContainer_${idx}"></div>
                </div>
            </div>

        </div>
    `).join('');

    if (Array.isArray(cachedImages) && cachedImages.length) {
        cachedImages.forEach((src, i) => {
            const imgElem = document.getElementById('sceneImg_' + i);
            const loadingElem = document.getElementById('sceneImgLoading_' + i);
            if (imgElem && src) {
                imgElem.src = src;
                imgElem.classList.remove('hidden', 'opacity-0');
            }
            if (loadingElem) loadingElem.classList.add('hidden');
            document.getElementById('downloadImgBtn_' + i)?.classList.remove('hidden');
            const generateButton = document.getElementById('btnGenerateScene_' + i);
            if (generateButton && src) {
                generateButton.innerHTML = '<i class="fa-solid fa-check mr-1"></i>Generated';
                generateButton.classList.add('bg-emerald-500/20', 'text-emerald-100');
            }
            document.getElementById('btnEditScene_' + i)?.removeAttribute('disabled');
            document.getElementById('btnRegenerateScene_' + i)?.removeAttribute('disabled');
        });
        renderEpisodeBar();
        return;
    }

    await ensureStoryboardHistoryRecord(breakdown);
    renderEpisodeBar();

}

async function ensureStoryboardHistoryRecord(breakdown) {
    let episode = (state.episodeSeries || []).find(item => item.episode === state.currentEpisode);
    if (episode) {
        episode.breakdown = breakdown;
        if (!Array.isArray(episode.images)) episode.images = [];
        return episode;
    }
    const record = {
        id: 'sb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        ownerId: getHistoryOwnerId(),
        timestamp: new Date().toISOString(),
        title: (STORYBOARD_MODE_REGISTRY[state.storyboardMode]?.label || 'Storyboard') + ' · ' + (state.episodeCount > 1 ? ('Ep ' + state.currentEpisode + ': ') : '') + state.story.substring(0, 40) + '...',
        sceneCount: state.sceneCount,
        shotsPerScene: state.shotsPerScene,
        aspectRatio: state.aspectRatio,
        visualStyle: state.visualStyle,
        configSnapshot: {
            story: state.story,
            storyboardMode: state.storyboardMode,
            sceneCount: state.sceneCount,
            shotsPerScene: state.shotsPerScene,
            durationPerScene: state.durationPerScene,
            aspectRatio: state.aspectRatio,
            visualStyle: state.visualStyle,
            customStyle: state.customStyle,
            animationStyle: state.animationStyle,
            animationCustomStyle: state.animationCustomStyle,
            animationGenre: state.animationGenre,
            episodeCount: state.episodeCount,
            audioMode: state.audioMode,
            language: state.language
        },
        breakdown,
        images: []
    };
    await saveToHistory(record);
    currentStoryboardHistoryId = record.id;
    episode = { episode: state.currentEpisode, breakdown, images: [], historyId: record.id };
    state.episodeSeries = (state.episodeSeries || []).filter(item => item.episode !== state.currentEpisode);
    state.episodeSeries.push(episode);
    return episode;
}

function setSceneGenerationLock(active, activeIndex = -1) {
    const previousIndex = sceneGenerationIndex;
    sceneGenerationActive = active;
    sceneGenerationIndex = active ? activeIndex : -1;
    if (scenePercentageInterval) {
        clearInterval(scenePercentageInterval);
        scenePercentageInterval = null;
    }
    if (active) {
        scenePercentage = 0;
        scenePercentageCeiling = 19;
        setScenePercentage(0);
        scenePercentageInterval = setInterval(() => {
            if (scenePercentage < scenePercentageCeiling) {
                const remaining = scenePercentageCeiling - scenePercentage;
                const step = Math.max(0.035, remaining * (remaining > 12 ? 0.045 : 0.018));
                setScenePercentage(Math.min(scenePercentageCeiling, scenePercentage + step));
            }
        }, 90);
    }
    document.querySelectorAll('.scene-action-btn, #btnCreateStoryboard').forEach(button => {
        button.disabled = active;
    });
    if (!active) {
        const previousButton = previousIndex >= 0 ? document.getElementById('btnGenerateScene_' + previousIndex) : null;
        if (previousButton && !previousButton.classList.contains('bg-emerald-500/20')) {
            previousButton.innerHTML = '<i class="fa-solid fa-play mr-1"></i>Generate Scene';
            previousButton.removeAttribute('role');
            previousButton.removeAttribute('aria-valuemin');
            previousButton.removeAttribute('aria-valuemax');
            previousButton.removeAttribute('aria-valuenow');
        }
        document.querySelectorAll('[id^="btnEditScene_"], [id^="btnRegenerateScene_"]').forEach(button => {
            const sceneIdx = button.id.match(/_(\d+)$/)?.[1];
            const image = sceneIdx !== undefined ? document.getElementById('sceneImg_' + sceneIdx) : null;
            button.disabled = !image || !image.src || image.classList.contains('hidden');
        });
    }
    const activeButton = activeIndex >= 0 ? document.getElementById('btnGenerateScene_' + activeIndex) : null;
    if (activeButton) {
        activeButton.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-1"></i>0%';
        activeButton.setAttribute('role', 'progressbar');
        activeButton.setAttribute('aria-valuemin', '0');
        activeButton.setAttribute('aria-valuemax', '100');
        activeButton.setAttribute('aria-valuenow', '0');
    }
}

async function generateStoryboardScene(sceneIdx) {
    if (sceneGenerationActive || storyboardGenerating) {
        const activeScene = sceneGenerationIndex >= 0 ? sceneGenerationIndex + 1 : 1;
        showCanvasNotice('sabar Boss, pak TRENDORA masih masak adegan ' + activeScene);
        return;
    }
    let scene = state.directorData?.scenes?.[sceneIdx];
    if (!scene) return;
    let episode = (state.episodeSeries || []).find(item => item.episode === state.currentEpisode);
    if (sceneIdx > 0) {
        const missingScene = Array.from({ length: sceneIdx }, (_, index) => index).find(index => {
            const cachedImage = episode && episode.images && episode.images[index];
            return !cachedImage && !getSceneImageDataUrl(index);
        });
        if (missingScene !== undefined) {
            showCanvasNotice('generate adegan ' + (missingScene + 1) + ' dulu aja bos');
            return;
        }
    }
    episode = episode || await ensureStoryboardHistoryRecord(state.directorData);
    let loader = document.getElementById('sceneImgLoading_' + sceneIdx);
    if (loader) loader.classList.remove('hidden');
    setSceneGenerationLock(true, sceneIdx);
    try {
        if (!scene.sceneGenerated) {
            throwIfStoryboardCancelled();
            setScenePhase(1, 20);
            updateLoadingStatus('Menyusun prompt adegan ' + (sceneIdx + 1) + '/' + state.directorData.scenes.length + '...', 2);
            const cast = state.directorData.masterVisualIdentity?.characters || [];
            const sceneBlueprint = Object.assign({}, scene, {
                masterImagePrompt: '',
                masterVideoPrompt: ''
            });
            const promptPackage = await generateScenePromptPackage(state, sceneBlueprint, cast);
            Object.assign(scene, promptPackage);
            setScenePhase(20, 50);
            if (!isSilentAudioMode(state)) {
                try {
                    await generateSceneDialogue(sceneIdx, { silent: true });
                } catch (dialogueError) {
                    scene.dialogueNeedsRepair = true;
                    scene.dialogueViolations = Array.from(new Set((scene.dialogueViolations || []).concat(['dialogue_generation_failed'])));
                    const dialogueStatus = document.getElementById('dialogueStatus_' + sceneIdx);
                    if (dialogueStatus) {
                        dialogueStatus.textContent = getDialogueRecoveryMessage(scene.sceneNumber || sceneIdx + 1, true);
                        dialogueStatus.className = 'text-[10px] text-amber-300 mt-2 font-mono';
                    }
                    console.warn('[Scene Audio] Dialog scene ' + (scene.sceneNumber || sceneIdx + 1) + ' belum berhasil dibuat:', dialogueError && dialogueError.message);
                }
            }
            setScenePhase(50, 65);
            applyStoryboardSceneLocks(state.directorData, sceneIdx, state);
            scene = state.directorData.scenes[sceneIdx];
            scene.sceneGenerated = !isPlacePromotion(state);
            await renderStoryboardResults(state.directorData, episode.images);
        }
        await ensureFinalCommercialCta(state.directorData, state, sceneIdx);
        scene = state.directorData.scenes[sceneIdx];
        const previousImage = sceneIdx > 0 ? episode.images[sceneIdx - 1] : null;
        const image = document.getElementById('sceneImg_' + sceneIdx);
        loader = document.getElementById('sceneImgLoading_' + sceneIdx) || loader;
        if (loader) loader.classList.remove('hidden');
        setScenePhase(65, 90);
        const imgDataUrl = await generateStoryboardImageForPrompt(scene.masterImagePrompt, state.episodePlate, null, {
            sceneIdx,
            prevSceneAnchor: previousImage
        });
        scene.sceneGenerated = true;
        if (sceneIdx === 0) state.episodePlate = imgDataUrl;
        episode.images[sceneIdx] = imgDataUrl;
        scene.finalAssetState = {
            imageDataUrl: imgDataUrl,
            imagePrompt: scene.masterImagePrompt,
            videoPrompt: scene.masterVideoPrompt,
            assetRefs: scene.promptCompiler && scene.promptCompiler.assetRefs || {},
            updatedAt: new Date().toISOString()
        };
        revealCompletedScenePrompts(sceneIdx, scene);
        setScenePhase(90, 98);
        if (image) {
            image.src = imgDataUrl;
            image.classList.remove('hidden', 'opacity-0');
        }
        if (loader) loader.classList.add('hidden');
        const generateButton = document.getElementById('btnGenerateScene_' + sceneIdx);
        if (generateButton) {
            generateButton.innerHTML = '<i class="fa-solid fa-check mr-1"></i>Generated';
            generateButton.classList.add('bg-emerald-500/20', 'text-emerald-100');
        }
        document.getElementById('downloadImgBtn_' + sceneIdx)?.classList.remove('hidden');
        document.getElementById('btnEditScene_' + sceneIdx)?.removeAttribute('disabled');
        document.getElementById('btnRegenerateScene_' + sceneIdx)?.removeAttribute('disabled');
        try {
            runStoryboardQualityGate(state.directorData, state, { requireRenderedAssets: true, sceneIndex: sceneIdx });
        } catch (gateError) {
            console.warn('[Quality Gate] Scene ' + (sceneIdx + 1) + ' warning:', gateError && gateError.message);
            showCanvasNotice('Adegan ' + (sceneIdx + 1) + ' tetap ditampilkan. ' + (gateError && gateError.message || 'Validasi tidak lolos.'), 'error');
        }
        renderEpisodeBar();
        finishSceneGenerationUI(sceneIdx);
        await persistCurrentStoryboardHistory();
    } catch (error) {
        if (error.code === 'CANCELLED' || storyboardCancelled) return;
        console.warn('Scene ' + (sceneIdx + 1) + ' Image Gen Failed:', error);
        if (loader) loader.classList.add('hidden');
        // Technical failures stay in internal diagnostics; leave the scene available for retry.
    } finally {
        const completedImage = document.getElementById('sceneImg_' + sceneIdx);
        if (completedImage && completedImage.src && !completedImage.classList.contains('hidden')) {
            finishSceneGenerationUI(sceneIdx);
        }
        setSceneGenerationLock(false);
    }
}


function pickGeminiImageDataUrl(data) {
    const parts = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
    for (let i = 0; i < parts.length; i++) {
        const blob = parts[i].inlineData || parts[i].inline_data;
        if (blob && blob.data) return 'data:' + (blob.mimeType || blob.mime_type || 'image/png') + ';base64,' + blob.data;
    }
    return '';
}

function getSceneImageDataUrl(sceneIdx) {
    if (sceneIdx < 0 || !state.directorData?.scenes?.[sceneIdx]) return null;
    const scene = state.directorData.scenes[sceneIdx];
    if (scene.editedImage && scene.editedImage.indexOf('data:image/') === 0) return scene.editedImage;
    if (scene.regeneratedImage && scene.regeneratedImage.indexOf('data:image/') === 0) return scene.regeneratedImage;

    const img = document.getElementById('sceneImg_' + sceneIdx);
    if (img && img.src && img.src.indexOf('data:image/') === 0) return img.src;

    const ep = (state.episodeSeries || []).find(e => e.episode === state.currentEpisode);
    const cached = ep?.images?.[sceneIdx];
    if (cached && cached.indexOf('data:image/') === 0) return cached;
    return null;
}

function collectAdjacentSceneContinuityRefs(sceneIdx) {
    const refs = [];
    const scenes = state.directorData?.scenes || [];
    const summarizeScene = (scene, label) => {
        if (!scene) return null;
        const shotSummary = (scene.shots || [])
            .slice(0, 6)
            .map(s => 'Shot ' + (s.shotNumber || '') + ': ' + [s.action, s.camera].filter(Boolean).join(' | '))
            .filter(Boolean)
            .join(' / ');
        return {
            label,
            text: [
                'title=' + (scene.title || 'Untitled'),
                'locationId=' + (scene.locationId || 'same continuity world'),
                'timeOfDay=' + (scene.timeOfDay || 'continuous'),
                'wardrobeBeat=' + (scene.wardrobeBeat || 'same wardrobe continuity'),
                'sceneBeat=' + (scene.sceneBeat || scene.summary || ''),
                'shots=' + shotSummary
            ].filter(Boolean).join('; ')
        };
    };
    const previous = summarizeScene(scenes[sceneIdx - 1], 'previous scene');
    const next = summarizeScene(scenes[sceneIdx + 1], 'next scene');
    if (previous) refs.push(previous);
    if (next) refs.push(next);
    return refs;
}

async function generateStoryboardImageForPrompt(promptText, identityPlate, continuityRefs, options = {}) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent';
    // Grid anchor — shot-specific rules built from the fixed storyboardGridLock
    const aspectRatio = state.aspectRatio || '9:16';
    // V5.0 (Isu #2): require BOTH visualStyle === 'Auto Caption Overlay'
    // AND the explicit opt-in flag. The visualStyle alone is no
    // longer sufficient — a stale or accidental selection cannot
    // re-enable text rendering.
    const hasOverlay = state.visualStyle === 'Auto Caption Overlay' && state.visualStyleExplicitOverlay === true;

    const textRule = hasOverlay
        ? 'Auto Caption Overlay: short text in ' + (state.language || 'Bahasa Indonesia') + ', icons, callouts as cinematic overlay. NEVER add any phone number, WhatsApp contact, social media handle (@username), email, URL, QR code, brand logo, watermark, or third-party brand mark — even in overlay mode.'
        : '';

    // Text/no-text rules already enforced by STORYBOARD GRID LOCK above — do NOT re-emit conflicting "no text" rules here.
    const currentProductLock = buildProductLock(
        state.directorData && state.directorData.masterVisualIdentity,
        !!(state.productReference && state.productReference.length),
        state
    );
    const currentSceneIndex = Number.isInteger(options.sceneIdx)
        ? options.sceneIdx
        : Array.isArray(state.directorData && state.directorData.scenes)
        ? state.directorData.scenes.findIndex(scene => scene && scene.masterImagePrompt === promptText)
        : -1;
    const currentScene = currentSceneIndex >= 0 && state.directorData && state.directorData.scenes
        ? state.directorData.scenes[currentSceneIndex]
        : null;
    const productIntegrationLock = buildProductIntegrationLock(
        state.directorData && state.directorData.masterVisualIdentity,
        currentScene,
        !!(state.productReference && state.productReference.length)
    );
    const artifactLock = buildNoTextArtifactLock({
        visualStyle: state.visualStyle
    });
    const overlayLock = buildAutoCaptionOverlayLock({
        visualStyle: state.visualStyle,
        language: state.language
    });
    const strictVisualGate = currentSceneIndex >= 0
        ? buildStrictVisualConsistencyGate(state.directorData, currentSceneIndex, {
            storyboardMode: state.storyboardMode,
            visualStyle: state.visualStyle,
            customStyle: state.customStyle,
            animationStyle: state.animationStyle,
            animationCustomStyle: state.animationCustomStyle,
            shotsPerScene: state.shotsPerScene
        })
        : '';
    const finalSceneLock = currentSceneIndex >= 0
        ? buildFinalSceneAntiRepeatLock(state.directorData, currentSceneIndex, {
            shotsPerScene: state.shotsPerScene
        })
        : '';
    const extraRules = [
        strictVisualGate,
        buildLocalDemographicLock(state),
        artifactLock,
        overlayLock,
        finalSceneLock,
        currentProductLock,
        productIntegrationLock,
        'PRODUCT SCALE: keep hero product true-to-life size in every panel; camera distance may change, product-to-body ratio may not.',
        'ASPECT RATIO: ' + aspectRatio + '.'
    ].filter(Boolean).join('\n');
    const identityPlateRule = identityPlate
        ? 'REFERENCE IMAGE USAGE FOR REGENERATE: the attached current storyboard image is the authoritative visual anchor for the existing scene. Preserve the exact hero product model, packaging silhouette, proportions, colorway, material, label/logo placement, markings, and product-to-body scale from this image and the PRODUCT MASTER REFERENCE. You may repair visible defects and vary only the requested camera, pose, blocking, lighting nuance, or crop. Do NOT copy face drift, age drift, warped anatomy, merged panels, wrong cast count, or bad grid. The text prompt and STORYBOARD GRID LOCK override only those defects.'
        : '';
    const continuityList = Array.isArray(continuityRefs) ? continuityRefs.filter(ref => ref && ref.text) : [];
    const adjacentRule = continuityList.length
        ? 'ADJACENT SCENE CONTINUITY CONTEXT (TEXT ONLY, NO IMAGE COPY): Use neighboring summaries only to understand story order and fixed character identity. DO NOT recreate, repeat, paste, preview, flash back to, or imitate previous/next scene composition, location, props, wardrobe, lighting setup, pose, activity, or background. The CURRENT SCENE prompt and SCENE ISOLATION LOCK are the only visual target. If a neighboring summary conflicts with the current locationId/wardrobeBeat, ignore the neighboring visual details.\n' + continuityList.map(ref => ref.label.toUpperCase() + ': ' + ref.text).join('\n')
        : '';
    const sceneDeltaRule = currentSceneIndex >= 0
        ? buildSceneDeltaLock(state.directorData, currentSceneIndex)
        : '';
    const currentSceneAnchorRule = options.currentSceneImage
        ? 'CURRENT SCENE IMAGE ANCHOR: the attached image is the exact scene being regenerated. Treat it as the authoritative continuity anchor for the hero product and all non-target visual details. Preserve product identity, packaging, silhouette, logo/label, color/material, and scale exactly; change only the requested creative variation or audited repair.'
        : '';
    const prevAnchorRule = options.prevSceneAnchor
        ? 'PREVIOUS SCENE VISUAL ANCHOR (image of scene ' + currentSceneIndex + ' attached): use it to keep visual continuity of characters, wardrobe colors, location architecture, and lighting family. DO NOT copy its composition, pose, blocking, or specific framing — the current scene\'s text prompt and STORYBOARD GRID LOCK are the primary visual target.'
        : '';
    const driftSentinel = 'DRIFT SENTINEL — applies to every panel: if any instruction above seems to conflict with locked identity, location, wardrobe, or scene beat, the LOCK wins. Do NOT invent new cast, swap wardrobe colors, change room architecture, change face/hair/skin/body, age-shift, or merge characters. If drift is unavoidable, fail this scene rather than drift.';

    const storyStyleKey = String(state.visualStyle || '').toLowerCase();
    const photorealismAnchor = /realistic|photography|cinematic|auto/.test(storyStyleKey)
        ? 'PHOTOREALISTIC DSLR CAMERA OUTPUT — ABSOLUTE NON-NEGOTIABLE LOCK.\n\nYou are a real camera. Not a 3D engine, not an animation studio, not an illustrator. Every shot in every panel of this storyboard must read as a real photograph captured by a full-frame DSLR. Skin shows real pores and natural texture. Clothing shows real fabric weave. Reflections obey real physics. Color science matches actual daylight. Lens optics behave like a real 85mm portrait lens: shallow depth of field on the focal subject, natural bokeh elsewhere.\n\nTreat the entire output as a printed photograph contact sheet from a real photo shoot — NOT as illustration, NOT as 3D animation, NOT as cartoon, NOT as manga, NOT as comic, NOT as watercolor.\n\nHard rules:\n- No plastic skin, no doll-like eyes, no stylized 3D look\n- No oversaturated color grading, no painterly lighting\n- No toy-like or chibi proportions\n- No fake UI, no fake text overlay\n- No vector flat shading, no cel-shading, no ink outlines\n\nMandatory photographic anchors:\n- Camera: full-frame DSLR, 85mm portrait lens, f/1.8–f/4 depending on depth need\n- Lighting: real-world (sunlight, window light, practical lamp). NEVER stylized colored gel lights.\n- Subject: real human anatomy, real fabric, real materials, real textures\n- Post: RAW look — minimal grading, natural dynamic range\n\nFailure to comply = regenerate the whole storyboard with these rules applied.'
        : '';

    // promptText already has gridLock at the start (from applyStoryboardLocks) + scene description
    // Keep it intact — gridLock is the single source of truth for grid + text rules. Only append short anchors after it.
    const tail = [extraRules, identityPlateRule, adjacentRule, sceneDeltaRule, currentSceneAnchorRule, prevAnchorRule, driftSentinel, textRule].filter(Boolean).join('\n');
    const gridCount = Math.max(1, Math.min(6, Number(state.shotsPerScene) || 1));
    const portraitSixGrid = gridCount === 6 && (aspectRatio === '9:16' || aspectRatio === '4:5' || aspectRatio === '3:4');
    const finalGridRule = portraitSixGrid
        ? 'FINAL GRID CHECK — OVERRIDE: Portrait canvas = exactly 3 rows x 2 columns = exactly 6 cells. Row 1 contains cells 1 and 2; Row 2 contains cells 3 and 4; Row 3 contains cells 5 and 6. Every cell is full-size, equal, complete, and used exactly once. Place one tiny number in each cell: 1, 2, 3, 4, 5, 6, with no duplicate numbers.'
        : 'FINAL GRID CHECK — OVERRIDE: Follow the exact STORYBOARD GRID LOCK geometry for aspect ratio ' + aspectRatio + ' and exactly ' + gridCount + ' panel(s). Count the physical cells before finishing. Each cell contains one complete shot and uses one unique sequential number only.';
    const finalGridForbidden = 'Never render camera abbreviations or labels, captions, subtitles, dialogue, speech bubbles, titles, logos, watermarks, prompt text, initials, letter prefixes such as P1 or S1, extra panels, merged cells, unequal cells, duplicate panel numbers, or any unregistered visible person. The only permitted text is one bare sequential digit in each cell.';
    const headerInjection = photorealismAnchor ? photorealismAnchor + '\n\n' : '';
    const safePromptText = sanitizeStoryboardImagePrompt(promptText);
    const contents = [{ role: "user", parts: [{ text: headerInjection + (tail ? safePromptText + '\n\n' + tail : safePromptText) + '\n\n' + finalGridRule + '\n' + finalGridForbidden }] }];

    const referenceGroups = [
        ['CHARACTER REFERENCE IMAGE — use every attached character image as a non-negotiable identity reference. Use the character attached as references; do not change the face and characteristics. Preserve facial structure, hair, skin, body, age, and distinctive features. ' + (state.characterReference || []).map((_, index) => 'Reference ' + (index + 1) + ' is part of the locked cast.').join(' '), state.characterReference],
        ['PRODUCT REFERENCE IMAGE — use only for hero product design, proportions, and scale. Never interpret as a person.', state.productReference],
        ['LOCATION REFERENCE IMAGE — use only for environment, architecture, lighting, and background anchors.', state.locationReference]
    ];
    referenceGroups.forEach(([label, refs]) => (refs || []).forEach(ref => {
        contents[0].parts.push({ text: label });
        const matches = ref.dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (matches) contents[0].parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
    }));

    if (identityPlate) {
        const matches = identityPlate.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
            contents[0].parts.push({ text: 'EPISODE CONTINUITY ANCHOR — use for cast, wardrobe, location, and lighting continuity only.' });
            contents[0].parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
        }
    }

    if (options.currentSceneImage) {
        const matches = String(options.currentSceneImage).match(/^data:(.+);base64,(.+)$/);
        if (matches) {
            contents[0].parts.push({ text: 'CURRENT SCENE IMAGE — authoritative product and scene continuity anchor. Preserve the product exactly; repair only audited defects.' });
            contents[0].parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
        }
    }

    if (isPlacePromotion(state)) contents[0].parts.push({ text: buildPlacePromotionContract(state) + '\nPhysical signs already present in the reference are exempt from the no-text/no-logo rule. Preserve their existing placement and appearance; do not invent signs.' });

    if (options.prevSceneAnchor) {
        const anchorMatch = options.prevSceneAnchor.match(/^data:(.+);base64,(.+)$/);
        if (anchorMatch) contents[0].parts.push({ inlineData: { mimeType: anchorMatch[1], data: anchorMatch[2] } });
    }

    throwIfStoryboardCancelled();
    const requestBody = {
        contents: contents,
        generationConfig: {
            responseModalities: ["IMAGE"],
            imageAspectRatios: [aspectRatio]
        }
    };
    let response = await fetchWithExponentialBackoff(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: storyboardAbortCtrl ? storyboardAbortCtrl.signal : undefined
    }, 3, 90000);
    if (!response.ok) throw new Error("Gemini Image API HTTP " + response.status);
    let data = await response.json();
    let out = pickGeminiImageDataUrl(data);
    const finishReason = data?.candidates?.[0]?.finishReason
        || data?.candidates?.[0]?.detailedFinishReason?.recipeRunnerFinishReason
        || '';
    if (!out && /NO_IMAGE/i.test(finishReason)) {
        // Image models can return NO_IMAGE when a long multimodal prompt
        // mixes dialogue/CTA rules with too many continuity references.
        // Retry with a compact visual-only request for the same scene.
        const compactPrompt = [
            'Create exactly ' + gridCount + ' storyboard panel(s) in ' + aspectRatio + '.',
            'Use the selected visual style: ' + (state.visualStyle || 'Realistic Photography') + '.',
            'CURRENT SCENE ONLY: ' + String(currentScene && (currentScene.title || currentScene.sceneBeat || '') || '').slice(0, 600),
            'VISUAL ACTION: ' + String(currentScene && currentScene.sceneVisualPlan && currentScene.sceneVisualPlan.visualAction || '').slice(0, 900),
            'SHOTS: ' + String(currentScene && (currentScene.shots || []).map(shot => [shot.timecode, shot.action, shot.camera].filter(Boolean).join(' — ')).join(' / ') || '').slice(0, 1800),
            'LOCATION: ' + String(currentScene && currentScene.locationId || '') + '. TIME: ' + String(currentScene && currentScene.timeOfDay || '') + '.',
            'Preserve attached character, product, and location identities. Render only the current scene as a clean storyboard contact sheet.',
            'No dialogue text, subtitles, CTA text, logos, watermarks, prompt text, merged cells, or extra people. Only one small sequential digit per panel.'
        ].join('\n');
        const compactContents = [{ role: 'user', parts: [{ text: compactPrompt }] }];
        const compactGroups = [
            ['CHARACTER REFERENCE IMAGE', state.characterReference],
            ['PRODUCT MASTER/DETAIL REFERENCE IMAGE', state.productReference],
            ['LOCATION REFERENCE IMAGE', state.locationReference]
        ];
        compactGroups.forEach(([label, refs]) => (refs || []).forEach((ref, index) => {
            const match = ref && String(ref.dataUrl || '').match(/^data:(.+);base64,(.+)$/);
            if (match) {
                compactContents[0].parts.push({ text: label + ' ' + (index + 1) + '. Preserve its assigned identity only.' });
                compactContents[0].parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
            }
        }));
        if (options.currentSceneImage) {
            const currentMatch = String(options.currentSceneImage).match(/^data:(.+);base64,(.+)$/);
            if (currentMatch) {
                compactContents[0].parts.push({ text: 'CURRENT SCENE IMAGE — authoritative product continuity anchor. Preserve the exact product design and scale.' });
                compactContents[0].parts.push({ inlineData: { mimeType: currentMatch[1], data: currentMatch[2] } });
            }
        }
        response = await fetchWithExponentialBackoff(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: compactContents,
                generationConfig: requestBody.generationConfig
            }),
            signal: storyboardAbortCtrl ? storyboardAbortCtrl.signal : undefined
        }, 2, 90000);
        if (!response.ok) throw new Error("Gemini Image API HTTP " + response.status);
        data = await response.json();
        out = pickGeminiImageDataUrl(data);
    }
    if (out && isPlacePromotion(state) && Number.isInteger(options.sceneIdx)) {
        return approvePlaceStoryboardImage(out, state.directorData.scenes[options.sceneIdx], options.sceneIdx, state, {
            contents,
            generationConfig: { responseModalities: ['IMAGE'], imageAspectRatios: [aspectRatio] }
        });
    }
    if (out) return out;
    console.error('[Gemini Image] No image data returned. Raw response:', data);
    const blockReason = data?.promptFeedback?.blockReason
        || data?.candidates?.[0]?.finishReason
        || data?.candidates?.[0]?.promptFeedback?.blockReason
        || '';
    const textFallback = (data?.candidates?.[0]?.content?.parts || [])
        .map(part => part && part.text)
        .filter(Boolean)
        .join('\n')
        .slice(0, 240);
    if (blockReason || textFallback) {
        throw new Error('No image data returned' + (blockReason ? ' (' + blockReason + ')' : '') + (textFallback ? ': ' + textFallback : ''));
    }
    throw new Error("No image data returned.");
}

async function retrySceneImage(sceneIdx) {
    if (sceneGenerationActive || storyboardGenerating) return;
    const container = document.getElementById("sceneImgContainer_" + sceneIdx);
    const scene = state.directorData.scenes[sceneIdx];
    const currentImage = document.getElementById('sceneImg_' + sceneIdx);
    const episode = await ensureStoryboardHistoryRecord(state.directorData);
    setSceneGenerationLock(true, sceneIdx);
    showSceneImageOverlay(sceneIdx, 'Retrying generation...');
    try {
        const directedPrompt = buildDirectedRegeneratePrompt(sceneIdx, scene.masterImagePrompt);
        scene.masterImagePrompt = directedPrompt;
        const promptArea = document.getElementById('masterImagePrompt_' + sceneIdx);
        if (promptArea) promptArea.value = directedPrompt;
        const imgDataUrl = await generateStoryboardImageForPrompt(directedPrompt, state.episodePlate, collectAdjacentSceneContinuityRefs(sceneIdx), {
            sceneIdx,
            prevSceneAnchor: sceneIdx > 0 ? episode.images[sceneIdx - 1] : null
        });
        let img = document.getElementById('sceneImg_' + sceneIdx);
        if (!img && container) {
            img = document.createElement('img');
            img.id = 'sceneImg_' + sceneIdx;
            img.className = 'w-full h-auto object-contain rounded-2xl';
            container.appendChild(img);
        }
        if (img) {
            img.src = imgDataUrl;
            img.classList.remove('hidden', 'opacity-0');
        }
        scene.regeneratedImage = imgDataUrl;
        scene.editedImage = imgDataUrl;
        episode.images[sceneIdx] = imgDataUrl;
        if (sceneIdx === 0) state.episodePlate = imgDataUrl;
        syncEpisodeSeriesScene(sceneIdx, imgDataUrl);
        document.getElementById('downloadImgBtn_' + sceneIdx)?.classList.remove('hidden');
        document.getElementById('btnEditScene_' + sceneIdx)?.removeAttribute('disabled');
        document.getElementById('btnRegenerateScene_' + sceneIdx)?.removeAttribute('disabled');
        await persistCurrentStoryboardHistory();
    } catch (err) {
        alert('Retry gagal: ' + (err?.message || 'Unknown error'));
    } finally {
        hideSceneImageOverlay(sceneIdx);
        setSceneGenerationLock(false);
    }
}

function buildDirectedRegeneratePrompt(sceneIdx, currentPrompt) {
    const scene = state.directorData?.scenes?.[sceneIdx] || {};
    const config = {
        story: state.story,
        storyboardMode: state.storyboardMode,
        language: state.language,
        visualStyle: state.visualStyle,
        customStyle: state.customStyle,
        animationStyle: state.animationStyle,
        animationCustomStyle: state.animationCustomStyle,
        characterReference: state.characterReference,
        productReference: state.productReference,
        productLock: Object.assign({}, state.productLock || {}),
        locationReference: state.locationReference,
        shotsPerScene: state.shotsPerScene,
        aspectRatio: state.aspectRatio
    };
    normalizeContinuityBible(state.directorData, config);
    enforceVoiceContinuity(state.directorData);
    ensureCommercialHookPlan(state.directorData, config);
    ensureSceneVisualPlans(state.directorData, config);
    enforceLongStoryboardRules(state.directorData, config);
    const identity = state.directorData?.masterVisualIdentity || {};
    const visualStyleSetting = state.visualStyle === 'Custom Style' ? state.customStyle : state.visualStyle;
    const resolvedVisualStyle = visualStyleSetting === 'Auto' ? 'Realistic Photography' : visualStyleSetting;
    const styleKey = String(resolvedVisualStyle || '').toLowerCase();
    const illustrativeStyles = ['2d animation', 'anime', 'watercolor illustration', 'paper cutout', 'claymation', 'wool yarn craft', 'stop motion'];
    const allowsIllustration = illustrativeStyles.some(style => styleKey.indexOf(style) !== -1);
    const variationId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    const gridLock = storyboardGridLock(
        state.shotsPerScene,
        state.aspectRatio,
        state.visualStyle === 'Auto Caption Overlay' && state.visualStyleExplicitOverlay === true ? 'Overlay text only if Auto Caption Overlay is on AND the user explicitly opted in.' : 'No extra captions or titles besides tiny corner numbers.'
    );
    const locks = [
        buildRegenerateStrictLock(state.directorData, sceneIdx, config),
        buildStrictVisualConsistencyGate(state.directorData, sceneIdx, config),
        buildLocalDemographicLock(config),
        buildNoTextArtifactLock(config),
        buildCtaVisualCleanLock(scene, config),
        isDioramaAnimationStyle(config) ? buildAnimationMediumContract(config, resolveAnimationStyleName(config)) : '',
        buildFinalSceneAntiRepeatLock(state.directorData, sceneIdx, config),
        buildLongStoryboardDisciplineLock(state.directorData, sceneIdx, config),
        buildExtremeAdHookLock(state.directorData, sceneIdx, config),
        buildGenreSalesLock(state.directorData, sceneIdx, config),
        buildSceneIsolationLock(state.directorData, sceneIdx),
        buildContinuityBibleLock(identity),
        buildCastLock(identity),
        buildVoiceLock(identity, state.language),
        buildDialogueDurationLock(config, scene),
        buildTimelineAgeLock(scene, config),
        buildProductLock(identity, !!(state.productReference && state.productReference.length), config),
        buildSettingLock(identity, scene),
        'VISUAL STYLE LOCK: Use exactly ' + resolvedVisualStyle + '. Do not switch medium or rendering language.',
        allowsIllustration
            ? 'STYLE DRIFT FORBIDDEN: Keep the selected style exactly as ' + resolvedVisualStyle + '. Do not drift into a different illustration, animation, comic, anime, or painterly language.'
            : 'STYLE DRIFT FORBIDDEN: Photorealistic/cinematic rendering only in exactly ' + resolvedVisualStyle + '. Do NOT make it cartoon, comic, manga, anime, cel-shaded, 2D animation, vector art, painterly, watercolor, paper cutout, or illustration.',
        'VISIBLE CHANGE REQUIRED: This regenerate must be visibly different on the first click. Create new camera angles, blocking, character poses, expressions, lighting nuance, lens feel, and micro-composition while preserving the same story beat, cast identities, age stage, wardrobe anchors, location, product scale, aspect ratio, and storyboard grid.',
        'REGENERATION VARIATION ID: ' + variationId + '. Use this as a creative seed. Do not reproduce the previous composition exactly.',
        'DIRECTED REGENERATE MODE: Create a fresh alternative version of this same storyboard scene. You may change composition, camera angle, pose, expression, blocking, lighting nuance, and cinematic detail, but ONLY inside the existing story beat.',
        'CONTINUITY GUARDRAILS: keep the named cast count, every CHARACTER_ID forensic identity, role assignment, face shape, hair length/style/texture, skin tone, body/posture, age stage for this timeline, wardrobe/color anchors, locationId, timeOfDay, wardrobeBeat, product scale, aspect ratio, and exact storyboard grid. Do not add new named characters. Do not remove, merge, age-shift, face-swap, hair-swap, or wardrobe-swap characters.',
        'ANOMALY REPAIR DEFAULT: if a previous image had face drift, wrong hair type, wrong age, adult transformation, missing cast, extra cast, mixed-in earlier scene, bad anatomy, warped hands, wrong wardrobe color, wrong location, foreign props, or broken grid, correct those issues in the new generation while keeping a fresh composition.'
    ].filter(Boolean).join('\n\n');
    const headings = ['REGENERATE STRICT LOCK', 'STRICT VISUAL CONSISTENCY GATE', 'CHARACTER FORENSIC RENDER LOCK', 'NO TEXT ARTIFACT LOCK', 'TEXT ARTIFACT CONTROL LOCK', 'FINAL SCENE ANTI-REPEAT LOCK', 'LONG STORYBOARD DISCIPLINE LOCK', 'EXTREME COMMERCIAL HOOK LOCK', 'EXTREME AD HOOK LOCK', 'ADVERTISEMENT SALES STRUCTURE LOCK', 'HYBRID STORY-FIRST SALES LOCK', 'SCENE ISOLATION LOCK', 'CONTINUITY BIBLE LOCK', 'CAST IDENTITY LOCK', 'VOICE CAST LOCK', 'DIALOGUE DURATION LOCK', 'TIMELINE AGE LOCK', 'PRODUCT IDENTITY + SCALE LOCK', 'PRODUCT SCALE LOCK', 'SCENE SETTING LOCK', 'CAMERA VARIETY LOCK', 'VISUAL STYLE LOCK', 'STYLE DRIFT FORBIDDEN', 'VISIBLE CHANGE REQUIRED', 'REGENERATION VARIATION ID', 'AUDIO CONTINUITY LOCK', 'ASPECT RATIO LOCK', 'STORYBOARD GRID LOCK', 'CLEAN VIDEO OPENING', 'DIRECTED REGENERATE MODE'];
    const stripRe = new RegExp('\\n*(?:' + headings.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*(?:—|:)?').join('|') + ')[\\s\\S]*$', 'g');
    const cleanCurrentPrompt = stripLeadingStoryboardGridLocks(currentPrompt || scene.masterImagePrompt || '').replace(stripRe, '').trim();
    return [
        gridLock,
        cleanCurrentPrompt,
        locks
    ].filter(Boolean).join('\n\n');
}

let editingSceneIdx = 0;
let editingShotNumbers = [];
let sceneEditReferenceImages = [];

function renderSceneEditReferencePreview() {
    const preview = document.getElementById('sceneEditReferencePreview');
    if (!preview) return;
    if (!sceneEditReferenceImages.length) {
        preview.innerHTML = '<p class="text-[10px] text-gray-500">Belum ada foto referensi. Upload gambar untuk memandu edit detail wajah, produk, atau setting.</p>';
        return;
    }
    preview.innerHTML = sceneEditReferenceImages.map((item, index) => `
        <div class="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-black/40 group">
            <img src="${item.dataUrl}" class="w-full h-full object-cover" alt="reference-${index + 1}">
            <button type="button" onclick="removeSceneEditReference(${index})" class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `).join('');
}

function removeSceneEditReference(index) {
    if (index < 0 || index >= sceneEditReferenceImages.length) return;
    sceneEditReferenceImages.splice(index, 1);
    renderSceneEditReferencePreview();
}

async function handleSceneEditReferenceFiles(input) {
    const files = Array.from(input.files || []).slice(0, 4);
    input.value = '';
    if (!files.length) return;
    const room = Math.max(0, 4 - sceneEditReferenceImages.length);
    if (room <= 0) {
        alert('Maksimal 4 foto referensi per edit gambar.');
        return;
    }
    const take = files.slice(0, room);
    if (files.length > room) {
        alert('Hanya ' + room + ' foto yang ditambah. Maksimal 4 referensi per edit.');
    }
    for (const file of take) {
        if (!file.type || !file.type.startsWith('image/')) continue;
        const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.readAsDataURL(file);
        });
        const compressed = typeof compressRefImage === 'function' ? await compressRefImage(dataUrl) : { dataUrl };
        sceneEditReferenceImages.push({ name: file.name, dataUrl: compressed.dataUrl || dataUrl });
    }
    renderSceneEditReferencePreview();
}

function openSceneImageEditModal(sceneIdx = 0) {
    editingSceneIdx = sceneIdx;
    editingShotNumbers = [];
    sceneEditReferenceImages = [];
    const scene = state.directorData?.scenes?.[sceneIdx];
    const shotCount = Math.max(1, Number(state.shotsPerScene) || 1);
    const target = document.getElementById('sceneEditTarget');
    const selector = document.getElementById('editShotSelector');
    const prompt = document.getElementById('editScenePrompt');
    const notice = document.getElementById('sceneEditNotice');
    const modal = document.getElementById('sceneImageEditModal');
    const referenceInput = document.getElementById('sceneEditReferenceInput');
    const referencePreview = document.getElementById('sceneEditReferencePreview');

    if (!scene || !selector || !modal) return;
    if (target) target.textContent = `Editing Scene ${sceneIdx + 1}${scene.title ? ` - ${scene.title}` : ''}. Select one or more shot numbers below.`;
    selector.innerHTML = Array.from({ length: shotCount }, (_, index) => `
        <button type="button" data-shot="${index + 1}" onclick="toggleEditShot(${index + 1})" class="w-9 h-9 rounded-lg bg-white/5 hover:bg-pink-500/20 border border-white/10 text-gray-300 font-bold text-xs transition">${index + 1}</button>
    `).join('');
    if (prompt) prompt.value = '';
    if (referenceInput) referenceInput.value = '';
    if (referencePreview) renderSceneEditReferencePreview();
    if (notice) {
        notice.className = 'hidden text-xs p-3 rounded-xl border';
        notice.textContent = '';
    }
    modal.classList.remove('hidden');
}

function toggleEditShot(shotNumber) {
    const index = editingShotNumbers.indexOf(shotNumber);
    if (index === -1) editingShotNumbers.push(shotNumber);
    else editingShotNumbers.splice(index, 1);

    const button = document.querySelector(`#editShotSelector button[data-shot="${shotNumber}"]`);
    if (!button) return;
    button.className = editingShotNumbers.includes(shotNumber)
        ? 'w-9 h-9 rounded-lg bg-pink-600 text-white border border-pink-400 font-bold text-xs transition shadow-lg shadow-pink-500/30'
        : 'w-9 h-9 rounded-lg bg-white/5 hover:bg-pink-500/20 border border-white/10 text-gray-300 font-bold text-xs transition';
}

function closeSceneImageEditModal() {
    const modal = document.getElementById('sceneImageEditModal');
    const input = document.getElementById('sceneEditReferenceInput');
    if (modal) modal.classList.add('hidden');
    if (input) input.value = '';
    sceneEditReferenceImages = [];
    renderSceneEditReferencePreview();
}

function classifySceneImageEdit(instruction) {
    const text = String(instruction || '').toLowerCase();
    const majorPatterns = [
        /\b(?:cuaca|hujan|cerah|mendung|salju|kabut|petir|siang|malam|pagi|sore|subuh)\b/,
        /\b(?:lokasi|setting|set|ruangan|kamar|rumah|kantor|pantai|jalan|background|latar)\b/,
        /\b(?:outfit|pakaian|baju|kemeja|celana|rok|jilbab|kerudung|sepatu|warna rambut|ganti rambut)\b/,
        /\b(?:produk|botol|kemasan|logo|label|warna produk|ukuran produk|bentuk produk|besar(?:kan)? produk|kecil(?:kan)? produk)\b/,
        /\b(?:karakter|wajah|identitas|pemeran|orang baru|hapus karakter|ganti karakter|tambah karakter)\b/
    ];
    const category = majorPatterns.findIndex(pattern => pattern.test(text));
    return {
        scope: category >= 0 ? 'continuity-impacting' : 'local-only',
        reason: category >= 0 ? 'Perubahan menyentuh fondasi kontinuitas.' : 'Perubahan bersifat lokal pada shot/scene target.',
        category: category >= 0 ? ['weather-time', 'location-setting', 'wardrobe', 'product-identity-scale', 'cast-identity'][category] : 'minor-detail'
    };
}

function applySceneEditToContinuity(sceneIdx, instruction, classification, selectedShots) {
    const scene = state.directorData?.scenes?.[sceneIdx];
    if (!scene || !state.directorData) return;
    const change = {
        sceneNumber: scene.sceneNumber || sceneIdx + 1,
        instruction: String(instruction || '').trim(),
        category: classification.category,
        scope: classification.scope,
        shots: selectedShots.slice(),
        timestamp: new Date().toISOString()
    };
    scene.editHistory = Array.isArray(scene.editHistory) ? scene.editHistory : [];
    scene.editHistory.push(change);
    if (classification.scope !== 'continuity-impacting') return;
    const identity = state.directorData.masterVisualIdentity = state.directorData.masterVisualIdentity || {};
    identity.continuityChangeSet = Array.isArray(identity.continuityChangeSet) ? identity.continuityChangeSet : [];
    identity.continuityChangeSet.push(change);
    identity.continuityRevision = Number(identity.continuityRevision || 0) + 1;
    identity.continuityChangeLock = 'Apply the latest approved continuity changes before generating any future scene. Do not revert changed weather, location, wardrobe, cast, or product identity.';
    state.directorData.continuityRevision = identity.continuityRevision;
    state.directorData.continuityChangeSet = identity.continuityChangeSet;
}

async function invokeGeminiRequest(model, request) {
    if (!supabaseClient) throw new Error('Supabase belum terhubung.');
    const { data, error } = await supabaseClient.functions.invoke('gemini-generate', {
    body: { model, request }
    });
    if (!error) return data;

    let message = error.message || 'Gagal memanggil Edge Function.';
    if (error.context) {
        try {
            const response = error.context;
            const raw = await response.clone().text();
            const details = JSON.parse(raw);
            if (details?.error) message = details.error;
        } catch (_) { /* Keep the SDK message when no JSON error is available. */ }
    }
    if (/failed to send a request/i.test(message)) {
        message = 'Edge Function gemini-generate tidak dapat dipanggil. Pastikan function sudah di-deploy pada project Supabase ini.';
    }
    throw new Error(message);
}

async function invokeGeminiImageRequest(request, options = {}) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent';
    const response = await fetchWithExponentialBackoff(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: options.signal
    }, 3, 90000);
    if (!response.ok) throw new Error('Gemini Image API HTTP ' + response.status);
    return response.json();
}

function downloadSceneImage(sceneIdx) {
    const scene = state.directorData?.scenes?.[sceneIdx];
    const image = document.getElementById('sceneImg_' + sceneIdx);
    const source = getSceneImageDataUrl(sceneIdx)
        || scene?.finalAssetState?.imageDataUrl
        || (state.episodeSeries || []).find(episode => episode.episode === state.currentEpisode)?.images?.[sceneIdx]
        || (image && image.src !== window.location.href ? image.src : null);
    if (!source) return;
    downloadImage(source, 'TRENDORA-scene-' + String(sceneIdx + 1).padStart(2, '0') + '.png');
}

function showSceneImageOverlay(sceneIdx, message) {
    const container = document.getElementById(`sceneImgContainer_${sceneIdx}`);
    if (!container) return null;
    let overlay = document.getElementById(`sceneImgLoading_${sceneIdx}`);
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = `sceneImgLoading_${sceneIdx}`;
        container.appendChild(overlay);
    }
    overlay.className = 'absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-black/70 backdrop-blur-[2px]';
    overlay.innerHTML = `
        <div class="relative w-16 h-16 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border-2 border-purple-500/20"></div>
            <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-pink-500 animate-spin" style="animation-duration:1s"></div>
            <div class="absolute inset-2 rounded-full border-2 border-transparent border-b-cyan-500 animate-spin" style="animation-duration:1.5s;animation-direction:reverse"></div>
            <div class="absolute inset-4 rounded-full border-2 border-transparent border-r-yellow-400 animate-spin" style="animation-duration:0.8s;animation-direction:reverse"></div>
        </div>
        <p class="text-[11px] text-white/80 font-medium tracking-wide text-center px-4">${message || 'Memperbaiki anomali...'}</p>
    `;
    overlay.classList.remove('hidden');
    return overlay;
}

function hideSceneImageOverlay(sceneIdx) {
    document.getElementById(`sceneImgLoading_${sceneIdx}`)?.classList.add('hidden');
}

function classifyPlaceImageAudit(audit) {
    if (!audit || typeof audit.ok !== 'boolean' || !Array.isArray(audit.issues)) return 'unavailable';
    if (audit.ok === true && audit.issues.length === 0) return 'approved';
    if (audit.ok === false && audit.issues.length && audit.issues.every(issue => issue && typeof issue.problem === 'string' && issue.problem.trim() && typeof issue.fix === 'string' && issue.fix.trim())) return 'rejected';
    return 'unavailable';
}

async function approvePlaceStoryboardImage(initialImage, scene, sceneIdx, config, originalRequest) {
    // Candidates remain private until an explicit, valid audit approves them.
    let candidate = initialImage;
    for (let editAttempt = 0; editAttempt <= 2; editAttempt++) {
        let audit = null;
        let verdict = 'unavailable';
        for (let auditAttempt = 0; auditAttempt < 2; auditAttempt++) {
            throwIfStoryboardCancelled();
            audit = await auditSceneImageForDrift(scene, sceneIdx, config, candidate);
            throwIfStoryboardCancelled();
            verdict = classifyPlaceImageAudit(audit);
            console.warn('[Place image audit]', { scene: sceneIdx + 1, editAttempt, auditAttempt, verdict, issues: audit && audit.issues || [] });
            if (verdict !== 'unavailable') break;
        }
        if (verdict === 'approved') return candidate;
        if (verdict === 'unavailable') {
            const error = new Error('Place image audit unavailable after two checks of the same candidate.');
            error.code = 'STORYBOARD_AUDIT_UNAVAILABLE';
            throw error;
        }
        if (editAttempt === 2) {
            const error = new Error('Place image still has confirmed reference differences after two edits.');
            error.code = 'STORYBOARD_VISUAL_DRIFT'; error.auditIssues = audit.issues;
            throw error;
        }
        const match = candidate.match(/^data:(image\/[^;]+);base64,([\s\S]+)$/);
        if (!match) throw new Error('Invalid place image edit candidate.');
        const request = structuredClone(originalRequest);
        const parts = request.contents[request.contents.length - 1].parts;
        parts.push({ text: 'LOCAL IMAGE CORRECTION: The following image is the rejected EDIT TARGET, never a replacement identity reference. Edit this exact candidate to fix ONLY the verified issues listed below. Original character and place photos remain authoritative. Preserve every correct face, body, outfit, location feature, camera composition, panel count and shot action. Do not invent new features or restage the entire scene.\n' + JSON.stringify(audit.issues) });
        parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
        throwIfStoryboardCancelled();
        const response = await invokeGeminiImageRequest(request, { signal: storyboardAbortCtrl ? storyboardAbortCtrl.signal : undefined });
        throwIfStoryboardCancelled();
        const edited = pickGeminiImageDataUrl(response);
        if (!edited) {
            const error = new Error('Place image edit returned no image.'); error.code = 'STORYBOARD_EDIT_EMPTY'; throw error;
        }
        candidate = edited;
    }
}

async function auditSceneImageForDrift(scene, sceneIdx, config, existingImageDataUrl) {
    if (!existingImageDataUrl) return null;
    const identity = (state.directorData && state.directorData.masterVisualIdentity) || {};
    const chars = Array.isArray(identity.characters) ? identity.characters : [];
    const product = identity.product;
    const parts = [{ text: 'You are a senior storyboard continuity editor. Audit ONE generated storyboard image against the locked cast and product reference. Return JSON only, no markdown:\n{\n  "issues": [\n    { "type": "character" | "product" | "drift", "subject": "CHARACTER_1" | "CHARACTER_2" | "product" | "scene", "problem": "concrete short description (1 sentence)", "fix": "concrete single-sentence instruction to add to the prompt so the next render fixes it" }\n  ],\n  "ok": true | false\n}' }];
    if (isPlacePromotion(config)) {
        parts.push({ text: 'CURRENT SCENE CONTRACT: ' + JSON.stringify({
            sceneNumber: scene.sceneNumber || sceneIdx + 1,
            locationId: scene.locationId, timeOfDay: scene.timeOfDay,
            wardrobeBeat: scene.wardrobeBeat, sceneBeat: scene.sceneBeat,
            visualPlan: scene.sceneVisualPlan, shots: scene.shots,
            participants: scene.dialoguePlan && scene.dialoguePlan.participants,
            continuityFromPrevious: scene.continuityFromPrevious,
            continuityToNext: scene.continuityToNext,
            settingLock: buildSettingLock(identity, scene)
        }) + '\nAudit the current scene only. Other location photos may show different angles/rooms of the same site; do not require all rooms or landmarks in every panel. An occluded or out-of-frame feature is not proof it is missing. Flag concrete visible contradictions, not unreadable tiny text or camera/style differences. Preserve identity and all visible reference features. Return ok:false only with concrete problem and actionable fix for each issue.' });
        [['CHARACTER IDENTITY REFERENCE', config.characterReference], ['LOCKED PLACE REFERENCE', config.locationReference]].forEach(([label, refs]) => (refs || []).forEach((ref, index) => {
            const image = ref && String(ref.dataUrl || '').match(/^data:(.+);base64,(.+)$/);
            if (image) parts.push({ text: label + ' ' + (index + 1) }, { inlineData: { mimeType: image[1], data: image[2] } });
        }));
        parts.push({ text: buildPlacePromotionContract(config) + '\nAudit against ALL original photos: character identity, wardrobe, site architecture, terrain, layout and signage. Product-category photos depicting a site are place references, regardless of subsequent generic labels. Flag changed or invented site features. Camera angle alone is not drift. LOCATION LOCKS: ' + JSON.stringify(identity.locations || []) });
    }
    if (config && config.productReference && config.productReference.length) {
        config.productReference.forEach((ref, idx) => {
            if (!ref || !ref.dataUrl) return;
            const match = ref.dataUrl.match(/^data:(.+);base64,(.+)$/);
            if (!match) return;
            parts.push({ text: 'PRODUCT REFERENCE ' + (idx + 1) + ' — the locked hero product design.' });
            parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
        });
    }
    const match = existingImageDataUrl.match(/^data:(.+);base64,(.+)$/);
    if (match) {
        parts.push({ text: 'GENERATED IMAGE — audit this against the references and locks below.' });
        parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }
    const lockSummary = [];
    chars.forEach((c) => {
        const id = c.characterId || 'CHARACTER';
        const bits = [c.identity, c.faceLock, c.hairLock, c.skinLock, c.bodyLock, c.wardrobeDefault].filter(Boolean).join('; ');
        if (bits) lockSummary.push(id + ': ' + bits);
    });
    if (product) {
        const bits = [product.look, product.shapeLock, product.colorMaterialLock, product.labelLogoLock, product.detailLock, product.realWorldSize].filter(Boolean).join('; ');
        if (bits) lockSummary.push('PRODUCT: ' + bits);
    }
    if (lockSummary.length) {
        parts.push({ text: 'LOCKS — what the generated image MUST match:\n' + lockSummary.join('\n') });
    }
    parts.push({ text: 'Find concrete drift only: wrong face / wrong hair / wrong skin tone / wrong wardrobe color / wrong product silhouette / wrong product color or material / wrong product size / unregistered extra person. Return empty issues array if everything matches. Do not nitpick style or composition; only flag clear continuity or identity drift.' });
    try {
        const result = await invokeStoryboardTextRequest({
            contents: [{ role: 'user', parts }],
            generationConfig: { responseMimeType: 'application/json' }
        });
        const raw = (result?.candidates?.[0]?.content?.parts || []).filter(part => !part.thought).map(part => part.text || '').join('') || result?.text || '';
        return parseGeminiJsonResponse(raw);
    } catch (err) {
        if (err.permanent || err.code === 'CANCELLED' || storyboardCancelled) throw err;
        console.warn('[Drift audit] failed:', err && err.message);
        return null;
    }
}

async function regenerateSceneImage(sceneIdx) {
    if (sceneGenerationActive || storyboardGenerating) return;
    const scene = state.directorData?.scenes?.[sceneIdx];
    const container = document.getElementById(`sceneImgContainer_${sceneIdx}`);
    let image = document.getElementById(`sceneImg_${sceneIdx}`) || container?.querySelector('img');
    const button = document.getElementById('btnRegenerateScene_' + sceneIdx);
    if (!scene) {
        alert('Data scene tidak ditemukan.');
        return;
    }
    const promptText = (document.getElementById('masterImagePrompt_' + sceneIdx) || {}).value || scene.masterImagePrompt;
    if (!promptText) {
        alert('Prompt adegan tidak tersedia.');
        return;
    }
    const adjacentRefs = collectAdjacentSceneContinuityRefs(sceneIdx);
    const episode = await ensureStoryboardHistoryRecord(state.directorData);
    const existingImage = getSceneImageDataUrl(sceneIdx) || (episode && episode.images && episode.images[sceneIdx]);
    let driftIssues = [];

    setSceneGenerationLock(true, sceneIdx);
    if (button) button.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-1"></i>Audit + Generate ulang...';

    try {
        const beforeDialogue = String(scene.dialogueOrNarration || '');
        await repairDialogueViolations(state.directorData, state);
        if (String(scene.dialogueOrNarration || '') !== beforeDialogue) {
            applyStoryboardSceneLocks(state.directorData, sceneIdx, state);
            const videoArea = document.getElementById('masterVideoPrompt_' + sceneIdx);
            if (videoArea) videoArea.value = state.directorData.scenes[sceneIdx].masterVideoPrompt || '';
            await persistCurrentStoryboardHistory();
        }
    } catch (dialogueErr) {
        console.warn('[Regenerate] dialogue audit failed, proceeding with current prompt:', dialogueErr && dialogueErr.message);
    }

    if (existingImage) {
        showSceneImageOverlay(sceneIdx, 'TRENDORA AI sedang mengaudit: cek karakter, produk, dan kunci kontinuitas...');
        try {
            const audit = await auditSceneImageForDrift(scene, sceneIdx, state, existingImage);
            if (audit && Array.isArray(audit.issues) && audit.issues.length) {
                driftIssues = audit.issues;
                console.info('[Regenerate] Drift detected in scene ' + sceneIdx + ':', driftIssues);
            } else {
                console.info('[Regenerate] No drift for scene ' + sceneIdx + '.');
            }
        } catch (auditErr) {
            console.warn('[Regenerate] audit failed, proceeding without drift fix:', auditErr.message);
        }
    }

    const directedPrompt = buildDirectedRegeneratePrompt(sceneIdx, promptText);
    let finalPrompt = directedPrompt;
    if (driftIssues.length) {
        const fixList = driftIssues.map(i => '- ' + (i.subject || 'issue') + ': ' + (i.problem || '') + '. FIX: ' + (i.fix || '')).join('\n');
        finalPrompt = directedPrompt + '\n\nDIRECTOR AUDIT FINDINGS — fix these drift issues in the next render:\n' + fixList;
    }
    scene.masterImagePrompt = finalPrompt;
    const promptArea = document.getElementById('masterImagePrompt_' + sceneIdx);
    if (promptArea) promptArea.value = finalPrompt;

    showSceneImageOverlay(
        sceneIdx,
        driftIssues.length
            ? 'Terdapat ' + driftIssues.length + ' drift pada gambar — regenerate dengan perbaikan...'
            : (adjacentRefs.length
                ? 'Generate ulang variasi baru dengan konteks teks adegan sebelum/sesudah...'
                : 'Generate ulang variasi baru: cast, umur, lokasi, style, dan grid tetap terkunci...')
    );

    try {
        const imgDataUrl = await generateStoryboardImageForPrompt(finalPrompt, state.episodePlate, adjacentRefs, {
            sceneIdx,
        currentSceneImage: existingImage,
        prevSceneAnchor: sceneIdx > 0 ? getSceneImageDataUrl(sceneIdx - 1) || episode.images[sceneIdx - 1] : null
        });
        let finalImageDataUrl = imgDataUrl;
        let fixedDriftIssues = [];
        const generatedAudit = await auditSceneImageForDrift(scene, sceneIdx, state, imgDataUrl);
        if (generatedAudit && Array.isArray(generatedAudit.issues) && generatedAudit.issues.length) {
        fixedDriftIssues = generatedAudit.issues;
        const fixList = fixedDriftIssues.map(i => '- ' + (i.subject || 'issue') + ': ' + (i.problem || '') + '. FIX: ' + (i.fix || '')).join('\n');
        const fixedPrompt = finalPrompt + '\n\nPOST-RENDER PRODUCT/CONTINUITY AUDIT — the previous render drifted. Create a fixed replacement image now. Restore these exact defects while preserving the requested variation:\n' + fixList;
        scene.masterImagePrompt = fixedPrompt;
        if (promptArea) promptArea.value = fixedPrompt;
        showSceneImageOverlay(sceneIdx, 'Audit menemukan drift pada hasil baru — membuat gambar fixed...');
        finalImageDataUrl = await generateStoryboardImageForPrompt(fixedPrompt, imgDataUrl, adjacentRefs, {
            sceneIdx,
            currentSceneImage: imgDataUrl,
            prevSceneAnchor: sceneIdx > 0 ? getSceneImageDataUrl(sceneIdx - 1) || episode.images[sceneIdx - 1] : null
        });
        }
        if (!image && container) {
            image = document.createElement('img');
            image.id = 'sceneImg_' + sceneIdx;
            image.className = 'w-full h-auto object-contain rounded-2xl';
            container.appendChild(image);
        }
        if (!image) throw new Error('Elemen gambar tidak ditemukan.');
        image.classList.remove('hidden', 'opacity-0');
        image.src = finalImageDataUrl;
        scene.regeneratedImage = finalImageDataUrl;
        scene.editedImage = finalImageDataUrl;
        episode.images[sceneIdx] = finalImageDataUrl;
        if (sceneIdx === 0) state.episodePlate = finalImageDataUrl;
        applyStoryboardSceneLocks(state.directorData, sceneIdx, state);
        const refreshedImageArea = document.getElementById('masterImagePrompt_' + sceneIdx);
        const refreshedVideoArea = document.getElementById('masterVideoPrompt_' + sceneIdx);
        if (refreshedImageArea) refreshedImageArea.value = scene.masterImagePrompt || refreshedImageArea.value;
        if (refreshedVideoArea) refreshedVideoArea.value = scene.masterVideoPrompt || refreshedVideoArea.value;
        scene.finalAssetState = {
            imageDataUrl: finalImageDataUrl,
            imagePrompt: scene.masterImagePrompt || finalPrompt,
            videoPrompt: scene.masterVideoPrompt || '',
            assetRefs: scene.promptCompiler && scene.promptCompiler.assetRefs || {},
            updatedAt: new Date().toISOString()
        };
        syncEpisodeSeriesScene(sceneIdx, finalImageDataUrl);
        document.getElementById('downloadImgBtn_' + sceneIdx)?.classList.remove('hidden');
        await persistCurrentStoryboardHistory();
        if (driftIssues.length || fixedDriftIssues.length) {
            showCanvasNotice('Audit selesai. Gambar baru sudah diperbaiki dan prompt video sudah diperbarui.', 'success');
        } else if (existingImage) {
            showCanvasNotice('Audit selesai: tidak ada drift karakter/produk terdeteksi. Prompt video sudah diperbarui.', 'success');
        }
    } catch (err) {
        console.error('[Storyboard Regenerate] Failed:', err);
        alert('Generate ulang gagal: ' + (err?.message || 'Unknown error'));
    } finally {
        hideSceneImageOverlay(sceneIdx);
        setSceneGenerationLock(false);
        if (button) button.innerHTML = '<i class="fa-solid fa-arrows-rotate mr-1"></i>Generate Ulang';
    }
}

function syncEpisodeSeriesScene(sceneIdx, imageDataUrl) {
    const ep = (state.episodeSeries || []).find(e => e.episode === state.currentEpisode);
    if (!ep) return;
    ep.breakdown = state.directorData;
    if (!ep.images) ep.images = [];
    if (imageDataUrl) ep.images[sceneIdx] = imageDataUrl;
}

async function syncPromptsFromSceneEdit(sceneIdx, instruction, editScope) {
    const scene = state.directorData?.scenes?.[sceneIdx];
    if (!scene) return;
    const imgArea = document.getElementById('masterImagePrompt_' + sceneIdx);
    const videoArea = document.getElementById('masterVideoPrompt_' + sceneIdx);
    const currentImage = (imgArea && imgArea.value) || scene.masterImagePrompt || '';
    const currentVideo = (videoArea && videoArea.value) || scene.masterVideoPrompt || '';
    const syncConfig = {
        story: state.story,
        storyboardMode: state.storyboardMode,
        language: state.language,
        visualStyle: state.visualStyle,
        customStyle: state.customStyle,
        animationStyle: state.animationStyle,
        animationCustomStyle: state.animationCustomStyle,
        characterReference: state.characterReference,
        productReference: state.productReference,
        locationReference: state.locationReference,
        shotsPerScene: state.shotsPerScene,
        aspectRatio: state.aspectRatio
    };
    normalizeContinuityBible(state.directorData, syncConfig);
    const syncIdentity = state.directorData?.masterVisualIdentity || {};
    const previousDialogue = scene.dialogueOrNarration || '';
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';
    const payload = {
        contents: [{ parts: [{ text: `User edited storyboard scene ${sceneIdx + 1}. Instruction: "${instruction}". Scope: ${editScope}.
Detect if this changes story, action, camera, lighting, wardrobe, location, or dialogue. Update BOTH prompts to match the NEW scene.
Keep SCENE ISOLATION LOCK, CONTINUITY BIBLE LOCK, CAST IDENTITY LOCK, PRODUCT IDENTITY + SCALE LOCK, SCENE SETTING LOCK, CAMERA VARIETY LOCK, VISUAL STYLE LOCK, AUDIO CONTINUITY LOCK, ASPECT RATIO LOCK verbatim unless the user explicitly changed the product.
Every CHARACTER_1, CHARACTER_2, CHARACTER_3, etc. must preserve face, hair type, skin, body/posture, age stage, role, and locked outfit from this Bible:
${buildStrictVisualConsistencyGate(state.directorData, sceneIdx, syncConfig)}
${buildDialoguePlanLock(scene)}
${buildNoTextArtifactLock(syncConfig)}
${buildContinuityBibleLock(syncIdentity)}
${buildProductLock(syncIdentity, !!(state.productReference && state.productReference.length))}
${buildSponsoredStoryPropLock(syncConfig, syncIdentity)}
${state.directorData?.masterVisualIdentity?.continuityChangeLock || ''}
CONTINUITY CHANGE SET: ${JSON.stringify(state.directorData?.masterVisualIdentity?.continuityChangeSet || [])}
${buildSceneIsolationLock(state.directorData, sceneIdx)}
        Spoken lines in ${state.language}. Aspect ratio ${state.aspectRatio}. Put [AUDIO / DIALOGUE] near the beginning, immediately before the dialogue, voice, and performance locks.
The updatedVideoPrompt must be a clean production prompt for a video model: describe visible motion, shot timing, camera, setting, characters, sound, and dialogue only. Do not include director commentary, planning language, blueprint labels, quality gates, reasoning, repeated locks, or instructions about how to interpret the prompt. If the edit is cosmetic only, reflect it in the video prompt without rewriting the whole plot.
Current image prompt:\n${currentImage}\n\nCurrent video prompt:\n${currentVideo}\n\nReturn JSON: {"updatedImagePrompt":"...","updatedVideoPrompt":"...","dialogueOrNarration":"..."}` }] }],
        generationConfig: { responseMimeType: "application/json" }
    };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    let result = {};
    try { result = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'); } catch (e) { result = {}; }
    if (result.updatedImagePrompt) {
        scene.masterImagePrompt = result.updatedImagePrompt;
        if (imgArea) imgArea.value = result.updatedImagePrompt;
    }
    if (result.updatedVideoPrompt) {
        scene.masterVideoPrompt = enforceCleanVideoOpening(moveAudioDialogueToBottom(result.updatedVideoPrompt, result.dialogueOrNarration || scene.dialogueOrNarration));
        if (videoArea) videoArea.value = scene.masterVideoPrompt;
    }
    if (result.dialogueOrNarration) scene.dialogueOrNarration = result.dialogueOrNarration;
    applyStoryboardLocks(state.directorData, syncConfig);
    try {
        validateInteractiveDialogueContract(state.directorData, syncConfig);
    } catch (error) {
        scene.dialogueOrNarration = previousDialogue;
        applyStoryboardLocks(state.directorData, syncConfig);
        console.warn('[Prompt sync] Rejected invalid interactive dialogue:', error.message);
    }
    if (imgArea) imgArea.value = state.directorData?.scenes?.[sceneIdx]?.masterImagePrompt || imgArea.value;
    if (videoArea) videoArea.value = state.directorData?.scenes?.[sceneIdx]?.masterVideoPrompt || videoArea.value;
}

function applyVisualEditToVideoPrompt(scene, instruction, selectedShots) {
    if (!scene || !instruction) return '';
    const shots = Array.isArray(selectedShots) ? selectedShots.filter(Number.isFinite) : [];
    const shotLabel = shots.length ? 'Shot ' + shots.join(', ') : 'seluruh shot/panel scene';
    const markerStart = 'USER VISUAL EDIT LOCK — BEGIN';
    const markerEnd = 'USER VISUAL EDIT LOCK — END';
    const existing = String(scene.masterVideoPrompt || '')
        .replace(new RegExp('\\n*' + markerStart + '[\\s\\S]*?' + markerEnd, 'gi'), '')
        .trim();
    const lock = [
        markerStart,
        'The generated storyboard image was edited by the user.',
        'Apply this visual change to ' + shotLabel + ' in the video:',
        String(instruction).trim(),
        'The edited image is authoritative for the requested change. Preserve all non-target shots, registered cast identity, product identity, setting continuity, timing, and aspect ratio.',
        markerEnd
    ].join('\n');
    scene.masterVideoPrompt = enforceCleanVideoOpening([existing, lock].filter(Boolean).join('\n\n'));
    return scene.masterVideoPrompt;
}

async function generateEditedSceneImage() {
    const notice = document.getElementById('sceneEditNotice');
    const button = document.getElementById('btnSceneImageEdit');
    const instruction = document.getElementById('editScenePrompt')?.value.trim() || '';
    const image = document.getElementById(`sceneImg_${editingSceneIdx}`);

    const showNotice = (message, type = 'error') => {
        if (!notice) return;
        notice.textContent = message;
        notice.className = type === 'success'
            ? 'text-xs p-3 rounded-xl border text-emerald-300 bg-emerald-500/10 border-emerald-500/20 block'
            : 'text-xs p-3 rounded-xl border text-red-300 bg-red-500/10 border-red-500/20 block';
    };

    if (!instruction) {
        showNotice('Tuliskan perubahan yang diinginkan.');
        return;
    }
    if (!image?.src?.startsWith('data:')) {
        showNotice('Gambar scene belum tersedia.');
        return;
    }

    const imageMatch = image.src.match(/^data:(.+);base64,(.+)$/);
    if (!imageMatch) {
        showNotice('Format gambar scene tidak valid.');
        return;
    }

    const selectedShots = [...editingShotNumbers].sort((a, b) => a - b);
    const editClassification = classifySceneImageEdit(instruction);
    const editScope = selectedShots.length
        ? `Edit only Shot(s) ${selectedShots.join(' and ')}. Preserve every other shot/panel exactly unchanged.`
        : 'No shot was selected. Apply the requested change to the whole image.';
    const editConfig = {
        story: state.story,
        storyboardMode: state.storyboardMode,
        language: state.language,
        visualStyle: state.visualStyle,
        customStyle: state.customStyle,
        animationStyle: state.animationStyle,
        animationCustomStyle: state.animationCustomStyle,
        characterReference: state.characterReference,
        productReference: state.productReference,
        locationReference: state.locationReference,
        shotsPerScene: state.shotsPerScene,
        aspectRatio: state.aspectRatio
    };
    normalizeContinuityBible(state.directorData, editConfig);
    const editIdentity = state.directorData?.masterVisualIdentity || {};
    const editScene = state.directorData?.scenes?.[editingSceneIdx] || {};
    const promptText = [
        `You are editing Scene ${editingSceneIdx + 1} of a composite storyboard image.`,
        editScope,
        'Apply this user instruction: ' + instruction + '.',
        sceneEditReferenceImages.length ? 'USER-ATTACHED REFERENCE PHOTOS: these are visual anchors. Use them only as guidance for the requested edit, but do not let them override the locked cast, props, location, or continuity rules unless the user explicitly requests a direct style or identity correction.' : '',
        buildStrictVisualConsistencyGate(state.directorData, editingSceneIdx, editConfig),
        buildNoTextArtifactLock(editConfig),
        buildFinalSceneAntiRepeatLock(state.directorData, editingSceneIdx, editConfig),
        buildSceneIsolationLock(state.directorData, editingSceneIdx),
        buildContinuityBibleLock(editIdentity),
        buildCastLock(editIdentity),
        buildTimelineAgeLock(editScene, editConfig),
        buildProductLock(editIdentity, !!(state.productReference && state.productReference.length)),
        buildSettingLock(editIdentity, editScene),
        `EDIT SCOPE: ${editClassification.scope}. ${editClassification.reason} ${editClassification.scope === 'continuity-impacting'
            ? 'This change must be recorded in the continuity blueprint and applied to every future affected scene.'
            : 'Keep this change local to the selected shot(s) and do not rewrite the global blueprint.'}`,
        'EDIT GUARDRAILS: preserve every CHARACTER_ID face, hair type, age stage, body/posture, role, and wardrobe unless the user explicitly requested a justified new-day/place wardrobe change. Preserve hero product category, silhouette, color/material, label/logo placement, distinctive details, real-world size, and product-to-body scale unless the user explicitly changes the product. Do not import any location, outfit, prop, or action from another scene. Preserve the storyboard grid and all non-target panels. Return only the edited image.'
    ].filter(Boolean).join('\n\n');
    const request = {
        contents: [{
            role: 'user',
            parts: [
                { text: promptText },
                { inlineData: { mimeType: imageMatch[1], data: imageMatch[2] } }
            ]
        }],
        generationConfig: {
            responseModalities: ['IMAGE'],
            imageAspectRatios: [state.aspectRatio || '9:16']
        }
    };
    sceneEditReferenceImages.forEach((ref, index) => {
        const refMatch = (ref && ref.dataUrl || '').match(/^data:(.+);base64,(.+)$/);
        if (!refMatch) return;
        request.contents[0].parts.push({ text: `REFERENCE PHOTO ${index + 1} — attached by the user for this edit. Use it to guide the requested visual change, but keep the locked continuity and character identity intact unless the user explicitly asks to change it.` });
        request.contents[0].parts.push({ inlineData: { mimeType: refMatch[1], data: refMatch[2] } });
    });

    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-1"></i> Memproses...';
    }
    closeSceneImageEditModal();
    if (notice) notice.className = 'hidden text-xs p-3 rounded-xl border';
    showSceneImageOverlay(
        editingSceneIdx,
        selectedShots.length
            ? `Mengedit shot ${selectedShots.join(', ')} dan mengunci panel lain tetap konsisten...`
            : 'Mengedit seluruh gambar sambil menjaga cast, lokasi, style, dan grid tetap konsisten...'
    );

    try {
        const data = await invokeGeminiImageRequest(request);
        const editedDataUrl = pickGeminiImageDataUrl(data);
        if (!editedDataUrl) throw new Error(data?.error || 'Hasil edit gambar kosong.');
        image.src = editedDataUrl;
        image.classList.remove('hidden', 'opacity-0');
        hideSceneImageOverlay(editingSceneIdx);
        const scene = state.directorData?.scenes?.[editingSceneIdx];
        if (scene) {
            scene.editedImage = editedDataUrl;
            scene.regeneratedImage = editedDataUrl;
            scene.visualEditInstruction = instruction;
            scene.visualEditShots = selectedShots.slice();
            applySceneEditToContinuity(editingSceneIdx, instruction, editClassification, selectedShots);
        }
        const downloadButton = document.getElementById(`downloadImgBtn_${editingSceneIdx}`);
        downloadButton?.classList.remove('hidden');
        try {
            await syncPromptsFromSceneEdit(editingSceneIdx, instruction, editScope + ' ' + editClassification.reason);
        } catch (e) {
            console.error('[Prompt sync] Failed:', e);
        }
        const syncedScene = state.directorData?.scenes?.[editingSceneIdx];
        if (syncedScene) {
            const finalVideoPrompt = applyVisualEditToVideoPrompt(syncedScene, instruction, selectedShots);
            const finalVideoArea = document.getElementById('masterVideoPrompt_' + editingSceneIdx);
            if (finalVideoArea) finalVideoArea.value = finalVideoPrompt;
        }
        syncEpisodeSeriesScene(editingSceneIdx, editedDataUrl);
        await persistCurrentStoryboardHistory();
    } catch (err) {
        console.error('[Storyboard Edit] Failed:', err);
        showNotice('Gagal edit gambar: ' + (err?.message || 'Unknown error'));
    } finally {
        hideSceneImageOverlay(editingSceneIdx);
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles mr-1"></i>Generate';
        }
    }
}

/* ----------------------------------------------------------------- */
/* AI COPILOT & VOICE GENERATORS                                     */
/* ----------------------------------------------------------------- */

async function enhanceStoryWithAI(styleType) {
    const inputEl = document.getElementById('promptInput');
    if (!inputEl || !inputEl.value.trim()) {
        alert("Tulis ide cerita dasar terlebih dahulu!");
        return;
    }
    const loader = document.getElementById('aiEnhanceLoader');
    if (loader) loader.classList.remove('hidden');

    try {
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

        const rawStory = inputEl.value.trim();
        const genre = detectGenre(rawStory);
        const genreContext = {
            advertisement: 'Format IKLAN. Hook 1-3 detik wajib extreme visual hook yang fresh dan tidak monoton, body manfaat, CTA akhir natural yang tidak klise.',
            horror: 'Format HORROR. Atmosfer, dread, withheld reveal. Jangan CTA. Jangan lucu.',
            dramatic: 'Format DRAMA. Karakter, konflik batin, momen peak. Jangan elemen promo.',
            comedy: 'Format KOMEDI. Setup visual, timing, payoff. Jangan CTA kecuali jelas iklan lucu.',
            educational: 'Format EDUKASI. Satu ide per beat, kejelasan, progressive reveal.',
            action: 'Format ACTION. Momentum, geografi ruang, impact. Jangan CTA kecuali iklan.',
            documentary: 'Format DOKUMENTER. Observational, authentic. Jangan dramatisasi berlebihan.',
            hybrid: 'Format CAMPURAN CERITA+IKLAN. Cerita tetap utama. Produk/promo diselipkan natural di tengah cerita. Jangan beri CTA di akhir.',
            neutral: 'Format GENERAL. Bangun narasi engaging dengan pacing yang baik.'
        }[genre] || 'Format GENERAL. Bangun narasi engaging dengan pacing yang baik.';

        const systemPrompt = `Anda adalah TRENDORA Senior & Head Scriptwriter papan atas Indonesia. kembangkan ide kasar menjadi skrip video pendek yang上市 (viral-worthy) dan sinematik.

ATURAN:
- Bahasa output: Bahasa Indonesia yang natural dan engaging
- ${genreContext}
- Tulis dalam bentuk paragraf naratif sinematik, bukan bullet points
- Maksimal 3-4 paragraf pendek yang padat dan vivid
- Setiap paragraf harus memiliki detail visual, audio, dan emosional
- Jangan gunakan bahasa generik — setiap kalimat harus terasa visual dan sensoris`;

        const userQuery = `Poles dan kembangkan ide video berikut dengan gaya ${styleType.toUpperCase()}:
"${rawStory}"

Genre terdeteksi: ${genre.toUpperCase()}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
        };

        const response = await fetchWithExponentialBackoff(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (generatedText) {
            inputEl.value = generatedText.trim();
            state.story = generatedText.trim();
            alert(`Naskah berhasil dipoles! (Genre: ${genre.toUpperCase()})`);
        }
    } catch (err) {
        alert("Gagal memoles skrip: " + err.message);
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}


function parseSceneDialogueSegments(dialogText) {
    const out = [];
    const lines = String(dialogText || '').split('\n').map(line => line.trim()).filter(Boolean);
    const speakerLineRe = /^(?:\[[^\]]+\]\s*)?(CHARACTER_\d+|VOICEOVER|NARRATOR)\s*:\s*(.+)$/i;
    for (const line of lines) {
        const m = line.match(speakerLineRe);
        if (m) {
            const speakerId = m[1].toUpperCase();
            let text = m[2].trim().replace(/^["']|["']$/g, '').replace(/\\"/g, '"');
            if (text) out.push({ speakerId, text });
        } else if (out.length) {
            // Continuation of the previous speaker line.
            out[out.length - 1].text += ' ' + line.replace(/^["']|["']$/g, '').trim();
        }
    }
    return out;
}

function resolveSceneVoiceFor(speakerId, scene, identity) {
    const cast = (scene && scene.voiceCast) || {};
    const bindings = (identity && typeof identity.voiceBindings === 'object') ? identity.voiceBindings : null;
    if (speakerId === 'VOICEOVER' || speakerId === 'NARRATOR') {
        return cast.VOICEOVER || cast.NARRATOR || FEMALE_TTS_VOICE;
    }
    if (cast[speakerId]) return cast[speakerId];
    const chars = (identity && identity.characters) || [];
    const ch = chars.find(character => String(character.characterId || '').toUpperCase() === speakerId);
    // V5.0 (Isu #1): walk the explicit fields first, then binding,
    // then inference. NEVER default to MALE here — leave it empty
    // so the caller can surface the warning rather than silently
    // flip a female character to Puck.
    if (ch) {
        const explicit = normalizeGeminiVoiceName(ch.voiceName || ch.ttsVoice);
        if (explicit) return explicit;
        if (bindings && normalizeGeminiVoiceName(bindings[speakerId])) {
            return bindings[speakerId];
        }
        const inferred = assignDefaultVoiceName(ch, chars.indexOf(ch), bindings);
        if (inferred) return inferred;
        try { console.warn('[V5.0 Voice Lock] resolveSceneVoiceFor could not resolve voice for ' + speakerId + ' — returning empty.'); } catch (_) {}
        return '';
    }
    return '';
}

function combinePcmChunks(pcmChunks, sampleRate, silenceSeconds) {
    const gapSamples = Math.max(0, Math.floor((silenceSeconds || 0) * sampleRate));
    const gap = gapSamples > 0 ? new Int16Array(gapSamples) : null;
    const totalLen = pcmChunks.reduce((sum, chunk) => sum + chunk.length + (gap ? gapSamples : 0), 0);
    const combined = new Int16Array(Math.max(0, totalLen));
    let offset = 0;
    for (let i = 0; i < pcmChunks.length; i++) {
        const chunk = pcmChunks[i];
        if (chunk && chunk.length) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }
        if (gap && i < pcmChunks.length - 1) {
            offset += gapSamples;
        }
    }
    return combined;
}

async function generateAIVoiceForScene(sceneIdx) {
    const scene = state.directorData?.scenes?.[sceneIdx];
    if (!scene) return;
    if (isSilentAudioMode(state)) {
        showCanvasNotice('Mode tanpa dialog tidak memakai AI Voice. Gunakan ambience/foley di video prompt.', 'warning');
        return;
    }
    const btn = document.getElementById(`btnGenVoice_${sceneIdx}`);
    const status = document.getElementById(`voiceStatus_${sceneIdx}`);
    const audioContainer = document.getElementById(`voiceAudioContainer_${sceneIdx}`);

    btn.disabled = true;
    status.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Menyiapkan dialog...';
    status.classList.remove('hidden');

    try {
        const segments = parseSceneDialogueSegments(scene.dialogueOrNarration || '');
        if (!segments.length) {
            throw new Error('Dialog scene ini masih kosong. Generate ulang dialognya dulu.');
        }
        const identity = state.directorData && state.directorData.masterVisualIdentity;
        const pcmChunks = [];
        let sampleRate = 24000;
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const voiceName = resolveSceneVoiceFor(segment.speakerId, scene, identity);
            status.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> ' + (i + 1) + '/' + segments.length + ' — ' + segment.speakerId + ' (' + voiceName + ')';
            const result = await generateVoiceOverAudio({
                promptText: segment.text,
                voiceName: voiceName
            });
            sampleRate = result.sampleRate || sampleRate;
            const buf = await result.wavBlob.arrayBuffer();
            const pcm = new Int16Array(buf, 44);
            if (pcm.length) pcmChunks.push(pcm);
        }
        const combined = combinePcmChunks(pcmChunks, sampleRate, 0.45);
        if (!combined.length) throw new Error('Semua segment TTS kosong.');
        const wavBlob = pcmToWav(combined, sampleRate);
        audioContainer.innerHTML = '<div class="bg-black/60 p-3 rounded-xl border border-purple-500/30 flex items-center space-x-3 mt-3"><audio controls class="w-full h-8"><source src="' + URL.createObjectURL(wavBlob) + '" type="audio/wav"></audio></div>';
        status.classList.add('hidden');
    } catch (err) {
        console.warn('[AI Voice]', err && err.message);
        status.innerHTML = '<span class="text-red-400">Gagal generate AI Voice: ' + (err && err.message ? err.message : 'Unknown error') + '</span>';
    } finally {
        btn.disabled = false;
    }
}

function base64ToPCM16(base64) {
    const binStr = atob(base64); const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
    return new Int16Array(bytes.buffer);
}
function pcmToWav(pcm16, sampleRate) {
    const buffer = new ArrayBuffer(44 + pcm16.length * 2);
    const view = new DataView(buffer);
    const writeString = (v, offset, str) => { for (let i = 0; i < str.length; i++) v.setUint8(offset + i, str.charCodeAt(i)); };
    writeString(view, 0, 'RIFF'); view.setUint32(4, 36 + pcm16.length * 2, true); writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    writeString(view, 36, 'data'); view.setUint32(40, pcm16.length * 2, true);
    let offset = 44; for (let i = 0; i < pcm16.length; i++, offset += 2) view.setInt16(offset, pcm16[i], true);
    return new Blob([view], { type: 'audio/wav' });
}

function copyText(elementId) {
    const videoMatch = /^masterVideoPrompt_(\d+)$/.exec(elementId);
    if (videoMatch) {
        const field = document.getElementById(elementId);
        if (field) {
            field.value = enforceCleanVideoOpening(field.value);
            const scene = state.directorData?.scenes?.[Number(videoMatch[1])];
            if (scene) scene.masterVideoPrompt = field.value;
        }
    }
    document.getElementById(elementId)?.select();
    document.execCommand('copy');
    alert("Disalin ke clipboard.");
}
function backToEditMode() {
    if (state.directorData) {
        const promptEl = document.getElementById('promptInput');
        if (promptEl) state.story = promptEl.value;
        const captionEl = document.getElementById('socialCaptionOut');
        const hashtagEl = document.getElementById('socialHashtagOut');
        if (captionEl) state.directorData.socialCaption = captionEl.value.trim();
        if (hashtagEl) state.directorData.hashtags = hashtagEl.value.trim().split(/\s+/).filter(Boolean);
        persistCurrentStoryboardHistory();
    }
    document.getElementById('resultView').classList.add('hidden');
    document.getElementById('creatorFormView').classList.remove('hidden');
}
function startNewStoryboard() {
    state.story = ""; state.directorData = null; document.getElementById('promptInput').value = "";
    state.currentEpisode = 1; state.episodeBible = null; state.seriesPlan = null; state.episodePlate = null; state.episodeSeries = [];
    state.storyboardSessions = {};
    resetProductLock();
    currentStoryboardHistoryId = null;
    document.getElementById('resultView').classList.add('hidden'); document.getElementById('creatorFormView').classList.remove('hidden');
    updateSummaryPill();
}

/* ================================================================= */
/* PIPELINE IMAGE-TO-VIDEO: INTEGRASI n8n WEBHOOK                   */
/* ================================================================= */
function buildScenePayloadForN8n(sceneIdx) {
    if (sceneIdx < 0 || !state.directorData?.scenes?.[sceneIdx]) return null;
    const scene = state.directorData.scenes[sceneIdx];
    const imagePromptText = (document.getElementById('masterImagePrompt_' + sceneIdx)?.value || scene.masterImagePrompt || '').trim();
    const videoPromptText = (document.getElementById('masterVideoPrompt_' + sceneIdx)?.value || scene.promptVideo || scene.camera_movement || '').trim();
    const dialogueText = (document.getElementById('dialogueText_' + sceneIdx)?.value || scene.dialogueOrNarration || '').trim();
    const imageDataUrl = getSceneImageDataUrl(sceneIdx) || '';

    return {
        scene_number: scene.sceneNumber || (sceneIdx + 1),
        scene_index: sceneIdx,
        visual_goal: scene.visualGoal || '',
        image_prompt: imagePromptText,
        video_prompt: videoPromptText,
        dialogue_or_narration: dialogueText,
        image_data: imageDataUrl,
        has_image: Boolean(imageDataUrl && imageDataUrl.startsWith('data:image/')),
        duration: state.durationPerScene || '5s',
        aspect_ratio: state.aspectRatio || '16:9'
    };
}

async function renderSceneToN8n(sceneIdx) {
    const webhookUrl = getN8nWebhookUrl();
    if (!webhookUrl) {
        openN8nModal('Silakan masukkan dan simpan URL Webhook n8n Anda terlebih dahulu.');
        return;
    }

    const sceneData = buildScenePayloadForN8n(sceneIdx);
    if (!sceneData) {
        showCanvasNotice('Data scene tidak ditemukan.', 'error');
        return;
    }

    const btn = document.getElementById(`btnRenderSceneN8n_${sceneIdx}`);
    const originalHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i><span>Mengirim ke n8n...</span>`;
    }

    try {
        const payload = {
            event: "render_scene_video",
            project_title: state.story || "Trendora AI Storyboard",
            mode: state.storyboardMode || "commercial",
            style: state.visualStyle || "Auto",
            episode: state.currentEpisode || 1,
            scene: sceneData,
            user: {
                name: (typeof currentUser !== 'undefined' && currentUser?.name) ? currentUser.name : "Member",
                email: (typeof currentUser !== 'undefined' && currentUser?.email) ? currentUser.email : ""
            },
            timestamp: new Date().toISOString()
        };

        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`HTTP error status ${res.status}`);
        }

        showCanvasNotice(`Scene ${sceneData.scene_number} berhasil dikirim ke n8n untuk render video!`, 'success');
        if (btn) {
            btn.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-300"></i><span>Terkirim ke n8n!</span>`;
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }, 3000);
        }
    } catch (err) {
        console.error("n8n Scene Render Error:", err);
        showCanvasNotice(`Gagal mengirim Scene ke n8n: ${err.message}. Pastikan webhook n8n aktif.`, 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    }
}

async function renderAllScenesToN8n() {
    const webhookUrl = getN8nWebhookUrl();
    if (!webhookUrl) {
        openN8nModal('Silakan masukkan dan simpan URL Webhook n8n Anda terlebih dahulu.');
        return;
    }

    if (!state.directorData || !state.directorData.scenes || state.directorData.scenes.length === 0) {
        showCanvasNotice('Belum ada data storyboard untuk dikirim ke n8n!', 'error');
        return;
    }

    const scenes = state.directorData.scenes;
    const scenesPayload = scenes.map((_, idx) => buildScenePayloadForN8n(idx)).filter(Boolean);

    const btn = document.getElementById('btnSendN8nAll') || document.getElementById('btnSendN8n');
    const originalHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i><span>Mengirim ${scenesPayload.length} Scene...</span>`;
    }

    try {
        const payload = {
            event: "render_full_storyboard",
            project_title: state.story || "Trendora AI Storyboard",
            mode: state.storyboardMode || "commercial",
            style: state.visualStyle || "Auto",
            audio_mode: state.audioMode || "Voiceover",
            aspect_ratio: state.aspectRatio || "16:9",
            duration_per_scene: state.durationPerScene || "5s",
            episode: state.currentEpisode || 1,
            total_scenes: scenesPayload.length,
            scenes: scenesPayload,
            user: {
                name: (typeof currentUser !== 'undefined' && currentUser?.name) ? currentUser.name : "Member",
                email: (typeof currentUser !== 'undefined' && currentUser?.email) ? currentUser.email : ""
            },
            timestamp: new Date().toISOString()
        };

        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`HTTP error status ${res.status}`);
        }

        showCanvasNotice(`Semua scene (${scenesPayload.length} scene) berhasil dikirim ke n8n untuk render video!`, 'success');
        if (btn) {
            btn.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-300"></i><span>Terkirim ke n8n!</span>`;
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }, 3000);
        }
    } catch (err) {
        console.error("n8n Full Render Error:", err);
        showCanvasNotice(`Gagal mengirim ke n8n: ${err.message}. Pastikan webhook n8n aktif.`, 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    }
}

// Backward compatibility alias
const sendDataToN8n = renderAllScenesToN8n;

async function restoreHistoryRecord(id) {
    const record = await getHistoryRecord(id); if (!record) return;
    currentStoryboardHistoryId = record.id;
    const config = record.configSnapshot || {};
    state.directorData = migrateStoryboardBreakdown(record.breakdown, config);
    state.story = config.story || state.story || '';
    if (config.storyboardMode && STORYBOARD_MODE_REGISTRY[config.storyboardMode]) {
        selectStoryboardMode(config.storyboardMode);
    }
    state.sceneCount = Number(config.sceneCount || record.sceneCount || state.sceneCount);
    state.shotsPerScene = Number(config.shotsPerScene || record.shotsPerScene || state.shotsPerScene);
    state.durationPerScene = config.durationPerScene || state.durationPerScene;
    state.aspectRatio = config.aspectRatio || record.aspectRatio || state.aspectRatio;
    state.visualStyle = 'Auto';
    state.customStyle = '';
    if (config.animationStyle) state.animationStyle = config.animationStyle;
    if (config.animationCustomStyle != null) state.animationCustomStyle = config.animationCustomStyle;
    if (config.animationGenre) state.animationGenre = config.animationGenre;
    state.episodeCount = Number(config.episodeCount || state.episodeCount || 1);
    state.currentEpisode = Number(record.episode || config.currentEpisode || 1);
    state.seriesPlan = Array.isArray(config.seriesPlan)
        ? config.seriesPlan
        : (record.breakdown && Array.isArray(record.breakdown.seriesPlan) ? record.breakdown.seriesPlan : null);
    state.episodeBible = record.breakdown && record.breakdown.masterVisualIdentity
        ? record.breakdown.masterVisualIdentity
        : state.episodeBible;
    state.audioMode = config.audioMode || state.audioMode;
    state.language = config.language || state.language;
    applyStoryboardModeStyleDefaults(state.storyboardMode);
    const promptEl = document.getElementById('promptInput');
    if (promptEl) promptEl.value = state.story;
    updateSummaryPill();
    setActiveViewKey('storyboard-create');
    setActiveSidebarItem('storyboard-create');
    expandNavGroup('storyboard');
    showAppView();
    renderDirectorIntent(record.breakdown);
    renderSocialPack(record.breakdown);
    const images = Array.isArray(record.images) ? record.images : [];
    state.directorData.scenes.forEach((scene, index) => {
        if (images[index]) {
            scene.finalAssetState = Object.assign({}, scene.finalAssetState || {}, {
                imageDataUrl: images[index],
                imagePrompt: scene.masterImagePrompt || '',
                videoPrompt: scene.masterVideoPrompt || '',
                updatedAt: record.timestamp || new Date().toISOString()
            });
        }
    });
    record.breakdown = state.directorData;
    record.images = images;
    record.schemaVersion = 'V4.0';
    await saveToHistory(record);
    state.episodeSeries = [{
        episode: state.currentEpisode,
        breakdown: record.breakdown,
        images: images,
        historyId: record.id
    }];
    await renderStoryboardResults(record.breakdown, images);
}
