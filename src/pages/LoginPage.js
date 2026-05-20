export const renderLoginPage = () => {
    return `
    <div class="min-h-screen bg-background flex items-center justify-center p-4">
        <div class="bg-navy p-8 rounded-lg shadow-2xl border border-industrial-gray w-full max-w-md animate-in fade-in zoom-in duration-500 relative overflow-hidden">
            <!-- Background Glow -->
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
            
            <div class="text-center mb-8">
                <h1 class="text-3xl font-black text-white font-headline uppercase tracking-widest mb-2">
                    TORNILLERÍA <span class="text-gold">LA ROSCA II</span>
                </h1>
                <p class="text-xs text-slate-400 font-bold tracking-widest uppercase">Sistema de Gestión (SaaS)</p>
            </div>

            <form id="login-form" class="space-y-6">
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-3 top-3 text-slate-500">mail</span>
                        <input type="email" id="login-email" required
                            class="w-full bg-dark-gray border border-industrial-gray text-white px-10 py-3 focus:outline-none focus:border-gold transition-colors font-bold text-sm"
                            placeholder="admin@larosca.com"
                        >
                    </div>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contraseña</label>
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-3 top-3 text-slate-500">lock</span>
                        <input type="password" id="login-password" required
                            class="w-full bg-dark-gray border border-industrial-gray text-white px-10 py-3 focus:outline-none focus:border-gold transition-colors font-bold text-sm"
                            placeholder="••••••••"
                        >
                    </div>
                </div>

                <div id="login-error" class="hidden bg-red-500/10 border border-red-500/50 p-3 rounded text-red-500 text-xs text-center font-bold">
                    Credenciales incorrectas.
                </div>

                <button type="submit" id="btn-login-submit"
                    class="w-full bg-gold text-navy py-4 text-xs font-black uppercase tracking-[0.1em] shadow-[0_4px_0_#B8962F] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                    <span>INICIAR SESIÓN</span>
                    <span class="material-symbols-outlined text-sm">login</span>
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <p class="text-[9px] text-slate-500 uppercase tracking-widest">
                    Protegido por Supabase Auth
                </p>
            </div>
        </div>
    </div>
    `;
};
