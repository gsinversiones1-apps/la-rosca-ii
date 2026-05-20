/**
 * Componente Modal para Registrar / Editar Cliente
 * Con soporte de edición y validación venezolana en tiempo real (Cédula/RIF y Teléfonos)
 */

export const renderClientModal = (client = null) => {
    const isEdit = !!client;
    const title = isEdit ? 'Editar Cliente' : 'Nuevo Cliente';
    const btnText = isEdit ? 'Guardar Cambios' : 'Guardar Cliente';
    
    const clientData = client || {
        id: '',
        nombre: '',
        apellido: '',
        cedula: '',
        telefono: '',
        direccion: ''
    };

    return `
    <div id="modal-container" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div class="bg-navy border border-industrial-gray w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div class="p-6 border-b border-industrial-gray flex justify-between items-center bg-dark-gray">
                <h3 class="font-headline text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <span class="material-symbols-outlined text-gold">${isEdit ? 'edit_note' : 'person_add'}</span> ${title}
                </h3>
                <button id="btn-close-modal" class="text-slate-500 hover:text-white transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <form id="form-new-client" class="p-6 space-y-4" data-id="${clientData.id}">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Nombre / Razón Social</label>
                        <input name="nombre" required type="text" value="${clientData.nombre}" autocomplete="off"
                            class="w-full bg-dark-gray border border-industrial-gray text-white text-xs p-3 focus:border-gold outline-none uppercase font-bold"/>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Apellido</label>
                        <input name="apellido" type="text" value="${clientData.apellido || ''}" autocomplete="off"
                            class="w-full bg-dark-gray border border-industrial-gray text-white text-xs p-3 focus:border-gold outline-none uppercase font-bold" placeholder="(OPCIONAL)"/>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">RIF / Cédula</label>
                        <input name="rif" id="client-modal-rif" required type="text" value="${clientData.cedula}" autocomplete="off"
                            class="w-full bg-dark-gray border border-industrial-gray text-white text-xs p-3 focus:border-gold outline-none uppercase font-bold" 
                            placeholder="V-12345678 o J-12345678-9"/>
                        <span id="rif-validation-msg" class="text-[9px] mt-1 block font-bold text-slate-500">Formato: V/J/G/E-número</span>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Teléfono</label>
                        <input name="telefono" id="client-modal-telefono" type="text" value="${clientData.telefono || ''}" autocomplete="off"
                            class="w-full bg-dark-gray border border-industrial-gray text-white text-xs p-3 focus:border-gold outline-none uppercase font-bold" 
                            placeholder="0412-1234567"/>
                    </div>
                </div>
                
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Dirección Fiscal</label>
                    <textarea name="direccion" class="w-full bg-dark-gray border border-industrial-gray text-white text-xs p-3 focus:border-gold outline-none uppercase font-bold h-20 resize-none">${clientData.direccion || ''}</textarea>
                </div>
                
                <div class="pt-4 flex gap-3">
                    <button type="button" id="btn-cancel-client" class="flex-1 border border-industrial-gray text-slate-400 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                        Cancelar
                    </button>
                    <button type="submit" id="btn-submit-client" class="flex-1 bg-gold text-navy py-3 text-[10px] font-black uppercase tracking-widest shadow-[0_4px_0_#B8962F] active:translate-y-1 active:shadow-none transition-all">
                        ${btnText}
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;
};

/**
 * Validadores y formateadores de campos venezolanos para enlazar
 */
export const setupClientModalValidation = () => {
    const rifInput = document.getElementById('client-modal-rif');
    const telInput = document.getElementById('client-modal-telefono');
    const submitBtn = document.getElementById('btn-submit-client');
    const validationMsg = document.getElementById('rif-validation-msg');

    if (rifInput) {
        rifInput.addEventListener('input', (e) => {
            let cursor = e.target.selectionStart;
            let val = e.target.value.toUpperCase().replace(/[^VJGEx0-9-]/g, '');
            
            // Eliminar guiones mal posicionados para formatear de nuevo
            let raw = val.replace(/-/g, '');
            let formatted = '';
            
            if (raw.length > 0) {
                const prefix = raw.charAt(0);
                if (['V', 'J', 'G', 'E'].includes(prefix)) {
                    let numbers = raw.slice(1).replace(/[^0-9]/g, '');
                    if (numbers.length > 8) {
                        formatted = `${prefix}-${numbers.slice(0, 8)}-${numbers.slice(8, 9)}`;
                    } else if (numbers.length > 0) {
                        formatted = `${prefix}-${numbers}`;
                    } else {
                        formatted = prefix;
                    }
                } else {
                    // Si empieza con número, agregar "V-" por defecto
                    let numbers = raw.replace(/[^0-9]/g, '');
                    if (numbers.length > 8) {
                        formatted = `V-${numbers.slice(0, 8)}-${numbers.slice(8, 9)}`;
                    } else if (numbers.length > 0) {
                        formatted = `V-${numbers}`;
                    }
                }
            }
            
            e.target.value = formatted;
            
            // Validar formato completo (V/E-xxxxxxxx o J/G-xxxxxxxx-x)
            const regex = /^[VJGVEvjgve]-[0-9]{7,8}(-[0-9])?$/;
            const isValid = regex.test(formatted);
            
            if (isValid) {
                rifInput.classList.remove('border-red-500');
                rifInput.classList.add('border-green-500');
                validationMsg.innerText = '✓ Formato válido';
                validationMsg.classList.remove('text-red-500', 'text-slate-500');
                validationMsg.classList.add('text-green-500');
                if (submitBtn) submitBtn.removeAttribute('disabled');
            } else {
                rifInput.classList.remove('border-green-500');
                rifInput.classList.add('border-red-500');
                validationMsg.innerText = '✗ Formato incorrecto';
                validationMsg.classList.remove('text-green-500', 'text-slate-500');
                validationMsg.classList.add('text-red-500');
                if (submitBtn) submitBtn.setAttribute('disabled', 'true');
            }
        });
    }

    if (telInput) {
        telInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/[^0-9]/g, '');
            if (val.length > 4) {
                e.target.value = `${val.slice(0, 4)}-${val.slice(4, 11)}`;
            } else {
                e.target.value = val;
            }
        });
    }
};
