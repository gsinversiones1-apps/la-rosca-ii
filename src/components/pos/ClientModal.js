/**
 * Componente Modal para Registrar Nuevo Cliente
 */

export const renderClientModal = () => {
    return `
    <div id="modal-container" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div class="bg-navy border border-industrial-gray w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div class="p-6 border-b border-industrial-gray flex justify-between items-center">
                <h3 class="font-headline text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <span class="material-symbols-outlined text-gold">person_add</span> Nuevo Cliente
                </h3>
                <button id="btn-close-modal" class="text-slate-500 hover:text-white transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <form id="form-new-client" class="p-6 space-y-4">
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Nombre Completo / Razón Social</label>
                    <input name="nombre" required type="text" class="w-full bg-dark-gray border border-industrial-gray text-white text-xs p-3 focus:border-gold outline-none uppercase font-bold"/>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">RIF / Cédula</label>
                        <input name="rif" required type="text" class="w-full bg-dark-gray border border-industrial-gray text-white text-xs p-3 focus:border-gold outline-none uppercase font-bold" placeholder="J-12345678-9"/>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Teléfono</label>
                        <input name="telefono" type="text" class="w-full bg-dark-gray border border-industrial-gray text-white text-xs p-3 focus:border-gold outline-none uppercase font-bold"/>
                    </div>
                </div>
                
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Dirección Fiscal</label>
                    <textarea name="direccion" class="w-full bg-dark-gray border border-industrial-gray text-white text-xs p-3 focus:border-gold outline-none uppercase font-bold h-20 resize-none"></textarea>
                </div>
                
                <div class="pt-4 flex gap-3">
                    <button type="button" id="btn-cancel-client" class="flex-1 border border-industrial-gray text-slate-400 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                        Cancelar
                    </button>
                    <button type="submit" class="flex-1 bg-gold text-navy py-3 text-[10px] font-black uppercase tracking-widest shadow-[0_4px_0_#B8962F] active:translate-y-1 active:shadow-none transition-all">
                        Guardar Cliente
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;
};
