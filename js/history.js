/* ========================================== */
/* PHASE 6A.6: UNIFIED HISTORY VIEW           */
/* ========================================== */

const HISTORY_FILTER_LABELS = {
    storyboard: 'Storyboard',
    foto: 'FotoGenerate',
    thumbnail: 'Thumbnail',
    infographic: 'Infographic',
    ugc: 'UGC / Product Ads',
    character: 'Character Sheet',
    poster: 'Poster & Social Media',
    voiceover: 'Voice Over',
    autoads: 'Auto Ads',
    'video-merge': 'Gabungkan Video'
};

async function loadAllUnifiedHistory() {
    const sb = await loadAllHistory();
    const ig = await loadAllImageGenHistory();
    const sbNorm = sb.map(rec => ({
        unifiedId: 'sb:' + rec.id,
        type: 'storyboard',
        ts: rec.timestamp || rec.ts || '',
        title: rec.title || 'Storyboard',
        summary: (rec.sceneCount || 0) + ' adegan • ' + (rec.aspectRatio || '?') + (rec.visualStyle ? ' • ' + rec.visualStyle : ''),
        thumb: (rec.images && rec.images[0]) || '',
        payload: rec
    }));
    const igNorm = ig.map(rec => {
        const kind = rec.tool || rec.type;
        const cfg = rec.configSnapshot || {};
        const summaryParts = [];
        if (kind === 'foto') {
            summaryParts.push((cfg.subject || '').slice(0, 60));
        } else if (kind === 'thumbnail') {
            summaryParts.push((cfg.title || cfg.headline || '').slice(0, 60));
        } else if (kind === 'infographic') {
            summaryParts.push((cfg.title || '').slice(0, 60));
        } else if (kind === 'ugc') {
            summaryParts.push((cfg.productName || '').slice(0, 60));
        } else if (kind === 'character') {
            summaryParts.push((cfg.characterName || (cfg.characters && cfg.characters[0] && cfg.characters[0].name) || '').slice(0, 60));
        } else if (kind === 'poster') {
            summaryParts.push((cfg.mainMessage || '').slice(0, 60));
        } else if (kind === 'video-merge') {
            summaryParts.push((cfg.clipCount || 0) + ' video');
            if (cfg.voiceFile) summaryParts.push('voice over');
        }
        const summary = summaryParts.filter(Boolean).join(' · ') || (HISTORY_FILTER_LABELS[kind] || kind);
        let label = rec.version && rec.version > 1 ? ('Edit Versi ' + (rec.version - 1)) : 'Original';
        if (rec.parentId) label += ' • CHILD';
        return {
            unifiedId: 'ig:' + rec.id,
            type: kind,
            ts: rec.ts || '',
            title: (HISTORY_FILTER_LABELS[kind] || 'Image') + (rec.version > 1 ? ' · ' + label : ''),
            summary: summary,
            thumb: rec.dataUrl || '',
            payload: rec
        };
    });
    return sbNorm.concat(igNorm).sort((a, b) => (b.ts || '').localeCompare(a.ts || ''));
}

async function renderUnifiedHistoryView() {
    const container = document.getElementById('unifiedHistoryList');
    if (!container) return;
    const filterEl = document.getElementById('historyFilter');
    const filter = (filterEl && filterEl.value) || 'all';
    const all = await loadAllUnifiedHistory();
    const records = filter === 'all' ? all : all.filter(r => r.type === filter);
    if (!records.length) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500 text-xs py-8">Belum ada history' + (filter === 'all' ? '.' : ' untuk filter ini.') + '</div>';
        return;
    }
    container.innerHTML = records.map(rec => {
        const toolLabel = HISTORY_FILTER_LABELS[rec.type] || 'Storyboard';
        const tsStr = formatTimestamp(rec.ts);
        const isVideoMerge = rec.type === 'video-merge';
        const thumb = rec.thumb && isVideoMerge
            ? `<video src="${rec.thumb}" class="w-full h-full object-cover" muted playsinline preload="metadata"></video>`
            : rec.thumb
            ? `<img src="${rec.thumb}" class="w-full h-full object-cover" />`
            : `<div class="w-full h-full flex items-center justify-center text-gray-600"><i class="fa-solid fa-clapperboard text-2xl"></i></div>`;
        const accent = rec.type === 'storyboard' ? 'purple' : rec.type === 'foto' ? 'pink' : rec.type === 'thumbnail' ? 'violet' : rec.type === 'infographic' ? 'blue' : rec.type === 'video-merge' ? 'amber' : 'orange';
        return `
            <div class="glass-card rounded-2xl p-4 border border-white/10 shadow-lg hover:border-${accent}-500/40 transition-all cursor-pointer" onclick="reopenHistoryRecord('${escapeHtml(rec.unifiedId)}')">
                <div class="aspect-video bg-black/80 rounded-xl overflow-hidden border border-white/10 mb-3 relative">
                    ${thumb}
                    <span class="absolute top-2 left-2 text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full bg-black/70 text-white border border-white/20">${escapeHtml(toolLabel)}</span>
                </div>
                <p class="text-xs font-bold text-white truncate">${escapeHtml(rec.title)}</p>
                <p class="text-[10px] text-gray-400 mt-1 truncate">${escapeHtml(rec.summary)}</p>
                <p class="text-[9px] text-gray-500 font-mono mt-2">${escapeHtml(tsStr)}</p>
                <div class="mt-3 flex items-center justify-between gap-2">
                    <button onclick="event.stopPropagation(); reopenHistoryRecord('${escapeHtml(rec.unifiedId)}')" class="text-[10px] font-bold uppercase tracking-wider text-purple-300 hover:text-white border border-purple-500/40 hover:border-purple-400/80 rounded-lg px-3 py-1.5 transition bg-purple-500/5 hover:bg-purple-500/20">
                        <i class="fa-solid fa-folder-open mr-1"></i>Buka
                    </button>
                    <button onclick="event.stopPropagation(); deleteUnifiedHistoryRecord('${escapeHtml(rec.unifiedId)}')" class="text-[10px] text-red-400 hover:text-white border border-red-500/30 hover:border-red-400/80 rounded-lg px-2.5 py-1.5 transition bg-red-500/5 hover:bg-red-500/20">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>`;
    }).join('');
}

function clearOwnedHistoryStore(storeName, ownerId) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openHistoryDB();
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => {
                (request.result || []).filter(record => record.ownerId === ownerId)
                    .forEach(record => store.delete(record.id));
            };
            request.onerror = () => reject(request.error);
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        } catch (err) {
            reject(err);
        }
    });
}

async function clearUnifiedHistory() {
    if (!confirm('Hapus SELURUH history (Storyboard + semua Image Gen)? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
        const ownerIds = getHistoryOwnerCandidates();
        for (const ownerId of ownerIds) {
            await clearOwnedHistoryStore(STORE_NAME, ownerId);
            await clearOwnedHistoryStore(IMG_STORE_NAME, ownerId);
        }
    } catch (err) {
        console.warn('Failed to clear history:', err);
    }
    renderUnifiedHistoryView();
}

function getHistoryExportAssets(record) {
    const payload = record && record.payload ? record.payload : {};
    const assets = [];
    if (record.type === 'storyboard' && Array.isArray(payload.images)) {
        payload.images.forEach((src, index) => {
            if (typeof src === 'string' && src.indexOf('data:') === 0) {
                assets.push({ kind: 'image', label: 'Adegan ' + (index + 1), src: src });
            }
        });
    } else if (typeof payload.dataUrl === 'string' && payload.dataUrl.indexOf('data:') === 0) {
        assets.push({
            kind: payload.tool === 'voiceover' || record.type === 'voiceover' ? 'audio' : payload.tool === 'video-merge' || record.type === 'video-merge' ? 'video' : 'image',
            label: record.title || 'Hasil',
            src: payload.dataUrl
        });
    }
    return assets;
}

function buildStoryboardExportScenes(record) {
    const payload = record && record.payload ? record.payload : {};
    const breakdown = payload.breakdown && typeof payload.breakdown === 'object' ? payload.breakdown : {};
    const scenes = Array.isArray(breakdown.scenes)
        ? breakdown.scenes
        : [];
    const caption = String(breakdown.socialCaption || '').trim();
    const hashtags = Array.isArray(breakdown.hashtags)
        ? breakdown.hashtags.map(tag => String(tag || '').trim()).filter(Boolean).map(tag => tag.charAt(0) === '#' ? tag : '#' + tag).join(' ')
        : String(breakdown.hashtags || '').trim();
    const socialPack = caption || hashtags
        ? `<section class="social-pack"><h3>Caption &amp; Hashtag</h3>${caption ? `<h4>Caption</h4><p>${escapeHtml(caption)}</p>` : ''}${hashtags ? `<h4>Hashtag</h4><p>${escapeHtml(hashtags)}</p>` : ''}</section>`
        : '';
    const sceneMarkup = scenes.map((scene, index) => {
        const image = Array.isArray(payload.images) ? payload.images[index] : '';
        const imageMarkup = typeof image === 'string' && image.indexOf('data:') === 0
            ? `<img src="${escapeHtml(image)}" alt="Adegan ${index + 1}">`
            : '<p class="missing">Gambar adegan tidak tersedia.</p>';
        const dialogue = String(scene.dialogueOrNarration || '').trim();
        return `<section class="scene">
            <h3>Adegan ${escapeHtml(scene.sceneNumber || index + 1)}${scene.title ? ' — ' + escapeHtml(scene.title) : ''}</h3>
            <div class="scene-image">${imageMarkup}</div>
            <div class="scene-dialogue"><h4>Dialog / Narasi</h4>${dialogue ? `<pre>${escapeHtml(dialogue)}</pre>` : '<p class="missing">Tidak ada dialog tersimpan.</p>'}</div>
            <div class="prompt-grid">
                <div class="prompt-box"><h4>Prompt Foto</h4><textarea id="storyboardPhotoPrompt_${index}" readonly>${escapeHtml(scene.masterImagePrompt || '')}</textarea><button onclick="copyExportPrompt('storyboardPhotoPrompt_${index}',this)">Copy</button></div>
                <div class="prompt-box"><h4>Prompt Video</h4><textarea id="storyboardVideoPrompt_${index}" readonly>${escapeHtml(enforceCleanVideoOpening(scene.masterVideoPrompt || ''))}</textarea><button onclick="copyExportPrompt('storyboardVideoPrompt_${index}',this)">Copy</button></div>
            </div>
        </section>`;
    }).join('');
    return socialPack + sceneMarkup;
}

async function exportUnifiedHistoryHtml() {
    try {
        if (state.directorData) {
            const captionEl = document.getElementById('socialCaptionOut');
            const hashtagEl = document.getElementById('socialHashtagOut');
            if (captionEl) state.directorData.socialCaption = captionEl.value.trim();
            if (hashtagEl) state.directorData.hashtags = hashtagEl.value.trim().split(/\s+/).filter(Boolean);
            await persistCurrentStoryboardHistory();
        }
        const records = await loadAllUnifiedHistory();
        if (!records.length) {
            alert('Belum ada history untuk diekspor.');
            return;
        }
        const exportRecords = records.map(record => ({
            title: record.title,
            type: HISTORY_FILTER_LABELS[record.type] || record.type,
            timestamp: formatTimestamp(record.ts),
            summary: record.summary,
            prompt: record.payload && record.payload.promptUsed ? record.payload.promptUsed : '',
            assets: getHistoryExportAssets(record)
        }));
        const exportedAt = new Date().toLocaleString('id-ID');
        const sections = exportRecords.map((record, index) => {
            const assets = (record.type === 'Storyboard' ? [] : record.assets).map(asset => asset.kind === 'audio'
                ? `<div class="asset"><p>${escapeHtml(asset.label)}</p><audio controls src="${escapeHtml(asset.src)}"></audio></div>`
                : asset.kind === 'video'
                    ? `<div class="asset"><p>${escapeHtml(asset.label)}</p><video controls src="${escapeHtml(asset.src)}"></video></div>`
                : `<div class="asset"><p>${escapeHtml(asset.label)}</p><img src="${escapeHtml(asset.src)}" alt="${escapeHtml(asset.label)}"></div>`
            ).join('');
            const content = record.type === 'Storyboard'
                ? buildStoryboardExportScenes(records[index])
                : record.prompt
                    ? `<div class="prompt-grid"><div class="prompt-box"><h4>Prompt</h4><textarea id="exportPrompt_${index}" readonly>${escapeHtml(record.prompt)}</textarea><button onclick="copyExportPrompt('exportPrompt_${index}',this)">Copy</button></div></div>`
                    : '';
            return `<article>
                <h2>${escapeHtml(record.title || ('History ' + (index + 1)))}</h2>
                <p class="meta">${escapeHtml(record.type)} · ${escapeHtml(record.timestamp)}</p>
                <p>${escapeHtml(record.summary || '')}</p>
                ${assets ? `<div class="assets">${assets}</div>` : ''}
                ${content}
            </article>`;
        }).join('');
        const html = `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TRENDORA AI - Export History</title>
<style>
body{margin:0;padding:32px;background:#0b0b12;color:#e5e7eb;font:14px Arial,sans-serif}
main{max-width:1100px;margin:auto}h1{color:#c4b5fd}article{margin:24px 0;padding:24px;border:1px solid #303044;border-radius:16px;background:#151522}
h2{margin-top:0;color:#f5f3ff}.meta{color:#a78bfa;font-size:12px}.assets{display:flex;flex-wrap:wrap;gap:16px;margin:18px 0}
.asset{max-width:480px;color:#9ca3af;font-size:12px}.asset img,.asset video{display:block;max-width:100%;max-height:600px;border-radius:10px;background:#000}.asset audio{width:100%}
.social-pack{margin:24px 0;padding:20px;border:1px solid #303044;border-radius:16px;background:#151522}.social-pack h3,.scene-dialogue h4{color:#c4b5fd;margin:0 0 10px}.social-pack h4{color:#a78bfa;margin:14px 0 5px;font-size:12px}.social-pack p,.scene-dialogue pre{white-space:pre-wrap;word-break:break-word;line-height:1.6;color:#cbd5e1}.scene{margin-top:24px;padding-top:20px;border-top:1px solid #303044}.scene h3{color:#f9a8d4}.scene-image img{display:block;max-width:100%;max-height:720px;border-radius:10px;background:#000}.scene-dialogue{margin:18px 0;padding:16px;border-radius:12px;background:#0b0b12;border:1px solid #303044}.scene-dialogue pre{margin:0;font:13px Arial,sans-serif}.missing{color:#9ca3af}.prompt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:16px}.prompt-box{position:relative}.prompt-box h4{color:#c4b5fd;margin:0 0 6px}.prompt-box textarea{display:block;width:100%;height:110px;resize:vertical;white-space:pre-wrap;word-break:break-word;color:#cbd5e1;background:#0b0b12;border:1px solid #303044;border-radius:10px;padding:12px;font:12px monospace;line-height:1.45}.prompt-box button{margin-top:6px;border:1px solid #8b5cf6;border-radius:7px;background:#24154d;color:#ddd6fe;padding:6px 12px;cursor:pointer;font-size:11px;font-weight:bold}.prompt-box button:hover{background:#4c1d95}
</style><script>
function copyExportPrompt(id,button){
   var field=document.getElementById(id);
   if(!field)return;
   field.focus();
   field.select();
   var done=function(){if(button){var old=button.textContent;button.textContent='Copied';setTimeout(function(){button.textContent=old;},1200);}};
   if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(field.value).then(done).catch(function(){document.execCommand('copy');done();});}
   else{document.execCommand('copy');done();}
}
<\/script></head><body><main><h1>TRENDORA AI — Export History</h1><p>Diekspor: ${escapeHtml(exportedAt)} · ${exportRecords.length} item</p>${sections}</main></body></html>`;
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'TRENDORA-ai-history-' + new Date().toISOString().slice(0, 10) + '.html';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
        console.error('Failed to export history:', err);
        alert('History gagal diekspor. Silakan coba lagi.');
    }
}

async function deleteUnifiedHistoryRecord(unifiedId) {
    try {
        const [store, id] = unifiedId.split(':');
        if (store === 'sb') {
            await deleteHistoryRecord(id);
        } else if (store === 'ig') {
            const db = await openHistoryDB();
            const tx = db.transaction(IMG_STORE_NAME, 'readwrite');
            tx.objectStore(IMG_STORE_NAME).delete(id);
            await new Promise((resolve, reject) => {
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        }
    } catch (err) {
        console.warn('Failed to delete history record:', err);
    }
    renderUnifiedHistoryView();
}

async function reopenHistoryRecord(unifiedId) {
    const all = await loadAllUnifiedHistory();
    const rec = all.find(r => r.unifiedId === unifiedId);
    if (!rec) return;
    const type = rec.type;
    const payload = rec.payload;
    if (type === 'storyboard') {
        await restoreHistoryRecord(payload.id);
        setActiveViewKey('storyboard-create');
        setActiveSidebarItem('storyboard-create');
        showAppView();
        return;
    }
    if (type === 'voiceover') {
        reopenVoiceOverFromHistory(payload);
        return;
    }
    if (type === 'autoads') {
        reopenAutoAdsFromHistory(payload);
        return;
    }
    if (type === 'video-merge') {
        reopenVideoMergeFromHistory(payload);
        return;
    }
    // Image Gen tools
    reopenImageGenFromHistory(payload);
}

function reopenVideoMergeFromHistory(rec) {
    const cfg = rec.configSnapshot || {};
    state.videoMerge.outputDataUrl = rec.dataUrl || '';
    state.videoMerge.outputName = 'TRENDORA-ai-merged-' + ((rec.ts || '').replace(/[:.]/g, '-').slice(0, 19) || Date.now()) + '.mp4';
    if (state.videoMerge.outputUrl) URL.revokeObjectURL(state.videoMerge.outputUrl);
    state.videoMerge.outputUrl = rec.dataUrl || '';
    state.videoMerge.originalVolume = Number(cfg.originalVolume || state.videoMerge.originalVolume || 35);
    setActiveViewKey('videoTools-merge');
    setActiveSidebarItem('videoTools-merge');
    expandNavGroup('videoTools');
    showVideoToolsView();
    const preview = document.getElementById('videoMergePreview');
    if (preview) preview.src = rec.dataUrl || '';
    const result = document.getElementById('videoMergeResult');
    if (result) result.classList.toggle('hidden', !rec.dataUrl);
    const meta = document.getElementById('videoMergeResultMeta');
    if (meta) meta.textContent = cfg.outputSize ? formatFileSize(cfg.outputSize) : 'history';
    showVideoMergeNotice('Hasil video dari history dibuka. Upload ulang klip jika ingin menyusun versi baru.', 'success');
    closeImageGenHistoryModal();
}

function reopenVoiceOverFromHistory(rec) {
    const cfg = rec.configSnapshot || {};
    const v = state.voiceOver;
    v.script = cfg.script || '';
    v.language = cfg.language || 'Indonesian';
    v.voice = cfg.voice || 'Female Warm';
    v.style = cfg.style || 'Natural';
    v.tempo = cfg.tempo || '1.0x';
    v.duration = cfg.duration || 'Auto';
    v.customDuration = cfg.customDuration || 30;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    set('voiceScript', v.script);
    set('voiceCustomDuration', v.customDuration);
    const vs = document.getElementById('selectorVoice');
    if (vs) {
        const opts = Array.from(vs.options || []);
        if (opts.some(o => o.value === v.voice)) vs.value = v.voice;
    }
    const click = (id, val) => {
        const container = document.querySelector(id);
        if (!container) return;
        const btn = container.querySelector(`button[data-val="${val}"]`);
        if (btn) btn.click();
    };
    click('#selectorVoiceLanguage', v.language);
    click('#selectorVoiceStyle', v.style);
    click('#selectorVoiceTempo', v.tempo);
    click('#selectorVoiceDuration', v.duration);
    if (typeof updateVoiceDurationSection === 'function') updateVoiceDurationSection();

    // Load existing audio
    if (rec.dataUrl) {
        const audio = document.getElementById('voiceOverAudio');
        if (audio) {
            audio.src = rec.dataUrl;
            audio.load();
            applyVoicePlaybackSettings();
        }
        const result = document.getElementById('voiceOverResult');
        if (result) result.classList.remove('hidden');
        const statusEl = document.getElementById('voiceOverStatus');
        if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">restored</span>';
    }
    setActiveViewKey('voiceover');
    setActiveSidebarItem('voiceover');
    showVoiceOverView();
}

function reopenAutoAdsFromHistory(rec) {
    const cfg = rec.configSnapshot || {};
    const fullScript = [cfg.hook, cfg.body, cfg.cta].filter(Boolean).join('\n\n');
    state.voiceOver.script = fullScript;
    state.voiceOver.fromAutoAd = true;
    state.voiceOver.autoAdMeta = {
        productName: cfg.productName,
        benefits: cfg.benefits,
        audience: cfg.audience,
        hook: cfg.hook,
        body: cfg.body,
        cta: cfg.cta
    };
    const scriptEl = document.getElementById('voiceScript');
    if (scriptEl) scriptEl.value = fullScript;
    const badge = document.getElementById('autoAdBadge');
    if (badge) badge.classList.remove('hidden');
    const regenBtn = document.getElementById('btnRegenerateAutoAd');
    if (regenBtn) regenBtn.classList.remove('hidden');
    showVoiceOverView();
    setActiveViewKey('voiceover');
    setActiveSidebarItem('voiceover');
}

function reopenImageGenFromHistory(rec) {
    const type = rec.tool || rec.type;
    const cfg = rec.configSnapshot || {};
    if (type === 'foto') {
        state.imageGen.foto.subject = cfg.subject || '';
        state.imageGen.foto.style = cfg.style || 'Professional';
        state.imageGen.foto.lighting = cfg.lighting || 'Studio Softbox';
        state.imageGen.foto.mood = cfg.mood || 'Confident';
        state.imageGen.foto.aspectRatio = cfg.aspectRatio || '1:1';
        state.imageGen.foto.negativePrompt = cfg.negativePrompt || '';
        state.imageGen.foto.variations = 1;
        state.fotoReference = Array.isArray(cfg.refs) ? cfg.refs : [];
    } else if (type === 'thumbnail') {
        state.imageGen.thumbnail.title = cfg.title || '';
        state.imageGen.thumbnail.headline = cfg.headline || '';
        state.imageGen.thumbnail.platform = cfg.platform || 'YouTube';
        state.imageGen.thumbnail.style = cfg.style || 'Viral';
        state.imageGen.thumbnail.mood = cfg.mood || 'Excited';
        state.imageGen.thumbnail.aspectRatio = cfg.aspectRatio || '16:9';
        state.imageGen.thumbnail.variations = 1;
        const refs = cfg.refs || {};
        state.thumbnailSubjectReference = Array.isArray(refs.subject) ? refs.subject : [];
        state.thumbnailProductReference = Array.isArray(refs.product) ? refs.product : [];
        state.thumbnailStyleReference = Array.isArray(refs.style) ? refs.style : [];
    } else if (type === 'infographic') {
        state.imageGen.infographic.title = cfg.title || '';
        state.imageGen.infographic.content = cfg.content || '';
        state.imageGen.infographic.type = cfg.type || 'Informational';
        state.imageGen.infographic.style = cfg.style || 'Modern';
        state.imageGen.infographic.colorTheme = cfg.colorTheme || 'Auto';
        state.imageGen.infographic.aspectRatio = cfg.aspectRatio || '1:1';
        state.imageGen.infographic.variations = 1;
        state.infoReference = Array.isArray(cfg.refs) ? cfg.refs : [];
    } else if (type === 'ugc') {
        state.imageGen.productAds.productName = cfg.productName || '';
        state.imageGen.productAds.productDescription = cfg.productDescription || '';
        state.imageGen.productAds.mode = cfg.mode || 'Product Photo';
        state.imageGen.productAds.scene = cfg.scene || 'Studio';
        state.imageGen.productAds.ugcType = cfg.ugcType || 'Creator Review';
        state.imageGen.productAds.gender = cfg.gender || '';
        state.imageGen.productAds.ageRange = cfg.ageRange || '';
        state.imageGen.productAds.appearance = cfg.appearance || '';
        state.imageGen.productAds.pose = cfg.pose || '';
        state.imageGen.productAds.wardrobe = cfg.wardrobe || '';
        state.imageGen.productAds.environment = cfg.environment || '';
        state.imageGen.productAds.style = cfg.style || 'Professional';
        state.imageGen.productAds.mood = cfg.mood || 'Confident';
        state.imageGen.productAds.aspectRatio = cfg.aspectRatio || '1:1';
        state.imageGen.productAds.negativePrompt = cfg.negativePrompt || '';
        state.imageGen.productAds.variations = 1;
        const refs = cfg.refs || {};
        state.productAdsProductReference = Array.isArray(refs.product) ? refs.product : [];
        state.productAdsModelReference = Array.isArray(refs.model) ? refs.model : [];
        state.productAdsStyleReference = Array.isArray(refs.style) ? refs.style : [];
    } else if (type === 'character') {
        const ch = state.imageGen.character;
        if (Array.isArray(cfg.characters) && cfg.characters.length) {
            ch.count = Math.max(1, Math.min(5, parseInt(cfg.count, 10) || cfg.characters.length || 1));
            ch.characters = cfg.characters;
        } else {
            ch.count = 1;
            ch.characters = [{
                name: cfg.characterName || '',
                description: [cfg.description, cfg.wardrobe].filter(Boolean).join('\n'),
                refs: Array.isArray(cfg.refs) ? cfg.refs : []
            }];
        }
        ensureCharRoster();
    } else if (type === 'poster') {
        const p = state.imageGen.poster;
        p.mainMessage = cfg.mainMessage || '';
        p.designType = cfg.designType || 'Social Media Post';
        p.customDesignType = cfg.customDesignType || '';
        p.platform = cfg.platform || 'Instagram Post';
        p.style = cfg.style || 'Modern';
        p.customStyle = cfg.customStyle || '';
        p.aspectRatio = cfg.aspectRatio || '1:1';
        p.details = cfg.details || '';
        p.variations = 1;
        const refs = cfg.refs || {};
        state.posterReference = Array.isArray(refs.product) ? refs.product : [];
        state.posterStyleReference = Array.isArray(refs.style) ? refs.style : [];
    }

    // Sync DOM inputs from state
    syncFotoInputsFromState();
    syncThumbInputsFromState();
    syncInfoInputsFromState();
    syncAdsInputsFromState();
    syncCharInputsFromState();
    syncPosterInputsFromState();
    updateRefCardUI('fotoReference');
    updateRefCardUI('thumbnailSubjectReference');
    updateRefCardUI('thumbnailProductReference');
    updateRefCardUI('thumbnailStyleReference');
    updateRefCardUI('infoReference');
    updateRefCardUI('productAdsProductReference');
    updateRefCardUI('productAdsModelReference');
    updateRefCardUI('productAdsStyleReference');
    updateRefCardUI('characterReference');
    updateRefCardUI('posterReference');
    updateRefCardUI('posterStyleReference');
    if (typeof updateAdsModeSections === 'function') updateAdsModeSections();
    if (typeof renderCharSlots === 'function') renderCharSlots();
    if (typeof updatePosterDesignTypeSection === 'function') updatePosterDesignTypeSection();
    if (typeof updatePosterStyleSection === 'function') updatePosterStyleSection();

    // Show the saved image as a result card
    const resultsContainerId = type === 'foto' ? 'fotoGenResults' : type === 'thumbnail' ? 'thumbnailGenResults' : type === 'infographic' ? 'infographicGenResults' : type === 'ugc' ? 'productAdsGenResults' : type === 'character' ? 'characterGenResults' : type === 'poster' ? 'posterGenResults' : null;
    const resultsContainer = resultsContainerId && document.getElementById(resultsContainerId);
    if (resultsContainer) {
        resultsContainer.innerHTML = '<div class="image-gen-grid" data-count="1"></div>';
        const grid = resultsContainer.firstElementChild;
        let cardHtml;
        if (type === 'foto') {
            cardHtml = renderFotoResultCard(0);
        } else if (type === 'thumbnail') {
            cardHtml = renderThumbnailResultCard(0);
        } else if (type === 'infographic') {
            cardHtml = renderInfographicResultCard(0);
        } else if (type === 'ugc') {
            cardHtml = renderProductAdsResultCard(0);
        } else if (type === 'character') {
            cardHtml = renderCharacterSheetResultCard(0);
        } else if (type === 'poster') {
            cardHtml = renderPosterResultCard(0);
        }
        if (cardHtml) {
            grid.insertAdjacentHTML('beforeend', cardHtml);
            const imgId = type === 'thumbnail' ? 'thumbImg_0' : type === 'infographic' ? 'infoImg_0' : type === 'ugc' ? 'adsImg_0' : type === 'character' ? 'charImg_0' : type === 'poster' ? 'posterImg_0' : 'fotoImg_0';
            const statusId = type === 'thumbnail' ? 'thumbResultStatus_0' : type === 'infographic' ? 'infoResultStatus_0' : type === 'ugc' ? 'adsResultStatus_0' : type === 'character' ? 'charResultStatus_0' : type === 'poster' ? 'posterResultStatus_0' : 'fotoResultStatus_0';
            const actionsId = type === 'thumbnail' ? 'thumbResultActions_0' : type === 'infographic' ? 'infoResultActions_0' : type === 'ugc' ? 'adsResultActions_0' : type === 'character' ? 'charResultActions_0' : type === 'poster' ? 'posterResultActions_0' : 'fotoResultActions_0';
            const imgEl = document.getElementById(imgId);
            const statusEl = document.getElementById(statusId);
            const actionsEl = document.getElementById(actionsId);
            if (imgEl) {
                imgEl.src = rec.dataUrl;
                imgEl.onload = () => imgEl.classList.remove('opacity-0');
                imgEl.classList.remove('hidden');
                imgEl.onclick = () => openImageLightbox(rec.dataUrl);
            }
            if (statusEl) statusEl.innerHTML = '<span class="text-emerald-300">restored</span>';
            if (actionsEl) {
                const filename = buildDownloadFilename(type);
                const editBtn = type === 'foto' ? 'foto' : type === 'thumbnail' ? 'thumbnail' : type === 'infographic' ? 'infographic' : type === 'ugc' ? 'ugc' : type === 'character' ? 'character' : 'poster';
                const retryFn = type === 'foto' ? 'retryFotoImage' : type === 'thumbnail' ? 'retryThumbnailImage' : type === 'infographic' ? 'retryInfographicImage' : type === 'ugc' ? 'retryProductAdsImage' : type === 'character' ? 'retryCharacterSheetImage' : 'retryPosterImage';
                actionsEl.innerHTML = `
                    <button onclick="openEditImageModal('${editBtn}', 0)" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-pen mr-1"></i>Edit
                    </button>
                    <button onclick="downloadImage('${rec.dataUrl}', '${filename}')" class="text-[10px] bg-white/5 hover:bg-purple-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-purple-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-download mr-1"></i>Download
                    </button>
                    <button onclick="${retryFn}(0)" class="text-[10px] bg-white/5 hover:bg-purple-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-purple-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
                    </button>`;
                actionsEl.classList.remove('hidden');
            }
        }
    }

    // Navigate to the tool
    const navKey = 'imageGen-' + (type === 'foto' ? 'foto' : type === 'thumbnail' ? 'thumbnail' : type === 'infographic' ? 'infographic' : type === 'ugc' ? 'ugc' : type === 'character' ? 'character' : 'poster');
    setActiveViewKey(navKey);
    setActiveSidebarItem(navKey);
    expandNavGroup('imageGen');
    showImageGenView();
    if (typeof selectImageGenTool === 'function') {
        selectImageGenTool(type === 'foto' ? 'foto' : type === 'thumbnail' ? 'thumbnail' : type === 'infographic' ? 'infographic' : type === 'ugc' ? 'ugc' : type === 'character' ? 'character' : 'poster');
    }

    state.imageGen.lastResult = [{
        dataUrl: rec.dataUrl,
        promptUsed: rec.promptUsed,
        historyId: rec.id,
        slot: (cfg.characters && cfg.characters[0]) || null,
        refs: cfg.refs || (Array.isArray(cfg.characters && cfg.characters[0] && cfg.characters[0].refs) ? cfg.characters[0].refs : [])
    }];
}

function syncFotoInputsFromState() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    set('fotoSubject', state.imageGen.foto.subject || '');
    set('fotoNegative', state.imageGen.foto.negativePrompt || '');
    const click = (id, val) => {
        const container = document.querySelector(id);
        if (!container) return;
        const btn = container.querySelector(`button[data-val="${val}"]`);
        if (btn) btn.click();
    };
    click('#selectorFotoStyle', state.imageGen.foto.style);
    click('#selectorFotoLighting', state.imageGen.foto.lighting);
    click('#selectorFotoMood', state.imageGen.foto.mood);
    click('#selectorFotoRatio', state.imageGen.foto.aspectRatio);
    click('#selectorFotoVariations', state.imageGen.foto.variations);
}

function syncThumbInputsFromState() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    set('thumbTitle', state.imageGen.thumbnail.title || '');
    set('thumbHeadline', state.imageGen.thumbnail.headline || '');
    const click = (id, val) => {
        const container = document.querySelector(id);
        if (!container) return;
        const btn = container.querySelector(`button[data-val="${val}"]`);
        if (btn) btn.click();
    };
    click('#selectorThumbPlatform', state.imageGen.thumbnail.platform);
    click('#selectorThumbStyle', state.imageGen.thumbnail.style);
    click('#selectorThumbMood', state.imageGen.thumbnail.mood);
    click('#selectorThumbRatio', state.imageGen.thumbnail.aspectRatio);
    click('#selectorThumbVariations', state.imageGen.thumbnail.variations);
}

function syncInfoInputsFromState() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    set('infoTitle', state.imageGen.infographic.title || '');
    set('infoContent', state.imageGen.infographic.content || '');
    const click = (id, val) => {
        const container = document.querySelector(id);
        if (!container) return;
        const btn = container.querySelector(`button[data-val="${val}"]`);
        if (btn) btn.click();
    };
    click('#selectorInfoType', state.imageGen.infographic.type);
    click('#selectorInfoStyle', state.imageGen.infographic.style);
    click('#selectorInfoColor', state.imageGen.infographic.colorTheme);
    click('#selectorInfoRatio', state.imageGen.infographic.aspectRatio);
    click('#selectorInfoVariations', state.imageGen.infographic.variations);
}

function syncAdsInputsFromState() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    const a = state.imageGen.productAds;
    set('adsProductName', a.productName || '');
    set('adsProductDescription', a.productDescription || '');
    set('adsGender', a.gender || '');
    set('adsAgeRange', a.ageRange || '');
    set('adsAppearance', a.appearance || '');
    set('adsPose', a.pose || '');
    set('adsWardrobe', a.wardrobe || '');
    set('adsEnvironment', a.environment || '');
    set('adsNegative', a.negativePrompt || '');
    const click = (id, val) => {
        const container = document.querySelector(id);
        if (!container) return;
        const btn = container.querySelector(`button[data-val="${val}"]`);
        if (btn) btn.click();
    };
    click('#selectorAdsMode', a.mode);
    click('#selectorAdsScene', a.scene);
    click('#selectorAdsUGCType', a.ugcType);
    click('#selectorAdsStyle', a.style);
    click('#selectorAdsMood', a.mood);
    click('#selectorAdsRatio', a.aspectRatio);
    click('#selectorAdsVariations', a.variations);
}

function syncCharInputsFromState() {
    ensureCharRoster();
    const ch = state.imageGen.character;
    const click = (id, val) => {
        const container = document.querySelector(id);
        if (!container) return;
        const btn = container.querySelector(`button[data-val="${val}"]`);
        if (btn) btn.click();
    };
    click('#selectorCharCount', String(ch.count || 1));
    renderCharSlots();
}

function syncPosterInputsFromState() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    const p = state.imageGen.poster;
    set('posterMessage', p.mainMessage || '');
    set('posterCustomDesignType', p.customDesignType || '');
    set('posterCustomStyle', p.customStyle || '');
    set('posterDetails', p.details || '');
    const click = (id, val) => {
        const container = document.querySelector(id);
        if (!container) return;
        const btn = container.querySelector(`button[data-val="${val}"]`);
        if (btn) btn.click();
    };
    click('#selectorPosterDesignType', p.designType);
    click('#selectorPosterPlatform', p.platform);
    click('#selectorPosterStyle', p.style);
    click('#selectorPosterRatio', p.aspectRatio);
    click('#selectorPosterVariations', p.variations);
}