/**
 * Componente de Fila de la Tabla de Inventario
 */
import { formatCurrency, formatNumber } from '../../utils/formatters.js';

export const renderInventoryRow = (product, userRole) => {
    const isLowStock = product.stock < 50;
    
    const actions = userRole === 'admin' 
        ? `<div class="flex justify-center gap-2">
                <button class="edit-product p-2 text-slate-400 hover:text-gold transition-colors" data-id="${product.id}">
                    <span class="material-symbols-outlined text-sm">edit</span>
                </button>
                <button class="delete-product p-2 text-slate-400 hover:text-red-500 transition-colors" data-id="${product.id}">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>`
        : `<span class="text-[9px] text-slate-500 uppercase">Solo lectura</span>`;

    return `
    <tr class="border-b border-industrial-gray hover:bg-white/5 transition-colors group">
        <td class="px-6 py-4 font-mono text-[10px] text-slate-500">${product.codigo_skv}</td>
        <td class="px-6 py-4">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded bg-navy border border-industrial-gray overflow-hidden">
                    <img src="${product.image_url || '/assets/tornillo_tuerca_4k.png'}" class="w-full h-full object-cover opacity-60"/>
                </div>
                <span class="font-bold uppercase tracking-wide">${product.nombre}</span>
            </div>
        </td>
        <td class="px-6 py-4">
            <span class="px-2 py-1 bg-navy text-slate-400 text-[9px] font-bold uppercase border border-industrial-gray">
                ${product.area || 'GENERAL'}
            </span>
        </td>
        <td class="px-6 py-4 text-gold font-bold">$ ${formatCurrency(product.precio_usd)}</td>
        <td class="px-6 py-4">
            <div class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full ${isLowStock ? 'bg-red-500 animate-pulse' : 'bg-green-500'}"></div>
                <span class="${isLowStock ? 'text-red-400 font-black' : 'text-white'}">${formatNumber(product.stock)}</span>
            </div>
        </td>
        <td class="px-6 py-4 text-center">
            ${actions}
        </td>
    </tr>
    `;
};
