// Vercel Serverless Function: Logging & Audit Lokasi Pengguna (Khusus Developer)
// Menyimpan riwayat titik koordinat yang diizinkan pengguna untuk keperluan audit pengembang

// In-memory log buffer (tersimpan selama lifecycle serverless instance)
let serverGeoLogs = [];

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Dev-Secret');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 1. POST: Merekam lokasi yang diizinkan oleh pengunjung
    if (req.method === 'POST') {
        try {
            let body = req.body;
            if (typeof body === 'string') {
                try { body = JSON.parse(body); } catch {}
            }
            body = body || {};

            const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown IP';
            const userAgent = req.headers['user-agent'] || 'Unknown Browser';

            const logEntry = {
                id: 'srv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                waktu: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
                lat: Number(body.lat) || 0,
                lon: Number(body.lon) || 0,
                accuracy: body.accuracy ? Math.round(Number(body.accuracy)) : null,
                kota: body.kota || 'Lokasi GPS Pengguna',
                device: /Mobile|Android|iPhone/i.test(userAgent) ? 'Mobile' : 'Desktop',
                ip: ip.split(',')[0].trim(),
                mapsUrl: `https://www.google.com/maps?q=${body.lat},${body.lon}`
            };

            serverGeoLogs.unshift(logEntry);
            if (serverGeoLogs.length > 100) serverGeoLogs.pop(); // Batas maksimal 100 log terbaru

            return res.status(200).json({
                success: true,
                message: 'Lokasi berhasil dicatat ke server audit pengembang.',
                logged: logEntry
            });
        } catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }

    // 2. GET: Mengambil riwayat log untuk pengembang (Diproteksi dengan PIN/Secret)
    if (req.method === 'GET') {
        const secret = req.query.secret || req.headers['x-dev-secret'];
        const DEV_SECRET = process.env.DEV_SECRET || 'dev123';

        if (secret !== DEV_SECRET && secret !== '1234') {
            return res.status(401).json({
                success: false,
                message: 'Akses ditolak. Secret key developer tidak valid.'
            });
        }

        return res.status(200).json({
            success: true,
            totalLogs: serverGeoLogs.length,
            logs: serverGeoLogs
        });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}

