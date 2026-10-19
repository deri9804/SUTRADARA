/**
 * TRENDORA AI - N8N DISPATCH PROXY (Vercel Serverless Function)
 * Berfungsi sebagai jembatan (proxy) aman antara Frontend Web dan Webhook n8n
 * Menghindari kendala browser CORS, Adblocker, dan menangani error status HTTP secara transparan.
 */

module.exports = async function handler(req, res) {
    // Set CORS headers agar frontend bisa memanggil endpoint ini tanpa hambatan
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { webhook_url, payload } = req.body || {};

    if (!webhook_url || !webhook_url.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid or missing webhook_url' });
    }

    try {
        const n8nResp = await fetch(webhook_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload || {})
        });

        const respText = await n8nResp.text();
        let respData;
        try {
            respData = JSON.parse(respText);
        } catch (_) {
            respData = { raw: respText };
        }

        if (!n8nResp.ok) {
            console.warn(`[N8N-PROXY] n8n returned error status ${n8nResp.status}:`, respText.slice(0, 200));
            return res.status(n8nResp.status).json({
                error: `n8n_status_${n8nResp.status}`,
                status: n8nResp.status,
                detail: respData,
                is_nginx_413: n8nResp.status === 413 || (respText && respText.includes('413 Request Entity Too Large'))
            });
        }

        return res.status(200).json({
            status: 'success',
            n8n_status: n8nResp.status,
            data: respData
        });
    } catch (err) {
        console.error('[N8N-PROXY] Error dispatching to n8n:', err.message);
        return res.status(502).json({
            error: 'n8n_dispatch_failed',
            message: err.message
        });
    }
};

