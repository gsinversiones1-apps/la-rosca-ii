/**
 * Componente Lateral del Carrito de Compras
 */
import { GlobalState } from '../../context/State.js';
import { renderCartItem } from './CartItem.js';
import { formatCurrency } from '../../utils/formatters.js';
import { useCart } from '../../hooks/useCart.js';

export const renderCartSidebar = () => {
    const { calculateTotals } = useCart();
    const { subtotal, iva, igtf, totalUsd, totalBs } = calculateTotals(GlobalState.tasaActual, GlobalState.cartMetodoPago);
    
    return `
    <aside id="cart-sidebar" class="fixed right-0 top-0 h-full w-80 bg-navy border-l border-industrial-gray shadow-2xl z-50 flex flex-col transform translate-x-full lg:translate-x-0 transition-transform duration-300">
        <div class="p-6 border-b border-industrial-gray flex justify-between items-center bg-dark-gray">
            <h3 class="font-headline text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <span class="material-symbols-outlined text-gold">shopping_basket</span> Carrito
            </h3>
            <span class="bg-gold text-navy text-[10px] font-black px-2 py-0.5 rounded-full">${GlobalState.cart.length}</span>
        </div>

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
            
            <!-- Selector de Divisas/Bolívares (IGTF) -->
            <div class="bg-navy p-2 flex border border-industrial-gray rounded-sm mb-2">
                <button id="btn-metodo-pago-bs" class="flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 transition-colors ${GlobalState.cartMetodoPago !== 'DIVISAS' ? 'bg-gold text-navy shadow-sm' : 'text-slate-400 hover:text-white'}">
                    Bolívares
                </button>
                <button id="btn-metodo-pago-usd" class="flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 transition-colors flex items-center justify-center gap-1 ${GlobalState.cartMetodoPago === 'DIVISAS' ? 'bg-green-500 text-navy shadow-sm' : 'text-slate-400 hover:text-green-400'}">
                    Divisas <span class="text-[8px] opacity-75">(+3%)</span>
                </button>
            </div>

            <div class="space-y-2 border-b border-industrial-gray pb-4">
                <div class="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Subtotal</span>
                    <span>$${formatCurrency(subtotal)}</span>
                </div>
                <div class="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>IVA (${GlobalState.config.iva}%)</span>
                    <span>$${formatCurrency(iva)}</span>
                </div>
                ${igtf > 0 ? `
                <div class="flex justify-between text-[10px] text-red-400 uppercase font-bold">
                    <span>IGTF (3%)</span>
                    <span>$${formatCurrency(igtf)}</span>
                </div>
                ` : ''}
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
