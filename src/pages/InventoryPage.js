/**
 * Página de Gestión de Inventario
 */

export const renderInventoryPage = () => {
    return `
    <div id="view-inventory" class="view-content animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h2 class="font-headline text-lg text-white uppercase tracking-wider border-l-4 border-gold pl-3">Gestión de Inventario</h2>
                <p class="text-[11px] text-slate-500 mt-1 uppercase tracking-wide">Administra tus productos, precios y existencias</p>
            </div>
            <button id="btn-add-product" class="bg-gold text-navy px-6 py-3 font-headline text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#E5C158] transition-all shadow-[0_4px_0_#B8962F] active:translate-y-1 active:shadow-none">
                NUEVO PRODUCTO <span class="material-symbols-outlined text-sm font-black">add_box</span>
            </button>
        </div>

        <div class="bg-dark-gray border border-industrial-gray shadow-2xl overflow-hidden">
            <table class="w-full text-left">
                <thead>
                    <tr class="bg-navy border-b border-industrial-gray text-[10px] font-bold text-gold uppercase tracking-widest">
                        <th class="px-6 py-4">SKU / Código</th>
                        <th class="px-6 py-4">Producto</th>
                        <th class="px-6 py-4">Categoría</th>
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
    `;
};
