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
    myTenantId: '70dcc2c6-07ea-448f-8728-c8242fe96544',
    storeName: 'Tornillería La Rosca II',
    
    // Autenticación y RBAC
    session: null,
    user: null,
    userRole: null,
    
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
