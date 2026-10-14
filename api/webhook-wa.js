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
            const queryUrl = `${supabaseUrl}/rest/v1/profiles?or=(phone.eq.${senderPhone},phone.eq.${localZeroPhone})&status=eq.active&select=id,full_name,role,status,phone,gemini_api_key,n8n_webhook_url,n8n_auto_forward&limit=1`;
            
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
        if (['menu', 'help', 'bantuan', 'start', 'halo', 'hi'].includes(lowerPrompt)) {
            const memberName = activeMember.full_name || 'Member';
            const menuText = 
`🎬 *TRENDORA AI - DIRECTOR BOT* 🎬
_Halo Kak ${memberName}! Asisten Sutradara AI Anda siap membantu._

Kirimkan ide video Anda, AI akan otomatis membuatkan naskah, hook 3 detik, adegan visual, dan prompt AI lengkap!

📌 *Contoh Format Perintah:*
1️⃣ *Video Iklan:*
_\"iklan: Minuman Boba Brown Sugar - Anak muda/Gen Z - Segar, manis pas, promo beli 1 gratis 1\"_

2️⃣ *Video Cerita / Drama:*
_\"cerita: Seorang ayah rela lembur demi membelikan laptop impian anaknya\"_

3️⃣ *Video Animasi:*
_\"animasi: Robot kecil yang tersesat di hutan ajaib mencari baterai energi\"_

4️⃣ *Ketik Bebas (Natural):*
_\"Buatkan naskah reels 30 detik untuk jualan hijab anti kusut\"_

⚡ *Perintah Integrasi n8n:*
• \`n8n on\` : Aktifkan otomatis kirim hasil video ke n8n
• \`n8n off\` : Matikan otomatis kirim ke n8n
• \`n8n status\` : Cek status integrasi n8n saat ini

Silakan ketik ide video Anda sekarang! 🚀`;

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
1️⃣ Buka web: https://trendora.vercel.app
2️⃣ Klik menu *Gemini Key* (di pojok kanan atas)
3️⃣ Masukkan API Key Anda (Gratis dari Google AI Studio) lalu klik *Simpan*.

Setelah disimpan di web, bot WhatsApp ini otomatis aktif dan siap membuatkan naskah video untuk Anda! 🚀🎬`
            );
            return res.status(200).json({ status: 'no_gemini_key_prompted' });
        }

        // 5. Kirim Notifikasi Tunggu
        await sendWaReply(`⏳ *TRENDORA AI sedang merancang konsep video untuk Anda...*\n\n_"${userPrompt.slice(0, 100)}${userPrompt.length > 100 ? '...' : ''}"_\n\nEstimasi proses 5-10 detik. Tunggu sebentar ya kak! 🎬`);

        // 6. Generate Konsep & Naskah Video via Gemini AI
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
