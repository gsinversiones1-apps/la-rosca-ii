/**
 * Estado Global del Sistema (SaaS Brain)
 */

export const GlobalState = {
    allProducts: [],
    allClients: [],
    cart: [],
    currentClient: null,
    tasaActual: 36.50,
    cartMetodoPago: 'PAGO MOVIL',
    myTenantId: 'ROSC-001-VNZ',
    storeName: 'Tornillería La Rosca II',
    
    // Configuración persistente (RIF, Dirección, etc)
    config: JSON.parse(localStorage.getItem('pos_config')) || {
        storeName: "TORNILLERÍA LA ROSCA II",
        rif: "J-12345678-9",
        address: "AV. PRINCIPAL #42 EDO. LARA, VENEZUELA",
        nextFolio: 1,
        iva: 16
    }
};

export const updateState = (key, value) => {
    GlobalState[key] = value;
    console.log(`[State Update] ${key}:`, value);
};
