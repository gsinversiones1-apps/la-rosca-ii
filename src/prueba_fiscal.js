const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('✅ Conexión establecida. Enviando datos...');

    const facturaPrueba = {
        cliente: "Tornilleria La Rosca II - Test",
        pagoDivisas: 250.00
    };

    ws.send(JSON.stringify(facturaPrueba));

    setTimeout(() => {
        console.log('🚀 Enviado. ¡Revisa la terminal de C#!');
        process.exit();
    }, 1000);
});

ws.on('error', (err) => {
    console.error('❌ Error de conexión:', err.message);
});