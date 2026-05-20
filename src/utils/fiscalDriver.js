/**
 * fiscalDriver.js
 * 
 * Driver para la comunicación con el Agente Fiscal (C#) a través de WebSockets.
 * Implementa aislamiento, normalización y mecanismos de Fail-Safe.
 */

export function imprimirTicketFiscal(datosRaw) {
    return new Promise((resolve, reject) => {
        // 1. Normalización de Datos
        const datosNormalizados = {
            ...datosRaw,
            // Aseguramos que el cliente esté en mayúsculas
            cliente: datosRaw.cliente ? String(datosRaw.cliente).toUpperCase() : 'CONSUMIDOR FINAL',
            // Aseguramos que el pagoDivisas sea un float limpio
            pagoDivisas: parseFloat(datosRaw.pagoDivisas) || 0.0
        };

        let finalizado = false;

        // 2. Mecanismo de Seguridad (Fail-Safe): Timeout de 3000ms
        const timeoutId = setTimeout(() => {
            if (!finalizado) {
                finalizado = true;
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
                reject(new Error("TIMEOUT_FISCAL: El Agente Fiscal no respondió o la conexión superó los 3000ms."));
            }
        }, 3000);

        // 3. Aislamiento de Periféricos: Uso del WebSocket nativo
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            try {
                // Enviar el payload serializado
                ws.send(JSON.stringify(datosNormalizados));
                
                // 4. Ciclo de Vida: Cerrar la conexión tras 500ms
                setTimeout(() => {
                    if (!finalizado) {
                        finalizado = true;
                        clearTimeout(timeoutId);
                        ws.close();
                        resolve("Comando de impresión enviado con éxito al Agente Fiscal.");
                    }
                }, 500);

            } catch (error) {
                if (!finalizado) {
                    finalizado = true;
                    clearTimeout(timeoutId);
                    ws.close();
                    reject(new Error(`ERROR_ENVIO_FISCAL: Falló la serialización o envío de datos. Detalles: ${error.message}`));
                }
            }
        };

        ws.onmessage = (event) => {
            // Opcional: Si el agente de C# responde antes de los 500ms, podríamos capturarlo aquí
            console.log("[Fiscal Driver] Respuesta del Agente:", event.data);
        };

        ws.onerror = (error) => {
            if (!finalizado) {
                finalizado = true;
                clearTimeout(timeoutId);
                reject(new Error("ERROR_CONEXION_FISCAL: No se pudo conectar al Agente Fiscal en ws://localhost:8080. Verifique que el servicio C# esté ejecutándose."));
            }
        };
    });
}
