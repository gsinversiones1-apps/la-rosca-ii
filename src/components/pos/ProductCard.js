/**
 * Componente de Tarjeta de Producto para el POS
 */
import { formatCurrency } from '../../utils/formatters.js';

export const renderProductCard = (product, inCartCount = 0) => {
    const availableStock = product.stock_quantity - inCartCount;
    const imgUrl = product.image_url || "/assets/tornillo_tuerca_4k.png";
    
    return `
    <div class="bg-navy-premium border border-industrial-gray/50 hover-gold-glow group transition-all duration-300 shadow-xl rounded-xl overflow-hidden flex flex-col h-full">
        <div class="aspect-square relative overflow-hidden bg-navy/20 flex-shrink-0">
            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-95" src="${imgUrl}"/>
            <div class="absolute top-2 right-2 bg-navy/90 border border-gold/40 text-gold font-mono text-[9px] px-2 py-0.5 uppercase tracking-wider rounded-sm shadow-md">${product.sku}</div>
        </div>
        <div class="p-4 border-b border-industrial-gray flex-1 flex flex-col justify-between">
            <div>
                <h3 class="font-headline text-xs text-white uppercase mb-1 font-bold tracking-wide leading-tight group-hover:text-gold transition-colors">${product.name}</h3>
                <p class="text-[10px] text-slate-400 mb-4 uppercase tracking-wider">${product.category || 'General'} - ${product.uom || 'N/A'}</p>
            </div>
            <div class="flex justify-between items-center mt-auto">
                <span class="font-mono text-xl text-gold font-bold">$${formatCurrency(product.base_price)}</span>
                <div class="text-right">
                    <span class="block text-[8px] font-bold ${availableStock < 50 ? 'text-red-400' : 'text-slate-500'} uppercase tracking-widest">
                        ${availableStock < 50 ? 'STOCK CRÍTICO' : 'STOCK'}
                    </span>
                    <span class="font-mono text-[10.5px] font-bold ${availableStock < 50 ? 'text-red-400' : 'text-white'}">
                        ${availableStock.toLocaleString('es-VE')} UND
                    </span>
                </div>
            </div>
        </div>
        <div class="p-2 bg-black/20 flex gap-2 flex-shrink-0">
            <button class="add-to-cart w-full btn-gold-premium py-2 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${availableStock <= 0 ? 'opacity-50 pointer-events-none' : ''}" data-id="${product.id}">
                <span class="material-symbols-outlined text-sm font-bold">add_shopping_cart</span>
                <span class="text-[9px] font-black uppercase tracking-widest">Añadir</span>
            </button>
        </div>
    </div>
    `;
};
