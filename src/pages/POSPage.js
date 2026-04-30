/**
 * Página Principal del Punto de Venta (POS)
 */

import { renderSplineCanvas } from '../components/SplineCanvas.js';

export const renderPOSPage = () => {
    return `
    <div id="view-pos" class="view-content animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <!-- WOW Factor: Experiencia 3D (Se esconde si hay error de red, pero muestra el elegante placeholder) -->
        ${renderSplineCanvas()}

        <div class="flex justify-between items-end mb-6">
            <div>
                <h2 class="font-headline text-lg text-white uppercase tracking-wider border-l-4 border-gold pl-3">Catálogo de Productos</h2>
                <p id="results-count" class="text-[11px] text-slate-500 mt-1 uppercase tracking-wide">Cargando productos...</p>
            </div>
            <div class="flex gap-4">
                <div class="w-48">
                    <label class="block text-[8px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Filtrar por Categoría</label>
                    <select id="filter-category" class="w-full bg-dark-gray border border-industrial-gray text-white text-[10px] p-2 focus:border-gold outline-none uppercase font-bold">
                        <option value="all">Todas las categorías</option>
                        <option>Drywall</option>
                        <option>Automotriz</option>
                        <option>Allen</option>
                        <option>General</option>
                    </select>
                </div>
                <button id="refresh-db" class="p-2 border border-industrial-gray hover:bg-navy hover:text-gold text-slate-400 transition-colors self-end">
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
