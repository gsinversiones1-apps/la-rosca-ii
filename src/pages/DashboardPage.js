export const renderDashboardPage = () => {
    return `
    <div id="view-dashboard" class="view-content animate-in fade-in slide-in-from-bottom-4 duration-500 p-6">
        <h2 class="font-headline text-2xl text-white uppercase tracking-wider border-l-4 border-gold pl-3 mb-8">Business Intelligence</h2>
        
        <!-- KPIs Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-navy border border-industrial-gray p-6 relative overflow-hidden group hover:border-gold transition-colors">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-green-900/20 rounded-full blur-2xl group-hover:bg-green-900/40 transition-all"></div>
                <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Ventas Hoy</h3>
                <div class="flex items-end gap-2 relative z-10">
                    <span class="text-3xl font-black text-green-400 font-headline" id="kpi-ventas">$<span class="animate-pulse">...</span></span>
                </div>
            </div>

            <div class="bg-navy border border-industrial-gray p-6 relative overflow-hidden group hover:border-gold transition-colors">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-900/20 rounded-full blur-2xl group-hover:bg-blue-900/40 transition-all"></div>
                <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tickets Emitidos</h3>
                <div class="flex items-end gap-2 relative z-10">
                    <span class="text-3xl font-black text-white font-headline" id="kpi-tickets"><span class="animate-pulse">...</span></span>
                </div>
            </div>

            <div class="bg-navy border border-industrial-gray p-6 relative overflow-hidden group hover:border-gold transition-colors">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-gold/10 rounded-full blur-2xl group-hover:bg-gold/20 transition-all"></div>
                <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Margen Estimado (30%)</h3>
                <div class="flex items-end gap-2 relative z-10">
                    <span class="text-3xl font-black text-gold font-headline" id="kpi-margen">$<span class="animate-pulse">...</span></span>
                </div>
            </div>
        </div>

        <!-- Insights Row -->
        <h3 class="font-headline text-lg text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2 mt-8">
            <span class="material-symbols-outlined text-gold">insights</span> Insights Operativos
        </h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
            <!-- Reposición -->
            <div class="bg-dark-gray border border-industrial-gray p-6 rounded-sm shadow-lg">
                <h4 class="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-red-900/30 pb-2">
                    <span class="material-symbols-outlined text-sm">warning</span> Alerta de Reposición
                </h4>
                <div id="insight-reposicion" class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    <div class="text-slate-500 text-sm animate-pulse">Analizando inventario...</div>
                </div>
            </div>

            <!-- Dinero Estancado -->
            <div class="bg-dark-gray border border-industrial-gray p-6 rounded-sm shadow-lg">
                <h4 class="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-orange-900/30 pb-2">
                    <span class="material-symbols-outlined text-sm">trending_down</span> Dinero Estancado
                </h4>
                <div id="insight-estancado" class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    <div class="text-slate-500 text-sm animate-pulse">Analizando flujo de ventas...</div>
                </div>
            </div>
        </div>
    </div>
    `;
};
