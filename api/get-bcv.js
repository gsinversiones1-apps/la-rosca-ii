const axios = require('axios');

/**
 * Función de servidor para obtener la tasa oficial directamente del BCV
 */
module.exports = async (req, res) => {
    // Permitir CORS para que nuestro frontend pueda consultar esta API
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        console.log('Consultando sitio oficial del BCV...');
        
        // Usamos un User-Agent de navegador real para evitar bloqueos básicos
        const response = await axios.get('https://www.bcv.org.ve/', {
            timeout: 8000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        const html = response.data;

        // Buscamos el contenedor del Dólar usando Regex
        // El BCV usa una estructura como: <div id="dolar"> <strong> 489,55470000 </strong>
        const dolarMatch = html.match(/id="dolar"[\s\S]*?<strong>\s*([\d,.]+)\s*<\/strong>/);

        if (dolarMatch && dolarMatch[1]) {
            let rateStr = dolarMatch[1].replace(',', '.').trim();
            const rate = parseFloat(rateStr);

            if (!isNaN(rate)) {
                console.log(`Tasa encontrada: ${rate}`);
                return res.status(200).json({
                    source: 'BCV Oficial (Directo)',
                    rate: rate,
                    timestamp: new Date().toISOString()
                });
            }
        }

        throw new Error('No se pudo encontrar el valor del dólar en el HTML del BCV');

    } catch (error) {
        console.error('Error en get-bcv:', error.message);
        
        // Fallback: Si el BCV bloquea la IP de Vercel, usamos DolarAPI como último recurso
        try {
            const fallbackRes = await axios.get('https://ve.dolarapi.com/v1/dolares/oficial');
            return res.status(200).json({
                source: 'DolarAPI (Fallback)',
                rate: fallbackRes.data.promedio,
                timestamp: new Date().toISOString(),
                error: error.message
            });
        } catch (fError) {
            return res.status(500).json({ error: 'Fallo total al obtener tasa' });
        }
    }
};
