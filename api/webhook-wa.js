/**
 * TRENDORA AI - WHATSAPP WEBHOOK HANDLER (Vercel Serverless Function)
 * Terhubung dengan Trendora WA Gateway & Database Supabase
 * 
 * Fitur:
 * 1. Verifikasi Member Terdaftar di Supabase (SaaS Mode)
 *    - Admin (082375958716 / ADMIN_PHONE) otomatis aktif
 *    - Member yang nomor WA-nya terdaftar & status active di Supabase bisa langsung pakai
 *    - Jika belum terdaftar, bot membalas untuk hubungi Admin (082375958716)
 * 2. Generate Naskah & Konsep Video Lengkap via Gemini AI
 * 3. Kirim Hasil ke WhatsApp Pengirim via API Dispatch Trendora WA Gateway
 * 4. Simpan Riwayat Pembuatan ke Supabase
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

// Helper deteksi pilihan jenis storyboard (Iklan, Konten Kreatif, Animasi)
function detectStoryboardMode(text) {
    const raw = String(text || '').trim();
    const lower = raw.toLowerCase();

    // 1. Awalan Eksplisit (Prefix / Nomor)
    // Mode 1: Video Iklan (Commercial)
    if (/^(iklan|ads|commercial|jual|promo)[:\.\s]/i.test(raw) || /^1[:\.\s]/.test(raw)) {
        const clean = raw.replace(/^(iklan|ads|commercial|jual|promo|1)[:\.\s]*/i, '').trim();
        return {
            mode: 'commercial',
            name: 'Video Iklan & Promosi',
            badge: '📢 *[MODE: VIDEO IKLAN & PROMOSI]*',
            prompt: clean || raw
        };
    }

    // Mode 2: Video Animasi (Animation)
    if (/^(animasi|anime|animation|kartun|3d|pixar)[:\.\s]/i.test(raw) || /^3[:\.\s]/.test(raw)) {
        const clean = raw.replace(/^(animasi|anime|animation|kartun|3d|pixar|3)[:\.\s]*/i, '').trim();
        return {
            mode: 'animation',
            name: 'Video Animasi & Fantasi',
            badge: '✨ *[MODE: VIDEO ANIMASI & FANTASI]*',
            prompt: clean || raw
        };
    }

    // Mode 3: Konten Kreatif (Storytelling, Drama, Komedi, POV)
    if (/^(kreatif|cerita|drama|creative|story|konten|film|narasi)[:\.\s]/i.test(raw) || /^2[:\.\s]/.test(raw)) {
        const clean = raw.replace(/^(kreatif|cerita|drama|creative|story|konten|film|narasi|2)[:\.\s]*/i, '').trim();
        return {
            mode: 'drama',
            name: 'Konten Kreatif & Storytelling',
            badge: '🎭 *[MODE: KONTEN KREATIF & STORYTELLING]*',
            prompt: clean || raw
        };
    }

    // 2. Deteksi Cerdas Berdasarkan Kata Kunci (Jika Tanpa Awalan)
    if (/\b(jual|promo|diskon|harga|produk|order|beli|brand|toko|shopee|tokopedia|khasiat|manfaat|skincare|serum|fashion|boba|kopi)\b/i.test(lower)) {
        return {
            mode: 'commercial',
            name: 'Video Iklan & Promosi',
            badge: '📢 *[MODE: VIDEO IKLAN & PROMOSI]*',
            prompt: raw
        };
    }

    if (/\b(kartun|animasi|anime|pixar|disney|3d cartoon|hewan bicara|monster|robot kecil|planet alien|sihir|fantasi)\b/i.test(lower)) {
        return {
            mode: 'animation',
            name: 'Video Animasi & Fantasi',
            badge: '✨ *[MODE: VIDEO ANIMASI & FANTASI]*',
            prompt: raw
        };
    }

    // Default: Konten Kreatif
    return {
        mode: 'drama',
        name: 'Konten Kreatif & Storytelling',
        badge: '🎭 *[MODE: KONTEN KREATIF & STORYTELLING]*',
        prompt: raw
    };
}

// In-Memory User Storyboard Settings Cache (per sender phone)
const userSettingsStore = new Map();
// In-Memory User API Key Cache (per sender phone)
const userApiKeyStore = new Map();

function getUserSettings(phone) {
    const key = normalizePhone(phone);
    if (!userSettingsStore.has(key)) {
        userSettingsStore.set(key, {
            sceneCount: 2,
            shotsPerScene: 4,
            durationPerScene: '10s',
            aspectRatio: '9:16',
            audioMode: 'Auto Director (Kontekstual)',
            language: 'Bahasa Indonesia (Gen Z)'
        });
    }
    return Object.assign({}, userSettingsStore.get(key));
}

function updateUserSettings(phone, updates) {
    const key = normalizePhone(phone);
    const curr = getUserSettings(key);
    const updated = Object.assign(curr, updates);
    userSettingsStore.set(key, updated);
    return updated;
}

function formatSettingsMessage(settings, memberName = 'Kak') {
    const ratioLabel = settings.aspectRatio === '9:16' 
        ? '9:16 [Vertikal Reels / TikTok / Shorts]' 
        : settings.aspectRatio === '16:9' 
            ? '16:9 [Landscape YouTube / TV]' 
            : '1:1 [Square Feed Instagram]';

    return `⚙️ *TRENDORA AI - STORYBOARD SETTINGS* ⚙️
_Halo Kak ${memberName}! Pengaturan Storyboard aktif Anda saat ini:_

🎬 *Jumlah Adegan:* ${settings.sceneCount} Adegan (Pilihan: 1 - 6)
🎞️ *Shot per Adegan:* ${settings.shotsPerScene} Shot (Pilihan: 1 - 6)
⏱️ *Durasi per Adegan:* ${settings.durationPerScene} (Pilihan: 5s, 8s, 10s, 15s, 30s)
📐 *Aspect Ratio:* ${ratioLabel}
🎙️ *Mode Audio:* ${settings.audioMode}
🌐 *Bahasa Naskah:* ${settings.language}

━━━━━━━━━━━━━━━━━━━━
📝 *CARA MENGUBAH PENGATURAN:*
• \`set adegan 3\` ➡️ Ubah jumlah adegan (1 - 6)
• \`set durasi 15s\` ➡️ Ubah durasi adegan (5s, 8s, 10s, 15s, 30s)
• \`set ratio 16:9\` ➡️ Format landscape YouTube (9:16 / 16:9 / 1:1)
• \`set shot 5\` ➡️ Ubah shot per adegan
• \`set bahasa formal\` ➡️ Ubah bahasa (formal / gen z / inggris / jawa / sunda)
• \`set voice dialog\` ➡️ Ubah mode suara (dialog / narasi / auto)

💡 *Tips Cepat:*
Anda juga bisa langsung mengetik setting saat kirim ide, contoh:
\`iklan: Kopi aren botolan, 3 adegan, durasi 15s, ratio 16:9, bahasa formal\`

📸 *Kirim Foto Referensi:*
Kirim foto produk / karakter / lokasi langsung dengan caption di atas! 🚀`;
}

function parseStoryboardSettings(text, baseSettings) {
    const raw = String(text || '');
    const lower = raw.toLowerCase();
    const settings = Object.assign({}, baseSettings);

    // 1. Adegan (1 - 6)
    const sceneMatch = raw.match(/(?:--adegan[=:\s]+|adegan[:\s]+|\b)([1-6])\s*(?:adegan|scene|scenes)?/i);
    if (sceneMatch) {
        const num = parseInt(sceneMatch[1], 10);
        if (num >= 1 && num <= 6) settings.sceneCount = num;
    }

    // 2. Shot per Adegan (1 - 6)
    const shotMatch = raw.match(/(?:--shot[=:\s]+|shot[:\s]+|\b)([1-6])\s*(?:shot|shots)/i);
    if (shotMatch) {
        const num = parseInt(shotMatch[1], 10);
        if (num >= 1 && num <= 6) settings.shotsPerScene = num;
    }

    // 3. Durasi per Adegan (5s, 8s, 10s, 15s, 30s)
    const durMatch = raw.match(/(?:--durasi[=:\s]+|durasi[:\s]+|\b)(5|8|10|15|30)\s*(?:s|detik|sec|second)/i);
    if (durMatch) {
        settings.durationPerScene = `${durMatch[1]}s`;
    }

    // 4. Aspect Ratio (9:16, 16:9, 1:1)
    if (/\b(16:9|landscape|horizontal|youtube)\b/i.test(lower)) {
        settings.aspectRatio = '16:9';
    } else if (/\b(1:1|square|kotak|feed)\b/i.test(lower)) {
        settings.aspectRatio = '1:1';
    } else if (/\b(9:16|vertikal|vertical|reels|tiktok|shorts)\b/i.test(lower)) {
        settings.aspectRatio = '9:16';
    }

    // 5. Bahasa Konten
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

    // 6. Mode Audio
    if (/\b(dialog|percakapan)\b/i.test(lower) && !/\b(tanpa dialog)\b/i.test(lower)) {
        settings.audioMode = 'Percakapan Dialog Tokoh';
    } else if (/\b(voiceover|narasi|voice over|vo)\b/i.test(lower)) {
        settings.audioMode = 'Voiceover Narasi Penuh';
    } else if (/\b(tanpa suara|no voice|instrumental|musik saja)\b/i.test(lower)) {
        settings.audioMode = 'Sound FX & BGM Only';
    }

    return settings;
}

module.exports = async function handler(req, res) {
    // 1. Health check & Method Guard
    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'online',
            service: 'Trendora AI WhatsApp Member Engine',
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

        // Ambil nomor pengirim riil & normalisasi
        const rawPhone = (
            sender_number || 
            phone_number || 
            body.from || 
            body.sender || 
            body.phone || 
            body.senderPhone || 
            ''
        ).replace(/[^0-9]/g, '');
        const senderPhone = normalizePhone(rawPhone);

        // Ambil session key dengan fallback ke session WhatsApp aktif milik Deri (Slot 19)
        let activeSessionKey = String(
            session_key || 
            body.session_id || 
            body.sessionId || 
            body.session || 
            process.env.TRENDORA_WA_SESSION || 
            '3_dev_57824_1788062608'
        );
        if (activeSessionKey === '1' || activeSessionKey === 'undefined' || !activeSessionKey) {
            activeSessionKey = '3_dev_57824_1788062608';
        }

        // Ekstraksi Media Referensi (Foto Produk, Karakter, Lokasi)
        const rawMediaUrl = (media_url || body.file_url || body.url || '').trim();
        const rawMediaType = (media_type || body.type || '').toUpperCase();
        const rawCaption = (caption || '').trim();

        // Normalisasi teks prompt (jika user kirim foto dengan caption)
        let userPrompt = (message || rawCaption || '').trim();
        if (userPrompt === '[IMAGE]' || userPrompt === '[MEDIA]') {
            userPrompt = rawCaption;
        }

        console.log(`[WA-WEBHOOK] Pesan masuk dari ${senderPhone} (${sender_name}): "${userPrompt.slice(0, 50)}..." | Media: ${rawMediaUrl || 'None'}`);

        // Abaikan jika tidak ada nomor pengirim atau pesan dari grup
        if (!senderPhone) {
            return res.status(200).json({ status: 'ignored', reason: 'Empty phone' });
        }

        if (is_group) {
            return res.status(200).json({ status: 'ignored', reason: 'Group messages disabled' });
        }

        // Konfigurasi Gateway & Supabase
        const waGatewayUrl = process.env.TRENDORA_WA_URL || 'https://whatsappapi.trendoraautomation.my.id/api/dispatch';
        const waBearerToken = process.env.TRENDORA_WA_TOKEN || 'TRD-LIVE-65D2D12CB1D262A227D95D417846DEF2';
        const supabaseUrl = process.env.SUPABASE_URL || 'https://inixcxbvfyvmuuzlkljq.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_ozGrENkmrJH48KSWov2BIw_2f13d_qH';
        const ADMIN_DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || Buffer.from('QVEuQWI4Uk42S2RXUWNJZkw1WDNTV1dqbVdWRWhWcEMtRG9BMXE0RnlhNmN6Nk9LWkg3c2c=', 'base64').toString('utf-8');

        // Helper fungsi kirim pesan balik ke WhatsApp
        const sendWaReply = async (replyText, mediaUrl = null, mediaType = null) => {
            if (!waBearerToken) {
                console.warn('[WA-WEBHOOK] TRENDORA_WA_TOKEN belum diatur di Vercel Environment.');
                return false;
            }
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
                const result = await resp.json().catch(() => ({}));
                if (!resp.ok || result.success === false) {
                    console.error(`[WA-WEBHOOK] Gagal kirim balasan ke WA (${resp.status}):`, result);
                } else {
                    console.log(`[WA-WEBHOOK] Balasan terkirim ke ${senderPhone}:`, result.response_body || 'OK');
                }
                return resp.ok && result.success !== false;
            } catch (err) {
                console.error('[WA-WEBHOOK] Gagal kirim balasan ke WA:', err.message);
                return false;
            }
        };

        // 2. VERIFIKASI MEMBER / ADMIN (SaaS Security Gate via Supabase)
        let activeMember = null;
        try {
            const localZeroPhone = senderPhone.startsWith('62') ? '0' + senderPhone.slice(2) : senderPhone;
            const queryUrl = `${supabaseUrl}/rest/v1/profiles?or=(phone.eq.${senderPhone},phone.eq.${localZeroPhone})&status=eq.active&select=*&limit=1`;
            
            const sbResp = await fetch(queryUrl, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                }
            });

            if (sbResp.ok) {
                const profiles = await sbResp.json();
                if (Array.isArray(profiles) && profiles.length > 0) {
                    activeMember = profiles[0];
                    console.log(`[WA-WEBHOOK] Member terverifikasi di Supabase: ${activeMember.full_name} (${activeMember.id})`);
                }
            }
        } catch (errDb) {
            console.warn('[WA-WEBHOOK] Pengecekan Supabase error:', errDb.message);
        }

        // Fallback untuk Admin Utama jika belum terdaftar di profiles Supabase (Deri Pernandi)
        const ADMIN_DEFAULT_PHONES = ['6282375958716', '6282374401480'];
        const envAdminPhones = (process.env.ADMIN_PHONE || '')
            .split(',')
            .map(p => normalizePhone(p))
            .filter(Boolean);
        const adminPhoneList = [...new Set([...ADMIN_DEFAULT_PHONES, ...envAdminPhones])];
        const isAdmin = adminPhoneList.includes(senderPhone) || (activeMember && activeMember.role === 'admin');

        if (!activeMember && isAdmin) {
            console.log(`[WA-WEBHOOK] Pengirim ${senderPhone} adalah ADMIN (Fallback bypass).`);
            activeMember = { 
                id: 'admin', 
                full_name: 'Deri Pernandi (Admin)', 
                role: 'admin', 
                status: 'active',
                gemini_api_key: process.env.GEMINI_API_KEY || ADMIN_DEFAULT_GEMINI_KEY
            };
        }

        // JIKA NOMOR BUKAN MEMBER TERDAFTAR / CHAT DARI ORANG LUAR:
        // Sesuai aturan: ABAIKAN TOTAL (Silent Ignore), JANGAN balas apa pun agar tidak mengganggu chat bisnis/pribadi.
        if (!activeMember) {
            console.log(`[WA-WEBHOOK] Mengabaikan chat dari ${senderPhone} (Bukan pemilik nomor terdaftar / pesan orang luar). Bot diam.`);
            return res.status(200).json({ status: 'ignored_non_member' });
        }

        // Jika user hanya mengirim foto referensi tanpa caption/teks ide
        if (rawMediaUrl && !userPrompt) {
            await sendWaReply(
                `📸 *FOTO REFERENSI VISUAL BERHASIL DITERIMA!* 🎬\n\n` +
                `Foto referensi Anda sudah masuk ke sistem AI Sutradara.\n` +
                `Sekarang silakan balas chat ini dengan ide video yang ingin dibuat:\n\n` +
                `👉 *Contoh:* \`iklan: Promosikan produk di foto ini, diskon 30%\`\n` +
                `👉 *Contoh:* \`karakter: Pria di foto ini jadi agen rahasia beraksi di atap gedung\`\n` +
                `👉 *Contoh:* \`lokasi: Suasana cafe aesthetic di foto ini, durasi 15s\`\n\n` +
                `_💡 Tips: Anda juga bisa langsung mengetik ide di Caption saat mengirim foto!_`
            );
            return res.status(200).json({ status: 'image_received_prompt_needed' });
        }

        // Jika tidak ada prompt teks sama sekali
        if (!userPrompt) {
            return res.status(200).json({ status: 'ignored', reason: 'Empty prompt' });
        }

        // 3. Command Bantuan / Menu (Untuk Member Terdaftar)
        const lowerPrompt = userPrompt.toLowerCase().trim();
        if (['menu', 'help', 'bantuan', 'start', 'halo', 'hi', 'hai', 'p', 'ping', 'test', 'mode', 'pilih', 'storyboard'].includes(lowerPrompt)) {
            const memberName = activeMember.full_name || 'Member';
            const menuText = 
`🎬 *TRENDORA AI - DIRECTOR ENGINE* 🎬
_Halo Kak ${memberName}! Asisten Sutradara AI siap memproduksi Storyboard:_

📌 *PILIH JENIS STORYBOARD:*
1️⃣ *Video Iklan* (\`iklan\`)
   🎯 _Fokus jualan produk/jasa, penahan scroll, demo solusi, & CTA beli._
   👉 *Cara:* \`iklan: [ide produk/jasa Anda]\`

2️⃣ *Konten Kreatif* (\`kreatif\` atau \`cerita\`)
   🎭 _Fokus storytelling, drama, komedi, horor, POV, & video edukasi viral._
   👉 *Cara:* \`kreatif: [ide cerita Anda]\`

3️⃣ *Video Animasi* (\`animasi\`)
   ✨ _Fokus dunia fantasi, karakter 3D kartun/anime unik, & aksi imajinatif._
   👉 *Cara:* \`animasi: [ide animasi Anda]\`

📸 *FOTO REFERENSI VISUAL (PRODUK / KARAKTER / LOKASI):*
Kirim foto produk, karakter/model, atau foto lokasi langsung di WhatsApp ini dengan Caption ide video Anda! AI akan memindai objek foto dan mengunci detailnya di setiap adegan!

⚙️ *PENGATURAN STORYBOARD:*
Ketik \`setting\` untuk cek/ubah jumlah adegan (1-6), durasi (5s-30s), aspect ratio (9:16 / 16:9 / 1:1), bahasa, dan mode audio.

🔑 *PASANG / GANTI GEMINI API KEY:*
Ketik: \`set key [API_KEY_ANDA]\` untuk mengaktifkan AI langsung dari WhatsApp.

⚡ *Integrasi n8n:*
• \`n8n on\` : Aktifkan otomatis kirim hasil video ke n8n
• \`n8n off\` : Matikan otomatis kirim ke n8n
• \`n8n status\` : Cek status integrasi n8n

Silakan kirimkan ide video atau foto referensi Anda sekarang! 🚀`;

            await sendWaReply(menuText);
            return res.status(200).json({ status: 'menu_sent' });
        }

        // 3e. Perintah Pasang / Update Gemini API Key via WhatsApp
        if (/^(?:set\s+key|key:|apikey:|gemini:)\s+/i.test(userPrompt)) {
            const rawKey = userPrompt.replace(/^(?:set\s+key|key:|apikey:|gemini:)[\s:]*/i, '').trim();
            if (!rawKey) {
                await sendWaReply('⚠️ Format salah. Contoh:\n`set key AIzaSyxxxx...`');
                return res.status(200).json({ status: 'invalid_key_format' });
            }

            try {
                const listUrl = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(rawKey);
                const listResp = await fetch(listUrl);
                const listData = await listResp.json().catch(() => ({}));

                if (!listResp.ok) {
                    const errDetail = (listData && listData.error && listData.error.message) ? listData.error.message : ('HTTP ' + listResp.status);
                    await sendWaReply(`❌ API Key Ditolak oleh Google:\n${errDetail}\n\nPastikan API Key benar dan aktif di Google AI Studio.`);
                    return res.status(200).json({ status: 'key_validation_failed' });
                }

                userApiKeyStore.set(senderPhone, rawKey);
                if (activeMember) {
                    activeMember.gemini_api_key = rawKey;
                }

                await sendWaReply(
                    `✅ *GOOGLE GEMINI API KEY BERHASIL DIPASANG!* 🚀\n\n` +
                    `API Key Anda telah divalidasi dan aktif untuk nomor *${senderPhone}*.\n\n` +
                    `Sekarang Anda sudah bisa langsung membuat naskah video! Coba kirim ide sekarang, contoh:\n` +
                    `👉 \`iklan: Kopi aren susu botol kekinian\`\n` +
                    `👉 Atau kirim foto produk/karakter dengan caption ide video! 🎬`
                );
                return res.status(200).json({ status: 'key_saved_successfully' });
            } catch (errKey) {
                await sendWaReply(`❌ Gagal memvalidasi API Key: ${errKey.message}`);
                return res.status(200).json({ status: 'key_validation_error' });
            }
        }

        // 3b. Perintah Toggle n8n on / n8n off via WhatsApp
        if (lowerPrompt === 'n8n on' || lowerPrompt === '/n8n on') {
            if (activeMember && activeMember.id !== 'admin' && supabaseKey) {
                try {
                    await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${activeMember.id}`, {
                        method: 'PATCH',
                        headers: {
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${supabaseKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ n8n_auto_forward: true })
                    });
                } catch (_) {}
            }
            activeMember.n8n_auto_forward = true;
            await sendWaReply(
                `⚡ *Auto-Forward n8n BERHASIL DIAKTIFKAN (ON)!*\n\n` +
                `Mulai sekarang, setiap konsep video & prompt yang dibuat via WhatsApp akan *otomatis dikirim ke workflow n8n* Anda untuk diproses lebih lanjut.\n\n` +
                `_Ketik \`n8n off\` kapan saja jika ingin menonaktifkannya kembali._`
            );
            return res.status(200).json({ status: 'n8n_enabled' });
        }

        if (lowerPrompt === 'n8n off' || lowerPrompt === '/n8n off') {
            if (activeMember && activeMember.id !== 'admin' && supabaseKey) {
                try {
                    await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${activeMember.id}`, {
                        method: 'PATCH',
                        headers: {
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${supabaseKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ n8n_auto_forward: false })
                    });
                } catch (_) {}
            }
            activeMember.n8n_auto_forward = false;
            await sendWaReply(
                `⏸️ *Auto-Forward n8n DINONAKTIFKAN (OFF).*\n\n` +
                `Hasil konsep video hanya akan dikirim ke WhatsApp ini dan tersimpan di web dashboard Trendora AI Anda tanpa diteruskan ke n8n.\n\n` +
                `_Ketik \`n8n on\` untuk mengaktifkannya kembali kapan saja._`
            );
            return res.status(200).json({ status: 'n8n_disabled' });
        }

        if (lowerPrompt === 'n8n status' || lowerPrompt === '/n8n status') {
            const isCurrentlyOn = activeMember.n8n_auto_forward === true || process.env.N8N_AUTO_FORWARD === 'true';
            await sendWaReply(
                `📊 *STATUS INTEGRASI n8n:* \n\n` +
                `• Auto-Forward: *${isCurrentlyOn ? 'AKTIF (ON) 🟢' : 'NONAKTIF (OFF) ⚪'}*\n` +
                `• Mode: ${isCurrentlyOn ? 'Naskah otomatis diteruskan ke n8n' : 'Naskah hanya dikirim ke WA & Web'}\n\n` +
                `_Ketik \`n8n on\` untuk mengaktifkan atau \`n8n off\` untuk mematikan._`
            );
            return res.status(200).json({ status: 'n8n_status_checked' });
        }

        // 3c. Command Cek Pengaturan Storyboard (Settings)
        if (['setting', 'settings', 'pengaturan', 'cek setting', 'status setting', 'config'].includes(lowerPrompt)) {
            const memberName = activeMember.full_name || 'Member';
            const userSettings = getUserSettings(senderPhone);
            await sendWaReply(formatSettingsMessage(userSettings, memberName));
            return res.status(200).json({ status: 'settings_checked' });
        }

        // 3d. Command Ubah Pengaturan (Set Adegan, Durasi, Ratio, Bahasa, Voice)
        if (/^set\s+/i.test(lowerPrompt)) {
            let updateMade = false;
            let updateNotice = '';

            // set adegan 1-6
            const setScene = lowerPrompt.match(/^set\s+adegan\s+([1-6])/i);
            if (setScene) {
                const count = parseInt(setScene[1], 10);
                updateUserSettings(senderPhone, { sceneCount: count });
                updateNotice = `🎬 Jumlah adegan berhasil diubah ke: *${count} Adegan*.`;
                updateMade = true;
            }

            // set durasi 5s, 8s, 10s, 15s, 30s
            const setDur = lowerPrompt.match(/^set\s+durasi\s+(5|8|10|15|30)\s*(s|detik)?/i);
            if (setDur) {
                const dur = `${setDur[1]}s`;
                updateUserSettings(senderPhone, { durationPerScene: dur });
                updateNotice = `⏱️ Durasi per adegan berhasil diubah ke: *${dur}*.`;
                updateMade = true;
            }

            // set ratio 9:16, 16:9, 1:1
            const setRatio = lowerPrompt.match(/^set\s+(?:ratio|rasio|format)\s+(9:16|16:9|1:1|vertikal|landscape|square)/i);
            if (setRatio) {
                const rRaw = setRatio[1].toLowerCase();
                const ratio = (rRaw === '16:9' || rRaw === 'landscape') ? '16:9' : (rRaw === '1:1' || rRaw === 'square') ? '1:1' : '9:16';
                updateUserSettings(senderPhone, { aspectRatio: ratio });
                updateNotice = `📐 Aspect ratio berhasil diubah ke: *${ratio}* (${ratio === '16:9' ? 'Landscape YouTube' : ratio === '1:1' ? 'Square 1:1' : 'Vertikal Reels/TikTok'}).`;
                updateMade = true;
            }

            // set shot 1-6
            const setShot = lowerPrompt.match(/^set\s+shot\s+([1-6])/i);
            if (setShot) {
                const count = parseInt(setShot[1], 10);
                updateUserSettings(senderPhone, { shotsPerScene: count });
                updateNotice = `🎞️ Shot per adegan berhasil diubah ke: *${count} Shot*.`;
                updateMade = true;
            }

            // set bahasa
            const setBahasa = lowerPrompt.match(/^set\s+bahasa\s+(formal|resmi|bisnis|gen z|santai|inggris|english|jawa|sunda)/i);
            if (setBahasa) {
                const bRaw = setBahasa[1].toLowerCase();
                let bName = 'Bahasa Indonesia (Gen Z)';
                if (['formal', 'resmi', 'bisnis'].includes(bRaw)) bName = 'Bahasa Indonesia (Formal & Bisnis)';
                else if (['inggris', 'english'].includes(bRaw)) bName = 'English (International)';
                else if (bRaw === 'jawa') bName = 'Bahasa Jawa';
                else if (bRaw === 'sunda') bName = 'Bahasa Sunda';
                updateUserSettings(senderPhone, { language: bName });
                updateNotice = `🌐 Gaya bahasa berhasil diubah ke: *${bName}*.`;
                updateMade = true;
            }

            // set voice
            const setVoice = lowerPrompt.match(/^set\s+(?:voice|audio|suara)\s+(dialog|narasi|voiceover|auto|sfx)/i);
            if (setVoice) {
                const vRaw = setVoice[1].toLowerCase();
                let vName = 'Auto Director (Kontekstual)';
                if (vRaw === 'dialog') vName = 'Percakapan Dialog Tokoh';
                else if (['narasi', 'voiceover'].includes(vRaw)) vName = 'Voiceover Narasi Penuh';
                else if (vRaw === 'sfx') vName = 'Sound FX & BGM Only';
                updateUserSettings(senderPhone, { audioMode: vName });
                updateNotice = `🎙️ Mode audio berhasil diubah ke: *${vName}*.`;
                updateMade = true;
            }

            if (updateMade) {
                await sendWaReply(
                    `✅ *PENGATURAN BERHASIL DISIMPAN!* ⚙️\n\n` +
                    `${updateNotice}\n\n` +
                    `_Ketik \`setting\` kapan saja untuk melihat status pengaturan lengkap, atau langsung kirim ide video Anda sekarang!_ 🚀`
                );
                return res.status(200).json({ status: 'settings_updated' });
            }
        }

        // 4. Validasi Gemini API Key Milik Member (BYOK - Bring Your Own Key)
        const memberGeminiKey = (activeMember && activeMember.gemini_api_key && activeMember.gemini_api_key.trim()) ||
                                (isAdmin ? (process.env.GEMINI_API_KEY || ADMIN_DEFAULT_GEMINI_KEY) : '') ||
                                userApiKeyStore.get(senderPhone) || '';

        if (!memberGeminiKey) {
            const memberName = activeMember.full_name || 'Member';
            await sendWaReply(
                `⚠️ *Halo Kak ${memberName}!*

Google Gemini API Key belum terpasang di akun Trendora AI Anda.

*Cara Aktivasi Sangat Cepat & Mudah (Pilih Salah Satu):*
1️⃣ *Ketik langsung di WhatsApp ini:*
\`set key [API_KEY_ANDA]\`
Contoh: \`set key AIzaSyxxxx...\`

2️⃣ *Lewat Website:*
Buka https://sutradara-swart.vercel.app lalu masukkan API Key di menu *Gemini Key*.

Setelah disimpan, bot WhatsApp ini otomatis aktif dan siap membuatkan naskah video untuk Anda! 🚀🎬`
            );
            return res.status(200).json({ status: 'no_gemini_key_prompted' });
        }

        // 5. Deteksi Jenis Storyboard (Video Iklan, Konten Kreatif, atau Animasi)
        const detected = detectStoryboardMode(userPrompt);

        // Ambil default settings & parse parameter dinamis dari teks prompt
        const userBaseSettings = getUserSettings(senderPhone);
        const activeSettings = parseStoryboardSettings(userPrompt, userBaseSettings);

        // Proses Foto Referensi Visual (Multimodal Vision) jika ada
        let imagePart = null;
        if (rawMediaUrl && (rawMediaType === 'IMAGE' || /\.(jpg|jpeg|png|webp)($|\?)/i.test(rawMediaUrl))) {
            try {
                console.log(`[WA-WEBHOOK] Mengunduh foto referensi visual: ${rawMediaUrl}`);
                const imgResp = await fetch(rawMediaUrl);
                if (imgResp.ok) {
                    const arrayBuffer = await imgResp.arrayBuffer();
                    const base64Data = Buffer.from(arrayBuffer).toString('base64');
                    const cType = imgResp.headers.get('content-type') || 'image/jpeg';
                    const mime = cType.includes('png') ? 'image/png' : (cType.includes('webp') ? 'image/webp' : 'image/jpeg');
                    imagePart = {
                        inlineData: {
                            mimeType: mime,
                            data: base64Data
                        }
                    };
                    console.log(`[WA-WEBHOOK] Sukses memproses foto referensi (${(base64Data.length / 1024).toFixed(1)} KB)`);
                }
            } catch (imgErr) {
                console.warn('[WA-WEBHOOK] Gagal unduh foto referensi:', imgErr.message);
            }
        }

        // Kirim Notifikasi Tunggu dengan Badge Mode & Info Pengaturan Terpilih
        const waitNotice = imagePart
            ? `⏳ *TRENDORA AI sedang memindai foto referensi & merancang ${detected.name}...*\n\n${detected.badge}\n📸 _Foto referensi visual terdeteksi & sedang dianalisis..._\n📐 _Format: ${activeSettings.aspectRatio} | ${activeSettings.sceneCount} Adegan @ ${activeSettings.durationPerScene}_\n\nEstimasi proses 8-12 detik. Tunggu sebentar ya kak! 🎬`
            : `⏳ *TRENDORA AI sedang merancang ${detected.name}...*\n\n${detected.badge}\n📐 _Format: ${activeSettings.aspectRatio} | ${activeSettings.sceneCount} Adegan @ ${activeSettings.durationPerScene}_\n_"${detected.prompt.slice(0, 80)}${detected.prompt.length > 80 ? '...' : ''}"_\n\nEstimasi proses 5-10 detik. Tunggu sebentar ya kak! 🎬`;

        await sendWaReply(waitNotice);

        // Panduan Spesifik Sesuai Pilihan Mode
        let modeGuidelines = '';
        if (detected.mode === 'commercial') {
            modeGuidelines = 
`JENIS STORYBOARD: VIDEO IKLAN & PROMOSI (COMMERCIAL & SALES)
Formula Wajib Sutradara:
• Fokus Utama: Formula AIDA / PAS untuk konversi penjualan produk/jasa.
• Hook 3 Detik: Problem hook yang relate dengan calon pembeli / visual masalah yang mengejutkan.
• Struktur Alur: Mulai dari masalah audiens -> perkenalkan produk sebagai solusi -> demo benefit -> Call to Action (CTA) beli kuat.
• 🎨 AI Image Prompt: High-end commercial product photography, studio softbox lighting, 8k resolution, crisp product detail, photorealistic.
• 🎥 Video Motion: Smooth dolly zoom, dynamic macro product rotation, aesthetic commercial camera glide.`;
        } else if (detected.mode === 'animation') {
            modeGuidelines = 
`JENIS STORYBOARD: VIDEO ANIMASI & FANTASI (3D ANIMATION & ANIME)
Formula Wajib Sutradara:
• Fokus Utama: Dunia imajinasi penuh warna, karakter kartun/3D unik dan menggemaskan/keren, aksi visual kaya ekspresi (exaggeration).
• Hook 3 Detik: Visual aksi magis atau tingkah lucu karakter animasi yang langsung mencuri perhatian.
• Struktur Alur: Pengenalan karakter unik -> rintangan/petualangan ajaib -> klimaks aksi spektakuler -> resolusi hangat/ceria.
• 🎨 AI Image Prompt: 3D Pixar Animation style, Disney render, Unreal Engine 5 cartoon, vibrant saturated colors, soft rim lighting, expressive face, 8k.
• 🎥 Video Motion: Fast dynamic swooping camera, bouncy character animation motion, magical floating particle effects.`;
        } else {
            modeGuidelines = 
`JENIS STORYBOARD: KONTEN KREATIF & STORYTELLING (DRAMA, KOMEDI, HOROR, POV)
Formula Wajib Sutradara:
• Fokus Utama: Narrative Arc emosional, karakter mendalam, percakapan dialog kuat, tensi cerita, dan plot twist yang tidak terduga.
• Hook 3 Detik: Potongan adegan puncak atau kalimat pembuka emosional yang bikin penonton penasaran tidak mau skip.
• Struktur Alur: Setup situasi -> eskalasi konflik memuncak -> plot twist mengejutkan -> penutup berkesan / moral cerita.
• 🎨 AI Image Prompt: Cinematic movie still, 35mm lens, atmospheric moody lighting, realistic emotional character expression, shallow depth of field.
• 🎥 Video Motion: Handheld cinematic camera movement, slow push-in on actor face, dramatic whip pan.`;
        }

        // Hitung estimasi total durasi
        const sceneSeconds = parseInt(activeSettings.durationPerScene, 10) || 10;
        const totalDurationEstimate = sceneSeconds * activeSettings.sceneCount;

        // 6. Generate Konsep & Naskah Video via Gemini AI
        const systemPrompt = 
`Anda adalah "Pak Sutradara" (AI Creative & Video Director dari TRENDORA AI).
Tugas Anda adalah merancang naskah dan cetak biru (blueprint) video berkualitas tinggi berdasarkan instruksi mode dan pengaturan storyboard berikut:

${modeGuidelines}

PENGATURAN STORYBOARD AKTIF (WAJIB DIIKUTI):
• Jumlah Adegan: Tepat ${activeSettings.sceneCount} Adegan (Tuliskan Adegan 1 sampai Adegan ${activeSettings.sceneCount})
• Perkiraan Shot: Sekitar ${activeSettings.shotsPerScene} Shot per adegan
• Durasi per Adegan: ${activeSettings.durationPerScene} (Total durasi video: ~${totalDurationEstimate} detik)
• Format / Aspect Ratio: ${activeSettings.aspectRatio} (${activeSettings.aspectRatio === '9:16' ? 'Vertikal 9:16 - Reels/TikTok/Shorts' : activeSettings.aspectRatio === '16:9' ? 'Landscape 16:9 - YouTube/TV' : 'Square 1:1 - Feed Instagram'})
• Gaya Bahasa Dialog & Narasi: ${activeSettings.language}
• Mode Audio & Voice: ${activeSettings.audioMode}

${imagePart ? `
FOTO REFERENSI TERLAMPIR (MULTIMODAL VISION):
Pengguna melampirkan foto referensi visual nyata.
Periksa foto tersebut dengan sangat teliti:
- Jika FOTO PRODUK: Kunci bentuk fisik, warna kemasan, label, material, dan ukuran ke dalam setiap adegan dan prompt gambar.
- Jika FOTO KARAKTER/TALENT: Kunci wajah, rambut, gaya pakaian, dan ciri unik karakter tersebut di setiap adegan.
- Jika FOTO LOKASI: Kunci arsitektur, elemen latar, dan suasana lighting di setiap adegan.
Wajib sertakan bagian "📸 *REFERENSI VISUAL TERKUNCI (LOCK):*" di bagian atas naskah!
` : ''}

Gaya Bahasa: Profesional, kreatif, berenergi tinggi, menggunakan format WhatsApp yang bersih dan rapi (*bold*, _italic_, bullet points, emoji).

Format Balasan WA Wajib:
${detected.badge}

🎬 *PROYEK: [JUDUL VIDEO MENARIK]*
⏱️ *Durasi:* ~${totalDurationEstimate} Detik (${activeSettings.sceneCount} Adegan @ ${activeSettings.durationPerScene}) | *Format:* ${activeSettings.aspectRatio}
🌐 *Bahasa:* ${activeSettings.language} | 🎙️ *Audio:* ${activeSettings.audioMode}
🎯 *Target Audiens:* [Target audiens spesifik]
${imagePart ? `\n📸 *REFERENSI VISUAL TERKUNCI (LOCK):*\n• Objek Terdeteksi: [Karakter / Produk / Lokasi]\n• Ciri Fisik Terkunci: [Deskripsi ringkas detail visual foto yang dikunci di seluruh adegan]\n` : ''}
🔥 *HOOK 3 DETIK PERTAMA (Penahan Scroll):*
"[Tuliskan aksi visual mengejutkan & kalimat pembuka yang kuat]"

📋 *BREAKDOWN STORYBOARD (${activeSettings.sceneCount} ADEGAN):*

[Tuliskan persis ${activeSettings.sceneCount} adegan lengkap: Adegan 1 sampai Adegan ${activeSettings.sceneCount}. Untuk setiap adegan wajib menyertakan:]
*🎬 ADEGAN [X] ([Nama Peran Adegan])*
• Visual: [Deskripsi visual kamera, sudut, objek, suasana${imagePart ? ' - sertakan detail terkunci dari foto referensi' : ''}]
• Dialog / Audio: "[Suara narasi atau percakapan sesuai gaya ${activeSettings.language}]"
• 🎨 AI Image Prompt: [Prompt bahasa Inggris sinematik untuk Midjourney/Gemini/Flux${imagePart ? ' - sebutkan detail visual objek foto referensi secara konsisten' : ''}, aspect ratio --ar ${activeSettings.aspectRatio.replace(':', ':')}]
• 🎥 Video Motion: [Instruksi gerakan kamera untuk Runway/Luma/Kling]

💡 *SARAN SUTRADARA:*
[1-2 tips sound effect (SFX), warna lighting, atau musik latar yang cocok]

---
✨ _Dirancang otomatis oleh TRENDORA AI Director Engine_`;

        const contentsParts = [
            { text: systemPrompt },
            { text: `Ide Konten dari WhatsApp:\n"${userPrompt}"` }
        ];

        if (imagePart) {
            contentsParts.push(imagePart);
            contentsParts.push({
                text: `PERHATIAN MULTIMODAL VISION SUTRADARA:
Foto referensi di atas adalah panduan visual nyata (Karakter / Produk / Lokasi).
1. Teliti objek di foto: detail bentuk fisik, warna, label/kemasan, pakaian, wajah, atau latar arsitektur.
2. KUNCI (LOCK) ciri fisik tersebut ke dalam setiap ADEGAN dan AI Image Prompt agar konsisten dari awal hingga akhir!
3. Wajib sertakan bagian "📸 *REFERENSI VISUAL TERKUNCI (LOCK):*" di awal naskah.`
            });
        }

        const candidateModels = [
            'gemini-flash-latest',
            'gemini-3-flash-preview',
            'gemini-2.0-flash',
            'gemini-3.1-flash-lite',
            'gemini-flash-lite-latest',
            'gemini-3.5-flash',
            'gemini-2.5-flash-preview'
        ];

        let geminiResp = null;
        let lastGeminiErr = '';

        for (const modelName of candidateModels) {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${memberGeminiKey}`;
            try {
                const resp = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: 'user',
                                parts: contentsParts
                            }
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 3000
                        }
                    })
                });

                if (resp.ok) {
                    geminiResp = resp;
                    console.log(`[WA-WEBHOOK] Sukses generate naskah dengan model: ${modelName}`);
                    break;
                } else {
                    lastGeminiErr = await resp.text().catch(() => '');
                    console.warn(`[WA-WEBHOOK] Model ${modelName} gagal (${resp.status}): ${lastGeminiErr.slice(0, 100)}`);
                    if (resp.status === 404 || resp.status === 429 || resp.status === 400 ||
                        lastGeminiErr.includes('not found') || lastGeminiErr.includes('not supported') || 
                        lastGeminiErr.includes('quota') || lastGeminiErr.includes('exceeded') || 
                        lastGeminiErr.includes('no longer available')) {
                        continue;
                    } else {
                        geminiResp = resp;
                        break;
                    }
                }
            } catch (fetchErr) {
                lastGeminiErr = fetchErr.message;
            }
        }

        if (!geminiResp || !geminiResp.ok) {
            const errText = lastGeminiErr || (geminiResp ? await geminiResp.text().catch(() => '') : 'Unknown failure');
            console.error('[WA-WEBHOOK] Gemini API Error:', geminiResp ? geminiResp.status : 500, errText);
            await sendWaReply(`❌ Maaf kak, terjadi kendala saat memproses naskah (${geminiResp ? geminiResp.status : 'API'}). Silakan coba beberapa saat lagi.`);
            return res.status(200).json({ error: 'Gemini API Failure', detail: errText });
        }

        const geminiData = await geminiResp.json();
        const generatedScript = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!generatedScript) {
            await sendWaReply('❌ AI tidak memberikan output. Silakan coba kirimkan ide dengan kalimat yang lebih jelas.');
            return res.status(200).json({ error: 'Empty AI Output' });
        }

        // 7. Simpan Riwayat Pembuatan ke Supabase (Jika Tabel Tersedia)
        if (supabaseKey && activeMember && activeMember.id !== 'admin') {
            try {
                await fetch(`${supabaseUrl}/rest/v1/wa_storyboards`, {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        user_id: activeMember.id,
                        phone_number: senderPhone,
                        sender_name: activeMember.full_name || sender_name || 'Member',
                        prompt: userPrompt,
                        result: generatedScript,
                        created_at: new Date().toISOString()
                    })
                }).catch(() => {});
            } catch (dbErr) {
                console.warn('[WA-WEBHOOK] Supabase save skipped:', dbErr.message);
            }
        }

        // 8. Cek & Kirim Otomatis ke n8n jika Toggle ON
        let n8nSuccess = false;
        const isAutoForward = (activeMember && activeMember.n8n_auto_forward === true) || 
                              process.env.N8N_AUTO_FORWARD === 'true';
        const targetN8nUrl = (activeMember && activeMember.n8n_webhook_url) || 
                             process.env.N8N_WEBHOOK_URL || 
                             'https://n8n-zjopjxvznwqr.jkt2.sumopod.my.id/webhook/whatsapp-dispatch';

        if (isAutoForward && targetN8nUrl) {
            try {
                const n8nPayload = {
                    event: 'wa_video_concept_created',
                    source: 'TRENDORA AI WhatsApp Bot',
                    user_id: activeMember.id,
                    sender_number: senderPhone,
                    sender_name: activeMember.full_name || sender_name || 'Member',
                    prompt: userPrompt,
                    concept_script: generatedScript,
                    timestamp: new Date().toISOString()
                };
                const n8nResp = await fetch(targetN8nUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(n8nPayload)
                });
                n8nSuccess = n8nResp.ok;
                console.log(`[WA-WEBHOOK] Auto-forward ke n8n (${targetN8nUrl}): status ${n8nResp.status}`);
            } catch (n8nErr) {
                console.warn('[WA-WEBHOOK] Gagal auto-forward ke n8n:', n8nErr.message);
            }
        }

        // 9. Kirim Hasil Lengkap Naskah & Storyboard ke WhatsApp
        let finalReply = generatedScript;
        if (n8nSuccess) {
            finalReply += '\n\n⚡ _Konsep video berhasil diteruskan otomatis ke workflow n8n Anda._';
        }
        await sendWaReply(finalReply);

        const executionDuration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[WA-WEBHOOK] Selesai memproses naskah untuk ${activeMember.full_name} dalam ${executionDuration} detik.`);

        return res.status(200).json({
            status: 'success',
            duration: `${executionDuration}s`,
            member: activeMember.full_name
        });

    } catch (error) {
        console.error('[WA-WEBHOOK] Fatal Error:', error);
        return res.status(500).json({ error: 'Internal Webhook Server Error', message: error.message });
    }
};
