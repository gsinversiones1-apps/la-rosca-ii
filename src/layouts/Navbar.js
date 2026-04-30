/**
 * Componente Navbar para el SaaS
 */
import { formatCurrency } from '../utils/formatters.js';

export const renderNavbar = (storeName, tasa) => {
    return `
    <header class="flex justify-between items-center w-full px-6 py-4 bg-dark-gray border-b border-industrial-gray z-30">
        <div class="flex items-center gap-4">
            <button class="text-slate-400 hover:text-gold transition-colors">
                <span class="material-symbols-outlined">menu</span>
            </button>
            <div id="header-store-name" class="text-xl font-bold text-white tracking-tighter font-headline uppercase">
                ${storeName.replace(' ', ' <span class="text-gold">')}</span>
            </div>
        </div>
        <div class="flex-1 max-w-xl mx-8">
            <div class="relative group">
                <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 group-focus-within:text-gold transition-colors">search</span>
                <input id="search-input" class="w-full bg-background border border-industrial-gray focus:border-gold focus:ring-0 rounded-sm pl-10 pr-4 py-2 text-slate-200 text-xs uppercase tracking-wide transition-all" placeholder="BUSCAR PRODUCTO O SKU..." type="text"/>
            </div>
        </div>
        <div class="flex items-center gap-4">
            <button id="header-refresh" class="flex items-center gap-2 px-3 py-2 bg-navy border border-industrial-gray text-slate-400 hover:text-gold hover:border-gold transition-all group">
                <span class="material-symbols-outlined text-sm group-active:rotate-180 transition-transform duration-500">refresh</span>
                <span class="text-[9px] font-black uppercase tracking-widest hidden sm:block">Refrescar</span>
            </button>
            <div class="text-right hidden sm:block">
                <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tasa BCV</div>
                <div id="tasa-display" class="text-xs font-bold text-gold uppercase">${formatCurrency(tasa)} Bs.</div>
            </div>
            <!-- Sync Queue Status -->
            <button id="btn-sync-queue" class="relative flex items-center gap-2 px-3 py-2 bg-navy border border-industrial-gray text-slate-400 hover:text-white hover:border-gold transition-all group" style="display: none;">
                <span class="material-symbols-outlined text-sm group-hover:animate-pulse">cloud_upload</span>
                <span id="sync-count-badge" class="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-dark-gray shadow-md">0</span>
            </button>
            <div class="w-10 h-10 rounded-full bg-navy overflow-hidden border-2 border-gold shadow-lg">
                <img alt="Avatar" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/a/ACg8ocL0v6S6R7Z_T6O4E-n_z6O-v1n_z6O-v1n_z6O=s96-c"/>
            </div>
        </div>
    </header>
    `;
};
