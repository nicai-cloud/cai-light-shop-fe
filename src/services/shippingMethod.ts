import Decimal from 'decimal.js';

type RawShippingMethodType = {
    id: number,
    name: string,
    fee: string,
    discountFee: string
}

type ShippingMethodType = {
    id: number,
    name: string,
    fee: Decimal,
    discountFee: Decimal
}

export type RawShippingMethodInfoType = {
    "shippingMethods": RawShippingMethodType[],
    "freeShippingThreshold": string
}

export type ShippingMethodInfoType = {
    "shippingMethods": ShippingMethodType[],
    "freeShippingThreshold": Decimal
}

function convertShippingMethod(shippingMethod: RawShippingMethodType): ShippingMethodType {
    return {
        ...shippingMethod,
        fee: new Decimal(shippingMethod.fee),
        discountFee: new Decimal(shippingMethod.discountFee)
    };
}

export const getShippingMethodInfo = async (): Promise<ShippingMethodInfoType> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/shipping-methods`);
    const shippingMethodInfo = await response.json();
    const result = {
        ...shippingMethodInfo,
        shippingMethods: shippingMethodInfo.shippingMethods.map(convertShippingMethod),
        freeShippingThreshold: new Decimal(shippingMethodInfo.freeShippingThreshold)
    }
    return result;
}
