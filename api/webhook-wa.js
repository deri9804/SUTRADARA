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
            is_group
        } = body;

        // Ambil nomor pengirim riil & normalisasi
        const rawPhone = (sender_number || phone_number || '').replace(/[^0-9]/g, '');
        const senderPhone = normalizePhone(rawPhone);
        const userPrompt = (message || '').trim();
        const activeSessionKey = String(session_key || process.env.TRENDORA_WA_SESSION || '1');

        console.log(`[WA-WEBHOOK] Pesan masuk dari ${senderPhone} (${sender_name}): "${userPrompt.slice(0, 50)}..."`);

        // Abaikan pesan kosong atau pesan grup
        if (!userPrompt || !senderPhone) {
            return res.status(200).json({ status: 'ignored', reason: 'Empty message or phone' });
        }

        if (is_group) {
            return res.status(200).json({ status: 'ignored', reason: 'Group messages disabled' });
        }

        // Konfigurasi Gateway & Supabase
        const waGatewayUrl = process.env.TRENDORA_WA_URL || 'https://whatsappapi.trendoraautomation.my.id/api/dispatch';
        const waBearerToken = process.env.TRENDORA_WA_TOKEN || '';
        const supabaseUrl = process.env.SUPABASE_URL || 'https://inixcxbvfyvmuuzlkljq.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_ozGrENkmrJH48KSWov2BIw_2f13d_qH';

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
                console.log(`[WA-WEBHOOK] Balasan terkirim ke ${senderPhone}:`, result);
                return resp.ok;
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

        // Fallback untuk Admin Utama jika belum terdaftar di profiles Supabase
        const ADMIN_DEFAULT_PHONE = '6282375958716';
        const envAdminPhones = (process.env.ADMIN_PHONE || '')
            .split(',')
            .map(p => normalizePhone(p))
            .filter(Boolean);
        const adminPhoneList = [ADMIN_DEFAULT_PHONE, ...envAdminPhones];
        const isAdmin = adminPhoneList.includes(senderPhone) || (activeMember && activeMember.role === 'admin');

        if (!activeMember && isAdmin) {
            console.log(`[WA-WEBHOOK] Pengirim ${senderPhone} adalah ADMIN (Fallback bypass).`);
            activeMember = { 
                id: 'admin', 
                full_name: 'Admin Trendora', 
                role: 'admin', 
                status: 'active',
                gemini_api_key: process.env.GEMINI_API_KEY || ''
            };
        }

        // JIKA NOMOR BUKAN MEMBER TERDAFTAR / CHAT DARI ORANG LUAR:
        // Sesuai aturan: ABAIKAN TOTAL (Silent Ignore), JANGAN balas apa pun agar tidak mengganggu chat bisnis/pribadi.
        if (!activeMember) {
            console.log(`[WA-WEBHOOK] Mengabaikan chat dari ${senderPhone} (Bukan pemilik nomor terdaftar / pesan orang luar). Bot diam.`);
            return res.status(200).json({ status: 'ignored_non_member' });
        }

        // 3. Command Bantuan / Menu (Untuk Member Terdaftar)
        const lowerPrompt = userPrompt.toLowerCase();
        if (['menu', 'help', 'bantuan', 'start', 'halo', 'hi', 'mode', 'pilih', 'storyboard'].includes(lowerPrompt)) {
            const memberName = activeMember.full_name || 'Member';
            const menuText = 
`🎬 *TRENDORA AI - DIRECTOR ENGINE* 🎬
_Halo Kak ${memberName}! Pilih jenis Storyboard yang ingin Anda buat:_

1️⃣ *Video Iklan* (\`iklan\`)
   🎯 _Fokus jualan produk/jasa, penahan scroll, demo solusi, & CTA konversi beli._
   👉 *Cara Kirim:* \`iklan: [ide produk/jasa Anda]\`
   _Contoh: \`iklan: Kopi susu gula aren botolan untuk lembur malam\`_

2️⃣ *Konten Kreatif* (\`kreatif\` atau \`cerita\`)
   🎭 _Fokus storytelling, drama, komedi, horor, POV, & video edukasi viral._
   👉 *Cara Kirim:* \`kreatif: [ide cerita Anda]\`
   _Contoh: \`kreatif: Drama driver ojol menemukan dompet berisi surat rahasia\`_

3️⃣ *Video Animasi* (\`animasi\`)
   ✨ _Fokus dunia fantasi, karakter 3D kartun/anime unik, & aksi imajinatif._
   👉 *Cara Kirim:* \`animasi: [ide animasi Anda]\`
   _Contoh: \`animasi: Petualangan robot kecil mencari bintang jatuh di hutan ajaib\`_

💡 *Tips Cepat:*
Anda bisa langsung mengetik \`iklan: ...\`, \`kreatif: ...\`, atau \`animasi: ...\`!

⚡ *Integrasi n8n:*
• \`n8n on\` : Aktifkan otomatis kirim hasil video ke n8n
• \`n8n off\` : Matikan otomatis kirim ke n8n
• \`n8n status\` : Cek status integrasi n8n saat ini

Silakan kirimkan ide video Anda sekarang! 🚀`;

            await sendWaReply(menuText);
            return res.status(200).json({ status: 'menu_sent' });
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

        // 4. Validasi Gemini API Key Milik Member (BYOK - Bring Your Own Key)
        const memberGeminiKey = (activeMember && activeMember.gemini_api_key && activeMember.gemini_api_key.trim()) ||
                                (isAdmin ? (process.env.GEMINI_API_KEY || '') : '');

        if (!memberGeminiKey) {
            const memberName = activeMember.full_name || 'Member';
            await sendWaReply(
                `⚠️ *Halo Kak ${memberName}!*

Google Gemini API Key belum terpasang di akun Trendora AI Anda.

*Cara Aktivasi Sangat Cepat & Mudah:*
1️⃣ Buka web: https://sutradara-swart.vercel.app
2️⃣ Klik menu *Gemini Key* (di pojok kanan atas)
3️⃣ Masukkan API Key Anda (Gratis dari Google AI Studio) lalu klik *Simpan*.

Setelah disimpan di web, bot WhatsApp ini otomatis aktif dan siap membuatkan naskah video untuk Anda! 🚀🎬`
            );
            return res.status(200).json({ status: 'no_gemini_key_prompted' });
        }

        // 5. Deteksi Jenis Storyboard (Video Iklan, Konten Kreatif, atau Animasi)
        const detected = detectStoryboardMode(userPrompt);

        // Kirim Notifikasi Tunggu dengan Badge Mode Terpilih
        await sendWaReply(`⏳ *TRENDORA AI sedang merancang ${detected.name}...*\n\n${detected.badge}\n_"${detected.prompt.slice(0, 90)}${detected.prompt.length > 90 ? '...' : ''}"_\n\nEstimasi proses 5-10 detik. Tunggu sebentar ya kak! 🎬`);

        // Panduan Spesifik Sesuai Pilihan Mode
        let modeGuidelines = '';
        if (detected.mode === 'commercial') {
            modeGuidelines = 
`JENIS STORYBOARD: VIDEO IKLAN & PROMOSI (COMMERCIAL & SALES)
Formula Wajib Sutradara:
• Fokus Utama: Formula AIDA / PAS untuk konversi penjualan produk/jasa.
• Hook 3 Detik: Problem hook yang relate dengan calon pembeli / visual masalah yang mengejutkan.
• Adegan 1 (Hook & Masalah): Tampilkan rasa frustrasi atau masalah audiens tanpa produk ini.
• Adegan 2 (Agitasi & Solusi): Hadirkan produk ini sebagai penyelamat dan solusi nyata.
• Adegan 3 (Demo & Benefit): Tampilkan demo keunggulan produk dan hasil memuaskan.
• Adegan 4 (Penawaran & CTA Kuat): Berikan kalimat ajakan beli sekarang / promo terbatas / klik link bio.
• 🎨 AI Image Prompt: High-end commercial product photography, studio softbox lighting, 8k resolution, crisp product detail, photorealistic.
• 🎥 Video Motion: Smooth dolly zoom, dynamic macro product rotation, aesthetic commercial camera glide.`;
        } else if (detected.mode === 'animation') {
            modeGuidelines = 
`JENIS STORYBOARD: VIDEO ANIMASI & FANTASI (3D ANIMATION & ANIME)
Formula Wajib Sutradara:
• Fokus Utama: Dunia imajinasi penuh warna, karakter kartun/3D unik dan menggemaskan/keren, aksi visual kaya ekspresi (exaggeration).
• Hook 3 Detik: Visual aksi magis atau tingkah lucu karakter animasi yang langsung mencuri perhatian.
• Adegan 1 (Intro Karakter & Dunia): Tampilkan dunia animasi yang memukau dan keunikan fisik/karakter tokoh utama.
• Adegan 2 (Petualangan & Rintangan): Aksi kartun dinamis, tantangan ajaib, atau momen komedi visual yang seru.
• Adegan 3 (Puncak Aksi / Keajaiban): Momen klimaks kekuatan sihir, penemuan ajaib, atau pertempuran animasi spektakuler.
• Adegan 4 (Resolusi & Ending Ajaib): Penutup cerita yang ceria, penuh kehangatan, atau twist kartun yang menyenangkan.
• 🎨 AI Image Prompt: 3D Pixar Animation style, Disney render, Unreal Engine 5 cartoon, vibrant saturated colors, soft rim lighting, expressive face, 8k.
• 🎥 Video Motion: Fast dynamic swooping camera, bouncy character animation motion, magical floating particle effects.`;
        } else {
            modeGuidelines = 
`JENIS STORYBOARD: KONTEN KREATIF & STORYTELLING (DRAMA, KOMEDI, HOROR, POV)
Formula Wajib Sutradara:
• Fokus Utama: Narrative Arc emosional, karakter mendalam, percakapan dialog kuat, tensi cerita, dan plot twist yang tidak terduga.
• Hook 3 Detik: Potongan adegan puncak atau kalimat pembuka emosional yang bikin penonton penasaran tidak mau skip.
• Adegan 1 (Setup & Hook): Pengenalan situasi dan premis cerita yang memancing rasa ingin tahu.
• Adegan 2 (Eskalasi Konflik): Masalah semakin memuncak, ada ketegangan, perdebatan, atau situasi komedi/horor yang intens.
• Adegan 3 (Plot Twist & Klimaks): Momen mengejutkan yang membalikkan ekspektasi penonton, atau momen emosional puncak.
• Adegan 4 (Resolusi & Ending Berkesan): Penutup yang menyentuh hati, pesan moral mendalam, atau ending menggantung yang memicu komentar.
• 🎨 AI Image Prompt: Cinematic movie still, 35mm lens, atmospheric moody lighting, realistic emotional character expression, shallow depth of field.
• 🎥 Video Motion: Handheld cinematic camera movement, slow push-in on actor face, dramatic whip pan.`;
        }

        // 6. Generate Konsep & Naskah Video via Gemini AI
        const systemPrompt = 
`Anda adalah "Pak Sutradara" (AI Creative & Video Director dari TRENDORA AI).
Tugas Anda adalah merancang naskah dan cetak biru (blueprint) video berkualitas tinggi berdasarkan instruksi mode berikut:

${modeGuidelines}

Gaya Bahasa: Profesional, kreatif, berenergi tinggi, menggunakan format WhatsApp yang bersih dan rapi (*bold*, _italic_, bullet points, emoji).

Format Balasan WA Wajib:
${detected.badge}

🎬 *PROYEK: [JUDUL VIDEO MENARIK]*
⏱️ *Estimasi Durasi:* [Misal: 15-30 Detik] | *Format:* [9:16 Vertikal (Reels/TikTok/Shorts)]
🎯 *Target Audiens:* [Target spesifik]

🔥 *HOOK 3 DETIK PERTAMA (Penahan Scroll):*
"[Tuliskan aksi visual mengejutkan & kalimat pembuka yang kuat]"

📋 *BREAKDOWN ADEGAN (STORYBOARD):*

*🎬 ADEGAN 1 (Hook / Pembuka)*
• Visual: [Deskripsi visual kamera, sudut, objek, suasana]
• Dialog / Audio: "[Suara narasi atau percakapan]"
• 🎨 AI Image Prompt: [Prompt bahasa Inggris sinematik untuk Midjourney/Gemini/Flux]
• 🎥 Video Motion: [Instruksi gerakan kamera untuk Runway/Luma/Kling]

*🎬 ADEGAN 2 (Problem / Konflik)*
• Visual: [Deskripsi visual]
• Dialog / Audio: "[Suara narasi / dialog]"
• 🎨 AI Image Prompt: [Prompt bahasa Inggris]
• 🎥 Video Motion: [Instruksi gerakan]

*🎬 ADEGAN 3 (Solution / Inti Cerita)*
• Visual: [Deskripsi visual]
• Dialog / Audio: "[Suara narasi / dialog]"
• 🎨 AI Image Prompt: [Prompt bahasa Inggris]
• 🎥 Video Motion: [Instruksi gerakan]

*🎬 ADEGAN 4 (Call to Action / Ending)*
• Visual: [Deskripsi visual penutup & branding]
• Dialog / Audio: "[Kalimat ajakan / penutup]"
• 🎨 AI Image Prompt: [Prompt bahasa Inggris]
• 🎥 Video Motion: [Instruksi gerakan]

💡 *SARAN SUTRADARA:*
[1-2 tips sound effect (SFX), warna lighting, atau musik latar yang cocok]

---
✨ _Dirancang otomatis oleh TRENDORA AI Director Engine_`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${memberGeminiKey}`;

        const geminiResp = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: systemPrompt },
                            { text: `Ide Konten dari WhatsApp:\n"${userPrompt}"` }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!geminiResp.ok) {
            const errText = await geminiResp.text().catch(() => '');
            console.error('[WA-WEBHOOK] Gemini API Error:', geminiResp.status, errText);
            await sendWaReply(`❌ Maaf kak, terjadi kendala saat memproses naskah (${geminiResp.status}). Silakan coba beberapa saat lagi.`);
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
