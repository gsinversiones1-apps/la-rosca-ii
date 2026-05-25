export const renderDashboardPage = (userRole = 'vendedor') => {
    const isAdmin = userRole === 'admin';

    return `
    <div id="view-dashboard" class="view-content animate-in fade-in slide-in-from-bottom-4 duration-500 p-6">
        
        <!-- Header & KPIs & 3D Model Area -->
        <div class="flex flex-col lg:flex-row gap-6 mb-8 max-w-7xl items-start">
            
            <div class="flex-1 w-full">
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
                <div class="grid grid-cols-1 md:grid-cols-${isAdmin ? '3' : '2'} gap-6">
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
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-yellow-900/10 rounded-full blur-2xl group-hover:bg-yellow-900/20 transition-all"></div>
                        <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-xs text-yellow-400">receipt_long</span> TICKETS EMITIDOS
                        </h3>
                        <div class="flex items-end gap-2 relative z-10">
                            <span class="text-3xl font-black text-yellow-400 font-headline" id="kpi-tickets"><span class="animate-pulse">...</span></span>
                        </div>
                    </div>

                    ${isAdmin ? `
                    <div class="bg-navy-premium border border-gold/10 p-6 rounded-[12px] relative overflow-hidden group hover:border-gold/30 hover-gold-glow transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-green-900/10 rounded-full blur-2xl group-hover:bg-green-900/25 transition-all"></div>
                        <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-xs text-green-400">percent</span> MARGEN ESTIMADO
                        </h3>
                        <div class="flex items-end gap-2 relative z-10">
                            <span class="text-3xl font-black text-green-400 font-headline" id="kpi-margen">$<span class="animate-pulse">...</span></span>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- Contenedor del Modelo 3D (Three.js Screw) -->
            <div id="screw-wrapper" class="hidden lg:flex w-full md:w-80 h-64 relative items-center justify-center shrink-0 mt-4 lg:mt-0 mx-auto">
                <!-- Skeleton Screen (Spinner Dorado) -->
                <div id="screw-skeleton" class="absolute inset-0 flex flex-col items-center justify-center bg-transparent z-10 transition-opacity duration-700">
                    <div class="w-14 h-14 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-3"></div>
                    <span class="text-[10px] font-bold text-gold uppercase tracking-widest animate-pulse">Cargando 3D...</span>
                </div>
                <!-- Div donde se renderizará el canvas de Three.js -->
                <div id="screw-container" class="w-full h-full relative z-20 pointer-events-auto" style="background: transparent; opacity: 0; transition: opacity 1s ease-in;"></div>
            </div>
            
        </div>

        <!-- Analíticas Visuales Avanzadas (Charts) -->
        <div class="mb-5 flex flex-wrap items-center justify-between gap-4 mt-8">
            <h3 class="font-headline text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span class="material-symbols-outlined text-gold">bar_chart</span> Analíticas de Rendimiento
            </h3>
            
            <!-- Selector de Tiempo -->
            <div class="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-industrial-gray">
                <button class="time-selector-btn active px-4 py-1.5 rounded-md text-xs font-bold transition-all bg-gold text-black shadow-[0_0_10px_rgba(212,175,55,0.3)]" data-period="hoy">HOY</button>
                <button class="time-selector-btn px-4 py-1.5 rounded-md text-xs font-bold text-slate-400 hover:text-white transition-all" data-period="7dias">7 DÍAS</button>
                <button class="time-selector-btn px-4 py-1.5 rounded-md text-xs font-bold text-slate-400 hover:text-white transition-all" data-period="mes">ESTE MES</button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 max-w-7xl">
            <!-- Pulso de Ventas (Line Chart) -->
            <div class="lg:col-span-2 bg-navy-premium border border-gold/10 p-5 rounded-[12px] relative overflow-hidden group hover:border-gold/30 hover-gold-glow transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
                <h4 class="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm text-gold">show_chart</span> PULSO DE VENTAS
                </h4>
                <div class="h-64 w-full relative">
                    <canvas id="pulso-ventas-chart"></canvas>
                </div>
            </div>

            <!-- Top Ventas por Categoría (Bar Chart) -->
            <div class="bg-navy-premium border border-gold/10 p-5 rounded-[12px] relative overflow-hidden group hover:border-gold/30 hover-gold-glow transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
                <h4 class="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm text-gold">leaderboard</span> TOP VENTAS POR CATEGORÍA
                </h4>
                <div class="h-64 w-full relative">
                    <canvas id="top-categorias-chart"></canvas>
                </div>
            </div>
        </div>

        <!-- Acciones Recomendadas -->
        <h3 class="font-headline text-sm font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2 mt-8">
            <span class="material-symbols-outlined text-gold">bolt</span> Acciones Recomendadas
        </h3>
        
        <div id="acciones-recomendadas-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div class="text-slate-500 text-xs font-bold uppercase tracking-wider animate-pulse ml-2">Analizando oportunidades...</div>
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
                <h4 class="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-red-900/20 pb-2">
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
