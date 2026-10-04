/* ========================================== */
/* VIDEO TOOLS: MERGE VIDEO (LOCAL WASM)       */
/* ========================================== */

let videoMergeFfmpeg = null;
let videoMergeFfmpegLoadPromise = null;
let videoMergeBusy = false;
let videoMergeMessageTimer = null;

const videoMergeWaitingMessages = [
    'TRENDORA masih menggabungkan, sabar dulu bos...',
    'Adegan sedang dilem Korea. Lemnya mahal, jangan sampai tumpah.',
    'Sekarang sambungannya ditambal pakai semen kualitas sinematik.',
    'Tukang tambalnya masih ke kamar mandi. Sebentar lagi balik.',
    'Sedang mencari kuli untuk mengangkut batu dan pasir frame.',
    'Ini agak berat, bos. Sepertinya perlu mesin las untuk menyatukan scene.',
    'Kamera sedang rapat produksi. Semua frame diminta duduk yang rapi.',
    'Audio sedang dipisahkan supaya voice over tidak rebutan panggung.',
    'Ada frame yang nyasar. Tim produksi sedang menjemputnya.',
    'Transisi sedang diratakan. Jangan diinjak dulu, semennya belum kering.',
    'Editor kecil di dalam browser sedang lembur sambil minum kopi.',
    'Klip berikutnya sedang antre masuk. Tolong jangan serobot.',
    'Sedang mengencangkan baut antar-adegan agar tidak goyang di tikungan.',
    'Hampir jadi nih. Siapkan jempol untuk tombol download.',
    'Mesin render sedang menarik napas panjang. Kita tunggu dengan elegan.',
    'Satu sambungan lagi. Kalau bunyi “krek”, itu cuma efek sinematik.',
    'Sedang mengecat pinggiran video agar hasil akhirnya mulus.',
    'Voice over sedang dites mikrofonnya. “Tes satu, tes dua, jangan fals.”',
    'Tim produksi menemukan pasir di timeline. Sedang dibersihkan.',
    'Bos, ini bukan macet. Ini adegan sedang membangun ketegangan.',
    'Hampir selesai. Tinggal menunggu semen, audio, dan harga diri kering.',
    'Klip-klipnya sudah akur. Sekarang tinggal dibuat tanda tangan bersama.',
    'Render masih jalan. TRENDORA sedang pura-pura tenang.',
    'Sebentar lagi tayang. Jangan kedip, nanti ketinggalan finishing.',
    'Finalisasi sedang dipoles sampai kinclong. Sabar ya, bos.'
];

function formatFileSize(bytes) {
    const n = Number(bytes) || 0;
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
    return (n / 1024 / 1024 / 1024).toFixed(1) + ' GB';
}

function showVideoMergeNotice(msg, type) {
    const el = document.getElementById('videoMergeNotice');
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

function setVideoMergeStatus(text, busy) {
    const status = document.getElementById('videoMergeStatus');
    const button = document.getElementById('btnMergeVideos');
    if (status) status.textContent = text || 'ready';
    const panel = document.getElementById('videoMergeProgressPanel');
    if (panel) panel.classList.toggle('video-merge-progress-glow', !!busy);
    if (button) {
        button.disabled = !!busy || !state.videoMerge.clips.length;
        button.innerHTML = busy
            ? '<i class="fa-solid fa-spinner animate-spin"></i> <span>Memproses...</span>'
            : '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Gabungkan</span>';
    }
}

function setVideoMergeProgress(value, stage, message) {
    const percent = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
    const fill = document.getElementById('videoMergeProgressFill');
    const percentEl = document.getElementById('videoMergePercent');
    const stageEl = document.getElementById('videoMergeStage');
    const messageEl = document.getElementById('videoMergeProgressMessage');
    if (fill) fill.style.width = percent + '%';
    if (percentEl) percentEl.textContent = percent + '%';
    if (stageEl && stage) stageEl.textContent = stage;
    if (messageEl && message) messageEl.textContent = message;
}

function startVideoMergeWaitingMessages() {
    let messageIndex = 0;
    clearInterval(videoMergeMessageTimer);
    videoMergeMessageTimer = setInterval(() => {
        if (!videoMergeBusy) return;
        messageIndex = (messageIndex + 1) % videoMergeWaitingMessages.length;
        const messageEl = document.getElementById('videoMergeProgressMessage');
        if (messageEl) messageEl.textContent = videoMergeWaitingMessages[messageIndex];
    }, 3000);
}

function stopVideoMergeWaitingMessages() {
    clearInterval(videoMergeMessageTimer);
    videoMergeMessageTimer = null;
}

function updateVideoMergeControls() {
    const wrap = document.getElementById('videoMergeVolumeWrap');
    if (wrap) wrap.classList.toggle('hidden', !state.videoMerge.voiceFile);
    const voiceName = document.getElementById('videoMergeVoiceName');
    if (voiceName) voiceName.textContent = state.videoMerge.voiceFile
        ? state.videoMerge.voiceFile.name + ' • ' + formatFileSize(state.videoMerge.voiceFile.size)
        : 'Tidak ada voice over.';
    const volume = document.getElementById('videoMergeOriginalVolume');
    if (volume) volume.value = String(state.videoMerge.originalVolume);
    const label = document.getElementById('videoMergeVolumeLabel');
    if (label) label.textContent = state.videoMerge.originalVolume + '%';
    setVideoMergeStatus(videoMergeBusy ? 'processing' : 'ready', videoMergeBusy);
}

function handleVideoMergeFiles(files) {
    const picked = Array.from(files || []).filter(file => file && /^video\//i.test(file.type || ''));
    if (!picked.length) {
        showVideoMergeNotice('Pilih file video yang valid.', 'error');
        return;
    }
    picked.forEach(file => {
        const clip = {
            id: 'clip_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
            file,
            name: file.name,
            size: file.size,
            type: file.type || 'video/mp4',
            url: URL.createObjectURL(file),
            thumb: ''
        };
        state.videoMerge.clips.push(clip);
        captureVideoThumbnail(clip).then(thumb => {
            if (thumb) {
                clip.thumb = thumb;
                renderVideoMergeList();
            }
        }).catch(err => console.warn('[Video Merge] thumbnail failed:', err && err.message));
    });
    const input = document.getElementById('videoMergeInput');
    if (input) input.value = '';
    showVideoMergeNotice(picked.length + ' video ditambahkan.', 'success');
    renderVideoMergeList();
    updateVideoMergeControls();
}

function captureVideoThumbnail(clip) {
    return new Promise((resolve) => {
        if (!clip || !clip.url) return resolve('');
        const video = document.createElement('video');
        const cleanup = () => {
            video.removeAttribute('src');
            video.load();
        };
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;
        video.onloadedmetadata = () => {
            const seekTime = Math.min(0.25, Math.max(0, (Number(video.duration) || 1) / 4));
            try { video.currentTime = seekTime; } catch (e) {}
        };
        video.onseeked = () => {
            try {
                const w = Math.max(160, Number(video.videoWidth) || 320);
                const h = Math.max(90, Number(video.videoHeight) || 180);
                const canvas = document.createElement('canvas');
                canvas.width = 240;
                canvas.height = Math.round(240 * h / w);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
                cleanup();
                resolve(dataUrl);
            } catch (e) {
                cleanup();
                resolve('');
            }
        };
        video.onerror = () => {
            cleanup();
            resolve('');
        };
        video.src = clip.url;
    });
}

function handleVideoMergeVoice(file) {
    if (!file) return;
    if (state.videoMerge.voiceFile && state.videoMerge.voiceFile.url) URL.revokeObjectURL(state.videoMerge.voiceFile.url);
    state.videoMerge.voiceFile = {
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'audio/mpeg',
        url: URL.createObjectURL(file)
    };
    const input = document.getElementById('videoMergeVoiceInput');
    if (input) input.value = '';
    showVideoMergeNotice('Voice over siap dipakai. Atur suara video asli dengan slider.', 'success');
    updateVideoMergeControls();
}

function setVideoMergeOriginalVolume(value) {
    state.videoMerge.originalVolume = Math.max(0, Math.min(100, Number(value) || 0));
    updateVideoMergeControls();
}

function renderVideoMergeList() {
    const list = document.getElementById('videoMergeList');
    if (!list) return;
    const clips = state.videoMerge.clips || [];
    if (!clips.length) {
        list.innerHTML = '<div class="text-center text-gray-500 text-xs py-8 border border-white/10 rounded-2xl bg-black/20">Belum ada video.</div>';
        return;
    }
    list.innerHTML = clips.map((clip, index) => `
        <div class="video-merge-item grid grid-cols-[46px_minmax(0,1fr)_auto] sm:grid-cols-[46px_92px_minmax(0,1fr)_auto] gap-3 items-center rounded-2xl border border-white/10 bg-black/30 p-3"
            draggable="true" data-index="${index}" ondragstart="onVideoMergeDragStart(event, ${index})" ondragover="event.preventDefault()" ondrop="onVideoMergeDrop(event, ${index})">
            <div class="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-200 font-mono font-extrabold">${index + 1}</div>
            <div class="aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/60 flex items-center justify-center col-span-3 sm:col-span-1 sm:col-start-auto row-start-2 sm:row-start-auto">
                ${clip.thumb
                    ? `<img src="${clip.thumb}" class="w-full h-full object-cover" alt="preview ${index + 1}">`
                    : `<i class="fa-solid fa-video text-gray-600 text-lg"></i>`}
            </div>
            <div class="min-w-0">
                <div class="flex items-center gap-2 min-w-0">
                    <i class="fa-solid fa-grip-vertical text-gray-500 text-xs"></i>
                    <p class="text-xs font-bold text-white truncate">${escapeHtml(clip.name)}</p>
                </div>
                <p class="text-[10px] text-gray-500 font-mono mt-1">${escapeHtml(formatFileSize(clip.size))}</p>
            </div>
            <div class="flex items-center gap-1">
                <button onclick="moveVideoMergeClip(${index}, -1)" ${index === 0 ? 'disabled' : ''} class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-gray-300 border border-white/10"><i class="fa-solid fa-arrow-up text-[10px]"></i></button>
                <button onclick="moveVideoMergeClip(${index}, 1)" ${index === clips.length - 1 ? 'disabled' : ''} class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-gray-300 border border-white/10"><i class="fa-solid fa-arrow-down text-[10px]"></i></button>
                <button onclick="removeVideoMergeClip(${index})" class="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20"><i class="fa-solid fa-xmark text-[10px]"></i></button>
            </div>
        </div>
    `).join('');
}

function moveVideoMergeClip(index, delta) {
    const clips = state.videoMerge.clips;
    const next = index + delta;
    if (!clips || next < 0 || next >= clips.length) return;
    const item = clips.splice(index, 1)[0];
    clips.splice(next, 0, item);
    renderVideoMergeList();
}

function removeVideoMergeClip(index) {
    const clips = state.videoMerge.clips || [];
    const removed = clips.splice(index, 1)[0];
    if (removed && removed.url) URL.revokeObjectURL(removed.url);
    renderVideoMergeList();
    updateVideoMergeControls();
}

function clearVideoMergeQueue() {
    (state.videoMerge.clips || []).forEach(clip => { if (clip && clip.url) URL.revokeObjectURL(clip.url); });
    if (state.videoMerge.voiceFile && state.videoMerge.voiceFile.url) URL.revokeObjectURL(state.videoMerge.voiceFile.url);
    state.videoMerge.clips = [];
    state.videoMerge.voiceFile = null;
    state.videoMerge.originalVolume = 35;
    state.videoMerge.outputDataUrl = '';
    if (state.videoMerge.outputUrl) URL.revokeObjectURL(state.videoMerge.outputUrl);
    state.videoMerge.outputUrl = '';
    state.videoMerge.outputName = '';
    const videoInput = document.getElementById('videoMergeInput');
    if (videoInput) videoInput.value = '';
    const voiceInput = document.getElementById('videoMergeVoiceInput');
    if (voiceInput) voiceInput.value = '';
    const result = document.getElementById('videoMergeResult');
    if (result) result.classList.add('hidden');
    const preview = document.getElementById('videoMergePreview');
    if (preview) {
        preview.pause();
        preview.removeAttribute('src');
        preview.load();
    }
    const meta = document.getElementById('videoMergeResultMeta');
    if (meta) meta.textContent = 'Belum ada hasil.';
    setVideoMergeProgress(0, 'Siap membuat proyek baru', 'Upload video scene untuk memulai proyek baru.');
    showVideoMergeNotice('', 'info');
    renderVideoMergeList();
    updateVideoMergeControls();
}

let videoMergeDragIndex = null;
function onVideoMergeDragStart(event, index) {
    videoMergeDragIndex = index;
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
}

function onVideoMergeDrop(event, index) {
    event.preventDefault();
    if (videoMergeDragIndex === null || videoMergeDragIndex === index) return;
    const clips = state.videoMerge.clips || [];
    const item = clips.splice(videoMergeDragIndex, 1)[0];
    clips.splice(index, 0, item);
    videoMergeDragIndex = null;
    renderVideoMergeList();
}

function loadVideoMetadata(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            const meta = {
                duration: Number(video.duration) || 0,
                width: Number(video.videoWidth) || 720,
                height: Number(video.videoHeight) || 1280
            };
            URL.revokeObjectURL(url);
            resolve(meta);
        };
        video.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Metadata video tidak terbaca: ' + file.name));
        };
        video.src = url;
    });
}

function evenNumber(value, min) {
    const n = Math.max(min || 2, Math.round(Number(value) || 0));
    return n % 2 === 0 ? n : n - 1;
}

function targetVideoSize(meta) {
    const srcW = Number(meta && meta.width) || 720;
    const srcH = Number(meta && meta.height) || 1280;
    const portrait = srcH >= srcW;
    // Keep the browser workload bounded while preserving a clean HD master.
    // Generated scene clips are commonly 24fps, so the merge should not
    // manufacture extra frames when the source already has cinematic timing.
    const maxLong = 1080;
    if (portrait) {
        const ratio = Math.min(1, maxLong / srcH);
        return { width: evenNumber(srcW * ratio, 320), height: evenNumber(srcH * ratio, 320) };
    }
    const ratio = Math.min(1, maxLong / srcW);
    return { width: evenNumber(srcW * ratio, 320), height: evenNumber(srcH * ratio, 320) };
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error('Gagal membaca file.'));
        reader.readAsDataURL(file);
    });
}

function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
        const existing = Array.from(document.scripts).find(script => script.src === src);
        if (existing) {
            if (existing.dataset.loaded === 'true') return resolve();
            existing.addEventListener('load', resolve, { once: true });
            existing.addEventListener('error', reject, { once: true });
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };
        script.onerror = () => reject(new Error('Gagal memuat FFmpeg WASM dari CDN.'));
        document.head.appendChild(script);
    });
}

async function resetVideoMergeFfmpeg() {
    const instance = videoMergeFfmpeg;
    videoMergeFfmpeg = null;
    videoMergeFfmpegLoadPromise = null;
    if (!instance) return;
    try {
        if (typeof instance.exit === 'function') {
            await Promise.race([
                Promise.resolve(instance.exit()).catch(() => {}),
                new Promise(resolve => setTimeout(resolve, 600))
            ]);
        }
    } catch (err) {
        console.warn('[Video Merge] FFmpeg exit failed:', err && err.message);
    }
    try {
        const FS = instance.FS && instance.FS.bind(instance);
        if (FS) {
            const files = (FS('readdir', '/') || []).filter(name => name && name !== '.' && name !== '..');
            files.forEach(name => {
                try { FS('unlink', name); } catch (e) {}
            });
        }
    } catch (err) {
        console.warn('[Video Merge] FS cleanup during reset failed:', err && err.message);
    }
}

async function getVideoMergeFfmpeg() {
    if (videoMergeFfmpeg && videoMergeFfmpeg.isLoaded && videoMergeFfmpeg.isLoaded()) return videoMergeFfmpeg;
    if (videoMergeFfmpegLoadPromise) return videoMergeFfmpegLoadPromise;
    await loadScriptOnce('https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js');
    if (!window.FFmpeg || !window.FFmpeg.createFFmpeg) {
        throw new Error('FFmpeg WASM tidak tersedia. Cek koneksi internet atau blokir CDN.');
    }
    const { createFFmpeg } = window.FFmpeg;
    const ffmpeg = createFFmpeg({
        log: false,
        mainName: 'main',
        corePath: 'https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js?v=TRENDORA-single-thread-1',
        progress: ({ ratio }) => {
            const pct = Math.max(0, Math.min(100, Math.round((ratio || 0) * 100)));
            try {
                if (typeof setVideoMergeProgress === 'function') {
                    setVideoMergeProgress(45 + pct * 0.5, 'Merender dan memberi crossfade', 'TRENDORA sedang menyatukan gerak, warna, dan perpindahan adegan.');
                }
                if (typeof setVideoMergeStatus === 'function') {
                    setVideoMergeStatus('render ' + pct + '%', true);
                }
            } catch (domErr) {
                // UI may be re-rendered; progress is non-essential, ignore.
            }
        }
    });
    videoMergeFfmpegLoadPromise = (async () => {
        setVideoMergeStatus('loading engine', true);
        setVideoMergeProgress(4, 'Menyalakan mesin editing', 'Mesin FFmpeg sedang dipanaskan. Jangan dulu disuruh lari.');
        await ffmpeg.load();
        if (!ffmpeg.isLoaded || !ffmpeg.isLoaded()) {
            throw new Error('FFmpeg WASM belum siap setelah load.');
        }
        videoMergeFfmpeg = ffmpeg;
        return videoMergeFfmpeg;
    })();
    try {
        return await videoMergeFfmpegLoadPromise;
    } catch (error) {
        videoMergeFfmpeg = null;
        if (/SharedArrayBuffer/i.test(String(error && (error.message || error)))) {
            throw new Error('Browser ini memblokir FFmpeg multi-thread. TRENDORA AI sudah memakai single-thread core, silakan reload halaman agar core lama hilang dari cache.');
        }
        throw error;
    } finally {
        videoMergeFfmpegLoadPromise = null;
    }
}

function clearVideoMergeFfmpegFs(ffmpeg) {
    if (!ffmpeg || !ffmpeg.FS) return;
    try {
        const FS = ffmpeg.FS.bind(ffmpeg);
        let files = [];
        try { files = FS('readdir', '/') || []; } catch (e) { files = []; }
        files.forEach(name => {
            if (!name || name === '.' || name === '..') return;
            try { FS('unlink', name); } catch (e) {}
        });
    } catch (err) {
        console.warn('[Video Merge] FS cleanup failed:', err && err.message);
    }
}

function getVideoMergeCacheKey() {
    const clips = state.videoMerge.clips || [];
    const clipSig = clips.map(clip => clip.name + ':' + clip.size + ':' + (clip.lastModified || 0)).join('|');
    const voiceName = state.videoMerge.voiceFile ? state.videoMerge.voiceFile.name + ':' + state.videoMerge.voiceFile.size : '';
    return clipSig + '||' + voiceName + '||vol=' + state.videoMerge.originalVolume;
}

function buildVideoMergeArgs(clipCount, durations, fadeDuration, size, hasVoice, includeOriginalAudio, originalVolume) {
    const args = [];
    for (let i = 0; i < clipCount; i++) args.push('-i', 'clip' + i + '.mp4');
    if (hasVoice) args.push('-i', 'voice_input');
    const filters = [];
    for (let i = 0; i < clipCount; i++) {
        filters.push(`[${i}:v]scale=${size.width}:${size.height}:force_original_aspect_ratio=decrease,pad=${size.width}:${size.height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24,format=yuv420p[v${i}]`);
        if (includeOriginalAudio) {
            filters.push(`[${i}:a]aresample=44100,volume=${Math.max(0, Math.min(1, originalVolume / 100)).toFixed(2)}[a${i}]`);
        }
    }
    let videoLabel = '[v0]';
    if (clipCount > 1) {
        for (let i = 1; i < clipCount; i++) {
            const prev = i === 1 ? '[v0]' : `[vx${i - 1}]`;
            const out = i === clipCount - 1 ? '[vout]' : `[vx${i}]`;
            const offset = Math.max(0, durations.slice(0, i).reduce((sum, value) => sum + value, 0) - fadeDuration * i);
            filters.push(`${prev}[v${i}]xfade=transition=fade:duration=${fadeDuration.toFixed(2)}:offset=${offset.toFixed(2)}${out}`);
        }
        videoLabel = '[vout]';
    }
    let audioLabel = '';
    if (includeOriginalAudio) {
        audioLabel = '[a0]';
        if (clipCount > 1) {
            for (let i = 1; i < clipCount; i++) {
                const prev = i === 1 ? '[a0]' : `[ax${i - 1}]`;
                const out = i === clipCount - 1 ? '[aorig]' : `[ax${i}]`;
                filters.push(`${prev}[a${i}]acrossfade=d=${fadeDuration.toFixed(2)}${out}`);
            }
            audioLabel = '[aorig]';
        }
    }
    if (hasVoice) {
        const voiceIndex = clipCount;
        filters.push(`[${voiceIndex}:a]aresample=44100,volume=1.0[voice]`);
        if (includeOriginalAudio && audioLabel) {
            filters.push(`${audioLabel}[voice]amix=inputs=2:duration=longest:dropout_transition=0[aout]`);
            audioLabel = '[aout]';
        } else {
            audioLabel = '[voice]';
        }
    }
    args.push('-filter_complex', filters.join(';'));
    args.push('-map', videoLabel);
    if (audioLabel) args.push('-map', audioLabel);
    else args.push('-an');
    // Single-thread FFmpeg.wasm benefits more from encoder speed than
    // marginal compression efficiency. Quality remains suitable for
    // social video while reducing browser render time and memory pressure.
    args.push('-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-pix_fmt', 'yuv420p');
    if (audioLabel) args.push('-c:a', 'aac', '-b:a', '128k', '-shortest');
    args.push('-movflags', '+faststart', 'merged_output.mp4');
    return args;
}

async function runVideoMerge(includeOriginalAudio) {
    const clips = state.videoMerge.clips || [];
    const ffmpeg = await getVideoMergeFfmpeg();
    const { fetchFile } = window.FFmpeg;
    try {
        setVideoMergeProgress(15, 'Membersihkan ruang kerja', 'TRENDORA merapikan panggung sebelum adegan baru dimulai.');
        clearVideoMergeFfmpegFs(ffmpeg);
        setVideoMergeProgress(18, 'Membaca bahan produksi', 'TRENDORA sedang menghitung durasi dan ukuran setiap adegan.');
        for (let i = 0; i < clips.length; i++) {
            ffmpeg.FS('writeFile', 'clip' + i + '.mp4', await fetchFile(clips[i].file));
            setVideoMergeProgress(20 + ((i + 1) / clips.length) * 22, 'Menyiapkan file video', 'Klip ' + (i + 1) + ' dari ' + clips.length + ' sudah masuk ruang editing.');
        }
        if (state.videoMerge.voiceFile) {
            ffmpeg.FS('writeFile', 'voice_input', await fetchFile(state.videoMerge.voiceFile.file));
            setVideoMergeProgress(44, 'Menyiapkan voice over', 'Voice over sudah duduk di kursi TRENDORA.');
        }
        const metadata = await Promise.all(clips.map(clip => loadVideoMetadata(clip.file)));
        const size = targetVideoSize(metadata[0]);
        const minDuration = Math.min.apply(null, metadata.map(item => item.duration || 2));
        const fadeDuration = clips.length > 1 ? Math.max(0.25, Math.min(0.6, minDuration / 3)) : 0;
        const effectiveOriginalVolume = state.videoMerge.voiceFile ? state.videoMerge.originalVolume : 100;
        const args = buildVideoMergeArgs(clips.length, metadata.map(item => item.duration || 2), fadeDuration, size, !!state.videoMerge.voiceFile, includeOriginalAudio, effectiveOriginalVolume);
        setVideoMergeProgress(45, 'Merender dan memberi crossfade', 'Sekarang adegan sedang dilem supaya transisinya halus.');
        await ffmpeg.run.apply(ffmpeg, args);
        setVideoMergeProgress(96, 'Menyiapkan hasil akhir', 'Render selesai. Tinggal mengangkat hasilnya ke layar preview.');
        const data = ffmpeg.FS('readFile', 'merged_output.mp4');
        const blob = new Blob([data], { type: 'video/mp4' });
        setVideoMergeProgress(98, 'Merapikan ruang kerja', 'Membersihkan file sementara agar run berikutnya bersih.');
        clearVideoMergeFfmpegFs(ffmpeg);
        return blob;
    } catch (error) {
        // Defensive: if FFmpeg worker is unhealthy mid-run, force a full reset so the
        // NEXT run gets a fresh WASM instance instead of reusing a broken one.
        console.warn('[Video Merge] runVideoMerge failed, resetting FFmpeg:', error && error.message);
        await resetVideoMergeFfmpeg();
        throw error;
    }
}

async function startVideoMerge() {
    if (videoMergeBusy) return;
    const clips = state.videoMerge.clips || [];
    if (!clips.length) {
        showVideoMergeNotice('Upload minimal 1 video.', 'error');
        return;
    }
    const cacheKey = getVideoMergeCacheKey();
    if (state.videoMerge.lastCacheKey === cacheKey && state.videoMerge.outputBlob instanceof Blob) {
        showVideoMergeNotice('Input tidak berubah. Memakai hasil render sebelumnya dari cache lokal.', 'info');
        const cachedBlob = state.videoMerge.outputBlob;
        if (state.videoMerge.outputUrl) URL.revokeObjectURL(state.videoMerge.outputUrl);
        state.videoMerge.outputUrl = URL.createObjectURL(cachedBlob);
        if (!state.videoMerge.outputDataUrl) {
            try { state.videoMerge.outputDataUrl = await fileToDataUrl(cachedBlob); } catch (e) {}
        }
        const preview = document.getElementById('videoMergePreview');
        if (preview) preview.src = state.videoMerge.outputUrl;
        const result = document.getElementById('videoMergeResult');
        if (result) result.classList.remove('hidden');
        const meta = document.getElementById('videoMergeResultMeta');
        if (meta) meta.textContent = formatFileSize(cachedBlob.size);
        setVideoMergeProgress(100, 'Cache dipakai', 'Hasil render sebelumnya masih valid, tidak perlu render ulang.');
        return;
    }
    videoMergeBusy = true;
    setVideoMergeStatus('preparing', true);
    setVideoMergeProgress(0, 'Menyiapkan produksi', videoMergeWaitingMessages[0]);
    startVideoMergeWaitingMessages();
    showVideoMergeNotice('Memproses video lokal di browser. Untuk file besar, proses bisa beberapa menit.', 'info');
    try {
        let blob;
        try {
            blob = await runVideoMerge(true);
        } catch (audioError) {
            console.warn('[Video Merge] Original audio path failed, retrying without original audio:', audioError && audioError.message);
            showVideoMergeNotice('Audio asli salah satu klip tidak terbaca. Mencoba ulang dengan visual crossfade dan voice over.', 'info');
            blob = await runVideoMerge(false);
        }
        state.videoMerge.outputBlob = blob;
        state.videoMerge.lastCacheKey = cacheKey;
        if (state.videoMerge.outputUrl) URL.revokeObjectURL(state.videoMerge.outputUrl);
        state.videoMerge.outputUrl = URL.createObjectURL(blob);
        state.videoMerge.outputDataUrl = await fileToDataUrl(blob);
        state.videoMerge.outputName = 'TRENDORA-ai-merged-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '.mp4';
        const preview = document.getElementById('videoMergePreview');
        if (preview) preview.src = state.videoMerge.outputUrl;
        const result = document.getElementById('videoMergeResult');
        if (result) result.classList.remove('hidden');
        const meta = document.getElementById('videoMergeResultMeta');
        if (meta) meta.textContent = formatFileSize(blob.size);
        setVideoMergeProgress(99, 'Menyimpan hasil ke history', 'Tinggal satu adegan terakhir: menyimpan hasil produksi.');
        await saveVideoMergeHistory(blob);
        setVideoMergeProgress(100, 'Produksi selesai', 'Selesai, bos. Video sudah siap diputar dan di-download.');
        showVideoMergeNotice('Video berhasil digabung dan tersimpan di history.', 'success');
    } catch (err) {
        console.error('[Video Merge] Failed:', err);
        showVideoMergeNotice('Gagal menggabungkan video: ' + (err && err.message ? err.message : 'Unknown error'), 'error');
    } finally {
        stopVideoMergeWaitingMessages();
        videoMergeBusy = false;
        setVideoMergeStatus('ready', false);
    }
}

async function saveVideoMergeHistory(blob) {
    if (!state.videoMerge.outputDataUrl) return;
    const configSnapshot = {
        clipNames: (state.videoMerge.clips || []).map(clip => clip.name),
        clipCount: (state.videoMerge.clips || []).length,
        voiceFile: state.videoMerge.voiceFile ? state.videoMerge.voiceFile.name : '',
        originalVolume: state.videoMerge.voiceFile ? state.videoMerge.originalVolume : 100,
        outputSize: blob ? blob.size : 0
    };
    const record = {
        id: 'vm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        ts: new Date().toISOString(),
        tool: 'video-merge',
        type: 'video-merge',
        ownerId: getHistoryOwnerId(),
        parentId: null,
        version: 1,
        configSnapshot,
        promptUsed: 'Gabungkan ' + configSnapshot.clipCount + ' video dengan crossfade otomatis' + (configSnapshot.voiceFile ? ' + voice over' : ''),
        dataUrl: state.videoMerge.outputDataUrl,
        sourceDataUrl: null
    };
    const ok = await saveImageGenHistory(record);
    if (!ok) showVideoMergeNotice('Video berhasil dibuat, tapi history gagal disimpan. File mungkin terlalu besar untuk storage browser.', 'error');
}

function downloadMergedVideo() {
    const dataUrl = state.videoMerge.outputDataUrl;
    if (!dataUrl) {
        showVideoMergeNotice('Belum ada hasil video untuk di-download.', 'error');
        return;
    }
    downloadImage(dataUrl, state.videoMerge.outputName || 'TRENDORA-ai-merged.mp4');
}

/* ========================================== */
/* PHASE 6A.8B: AUTO AD MODAL (INSIDE VO)      */
/* ========================================== */

function openAutoAdGenerateModal() {
    const modal = document.getElementById('autoAdGenerateModal');
    if (modal) modal.classList.remove('hidden');
    const notice = document.getElementById('autoAdModalNotice');
    if (notice) {
        notice.className = 'hidden text-[11px] p-3 rounded-xl border font-medium';
        notice.textContent = '';
    }
    const submitBtn = document.getElementById('btnAutoAdGenerateSubmit');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate</span>';
    }
}

function closeAutoAdGenerateModal() {
    const modal = document.getElementById('autoAdGenerateModal');
    if (modal) modal.classList.add('hidden');
}

// ============================================================
// MENU MISMATCH WARNING MODAL
// ============================================================
// Warns the user when the active storyboard mode and the story
// content look mismatched. Two scenarios:
//   1. Commercial mode but no product, no promo intent, and not
//      a place promotion → suggests switching to creative mode.
//   2. Non-commercial mode but story has commercial/ad intent
//      and is not a place promotion → suggests switching to ad
//      mode.
// User chooses Lanjut (continue anyway) or Batal (cancel).
let menuMismatchResolver = null;

function resetMenuMismatchModal() {
    menuMismatchResolver = null;
    const modal = document.getElementById('menuMismatchModal');
    if (modal) modal.classList.add('hidden');
}

function resolveMenuMismatchModal(continueChoice) {
    const resolver = menuMismatchResolver;
    resetMenuMismatchModal();
    if (typeof resolver === 'function') {
        try { resolver(continueChoice === true); } catch (e) { /* ignore */ }
    }
}

function openMenuMismatchModal(headline, message, modeLabel) {
    return new Promise((resolve) => {
        const modal = document.getElementById('menuMismatchModal');
        if (!modal) { resolve(true); return; }
        const titleEl = document.getElementById('menuMismatchHeadline');
        const msgEl = document.getElementById('menuMismatchMessage');
        const modeEl = document.getElementById('menuMismatchCurrentMode');
        const cancelBtn = document.getElementById('btnMenuMismatchCancel');
        const continueBtn = document.getElementById('btnMenuMismatchContinue');
        if (titleEl) titleEl.textContent = headline || 'Peringatan Menu';
        if (msgEl) msgEl.textContent = message || '';
        if (modeEl) modeEl.textContent = modeLabel ? 'Menu aktif: ' + modeLabel : '';
        // CRITICAL: capture the Promise's resolve directly and call it
        // from the settle() closure. The earlier implementation tried
        // to chain through menuMismatchResolver, but that variable
        // was captured BEFORE assignment, so the Promise NEVER
        // resolved and the awaiting caller (startGeneration) hung
        // forever — making it look like "Pindah did nothing".
        let settled = false;
        const escHandler = (event) => {
            if (settled) return;
            if (event && event.key === 'Escape') {
                document.removeEventListener('keydown', escHandler, true);
                settled = true;
                resolve(false);
            }
        };
        document.addEventListener('keydown', escHandler, true);
        const settle = (choice) => {
            if (settled) return;
            settled = true;
            document.removeEventListener('keydown', escHandler, true);
            menuMismatchResolver = null;
            if (modal) modal.classList.add('hidden');
            resolve(choice === true);
        };
        menuMismatchResolver = settle;
        modal.classList.remove('hidden');
        setTimeout(() => {
            if (settled) return;
            if (cancelBtn) cancelBtn.disabled = false;
            if (continueBtn) continueBtn.disabled = false;
            if (continueBtn) continueBtn.focus();
        }, 60);
    });
}

function resetMenuMismatchModal() {
    menuMismatchResolver = null;
    const modal = document.getElementById('menuMismatchModal');
    if (modal) modal.classList.add('hidden');
}

function resolveMenuMismatchModal(continueChoice) {
    const resolver = menuMismatchResolver;
    resetMenuMismatchModal();
    if (typeof resolver === 'function') {
        try { resolver(continueChoice === true); } catch (e) { /* ignore */ }
    }
}

function shouldWarnMenuMismatch(config) {
    const story = String(config && config.story || '').trim();
    if (!story) return null;
    const mode = String(config && config.storyboardMode || 'custom');
    const hasCommercialIntent = detectCommercialIntent(story);
    const isPlacePromo = isPlacePromotion(config);
    const hasProductRef = !!(config && config.productReference && config.productReference.length);
    const modeLabel = (STORYBOARD_MODE_REGISTRY && STORYBOARD_MODE_REGISTRY[mode] && STORYBOARD_MODE_REGISTRY[mode].label) || mode;
    const creativeLabel = (STORYBOARD_MODE_REGISTRY && STORYBOARD_MODE_REGISTRY.drama && STORYBOARD_MODE_REGISTRY.drama.label) || 'menu Konten Kreatif';
    const commercialLabel = (STORYBOARD_MODE_REGISTRY && STORYBOARD_MODE_REGISTRY.commercial && STORYBOARD_MODE_REGISTRY.commercial.label) || 'menu Pembuatan Video Iklan';

    // Case 1: user is in Commercial/Iklan mode but the brief has
    // no product, no commercial intent, and is not a place promotion.
    if (mode === 'commercial' && !hasProductRef && !isPlacePromo && !hasCommercialIntent) {
        return {
            headline: 'Konten tanpa produk terdeteksi',
            message: 'TRENDORA tidak mendeteksi ada produk/promosi di konten ini.\n\nSebaiknya Anda membuat konten ini di ' + creativeLabel + ' agar hook, body, dan CTA-nya optimal. Apakah Anda akan berpindah ke menu ' + creativeLabel + ' sekarang?',
            modeLabel: modeLabel,
            targetMode: 'drama',
            otherMenuLabel: creativeLabel,
            type: 'commercial_no_product'
        };
    }

    // Case 2: user is in a creative mode but the brief carries
    // clear commercial intent (and is not a place promotion, which
    // is a valid creative-style story).
    const creativeModes = ['drama', 'animation', 'shortFilm', 'education', 'documentary', 'custom'];
    if (creativeModes.indexOf(mode) !== -1 && hasCommercialIntent && !isPlacePromo) {
        return {
            headline: 'Konten promosi terdeteksi',
            message: 'TRENDORA mendeteksi ada niat promosi/iklan di cerita ini, tapi Anda membuatnya di ' + modeLabel + '.\n\nSebaiknya konten promosi seperti ini dibuat di ' + commercialLabel + ' agar hook, solusi, dan CTA-nya optimal. Apakah Anda akan berpindah ke menu ' + commercialLabel + ' sekarang?',
            modeLabel: modeLabel,
            targetMode: 'commercial',
            otherMenuLabel: commercialLabel,
            type: 'creative_with_promo'
        };
    }

    return null;
}

function showAutoAdModalNotice(msg, type) {
    const el = document.getElementById('autoAdModalNotice');
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

async function submitAutoAdGenerateModal() {
    const nameEl = document.getElementById('autoAdModalProductName');
    const benefitsEl = document.getElementById('autoAdModalBenefits');
    const audienceEl = document.getElementById('autoAdModalAudience');
    const productName = nameEl ? nameEl.value.trim() : '';
    const benefits = benefitsEl ? benefitsEl.value.trim() : '';
    const audience = audienceEl ? audienceEl.value.trim() : '';
    if (!productName) {
        showAutoAdModalNotice('Nama Produk wajib diisi.', 'error');
        if (nameEl) nameEl.focus();
        return;
    }
    if (!benefits) {
        showAutoAdModalNotice('Keunggulan / Deskripsi wajib diisi.', 'error');
        if (benefitsEl) benefitsEl.focus();
        return;
    }
    const submitBtn = document.getElementById('btnAutoAdGenerateSubmit');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> <span>Generating...</span>';
    }
    showAutoAdModalNotice('Memanggil text generator...', 'info');
    try {
        const a = {
            productName: productName,
            benefits: benefits,
            audience: audience,
            platform: 'TikTok',
            duration: '30s'
        };
        const prompt = buildAutoAdsPrompt(a);
        const result = await generateAdCopy(prompt);
        const fullScript = [result.hook, result.body, result.cta].filter(Boolean).join('\n\n');
        state.voiceOver.script = fullScript;
        state.voiceOver.fromAutoAd = true;
        state.voiceOver.autoAdMeta = { productName, benefits, audience, hook: result.hook, body: result.body, cta: result.cta, raw: result.raw };
        const scriptEl = document.getElementById('voiceScript');
        if (scriptEl) scriptEl.value = fullScript;
        const badge = document.getElementById('autoAdBadge');
        if (badge) badge.classList.remove('hidden');
        const regenBtn = document.getElementById('btnRegenerateAutoAd');
        if (regenBtn) regenBtn.classList.remove('hidden');
        closeAutoAdGenerateModal();
        showVoiceOverNotice('Script dari Auto Ad diisikan ke Voice Over.', 'success');
    } catch (err) {
        console.error('[AutoAdModal] Failed:', err);
        showAutoAdModalNotice('Gagal: ' + (err && err.message ? err.message : 'Unknown error'), 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate</span>';
        }
    }
}

/* ========================================== */
/* PHASE 6A.3: EDIT / DOWNLOAD / HISTORY      */
/* ========================================== */

const editImageState = {
    tool: null,
    dataUrl: null,
    sourceRecordId: null,
    aspectRatio: null,
    configSnapshot: null
};

function buildDownloadFilename(tool) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const stamp = yyyy + mm + dd + '-' + hh + min;
    const toolName = tool === 'thumbnail' ? 'thumbnail'
        : tool === 'infographic' ? 'infographic'
        : tool === 'ugc' ? 'ugc-product-ads'
        : tool === 'character' ? 'character-sheet'
        : tool === 'poster' ? 'poster'
        : 'fotogenerate';
    return 'TRENDORA-ai-' + toolName + '-' + stamp + '.png';
}

function imageDownloadFilename(filename, mime) {
    const extensions = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };
    const extension = extensions[String(mime || '').toLowerCase()];
    const name = String(filename || 'TRENDORA-ai.png').replace(/[\\/:*?"<>|\x00-\x1f]/g, '-');
    return extension ? name.replace(/\.[^.]+$/, '') + '.' + extension : name;
}

function imageDataUrlBlob(source) {
    const match = String(source || '').match(/^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i);
    if (!match) throw new Error('Unsupported image data');
    const binary = atob(match[2].replace(/\s/g, ''));
    if (!binary.length) throw new Error('Empty image');
    const chunks = [];
    for (let offset = 0; offset < binary.length; offset += 65536) {
        const part = binary.slice(offset, offset + 65536);
        const bytes = new Uint8Array(part.length);
        for (let i = 0; i < part.length; i++) bytes[i] = part.charCodeAt(i);
        chunks.push(bytes);
    }
    return new Blob(chunks, { type: match[1].toLowerCase() });
}

function triggerFileDownload(url, filename) {
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    try { link.click(); } finally { setTimeout(() => link.remove(), 1000); }
}

function downloadImage(source, filename) {
    // The existing video merger also calls this helper. Keep its media route intact.
    if (/\.(?:mp4|webm|wav|mp3)$/i.test(filename || '') || /^data:(?:audio|video)\//i.test(source || '')) {
        downloadDataUrl(source, filename); return;
    }
    if (!source || !/^(?:data:image\/|blob:|https?:\/\/)/i.test(source)) return;
    document.getElementById('imageSaveDialog')?.dispatchEvent(new Event('dismiss-save-dialog'));
    const previousFocus = document.activeElement;
    const panel = document.createElement('div');
    panel.id = 'imageSaveDialog';
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'imageSaveTitle');
    panel.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;padding:16px;';
    const box = document.createElement('div');
    box.style.cssText = 'width:min(440px,100%);max-height:90dvh;overflow:auto;background:#171224;color:white;border:1px solid #68458a;border-radius:16px;padding:18px;';
    box.innerHTML = '<h2 id="imageSaveTitle" style="font-weight:700;margin-bottom:8px">Simpan gambar</h2><p style="font-size:13px;margin-bottom:12px">Jika file belum tersimpan, pilih Unduh, Buka Gambar, atau Bagikan. Pada HP, gambar juga dapat ditekan lama untuk melihat pilihan penyimpanan.</p>';
    const preview = document.createElement('img');
    preview.src = source; preview.alt = 'Gambar yang akan disimpan';
    preview.style.cssText = 'display:block;max-width:100%;max-height:40dvh;margin:0 auto 12px;object-fit:contain;';
    box.appendChild(preview);
    const actions = document.createElement('div'); actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px';
    const button = text => { const el = document.createElement('button'); el.type = 'button'; el.textContent = text; el.style.cssText = 'min-height:44px;padding:10px 14px;border:1px solid #7955a0;border-radius:10px;background:#34204f;color:white;cursor:pointer'; actions.appendChild(el); return el; };
    const save = button('Unduh'); save.disabled = true;
    const open = document.createElement('a'); open.textContent = 'Buka Gambar'; open.target = '_blank'; open.rel = 'noopener'; open.href = source; open.style.cssText = 'min-height:44px;padding:10px;border:1px solid #7955a0;border-radius:10px;color:white;'; actions.appendChild(open);
    const share = button('Bagikan'); share.hidden = true;
    const close = button('Tutup');
    box.appendChild(actions); panel.appendChild(box); document.body.appendChild(panel);
    let ownedUrl = null, closed = false;
    const dismiss = () => {
        if (closed) return; closed = true;
        panel.remove(); document.removeEventListener('keydown', onKey);
        // Give the browser time to consume the resource after a save/open action.
        if (ownedUrl) { const release = ownedUrl; setTimeout(() => URL.revokeObjectURL(release), 60000); }
        if (previousFocus && previousFocus.isConnected) previousFocus.focus();
    };
    const onKey = event => {
        if (event.key === 'Escape') dismiss();
        if (event.key === 'Tab') {
            const items = [...actions.querySelectorAll('button, a')].filter(el => !el.hidden && !el.disabled);
            const first = items[0], last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    };
    panel.addEventListener('dismiss-save-dialog', dismiss); close.onclick = dismiss;
    panel.onclick = event => { if (event.target === panel) dismiss(); };
    document.addEventListener('keydown', onKey); close.focus();
    const prepare = (blob, autoDownload) => {
        if (closed) return;
        if (!blob.size || !/^image\//i.test(blob.type)) throw new Error('Invalid image response');
        const name = imageDownloadFilename(filename, blob.type);
        ownedUrl = URL.createObjectURL(blob); open.href = ownedUrl; preview.src = ownedUrl;
        save.disabled = false;
        save.onclick = () => { try { triggerFileDownload(ownedUrl, name); } catch (error) { console.warn('[Image save]', error.name); } };
        const file = typeof File === 'function' ? new File([blob], name, { type: blob.type }) : null;
        let canShare = false;
        try { canShare = !!(file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })); } catch (_) { }
        if (canShare) {
            share.hidden = false;
            share.onclick = async () => {
                try { await navigator.share({ files: [file] }); }
                catch (error) { if (error.name !== 'AbortError') console.warn('[Image share]', error.name); }
            };
        }
        if (autoDownload) save.onclick();
    };
    try {
        if (/^data:image\//i.test(source)) prepare(imageDataUrlBlob(source), true);
        else fetch(source).then(response => { if (!response.ok) throw new Error('Image unavailable'); return response.blob(); }).then(blob => prepare(blob, false)).catch(error => console.warn('[Image preparation]', error.name));
    } catch (error) { console.warn('[Image preparation]', error.name); }
}

function openImageLightbox(dataUrl) {
    const lb = document.getElementById('imageLightbox');
    const img = document.getElementById('imageLightboxImg');
    if (!lb || !img) return;
    img.src = dataUrl;
    lb.classList.remove('hidden');
}

function closeImageLightbox() {
    const lb = document.getElementById('imageLightbox');
    const img = document.getElementById('imageLightboxImg');
    if (lb) lb.classList.add('hidden');
    if (img) img.src = '';
}

function editImageStateFromTool(tool, idx) {
    if (tool === 'foto') {
        const foto = state.imageGen.foto;
        return {
            tool: 'foto',
            aspectRatio: foto.aspectRatio,
            configSnapshot: {
                subject: foto.subject,
                style: foto.style,
                lighting: foto.lighting,
                mood: foto.mood,
                aspectRatio: foto.aspectRatio,
                negativePrompt: foto.negativePrompt,
                refs: state.fotoReference
            }
        };
    }
    if (tool === 'infographic') {
        const info = state.imageGen.infographic;
        return {
            tool: 'infographic',
            aspectRatio: info.aspectRatio,
            configSnapshot: {
                title: info.title,
                content: info.content,
                type: info.type,
                style: info.style,
                colorTheme: info.colorTheme,
                aspectRatio: info.aspectRatio,
                refs: state.infoReference
            }
        };
    }
    if (tool === 'ugc') {
        const ads = state.imageGen.productAds;
        return {
            tool: 'ugc',
            aspectRatio: ads.aspectRatio,
            configSnapshot: {
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
            }
        };
    }
    if (tool === 'character') {
        ensureCharRoster();
        const prev = (state.imageGen.lastResult || [])[idx];
        const slot = (prev && prev.slot) ? prev.slot : snapshotCharSlot(state.imageGen.character.characters[idx] || emptyCharSlot());
        return {
            tool: 'character',
            aspectRatio: CHAR_SHEET_RATIO,
            configSnapshot: {
                count: 1,
                characters: [slot],
                characterName: slot.name,
                aspectRatio: CHAR_SHEET_RATIO,
                refs: slot.refs || []
            }
        };
    }
    if (tool === 'poster') {
        const p = state.imageGen.poster;
        return {
            tool: 'poster',
            aspectRatio: p.aspectRatio,
            configSnapshot: {
                mainMessage: p.mainMessage,
                designType: p.designType,
                customDesignType: p.customDesignType,
                platform: p.platform,
                style: p.style,
                customStyle: p.customStyle,
                aspectRatio: p.aspectRatio,
                details: p.details,
                refs: {
                    product: state.posterReference,
                    style: state.posterStyleReference
                }
            }
        };
    }
    const thumb = state.imageGen.thumbnail;
    return {
        tool: 'thumbnail',
        aspectRatio: thumb.aspectRatio,
        configSnapshot: {
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
        }
    };
}

async function openEditImageModal(tool, idx) {
    const imgId = tool === 'thumbnail' ? ('thumbImg_' + idx)
        : tool === 'infographic' ? ('infoImg_' + idx)
        : tool === 'ugc' ? ('adsImg_' + idx)
        : tool === 'character' ? ('charImg_' + idx)
        : tool === 'poster' ? ('posterImg_' + idx)
        : ('fotoImg_' + idx);
    const imgEl = document.getElementById(imgId);
    if (!imgEl || !imgEl.src) return;
    const state2 = editImageStateFromTool(tool, idx);
    editImageState.tool = state2.tool;
    editImageState.dataUrl = imgEl.src;
    editImageState.aspectRatio = state2.aspectRatio;
    editImageState.configSnapshot = state2.configSnapshot;
    const last = Array.isArray(state.imageGen.lastResult) ? state.imageGen.lastResult[idx] : null;
    editImageState.sourceRecordId = (last && last.historyId) || null;

    const previewImg = document.getElementById('editImagePreviewImg');
    if (previewImg) previewImg.src = imgEl.src;
    const instr = document.getElementById('editImageInstruction');
    if (instr) instr.value = '';
    const notice = document.getElementById('editImageNotice');
    if (notice) { notice.className = 'hidden text-[11px] p-2 rounded-xl border font-medium'; notice.textContent = ''; }
    const submitBtn = document.getElementById('btnSubmitEdit');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate Edit</span>';
    }
    const modal = document.getElementById('editImageModal');
    if (modal) modal.classList.remove('hidden');
}

function closeEditImageModal() {
    const modal = document.getElementById('editImageModal');
    if (modal) modal.classList.add('hidden');
}

function showEditImageNotice(msg, type) {
    const el = document.getElementById('editImageNotice');
    if (!el) return;
    if (!msg) {
        el.className = 'hidden text-[11px] p-2 rounded-xl border font-medium';
        el.textContent = '';
        return;
    }
    if (type === 'error') {
        el.className = 'text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-xl font-medium block';
    } else if (type === 'success') {
        el.className = 'text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl font-medium block';
    } else {
        el.className = 'text-[11px] text-violet-300 bg-violet-500/10 border border-violet-500/20 p-2 rounded-xl font-medium block';
    }
    el.textContent = msg;
}

function buildEditPrompt(tool, instruction, configSnapshot) {
    const safe = (instruction || '').trim();
    if (tool === 'thumbnail') {
        const platform = configSnapshot?.platform || 'YouTube';
        return `You are an AI image editor. Edit the provided reference thumbnail according to this instruction: "${safe}". Preserve the platform composition for ${platform}, the overall layout, focal subject, and lighting. Make only the requested change. Keep the image suitable for a click-through thumbnail.`;
    }
    if (tool === 'infographic') {
        const type = configSnapshot?.type || 'Informational';
        return `You are an AI image editor. Edit the provided reference infographic according to this instruction: "${safe}". Preserve the ${type} layout structure, hierarchy, typography readability, and visual consistency. Make only the requested change. Do not add unrelated icons, random decorative text, or fabricated data. Keep the data faithful to the original.`;
    }
    if (tool === 'ugc') {
        const mode = configSnapshot?.mode || 'Product Photo';
        return `You are an AI image editor. Edit the provided reference product advertising image according to this instruction: "${safe}". Preserve the ${mode} composition, the product identity (shape, color, logo, label, packaging), and the overall lighting and mood. Make only the requested change. Do not add unrelated elements, fake UI, or social-media overlays.`;
    }
    if (tool === 'character') {
        return `You are an AI image editor. Edit the provided character reference sheet according to this instruction: "${safe}". The sheet is an editorial 7-panel layout of the SAME person: one large full-body front panel on the left, stacked half-body side and three-quarter panels on the right, and four equal expression close-ups across the bottom. Preserve this exact composition, black gutters, title, labels, and identity across all 7 panels. Make only the requested change. Do not convert it to a 3x3 grid, add panels, or add extra people.`;
    }
    if (tool === 'poster') {
        const designType = configSnapshot?.designType || 'poster';
        return `You are an AI image editor. Edit the provided reference ${designType} poster according to this instruction: "${safe}". Preserve the platform composition, typography hierarchy, and overall style. Keep the existing main message text intact unless the instruction specifically says to change it. Make only the requested change. No UI overlays, no fake platform chrome.`;
    }
    return `You are an AI image editor. Edit the provided reference image according to this instruction: "${safe}". Preserve the overall composition, lighting, focal subject, and photographic style. Make only the requested change. Do not add unrelated elements.`;
}

async function generateEditImage({ promptText, aspectRatio, references }) {
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

function appendEditResultCard(record) {
    const grid = document.querySelector('.image-gen-grid');
    if (!grid) return;
    const currentCount = grid.querySelectorAll('[data-img-card]').length;
    grid.setAttribute('data-count', currentCount + 1);
    const cardId = record.id;
    const card = document.createElement('div');
    card.setAttribute('data-img-card', '');
    card.className = 'glass-card rounded-2xl p-5 border border-violet-500/30 shadow-xl relative overflow-hidden';
    card.innerHTML = `
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-pink-500"></div>
        <div class="flex justify-between items-center mb-3">
            <span class="text-[10px] font-extrabold text-violet-300 uppercase tracking-widest">Edit Versi ${record.version}</span>
            <span class="text-[10px] text-emerald-300 font-mono">saved</span>
        </div>
        <div class="relative bg-black/80 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center min-h-[260px]">
            <img src="${record.dataUrl}" class="w-full h-auto object-contain rounded-2xl" onclick="openImageLightbox('${record.dataUrl}')" alt="edit result" />
        </div>
        <div class="mt-3 flex justify-end gap-2">
            <button onclick="openEditImageModalFromRecord('${record.id}')" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                <i class="fa-solid fa-pen mr-1"></i>Edit
            </button>
            <button onclick="downloadImage('${record.dataUrl}', buildDownloadFilename('${record.tool}'))" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                <i class="fa-solid fa-download mr-1"></i>Download
            </button>
        </div>`;
    grid.appendChild(card);
}

async function openEditImageModalFromRecord(recordId) {
    const rec = await getImageGenHistoryRecord(recordId);
    if (!rec) return;
    editImageState.tool = rec.tool;
    editImageState.dataUrl = rec.dataUrl;
    editImageState.aspectRatio = rec.configSnapshot?.aspectRatio;
    editImageState.configSnapshot = rec.configSnapshot;
    editImageState.sourceRecordId = rec.id;

    const previewImg = document.getElementById('editImagePreviewImg');
    if (previewImg) previewImg.src = rec.dataUrl;
    const instr = document.getElementById('editImageInstruction');
    if (instr) instr.value = '';
    const modal = document.getElementById('editImageModal');
    if (modal) modal.classList.remove('hidden');
    showEditImageNotice('', 'info');
}

async function submitEditImage() {
    const instructionEl = document.getElementById('editImageInstruction');
    const instruction = instructionEl ? instructionEl.value.trim() : '';
    if (!instruction) {
        showEditImageNotice('Jelaskan perubahan yang ingin dilakukan.', 'error');
        return;
    }
    if (!editImageState.dataUrl || !editImageState.tool) return;

    const promptText = buildEditPrompt(editImageState.tool, instruction, editImageState.configSnapshot);
    const submitBtn = document.getElementById('btnSubmitEdit');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> <span>Generating...</span>';
    }
    showEditImageNotice('Memproses edit...', 'info');

    try {
        const newDataUrl = await generateEditImage({
            promptText,
            aspectRatio: editImageState.aspectRatio,
            references: [{ dataUrl: editImageState.dataUrl }]
        });

        const sourceId = editImageState.sourceRecordId;
        const source = sourceId ? await getImageGenHistoryRecord(sourceId) : null;
        let record;
        if (source) {
            source.sourceDataUrl = source.dataUrl || source.sourceDataUrl || null;
            source.dataUrl = newDataUrl;
            source.promptUsed = promptText;
            source.configSnapshot = editImageState.configSnapshot || source.configSnapshot;
            source.ts = new Date().toISOString();
            source.version = (Number(source.version) || 1) + 1;
            source.tool = source.tool || editImageState.tool;
            source.type = source.type || source.tool || editImageState.tool;
            await saveImageGenHistory(source);
            record = source;
            if (Array.isArray(state.imageGen.lastResult)) {
                state.imageGen.lastResult.forEach((item) => {
                    if (item && item.historyId === sourceId) {
                        item.dataUrl = newDataUrl;
                        item.promptUsed = promptText;
                    }
                });
            }
        } else {
            record = {
                id: 'ig_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
                ts: new Date().toISOString(),
                tool: editImageState.tool,
                type: editImageState.tool,
                parentId: null,
                version: 1,
                configSnapshot: editImageState.configSnapshot,
                promptUsed: promptText,
                dataUrl: newDataUrl,
                sourceDataUrl: editImageState.dataUrl
            };
            await saveImageGenHistory(record);
        }

        appendEditResultCard(record);
        showEditImageNotice('Hasil edit tersimpan. History di-update ke versi terbaru.', 'success');
        if (instructionEl) instructionEl.value = '';
        setTimeout(() => {
            closeEditImageModal();
        }, 1500);
    } catch (err) {
        console.error('Edit image failed:', err);
        showEditImageNotice('Edit gagal: ' + (err && err.message ? err.message : 'Unknown error'), 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate Edit</span>';
        }
    }
}

async function openImageGenHistoryModal(tool) {
    const modal = document.getElementById('imageGenHistoryModal');
    if (modal) modal.classList.remove('hidden');
    const list = document.getElementById('imageGenHistoryList');
    if (!list) return;
    list.innerHTML = '<div class="text-center text-gray-500 text-xs py-6">Memuat history...</div>';
    const all = await loadAllImageGenHistory();
    const filtered = tool ? all.filter(r => r.tool === tool) : all;
    renderImageGenHistoryList(filtered, tool);
}

function closeImageGenHistoryModal() {
    const modal = document.getElementById('imageGenHistoryModal');
    if (modal) modal.classList.add('hidden');
}

function renderImageGenHistoryList(records, tool) {
    const list = document.getElementById('imageGenHistoryList');
    if (!list) return;
    if (!records || records.length === 0) {
        const tlabel = tool === 'foto' ? 'FotoGenerate' : tool === 'thumbnail' ? 'Thumbnail' : tool === 'infographic' ? 'Infographic' : tool === 'ugc' ? 'UGC / Product Ads' : tool === 'character' ? 'Character Sheet' : tool === 'poster' ? 'Poster & Social Media' : tool === 'voiceover' ? 'Voice Over' : tool === 'autoads' ? 'Auto Ads' : tool === 'video-merge' ? 'Gabungkan Video' : 'tool ini';
        list.innerHTML = '<div class="text-center text-gray-500 text-xs py-6">Belum ada history untuk ' + tlabel + '.</div>';
        return;
    }
    const toolLabel = (t) => t === 'foto' ? 'FotoGenerate' : t === 'thumbnail' ? 'Thumbnail' : t === 'infographic' ? 'Infographic' : t === 'ugc' ? 'UGC / Product Ads' : t === 'character' ? 'Character Sheet' : t === 'poster' ? 'Poster & Social Media' : t === 'voiceover' ? 'Voice Over' : t === 'autoads' ? 'Auto Ads' : t === 'video-merge' ? 'Gabungkan Video' : t;
    list.innerHTML = records.map(r => {
        const ts = r.ts || '';
        const kind = r.tool || r.type;
        const unifiedId = 'ig:' + r.id;
        const versionLabel = r.version === 1 ? 'Original' : 'Edit Versi ' + (r.version - 1);
        const parentBadge = r.parentId ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 font-bold">CHILD</span>' : '';
        const isVoiceover = kind === 'voiceover';
        const isAutoads = kind === 'autoads';
        const isVideoMerge = kind === 'video-merge';
        const cfg = r.configSnapshot || {};
        const summary = isVoiceover
            ? ((cfg.voice || '') + ' · ' + (cfg.style || '') + ' · ' + (cfg.tempo || '')).replace(/^ · | · $/g, '')
            : isAutoads
                ? ((cfg.productName || '').slice(0, 40) + (cfg.platform ? ' · ' + cfg.platform : '') + (cfg.duration ? ' · ' + cfg.duration : ''))
                : isVideoMerge
                    ? ((cfg.clipCount || 0) + ' video' + (cfg.voiceFile ? ' · voice over' : '') + (cfg.outputSize ? ' · ' + formatFileSize(cfg.outputSize) : ''))
                : (r.summary || '');
        const previewArea = isVoiceover
            ? (r.dataUrl
                ? `<audio controls preload="none" class="w-full h-9" src="${r.dataUrl}"></audio>`
                : '<div class="h-12 flex items-center justify-center text-gray-500 text-xs">Audio belum tersimpan (regenerate untuk simpan)</div>')
            : isVideoMerge
                ? `<div class="sm:col-span-2"><video controls preload="metadata" class="w-full rounded-xl border border-white/10 bg-black max-h-80" src="${r.dataUrl || ''}"></video></div>`
            : isAutoads
                ? `<div class="space-y-1 text-[10px] text-gray-300 font-mono leading-snug">
                        <div><span class="text-yellow-400 font-bold uppercase mr-1">Hook:</span>${escapeHtml(cfg.hook || '-')}</div>
                        <div><span class="text-cyan-400 font-bold uppercase mr-1">Body:</span>${escapeHtml((cfg.body || '-').slice(0, 240))}${(cfg.body && cfg.body.length > 240) ? '…' : ''}</div>
                        <div><span class="text-pink-400 font-bold uppercase mr-1">CTA:</span>${escapeHtml(cfg.cta || '-')}</div>
                   </div>`
                : (r.sourceDataUrl ? `
                        <div>
                            <p class="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Source</p>
                            <img src="${r.sourceDataUrl}" class="w-full h-auto object-contain rounded-xl border border-white/10 cursor-zoom-in" onclick="openImageLightbox('${r.sourceDataUrl}')" alt="source" />
                        </div>
                        <div>
                            <p class="text-[10px] text-emerald-300 mb-1 uppercase tracking-wider">Edit Result</p>
                            <img src="${r.dataUrl}" class="w-full h-auto object-contain rounded-xl border border-white/10 cursor-zoom-in" onclick="openImageLightbox('${r.dataUrl}')" alt="result" />
                        </div>
                    ` : `
                        <div class="sm:col-span-2">
                            <img src="${r.dataUrl}" class="w-full h-auto object-contain rounded-xl border border-white/10 cursor-zoom-in max-h-64" onclick="openImageLightbox('${r.dataUrl}')" alt="result" />
                        </div>
                    `);
        const actions = isAutoads
            ? `<button onclick="reopenHistoryRecord('${unifiedId}')" class="text-[10px] bg-white/5 hover:bg-emerald-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-emerald-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-folder-open mr-1"></i>Buka & Edit
                    </button>`
            : isVideoMerge
                ? `<button onclick="reopenHistoryRecord('${unifiedId}')" class="text-[10px] bg-white/5 hover:bg-amber-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-folder-open mr-1"></i>Buka
                    </button>
                    <button onclick="downloadDataUrl('${r.dataUrl}', 'TRENDORA-ai-merged-${(ts || '').replace(/[:.]/g,'-')}.mp4')" class="text-[10px] bg-white/5 hover:bg-amber-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-download mr-1"></i>Download
                    </button>`
            : (isVoiceover
                ? `<button onclick="reopenHistoryRecord('${unifiedId}')" class="text-[10px] bg-white/5 hover:bg-cyan-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-cyan-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-folder-open mr-1"></i>Buka
                    </button>
                    <button onclick="downloadDataUrl('${r.dataUrl}', 'voiceover-${(ts || '').replace(/[:.]/g,'-')}.wav')" class="text-[10px] bg-white/5 hover:bg-cyan-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-cyan-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-download mr-1"></i>Download
                    </button>`
                : `<button onclick="reopenHistoryRecord('${unifiedId}')" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-folder-open mr-1"></i>Buka
                    </button>
                    <button onclick="openEditImageModalFromRecord('${r.id}')" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-pen mr-1"></i>Edit Lagi
                    </button>
                    <button onclick="downloadImage('${r.dataUrl}', buildDownloadFilename('${r.tool}'))" class="text-[10px] bg-white/5 hover:bg-violet-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/50 transition font-bold uppercase tracking-wide">
                        <i class="fa-solid fa-download mr-1"></i>Download
                    </button>`);
        return `
            <div class="glass-card rounded-2xl p-4 border border-white/10 space-y-3">
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-[10px] font-bold text-white">${toolLabel(kind)}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase tracking-wider">${escapeHtml(versionLabel)}</span>
                        ${parentBadge}
                    </div>
                    <span class="text-[10px] text-gray-500 font-mono">${escapeHtml(formatTimestamp(ts))}</span>
                </div>
                <p class="text-[10px] text-gray-400">${escapeHtml(summary)}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                    ${previewArea}
                </div>
                <div class="flex flex-wrap gap-2 justify-end">
                    ${actions}
                </div>
            </div>`;
    }).join('');
}

function downloadDataUrl(dataUrl, filename) {
    if (!dataUrl) return;
    try {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename || 'TRENDORA-ai.bin';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (err) {
        console.warn('downloadDataUrl failed:', err);
    }
}

function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function formatTimestamp(ts) {
    if (!ts) return '';
    try {
        const d = new Date(ts);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + min;
    } catch (e) {
        return ts;
    }
}

function saveOriginalToHistory(tool, dataUrl, promptUsed, configSnapshot) {
    const record = {
        id: 'ig_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        ts: new Date().toISOString(),
        ownerId: getHistoryOwnerId(),
        tool: tool,
        type: tool,
        parentId: null,
        version: 1,
        configSnapshot: configSnapshot,
        promptUsed: promptUsed,
        dataUrl: dataUrl,
        sourceDataUrl: null
    };
    saveImageGenHistory(record);
    return record;
}

function getLastResultHistoryId(idx) {
    const last = Array.isArray(state.imageGen.lastResult) ? state.imageGen.lastResult[idx] : null;
    return (last && last.historyId) || null;
}

async function persistImageGenLatest(tool, dataUrl, promptUsed, configSnapshot, idx, extra) {
    const existingId = getLastResultHistoryId(idx);
    let rec = existingId ? await getImageGenHistoryRecord(existingId) : null;
    if (rec) {
        rec.sourceDataUrl = rec.dataUrl || rec.sourceDataUrl || null;
        rec.dataUrl = dataUrl;
        rec.promptUsed = promptUsed;
        rec.configSnapshot = configSnapshot || rec.configSnapshot;
        rec.ts = new Date().toISOString();
        rec.version = (Number(rec.version) || 1) + 1;
        rec.tool = rec.tool || tool;
        rec.type = rec.type || rec.tool || tool;
        await saveImageGenHistory(rec);
    } else {
        rec = saveOriginalToHistory(tool, dataUrl, promptUsed, configSnapshot);
    }
    if (!Array.isArray(state.imageGen.lastResult)) state.imageGen.lastResult = [];
    state.imageGen.lastResult[idx] = Object.assign({}, state.imageGen.lastResult[idx] || {}, {
        dataUrl: dataUrl,
        promptUsed: promptUsed,
        historyId: rec ? rec.id : null
    }, extra || {});
    return rec;
}

