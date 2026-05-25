/**
 * Componente Sidebar para el SaaS
 * Lógica de Control de Acceso (RBAC): Oculta de forma nativa Dashboard y Configuración para el rol Vendedor.
 */

export const renderSidebar = (storeName = "GLOBAL POS", userRole = 'vendedor') => {
    const isAdmin = userRole === 'admin';
    
    const dashboardButton = isAdmin 
        ? `<button id="nav-dashboard" class="w-full text-left text-slate-400 px-4 md:px-0 2xl:px-4 py-3 flex items-center justify-start md:justify-center 2xl:justify-start gap-3 font-headline text-xs font-bold uppercase hover:bg-white/5 hover:text-gold transition-all" title="Panel Principal">
                <span class="material-symbols-outlined">dashboard</span> <span class="inline md:hidden 2xl:inline">Panel Principal</span>
           </button>`
        : '';

    const settingsButton = isAdmin 
        ? `<a id="btn-open-settings" class="text-slate-400 px-4 md:px-0 2xl:px-4 py-3 flex items-center justify-start md:justify-center 2xl:justify-start gap-3 font-headline text-xs font-bold uppercase hover:bg-white/5 hover:text-gold transition-all mt-10 cursor-pointer" title="Configuración">
                <span class="material-symbols-outlined text-sm text-gold">settings</span> <span class="inline md:hidden 2xl:inline">Configuración</span>
           </a>`
        : '';

    return `
    <aside id="main-sidebar" class="fixed left-0 top-0 h-full w-64 md:w-20 2xl:w-64 flex flex-col z-50 bg-navy border-r border-industrial-gray shadow-xl transform -translate-x-full md:translate-x-0 transition-all duration-300">
        <div class="p-6 md:p-4 2xl:p-6 border-b border-industrial-gray flex justify-between items-center h-[73px] flex-shrink-0">
            <h1 id="sidebar-store-name" class="text-lg font-bold text-white font-headline uppercase tracking-widest md:hidden 2xl:block truncate">
                ${storeName.split(' ')[0]} <span class="text-gold">POS</span>
            </h1>
            <!-- Stylized mini logo for collapsed state -->
            <div class="hidden md:flex 2xl:hidden w-10 h-10 rounded bg-gold/10 border border-gold/40 flex-shrink-0 items-center justify-center font-headline font-black text-gold text-sm shadow-[0_0_10px_rgba(212,175,55,0.15)] mx-auto animate-pulse">
                ${storeName.split(' ')[0][0]}${storeName.split(' ').slice(-1)[0][0] || ''}
            </div>
            <button id="btn-close-sidebar" class="text-slate-400 hover:text-gold md:hidden flex items-center justify-center p-1" title="Cerrar Menú">
                <span class="material-symbols-outlined text-xl">close</span>
            </button>
        </div>
        <nav class="flex-1 py-4 overflow-y-auto custom-scrollbar">
            <div class="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest md:hidden 2xl:block">General</div>
            
            ${dashboardButton}
 
            <button id="nav-inventory" class="w-full text-left text-slate-400 px-4 md:px-0 2xl:px-4 py-3 flex items-center justify-start md:justify-center 2xl:justify-start gap-3 font-headline text-xs font-bold uppercase hover:bg-white/5 hover:text-gold transition-all" title="Inventario">
                <span class="material-symbols-outlined">inventory_2</span> <span class="inline md:hidden 2xl:inline">Inventario</span>
            </button>
            
            <button id="nav-pos" class="w-full text-left text-slate-400 px-4 md:px-0 2xl:px-4 py-3 flex items-center justify-start md:justify-center 2xl:justify-start gap-3 font-headline text-xs font-bold uppercase hover:bg-white/5 hover:text-gold transition-all" title="Punto de Venta">
                <span class="material-symbols-outlined">point_of_sale</span> <span class="inline md:hidden 2xl:inline">Punto de Venta</span>
            </button>
            
            <button id="nav-clients" class="w-full text-left text-slate-400 px-4 md:px-0 2xl:px-4 py-3 flex items-center justify-start md:justify-center 2xl:justify-start gap-3 font-headline text-xs font-bold uppercase hover:bg-white/5 hover:text-gold transition-all" title="Clientes">
                <span class="material-symbols-outlined">group</span> <span class="inline md:hidden 2xl:inline">Clientes</span>
            </button>
            
            ${settingsButton}
            
            <div class="px-4 mt-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-t border-industrial-gray pt-6 md:hidden 2xl:block">Estado del Sistema</div>
            <div class="px-4 py-4 md:px-0 2xl:px-4">
                <div id="status-container" class="flex justify-start md:justify-center 2xl:justify-start">
                    <div class="flex items-center gap-2">
                        <div id="db-status-dot" class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                        <span id="db-status-text" class="text-[9px] uppercase tracking-widest text-slate-500 font-bold inline md:hidden 2xl:inline">Conectando...</span>
                    </div>
                </div>
            </div>
        </nav>
    </aside>
    `;
};
