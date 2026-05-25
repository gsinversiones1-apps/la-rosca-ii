/**
 * Página Principal del Punto de Venta (POS)
 */

export const renderPOSPage = () => {
    return `
    <div id="view-pos" class="view-content animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <!-- WOW Factor: Experiencia 3D (Tornillo Nativo) -->
        <div id="pos-screw-wrapper" class="w-full h-64 sm:h-80 md:h-[400px] rounded-2xl relative overflow-hidden mb-8 border border-gold/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] flex items-center justify-center shrink-0" style="background: linear-gradient(145deg, #1A253C, #0F1626);">
            <!-- Skeleton Screen (Spinner Dorado) -->
            <div id="pos-screw-skeleton" class="absolute inset-0 flex flex-col items-center justify-center bg-transparent z-10 transition-opacity duration-700">
                <div class="w-14 h-14 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-3"></div>
                <span class="text-[10px] font-bold text-gold uppercase tracking-widest animate-pulse">Cargando 3D...</span>
            </div>
            <!-- Div donde se renderizará el canvas de Three.js -->
            <div id="pos-screw-container" class="w-full h-full relative z-20 pointer-events-auto" style="background: transparent; opacity: 0; transition: opacity 1s ease-in;"></div>
        </div>

        <div class="flex flex-col gap-4 md:flex-row md:justify-between md:items-end mb-6 min-w-0 w-full">
            <div class="min-w-0">
                <h2 class="font-headline text-lg text-white uppercase tracking-wider border-l-4 border-gold pl-3 truncate">Catálogo de Productos</h2>
                <p id="results-count" class="text-[11px] text-slate-500 mt-1 uppercase tracking-wide">Cargando productos...</p>
            </div>
            <div class="flex flex-nowrap gap-2 items-end w-full md:w-auto min-w-0">
                <div class="flex-1 min-w-0 md:w-48">
                    <label class="block text-[8px] font-bold text-slate-500 uppercase mb-1 tracking-widest truncate">Filtrar por Categoría</label>
                    <select id="filter-category" class="w-full bg-dark-gray border border-industrial-gray text-white text-[10px] p-2 focus:border-gold outline-none uppercase font-bold truncate">
                        <option value="all">Todas las categorías</option>
                        <option>Drywall</option>
                        <option>Automotriz</option>
                        <option>Allen</option>
                        <option>General</option>
                    </select>
                </div>
                <button id="refresh-db" class="p-2 border border-industrial-gray hover:bg-navy hover:text-gold text-slate-400 transition-colors h-[34px] w-9 flex-shrink-0 flex items-center justify-center">
                    <span class="material-symbols-outlined text-sm">refresh</span>
                </button>
            </div>
        </div>
        <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            <!-- Los ProductCard se insertarán aquí dinámicamente -->
        </div>
    </div>
    `;
};
