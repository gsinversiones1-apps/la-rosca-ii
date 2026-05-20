/**
 * ENSAMBLADOR MAESTRO (master.js)
 * Orquestador principal del SaaS Global
 */

import { GlobalState, updateState } from './context/State.js';
import { fetchTasaBCV } from './api/bcv.js';
import { getProductsByTenant, getSession, getUserProfile, signIn, signOut } from './api/supabaseClient.js';
import { getClients, createClient } from './api/clients.js';
import { saveSale } from './api/sales.js';
import { getPendingSales, saveProductsLocal, getProductsLocal } from './utils/db.js';
import { processSyncQueue } from './utils/syncManager.js';
import { renderLoginPage } from './pages/LoginPage.js';
import { renderSidebar } from './layouts/Sidebar.js';
import { renderNavbar } from './layouts/Navbar.js';
import { renderPOSPage } from './pages/POSPage.js';
import { renderInventoryPage } from './pages/InventoryPage.js';
import { renderDashboardPage } from './pages/DashboardPage.js';
import { getDashboardData } from './api/dashboard.js';
import { renderProductCard } from './components/pos/ProductCard.js';
import { renderInventoryRow } from './components/inventory/InventoryRow.js';
import { renderCartSidebar } from './components/pos/CartSidebar.js';
import { renderClientModal, setupClientModalValidation } from './components/pos/ClientModal.js';
import { renderInvoiceModal } from './components/pos/InvoiceModal.js';
import { renderCheckoutModal, setupCheckoutValidation } from './components/pos/CheckoutModal.js';
import { renderClientsPage, renderClientRow } from './pages/ClientsPage.js';
import { useCart } from './hooks/useCart.js';
import { imprimirTicketFiscal } from './utils/fiscalDriver.js';

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

    try {
        // 0. AUTHENTICATION CHECK
        const session = await getSession();
        if (!session) {
            appContainer.innerHTML = renderLoginPage();
            setupLoginEvents();
            return; // Detener inicialización del dashboard hasta que inicie sesión
        }

        // Si hay sesión, cargar perfil y continuar
        updateState('session', session);
        updateState('user', session.user);
        try {
            const profile = await getUserProfile(session.user.id);
            updateState('userRole', profile.rol);
        } catch (err) {
            console.error('Error cargando perfil:', err);
            updateState('userRole', 'vendedor'); // Default seguro
        }

        appContainer.innerHTML = `
            <div id="mobile-overlay" class="fixed inset-0 bg-black/80 z-40 hidden transition-opacity duration-300 opacity-0 md:hidden"></div>
            <div id="layout-sidebar"></div>
            <div id="main-content-wrapper" class="flex-1 md:ml-64 lg:mr-80 flex flex-col h-full bg-background transition-all duration-300 w-full relative">
                <div id="layout-navbar"></div>
                <main id="content-area" class="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar"></main>
            </div>
            <div id="layout-cart-sidebar"></div>
            <div id="modal-wrapper"></div>
        `;

        document.getElementById('layout-sidebar').innerHTML = renderSidebar(GlobalState.storeName, GlobalState.userRole);
        
        const tasa = await fetchTasaBCV();
        updateState('tasaActual', tasa);
        document.getElementById('layout-navbar').innerHTML = renderNavbar(GlobalState.storeName, GlobalState.tasaActual, GlobalState.user, GlobalState.userRole);
        
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
            
            // Si estábamos offline y ya cargó la UI local, refrescamos las vistas silenciosamente
            if (localProducts && localProducts.length > 0) {
                applyFilters();
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

function setupLoginEvents() {
    document.addEventListener('submit', async (e) => {
        if (e.target.id === 'login-form') {
            e.preventDefault();
            const btn = document.getElementById('btn-login-submit');
            const errBox = document.getElementById('login-error');
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">sync</span><span>CARGANDO...</span>`;
            errBox.classList.add('hidden');
            
            try {
                await signIn(email, password);
                location.reload(); // Recargar la app para iniciar como usuario logueado
            } catch (error) {
                errBox.innerText = error.message === 'Invalid login credentials' ? 'Credenciales incorrectas.' : error.message;
                errBox.classList.remove('hidden');
                btn.innerHTML = `<span>INICIAR SESIÓN</span><span class="material-symbols-outlined text-sm">login</span>`;
            }
        }
    });
}

function updateCartUI() {
    const container = document.getElementById('layout-cart-sidebar');
    if (container) container.innerHTML = renderCartSidebar();

    // Actualizar badge móvil del carrito
    const mobileBadge = document.getElementById('mobile-cart-badge');
    if (mobileBadge) {
        if (GlobalState.cart.length > 0) {
            mobileBadge.innerText = GlobalState.cart.length;
            mobileBadge.classList.remove('hidden');
        } else {
            mobileBadge.classList.add('hidden');
        }
    }
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

function isFuzzySubsequence(text, query) {
    let queryIdx = 0;
    for (let textIdx = 0; textIdx < text.length; textIdx++) {
        if (text[textIdx] === query[queryIdx]) {
            queryIdx++;
        }
        if (queryIdx === query.length) {
            return true;
        }
    }
    return false;
}

function getMatchScore(product, queryTerms) {
    let totalScore = 0;
    const normalize = (val) => (val || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const name = normalize(product.nombre);
    const sku = normalize(product.codigo_skv);
    const area = normalize(product.area);
    const medida = normalize(product.medida);
    
    for (const term of queryTerms) {
        let termScore = 0;
        
        // Coincidencia exacta de subcadena (Máxima prioridad)
        if (name.includes(term)) {
            termScore = Math.max(termScore, name.startsWith(term) ? 100 : 80);
        } else if (sku.includes(term)) {
            termScore = Math.max(termScore, sku.startsWith(term) ? 90 : 70);
        } else if (area.includes(term)) {
            termScore = Math.max(termScore, 60);
        } else if (medida.includes(term)) {
            termScore = Math.max(termScore, 50);
        }
        // Coincidencia difusa por subsecuencia (Fuzzy search)
        else if (isFuzzySubsequence(name, term)) {
            termScore = Math.max(termScore, 40);
        } else if (isFuzzySubsequence(sku, term)) {
            termScore = Math.max(termScore, 30);
        } else if (isFuzzySubsequence(area, term)) {
            termScore = Math.max(termScore, 20);
        } else if (isFuzzySubsequence(medida, term)) {
            termScore = Math.max(termScore, 10);
        }
        
        if (termScore === 0) {
            return 0; // Si no coincide el término en ningún campo, se descarta el producto
        }
        
        totalScore += termScore;
    }
    
    return totalScore;
}

const applyFilters = () => {
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('filter-category');
    
    const query = searchInput ? searchInput.value.trim() : '';
    const category = categorySelect ? categorySelect.value : 'all';
    
    const resultsCount = document.getElementById('results-count');

    // 1. Filtrar primero por categoría (si no es 'all')
    let filteredProducts = GlobalState.allProducts;
    if (category !== 'all') {
        const lowerCat = category.toLowerCase().trim();
        filteredProducts = filteredProducts.filter(p => 
            p.area && p.area.toLowerCase().trim() === lowerCat
        );
    }

    // 2. Si hay texto de búsqueda, aplicar puntuación inteligente y filtro difuso
    if (query) {
        try {
            const lowerQuery = query.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const queryTerms = lowerQuery.split(/\s+/).filter(Boolean);

            const scoredResults = filteredProducts
                .map(p => ({ product: p, score: getMatchScore(p, queryTerms) }))
                .filter(item => item.score > 0);

            // Ordenar por puntaje descendente
            scoredResults.sort((a, b) => b.score - a.score);
            filteredProducts = scoredResults.map(item => item.product);
        } catch (error) {
            console.error('Error en búsqueda inteligente difusa:', error);
        }
    }

    // 3. Renderizar resultados en el grid y actualizar contador
    renderProductsInGrid(filteredProducts);
    renderInventoryTable(filteredProducts);

    if (resultsCount) {
        if (query || category !== 'all') {
            resultsCount.innerText = `${filteredProducts.length} resultados encontrados`;
        } else {
            resultsCount.innerText = `${GlobalState.allProducts.length} productos cargados`;
        }
    }
};

const performSearch = debounce((query) => {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) resultsCount.innerText = 'Buscando...';
    applyFilters();
}, 75);

export function navigate(page) {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;
    
    // Auth Guards
    if (!GlobalState.session) {
        alert("Debe iniciar sesión primero.");
        return;
    }

    if (page === 'dashboard' && GlobalState.userRole !== 'admin') {
        alert("Acceso denegado. Se requiere perfil de Administrador para ver el Dashboard.");
        page = 'pos';
    }

    // Limpiar input de búsqueda al cambiar de vista
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    // Highlight active sidebar item
    document.querySelectorAll('#main-sidebar button').forEach(btn => {
        btn.classList.remove('text-gold', 'bg-white/5');
        btn.classList.add('text-slate-400');
    });
    const activeBtn = document.getElementById(`nav-${page}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-slate-400');
        activeBtn.classList.add('text-gold', 'bg-white/5');
    }

    if (page === 'pos') {
        contentArea.innerHTML = renderPOSPage();
        applyFilters();
    } else if (page === 'inventory') {
        contentArea.innerHTML = renderInventoryPage(GlobalState.userRole);
        applyFilters();
    } else if (page === 'dashboard') {
        contentArea.innerHTML = renderDashboardPage();
        loadDashboardData();
    } else if (page === 'clients') {
        contentArea.innerHTML = renderClientsPage();
        renderClientsTable();
        updateClientsKPIs();
    }
}

export function renderClientsTable(clients = GlobalState.allClients || []) {
    const tbody = document.getElementById('clients-table-body');
    const badge = document.getElementById('clients-count-badge');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const safeClients = Array.isArray(clients) ? clients : [];
    if (safeClients.length === 0) {
        tbody.innerHTML = `
        <tr>
            <td colspan="5" class="p-8 text-center text-slate-500 uppercase tracking-widest font-bold">
                No se encontraron clientes
            </td>
        </tr>
        `;
        if (badge) badge.innerText = '0 CLIENTES';
        return;
    }

    safeClients.forEach(c => {
        tbody.innerHTML += renderClientRow(c);
    });
    if (badge) badge.innerText = `${safeClients.length} CLIENTES`;
}

export function updateClientsKPIs() {
    const totalEl = document.getElementById('kpi-total-clients');
    const juridicosEl = document.getElementById('kpi-juridicos-clients');
    const naturalesEl = document.getElementById('kpi-naturales-clients');
    if (!totalEl) return;

    const clients = Array.isArray(GlobalState.allClients) ? GlobalState.allClients : [];
    totalEl.innerText = clients.length;
    
    const juridicos = clients.filter(c => {
        const ced = c && c.cedula ? String(c.cedula).toUpperCase() : '';
        return ced.startsWith('J-');
    }).length;
    juridicosEl.innerText = juridicos;
    
    const naturales = clients.filter(c => {
        const ced = c && c.cedula ? String(c.cedula).toUpperCase() : '';
        return ced.startsWith('V-') || ced.startsWith('E-');
    }).length;
    naturalesEl.innerText = naturales;
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
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-slate-500 uppercase tracking-widest font-bold">
                    No se encontraron productos
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = products.map(p => renderInventoryRow(p, GlobalState.userRole)).join('');
}

async function handleCheckout(isConsumidorFinal = false) {
    try {
        const metodoPagoSelect = document.getElementById('checkout-metodo-pago');
        const metodoPago = metodoPagoSelect ? metodoPagoSelect.value : 'PAGO MOVIL';
        
        const totals = calculateTotals(GlobalState.tasaActual, metodoPago);
        if (GlobalState.cart.length === 0) {
            alert('El carrito está vacío.');
            return;
        }

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
                    const newClient = await createClient(clientData);
                    const updatedClients = await getClients();
                    updateState('allClients', updatedClients);
                    updateState('currentClient', newClient);
                    clientId = newClient.id;
                    clientResolved = true;
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
        } else {
            const errBox = document.getElementById('checkout-validation-error');
            if (errBox) errBox.classList.add('hidden');
        }

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
        
        // --- INICIO INTEGRACIÓN FISCAL DRIVER ---
        const payloadFiscal = {
            cliente: isConsumidorFinal ? "CONSUMIDOR FINAL" : (GlobalState.currentClient.nombre + " " + (GlobalState.currentClient.apellido || '')).trim(),
            cedula_rif: isConsumidorFinal ? "V00000000" : GlobalState.currentClient.cedula,
            pagoDivisas: totals.totalUsd,
            pagoBs: totals.totalBs,
            metodoPago: totals.metodoPago,
            items: saleData.items
        };

        try {
            await imprimirTicketFiscal(payloadFiscal);
            console.log("Ticket encolado exitosamente en el Agente Fiscal C#");
        } catch (fiscalError) {
            console.warn("Advertencia de Impresión:", fiscalError.message);
        }
        // --- FIN INTEGRACIÓN FISCAL DRIVER ---

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
        applyFilters();
        
        updateStatus('Conectado', 'green');
    } catch (e) {
        console.error('Error FATAL en Checkout:', e);
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
            const errorMsg = e.message || e.details || JSON.stringify(e);
            alert('❌ Error al procesar la venta:\n' + errorMsg);
        }
    }
}

let eventsSetup = false;
function setupGlobalEvents() {
    if (eventsSetup) return;
    eventsSetup = true;
    
    // Escuchar eventos globales para actualizaciones UI
    window.addEventListener('sync-queue-updated', updateSyncBadge);
    window.addEventListener('local-stock-updated', applyFilters);

    document.addEventListener('click', async (e) => {
        // --- Lógica de Drawers Responsivos ---
        const closeDrawers = () => {
            const sidebar = document.getElementById('main-sidebar');
            const cartSidebar = document.getElementById('cart-sidebar');
            const overlay = document.getElementById('mobile-overlay');
            const searchContainer = document.getElementById('search-container');
            
            if (sidebar) sidebar.classList.add('-translate-x-full');
            if (cartSidebar) cartSidebar.classList.add('translate-x-full');
            if (searchContainer && window.innerWidth < 768) {
                searchContainer.classList.add('hidden');
            }
            if (overlay) {
                overlay.classList.add('opacity-0');
                setTimeout(() => overlay.classList.add('hidden'), 300);
            }
        };

        if (e.target.closest('#btn-logout')) {
            try {
                await signOut();
                location.reload();
            } catch (err) {
                console.error("Error al cerrar sesión:", err);
            }
            return;
        }

        if (e.target.closest('#btn-mobile-menu')) {
            document.getElementById('main-sidebar').classList.toggle('-translate-x-full');
            const overlay = document.getElementById('mobile-overlay');
            overlay.classList.remove('hidden');
            setTimeout(() => overlay.classList.remove('opacity-0'), 10);
            return;
        }

        if (e.target.closest('#btn-close-sidebar')) {
            closeDrawers();
            return;
        }

        if (e.target.closest('#btn-mobile-search')) {
            const searchContainer = document.getElementById('search-container');
            if (searchContainer) {
                searchContainer.classList.toggle('hidden');
                if (!searchContainer.classList.contains('hidden')) {
                    document.getElementById('search-input')?.focus();
                }
            }
            return;
        }

        if (e.target.closest('#btn-mobile-cart')) {
            document.getElementById('cart-sidebar').classList.toggle('translate-x-full');
            const overlay = document.getElementById('mobile-overlay');
            overlay.classList.remove('hidden');
            setTimeout(() => overlay.classList.remove('opacity-0'), 10);
            return;
        }

        if (e.target.closest('#mobile-overlay')) {
            closeDrawers();
            return;
        }

        // --- Navegación ---
        if (e.target.closest('#nav-pos')) { navigate('pos'); closeDrawers(); }
        if (e.target.closest('#nav-inventory')) { navigate('inventory'); closeDrawers(); }
        if (e.target.closest('#nav-dashboard')) { navigate('dashboard'); closeDrawers(); }
        if (e.target.closest('#nav-clients')) { navigate('clients'); closeDrawers(); }
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

        // Cambio de método de pago en Sidebar del Carrito
        if (e.target.closest('#btn-metodo-pago-bs')) {
            updateState('cartMetodoPago', 'PAGO MOVIL');
            updateCartUI();
        }
        if (e.target.closest('#btn-metodo-pago-usd')) {
            updateState('cartMetodoPago', 'DIVISAS');
            updateCartUI();
        }

        // Carrito y POS
        if (e.target.closest('.add-to-cart')) {
            const id = e.target.closest('.add-to-cart').dataset.id;
            const p = GlobalState.allProducts.find(x => x.id == id);
            if (p) { addToCart(p); updateCartUI(); applyFilters(); }
        }
        if (e.target.closest('.add-item')) {
            const id = e.target.closest('.add-item').dataset.id;
            const p = GlobalState.allProducts.find(x => x.id == id);
            if (p) { addToCart(p); updateCartUI(); }
        }
        if (e.target.closest('.remove-item')) {
            removeFromCart(e.target.closest('.remove-item').dataset.id);
            updateCartUI();
            applyFilters();
        }
        if (e.target.closest('#btn-clear-cart')) {
            clearCart(); updateCartUI(); applyFilters();
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
            setupCheckoutValidation();
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
            
            // Deshabilitar botón si se limpia el cliente
            const btnConfirm = document.getElementById('btn-confirm-checkout');
            if (btnConfirm) btnConfirm.setAttribute('disabled', 'true');
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
                
                // Ocultar mensaje de error si existía
                const errBox = document.getElementById('checkout-validation-error');
                if (errBox) errBox.classList.add('hidden');
                
                // Habilitar el botón de Confirmar Pago
                const btnConfirm = document.getElementById('btn-confirm-checkout');
                if (btnConfirm) btnConfirm.removeAttribute('disabled');
            }
        }
        if (e.target.closest('#btn-checkout-add-new')) {
            const searchVal = document.getElementById('checkout-client-search').value;
            document.getElementById('checkout-client-results').classList.add('hidden');
            document.getElementById('checkout-new-client-form').classList.remove('hidden');
            document.getElementById('checkout-new-rif').value = searchVal;
            document.getElementById('checkout-new-rif').focus();
            
            // Habilitar botón porque el usuario va a crear un cliente
            const btnConfirm = document.getElementById('btn-confirm-checkout');
            if (btnConfirm) btnConfirm.removeAttribute('disabled');
            
            // Ocultar error si estaba
            const errBox = document.getElementById('checkout-validation-error');
            if (errBox) errBox.classList.add('hidden');
        }

        // Modales (Cliente y Factura)
        if (e.target.closest('#btn-add-client-fast') || e.target.closest('#btn-add-client')) {
            document.getElementById('modal-wrapper').innerHTML = renderClientModal();
            setupClientModalValidation();
        }
        if (e.target.closest('.btn-edit-client')) {
            const id = e.target.closest('.btn-edit-client').dataset.id;
            const client = GlobalState.allClients.find(c => c.id == id);
            if (client) {
                document.getElementById('modal-wrapper').innerHTML = renderClientModal(client);
                setupClientModalValidation();
            }
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

        if (e.target.id === 'clients-search-input') {
            const query = e.target.value.toLowerCase().trim();
            const filtered = GlobalState.allClients.filter(c => 
                (c.nombre && c.nombre.toLowerCase().includes(query)) || 
                (c.apellido && c.apellido.toLowerCase().includes(query)) ||
                (c.cedula && c.cedula.toLowerCase().includes(query)) ||
                (c.telefono && c.telefono.toLowerCase().includes(query))
            );
            renderClientsTable(filtered);
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
            
            const id = e.target.dataset.id;
            if (id) clientData.id = id;

            try {
                const newClient = await createClient(clientData);
                const updatedClients = await getClients();
                updateState('allClients', updatedClients);
                
                // Refrescar vistas dependiendo de dónde estemos
                const searchInput = document.getElementById('clients-search-input');
                if (searchInput) {
                    renderClientsTable();
                    updateClientsKPIs();
                } else {
                    updateState('currentClient', newClient);
                    updateCartUI();
                }
                
                document.getElementById('modal-wrapper').innerHTML = '';
            } catch (err) { console.error('Error al guardar cliente:', err); }
        }
    });

    // Detectar cambios en el método de pago y en los filtros de categoría
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
        
        if (e.target.id === 'filter-category') {
            applyFilters();
        }
    });

    let activeClientIndex = -1;

    document.addEventListener('keydown', (e) => {
        const searchInput = document.getElementById('checkout-client-search');
        if (!searchInput || searchInput !== document.activeElement) return;

        const resultsContainer = document.getElementById('checkout-client-results');
        if (!resultsContainer || resultsContainer.classList.contains('hidden')) return;

        const options = resultsContainer.querySelectorAll('.checkout-client-option');
        if (options.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeClientIndex = (activeClientIndex + 1) % options.length;
            highlightOption(options, activeClientIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeClientIndex = (activeClientIndex - 1 + options.length) % options.length;
            highlightOption(options, activeClientIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeClientIndex >= 0 && activeClientIndex < options.length) {
                options[activeClientIndex].click();
                activeClientIndex = -1;
            }
        } else if (e.key === 'Escape') {
            resultsContainer.classList.add('hidden');
            activeClientIndex = -1;
        }
    });

    function highlightOption(options, index) {
        options.forEach((opt, idx) => {
            if (idx === index) {
                opt.style.background = 'rgba(255, 255, 255, 0.15)';
                opt.style.borderColor = '#D4A817';
                opt.scrollIntoView({ block: 'nearest' });
            } else {
                opt.style.background = '';
                opt.style.borderColor = '';
            }
        });
    }

    document.addEventListener('input', (e) => {
        if (e.target.id === 'checkout-client-search') {
            activeClientIndex = -1;
        }
    });
}

document.addEventListener('DOMContentLoaded', initApp);
