/**
 * Gestión de Tasa BCV y Dólar
 */

export const fetchTasaBCV = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        // Consultamos nuestra propia API que hace el scraping del BCV
        const res = await fetch('/api/get-bcv', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const data = await res.json();
        
        if (data.rate) {
            console.log(`[BCV] Tasa obtenida desde ${data.source}: ${data.rate}`);
            localStorage.setItem('last_bcv_rate', data.rate);
            return data.rate;
        }
        
        throw new Error('Respuesta de API inválida');
    } catch (e) {
        console.warn('Error obteniendo tasa BCV, usando caché o backup:', e);
        const cached = localStorage.getItem('last_bcv_rate');
        return cached ? parseFloat(cached) : 36.50;
    }
};
