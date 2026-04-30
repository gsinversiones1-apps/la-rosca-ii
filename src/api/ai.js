/**
 * Orquestación de IA (Cerebro: Gemini)
 */

export const getAIResponse = async (prompt, data = "") => {
    const combinedInput = `${prompt}\n\nDATOS:\n${data}`;
    
    // En un SaaS real, esto vendría de un backend seguro. 
    // Para esta demo/master code, usamos la key del entorno.
    const geminiKey = "PONER_API_KEY_AQUI"; 
    const geminiModel = "gemini-3-flash-preview";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;

    try {
        console.log(`[IA] Consultando a Gemini (${geminiModel})...`);
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: combinedInput }] }]
            })
        });

        const result = await response.json();

        if (result.candidates && result.candidates[0].content) {
            return result.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Respuesta inesperada de la IA");
        }

    } catch (error) {
        console.error(`❌ Error en IA:`, error.message);
        return "Hubo un problema al procesar la solicitud con la IA.";
    }
};
