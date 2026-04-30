import React, { useState, useEffect, useRef } from 'react';

const SplineCanvas = ({ sceneUrl, className = '' }) => {
  const [SplineComponent, setSplineComponent] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // Importación dinámica para evitar que la app falle si la librería no está instalada aún
    import(/* @vite-ignore */ '@splinetool/react-spline')
      .then((module) => {
        if (isMounted) {
          setSplineComponent(() => module.default);
        }
      })
      .catch((error) => {
        console.warn('⚠️ Esperando a que las dependencias de Spline se instalen.', error);
        if (isMounted) setLoadError(true);
      });

    return () => { isMounted = false; };
  }, []);

  // Vista de error/placeholder elegante
  if (loadError) {
    return (
      <div 
        className={`w-full h-full min-h-[400px] flex flex-col justify-center items-center rounded-2xl relative overflow-hidden ${className}`}
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #020617 100%)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
        }}
      >
        {/* Efecto de pulso en el fondo */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #3b82f6 0%, transparent 70%)', animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
        
        <div className="z-10 flex flex-col items-center">
          <svg className="w-12 h-12 text-blue-500 mb-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
          <h3 className="text-white text-lg font-medium tracking-wide mb-2 font-sans">Preparando Experiencia 3D</h3>
          <p className="text-slate-400 text-sm max-w-xs text-center leading-relaxed">
            El entorno tridimensional se activará en cuanto se restablezca la red y finalice la descarga de <code className="text-blue-400 bg-blue-900/30 px-1 py-0.5 rounded text-xs">@splinetool</code>.
          </p>
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.3; } }`}</style>
      </div>
    );
  }

  // Estado de carga inicial de la librería
  if (!SplineComponent) {
    return (
      <div 
        className={`w-full h-full min-h-[400px] flex justify-center items-center rounded-2xl bg-slate-900 ${className}`}
        style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-slate-400 font-medium tracking-widest uppercase text-xs">Cargando motor 3D...</span>
        </div>
      </div>
    );
  }

  // URL por defecto con la escena
  const defaultScene = "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode";

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full min-h-[400px] rounded-2xl overflow-hidden relative ${className}`}
      style={{
        background: 'transparent',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      <SplineComponent scene={sceneUrl || defaultScene} />
      
      {/* Overlay opcional para integrar mejor el canvas con tu UI */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl border border-white/5" style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}></div>
    </div>
  );
};

export default SplineCanvas;
