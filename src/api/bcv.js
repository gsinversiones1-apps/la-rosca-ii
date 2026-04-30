/**
 * Gestión de Tasa BCV y Dólar
 */

export const fetchTasaBCV = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const data = await res.json();
        return data.promedio || 36.50; // Respaldo si no hay promedio
    } catch (e) {
        console.warn('Error obteniendo tasa BCV:', e);
        return 36.50; // Valor por defecto
    }
};
