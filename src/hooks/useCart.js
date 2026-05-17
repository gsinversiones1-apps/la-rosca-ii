/**
 * Hook para gestionar la lógica del carrito de compras
 */
import { GlobalState, updateState } from '../context/State.js';

export const useCart = () => {
    
    const addToCart = (product) => {
        const existingItem = GlobalState.cart.find(item => item.id === product.id);
        const globalProduct = GlobalState.allProducts.find(p => p.id === product.id);
        
        if (existingItem) {
            if (globalProduct && globalProduct.stock > 0) {
                existingItem.cantidad++;
                globalProduct.stock--; // Descuento visual en tiempo real
            }
        } else {
            if (globalProduct && globalProduct.stock > 0) {
                GlobalState.cart.push({ ...product, cantidad: 1 });
                globalProduct.stock--; // Descuento visual en tiempo real
            }
        }
        
        updateState('cart', [...GlobalState.cart]);
    };

    const removeFromCart = (productId) => {
        const item = GlobalState.cart.find(i => i.id === productId);
        const globalProduct = GlobalState.allProducts.find(p => p.id === productId);

        if (item) {
            if (item.cantidad > 1) {
                item.cantidad--;
            } else {
                GlobalState.cart = GlobalState.cart.filter(i => i.id !== productId);
            }
            // Devolver stock visualmente
            if (globalProduct) {
                globalProduct.stock++;
            }
        }
        updateState('cart', [...GlobalState.cart]);
    };

    const clearCart = () => {
        // Devolver todo el stock del carrito al inventario global
        GlobalState.cart.forEach(cartItem => {
            const globalProduct = GlobalState.allProducts.find(p => p.id === cartItem.id);
            if (globalProduct) {
                globalProduct.stock += cartItem.cantidad;
            }
        });
        updateState('cart', []);
    };

    const calculateTotals = (tasa, metodoPago = 'PAGO MOVIL') => {
        const subtotal = GlobalState.cart.reduce((acc, item) => acc + (item.precio_usd * item.cantidad), 0);
        const iva = subtotal * (GlobalState.config.iva / 100);
        
        let igtf = 0;
        if (metodoPago === 'DIVISAS') {
            igtf = (subtotal + iva) * 0.03; // IGTF es 3% sobre el monto en divisas pagado
        }
        
        const totalUsd = subtotal + iva + igtf;
        const totalBs = totalUsd * tasa;
        
        return { subtotal, iva, igtf, totalUsd, totalBs, metodoPago };
    };

    return { addToCart, removeFromCart, clearCart, calculateTotals };
};
