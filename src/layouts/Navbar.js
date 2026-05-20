/**
 * Componente Navbar para el SaaS
 */
import { formatCurrency } from '../utils/formatters.js';

export const renderNavbar = (storeName, tasa, user = null, userRole = '') => {
    const userDisplay = user 
        ? `<div class="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
             <div class="text-right hidden md:block">
                 <div class="text-[10px] font-bold text-white uppercase tracking-wider">${user.email.split('@')[0]}</div>
                 <div class="text-[8px] font-bold text-gold uppercase tracking-widest">${userRole || 'VENDEDOR'}</div>
             </div>
             <button id="btn-logout" class="text-slate-400 hover:text-red-500 transition-colors p-1.5 flex-shrink-0" title="Cerrar Sesión">
                 <span class="material-symbols-outlined text-base md:text-lg">logout</span>
             </button>
           </div>`
        : '';

    return `
    <header class="flex justify-between items-center w-full px-3 md:px-6 py-3 md:py-4 bg-dark-gray border-b border-industrial-gray z-30 relative min-w-0">
        <div class="flex items-center gap-1.5 md:gap-4 min-w-0 flex-shrink-0">
            <button id="btn-mobile-menu" class="text-slate-400 hover:text-gold transition-colors md:hidden flex items-center justify-center p-1 flex-shrink-0">
                <span class="material-symbols-outlined text-xl">menu</span>
            </button>
            <div class="flex flex-col justify-center min-w-0">
                <div id="header-store-name" class="text-xs md:text-xl font-bold text-white tracking-tighter font-headline uppercase truncate max-w-[110px] xs:max-w-[150px] md:max-w-none">
                    ${storeName.replace(' ', ' <span class="text-gold">')}</span>
                </div>
                <!-- Tasa BCV en móvil debajo del nombre de la tienda -->
                <div class="text-[8px] md:hidden font-bold text-slate-400 uppercase tracking-wider mt-0.5 leading-none">
                    Tasa BCV: <span id="tasa-display-mobile" class="text-gold font-black">${formatCurrency(tasa)} Bs.</span>
                </div>
            </div>
        </div>
        
        <!-- Buscador Responsivo: En móvil se posiciona de forma absoluta abajo del header al desplegarse -->
        <div id="search-container" class="hidden md:block flex-1 max-w-xs md:max-w-xl mx-2 md:mx-8 absolute md:relative top-full md:top-auto inset-x-0 md:inset-x-auto w-full md:w-auto bg-dark-gray md:bg-transparent px-4 py-2 md:p-0 border-b md:border-b-0 border-industrial-gray z-20">
            <div class="relative group">
                <span class="material-symbols-outlined absolute left-2.5 top-2 md:top-2.5 text-slate-500 group-focus-within:text-gold transition-colors text-sm md:text-base">search</span>
                <input id="search-input" class="w-full bg-white border border-industrial-gray focus:border-gold focus:ring-0 rounded-sm pl-8 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 text-black font-bold text-xs uppercase tracking-wide transition-all placeholder-slate-500" placeholder="BUSCAR PRODUCTO O SKU..." type="text"/>
            </div>
        </div>
        
        <div class="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
            <!-- Botón de Búsqueda Móvil -->
            <button id="btn-mobile-search" class="text-slate-400 hover:text-gold transition-colors md:hidden flex items-center justify-center p-1.5 flex-shrink-0" title="Buscar Producto">
                <span class="material-symbols-outlined text-xl">search</span>
            </button>

            <!-- Refresh: Oculto en móvil (ya hay refresh en la página del catálogo y pull-to-refresh nativo de navegadores) -->
            <button id="header-refresh" class="hidden md:flex items-center gap-2 px-3 py-2 bg-navy border border-industrial-gray text-slate-400 hover:text-gold hover:border-gold transition-all group flex-shrink-0">
                <span class="material-symbols-outlined text-xs md:text-sm group-active:rotate-180 transition-transform duration-500">refresh</span>
                <span class="text-[9px] font-black uppercase tracking-widest">Refrescar</span>
            </button>
            
            <div class="text-right hidden md:block">
                <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tasa BCV</div>
                <div id="tasa-display" class="text-xs font-bold text-gold uppercase">${formatCurrency(tasa)} Bs.</div>
            </div>
            <!-- Sync Queue Status -->
            <button id="btn-sync-queue" class="relative flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 bg-navy border border-industrial-gray text-slate-400 hover:text-white hover:border-gold transition-all group flex-shrink-0" style="display: none;">
                <span class="material-symbols-outlined text-sm group-hover:animate-pulse">cloud_upload</span>
                <span id="sync-count-badge" class="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-dark-gray shadow-md">0</span>
            </button>
            
            <button id="btn-mobile-cart" class="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-navy border border-industrial-gray text-slate-400 hover:text-gold hover:border-gold transition-all lg:hidden rounded-full shadow-lg flex-shrink-0">
                <span class="material-symbols-outlined text-sm md:text-lg">shopping_cart</span>
                <span id="mobile-cart-badge" class="absolute -top-1 -right-1 bg-gold text-navy text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md hidden">0</span>
            </button>
            ${userDisplay}
            <!-- Avatar: Oculto en móvil, visible en escritorio -->
            <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-navy overflow-hidden border-2 border-gold shadow-lg hidden md:block flex-shrink-0">
                <img alt="Avatar" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/a/ACg8ocL0v6S6R7Z_T6O4E-n_z6O-v1n_z6O-v1n_z6O=s96-c"/>
            </div>
        </div>
    </header>
    `;
};
