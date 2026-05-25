export const renderDashboardPage = (userRole = 'vendedor') => {
    const isAdmin = userRole === 'admin';

    return `
    <div id="view-dashboard" class="view-content animate-in fade-in slide-in-from-bottom-4 duration-500 p-6">
        
        <!-- Encabezado Principal Premium -->
        <div class="mb-8">
            <div class="flex items-center gap-3.5 mb-1 pb-1">
                <span class="material-symbols-outlined text-3xl text-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.4)] animate-pulse">radar</span>
                <h2 class="font-headline text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2 flex-wrap">
                    Centro de Mando Estratégico <span class="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] via-[#B38728] via-[#FBF5B7] to-[#AA771C] bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">360º LA ROSCA II</span>
                </h2>
            </div>
            <p class="text-[11px] text-slate-400 font-bold uppercase tracking-wider pl-11">
                Análisis de precisión en tiempo real para la toma de decisiones rentables.
            </p>
        </div>
        
        <!-- KPIs Row -->
        <div class="grid grid-cols-1 md:grid-cols-${isAdmin ? '3' : '2'} gap-6 mb-8 max-w-7xl">
            <div class="bg-navy-premium border border-gold/10 p-6 rounded-[12px] relative overflow-hidden group hover:border-gold/30 hover-gold-glow transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-green-900/10 rounded-full blur-2xl group-hover:bg-green-900/20 transition-all"></div>
                <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-xs text-green-400">payments</span> VENTAS HOY
                </h3>
                <div class="flex items-end gap-2 relative z-10">
                    <span class="text-3xl font-black text-green-400 font-headline" id="kpi-ventas">$<span class="animate-pulse">...</span></span>
                </div>
            </div>

            <div class="bg-navy-premium border border-gold/10 p-6 rounded-[12px] relative overflow-hidden group hover:border-gold/30 hover-gold-glow transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-900/10 rounded-full blur-2xl group-hover:bg-blue-900/20 transition-all"></div>
                <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-xs text-blue-400">receipt_long</span> TICKETS EMITIDOS
                </h3>
                <div class="flex items-end gap-2 relative z-10">
                    <span class="text-3xl font-black text-white font-headline" id="kpi-tickets"><span class="animate-pulse">...</span></span>
                </div>
            </div>

            ${isAdmin ? `
            <div class="bg-navy-premium border border-gold/10 p-6 rounded-[12px] relative overflow-hidden group hover:border-gold/30 hover-gold-glow transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-gold/10 rounded-full blur-2xl group-hover:bg-gold/25 transition-all"></div>
                <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-xs text-gold">percent</span> MARGEN ESTIMADO
                </h3>
                <div class="flex items-end gap-2 relative z-10">
                    <span class="text-3xl font-black text-gold font-headline" id="kpi-margen">$<span class="animate-pulse">...</span></span>
                </div>
            </div>
            ` : ''}
        </div>

        <!-- Insights Row -->
        <h3 class="font-headline text-sm font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2 mt-10">
            <span class="material-symbols-outlined text-gold">insights</span> Insights Operativos
        </h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-${isAdmin ? '2' : '1'} gap-6 pb-20">
            <!-- Reposición -->
            <div class="bg-navy-premium border border-gold/10 p-6 rounded-[12px] relative overflow-hidden group hover:border-gold/30 hover-gold-glow transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
                <h4 class="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-red-900/20 pb-2">
                    <span class="material-symbols-outlined text-base animate-pulse">warning</span> ALERTA DE REPOSICIÓN
                </h4>
                <div id="insight-reposicion" class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    <div class="text-slate-500 text-xs font-bold uppercase tracking-wider animate-pulse">Analizando inventario...</div>
                </div>
            </div>

            ${isAdmin ? `
            <!-- Dinero Estancado -->
            <div class="bg-navy-premium border border-gold/10 p-6 rounded-[12px] relative overflow-hidden group hover:border-gold/30 hover-gold-glow transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
                <h4 class="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-orange-900/20 pb-2">
                    <span class="material-symbols-outlined text-base animate-pulse">trending_down</span> DINERO ESTANCADO
                </h4>
                <div id="insight-estancado" class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    <div class="text-slate-500 text-xs font-bold uppercase tracking-wider animate-pulse">Analizando flujo de ventas...</div>
                </div>
            </div>
            ` : ''}
        </div>
    </div>
    `;
};
