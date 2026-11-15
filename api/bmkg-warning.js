// Vercel Serverless Function: Proxy Peringatan Dini BMKG
// Mengatasi CORS dan menyediakan cache untuk permintaan peringatan BMKG

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const province = req.query.prov || '';
        // BMKG Autogempa & Cuaca Ekstrem endpoints
        const bmkgUrl = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
        
        const response = await fetch(bmkgUrl, {
            headers: {
                'User-Agent': 'Atmosferia-Weather-Portal/2.0 (https://atmosferia.vercel.app)'
            },
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            throw new Error(`BMKG responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        return res.status(200).json({
            success: true,
            source: 'Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)',
            timestamp: new Date().toISOString(),
            gempa: data.Infogempa ? data.Infogempa.gempa : null,
            warning: null
        });
    } catch (error) {
        // Fallback response jika BMKG offline / timeout
        return res.status(200).json({
            success: false,
            message: error.message,
            source: 'BMKG Gateway Fallback',
            warning: null
        });
    }
}

