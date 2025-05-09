import Decimal from 'decimal.js';

type RawFulfillmentMethodType = {
    id: number,
    name: string,
    fee: string,
    discountFee: string
}

type FulfillmentMethodType = {
    id: number,
    name: string,
    fee: Decimal,
    discountFee: Decimal
}

export type RawFulfillmentMethodInfoType = {
    "fulfillmentMethods": RawFulfillmentMethodType[],
    "freeShippingThreshold": string
}

export type FulfillmentMethodInfoType = {
    "fulfillmentMethods": FulfillmentMethodType[],
    "freeShippingThreshold": Decimal
}

function convertFulfillmentMethod(fulfillmentMethod: RawFulfillmentMethodType): FulfillmentMethodType {
    return {
        ...fulfillmentMethod,
        fee: new Decimal(fulfillmentMethod.fee),
        discountFee: new Decimal(fulfillmentMethod.discountFee)
    };
}

export const getFulfillmentMethodInfo = async (): Promise<FulfillmentMethodInfoType> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/fulfillment-methods`);
    const fulfillmentMethodInfo = (await response.json());
    const result = {
        ...fulfillmentMethodInfo,
        fulfillmentMethods: fulfillmentMethodInfo.fulfillmentMethods.map(convertFulfillmentMethod),
        freeShippingThreshold: new Decimal(fulfillmentMethodInfo.freeShippingThreshold)
    }
    return result;
}
