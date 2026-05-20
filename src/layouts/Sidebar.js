/**
 * Componente Sidebar para el SaaS
 * Lógica de Control de Acceso (RBAC): Oculta de forma nativa Dashboard y Configuración para el rol Vendedor.
 */

export const renderSidebar = (storeName = "GLOBAL POS", userRole = 'vendedor') => {
    const isAdmin = userRole === 'admin';
    
    const dashboardButton = isAdmin 
        ? `<button id="nav-dashboard" class="w-full text-left text-slate-400 px-4 py-3 flex items-center gap-3 font-headline text-xs font-bold uppercase hover:bg-white/5 hover:text-gold transition-all">
                <span class="material-symbols-outlined">dashboard</span> Dashboard
           </button>`
        : '';

    const settingsButton = isAdmin 
        ? `<a id="btn-open-settings" class="text-slate-400 px-4 py-3 flex items-center gap-3 font-headline text-xs font-bold uppercase hover:bg-white/5 hover:text-gold transition-all mt-10 cursor-pointer">
                <span class="material-symbols-outlined text-sm text-gold">settings</span> Configuración
           </a>`
        : '';

    return `
    <aside id="main-sidebar" class="fixed left-0 top-0 h-full w-64 flex flex-col z-50 bg-navy border-r border-industrial-gray shadow-xl transform -translate-x-full md:translate-x-0 transition-transform duration-300">
        <div class="p-6 border-b border-industrial-gray flex justify-between items-center">
            <h1 id="sidebar-store-name" class="text-lg font-bold text-white font-headline uppercase tracking-widest">
                ${storeName.split(' ')[0]} <span class="text-gold">POS</span>
            </h1>
            <button id="btn-close-sidebar" class="text-slate-400 hover:text-gold md:hidden flex items-center justify-center p-1" title="Cerrar Menú">
                <span class="material-symbols-outlined text-xl">close</span>
            </button>
        </div>
        <nav class="flex-1 py-4 overflow-y-auto custom-scrollbar">
            <div class="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">General</div>
            
            ${dashboardButton}
 
            <button id="nav-inventory" class="w-full text-left text-slate-400 px-4 py-3 flex items-center gap-3 font-headline text-xs font-bold uppercase hover:bg-white/5 hover:text-gold transition-all">
                <span class="material-symbols-outlined">inventory_2</span> Inventario
            </button>
            
            <button id="nav-pos" class="w-full text-left text-slate-400 px-4 py-3 flex items-center gap-3 font-headline text-xs font-bold uppercase hover:bg-white/5 hover:text-gold transition-all">
                <span class="material-symbols-outlined">point_of_sale</span> Ventas (POS)
            </button>
            
            <button id="nav-clients" class="w-full text-left text-slate-400 px-4 py-3 flex items-center gap-3 font-headline text-xs font-bold uppercase hover:bg-white/5 hover:text-gold transition-all">
                <span class="material-symbols-outlined">group</span> Clientes
            </button>
            
            ${settingsButton}
            
            <div class="px-4 mt-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-t border-industrial-gray pt-6">Estado del Sistema</div>
            <div class="px-4 py-4">
                <div id="status-container">
                    <div class="flex items-center gap-2">
                        <div id="db-status-dot" class="w-2 h-2 rounded-full bg-red-500"></div>
                        <span id="db-status-text" class="text-[9px] uppercase tracking-widest text-slate-500">Conectando...</span>
                    </div>
                </div>
            </div>
        </nav>
    </aside>
    `;
};
