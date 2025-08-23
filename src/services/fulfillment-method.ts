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
    try {
        const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/fulfillment-methods`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const fulfillmentMethodInfo = await response.json();
        const result = {
            ...fulfillmentMethodInfo,
            fulfillmentMethods: fulfillmentMethodInfo.fulfillmentMethods.map(convertFulfillmentMethod),
            freeShippingThreshold: new Decimal(fulfillmentMethodInfo.freeShippingThreshold)
        }
        return result;
    } catch (error) {
        console.error('`Failed to fetch fulfillment method infomation:', error);
        throw new Error('Unable to fetch fulfillment method infomation. Please try again later.');
    }
}
