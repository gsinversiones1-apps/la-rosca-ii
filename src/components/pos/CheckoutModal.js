/**
 * Componente Modal de Checkout (Identificación de Cliente)
 * Con soporte para creación rápida de clientes, validación fiscal y soporte de selección por teclado.
 */

import { GlobalState } from '../../context/State.js';
import { formatCurrency } from '../../utils/formatters.js';

export const renderCheckoutModal = (totals) => {
    return `
    <div id="checkout-modal-container" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-in fade-in duration-300">
        <div class="bg-navy border border-industrial-gray w-full max-w-lg shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            
            <div class="p-6 border-b border-industrial-gray flex justify-between items-center bg-dark-gray">
                <h3 class="font-headline text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <span class="material-symbols-outlined text-gold">point_of_sale</span> Checkout
                </h3>
                <button id="btn-close-checkout" class="text-slate-500 hover:text-white transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <!-- Método de Pago -->
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Método de Pago</label>
                    <select id="checkout-metodo-pago" class="w-full bg-dark-gray border border-industrial-gray text-white text-sm p-3 focus:border-gold outline-none uppercase font-bold">
                        <option value="PAGO MOVIL">Pago Móvil</option>
                        <option value="PUNTO DE VENTA">Punto de Venta</option>
                        <option value="EFECTIVO BS">Efectivo Bs</option>
                        <option value="DIVISAS">Divisas (USD) + 3% IGTF</option>
                    </select>
                </div>

                <!-- Resumen de Totales Fiscales -->
                <div class="bg-dark-gray p-4 border border-industrial-gray space-y-2" id="checkout-fiscal-breakdown">
                    <div class="flex justify-between text-xs text-slate-400">
                        <span>Subtotal</span>
                        <span>$${formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div class="flex justify-between text-xs text-slate-400">
                        <span>IVA (16%)</span>
                        <span>$${formatCurrency(totals.iva)}</span>
                    </div>
                    ${totals.igtf > 0 ? `
                    <div class="flex justify-between text-xs text-red-400">
                        <span>IGTF (3%)</span>
                        <span>$${formatCurrency(totals.igtf)}</span>
                    </div>
                    ` : ''}
                    <div class="flex justify-between items-end border-t border-industrial-gray pt-2 mt-2">
                        <div>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total a Pagar</p>
                            <p class="text-2xl font-headline font-black text-gold">$${formatCurrency(totals.totalUsd)}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-bold text-white">${formatCurrency(totals.totalBs)} Bs.</p>
                        </div>
                    </div>
                </div>

                <!-- Buscador de Cliente Inteligente -->
                <div class="space-y-2 relative">
                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                        <span>Identificación del Cliente</span>
                        <span class="text-slate-400 text-[8px]">↑↓ para navegar, Enter para seleccionar</span>
                    </label>
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-3 top-3 text-slate-500">search</span>
                        <input id="checkout-client-search" type="text" autocomplete="off"
                            style="background:#0B1929; color:#D4A817; border:1px solid #2a3a4a;"
                            class="w-full text-sm pl-10 p-3 outline-none uppercase font-bold"
                            placeholder="Buscar RIF, Cédula o Nombre..." />
                    </div>
                    
                    <!-- Contenedor de Resultados del Autocompletado -->
                    <div id="checkout-client-results" class="absolute w-full bg-dark-gray border border-industrial-gray mt-1 shadow-xl z-20 hidden max-h-48 overflow-y-auto custom-scrollbar">
                        <!-- Se llena vía JS -->
                    </div>
                </div>

                <div id="checkout-selected-client-box" class="hidden bg-gold/10 border border-gold p-4 relative">
                    <button id="btn-clear-checkout-client" class="absolute top-2 right-2 text-gold hover:text-white">
                        <span class="material-symbols-outlined text-sm">close</span>
                    </button>
                    <p class="text-[10px] text-gold font-bold uppercase tracking-widest mb-1">Cliente Seleccionado</p>
                    <p id="checkout-selected-name" class="text-sm font-black text-white uppercase"></p>
                    <p id="checkout-selected-rif" class="text-xs text-slate-400 font-bold uppercase"></p>
                </div>

                <button id="btn-checkout-consumidor-final" class="w-full text-center border border-dashed border-slate-600 p-2 text-xs font-bold text-slate-400 hover:text-white hover:border-white transition-colors uppercase">
                    + FACTURAR COMO CONSUMIDOR FINAL
                </button>
                
                <!-- Formulario Rápido Cliente Nuevo (Oculto por defecto) -->
                <form id="checkout-new-client-form" class="hidden space-y-3 bg-dark-gray p-4 border border-industrial-gray border-dashed">
                    <p class="text-[10px] text-gold font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                        <span class="material-symbols-outlined text-xs">person_add</span> Registrar Nuevo Cliente
                    </p>
                    <div class="grid grid-cols-2 gap-2">
                        <input name="first_name" required type="text" placeholder="NOMBRE"
                               style="background:#0B1929; color:#D4A817; border:1px solid #2a3a4a;"
                               class="w-full text-xs p-2.5 outline-none uppercase font-bold"/>
                        <input name="last_name" type="text" placeholder="APELLIDO (OPCIONAL)"
                               style="background:#0B1929; color:#D4A817; border:1px solid #2a3a4a;"
                               class="w-full text-xs p-2.5 outline-none uppercase font-bold"/>
                    </div>
                    <div class="flex gap-2">
                        <div class="w-1/2 flex flex-col gap-1">
                            <input name="tax_id" id="checkout-new-rif" required type="text" placeholder="CÉDULA / RIF (V-XXXXXXX)"
                                   style="background:#0B1929; color:#D4A817; border:1px solid #2a3a4a;"
                                   class="w-full text-xs p-2.5 outline-none uppercase font-bold"/>
                            <span id="checkout-rif-error" class="text-[8px] text-slate-500 font-bold">V-XXXXXXXX o J-XXXXXXXX-X</span>
                        </div>
                        <div class="w-1/2">
                            <input name="phone_number" id="checkout-new-telefono" type="text" placeholder="TELÉFONO (04XX-XXXXXXX)"
                                   style="background:#0B1929; color:#D4A817; border:1px solid #2a3a4a;"
                                   class="w-full text-xs p-2.5 outline-none uppercase font-bold"/>
                        </div>
                    </div>
                </form>

            </div>

            <!-- Error de validación legal -->
            <div id="checkout-validation-error" class="hidden mx-6 mb-2 p-3 border border-red-500 bg-red-500/10 text-center">
                <p class="text-[10px] font-black text-red-400 uppercase tracking-widest">
                    ⚠ Debe identificar al cliente antes de emitir la factura
                </p>
                <p class="text-[9px] text-red-400/70 mt-1">Busca al cliente o registra uno nuevo arriba</p>
            </div>

            <div class="p-6 border-t border-industrial-gray flex flex-col gap-3 bg-dark-gray">
                <p class="text-[9px] text-slate-500 text-center uppercase tracking-widest">
                    <span class="text-gold font-bold">*</span> Obligatorio por ley — Toda factura debe identificar al cliente (SENIAT)
                </p>
                <button id="btn-confirm-checkout" disabled class="w-full bg-gold text-navy py-4 text-xs font-black uppercase tracking-[0.1em] shadow-[0_4px_0_#B8962F] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    CONFIRMAR PAGO Y EMITIR FACTURA
                </button>
            </div>
        </div>
    </div>
    `;
};

/**
 * Agrega validación y formateo en vivo para los campos del formulario de Checkout
 */
export const setupCheckoutValidation = () => {
    const rifInput = document.getElementById('checkout-new-rif');
    const telInput = document.getElementById('checkout-new-telefono');
    const errorSpan = document.getElementById('checkout-rif-error');
    const btnConfirm = document.getElementById('btn-confirm-checkout');

    if (rifInput) {
        rifInput.addEventListener('input', (e) => {
            let val = e.target.value.toUpperCase().replace(/[^VJGEx0-9-]/g, '');
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
                    let numbers = raw.replace(/[^0-9]/g, '');
                    if (numbers.length > 8) {
                        formatted = `V-${numbers.slice(0, 8)}-${numbers.slice(8, 9)}`;
                    } else if (numbers.length > 0) {
                        formatted = `V-${numbers}`;
                    }
                }
            }
            
            e.target.value = formatted;
            
            // Validar formato completo
            const regex = /^[VJGVEvjgve]-[0-9]{7,8}(-[0-9])?$/;
            const isValid = regex.test(formatted);
            
            if (isValid) {
                rifInput.style.borderColor = '#22c55e';
                if (errorSpan) {
                    errorSpan.innerText = '✓ RIF Válido';
                    errorSpan.className = 'text-[8px] text-green-500 font-bold';
                }
                if (btnConfirm) btnConfirm.removeAttribute('disabled');
            } else {
                rifInput.style.borderColor = '#ef4444';
                if (errorSpan) {
                    errorSpan.innerText = '✗ RIF Inválido';
                    errorSpan.className = 'text-[8px] text-red-500 font-bold';
                }
                if (btnConfirm) btnConfirm.setAttribute('disabled', 'true');
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
