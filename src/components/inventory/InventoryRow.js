/**
 * Componente de Fila de la Tabla de Inventario
 */
import { formatCurrency, formatNumber } from '../../utils/formatters.js';

export const renderInventoryRow = (product, userRole) => {
    const isLowStock = product.stock_quantity < 50;
    
    const actions = userRole === 'admin' 
        ? `<div class="flex justify-center gap-3">
                <button class="edit-product p-1.5 text-slate-400 hover:text-gold hover:bg-white/5 rounded-sm transition-all" data-id="${product.id}" title="Editar">
                    <span class="material-symbols-outlined text-base">edit</span>
                </button>
                <button class="delete-product p-1.5 text-slate-400 hover:text-red-500 hover:bg-white/5 rounded-sm transition-all" data-id="${product.id}" title="Eliminar">
                    <span class="material-symbols-outlined text-base">delete</span>
                </button>
            </div>`
        : `<span class="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Solo lectura</span>`;

    return `
    <tr class="border-b border-industrial-gray/60 hover:bg-white/5 transition-colors group">
        <td class="px-6 py-4 hidden md:table-cell font-mono text-[11px] text-slate-400 tracking-wider">${product.sku}</td>
        <td class="px-6 py-4">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded bg-navy-premium border border-industrial-gray/80 overflow-hidden flex-shrink-0">
                    <img src="${product.image_url || '/assets/tornillo_tuerca_4k.png'}" class="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity"/>
                </div>
                <span class="font-bold uppercase text-xs text-white tracking-wide leading-tight">${product.name}</span>
            </div>
        </td>
        <td class="px-6 py-4 hidden sm:table-cell">
            <span class="px-2.5 py-1 bg-navy/80 text-slate-300 text-[9px] font-extrabold uppercase border border-industrial-gray/60 rounded-sm tracking-widest">
                ${product.category || 'GENERAL'}
            </span>
        </td>
        <td class="px-6 py-4 font-mono text-xs text-gold font-bold tracking-wide">$ ${formatCurrency(product.base_price)}</td>
        <td class="px-6 py-4 font-mono text-xs">
            <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full ${isLowStock ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,110,110,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}"></div>
                <span class="font-bold ${isLowStock ? 'text-red-400' : 'text-white'}">${formatNumber(product.stock_quantity)}</span>
            </div>
        </td>
        <td class="px-6 py-4 text-center">
            ${actions}
        </td>
    </tr>
    `;
};
