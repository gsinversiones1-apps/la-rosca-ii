/**
 * Página de Gestión de Inventario
 */

export const renderInventoryPage = (userRole) => {
    const btnNewProduct = userRole === 'admin' 
        ? `<button id="btn-add-product" class="btn-gold-premium px-6 py-3 font-headline text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#E5C158] transition-all shadow-lg active:translate-y-1 active:shadow-none">
                NUEVO PRODUCTO <span class="material-symbols-outlined text-sm font-black">add_box</span>
            </button>`
        : '';

    return `
    <div id="view-inventory" class="view-content animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
                <h2 class="font-headline text-lg text-white uppercase tracking-wider border-l-4 border-gold pl-3">Gestión de Inventario</h2>
                <p class="text-[11px] text-slate-500 mt-1 uppercase tracking-wide">Administra tus productos, precios y existencias</p>
            </div>
            ${btnNewProduct}
        </div>

        <div class="bg-navy-premium border border-industrial-gray shadow-2xl table-responsive-wrapper overflow-hidden">
            <table class="w-full text-left min-w-[600px] md:min-w-full">
                <thead>
                    <tr class="bg-dark-gray/50 border-b border-industrial-gray text-[10px] font-bold text-gold uppercase tracking-widest">
                        <th class="px-6 py-4 hidden md:table-cell">SKU / Código</th>
                        <th class="px-6 py-4">Producto</th>
                        <th class="px-6 py-4 hidden sm:table-cell">Categoría</th>
                        <th class="px-6 py-4">Precio (USD)</th>
                        <th class="px-6 py-4">Stock</th>
                        <th class="px-6 py-4 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody id="inventory-table-body" class="text-xs text-white">
                    <!-- Las filas se insertarán dinámicamente -->
                </tbody>
            </table>
        </div>
    </div>

    <!-- MODAL DE NUEVO PRODUCTO (Solo Admin) -->
    ${userRole === 'admin' ? `
    <div id="modal-add-product" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-300">
        <div class="bg-navy border border-gold/30 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden transform scale-95 transition-transform duration-300" id="modal-add-product-content">
            <div class="p-4 border-b border-industrial-gray flex justify-between items-center bg-dark-gray/50">
                <h3 id="modal-product-title" class="text-gold font-headline text-sm uppercase tracking-widest font-black">Registrar Nuevo Producto</h3>
                <button id="btn-close-modal-product" class="text-slate-400 hover:text-white transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <form id="form-add-product" class="p-6 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2 sm:col-span-1">
                        <label class="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">SKU / Código</label>
                        <input type="text" id="add-prod-sku" required class="w-full bg-black/50 border border-industrial-gray rounded px-3 py-2 text-xs text-white focus:border-gold outline-none uppercase font-mono" placeholder="Ej: AL-01">
                    </div>
                    <div class="col-span-2 sm:col-span-1">
                        <label class="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Categoría</label>
                        <select id="add-prod-area" required class="w-full bg-black/50 border border-industrial-gray rounded px-3 py-2 text-xs text-white focus:border-gold outline-none uppercase">
                            <option value="Ferreteria">Ferretería</option>
                            <option value="Allen">Allen</option>
                            <option value="Drywall">Drywall</option>
                            <option value="Automotriz">Automotriz</option>
                            <option value="General">General</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Nombre del Producto</label>
                        <input type="text" id="add-prod-nombre" required class="w-full bg-black/50 border border-industrial-gray rounded px-3 py-2 text-xs text-white focus:border-gold outline-none uppercase" placeholder="Ej: Tornillo Allen Cilíndrico M6x20">
                    </div>
                    <div class="col-span-2 sm:col-span-1">
                        <label class="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Precio (USD)</label>
                        <input type="number" step="0.01" min="0" id="add-prod-precio" required class="w-full bg-black/50 border border-industrial-gray rounded px-3 py-2 text-xs text-white focus:border-gold outline-none font-mono" placeholder="0.00">
                    </div>
                    <div class="col-span-2 sm:col-span-1">
                        <label class="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Stock Inicial (UND)</label>
                        <input type="number" min="0" id="add-prod-stock" required class="w-full bg-black/50 border border-industrial-gray rounded px-3 py-2 text-xs text-white focus:border-gold outline-none font-mono" placeholder="0">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">URL de la Imagen (Opcional)</label>
                        <input type="url" id="add-prod-image" class="w-full bg-black/50 border border-industrial-gray rounded px-3 py-2 text-[10px] text-white focus:border-gold outline-none font-mono" placeholder="https://ejemplo.com/imagen.jpg">
                        <p class="text-[8px] text-slate-500 mt-1">Si lo dejas en blanco, el sistema asignará la imagen base o la buscará por SKU.</p>
                    </div>
                </div>
                
                <div class="mt-6 pt-4 border-t border-industrial-gray flex justify-end gap-3">
                    <button type="button" id="btn-cancel-product" class="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Cancelar</button>
                    <button type="submit" id="btn-save-product" class="btn-gold-premium px-6 py-2 text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                        Guardar Producto <span class="material-symbols-outlined text-sm">save</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
    ` : ''}
    `;
};
