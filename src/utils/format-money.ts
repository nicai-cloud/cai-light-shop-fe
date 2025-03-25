import Decimal from 'decimal.js';

export const formatMoney = (amount: Decimal): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount.toNumber());
};
