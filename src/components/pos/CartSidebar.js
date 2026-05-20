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
    <aside id="cart-sidebar" class="fixed right-0 top-0 h-[100dvh] w-80 bg-navy border-l border-industrial-gray shadow-2xl z-50 flex flex-col transform translate-x-full lg:translate-x-0 transition-transform duration-300">
        <div class="p-4 md:p-6 border-b border-industrial-gray flex justify-between items-center bg-dark-gray flex-shrink-0">
            <h3 class="font-headline text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <span class="material-symbols-outlined text-gold">shopping_basket</span> Carrito
            </h3>
            <span class="bg-gold text-navy text-[10px] font-black px-2 py-0.5 rounded-full">${GlobalState.cart.length}</span>
        </div>
 
        <!-- Items del Carrito -->
        <div id="cart-items-container" class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[calc(100dvh-420px)] lg:max-h-none">
            ${GlobalState.cart.length === 0 ? `
                <div class="flex flex-col items-center justify-center h-48 lg:h-full text-slate-500 opacity-30">
                    <span class="material-symbols-outlined text-5xl mb-2">shopping_cart_off</span>
                    <p class="text-[10px] font-bold uppercase tracking-widest">Carrito Vacío</p>
                </div>
            ` : GlobalState.cart.map(item => renderCartItem(item)).join('')}
        </div>
 
        <!-- Totales y Checkout (Sticky Footer) -->
        <div class="p-4 md:p-6 bg-dark-gray border-t border-industrial-gray space-y-3 sticky bottom-0 z-20 flex-shrink-0">
            
            <!-- Selector de Divisas/Bolívares (IGTF) -->
            <div class="bg-navy p-1.5 flex border border-industrial-gray rounded-sm mb-1">
                <button id="btn-metodo-pago-bs" class="flex-1 text-[9px] font-bold uppercase tracking-wider py-1 transition-colors ${GlobalState.cartMetodoPago !== 'DIVISAS' ? 'bg-gold text-navy shadow-sm' : 'text-slate-400 hover:text-white'}">
                    Bolívares
                </button>
                <button id="btn-metodo-pago-usd" class="flex-1 text-[9px] font-bold uppercase tracking-wider py-1 transition-colors flex items-center justify-center gap-1 ${GlobalState.cartMetodoPago === 'DIVISAS' ? 'bg-green-500 text-navy shadow-sm' : 'text-slate-400 hover:text-green-400'}">
                    Divisas <span class="text-[8px] opacity-75">(+3%)</span>
                </button>
            </div>
 
            <div class="space-y-1.5 border-b border-industrial-gray pb-3">
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
                <div class="flex justify-between text-gold font-headline font-black text-base md:text-lg pt-1.5 border-t border-white/5">
                    <span>TOTAL USD</span>
                    <span>$${formatCurrency(totalUsd)}</span>
                </div>
            </div>
 
            <div class="bg-navy p-2 border border-gold/20 flex flex-col items-center">
                <span class="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-0.5">Total en Bolívares</span>
                <span class="text-lg font-headline font-black text-white">${formatCurrency(totalBs)} <small class="text-[9px]">Bs.</small></span>
            </div>
 
            <button id="btn-checkout" class="w-full bg-gold hover:bg-[#B8962F] text-navy py-3 md:py-4 font-headline font-black text-xs uppercase tracking-[0.2em] shadow-[0_4px_0_#B8962F] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2" ${GlobalState.cart.length === 0 ? 'disabled' : ''}>
                FINALIZAR VENTA
            </button>
            <button id="btn-clear-cart" class="w-full text-slate-500 hover:text-red-400 text-[9px] font-bold uppercase tracking-widest transition-colors py-1">
                VACIAR CARRITO
            </button>
        </div>
    </aside>
    `;
};
