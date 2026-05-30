/**
 * Vista de Clientes - Panel de control y directorio
 */

export const renderClientsPage = () => {
    return `
    <div class="space-y-6 animate-in fade-in duration-300">
        <!-- Encabezado con acción -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 class="font-headline text-2xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <span class="material-symbols-outlined text-gold text-3xl">group</span> Directorio de Clientes
                </h2>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Gestión fiscal y registro de clientes recurrentes</p>
            </div>
            
            <button id="btn-add-client" class="bg-gold text-navy px-5 py-3 text-xs font-black uppercase tracking-widest shadow-[0_4px_0_#B8962F] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-sm">person_add</span> + Nuevo Cliente
            </button>
        </div>

        <!-- Indicadores Rápidos (KPIs) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="clients-kpi-container">
            <div class="bg-navy border border-industrial-gray p-4 flex items-center justify-between">
                <div>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Registrados</p>
                    <p id="kpi-total-clients" class="text-2xl font-headline font-black text-white mt-1">0</p>
                </div>
                <span class="material-symbols-outlined text-gold text-3xl opacity-50">groups</span>
            </div>
            
            <div class="bg-navy border border-industrial-gray p-4 flex items-center justify-between">
                <div>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Clientes Jurídicos (RIF J-)</p>
                    <p id="kpi-juridicos-clients" class="text-2xl font-headline font-black text-white mt-1">0</p>
                </div>
                <span class="material-symbols-outlined text-gold text-3xl opacity-50">business</span>
            </div>
            
            <div class="bg-navy border border-industrial-gray p-4 flex items-center justify-between">
                <div>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Clientes Naturales (V- / E-)</p>
                    <p id="kpi-naturales-clients" class="text-2xl font-headline font-black text-white mt-1">0</p>
                </div>
                <span class="material-symbols-outlined text-gold text-3xl opacity-50">person</span>
            </div>
        </div>

        <!-- Filtros y Directorio -->
        <div class="bg-navy border border-industrial-gray flex flex-col">
            <!-- Barra de Búsqueda -->
            <div class="p-4 border-b border-industrial-gray bg-dark-gray flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="relative flex-1 max-w-lg">
                    <span class="material-symbols-outlined absolute left-3 top-3 text-slate-500">search</span>
                    <input id="clients-search-input" type="text"
                        style="background:#0B1929; color:#D4A817; border:1px solid #2a3a4a;"
                        class="w-full text-sm pl-10 p-3 outline-none uppercase font-bold"
                        placeholder="Buscar por RIF, Cédula, Nombre o Teléfono..." />
                </div>
                <div id="clients-count-badge" class="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-right">
                    Cargando listado...
                </div>
            </div>

            <!-- Tabla de Datos -->
            <div class="table-responsive-wrapper">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-industrial-gray text-slate-500 font-bold text-[9px] uppercase tracking-widest bg-black/10">
                            <th class="p-4">RIF / Cédula</th>
                            <th class="p-4">Nombre / Razón Social</th>
                            <th class="p-4">Teléfono</th>
                            <th class="p-4">Dirección Fiscal</th>
                            <th class="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="clients-table-body" class="divide-y divide-industrial-gray text-xs font-bold text-slate-300">
                        <!-- Renderizado dinámico vía JS -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `;
};

/**
 * Renderiza una sola fila de cliente en la tabla
 */
export const renderClientRow = (client) => {
    const telefono = client.phone_number || '<span class="text-slate-600 font-normal">NO REGISTRADO</span>';
    const direccion = client.address || '<span class="text-slate-600 font-normal">NO REGISTRADO</span>';
    const nombreCompleto = `${client.first_name} ${client.last_name || ''}`.trim();
    
    // Normalizar y formatear documento de identidad
    let displayCedula = client.tax_id || '';
    let raw = String(displayCedula).toUpperCase().trim();
    if (/^\d+$/.test(raw)) raw = `V-${raw}`; // Asumir V- si solo son números
    
    const match = raw.match(/^([VEJG])-?(.*)$/);
    if (match) {
        const prefix = match[1];
        const num = match[2].replace(/\D/g, '');
        if (['V', 'E'].includes(prefix) && num) {
            displayCedula = `${prefix}-${new Intl.NumberFormat('es-VE').format(num)}`;
        } else if (['J', 'G'].includes(prefix) && num) {
            if (num.length > 8) {
                displayCedula = `${prefix}-${num.slice(0, 8)}-${num.slice(8, 9)}`;
            } else {
                displayCedula = `${prefix}-${num}`;
            }
        } else {
            displayCedula = raw;
        }
    } else {
        displayCedula = raw;
    }
    
    return `
    <tr class="hover:bg-white/5 transition-colors border-b border-industrial-gray">
        <td class="p-4 font-mono text-gold uppercase text-sm whitespace-nowrap">${displayCedula}</td>
        <td class="p-4 uppercase text-white">${nombreCompleto}</td>
        <td class="p-4 uppercase font-mono">${telefono}</td>
        <td class="p-4 uppercase text-[10px] max-w-xs truncate" title="${direccion}">${direccion}</td>
        <td class="p-4 text-center">
            <div class="flex items-center justify-center gap-2">
                <button class="btn-edit-client text-slate-400 hover:text-gold p-1 flex items-center justify-center transition-colors" data-id="${client.id}" title="Editar Cliente">
                    <span class="material-symbols-outlined text-lg">edit</span>
                </button>
            </div>
        </td>
    </tr>
    `;
};
