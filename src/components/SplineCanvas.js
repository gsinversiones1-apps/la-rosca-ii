/**
 * Componente 3D Inteligente (Vanilla JS Web Component)
 */

export const renderSplineCanvas = (sceneUrl) => {
    const defaultScene = "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode";
    const url = sceneUrl || defaultScene;

    // Inyectar dinámicamente el Web Component de Spline si no existe en el DOM
    if (!document.getElementById('spline-script')) {
        const script = document.createElement('script');
        script.type = 'module';
        script.id = 'spline-script';
        script.src = 'https://unpkg.com/@splinetool/viewer@1.0.9/build/spline-viewer.js';
        
        // Manejo de caída de red (Offline Fallback)
        script.onerror = () => {
            console.warn('⚠️ Spline viewer no pudo cargar por red. Mostrando fallback offline.');
            const fallback = document.getElementById('spline-fallback-msg');
            const spinner = document.getElementById('spline-spinner');
            if (fallback) fallback.style.display = 'block';
            if (spinner) spinner.style.display = 'none';
        };

        script.onload = () => {
            // Opcional: Ocultar el spinner en cuanto el script carga, 
            // aunque el visor internamente también tiene un loading logo.
            const spinner = document.getElementById('spline-spinner');
            if (spinner) spinner.style.display = 'none';
        };
        
        document.head.appendChild(script);
    }

    return `
    <div class="w-full h-64 sm:h-80 md:h-[400px] rounded-2xl relative overflow-hidden mb-8 border border-white/5 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]" 
         style="background: linear-gradient(145deg, #0f172a 0%, #020617 100%);">
        
        <!-- Efecto Pulso de fondo estilo Neón -->
        <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at center, #3b82f6 0%, transparent 70%); animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
        
        <!-- Mensajes de estado (Spinner o Error) centrado absoluto -->
        <div class="absolute inset-0 flex flex-col justify-center items-center pointer-events-none z-0">
            <div id="spline-spinner" class="flex flex-col items-center gap-4">
                <div class="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                <span class="text-slate-400 font-medium tracking-widest uppercase text-[10px]">Iniciando Motor 3D...</span>
            </div>
            
            <div id="spline-fallback-msg" style="display: none;" class="text-center z-10 px-4">
                <svg class="w-12 h-12 text-blue-500 mb-4 opacity-80 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
                <h3 class="text-white text-lg font-medium tracking-wide mb-2 font-sans">Preparando Experiencia 3D</h3>
                <p class="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
                    El entorno tridimensional se activará al restablecerse la conexión de red.
                </p>
            </div>
        </div>

        <!-- Web Component Oficial de Spline -->
        <spline-viewer 
            url="${url}" 
            class="absolute inset-0 w-full h-full z-10"
        ></spline-viewer>
        
        <style>@keyframes pulse { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.3; } }</style>
    </div>
    `;
};
