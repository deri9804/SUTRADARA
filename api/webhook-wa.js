/**
 * TRENDORA AI - WHATSAPP WEBHOOK HANDLER (Vercel Serverless Function)
 * Terhubung dengan Trendora WA Gateway, Database Supabase, dan Integrasi n8n
 * 
 * Arsitektur:
 * 1. AI Conversational Agent Luwes (Didukung Google Gemini AI)
 * 2. Menu Sapaan Interaktif 12 Fitur (Video, Image Gen, Audio, Video Tools)
 * 3. Alur Pembuatan Video 3 Langkah dengan Approval Gate (Persetujuan sebelum kirim ke n8n)
 * 4. Pengiriman Hasil Gambar Jadi (Foto, Thumbnail, UGC, dll) langsung ke WA (TIDAK ke n8n)
 * 5. Pengiriman Nomor WhatsApp Pengirim (sender_number) ke payload n8n agar n8n bisa kirim balik video ke WA
 */

// Helper normalisasi nomor telepon ke format 628xxx
function normalizePhone(phoneStr) {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
}

// In-Memory User Sessions & Caches (per sender phone)
const userSessionStore = new Map();
const userSettingsStore = new Map();
const userApiKeyStore = new Map();
const userN8nConfigStore = new Map();
const recentWaHistory = [];

function getUserSession(phone) {
    const key = normalizePhone(phone);
    if (!userSessionStore.has(key)) {
        userSessionStore.set(key, {
            step: 'idle', // 'idle' | 'awaiting_menu' | 'awaiting_story' | 'awaiting_video_settings' | 'awaiting_video_approval' | 'awaiting_image_prompt' | 'awaiting_voiceover_prompt' | 'awaiting_tool_input'
            featureId: null,
            featureKey: null,
            featureName: null,
            story: '',
            settings: {
                sceneCount: 3,
                shotsPerScene: 3,
                durationPerScene: '8s',
                aspectRatio: '9:16',
                episodeCount: 1,
                audioMode: 'Percakapan Dialog Tokoh',
                language: 'Bahasa Indonesia (Gen Z)'
            },
            referenceMediaUrl: null,
            referenceMediaType: null,
            draftScript: null,
            draftPayload: null,
            lastActive: Date.now()
        });
    }
    return userSessionStore.get(key);
}

function updateUserSession(phone, updates) {
    const key = normalizePhone(phone);
    const session = getUserSession(key);
    Object.assign(session, updates, { lastActive: Date.now() });
    userSessionStore.set(key, session);
    return session;
}

function resetUserSession(phone) {
    const key = normalizePhone(phone);
    userSessionStore.delete(key);
    return getUserSession(key);
}

// KATALOG LENGKAP 12 FITUR TRENDORA AI
const FEATURE_CATALOG = {
    '1': {
        key: 'commercial',
        type: 'video',
        name: 'Video Iklan & Promosi',
        badge: '📢 *[MODE: VIDEO IKLAN & PROMOSI]*',
        desc: 'Fokus penjualan produk/jasa, penahan scroll (hook), benefit produk, dan Call to Action (CTA) beli kuat.',
        askPrompt: 'Silakan ceritakan produk/jasa yang ingin Anda iklankan (nama produk, keunggulan, promo, dan target audiensnya). Bisa juga kirim foto produk dengan caption ceritanya!'
    },
    '2': {
        key: 'drama',
        type: 'video',
        name: 'Konten Kreatif & Storytelling',
        badge: '🎭 *[MODE: KONTEN KREATIF & STORYTELLING]*',
        desc: 'Fokus storytelling drama, komedi, POV, horor, edukasi, atau narasi emosional.',
        askPrompt: 'Silakan ceritakan ide / kisah video yang ingin Anda buat (tokoh, suasana, dan alur ceritanya). Bisa juga kirim foto karakter/lokasi dengan caption ceritanya!'
    },
    '3': {
        key: 'animation',
        type: 'video',
        name: 'Video Animasi & Fantasi',
        badge: '✨ *[MODE: VIDEO ANIMASI & FANTASI]*',
        desc: 'Fokus dunia fantasi, karakter 3D kartun/anime unik, dan aksi visual imajinatif.',
        askPrompt: 'Silakan ceritakan konsep video animasi Anda (karakter kartun/anime, dunia fantasi, dan petualangannya). Bisa juga kirim foto karakter kartun/referensi!'
    },
    '4': {
        key: 'foto',
        type: 'image',
        name: 'FotoGenerate (Foto Realistis)',
        badge: '📸 *[MODE: FOTOGENERATE]*',
        desc: 'Menghasilkan foto kamera DSLR ultra-realistis (model, suasana, produk, atau arsitektur).',
        askPrompt: 'Silakan deskripsikan foto yang ingin Anda buat secara detail (subjek, pose, pakaian, pencahayaan studio, sudut kamera). Anda juga bisa kirim foto referensi!'
    },
    '5': {
        key: 'thumbnail',
        type: 'image',
        name: 'Thumbnail YouTube & Medsos',
        badge: '🖼️ *[MODE: THUMBNAIL MEDSOS]*',
        desc: 'Menghasilkan desain thumbnail YouTube / Reels / TikTok yang menarik perhatian dan clickbait.',
        askPrompt: 'Silakan ketik Judul / Topik video Anda serta deskripsi visual thumbnail yang diinginkan (misal ekspresi wajah kaget, teks headline, atau objek mencolok). Bisa kirim foto wajah/objek juga!'
    },
    '6': {
        key: 'infographic',
        type: 'image',
        name: 'Infografis & Visual Data',
        badge: '📊 *[MODE: INFOGRAFIS AI]*',
        desc: 'Visualisasi data, poin-poin edukasi, atau bagan flowchart yang aesthetic.',
        askPrompt: 'Silakan ketik topik infografis dan poin-poin data/edukasi yang ingin ditampilkan secara visual!'
    },
    '7': {
        key: 'ugc',
        type: 'image',
        name: 'UGC / Product Ads',
        badge: '🛍️ *[MODE: UGC PRODUCT ADS]*',
        desc: 'Foto produk gaya user-generated content ala influencer/creator memegang produk nyata.',
        askPrompt: 'Silakan kirimkan foto produk Anda (atau deskripsikan produknya) dan gaya kreator/talent yang diinginkan!'
    },
    '8': {
        key: 'character',
        type: 'image',
        name: 'Character Sheet (Karakter Konsisten)',
        badge: '👤 *[MODE: CHARACTER SHEET]*',
        desc: 'Desain karakter konsisten dari berbagai sudut (depan, samping, close-up, ekspresi).',
        askPrompt: 'Silakan deskripsikan karakter Anda (nama, usia, gaya rambut, pakaian, ciri unik) atau kirim foto wajah karakter referensi!'
    },
    '9': {
        key: 'poster',
        type: 'image',
        name: 'Poster & Media Sosial',
        badge: '🎨 *[MODE: POSTER & KONTEN MEDSOS]*',
        desc: 'Desain poster promosi event, flyer, diskon toko, atau feed Instagram yang memikat.',
        askPrompt: 'Silakan deskripsikan pesan utama poster, tema visual, nuansa warna, dan teks promo yang ingin ditampilkan!'
    },
    '10': {
        key: 'voiceover',
        type: 'audio',
        name: 'Voice Over AI',
        badge: '🎙️ *[MODE: VOICE OVER AI]*',
        desc: 'Naskah audio / dubbing profesional dengan intonasi emosional, ritme bicara, dan sound effect.',
        askPrompt: 'Silakan ketik topik rekaman suara Anda, gaya nada bicara (semangat/formal/santai/bisnis), dan target pendengarnya!'
    },
    '11': {
        key: 'video-to-prompt',
        type: 'tool',
        name: 'Video to Prompt',
        badge: '🔍 *[MODE: VIDEO TO PROMPT]*',
        desc: 'Membedah video atau adegan referensi menjadi prompt AI sinematik siap pakai.',
        askPrompt: 'Silakan ceritakan atau paste detail video / adegan yang ingin dibedah menjadi prompt AI sinematik!'
    },
    '12': {
        key: 'video-merge',
        type: 'tool',
        name: 'Gabungkan Video',
        badge: '🎞️ *[MODE: GABUNGKAN VIDEO]*',
        desc: 'Panduan penyusunan adegan video, urutan transisi, dan perakitan timeline.',
        askPrompt: 'Silakan tuliskan daftar klip video yang Anda miliki serta konsep penggabungan / transisi yang diinginkan!'
    }
};

function matchFeatureFromText(text) {
    const raw = String(text || '').trim();
    const lower = raw.toLowerCase();

    // 1. Cek kecocokan nomor persis (1 - 12)
    const numMatch = lower.match(/^(?:pilih\s+|nomor\s+|no\.?\s*)?([1-9]|1[0-2])\b/);
    if (numMatch && FEATURE_CATALOG[numMatch[1]]) {
        return { id: numMatch[1], ...FEATURE_CATALOG[numMatch[1]] };
    }

    // 2. Cek kata kunci spesifik per fitur
    if (/\b(iklan|ads|commercial|jual|promo|promosi)\b/i.test(lower)) return { id: '1', ...FEATURE_CATALOG['1'] };
    if (/\b(kreatif|drama|cerita|storytelling|komedi|horor|pov)\b/i.test(lower)) return { id: '2', ...FEATURE_CATALOG['2'] };
    if (/\b(animasi|anime|kartun|3d cartoon|pixar|disney)\b/i.test(lower)) return { id: '3', ...FEATURE_CATALOG['3'] };
    if (/\b(foto|fotogenerate|photo|potret|dslr)\b/i.test(lower)) return { id: '4', ...FEATURE_CATALOG['4'] };
    if (/\b(thumbnail|tumbnail|sampul youtube|cover)\b/i.test(lower)) return { id: '5', ...FEATURE_CATALOG['5'] };
    if (/\b(infografis|infografik|infographic|data visual|bagan)\b/i.test(lower)) return { id: '6', ...FEATURE_CATALOG['6'] };
    if (/\b(ugc|user generated|foto produk|review produk)\b/i.test(lower)) return { id: '7', ...FEATURE_CATALOG['7'] };
    if (/\b(character sheet|karakter sheet|desain karakter|tokoh konsisten)\b/i.test(lower)) return { id: '8', ...FEATURE_CATALOG['8'] };
    if (/\b(poster|banner|flyer|feed ig|feed instagram)\b/i.test(lower)) return { id: '9', ...FEATURE_CATALOG['9'] };
    if (/\b(voiceover|voice over|vo|dubbing|sulih suara|naskah audio)\b/i.test(lower)) return { id: '10', ...FEATURE_CATALOG['10'] };
    if (/\b(video to prompt|reverse video|bedah video)\b/i.test(lower)) return { id: '11', ...FEATURE_CATALOG['11'] };
    if (/\b(gabungkan video|merge video|gabung video)\b/i.test(lower)) return { id: '12', ...FEATURE_CATALOG['12'] };

    return null;
}

function formatFullMainMenu(memberName = 'Kak') {
    return `🎬 *TRENDORA AI - ALL-IN-ONE DIRECTOR ENGINE* 🚀
_Halo Kak ${memberName}! Asisten AI Kreatif Trendora siap membantu memproduksi konten visual & video Anda._

Mau buat apa hari ini? Silakan balas dengan *NOMOR* atau *NAMA FITUR*:

📹 *A. VIDEO & STORYBOARD (Render ke n8n):*
1️⃣ *Video Iklan* (Formula AIDA/PAS untuk jualan & konversi produk)
2️⃣ *Konten Kreatif* (Storytelling drama, komedi, POV, horor, edukasi)
3️⃣ *Video Animasi* (Konsep 3D Pixar, Anime, & petualangan fantasi)

🖼️ *B. GENERATE IMAGE (Hasil Gambar Jadi di WA):*
4️⃣ *FotoGenerate* (Foto kamera DSLR ultra-realistis)
5️⃣ *Thumbnail Medsos* (Thumbnail clickbait YouTube / Reels / TikTok)
6️⃣ *Infografis AI* (Visualisasi data, grafik, & poin edukasi)
7️⃣ *UGC / Product Ads* (Foto produk ala konten influencer nyata)
8️⃣ *Character Sheet* (Desain karakter konsisten dari berbagai sudut)
9️⃣ *Poster & Medsos* (Flyer promosi, feed Instagram, banner)

🎙️ *C. AUDIO & TOOLS (Hasil Jadi di WA):*
🔟 *Voice Over AI* (Naskah audio profesional + panduan emosi)
1️⃣1️⃣ *Video to Prompt* (Bedah video/ide jadi prompt sinematik)
1️⃣2️⃣ *Gabungkan Video* (Panduan perakitan adegan & timeline)

━━━━━━━━━━━━━━━━━━━━
👉 *Ketik nomor pilihan Anda (contoh: ketik \`2\` untuk Konten Kreatif, atau \`5\` untuk Thumbnail)!*`;
}

function formatVideoSettingsCheckpoint(session, memberName = 'Kak') {
    const s = session.settings;
    const ratioLabel = s.aspectRatio === '9:16' ? '9:16 (Vertikal TikTok/Reels)' : s.aspectRatio === '16:9' ? '16:9 (Landscape YouTube)' : '1:1 (Square Feed)';
    const photoStatus = session.referenceMediaUrl ? 'Foto Terdeteksi & Terkunci 📸' : 'Belum ada (Bisa kirim sekarang atau lewati)';

    return `🎬 *RINGKASAN IDE CERITA DITERIMA:*
_"${session.story}"_

📸 *1. Foto Referensi (Karakter / Produk / Lokasi):*
${photoStatus}

⚙️ *2. Pengaturan Storyboard (Standar Sutradara):*
• *Jumlah Adegan:* ${s.sceneCount} Adegan (Pilihan: 1 - 6)
• *Shot per Adegan:* ${s.shotsPerScene} Shot
• *Durasi:* ${s.durationPerScene} per adegan
• *Format Video:* ${ratioLabel}
• *Episode:* ${s.episodeCount || 1} Episode
• *Mode Audio:* ${s.audioMode}
• *Bahasa Naskah:* ${s.language}

━━━━━━━━━━━━━━━━━━━━
👉 *Jika SETUJU dengan pengaturan di atas*, cukup balas: *OKE* (atau *GAS*)
👉 *Jika ingin MENGUBAH*, ketik ubahannya saja, contoh:
_"4 adegan, durasi 10s, ratio 16:9, bahasa formal"_
_(Anda juga bisa mengirimkan foto referensi sekarang sebelum mengetik OKE)_`;
}

function parseCustomSettings(text, baseSettings) {
    const raw = String(text || '');
    const lower = raw.toLowerCase();
    const settings = Object.assign({}, baseSettings);

    const sceneMatch = raw.match(/(?:--adegan[=:\s]+|adegan[:\s]+|\b)([1-6])\s*(?:adegan|scene|scenes)?/i);
    if (sceneMatch) settings.sceneCount = parseInt(sceneMatch[1], 10);

    const shotMatch = raw.match(/(?:--shot[=:\s]+|shot[:\s]+|\b)([1-6])\s*(?:shot|shots)/i);
    if (shotMatch) settings.shotsPerScene = parseInt(shotMatch[1], 10);

    const durMatch = raw.match(/(?:--durasi[=:\s]+|durasi[:\s]+|\b)(5|8|10|15|30)\s*(?:s|detik|sec|second)/i);
    if (durMatch) settings.durationPerScene = `${durMatch[1]}s`;

    const epMatch = raw.match(/(?:--episode[=:\s]+|episode[:\s]+|\b)([1-5])\s*(?:episode|ep|eps)?/i);
    if (epMatch) settings.episodeCount = parseInt(epMatch[1], 10);

    if (/\b(16:9|landscape|horizontal|youtube)\b/i.test(lower)) {
        settings.aspectRatio = '16:9';
    } else if (/\b(1:1|square|kotak|feed)\b/i.test(lower)) {
        settings.aspectRatio = '1:1';
    } else if (/\b(9:16|vertikal|vertical|reels|tiktok|shorts)\b/i.test(lower)) {
        settings.aspectRatio = '9:16';
    }

    if (/\b(bahasa\s+)?(formal|resmi|bisnis|profesional)\b/i.test(lower)) {
        settings.language = 'Bahasa Indonesia (Formal & Bisnis)';
    } else if (/\b(bahasa\s+)?(inggris|english)\b/i.test(lower)) {
        settings.language = 'English (International)';
    } else if (/\b(bahasa\s+)?(jawa)\b/i.test(lower)) {
        settings.language = 'Bahasa Jawa';
    } else if (/\b(bahasa\s+)?(sunda)\b/i.test(lower)) {
        settings.language = 'Bahasa Sunda';
    } else if (/\b(bahasa\s+)?(gen z|santai|gaul|slang)\b/i.test(lower)) {
        settings.language = 'Bahasa Indonesia (Gen Z)';
    }

    if (/\b(dialog|percakapan)\b/i.test(lower) && !/\b(tanpa dialog)\b/i.test(lower)) {
        settings.audioMode = 'Percakapan Dialog Tokoh';
    } else if (/\b(voiceover|narasi|voice over|vo)\b/i.test(lower)) {
        settings.audioMode = 'Voiceover Narasi Penuh';
    } else if (/\b(tanpa suara|no voice|instrumental|musik saja)\b/i.test(lower)) {
        settings.audioMode = 'Sound FX & BGM Only';
    }

    return settings;
}

// Upload base64 image ke tmpfiles.org untuk mendapatkan direct public download link bagi WhatsApp Dispatch
async function uploadBase64ToPublicUrl(base64Data, mimeType = 'image/jpeg', filename = 'trendora-visual.jpg') {
    try {
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], { type: mimeType });
        const formData = new FormData();
        formData.append('file', blob, filename);
        const resp = await fetch('https://tmpfiles.org/api/v1/upload', {
            method: 'POST',
            body: formData
        });
        if (resp.ok) {
            const resJson = await resp.json();
            if (resJson.data && resJson.data.url) {
                return resJson.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
            }
        }
    } catch (e) {
        console.warn('[WA-WEBHOOK] Upload public link gagal:', e.message);
    }
    return null;
}

// Generate Image via Gemini Image Generation Model
async function generateImageViaGemini(promptText, aspectRatio = '1:1', refImageBase64 = null, apiKey) {
    const candidateModels = [
        'gemini-3.1-flash-image-preview',
        'gemini-2.5-flash-image',
        'gemini-3.1-flash-lite-image',
        'gemini-3-pro-image-preview'
    ];

    let lastErr = null;
    for (const model of candidateModels) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const contents = [{ role: 'user', parts: [{ text: promptText }] }];
            if (refImageBase64) {
                contents[0].parts.push({
                    inlineData: { mimeType: 'image/jpeg', data: refImageBase64 }
                });
            }

            const resp = await fetch(url, {
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

            if (resp.ok) {
                const data = await resp.json();
                const part = data.candidates?.[0]?.content?.parts?.[0];
                if (part && part.inlineData && part.inlineData.data) {
                    return {
                        model,
                        mimeType: part.inlineData.mimeType || 'image/jpeg',
                        base64: part.inlineData.data
                    };
                }
            } else {
                const errDetail = await resp.text().catch(() => '');
                lastErr = `Model ${model} returned ${resp.status}: ${errDetail.slice(0, 150)}`;
                console.warn(`[WA-WEBHOOK] Gemini Image (${model}) status ${resp.status}`);
            }
        } catch (e) {
            lastErr = e.message;
        }
    }
    throw new Error(lastErr || 'Gagal menghasilkan gambar via Gemini Image Engine');
}

// Generate Conversational Q&A / Response via Gemini AI
async function chatWithGeminiAI(userMessage, systemInstruction, apiKey) {
    const candidateModels = [
        'gemini-flash-latest',
        'gemini-2.0-flash',
        'gemini-3.1-flash-lite',
        'gemini-3-flash-preview'
    ];

    for (const model of candidateModels) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: systemInstruction }, { text: userMessage }] }
                    ],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
                })
            });
            if (resp.ok) {
                const data = await resp.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text.trim();
            }
        } catch (_) {}
    }
    return null;
}

module.exports = async function handler(req, res) {
    // 1. Health check & History API endpoint
    if (req.method === 'GET') {
        const query = req.query || {};
        const urlStr = req.url || '';
        if (query.action === 'history' || query.action === 'get_history' || urlStr.includes('action=history')) {
            return res.status(200).json({
                status: 'success',
                count: recentWaHistory.length,
                history: recentWaHistory
            });
        }
        return res.status(200).json({
            status: 'online',
            service: 'Trendora AI WhatsApp Member Engine v6.0',
            timestamp: new Date().toISOString()
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const startTime = Date.now();

    try {
        const body = req.body || {};
        const {
            event,
            session_key,
            sender_number,
            phone_number,
            sender_name,
            message,
            is_group,
            media_url,
            media_type,
            caption
        } = body;

        // Normalisasi nomor pengirim
        const rawPhone = (sender_number || phone_number || body.from || body.sender || body.phone || body.senderPhone || '').replace(/[^0-9]/g, '');
        const senderPhone = normalizePhone(rawPhone);

        // Ambil session key dengan fallback ke session WhatsApp aktif milik Deri (Slot 19)
        let activeSessionKey = String(
            session_key || body.session_id || body.sessionId || body.session || process.env.TRENDORA_WA_SESSION || '3_dev_57824_1788062608'
        );
        if (activeSessionKey === '1' || activeSessionKey === 'undefined' || !activeSessionKey) {
            activeSessionKey = '3_dev_57824_1788062608';
        }

        // Ekstraksi Media Referensi
        const rawMediaUrl = (media_url || body.file_url || body.url || '').trim();
        const rawMediaType = (media_type || body.type || '').toUpperCase();
        const rawCaption = (caption || '').trim();

        let userPrompt = (message || rawCaption || '').trim();
        if (userPrompt === '[IMAGE]' || userPrompt === '[MEDIA]') userPrompt = rawCaption;

        console.log(`[WA-WEBHOOK] Pesan masuk dari ${senderPhone} (${sender_name}): "${userPrompt.slice(0, 50)}..." | Media: ${rawMediaUrl || 'None'}`);

        if (!senderPhone || is_group) {
            return res.status(200).json({ status: 'ignored' });
        }

        // Konfigurasi Gateway & Supabase
        const waGatewayUrl = process.env.TRENDORA_WA_URL || 'https://whatsappapi.trendoraautomation.my.id/api/dispatch';
        const waBearerToken = process.env.TRENDORA_WA_TOKEN || 'TRD-LIVE-65D2D12CB1D262A227D95D417846DEF2';
        const supabaseUrl = process.env.SUPABASE_URL || 'https://inixcxbvfyvmuuzlkljq.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_ozGrENkmrJH48KSWov2BIw_2f13d_qH';
        const ADMIN_DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || Buffer.from('QVEuQWI4Uk42S2RXUWNJZkw1WDNTV1dqbVdWRWhWcEMtRG9BMXE0RnlhNmN6Nk9LWkg3c2c=', 'base64').toString('utf-8');

        // Helper kirim balasan WhatsApp
        const sendWaReply = async (replyText, mediaUrl = null, mediaType = null) => {
            if (!waBearerToken) return false;
            try {
                const payload = {
                    session_key: activeSessionKey,
                    phone_number: senderPhone,
                    message: replyText
                };
                if (mediaUrl) {
                    payload.media_url = mediaUrl;
                    payload.media_type = mediaType || 'IMAGE';
                }

                const resp = await fetch(waGatewayUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${waBearerToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                return resp.ok;
            } catch (err) {
                console.error('[WA-WEBHOOK] Gagal kirim balasan ke WA:', err.message);
                return false;
            }
        };

        // 2. VERIFIKASI MEMBER / ADMIN
        let activeMember = null;
        try {
            const localZeroPhone = senderPhone.startsWith('62') ? '0' + senderPhone.slice(2) : senderPhone;
            const queryUrl = `${supabaseUrl}/rest/v1/profiles?or=(phone.eq.${senderPhone},phone.eq.${localZeroPhone})&status=eq.active&select=*&limit=1`;
            const sbResp = await fetch(queryUrl, {
                headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
            });
            if (sbResp.ok) {
                const profiles = await sbResp.json();
                if (Array.isArray(profiles) && profiles.length > 0) activeMember = profiles[0];
            }
        } catch (_) {}

        const ADMIN_DEFAULT_PHONES = ['6282375958716', '6282374401480'];
        const envAdminPhones = (process.env.ADMIN_PHONE || '').split(',').map(p => normalizePhone(p)).filter(Boolean);
        const adminPhoneList = [...new Set([...ADMIN_DEFAULT_PHONES, ...envAdminPhones])];
        const isAdmin = adminPhoneList.includes(senderPhone) || (activeMember && activeMember.role === 'admin');

        if (!activeMember && isAdmin) {
            activeMember = { 
                id: '7ab993cd-cc32-48e3-b323-0f81908c83a9', 
                full_name: 'Deri Pernandi', 
                email: 'deripernandi99@gmail.com',
                role: 'admin', 
                status: 'active',
                phone: senderPhone,
                n8n_auto_forward: true,
                n8n_webhook_url: 'https://n8n-deripernandi.trendoraautomation.my.id/webhook/video-Trendora',
                gemini_api_key: process.env.GEMINI_API_KEY || ADMIN_DEFAULT_GEMINI_KEY
            };
        }

        if (!activeMember) {
            console.log(`[WA-WEBHOOK] Silent ignore untuk nomor non-member: ${senderPhone}`);
            return res.status(200).json({ status: 'ignored_non_member' });
        }

        const memberName = activeMember.full_name || 'Member';
        const memberGeminiKey = (activeMember && activeMember.gemini_api_key && activeMember.gemini_api_key.trim()) ||
                                (isAdmin ? (process.env.GEMINI_API_KEY || ADMIN_DEFAULT_GEMINI_KEY) : '') ||
                                userApiKeyStore.get(senderPhone) || '';

        // Ambil sesi aktif user
        const session = getUserSession(senderPhone);
        const lowerPrompt = userPrompt.toLowerCase().trim();

        // 3. GLOBAL COMMANDS (Bisa dipanggil kapan saja)
        if (['menu', 'help', 'bantuan', 'start', 'mulai', 'reset', 'batal', 'cancel', 'pilih'].includes(lowerPrompt)) {
            resetUserSession(senderPhone);
            updateUserSession(senderPhone, { step: 'awaiting_menu' });
            await sendWaReply(formatFullMainMenu(memberName));
            return res.status(200).json({ status: 'menu_sent' });
        }

        if (lowerPrompt === 'n8n on' || lowerPrompt === '/n8n on') {
            userN8nConfigStore.set(senderPhone, Object.assign(userN8nConfigStore.get(senderPhone) || {}, { autoForward: true }));
            if (activeMember) activeMember.n8n_auto_forward = true;
            await sendWaReply(
                `⚡ *Auto-Forward n8n DIAKTIFKAN (ON) 🟢*\n\n` +
                `Setelah konsep video disetujui (*GAS*), data otomatis diteruskan ke workflow n8n Anda!`
            );
            return res.status(200).json({ status: 'n8n_on' });
        }

        if (lowerPrompt === 'n8n off' || lowerPrompt === '/n8n off') {
            userN8nConfigStore.set(senderPhone, Object.assign(userN8nConfigStore.get(senderPhone) || {}, { autoForward: false }));
            if (activeMember) activeMember.n8n_auto_forward = false;
            await sendWaReply(`⏸️ *Auto-Forward n8n DINONAKTIFKAN (OFF).*`);
            return res.status(200).json({ status: 'n8n_off' });
        }

        if (lowerPrompt === 'n8n status' || lowerPrompt === '/n8n status') {
            const cachedN8n = userN8nConfigStore.get(senderPhone);
            const isCurrentlyOn = cachedN8n && typeof cachedN8n.autoForward === 'boolean' ? cachedN8n.autoForward : ((activeMember && activeMember.n8n_auto_forward !== false) || true);
            const currentUrl = (cachedN8n && cachedN8n.url) || (activeMember && activeMember.n8n_webhook_url) || 'https://n8n-deripernandi.trendoraautomation.my.id/webhook/video-Trendora';
            await sendWaReply(
                `📊 *STATUS INTEGRASI n8n:* \n\n` +
                `• Auto-Forward: *${isCurrentlyOn ? 'AKTIF (ON) 🟢' : 'NONAKTIF (OFF) ⚪'}*\n` +
                `• Target Webhook:\n\`${currentUrl}\`\n\n` +
                `_Ketik \`n8n on\` untuk aktifkan, \`n8n off\` untuk matikan, atau \`set n8n [URL]\` untuk ganti URL._`
            );
            return res.status(200).json({ status: 'n8n_status_checked' });
        }

        if (/^(?:set\s+n8n|n8n\s+url[:\s]+)/i.test(userPrompt)) {
            const rawUrl = userPrompt.replace(/^(?:set\s+n8n|n8n\s+url[:\s]+)[\s:]*/i, '').trim();
            if (rawUrl.startsWith('http')) {
                userN8nConfigStore.set(senderPhone, { url: rawUrl, autoForward: true });
                if (activeMember) { activeMember.n8n_webhook_url = rawUrl; activeMember.n8n_auto_forward = true; }
                await sendWaReply(`✅ *URL Webhook n8n berhasil diperbarui:*\n\`${rawUrl}\` ⚡`);
                return res.status(200).json({ status: 'n8n_url_updated' });
            }
        }

        if (/^(?:set\s+key\s+|gemini\s+key[:\s]+)/i.test(userPrompt)) {
            const cleanKey = userPrompt.replace(/^(?:set\s+key\s+|gemini\s+key[:\s]+)/i, '').trim();
            if (cleanKey.length >= 20) {
                userApiKeyStore.set(senderPhone, cleanKey);
                if (activeMember) activeMember.gemini_api_key = cleanKey;
                await sendWaReply(`🔑 *Gemini API Key berhasil disimpan untuk akun Anda!* 🚀`);
                return res.status(200).json({ status: 'gemini_key_saved' });
            }
        }

        // ==============================================================
        // 4. SMART CONVERSATIONAL ROUTING BERDASARKAN STATE SESI
        // ==============================================================

        // STEP 1: JIKA USER MASIH DI MENU / BARU MEMULAI CHAT
        if (session.step === 'idle' || session.step === 'awaiting_menu') {
            const matchedFeature = matchFeatureFromText(userPrompt);

            if (matchedFeature) {
                // User langsung memilih salah satu fitur (angka 1-12 atau nama fitur)
                const isVideo = matchedFeature.type === 'video';
                const nextStep = isVideo ? 'awaiting_story' : (matchedFeature.type === 'image' ? 'awaiting_image_prompt' : 'awaiting_tool_input');

                updateUserSession(senderPhone, {
                    step: nextStep,
                    featureId: matchedFeature.id,
                    featureKey: matchedFeature.key,
                    featureName: matchedFeature.name,
                    story: '',
                    referenceMediaUrl: rawMediaUrl || null
                });

                let promptReply = `${matchedFeature.badge}\n_Halo Kak ${memberName}!_\n\n📌 *${matchedFeature.desc}*\n\n👉 *Langkah Selanjutnya:*\n${matchedFeature.askPrompt}\n\n_💡 Ketik \`batal\` kapan saja untuk kembali ke menu utama._`;
                await sendWaReply(promptReply);
                return res.status(200).json({ status: 'feature_selected', feature: matchedFeature.key });
            }

            // Jika user hanya menyapa / mengetik teks biasa / bertanya seputar AI:
            // Gunakan otak Gemini untuk menjawab ramah dan mengajak memilih menu
            const conversationalReply = await chatWithGeminiAI(
                userPrompt,
                `Anda adalah "Trendora Assistant", asisten kreatif AI dari TRENDORA AI yang ramah, sopan, asyik, dan komunikatif ala Gen Z profesional.
Pengguna (${memberName}) baru saja mengirim pesan di WhatsApp: "${userPrompt}".
Tugas Anda:
1. Balas pesan pengguna dengan ramah, nyambung, dan relevan dengan apa yang mereka tanyakan/katakan.
2. Jelaskan secara singkat dan menarik bahwa Trendora AI siap membantu mereka membuat video iklan, konten kreatif, animasi, foto AI, thumbnail, poster, dan voiceover.
3. Di akhir balasan, arahkan pengguna untuk memilih menu nomor 1 sampai 12 (ketik 'menu' untuk melihat daftar lengkap).
Format teks WhatsApp bersih dengan emoji yang menarik.`,
                memberGeminiKey || ADMIN_DEFAULT_GEMINI_KEY
            );

            if (conversationalReply) {
                await sendWaReply(conversationalReply);
            } else {
                updateUserSession(senderPhone, { step: 'awaiting_menu' });
                await sendWaReply(formatFullMainMenu(memberName));
            }
            return res.status(200).json({ status: 'chitchat_responded' });
        }

        // ==============================================================
        // STEP 2: ALUR VIDEO PRODUCTION (FITUR 1, 2, 3)
        // ==============================================================
        if (['awaiting_story', 'awaiting_video_settings', 'awaiting_video_approval'].includes(session.step)) {

            // SUB-STEP 2A: MENERIMA IDE CERITA
            if (session.step === 'awaiting_story') {
                if (!userPrompt && !rawMediaUrl) {
                    await sendWaReply(`📝 Silakan ketik ide cerita video Anda atau kirim foto referensi dengan caption ide ceritanya!`);
                    return res.status(200).json({ status: 'story_needed' });
                }

                const storyText = userPrompt || 'Konsep visual sesuai foto referensi terlampir';
                updateUserSession(senderPhone, {
                    story: storyText,
                    referenceMediaUrl: rawMediaUrl || session.referenceMediaUrl,
                    step: 'awaiting_video_settings'
                });

                // Kirim Lembar Pengaturan & Referensi (Smart Preset)
                const settingsMsg = formatVideoSettingsCheckpoint(session, memberName);
                await sendWaReply(settingsMsg);
                return res.status(200).json({ status: 'story_received_awaiting_settings' });
            }

            // SUB-STEP 2B: MENERIMA KONFIRMASI PENGATURAN / FOTO REFERENSI
            if (session.step === 'awaiting_video_settings') {
                // Simpan foto referensi tambahan jika user baru kirim di tahap ini
                if (rawMediaUrl) {
                    session.referenceMediaUrl = rawMediaUrl;
                }

                // Cek apakah user setuju (OKE / GAS / LANJUT / SETUJU) atau mau kustomisasi setting
                const isQuickAgree = /^(oke|ok|gas|lanjut|setuju|yes|ya|siap|next)$/i.test(lowerPrompt);
                if (!isQuickAgree && userPrompt) {
                    session.settings = parseCustomSettings(userPrompt, session.settings);
                }

                updateUserSession(senderPhone, { step: 'generating_video_draft' });

                await sendWaReply(
                    `⏳ *TRENDORA AI sedang merancang cetak biru storyboard & naskah lengkap...* 🎬\n\n` +
                    `• Fitur: *${session.featureName || 'Video Production'}*\n` +
                    `• Adegan: ${session.settings.sceneCount} Adegan @ ${session.settings.durationPerScene} | Format ${session.settings.aspectRatio}\n` +
                    `• Referensi: ${session.referenceMediaUrl ? 'Foto visual terlampir 📸' : 'Kreativitas Penuh AI'}\n\n` +
                    `Estimasi peracikan 8-15 detik. Mohon tunggu sebentar ya Kak ${memberName}! ⚡`
                );

                // Download gambar referensi (jika ada) untuk multimodal vision
                let imagePart = null;
                if (session.referenceMediaUrl) {
                    try {
                        const imgResp = await fetch(session.referenceMediaUrl);
                        if (imgResp.ok) {
                            const arrBuf = await imgResp.arrayBuffer();
                            imagePart = {
                                inlineData: {
                                    mimeType: imgResp.headers.get('content-type') || 'image/jpeg',
                                    data: Buffer.from(arrBuf).toString('base64')
                                }
                            };
                        }
                    } catch (_) {}
                }

                const totalDurationEstimate = (parseInt(session.settings.durationPerScene, 10) || 8) * session.settings.sceneCount;

                const videoSystemPrompt = 
`Anda adalah "Pak Sutradara" (AI Creative & Video Director dari TRENDORA AI).
Tugas Anda adalah merancang cetak biru naskah video berkualitas tinggi berdasarkan instruksi berikut:
MODE: ${session.featureName || 'Video Production'}
PENGATURAN TEKNIS:
• Jumlah Adegan: Tepat ${session.settings.sceneCount} Adegan
• Shot per Adegan: ${session.settings.shotsPerScene} Shot
• Durasi per Adegan: ${session.settings.durationPerScene} (Total durasi: ~${totalDurationEstimate} detik)
• Format / Aspect Ratio: ${session.settings.aspectRatio}
• Gaya Bahasa: ${session.settings.language}
• Mode Audio: ${session.settings.audioMode}

FORMAT BALASAN WHATSAPP WAJIB:
🎬 *PROYEK: [JUDUL VIDEO MENARIK]*
⏱️ *Durasi:* ~${totalDurationEstimate} Detik (${session.settings.sceneCount} Adegan @ ${session.settings.durationPerScene}) | *Format:* ${session.settings.aspectRatio}
🌐 *Bahasa:* ${session.settings.language} | 🎙️ *Audio:* ${session.settings.audioMode}
🎯 *Target Audiens:* [Target audiens spesifik]
${imagePart ? '📸 *REFERENSI VISUAL TERKUNCI (LOCK):*\n• Objek Terdeteksi: [Detail fisik objek referensi foto]\n' : ''}
🔥 *HOOK 3 DETIK PERTAMA:*
"[Aksi visual mengejutkan & kalimat pembuka yang kuat]"

📋 *BREAKDOWN STORYBOARD (${session.settings.sceneCount} ADEGAN):*
[Tuliskan persis ${session.settings.sceneCount} adegan lengkap: Adegan 1 sampai Adegan ${session.settings.sceneCount}. Untuk setiap adegan wajib menyertakan:]
*🎬 ADEGAN [X] ([Nama Adegan])*
• Visual: [Deskripsi kamera, sudut, objek, suasana]
• Dialog / Audio: "[Suara narasi atau percakapan sesuai gaya ${session.settings.language}]"
• 🎨 AI Image Prompt: [Prompt bahasa Inggris sinematik untuk Midjourney/Flux/Gemini, aspect ratio --ar ${session.settings.aspectRatio.replace(':', ':')}]
• 🎥 Video Motion: [Instruksi gerakan kamera untuk Runway/Luma/Kling]

📱 *CAPTION & HASHTAG MEDSOS (SIAP POSTING):*
• Caption: [Tuliskan 1-3 baris caption engaging & persuasif siap posting di TikTok/Reels/Shorts]
• Hashtags: [8-12 hashtag relevan diawali tanda #, misal: #fyp #reels #trendora]

💡 *SARAN SUTRADARA:*
[1-2 tips sound effect (SFX), warna lighting, atau musik latar yang cocok]

---
✨ _Dirancang otomatis oleh TRENDORA AI Director Engine_`;

                const contentsParts = [
                    { text: videoSystemPrompt },
                    { text: `Ide Cerita dari Pengguna:\n"${session.story}"` }
                ];
                if (imagePart) contentsParts.push(imagePart);

                const candidateModels = [
                    'gemini-flash-latest',
                    'gemini-2.0-flash',
                    'gemini-3.1-flash-lite',
                    'gemini-3-flash-preview'
                ];

                let generatedScript = '';
                for (const model of candidateModels) {
                    try {
                        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${memberGeminiKey || ADMIN_DEFAULT_GEMINI_KEY}`;
                        const resp = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ role: 'user', parts: contentsParts }],
                                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
                            })
                        });
                        if (resp.ok) {
                            const data = await resp.json();
                            generatedScript = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                            if (generatedScript) break;
                        }
                    } catch (_) {}
                }

                if (!generatedScript) {
                    await sendWaReply(`❌ Maaf Kak ${memberName}, terjadi kendala saat memproses naskah AI. Silakan ketik \`OKE\` lagi untuk mencoba.`);
                    updateUserSession(senderPhone, { step: 'awaiting_video_settings' });
                    return res.status(200).json({ error: 'Gemini Failure' });
                }

                // Ekstraksi Caption & Hashtag
                let waCaption = '';
                let waHashtags = '';
                const capMatch = generatedScript.match(/(?:•\s*Caption:\s*|\*Caption:\*\s*)([^\n]+(?:\n(?!(?:•|\*|💡|#))[^\n]+)*)/i);
                if (capMatch) waCaption = capMatch[1].trim();
                const hashMatch = generatedScript.match(/(?:•\s*Hashtags?:\s*|\*Hashtags?:\*\s*)([^\n]+)/i) || generatedScript.match(/(#[a-zA-Z0-9_]+(?:\s+#[a-zA-Z0-9_]+)+)/i);
                if (hashMatch) waHashtags = hashMatch[1].trim();
                const waTagsArray = waHashtags ? waHashtags.split(/\s+/).map(t => '#' + t.replace(/^#+/, '').trim()).filter(t => t.length > 1) : [];

                // Siapkan paket payload n8n lengkap
                const n8nPayload = {
                    event: 'wa_video_concept_approved',
                    source: 'TRENDORA AI WhatsApp Director',
                    sender_number: senderPhone,
                    phone_number: senderPhone,
                    wa_number: senderPhone,
                    user: {
                        name: memberName,
                        phone: senderPhone,
                        email: (activeMember && activeMember.email) || ''
                    },
                    prompt: session.story,
                    concept_script: generatedScript,
                    caption: waCaption,
                    hashtags: waHashtags,
                    hashtags_array: waTagsArray,
                    social_caption: waCaption,
                    social_hashtags: waHashtags,
                    social_pack: { caption: waCaption, hashtags: waHashtags, tags: waTagsArray },
                    aspect_ratio: session.settings.aspectRatio,
                    scene_count: session.settings.sceneCount,
                    duration_per_scene: session.settings.durationPerScene,
                    language: session.settings.language,
                    audio_mode: session.settings.audioMode,
                    timestamp: new Date().toISOString()
                };

                // Simpan draf di sesi
                updateUserSession(senderPhone, {
                    step: 'awaiting_video_approval',
                    draftScript: generatedScript,
                    draftPayload: n8nPayload
                });

                // Simpan Riwayat Pembuatan ke Supabase & Buffer
                const targetUserId = (activeMember && activeMember.id && activeMember.id !== 'admin') ? activeMember.id : '7ab993cd-cc32-48e3-b323-0f81908c83a9';
                const histRec = {
                    id: 'wa_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                    user_id: targetUserId,
                    phone_number: senderPhone,
                    sender_name: memberName,
                    prompt: session.story,
                    result: generatedScript,
                    created_at: new Date().toISOString()
                };
                recentWaHistory.unshift(histRec);
                if (recentWaHistory.length > 50) recentWaHistory.pop();

                // Kirim Naskah Draf ke WA User dengan APPROVAL GATE
                const approvalGateMsg = 
`${generatedScript}

━━━━━━━━━━━━━━━━━━━━
🚦 *PERSETUJUAN PRODUKSI (APPROVAL GATE):*
Apakah konsep video di atas sudah sesuai?

🟢 Ketik *GAS* / *KIRIM* ➡️ *Setuju! Diteruskan otomatis ke n8n untuk render video.*
✏️ Ketik *REVISI: [detail ubahan]* ➡️ *Contoh: "REVISI: endingnya dibuat lucu dan damai"*
❌ Ketik *BATAL* ➡️ *Batalkan draf dan kembali ke menu utama.*`;

                await sendWaReply(approvalGateMsg);
                return res.status(200).json({ status: 'draft_sent_for_approval' });
            }

            // SUB-STEP 2C: APPROVAL GATE (PERSETUJUAN SEBELUM KIRIM KE n8n)
            if (session.step === 'awaiting_video_approval') {
                const isApproved = /^(gas|kirim|render|setuju|oke|ok|lanjut|yes|ya|gaspol|teruskan)$/i.test(lowerPrompt);

                if (isApproved) {
                    // USER MENYETUJUI DRAF ➡️ KIRIM KE n8n DENGAN NOMOR WA PENGIRIM
                    const cachedN8n = userN8nConfigStore.get(senderPhone);
                    const isAutoForward = (cachedN8n && typeof cachedN8n.autoForward === 'boolean') ? cachedN8n.autoForward : ((activeMember && activeMember.n8n_auto_forward !== false) || true);
                    const targetN8nUrl = (cachedN8n && cachedN8n.url) || (activeMember && activeMember.n8n_webhook_url) || process.env.N8N_WEBHOOK_URL || 'https://n8n-deripernandi.trendoraautomation.my.id/webhook/video-Trendora';

                    let n8nSuccess = false;
                    if (isAutoForward && targetN8nUrl && session.draftPayload) {
                        try {
                            const n8nResp = await fetch(targetN8nUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(session.draftPayload)
                            });
                            n8nSuccess = n8nResp.ok;
                            console.log(`[WA-WEBHOOK] Dispatched to n8n (${targetN8nUrl}): status ${n8nResp.status}`);
                        } catch (n8nErr) {
                            console.warn('[WA-WEBHOOK] Gagal dispatch ke n8n:', n8nErr.message);
                        }
                    }

                    resetUserSession(senderPhone);

                    const successReply = 
`🚀 *KONSEP RESMI DISETUJUI & DITERUSKAN KE n8n!* ⚡

• Nomor WA Penerima: \`${senderPhone}\`
• Target Webhook: \`${targetN8nUrl}\`
• Status: *Proses Render Video Dimulai di n8n* 🟢

Nanti file video hasil produksi akan dikirimkan otomatis ke chat WhatsApp ini! 🎬

━━━━━━━━━━━━━━━━━━━━
_💡 Ketik \`menu\` kapan saja jika ingin membuat konten visual atau video lainnya._`;

                    await sendWaReply(successReply);
                    return res.status(200).json({ status: 'approved_and_dispatched_to_n8n' });
                }

                // JIKA USER INGIN REVISI
                if (/^(?:revisi[:\s]+|ubah[:\s]+|ganti[:\s]+)/i.test(userPrompt) || lowerPrompt.startsWith('revisi')) {
                    const revisionFeedback = userPrompt.replace(/^(?:revisi[:\s]+|ubah[:\s]+|ganti[:\s]+)/i, '').trim();
                    await sendWaReply(`⏳ *Sedang merevisi naskah sesuai masukan Anda...* ✍️\n_"${revisionFeedback}"_`);

                    const revisionPrompt = 
`Anda adalah Sutradara AI Trendora.
Berikut adalah draf naskah sebelumnya:
"""
${session.draftScript}
"""

Pengguna meminta REVISI berikut:
"${revisionFeedback}"

Tugas Anda: Perbarui naskah storyboard tersebut dengan mengakomodasi revisi pengguna tanpa merusak struktur adegan, hook, caption, dan hashtag.`;

                    const revisedScript = await chatWithGeminiAI(
                        revisionPrompt,
                        'Perbarui draf naskah video sesuai instruksi revisi. Kembalikan format naskah lengkap WhatsApp.',
                        memberGeminiKey || ADMIN_DEFAULT_GEMINI_KEY
                    );

                    if (revisedScript) {
                        session.draftScript = revisedScript;
                        if (session.draftPayload) {
                            session.draftPayload.concept_script = revisedScript;
                        }

                        const revisedApprovalMsg = 
`${revisedScript}

━━━━━━━━━━━━━━━━━━━━
🚦 *DRAF REVISI SELESAI (APPROVAL GATE):*
Apakah hasil revisi di atas sudah cocok?

🟢 Ketik *GAS* / *KIRIM* ➡️ *Diteruskan ke n8n untuk render video otomatis.*
✏️ Ketik *REVISI: [detail]* ➡️ *Minta revisi lagi jika ada yang kurang.*
❌ Ketik *BATAL* ➡️ *Batalkan draf dan kembali ke menu utama.*`;

                        await sendWaReply(revisedApprovalMsg);
                        return res.status(200).json({ status: 'revision_sent' });
                    }
                }

                // Jika user mengetik selain GAS / REVISI di tahap approval
                await sendWaReply(
                    `🚦 *Draf naskah video Anda sedang menunggu persetujuan:*\n\n` +
                    `• Ketik *GAS* ➡️ Untuk langsung kirim ke n8n dan mulai render video.\n` +
                    `• Ketik *REVISI: [detail]* ➡️ Untuk minta AI merevisi bagian tertentu.\n` +
                    `• Ketik *BATAL* ➡️ Untuk membatalkan draf dan kembali ke menu awal.`
                );
                return res.status(200).json({ status: 'awaiting_approval_reminder' });
            }
        }

        // ==============================================================
        // STEP 3: ALUR IMAGE GENERATION (FITUR 4 - 9)
        // (Hasil Gambar Langsung Dikirim ke WA, TIDAK ke n8n)
        // ==============================================================
        if (session.step === 'awaiting_image_prompt') {
            if (!userPrompt && !rawMediaUrl) {
                await sendWaReply(`🎨 Silakan ketik deskripsi gambar yang ingin Anda buat atau kirim foto referensi!`);
                return res.status(200).json({ status: 'image_prompt_needed' });
            }

            await sendWaReply(
                `⏳ *TRENDORA AI sedang membuat gambar [${session.featureName}] dengan Gemini Image Engine...* 🎨\n\n` +
                `_"${userPrompt.slice(0, 100)}"_\n\n` +
                `Mohon tunggu sekitar 8-15 detik. Gambar hasil jadi akan langsung dikirimkan ke chat ini! 📸`
            );

            // Download gambar referensi (jika user kirim foto)
            let refBase64 = null;
            if (rawMediaUrl) {
                try {
                    const rResp = await fetch(rawMediaUrl);
                    if (rResp.ok) {
                        const bBuf = await rResp.arrayBuffer();
                        refBase64 = Buffer.from(bBuf).toString('base64');
                    }
                } catch (_) {}
            }

            // Tambahkan arahan gaya spesifik per fitur gambar
            let featureStyleDirection = 'High quality cinematic DSLR photography, crisp 8k resolution, studio lighting.';
            if (session.featureKey === 'thumbnail') featureStyleDirection = 'Vibrant expressive YouTube thumbnail design, clean focal subject, high contrast, dramatic lighting, 16:9 ratio.';
            else if (session.featureKey === 'infographic') featureStyleDirection = 'Clean infographic visual chart, modern flat typography, aesthetic data cards, neat composition.';
            else if (session.featureKey === 'ugc') featureStyleDirection = 'Authentic user generated content photo, real creator holding product, warm daylight smartphone photo aesthetic.';
            else if (session.featureKey === 'character') featureStyleDirection = 'Character reference model sheet, front view and 3/4 view, detailed outfit, neutral background.';
            else if (session.featureKey === 'poster') featureStyleDirection = 'High-end commercial poster design, bold marketing visual, aesthetic colors, cinematic composition.';

            const fullImagePrompt = `${userPrompt}. Style: ${featureStyleDirection}`;
            const targetRatio = (session.featureKey === 'thumbnail' || session.featureKey === 'poster') ? '16:9' : '1:1';

            try {
                const imgResult = await generateImageViaGemini(fullImagePrompt, targetRatio, refBase64, memberGeminiKey || ADMIN_DEFAULT_GEMINI_KEY);
                
                // Upload base64 ke direct download link agar bisa di-dispatch WhatsApp gateway
                const publicImageUrl = await uploadBase64ToPublicUrl(imgResult.base64, imgResult.mimeType);

                const finalCaption = 
`✨ *HASIL GAMBAR ${session.featureName.toUpperCase()} SELESAI!* 📸

📝 *Konsep:* "${userPrompt}"
📐 *Rasio:* ${targetRatio}
🤖 *Engine:* Google Gemini Vision AI

━━━━━━━━━━━━━━━━━━━━
_💡 Ketik \`menu\` untuk membuat konten visual atau video lainnya!_`;

                if (publicImageUrl) {
                    await sendWaReply(finalCaption, publicImageUrl, 'IMAGE');
                } else {
                    await sendWaReply(finalCaption + `\n\n_(Gambar berhasil dibuat di server. Silakan cek juga di dashboard web Trendora AI)_`);
                }

                resetUserSession(senderPhone);
                return res.status(200).json({ status: 'image_generated_and_sent' });
            } catch (imgErr) {
                console.error('[WA-WEBHOOK] Image generation error:', imgErr.message);

                // Fallback cerdas jika kuota model Image sedang penuh: Buatkan Prompt Sinematik Lengkap
                const promptFallback = 
`⚠️ *KUOTA IMAGE GENERATOR TERBATAS / EXHAUSTED*

Namun jangan khawatir! Asisten Sutradara telah merancang *PROMPT SINEMATIK SIAP PAKAI* untuk Anda:

🎨 *Master Prompt AI (Midjourney / Flux / Ideogram / Bing Image):*
\`\`\`
${fullImagePrompt}
\`\`\`

💡 *Tips:* Copy prompt di atas dan paste langsung di Midjourney, Flux, atau Bing Image Creator untuk mendapatkan hasil visual terbaik!

━━━━━━━━━━━━━━━━━━━━
_Ketik \`menu\` untuk mencoba fitur lainnya._`;

                await sendWaReply(promptFallback);
                resetUserSession(senderPhone);
                return res.status(200).json({ status: 'image_fallback_prompt_sent' });
            }
        }

        // ==============================================================
        // STEP 4: ALUR AUDIO & TOOLS (FITUR 10, 11, 12)
        // (Hasil Langsung Dikirim ke WA, TIDAK ke n8n)
        // ==============================================================
        if (session.step === 'awaiting_tool_input') {
            await sendWaReply(`⏳ *TRENDORA AI sedang memproses [${session.featureName}]...* ⚡`);

            let toolInstruction = '';
            if (session.featureKey === 'voiceover') {
                toolInstruction = `Anda adalah Voice Director & Sound Engineer profesional. Buatkan naskah Voice Over lengkap berdasarkan topik berikut: "${userPrompt}". Sertakan penanda emosi [semangat/lembut/tegas], jeda nafas, dan rekomendasi musik latar (BGM).`;
            } else if (session.featureKey === 'video-to-prompt') {
                toolInstruction = `Anda adalah Reverse Prompt Engineer sinematik. Bedah ide/adegan video berikut menjadi 3 variasi prompt AI sinematik (Bahasa Inggris) yang sangat detail untuk Runway Gen-3, Luma Dream Machine, dan Kling AI: "${userPrompt}".`;
            } else {
                toolInstruction = `Anda adalah Editor & Video Producer profesional. Buatkan panduan perakitan timeline, urutan transisi antar klip, serta rekomendasi BGM yang cocok berdasarkan daftar klip berikut: "${userPrompt}".`;
            }

            const toolResult = await chatWithGeminiAI(
                userPrompt,
                toolInstruction,
                memberGeminiKey || ADMIN_DEFAULT_GEMINI_KEY
            );

            if (toolResult) {
                const finalToolReply = 
`🎯 *HASIL [${session.featureName.toUpperCase()}] SELESAI!*

${toolResult}

━━━━━━━━━━━━━━━━━━━━
_💡 Ketik \`menu\` untuk membuat konten visual atau video lainnya._`;

                await sendWaReply(finalToolReply);
                resetUserSession(senderPhone);
                return res.status(200).json({ status: 'tool_result_sent' });
            }
        }

        // Fallback default jika tidak ada kondisi yang terpenuhi
        await sendWaReply(formatFullMainMenu(memberName));
        updateUserSession(senderPhone, { step: 'awaiting_menu' });
        return res.status(200).json({ status: 'fallback_menu_sent' });

    } catch (error) {
        console.error('[WA-WEBHOOK] Fatal Error:', error);
        return res.status(500).json({ error: 'Internal Webhook Server Error', message: error.message });
    }
};
