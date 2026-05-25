const fs = require('fs');
const path = require('path');
const https = require('https');
const csv = require('csv-parser');
const puppeteer = require('puppeteer');

const CSV_FILE = path.join(__dirname, 'productos.csv');
const OUTPUT_DIR = path.join(__dirname, 'images');

// Crear directorio de salida si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

/**
 * Función auxiliar para descargar una imagen por URL
 */
const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Fallo en la descarga. Status: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
};

/**
 * Función principal de Scraping
 */
async function runScraper() {
    console.log('🚀 Iniciando SaaS Master Engine - Web Scraper v3.0');
    
    const productos = [];
    
    // 1. Leer archivo CSV
    if (!fs.existsSync(CSV_FILE)) {
        console.error(`❌ Archivo no encontrado: ${CSV_FILE}`);
        console.log('👉 Por favor, coloca tu archivo Excel guardado como CSV en la carpeta scripts/ con el nombre "productos.csv". Debe tener las columnas: "codigo_skv" y "nombre".');
        return;
    }

    console.log('📊 Leyendo CSV...');
    await new Promise((resolve, reject) => {
        fs.createReadStream(CSV_FILE)
          .pipe(csv())
          .on('data', (data) => productos.push(data))
          .on('end', resolve)
          .on('error', reject);
    });

    console.log(`✅ CSV cargado. Total de productos a procesar: ${productos.length}`);

    // 2. Inicializar Puppeteer (Modo Headless)
    console.log('🤖 Iniciando navegador virtual (Puppeteer)...');
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();
    // Configurar User Agent realista para evadir bloqueos
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    // 3. Procesar cada producto
    for (let i = 0; i < productos.length; i++) {
        const item = productos[i];
        const sku = item.codigo_skv || item.SKU;
        const nombre = item.nombre || item.Nombre;

        if (!sku || !nombre) {
            console.log(`⚠️ Fila ${i+1} ignorada: Falta SKU o Nombre.`);
            continue;
        }

        const filename = `${sku}.jpg`;
        const filepath = path.join(OUTPUT_DIR, filename);

        // Si la imagen ya existe, saltar
        if (fs.existsSync(filepath)) {
            console.log(`⏭️ [${sku}] Ya existe. Saltando...`);
            continue;
        }

        try {
            console.log(`🔍 [${sku}] Buscando: ${nombre}...`);
            
            // Término de búsqueda optimizado para ferretería y calidad
            const query = encodeURIComponent(`${nombre} ferreteria png OR jpg`);
            const url = `https://www.google.com/search?tbm=isch&q=${query}`;
            
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            
            // Pausa humana aleatoria (2 a 4 segundos) para evitar captchas de Google
            const delay = Math.floor(Math.random() * 2000) + 2000;
            await new Promise(r => setTimeout(r, delay));

            // Extraer la primera imagen de alta calidad
            const imageUrl = await page.evaluate(() => {
                // Selecciona las imágenes de los resultados
                const images = document.querySelectorAll('img');
                for (let img of images) {
                    const src = img.getAttribute('src');
                    const dataSrc = img.getAttribute('data-src');
                    // Ignorar logos o iconos base64
                    const finalSrc = dataSrc || src;
                    if (finalSrc && finalSrc.startsWith('http') && !finalSrc.includes('favicon')) {
                        return finalSrc;
                    }
                }
                return null;
            });

            if (imageUrl) {
                await downloadImage(imageUrl, filepath);
                console.log(`✅ [${sku}] Imagen guardada con éxito.`);
            } else {
                console.log(`❌ [${sku}] No se encontró imagen válida.`);
            }

        } catch (err) {
            console.error(`🚨 [${sku}] Error durante la búsqueda: ${err.message}`);
        }
    }

    console.log('🎉 Proceso de Scraping Finalizado. Revisa la carpeta /scripts/images.');
    await browser.close();
}

runScraper();
