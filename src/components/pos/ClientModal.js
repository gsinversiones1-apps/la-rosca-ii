/**
 * Componente Modal para Registrar / Editar Cliente
 * Con soporte de edición, validación venezolana (Cédula/RIF) y UI Premium
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

    // Determinar prefijo y número
    let docPrefix = 'V';
    let docNumber = '';
    if (clientData.cedula) {
        const match = clientData.cedula.match(/^([VEJGvejg])-?(.*)$/);
        if (match) {
            docPrefix = match[1].toUpperCase();
            docNumber = match[2].replace(/\D/g, '');
        }
    }
    
    // Formatear el número para mostrar
    let formattedDocNumber = docNumber;
    if (['V', 'E'].includes(docPrefix) && docNumber) {
        formattedDocNumber = new Intl.NumberFormat('es-VE').format(docNumber);
    } else if (['J', 'G'].includes(docPrefix) && docNumber) {
        if (docNumber.length > 8) {
            formattedDocNumber = `${docNumber.slice(0, 8)}-${docNumber.slice(8, 9)}`;
        }
    }

    const isJuridico = ['J', 'G'].includes(docPrefix);

    return `
    <div id="modal-container" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div class="bg-navy-premium border border-gold/20 w-full max-w-md rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 overflow-hidden">
            <div class="p-5 border-b border-gold/20 flex justify-between items-center bg-dark-gray/50 backdrop-blur-sm">
                <h3 class="font-headline text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <span class="material-symbols-outlined text-gold">${isEdit ? 'edit_note' : 'person_add'}</span> ${title}
                </h3>
                <button id="btn-close-modal" class="text-slate-400 hover:text-gold transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <form id="form-new-client" class="p-6 space-y-5" data-id="${clientData.id}">
                
                <!-- Documento de Identidad -->
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-widest">Documento de Identidad</label>
                    <div class="flex">
                        <select id="client-modal-prefix" name="prefix" class="bg-dark-gray border border-industrial-gray border-r-0 text-white text-xs p-3 focus:border-gold outline-none font-bold rounded-l cursor-pointer w-[72px]">
                            <option value="V" ${docPrefix === 'V' ? 'selected' : ''}>V-</option>
                            <option value="E" ${docPrefix === 'E' ? 'selected' : ''}>E-</option>
                            <option value="J" ${docPrefix === 'J' ? 'selected' : ''}>J-</option>
                            <option value="G" ${docPrefix === 'G' ? 'selected' : ''}>G-</option>
                        </select>
                        <input name="rif_number" id="client-modal-doc-number" required type="text" value="${formattedDocNumber}" autocomplete="off"
                            class="flex-1 bg-dark-gray border border-industrial-gray text-white text-xs p-3 focus:border-gold outline-none uppercase font-bold rounded-r transition-colors" 
                            placeholder="Ej: 12.345.678"/>
                    </div>
                    <span id="rif-validation-msg" class="text-[9px] mt-1.5 block font-bold text-slate-500">Solo números. Separadores automáticos.</span>
                    <input type="hidden" name="rif" id="client-modal-rif-hidden" value="${clientData.cedula}" />
                </div>

                <!-- Campos de Nombre Dinámicos -->
                <div id="dynamic-name-container" class="${isJuridico ? '' : 'grid grid-cols-2 gap-4'}">
                    <div id="field-nombre" class="${isJuridico ? 'w-full' : ''}">
                        <label id="label-nombre" class="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-widest">
                            ${isJuridico ? 'Razón Social' : 'Nombres'}
                        </label>
                        <input name="nombre" id="client-modal-nombre" required type="text" value="${clientData.nombre}" autocomplete="off"
                            class="w-full bg-dark-gray border border-industrial-gray text-white text-xs p-3 focus:border-gold outline-none uppercase font-bold rounded transition-colors"/>
                    </div>
                    <div id="field-apellido" class="${isJuridico ? 'hidden' : ''}">
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-widest">Apellidos</label>
                        <input name="apellido" id="client-modal-apellido" type="text" value="${clientData.apellido || ''}" autocomplete="off"
                            class="w-full bg-dark-gray border border-industrial-gray text-white text-xs p-3 focus:border-gold outline-none uppercase font-bold rounded transition-colors" placeholder="(OPCIONAL)"/>
                    </div>
                </div>
                
                <!-- Teléfono y Dirección -->
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-widest">Teléfono</label>
                    <input name="telefono" id="client-modal-telefono" type="text" value="${clientData.telefono || ''}" autocomplete="off"
                        class="w-full bg-dark-gray border border-industrial-gray text-white text-xs p-3 focus:border-gold outline-none uppercase font-bold rounded transition-colors" 
                        placeholder="Ej: 0414-1234567"/>
                </div>
                
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-widest">Dirección Fiscal</label>
                    <textarea name="direccion" id="client-modal-direccion" class="w-full bg-dark-gray border border-industrial-gray text-white text-xs p-3 focus:border-gold outline-none uppercase font-bold rounded h-20 resize-none transition-colors">${clientData.direccion || ''}</textarea>
                </div>
                
                <div class="pt-2 flex gap-3">
                    <button type="button" id="btn-cancel-client" class="flex-1 border border-industrial-gray text-slate-400 py-3.5 text-[10px] font-black uppercase tracking-widest hover:text-white rounded transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" id="btn-submit-client" class="flex-1 btn-gold-premium py-3.5 text-[10px] uppercase tracking-widest rounded transition-all">
                        ${btnText}
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;
};

/**
 * Validadores y formateadores de campos para enlazar
 */
export const setupClientModalValidation = () => {
    const prefixSelect = document.getElementById('client-modal-prefix');
    const docInput = document.getElementById('client-modal-doc-number');
    const hiddenRifInput = document.getElementById('client-modal-rif-hidden');
    
    const container = document.getElementById('dynamic-name-container');
    const fieldNombre = document.getElementById('field-nombre');
    const fieldApellido = document.getElementById('field-apellido');
    const labelNombre = document.getElementById('label-nombre');
    
    const nombreInput = document.getElementById('client-modal-nombre');
    const apellidoInput = document.getElementById('client-modal-apellido');
    const dirInput = document.getElementById('client-modal-direccion');
    
    const telInput = document.getElementById('client-modal-telefono');
    const submitBtn = document.getElementById('btn-submit-client');
    const validationMsg = document.getElementById('rif-validation-msg');

    // Función para sanear y normalizar nombres
    const sanitizeName = (val) => {
        return val.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ .]/gi, '');
    };

    [nombreInput, apellidoInput, dirInput].forEach(input => {
        if (!input) return;
        input.addEventListener('input', (e) => {
            const start = e.target.selectionStart;
            if (e.target.id === 'client-modal-direccion') {
                e.target.value = e.target.value.toUpperCase();
            } else {
                e.target.value = sanitizeName(e.target.value);
            }
            e.target.setSelectionRange(start, start);
        });
        input.addEventListener('blur', (e) => {
            e.target.value = e.target.value.trim().replace(/\s{2,}/g, ' ');
        });
    });

    const updateDocFormat = () => {
        if (!prefixSelect || !docInput) return;
        
        const prefix = prefixSelect.value;
        let rawNum = docInput.value.replace(/\D/g, ''); // Solo extraer números
        
        // Determinar UI Dinámica de Nombres
        const isJuridico = ['J', 'G'].includes(prefix);
        if (isJuridico) {
            container.classList.remove('grid', 'grid-cols-2', 'gap-4');
            fieldNombre.classList.add('w-full');
            fieldApellido.classList.add('hidden');
            labelNombre.innerText = 'Razón Social';
            if (apellidoInput) {
                apellidoInput.removeAttribute('required');
                apellidoInput.value = ''; // Limpiar apellido si cambia a jurídico
            }
        } else {
            container.classList.add('grid', 'grid-cols-2', 'gap-4');
            fieldNombre.classList.remove('w-full');
            fieldApellido.classList.remove('hidden');
            labelNombre.innerText = 'Nombres';
        }

        // Formateo Visual
        let formatted = rawNum;
        if (['V', 'E'].includes(prefix) && rawNum) {
            // Formatear con puntos de miles para V y E
            formatted = new Intl.NumberFormat('es-VE').format(rawNum);
            if (hiddenRifInput) hiddenRifInput.value = `${prefix}-${rawNum}`;
        } else if (['J', 'G'].includes(prefix) && rawNum) {
            // Formato J-12345678-0
            if (rawNum.length > 8) {
                formatted = `${rawNum.slice(0, 8)}-${rawNum.slice(8, 9)}`;
            }
            if (hiddenRifInput) hiddenRifInput.value = `${prefix}-${rawNum}`;
        } else {
            if (hiddenRifInput) hiddenRifInput.value = prefix;
        }

        docInput.value = formatted;

        // Validación visual y bloqueo de botón
        let isValid = false;
        if (['V', 'E'].includes(prefix)) {
            isValid = rawNum.length >= 6 && rawNum.length <= 8;
        } else {
            isValid = rawNum.length === 9;
        }

        if (isValid) {
            docInput.classList.remove('border-red-500');
            docInput.classList.add('border-green-500', 'text-green-400');
            prefixSelect.classList.add('border-green-500', 'text-green-400');
            validationMsg.innerText = '✓ Formato válido';
            validationMsg.classList.remove('text-red-500', 'text-slate-500');
            validationMsg.classList.add('text-green-500');
            if (submitBtn) submitBtn.removeAttribute('disabled');
        } else {
            docInput.classList.remove('border-green-500', 'text-green-400');
            prefixSelect.classList.remove('border-green-500', 'text-green-400');
            if (rawNum.length > 0) {
                docInput.classList.add('border-red-500');
                validationMsg.innerText = '✗ Formato incompleto';
                validationMsg.classList.remove('text-green-500', 'text-slate-500');
                validationMsg.classList.add('text-red-500');
            } else {
                docInput.classList.remove('border-red-500');
                validationMsg.innerText = 'Solo números. Separadores automáticos.';
                validationMsg.classList.remove('text-green-500', 'text-red-500');
                validationMsg.classList.add('text-slate-500');
            }
            if (submitBtn) submitBtn.setAttribute('disabled', 'true');
        }
    };

    if (prefixSelect) prefixSelect.addEventListener('change', updateDocFormat);
    if (docInput) {
        docInput.addEventListener('input', (e) => {
            const start = e.target.selectionStart;
            const preLen = e.target.value.length;
            updateDocFormat();
            const postLen = e.target.value.length;
            const diff = postLen - preLen;
            let newStart = start + diff;
            e.target.setSelectionRange(newStart, newStart);
        });
        
        // Trigger initial validation format
        if (docInput.value) {
            updateDocFormat();
        }
    }

    if (telInput) {
        telInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 4) {
                e.target.value = `${val.slice(0, 4)}-${val.slice(4, 11)}`;
            } else {
                e.target.value = val;
            }
        });
    }
};
