/**
 * Componente Lateral del Carrito de Compras
 */
import { GlobalState } from '../../context/State.js';
import { renderCartItem } from './CartItem.js';
import { formatCurrency } from '../../utils/formatters.js';
import { useCart } from '../../hooks/useCart.js';

export const renderCartSidebar = () => {
    const { calculateTotals } = useCart();
    const { subtotal, iva, totalUsd, totalBs } = calculateTotals(GlobalState.tasaActual);
    
    return `
    <aside class="fixed right-0 top-0 h-full w-80 bg-navy border-l border-industrial-gray shadow-2xl z-40 flex flex-col">
        <div class="p-6 border-b border-industrial-gray flex justify-between items-center bg-dark-gray">
            <h3 class="font-headline text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <span class="material-symbols-outlined text-gold">shopping_basket</span> Carrito
            </h3>
            <span class="bg-gold text-navy text-[10px] font-black px-2 py-0.5 rounded-full">${GlobalState.cart.length}</span>
        </div>

        <!-- SECCIÓN ELIMINADA: El cliente ahora se selecciona al finalizar la venta en el Checkout Modal -->

        <!-- ITEMS -->
        <div id="cart-items-container" class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            ${GlobalState.cart.length === 0 ? `
                <div class="flex flex-col items-center justify-center h-full text-slate-500 opacity-30">
                    <span class="material-symbols-outlined text-5xl mb-2">shopping_cart_off</span>
                    <p class="text-[10px] font-bold uppercase tracking-widest">Carrito Vacío</p>
                </div>
            ` : GlobalState.cart.map(item => renderCartItem(item)).join('')}
        </div>

        <!-- TOTALES Y CHECKOUT -->
        <div class="p-6 bg-dark-gray border-t border-industrial-gray space-y-4">
            <div class="space-y-2 border-b border-industrial-gray pb-4">
                <div class="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Subtotal</span>
                    <span>$${formatCurrency(subtotal)}</span>
                </div>
                <div class="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>IVA (${GlobalState.config.iva}%)</span>
                    <span>$${formatCurrency(iva)}</span>
                </div>
                <div class="flex justify-between text-gold font-headline font-black text-lg pt-2 border-t border-white/5">
                    <span>TOTAL USD</span>
                    <span>$${formatCurrency(totalUsd)}</span>
                </div>
            </div>

            <div class="bg-navy p-3 border border-gold/20 flex flex-col items-center">
                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Total en Bolívares</span>
                <span class="text-xl font-headline font-black text-white">${formatCurrency(totalBs)} <small class="text-[10px]">Bs.</small></span>
            </div>

            <button id="btn-checkout" class="w-full bg-gold hover:bg-[#B8962F] text-navy py-4 font-headline font-black text-xs uppercase tracking-[0.2em] shadow-[0_4px_0_#B8962F] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50" ${GlobalState.cart.length === 0 ? 'disabled' : ''}>
                FINALIZAR VENTA
            </button>
            <button id="btn-clear-cart" class="w-full text-slate-500 hover:text-red-400 text-[9px] font-bold uppercase tracking-widest transition-colors">
                VACIAR CARRITO
            </button>
        </div>
    </aside>
    `;
};
