/**
 * TRENDORA AI - WHATSAPP WEBHOOK HANDLER (Vercel Serverless Function)
 * Terhubung dengan Trendora WA Gateway (Baileys Multi-Session)
 * 
 * Alur:
 * 1. Menerima Webhook Incoming Message dari Trendora WA Gateway
 * 2. Validasi nomor pengirim (Admin / Whitelist)
 * 3. Kirim pesan tunggu ("Sedang merancang konsep video...")
 * 4. Panggil Gemini AI untuk membedah ide jadi Naskah & Storyboard Director Lengkap
 * 5. Kirim balasan hasil rancangan video kembali ke chat WhatsApp via API Dispatch Trendora WA
 */

module.exports = async function handler(req, res) {
    // 1. Health check & Method Guard
    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'online',
            service: 'Trendora AI WhatsApp Webhook Engine',
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

        // Ambil nomor pengirim riil
        const senderPhone = (sender_number || phone_number || '').replace(/[^0-9]/g, '');
        const userPrompt = (message || '').trim();
        const activeSessionKey = String(session_key || process.env.TRENDORA_WA_SESSION || '1');

        console.log(`[WA-WEBHOOK] Pesan masuk dari ${senderPhone} (${sender_name}): "${userPrompt.slice(0, 50)}..."`);

        // Abaikan pesan kosong atau pesan grup (opsional)
        if (!userPrompt || !senderPhone) {
            return res.status(200).json({ status: 'ignored', reason: 'Empty message or phone' });
        }

        if (is_group) {
            return res.status(200).json({ status: 'ignored', reason: 'Group messages disabled' });
        }

        // 2. Filter Whitelist / Admin Phone (Jika diatur di Environment Vercel)
        const allowedPhones = (process.env.ADMIN_PHONE || '')
            .split(',')
            .map(p => p.trim().replace(/[^0-9]/g, ''))
            .filter(Boolean);

        if (allowedPhones.length > 0 && !allowedPhones.includes(senderPhone)) {
            console.warn(`[WA-WEBHOOK] Nomor ${senderPhone} tidak ada dalam whitelist admin.`);
            return res.status(200).json({ status: 'unauthorized_sender' });
        }

        // Konfigurasi Gateway Trendora WA
        const waGatewayUrl = process.env.TRENDORA_WA_URL || 'https://whatsappapi.trendoraautomation.my.id/api/dispatch';
        const waBearerToken = process.env.TRENDORA_WA_TOKEN || '';
        const geminiApiKey = process.env.GEMINI_API_KEY || '';

        // Helper fungsi kirim balik ke WhatsApp
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

        // 3. Handle Command Bantuan / Menu
        const lowerPrompt = userPrompt.toLowerCase();
        if (['menu', 'help', 'bantuan', 'start', 'halo', 'hi'].includes(lowerPrompt)) {
            const menuText = 
`🎬 *TRENDORA AI - DIRECTOR BOT* 🎬
_Asisten Sutradara & Pembuat Konten AI_

Kirim ide video apa saja, dan AI akan otomatis merancang naskah, hook, visual adegan, hingga prompt AI-nya!

📌 *Contoh Perintah:*
1️⃣ *Video Iklan Produk:*
_\"iklan: Minuman Boba Brown Sugar - Anak muda/Gen Z - Segar, manis pas, promo beli 1 gratis 1\"_

2️⃣ *Video Cerita / Drama:*
_\"cerita: Seorang ayah rela lembur demi membelikan laptop impian anaknya\"_

3️⃣ *Video Animasi:*
_\"animasi: Robot kecil yang tersesat di hutan ajaib mencari baterai energi\"_

4️⃣ *Ketik Bebas (Natural):*
_\"Buatkan naskah reels 30 detik untuk jualan hijab anti kusut\"_

Ketik ide lu sekarang ya bos! 🚀`;

            await sendWaReply(menuText);
            return res.status(200).json({ status: 'menu_sent' });
        }

        // 4. Kirim notifikasi awal "Sedang memproses" agar pengirim tahu request diterima
        await sendWaReply(`⏳ *TRENDORA AI sedang merancang konsep video untuk lu...*\n\n_"${userPrompt.slice(0, 100)}${userPrompt.length > 100 ? '...' : ''}"_\n\nTunggu sekitar 5-10 detik ya bos! 🎬`);

        // 5. Cek ketersediaan Gemini API Key
        if (!geminiApiKey) {
            await sendWaReply(
                `⚠️ *GEMINI_API_KEY Belum Dikonfigurasi di Vercel*\n\n` +
                `Silakan tambahkan Environment Variable \`GEMINI_API_KEY\` di dashboard Vercel proyek Trendora AI lu.`
            );
            return res.status(200).json({ error: 'Missing GEMINI_API_KEY' });
        }

        // 6. Jalankan Sutradara AI dengan Gemini
        const systemPrompt = 
`Anda adalah "Pak Sutradara" (AI Creative & Video Director dari TRENDORA AI).
Tugas Anda adalah mengubah ide singkat dari pengguna WhatsApp menjadi cetak biru (blueprint) naskah dan konsep video yang siap diproduksi.

Gaya Bahasa: Profesional, kreatif, berenergi tinggi, menggunakan format WhatsApp yang bersih dan rapi (*bold*, _italic_, bullet points, emoji).

Format Balasan WA Wajib:
🎬 *PROYEK: [JUDUL VIDEO MENARIK]*
⏱️ *Estimasi Durasi:* [Misal: 15-30 Detik] | *Format:* [9:16 Vertikal (Reels/TikTok/Shorts)]
🎯 *Target Audiens:* [Target spesifik]

🔥 *HOOK 3 DETIK PERTAMA (Penahan Scroll):*
"[Tuliskan aksi visual mengejutkan & kalimat pembuka yang kuat]"

📋 *BREAKDOWN ADEGAN (STORYBOARD):*

*🎬 ADEGAN 1 (Hook / Pembuka)*
• Visual: [Deskripsi visual kamera, sudut, objek, suasana]
• Dialog / Audio: "[Suara narasi atau percakapan]"
• 🎨 AI Image Prompt: [Prompt bahasa Inggris sinematik untuk generate gambar di Midjourney/Gemini/Flux]
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

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

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
            await sendWaReply(`❌ Maaf bos, ada kendala saat menghubungi AI (${geminiResp.status}). Silakan coba sesaat lagi.`);
            return res.status(200).json({ error: 'Gemini API Failure', detail: errText });
        }

        const geminiData = await geminiResp.json();
        const generatedScript = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!generatedScript) {
            await sendWaReply('❌ AI tidak memberikan respon hasil naskah. Silakan coba kirim ide dengan kalimat lain.');
            return res.status(200).json({ error: 'Empty AI Output' });
        }

        // 7. Simpan Proyek ke Database Supabase (Opsional jika kredensial ada)
        const supabaseUrl = process.env.SUPABASE_URL || 'https://inixcxbvfyvmuuzlkljq.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

        if (supabaseKey) {
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
                        phone_number: senderPhone,
                        sender_name: sender_name || 'WA User',
                        prompt: userPrompt,
                        result: generatedScript,
                        created_at: new Date().toISOString()
                    })
                }).catch(() => {});
            } catch (dbErr) {
                console.warn('[WA-WEBHOOK] Supabase save skipped:', dbErr.message);
            }
        }

        // 8. Kirim Hasil Lengkap Naskah & Storyboard ke WhatsApp
        await sendWaReply(generatedScript);

        const executionDuration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[WA-WEBHOOK] Selesai memproses naskah dalam ${executionDuration} detik.`);

        return res.status(200).json({
            status: 'success',
            duration: `${executionDuration}s`
        });

    } catch (error) {
        console.error('[WA-WEBHOOK] Fatal Error:', error);
        return res.status(500).json({ error: 'Internal Webhook Server Error', message: error.message });
    }
};

