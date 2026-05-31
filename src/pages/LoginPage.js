export const renderLoginPage = () => {
    return `
    <div class="min-h-screen bg-background flex items-center justify-center p-4">
        <div class="bg-navy-premium p-8 w-full max-w-md animate-in fade-in zoom-in duration-500 relative overflow-hidden">
            <!-- Background Glow -->
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
            
            <div class="text-center mb-8">
                <div class="flex justify-center mb-4">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                        <span class="material-symbols-outlined text-gold text-4xl">storefront</span>
                    </div>
                </div>
                <h1 class="text-3xl font-black text-white font-headline uppercase tracking-widest mb-2">
                    SaaS <span class="text-gold">MASTER</span>
                </h1>
                <p class="text-xs text-slate-400 font-bold tracking-widest uppercase">Portal de Administración</p>
            </div>

            <form id="login-form" class="space-y-6">
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-3 top-3 text-slate-500">mail</span>
                        <input type="email" id="login-email" required
                            class="w-full bg-dark-gray border border-industrial-gray text-white px-10 py-3 focus:outline-none focus:border-gold transition-colors font-bold text-sm"
                            placeholder="admin@tunegocio.com"
                        >
                    </div>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contraseña</label>
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-3 top-3 text-slate-500">lock</span>
                        <input type="password" id="login-password" required
                            class="w-full bg-dark-gray border border-industrial-gray text-white px-10 py-3 pr-12 focus:outline-none focus:border-gold transition-colors font-bold text-sm"
                            placeholder="••••••••"
                        >
                        <button type="button" id="btn-toggle-password" 
                            class="absolute right-3 top-3 text-slate-500 hover:text-gold focus:text-gold transition-colors flex items-center justify-center p-0.5 outline-none" 
                            aria-label="Mostrar contraseña">
                            <span id="password-toggle-icon" class="flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            </span>
                        </button>
                    </div>
                </div>

                <div id="login-error" class="hidden bg-red-500/10 border border-red-500/50 p-3 rounded text-red-500 text-xs text-center font-bold">
                    Credenciales incorrectas.
                </div>

                <button type="submit" id="btn-login-submit"
                    class="w-full btn-gold-premium py-4 text-xs font-black uppercase tracking-[0.1em] shadow-lg active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                    <span>ACCEDER AL SISTEMA</span>
                    <span class="material-symbols-outlined text-sm font-black">login</span>
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <p class="text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                    Arquitectura Multi-Tenant • Seguridad RLS
                </p>
            </div>
        </div>
    </div>
    `;
};
