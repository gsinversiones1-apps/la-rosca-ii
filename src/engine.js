/**
 * ENSAMBLADOR MAESTRO (master.js)
 * Orquestador principal del SaaS Global
 */

import { GlobalState, updateState } from './context/State.js';
import { fetchTasaBCV } from './api/bcv.js';
import { getProductsByTenant } from './api/supabaseClient.js';
import { getClients, createClient } from './api/clients.js';
import { saveSale } from './api/sales.js';
import { getPendingSales, saveProductsLocal, getProductsLocal } from './utils/db.js';
import { buscarTornillos } from './api/inventario.js';
import { processSyncQueue } from './utils/syncManager.js';
import { renderSidebar } from './layouts/Sidebar.js';
import { renderNavbar } from './layouts/Navbar.js';
import { renderPOSPage } from './pages/POSPage.js';
import { renderInventoryPage } from './pages/InventoryPage.js';
import { renderDashboardPage } from './pages/DashboardPage.js';
import { getDashboardData } from './api/dashboard.js';
import { renderProductCard } from './components/pos/ProductCard.js';
import { renderInventoryRow } from './components/inventory/InventoryRow.js';
import { renderCartSidebar } from './components/pos/CartSidebar.js';
import { renderClientModal } from './components/pos/ClientModal.js';
import { renderInvoiceModal } from './components/pos/InvoiceModal.js';
import { renderCheckoutModal } from './components/pos/CheckoutModal.js';
import { useCart } from './hooks/useCart.js';

const { addToCart, removeFromCart, clearCart, calculateTotals } = useCart();

async function updateSyncBadge() {
    try {
        const pendingSales = await getPendingSales();
        const count = pendingSales.length;
        const btn = document.getElementById('btn-sync-queue');
        const badge = document.getElementById('sync-count-badge');
        if (btn && badge) {
            if (count > 0) {
                btn.style.display = 'flex';
                badge.innerText = count;
            } else {
                btn.style.display = 'none';
            }
        }
    } catch (e) {
        console.error('Error actualizando sync badge:', e);
    }
}

async function initApp() {
    console.log('--- Iniciando Ensamblador Maestro SaaS (v2.1) ---');
    
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registrado', reg.scope))
            .catch(err => console.error('Error registrando SW', err));
    }

    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    appContainer.innerHTML = `
        <div id="layout-sidebar"></div>
        <div class="flex-1 ml-64 mr-80 flex flex-col h-full bg-background">
            <div id="layout-navbar"></div>
            <main id="content-area" class="flex-1 overflow-y-auto p-6 custom-scrollbar"></main>
        </div>
        <div id="layout-cart-sidebar"></div>
        <div id="modal-wrapper"></div>
    `;

    document.getElementById('layout-sidebar').innerHTML = renderSidebar(GlobalState.storeName);
    
    const tasa = await fetchTasaBCV();
    updateState('tasaActual', tasa);
    document.getElementById('layout-navbar').innerHTML = renderNavbar(GlobalState.storeName, GlobalState.tasaActual);
    
    try {
        // 1. Cargar caché local primero (Offline-First)
        let localProducts = [];
        try {
            localProducts = await getProductsLocal();
            if (localProducts && localProducts.length > 0) {
                updateState('allProducts', localProducts);
                navigate('pos');
            }
        } catch(e) {}

        // 2. Fetch de datos en background (Stale-while-revalidate)
        if (navigator.onLine) {
            updateStatus('Sincronizando...', 'yellow');
            const [products, clients] = await Promise.all([
                getProductsByTenant(GlobalState.myTenantId),
                getClients()
            ]);
            updateState('allProducts', products);
            updateState('allClients', clients);
            await saveProductsLocal(products); // Actualizar caché
            
            // Si estábamos offline y ya cargó la UI local, refrescamos el grid silenciosamente
            if (localProducts && localProducts.length > 0) {
                renderProductsInGrid();
            } else {
                navigate('pos');
            }
            updateStatus('Conectado', 'green');
        } else {
            updateStatus('Modo Offline', 'yellow');
        }
        
        updateCartUI();
        updateSyncBadge(); // Chequear si hay ventas pendientes

    } catch (e) { 
        console.error('Error inicializando:', e); 
        updateStatus('Desconectado', 'red');
    }

    setupGlobalEvents();
}

function updateCartUI() {
    const container = document.getElementById('layout-cart-sidebar');
    if (container) container.innerHTML = renderCartSidebar();
}

function updateStatus(text, color) {
    const dot = document.getElementById('db-status-dot');
    const label = document.getElementById('db-status-text');
    if (!dot || !label) return;
    const hex = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' };
    dot.style.setProperty('background-color', hex[color], 'important');
    label.innerText = text.toUpperCase();
    label.style.color = hex[color];
}

// --- UTILIDADES DE BÚSQUEDA INTELIGENTE ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const performSearch = debounce(async (query) => {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) resultsCount.innerText = 'Buscando...';

    if (!query) {
        // Si no hay query, volvemos al estado inicial (todos los productos)
        renderProductsInGrid(GlobalState.allProducts);
        renderInventoryTable(GlobalState.allProducts);
        if (resultsCount) resultsCount.innerText = `${GlobalState.allProducts.length} productos cargados`;
        return;
    }

    try {
        // 1. Intentar Búsqueda Inteligente en Supabase (FTS)
        if (navigator.onLine) {
            const results = await buscarTornillos(query);
            renderProductsInGrid(results);
            renderInventoryTable(results);
            if (resultsCount) resultsCount.innerText = `${results.length} resultados encontrados`;
        } else {
            // 2. Fallback: Búsqueda Local (Offline)
            const lowerQuery = query.toLowerCase();
            const results = GlobalState.allProducts.filter(p => 
                (p.nombre || '').toLowerCase().includes(lowerQuery) ||
                (p.codigo_skv || '').toLowerCase().includes(lowerQuery) ||
                (p.area || '').toLowerCase().includes(lowerQuery)
            );
            renderProductsInGrid(results);
            renderInventoryTable(results);
            if (resultsCount) resultsCount.innerText = `${results.length} resultados (Modo Offline)`;
        }
    } catch (error) {
        console.error('Error en búsqueda:', error);
    }
}, 300);

export function navigate(page) {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;
    if (page === 'pos') {
        contentArea.innerHTML = renderPOSPage();
        renderProductsInGrid();
    } else if (page === 'inventory') {
        contentArea.innerHTML = renderInventoryPage();
        renderInventoryTable();
    } else if (page === 'dashboard') {
        contentArea.innerHTML = renderDashboardPage();
        loadDashboardData();
    }
}

async function loadDashboardData() {
    try {
        const data = await getDashboardData();
        
        // Formatear KPIs
        document.getElementById('kpi-ventas').innerText = `$${data.kpis.ventas_hoy.toFixed(2)}`;
        document.getElementById('kpi-tickets').innerText = data.kpis.tickets;
        document.getElementById('kpi-margen').innerText = `$${data.kpis.margen.toFixed(2)}`;

        // Renderizar Alertas de Reposición
        const insightReposicion = document.getElementById('insight-reposicion');
        if (data.alertas_reposicion.length === 0) {
            insightReposicion.innerHTML = '<div class="text-green-500 text-sm font-bold flex items-center gap-2"><span class="material-symbols-outlined">check_circle</span> Inventario saludable</div>';
        } else {
            insightReposicion.innerHTML = data.alertas_reposicion.map(item => `
                <div class="bg-black/30 p-3 rounded-sm border border-red-900/30 flex justify-between items-center group hover:border-red-500 transition-colors">
                    <div>
                        <div class="text-white text-sm font-bold">${item.producto}</div>
                        <div class="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Stock Crítico: <span class="text-red-500 font-bold">${item.stock} uds</span></div>
                    </div>
                    <div class="text-red-500 text-[10px] uppercase font-bold text-right">
                        Compra antes de<br/>48H
                    </div>
                </div>
            `).join('');
        }

        // Renderizar Dinero Estancado
        const insightEstancado = document.getElementById('insight-estancado');
        if (data.dinero_estancado.length === 0) {
            insightEstancado.innerHTML = '<div class="text-green-500 text-sm font-bold flex items-center gap-2"><span class="material-symbols-outlined">check_circle</span> Flujo de ventas óptimo</div>';
        } else {
            insightEstancado.innerHTML = data.dinero_estancado.map(item => `
                <div class="bg-black/30 p-3 rounded-sm border border-orange-900/30 flex justify-between items-center group hover:border-orange-500 transition-colors">
                    <div>
                        <div class="text-white text-sm font-bold">${item.producto}</div>
                        <div class="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Stock Alto: <span class="text-orange-400 font-bold">${item.stock} uds</span></div>
                    </div>
                    <div class="text-orange-400 text-[10px] uppercase font-bold text-right">
                        0 ventas<br/>en 7 días
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error cargando Dashboard:', error);
        document.getElementById('kpi-ventas').innerText = 'ERROR';
        document.getElementById('kpi-tickets').innerText = 'ERROR';
        document.getElementById('kpi-margen').innerText = 'ERROR';
    }
}

function renderProductsInGrid(products = GlobalState.allProducts) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = products.map(p => renderProductCard(p)).join('');
    
    // Actualizar contador si estamos en la vista de POS
    const resultsCount = document.getElementById('results-count');
    if (resultsCount && products.length > 0) {
        resultsCount.innerText = `${products.length} productos mostrados`;
    }
}

function renderInventoryTable(products = GlobalState.allProducts) {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;
    tbody.innerHTML = products.map(p => renderInventoryRow(p)).join('');
}

async function handleCheckout(isConsumidorFinal = false) {
    const metodoPagoSelect = document.getElementById('checkout-metodo-pago');
    const metodoPago = metodoPagoSelect ? metodoPagoSelect.value : 'PAGO MOVIL';
    
    const totals = calculateTotals(GlobalState.tasaActual, metodoPago);
    if (GlobalState.cart.length === 0) return;

    let clientId = null;
    let clientResolved = false;

    if (isConsumidorFinal) {
        clientResolved = true; // Bypasses specific client validation
    } else if (GlobalState.currentClient) {
        clientId = GlobalState.currentClient.id;
        clientResolved = true;
    } else {
        const newClientForm = document.getElementById('checkout-new-client-form');
        if (newClientForm && !newClientForm.classList.contains('hidden')) {
            const formData = new FormData(newClientForm);
            const clientData = Object.fromEntries(formData.entries());
            if (clientData.nombre && clientData.rif) {
                try {
                    const newClient = await createClient(clientData);
                    const updatedClients = await getClients();
                    updateState('allClients', updatedClients);
                    updateState('currentClient', newClient);
                    clientId = newClient.id;
                    clientResolved = true;
                } catch (err) {
                    console.error('Error creando cliente:', err);
                }
            }
        }
    }

    // BLOQUEO LEGAL: No proceder sin datos del cliente
    if (!clientResolved) {
        const errBox = document.getElementById('checkout-validation-error');
        if (errBox) {
            errBox.classList.remove('hidden');
            errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return; // Detener aquí
    }

    try {
        updateStatus('Procesando...', 'yellow');
        
        const saleData = {
            clientId: clientId,
            metodoPago: totals.metodoPago,
            totalUsd: totals.totalUsd,
            totalBs: totals.totalBs,
            subtotal: totals.subtotal,
            iva: totals.iva,
            igtf: totals.igtf,
            items: [...GlobalState.cart] // Copia de los items
        };

        const savedRows = await saveSale(saleData);
        
        // Construir objeto 'sale' para el InvoiceModal
        // saveSale ahora retorna array de filas (una por item), construimos un objeto resumen
        const firstRow = Array.isArray(savedRows) ? savedRows[0] : savedRows;
        const saleForInvoice = {
            id: firstRow?.id || ('LOCAL-' + Date.now()),
            fecha: new Date().toISOString()
        };
        
        // MOSTRAR FACTURA
        document.getElementById('modal-wrapper').innerHTML = renderInvoiceModal(
            saleForInvoice, 
            GlobalState.currentClient, 
            saleData.items, 
            GlobalState.config, 
            GlobalState.tasaActual
        );

        clearCart();
        updateCartUI();
        
        const products = await getProductsByTenant(GlobalState.myTenantId);
        updateState('allProducts', products);
        renderProductsInGrid();
        
        updateStatus('Conectado', 'green');
    } catch (e) {
        console.error('Error en Checkout:', e);
        updateStatus('Conectado', 'green'); // Limpiar estado de procesando
        
        if (e.message && e.message.includes('Stock insuficiente')) {
            // Feedback Visual: Toast / Banner Rojo
            const errorBanner = document.createElement('div');
            errorBanner.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-red-600 border-2 border-red-800 text-white px-6 py-4 shadow-[0_0_20px_rgba(220,38,38,0.5)] font-headline font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300';
            errorBanner.innerHTML = `
                <span class="material-symbols-outlined text-3xl">warning</span>
                <div>
                    <h3 class="uppercase tracking-widest text-sm">¡Stock Insuficiente!</h3>
                    <p class="text-xs font-normal opacity-90">No quedan suficientes unidades para completar esta venta.</p>
                </div>
            `;
            document.body.appendChild(errorBanner);
            
            setTimeout(() => {
                errorBanner.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                setTimeout(() => errorBanner.remove(), 300);
            }, 5000);

            // Efecto de Pantalla: Parpadeo en rojo de los botones de Vender
            const btnConfirm = document.getElementById('btn-confirm-checkout');
            const btnConsumidor = document.getElementById('btn-checkout-consumidor-final');
            
            const flashRed = (el) => {
                if (!el) return;
                const originalBg = el.className.match(/bg-([a-zA-Z0-9_-]+)/)?.[0] || '';
                const originalText = el.className.match(/text-([a-zA-Z0-9_-]+)/)?.[0] || '';
                el.classList.add('bg-red-600', 'text-white', 'border-red-800', 'animate-pulse');
                setTimeout(() => {
                    el.classList.remove('bg-red-600', 'text-white', 'border-red-800', 'animate-pulse');
                }, 2000);
            };

            flashRed(btnConfirm);
            flashRed(btnConsumidor);
            
            // También hacemos parpadear en rojo el carrito en el background
            const cartSidebar = document.getElementById('layout-cart-sidebar');
            if (cartSidebar) {
                const qtyInputs = cartSidebar.querySelectorAll('input');
                qtyInputs.forEach(input => {
                    input.classList.add('border-red-600', 'bg-red-900', 'text-white', 'animate-pulse');
                    setTimeout(() => input.classList.remove('border-red-600', 'bg-red-900', 'text-white', 'animate-pulse'), 2000);
                });
            }
        } else {
            alert('❌ Error al procesar la venta');
        }
    }
}

function setupGlobalEvents() {
    // Escuchar eventos globales para actualizaciones UI
    window.addEventListener('sync-queue-updated', updateSyncBadge);
    window.addEventListener('local-stock-updated', renderProductsInGrid);

    document.addEventListener('click', async (e) => {
        if (e.target.closest('#nav-pos')) navigate('pos');
        if (e.target.closest('#nav-inventory')) navigate('inventory');
        if (e.target.closest('#nav-dashboard')) navigate('dashboard');
        if (e.target.closest('#header-refresh')) initApp();

        // Sync manual
        if (e.target.closest('#btn-sync-queue')) {
            const icon = e.target.closest('#btn-sync-queue').querySelector('.material-symbols-outlined');
            icon.classList.add('animate-spin');
            await processSyncQueue();
            icon.classList.remove('animate-spin');
        }

        // Checkout - Consumidor Final
        if (e.target.closest('#btn-checkout-consumidor-final')) {
            e.preventDefault();
            handleCheckout(true);
        }

        // Carrito y POS
        if (e.target.closest('.add-to-cart')) {
            const id = e.target.closest('.add-to-cart').dataset.id;
            const p = GlobalState.allProducts.find(x => x.id == id);
            if (p) { addToCart(p); updateCartUI(); renderProductsInGrid(); }
        }
        if (e.target.closest('.add-item')) {
            const id = e.target.closest('.add-item').dataset.id;
            const p = GlobalState.allProducts.find(x => x.id == id);
            if (p) { addToCart(p); updateCartUI(); }
        }
        if (e.target.closest('.remove-item')) {
            removeFromCart(e.target.closest('.remove-item').dataset.id);
            updateCartUI();
            renderProductsInGrid();
        }
        if (e.target.closest('#btn-clear-cart')) {
            clearCart(); updateCartUI(); renderProductsInGrid();
        }

        // Checkout
        if (e.target.closest('#btn-checkout')) {
            // Si no hay clientes cargados, intentar recargarlos antes de abrir el modal
            if (GlobalState.allClients.length === 0 && navigator.onLine) {
                try {
                    const freshClients = await getClients();
                    updateState('allClients', freshClients);
                    console.log(`[Checkout] Clientes recargados: ${freshClients.length}`);
                } catch(err) {
                    console.warn('[Checkout] No se pudieron cargar los clientes:', err.message);
                }
            } else {
                console.log(`[Checkout] Clientes en memoria: ${GlobalState.allClients.length}`);
            }
            const totals = calculateTotals(GlobalState.tasaActual);
            document.getElementById('modal-wrapper').innerHTML = renderCheckoutModal(totals);
            setTimeout(() => document.getElementById('checkout-client-search')?.focus(), 100);
        }

        // Acciones dentro del Checkout Modal
        if (e.target.closest('#btn-close-checkout')) {
            document.getElementById('modal-wrapper').innerHTML = '';
        }
        if (e.target.closest('#btn-checkout-consumidor-final')) {
            await handleCheckout(true);
        }
        if (e.target.closest('#btn-confirm-checkout')) {
            await handleCheckout(false);
        }
        if (e.target.closest('#btn-clear-checkout-client')) {
            updateState('currentClient', null);
            document.getElementById('checkout-selected-client-box').classList.add('hidden');
            document.getElementById('checkout-client-search').parentElement.classList.remove('hidden');
            document.getElementById('checkout-client-search').value = '';
            document.getElementById('checkout-new-client-form').classList.add('hidden');
        }
        if (e.target.closest('.checkout-client-option')) {
            const clientId = e.target.closest('.checkout-client-option').dataset.id;
            const client = GlobalState.allClients.find(c => c.id == clientId);
            if (client) {
                updateState('currentClient', client);
                document.getElementById('checkout-selected-name').innerText = (client.nombre + ' ' + (client.apellido || '')).trim();
                document.getElementById('checkout-selected-rif').innerText = client.cedula || '';
                document.getElementById('checkout-selected-client-box').classList.remove('hidden');
                document.getElementById('checkout-client-search').parentElement.classList.add('hidden');
                document.getElementById('checkout-client-results').classList.add('hidden');
                document.getElementById('checkout-new-client-form').classList.add('hidden');
            }
        }
        if (e.target.closest('#btn-checkout-add-new')) {
            const searchVal = document.getElementById('checkout-client-search').value;
            document.getElementById('checkout-client-results').classList.add('hidden');
            document.getElementById('checkout-new-client-form').classList.remove('hidden');
            document.getElementById('checkout-new-rif').value = searchVal;
            document.getElementById('checkout-new-rif').focus();
        }

        // Modales (Cliente y Factura)
        if (e.target.closest('#btn-add-client-fast')) {
            document.getElementById('modal-wrapper').innerHTML = renderClientModal();
        }
        if (e.target.closest('#btn-close-modal') || e.target.closest('#btn-cancel-client') || e.target.closest('#btn-close-invoice')) {
            document.getElementById('modal-wrapper').innerHTML = '';
        }
        if (e.target.closest('#btn-print-invoice')) {
            window.print();
        }
    });

    // Evento de búsqueda inteligente
    document.addEventListener('input', (e) => {
        if (e.target.id === 'search-input') {
            performSearch(e.target.value.trim());
        }

        if (e.target.id === 'checkout-client-search') {
            const query = e.target.value.toLowerCase().trim();
            const resultsContainer = document.getElementById('checkout-client-results');
            
            if (query.length < 1) {
                resultsContainer.classList.add('hidden');
                return;
            }

            const matches = GlobalState.allClients.filter(c => 
                (c.nombre && c.nombre.toLowerCase().includes(query)) || 
                (c.apellido && c.apellido.toLowerCase().includes(query)) ||
                (c.cedula && c.cedula.toLowerCase().includes(query))
            );

            resultsContainer.innerHTML = '';
            
            if (matches.length > 0) {
                matches.forEach(m => {
                    resultsContainer.innerHTML += `
                        <div class="checkout-client-option p-3 border-b border-industrial-gray hover:bg-white/5 cursor-pointer flex justify-between items-center" data-id="${m.id}">
                            <div>
                                <p class="text-[10px] font-black text-white uppercase">${m.nombre} ${m.apellido || ''}</p>
                                <p class="text-[9px] font-bold text-gold uppercase">${m.cedula || ''}</p>
                            </div>
                        </div>
                    `;
                });
            } else {
                resultsContainer.innerHTML = `
                    <div class="p-3 text-center">
                        <p class="text-[10px] text-slate-400 mb-2 uppercase tracking-widest font-bold">Cliente no encontrado</p>
                        <button id="btn-checkout-add-new" class="bg-gold text-navy px-3 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-[#B8962F]">
                            + Crear Cliente
                        </button>
                    </div>
                `;
            }
            resultsContainer.classList.remove('hidden');
        }
    });

    document.addEventListener('submit', async (e) => {
        if (e.target.id === 'form-new-client') {
            e.preventDefault();
            const formData = new FormData(e.target);
            const clientData = Object.fromEntries(formData.entries());
            try {
                const newClient = await createClient(clientData);
                const updatedClients = await getClients();
                updateState('allClients', updatedClients);
                updateState('currentClient', newClient);
                document.getElementById('modal-wrapper').innerHTML = '';
                updateCartUI();
            } catch (err) { console.error('Error:', err); }
        }
    });

    // Detectar cambios en el método de pago para re-renderizar los totales fiscales en tiempo real
    document.addEventListener('change', (e) => {
        if (e.target.id === 'checkout-metodo-pago') {
            const metodoPago = e.target.value;
            const totals = calculateTotals(GlobalState.tasaActual, metodoPago);
            
            const breakdownContainer = document.getElementById('checkout-fiscal-breakdown');
            if (breakdownContainer) {
                breakdownContainer.innerHTML = `
                    <div class="flex justify-between text-xs text-slate-400">
                        <span>Subtotal</span>
                        <span>$${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between text-xs text-slate-400">
                        <span>IVA (16%)</span>
                        <span>$${totals.iva.toFixed(2)}</span>
                    </div>
                    ${totals.igtf > 0 ? `
                    <div class="flex justify-between text-xs text-red-400">
                        <span>IGTF (3%)</span>
                        <span>$${totals.igtf.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div class="flex justify-between items-end border-t border-industrial-gray pt-2 mt-2">
                        <div>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total a Pagar</p>
                            <p class="text-2xl font-headline font-black text-gold">$${totals.totalUsd.toFixed(2)}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-bold text-white">${totals.totalBs.toFixed(2)} Bs.</p>
                        </div>
                    </div>
                `;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', initApp);
