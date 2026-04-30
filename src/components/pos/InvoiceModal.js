/**
 * Componente de Factura / Ticket de Venta
 */
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export const renderInvoiceModal = (sale, client, items, config, tasa) => {
    const subtotal = items.reduce((acc, i) => acc + (i.precio_usd * i.cantidad), 0);
    const iva = subtotal * (config.iva / 100);
    const totalUsd = subtotal + iva;
    const totalBs = totalUsd * tasa;

    return `
    <div id="modal-container" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
        <div class="bg-white w-full max-w-sm shadow-2xl overflow-hidden flex flex-col font-mono text-[10px]" style="color:#0B1929;">
            
            <!-- CONTENIDO IMPRIMIBLE -->
            <div id="printable-invoice" class="p-8 bg-white">
                <div class="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
                    <h2 class="font-black text-xs uppercase" style="color:#0B1929;">${config.storeName}</h2>
                    <p style="color:#0B1929;">${config.rif}</p>
                    <p class="text-[8px] leading-tight" style="color:#0B1929;">${config.address}</p>
                </div>

                <div class="mb-4 space-y-1" style="color:#0B1929;">
                    <div class="flex justify-between"><span>FACTURA #:</span> <span class="font-bold">${sale.id.toString().padStart(6, '0')}</span></div>
                    <div class="flex justify-between"><span>FECHA:</span> <span>${formatDateTime(new Date())}</span></div>
                </div>

                <div class="mb-4 border-t border-b border-dashed border-slate-200 py-2" style="color:#0B1929;">
                    <p class="font-bold border-b border-slate-100 mb-1 pb-1">CLIENTE:</p>
                    <p class="uppercase font-black">${client ? (client.nombre + ' ' + (client.apellido||'')) : 'CONSUMIDOR FINAL'}</p>
                    <p>C.I./RIF: ${client ? client.cedula : 'V-00000000-0'}</p>
                    ${client?.direccion ? `<p class="text-[8px] italic">${client.direccion}</p>` : ''}
                </div>

                <table class="w-full mb-4" style="color:#0B1929;">
                    <thead>
                        <tr class="border-b border-slate-300 text-left">
                            <th class="py-1">CANT</th>
                            <th class="py-1">DESCRIPCIÓN</th>
                            <th class="py-1 text-right">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td class="py-1">${item.cantidad}</td>
                                <td class="py-1 uppercase">${item.nombre.substring(0, 20)}...</td>
                                <td class="py-1 text-right">$${formatCurrency(item.precio_usd * item.cantidad)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="border-t border-dashed border-slate-300 pt-3 space-y-1" style="color:#0B1929;">
                    <div class="flex justify-between"><span>SUBTOTAL:</span> <span>$${formatCurrency(subtotal)}</span></div>
                    <div class="flex justify-between"><span>IVA (${config.iva}%):</span> <span>$${formatCurrency(iva)}</span></div>
                    <div class="flex justify-between font-black text-xs pt-2 border-t border-slate-200" style="color:#0B1929;">
                        <span>TOTAL USD:</span> <span>$${formatCurrency(totalUsd)}</span>
                    </div>
                    <div class="flex justify-between font-bold p-2 mt-2" style="background:#0B1929; color:#D4A817;">
                        <span>TOTAL BS:</span> <span>${formatCurrency(totalBs)} Bs.</span>
                    </div>
                </div>

                <div class="mt-6 text-center text-[8px]" style="color:#0B1929;">
                    <p>*** GRACIAS POR SU COMPRA ***</p>
                    <p>Tasa BCV: ${formatCurrency(tasa)} Bs.</p>
                </div>
            </div>

            <!-- ACCIONES -->
            <div class="p-4 bg-slate-100 flex gap-2 no-print">
                <button id="btn-print-invoice" class="flex-1 bg-navy text-white py-3 font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-sm">print</span> Imprimir
                </button>
                <button id="btn-close-invoice" class="flex-1 border border-slate-300 text-slate-500 py-3 font-bold uppercase tracking-widest text-[9px] hover:bg-white transition-all">
                    Cerrar
                </button>
            </div>
        </div>
    </div>
    <style>
        @media print {
            body * { visibility: hidden; }
            #printable-invoice, #printable-invoice * { visibility: visible; }
            #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
        </div>
    </style>
    `;
};
