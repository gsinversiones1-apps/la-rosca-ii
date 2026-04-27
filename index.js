require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const https = require('https');
const axios = require('axios');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const localFilePath = path.join(__dirname, 'inventario_local.json');
const ventasFilePath = path.join(__dirname, 'ventas.json');
const configFilePath = path.join(__dirname, 'config.json');

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'tu_url_aqui' || supabaseKey === 'tu_anon_key_aqui') {
    console.error('ERROR: Debes configurar SUPABASE_URL y SUPABASE_KEY en el archivo .env con valores reales.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

let tasaActual = 36.50; // Variable global para la tasa
let myTenantId = 'ROSC-001-VNZ'; // ID de Tenant por defecto

// Carga inicial de configuración (Tenant ID y Tasa)
if (fs.existsSync(configFilePath)) {
    try {
        const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
        if (config.tasaBCV) tasaActual = config.tasaBCV;
        if (config.tenant_id) myTenantId = config.tenant_id;
        console.log(`[Config] Modo Multitenant activo: ${myTenantId}`);
    } catch (e) {
        console.error('Error al cargar config.json:', e.message);
    }
}

// --- Orquestación de IA (Cerebro: Gemini) ---
async function getAIResponse(prompt, data = "") {
    const combinedInput = `${prompt}\n\nDATOS:\n${data}`;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const geminiModel = "gemini-3-flash-preview"; // Versión vigente del modelo Flash en 2026
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;

    if (!geminiKey) {
        return "❌ Error: No se ha configurado una API Key para Gemini en el archivo .env";
    }

    try {
        console.log(`[IA] Consultando a Gemini (${geminiModel})...`);
        const response = await axios.post(geminiUrl, {
            contents: [{ parts: [{ text: combinedInput }] }]
        });

        if (response.data && response.data.candidates && response.data.candidates[0].content) {
            return response.data.candidates[0].content.parts[0].text;
        } else {
            console.error("Respuesta inesperada de Gemini:", JSON.stringify(response.data));
            return "No se pudo obtener una respuesta válida de la IA.";
        }

    } catch (error) {
        console.error(`❌ Error al consultar Gemini:`, error.response ? error.response.data : error.message);
        return "Hubo un problema al procesar la solicitud con Gemini.";
    }
}

// --- Gestión de Tasa BCV (Híbrida) ---
const ALV = { verde: '\x1b[32m', amarillo: '\x1b[33m', rojo: '\x1b[31m', reset: '\x1b[0m' };

async function consultarAPIDolar(url, parser) {
    try {
        const response = await axios.get(url, { timeout: 4000 });
        return parser(response.data);
    } catch (e) {
        throw new Error(`Fallo en ${url}: ${e.message}`);
    }
}

async function obtenerTasaBCV() {
    let tasa = 36.50;

    // 1. Cargar desde config local inmediatamente (Offline-First)
    if (fs.existsSync(configFilePath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
            if (config.tasaBCV) tasa = config.tasaBCV;
        } catch (e) { /* usar default 36.50 */ }
    }

    console.log(`${ALV.amarillo}--- Sincronizando Tasa BCV (Modo Híbrido) ---${ALV.reset}`);

    // Definición de fuentes (A = CriptoDolar, B = DolarAPI)
    const fuentes = [
        {
            nombre: 'PyDolarVE (Principal)',
            url: 'https://pydolarve.org/api/v1/engine?currency=usd',
            parser: (data) => data.monitors?.bcv?.price
        },
        {
            nombre: 'DolarAPI (Respaldo)',
            url: 'https://ve.dolarapi.com/v1/dolares/oficial',
            parser: (data) => data.promedio
        }
    ];

    let exito = false;
    for (const fuente of fuentes) {
        try {
            const valor = await consultarAPIDolar(fuente.url, fuente.parser);
            if (valor) {
                tasa = parseFloat(valor);
                const configExistente = fs.existsSync(configFilePath) ? JSON.parse(fs.readFileSync(configFilePath, 'utf8')) : {};
                const config = {
                    ...configExistente,
                    tasaBCV: tasa,
                    últimaActualización: new Date().toLocaleString(),
                    fuente: fuente.nombre
                };
                fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
                console.log(`${ALV.verde}✓ Tasa actualizada exitosamente desde ${fuente.nombre}: ${tasa} Bs/USD${ALV.reset}`);
                exito = true;
                break; // Salimos al primer éxito
            }
        } catch (e) {
            console.log(`${ALV.amarillo}⚠️ ${fuente.nombre} no disponible. Intentando siguiente...${ALV.reset}`);
        }
    }

    if (!exito) {
        console.log(`${ALV.amarillo}ℹ️ Usando tasa de respaldo local: ${tasa} Bs.${ALV.reset}`);
    }

    tasaActual = tasa;
    return tasa;
}

async function actualizarTasaManual() {
    console.log('\n--- Actualizar Tasa BCV ---');
    const actual = await obtenerTasaBCV();
    console.log(`Tasa actual: ${actual} Bs/USD`);

    const nueva = await pregunta('Monto de la nueva tasa (Bs.): ');
    const tasaNum = parseFloat(nueva);

    if (isNaN(tasaNum) || tasaNum <= 0) {
        console.log('❌ Tasa no válida.');
        return;
    }

    const configExistente = fs.existsSync(configFilePath) ? JSON.parse(fs.readFileSync(configFilePath, 'utf8')) : {};
    const config = {
        ...configExistente,
        tasaBCV: tasaNum,
        últimaActualización: new Date().toLocaleString()
    };
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    console.log(`✅ Tasa actualizada a ${tasaNum} Bs/USD (Tenant: ${myTenantId}).`);
}

// Función para mostrar la tabla de forma consistente
function mostrarTabla(data) {
    if (!data || data.length === 0) {
        console.log('No hay datos para mostrar.');
        return;
    }

    // Formateamos los datos para la tabla
    const tablaProductos = data.map(producto => ({
        'CÓDIGO': producto.codigo_skv,
        'DESCRIPCIÓN': producto.nombre,
        'STOCK': producto.stock ? producto.stock.toLocaleString('es-VE') : '0',
        'PRECIO ($)': `$ ${Number(producto.precio_usd || 0).toFixed(2)}`
    }));

    console.table(tablaProductos);
}

async function listarTornillos() {
    console.log('--- Listado de 10 Tornillos (Productos) ---');

    try {
        // Intentamos consultar los 10 primeros tornillos de Supabase
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('tenant_id', myTenantId)
            .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
            // Si el fetch es exitoso, guardamos el inventario localmente
            fs.writeFileSync(localFilePath, JSON.stringify(data, null, 2));
            console.log('✓ Datos actualizados desde Supabase y guardados localmente.');
            mostrarTabla(data);
        } else {
            console.log('No se encontraron productos en la tabla remota.');
            // Intentamos cargar local si no hay datos remotos (opcional, pero seguro)
            cargarDesdeRespaldoLocal();
        }

    } catch (error) {
        console.error('⚠️ Error al conectar con Supabase:', error.message);
        cargarDesdeRespaldoLocal();
    }
}

function cargarDesdeRespaldoLocal() {
    console.log('--- Cargando desde respaldo local (Modo Offline) ---');
    if (fs.existsSync(localFilePath)) {
        try {
            const localData = JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
            mostrarTabla(localData);
            console.log('✓ Se ha cargado el inventario local con éxito.');
        } catch (readError) {
            console.error('Error al leer el archivo local:', readError.message);
        }
    } else {
        console.error('No se encontró un archivo de inventario local para respaldo.');
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function pregunta(texto) {
    return new Promise((resolve) => rl.question(texto, resolve));
}

async function simularVenta() {
    console.log('\n--- Nueva Sesión de Venta ---');

    if (!fs.existsSync(localFilePath)) {
        console.error('Error: No hay inventario local cargado. Por favor, lista los productos primero.');
        return;
    }

    try {
        const inventario = JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
        const carrito = [];
        let continuarAgregando = true;

        console.log(`💵 Tasa de cambio (BCV): ${tasaActual} Bs.`);

        while (continuarAgregando) {
            let busquedaRaw = await pregunta('Buscar producto (Código o Nombre): ');
            const busqueda = busquedaRaw.trim().toLowerCase();

            if (!busqueda) {
                console.log('Por favor, ingrese un término de búsqueda.');
                continue;
            }

            // 1. Buscador flexible
            // Intentar coincidencia exacta (case-insensitive) por código
            let producto = inventario.find(p => (p.codigo_skv || '').toLowerCase() === busqueda);

            if (!producto) {
                // Búsqueda parcial en nombre o código
                const coincidencias = inventario.filter(p => {
                    const nombre = (p.nombre || '').toLowerCase();
                    const codigo = (p.codigo_skv || '').toLowerCase();
                    return nombre.includes(busqueda) || codigo.includes(busqueda);
                });

                if (coincidencias.length === 0) {
                    console.log(`❌ No se encontraron productos para: "${busquedaRaw}"`);
                    const reintentar = await pregunta('¿Intentar con otro término? (s/n): ');
                    if (reintentar.toLowerCase() !== 's') break;
                    continue;
                }

                if (coincidencias.length === 1) {
                    producto = coincidencias[0];
                    console.log(`✓ Producto seleccionado: ${producto.nombre}`);
                } else {
                    console.log('\nCoincidencias encontradas:');
                    console.table(coincidencias.map((p, index) => ({
                        '#': index + 1,
                        'CÓDIGO': p.codigo_skv,
                        'DESCRIPCIÓN': p.nombre,
                        'STOCK': p.stock
                    })));

                    const seleccion = await pregunta('Seleccione el número del producto (o 0 para cancelar): ');
                    const index = parseInt(seleccion) - 1;

                    if (index >= 0 && index < coincidencias.length) {
                        producto = coincidencias[index];
                    } else {
                        console.log('Selección cancelada.');
                        continue;
                    }
                }
            }

            // 2. Cantidad y validación de stock
            const cantidadStr = await pregunta(`Cantidad para ${producto.nombre} (Disponible: ${producto.stock}): `);
            const cantidad = parseInt(cantidadStr);

            if (isNaN(cantidad) || cantidad <= 0) {
                console.log('❌ Cantidad no válida.');
            } else if (producto.stock < cantidad) {
                console.log(`❌ Stock insuficiente. Disponible: ${producto.stock}`);
            } else {
                // Agregar al carrito
                producto.stock -= cantidad; // Restar del inventario en memoria
                const subtotal = cantidad * (producto.precio_usd || 0);

                carrito.push({
                    id: producto.id,
                    codigo: producto.codigo_skv,
                    nombre: producto.nombre,
                    cantidad: cantidad,
                    precio_unitario: producto.precio_usd,
                    subtotal: subtotal
                });

                console.log(`✓ Agregado: ${producto.nombre} x${cantidad} ($ ${subtotal.toFixed(2)})`);
            }

            const respuesta = await pregunta('\n¿Desea agregar otro producto? (s/n): ');
            continuarAgregando = respuesta.toLowerCase() === 's';
        }

        if (carrito.length === 0) {
            console.log('Venta cancelada (carrito vacío).');
            return;
        }

        // 3. Finalizar Venta y Persistencia
        const totalVentaUSD = carrito.reduce((sum, item) => sum + item.subtotal, 0);
        const totalVentaBS = totalVentaUSD * tasaActual;
        const folio = `F-${Date.now().toString().slice(-6)}`;
        const fecha = new Date().toLocaleString('es-VE');

        const ventaUnificada = {
            folio: folio,
            fecha: fecha,
            items: carrito,
            total_usd: totalVentaUSD,
            total_bs: totalVentaBS,
            tasa_bcv: tasaActual
        };

        // Guardar Inventario actualizado
        fs.writeFileSync(localFilePath, JSON.stringify(inventario, null, 2));

        // Guardar Historial
        let historial = [];
        if (fs.existsSync(ventasFilePath)) {
            try {
                historial = JSON.parse(fs.readFileSync(ventasFilePath, 'utf8'));
            } catch (e) { historial = []; }
        }
        historial.push(ventaUnificada);
        fs.writeFileSync(ventasFilePath, JSON.stringify(historial, null, 2));

        console.log('\n==============================');
        console.log(`✅ VENTA REALIZADA - FOLIO: ${folio}`);
        console.log(`Fecha: ${fecha}`);
        console.log(`Tasa: ${tasaActual} Bs.`);
        console.log('------------------------------');
        carrito.forEach(item => {
            const subBs = item.subtotal * tasaActual;
            console.log(`${item.nombre.padEnd(25)} x${item.cantidad.toString().padEnd(3)} $ ${item.subtotal.toFixed(2).padStart(7)} (${subBs.toFixed(2)} Bs.)`);
        });
        console.log('------------------------------');
        console.log(`TOTAL A PAGAR (USD):`.padEnd(30) + `$ ${totalVentaUSD.toFixed(2).padStart(8)}`);
        console.log(`TOTAL A PAGAR (Bs.):`.padEnd(30) + `${totalVentaBS.toFixed(2).padStart(10)} Bs.`);
        console.log('==============================\n');

        // Alerta de Stock Inteligente para ventas grandes o inusuales
        if (totalVentaUSD > 50 || carrito.some(item => item.cantidad > 50)) {
            console.log('[IA] Analizando impacto en stock...');
            const prompt = "Actúa como un experto en inventario. Analiza esta venta y genera una alerta corta (máximo 2 líneas) si hay riesgo de stock o recomendaciones de reposición.";
            const aiAlert = await getAIResponse(prompt, JSON.stringify(ventaUnificada.items));
            console.log(`🤖 Alerta IA: ${aiAlert}\n`);
        }

    } catch (error) {
        console.error('Error durante la simulación de venta:', error.message);
    }
}

async function sincronizarInventario() {
    console.log('\n--- Sincronizando con Supabase ---');

    if (!fs.existsSync(localFilePath)) {
        console.log('No hay inventario local para sincronizar.');
        return;
    }

    try {
        const inventarioLocal = JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
        let exitos = 0;
        let errores = 0;

        console.log(`Subiendo cambios de ${inventarioLocal.length} productos...`);

        for (const producto of inventarioLocal) {
            const { error } = await supabase
                .from('productos')
                .update({ stock: producto.stock })
                .eq('id', producto.id);

            if (error) {
                console.error(`❌ Error al sincronizar ${producto.codigo_skv}:`, error.message);
                errores++;
            } else {
                exitos++;
            }
        }

        console.log('\n------------------------------');
        console.log('✅ PROCESO DE SINCRONIZACIÓN FINALIZADO');
        console.log(`✓ Éxitos: ${exitos}`);
        console.log(`❌ Errores: ${errores}`);
        console.log('------------------------------\n');

    } catch (error) {
        console.error('Error crítico durante la sincronización:', error.message);
    }
}

function verHistorialVentas() {
    console.log('\n--- Historial de Ventas (Folios) ---');

    if (!fs.existsSync(ventasFilePath)) {
        console.log('No hay registros de ventas aún.');
        return;
    }

    try {
        const historial = JSON.parse(fs.readFileSync(ventasFilePath, 'utf8'));

        if (historial.length === 0) {
            console.log('El historial está vacío.');
            return;
        }

        const tablaHistorial = historial.map(v => ({
            'FOLIO': v.folio || 'N/A',
            'FECHA': v.fecha,
            'ÍTEMS': v.items ? v.items.length : 1,
            'TOTAL ($)': `$ ${(v.total_usd || v.total || 0).toFixed(2)}`,
            'TOTAL (Bs.)': `${(v.total_bs || 0).toFixed(2)} Bs.`
        }));

        console.table(tablaHistorial);

        console.log('\nPara ver el detalle de un folio, abra el archivo ventas.json.');

    } catch (error) {
        console.error('Error al leer el historial:', error.message);
    }
}

async function generarReporteInteligente() {
    console.log('\n--- Generando Reporte Inteligente de Inventario ---');

    if (!fs.existsSync(localFilePath)) {
        console.log('No hay inventario local para analizar.');
        return;
    }

    try {
        const inventario = JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
        const ventas = fs.existsSync(ventasFilePath) ? JSON.parse(fs.readFileSync(ventasFilePath, 'utf8')) : [];

        const dataStr = JSON.stringify({ inventario, resumen_ventas: ventas.slice(-5) });

        const prompt = "Analiza las tendencias de inventario y ventas recientes. Identifica productos críticos (bajo stock) y sugiere qué comprar pronto. Devuelve un análisis profesional y resumido.";

        const reporte = await getAIResponse(prompt, dataStr);

        console.log('\n=====================================');
        console.log('📊 INFORME DE TENDENCIAS (Gemini)');
        console.log('=====================================');
        console.log(reporte);
        console.log('=====================================\n');

    } catch (error) {
        console.error('Error al generar el reporte inteligente:', error.message);
    }
}

async function ejecutarAuditoriaInventario() {
    console.log('\n--- Iniciando Auditoría IA de Nombres y Stock ---');

    if (!fs.existsSync(localFilePath)) {
        console.log('No hay inventario local para auditar.');
        return;
    }

    try {
        const inventario = JSON.parse(fs.readFileSync(localFilePath, 'utf8'));

        // Enviamos los datos para análisis
        const prompt = `Analiza este inventario de tornillería y busca:
1. Errores ortográficos o inconsistencias en los nombres de los productos.
2. Anomalías en niveles de stock (ej. stock cero o negativo).
3. Recomendaciones de corrección de nombres.
Muestra los hallazgos en una lista clara.`;

        const auditoria = await getAIResponse(prompt, JSON.stringify(inventario));

        console.log('\n=====================================');
        console.log('🔍 RESULTADOS DE LA AUDITORÍA (IA)');
        console.log('=====================================');
        console.log(auditoria);
        console.log('=====================================\n');

    } catch (error) {
        console.error('Error durante la auditoría:', error.message);
    }
}

async function iniciarApp() {
    console.log('--- Iniciando Sistema Tornillería La Rosca II ---');
    await obtenerTasaBCV(); // Inicializar tasa al arrancar

    let salir = false;

    while (!salir) {
        console.log('\n--- MENÚ PRINCIPAL ---');
        console.log('1. Listar productos (Cargar/Actualizar local)');
        console.log('2. Realizar venta (Local)');
        console.log('3. Sincronizar con Supabase (Subir cambios)');
        console.log('4. Ver historial de ventas');
        console.log('5. Generar reporte inteligente (IA)');
        console.log('6. Ejecutar auditoría de inventario (IA)');
        console.log('7. Actualizar tasa manual');
        console.log('8. Salir');

        const opcion = await pregunta('Seleccione una opción: ');

        switch (opcion) {
            case '1':
                await listarTornillos();
                break;
            case '2':
                await simularVenta();
                break;
            case '3':
                await sincronizarInventario();
                break;
            case '4':
                verHistorialVentas();
                break;
            case '5':
                await generarReporteInteligente();
                break;
            case '6':
                await ejecutarAuditoriaInventario();
                break;
            case '7':
                await actualizarTasaManual();
                break;
            case '8':
                salir = true;
                break;
            default:
                console.log('Opción no válida.');
                break;
        }
    }

    console.log('Gracias por usar el sistema.');
    rl.close();
}

iniciarApp();

