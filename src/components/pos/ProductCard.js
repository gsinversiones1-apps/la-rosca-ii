/**
 * Componente de Tarjeta de Producto para el POS
 */
import { formatCurrency } from '../../utils/formatters.js';

export const renderProductCard = (product, inCartCount = 0) => {
    const availableStock = product.stock - inCartCount;
    const imgUrl = product.image_url || "/assets/tornillo_tuerca_4k.png";
    
    return `
    <div class="bg-dark-gray border border-industrial-gray group hover:border-gold transition-all duration-300 shadow-lg">
        <div class="aspect-square relative overflow-hidden bg-navy/20">
            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" src="${imgUrl}"/>
            <div class="absolute top-2 right-2 bg-navy/80 border border-gold text-gold font-headline text-[9px] px-2 py-0.5 uppercase tracking-tighter">${product.codigo_skv}</div>
        </div>
        <div class="p-4 border-b border-industrial-gray">
            <h3 class="font-headline text-xs text-white uppercase mb-1 truncate">${product.nombre}</h3>
            <p class="text-[10px] text-slate-500 mb-4 uppercase">${product.area || 'Ferretería'} - ${product.medida || 'N/A'}</p>
            <div class="flex justify-between items-center">
                <span class="font-headline text-xl text-gold font-bold">$${formatCurrency(product.precio_usd)}</span>
                <div class="text-right">
                    <span class="block text-[8px] font-bold ${availableStock < 50 ? 'text-red-400' : 'text-slate-500'} uppercase tracking-widest">
                        ${availableStock < 50 ? 'STOCK CRÍTICO' : 'STOCK'}
                    </span>
                    <span class="font-headline text-[10px] font-bold ${availableStock < 50 ? 'text-red-500' : 'text-white'}">
                        ${availableStock.toLocaleString('es-VE')} UND
                    </span>
                </div>
            </div>
        </div>
        <div class="p-2 bg-background/50 flex gap-2">
            <button class="add-to-cart w-full bg-gold hover:bg-[#B8962F] text-navy py-2 flex items-center justify-center gap-2 transition-colors shadow-lg active:scale-95 ${availableStock <= 0 ? 'opacity-50 pointer-events-none' : ''}" data-id="${product.id}">
                <span class="material-symbols-outlined text-sm font-bold">add_shopping_cart</span>
                <span class="text-[9px] font-black uppercase tracking-widest">Añadir</span>
            </button>
        </div>
    </div>
    `;
};
