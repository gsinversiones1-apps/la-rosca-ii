/**
 * Componente de Ítem del Carrito
 */
import { formatCurrency } from '../../utils/formatters.js';

export const renderCartItem = (item) => {
    return `
    <div class="bg-navy/40 border border-industrial-gray p-3 flex gap-3 group animate-in slide-in-from-right-2 duration-300">
        <div class="w-12 h-12 bg-background border border-industrial-gray overflow-hidden">
            <img src="${item.image_url || '/assets/tornillo_tuerca_4k.png'}" class="w-full h-full object-cover opacity-70"/>
        </div>
        <div class="flex-1">
            <h4 class="text-[10px] font-bold text-white uppercase truncate">${item.nombre}</h4>
            <div class="flex justify-between items-center mt-1">
                <span class="text-[9px] text-gold font-mono font-bold">$${formatCurrency(item.precio_usd)}</span>
                <div class="flex items-center gap-2">
                    <button class="remove-item text-slate-500 hover:text-red-500" data-id="${item.id}">
                        <span class="material-symbols-outlined text-xs">remove_circle</span>
                    </button>
                    <span class="text-[10px] font-black text-white bg-industrial-gray px-2 py-0.5">${item.cantidad}</span>
                    <button class="add-item text-slate-500 hover:text-gold" data-id="${item.id}">
                        <span class="material-symbols-outlined text-xs">add_circle</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
};
