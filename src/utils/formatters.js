/**
 * Formateadores de moneda y números para el SaaS Global
 */

export const formatNumber = (num) => {
    return new Intl.NumberFormat('es-VE').format(num);
};

export const formatCurrency = (num) => {
    return new Intl.NumberFormat('es-VE', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }).format(num);
};

export const formatDateTime = (date) => {
    return new Date(date).toLocaleString('es-VE');
};
