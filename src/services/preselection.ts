import Decimal from 'decimal.js';

export type RawPreselectionType = {
    id: number,
    imageUrl: string,
    videoUrl: string | null,
    name: string,
    gender: string,
    description: string,
    price: string,
    bagId: number,
    itemIds: number[]
}

export type PreselectionType = {
    id: number,
    imageUrl: string,
    videoUrl: string | null,
    name: string,
    gender: string,
    description: string,
    price: Decimal,
    bagId: number,
    itemIds: number[]
}

function convertPreselection(preselection: RawPreselectionType): PreselectionType {
    return {
        ...preselection,
        price: new Decimal(preselection.price)
    };
}

export const getPreselections = async (): Promise<PreselectionType[]> => {
    const response = await fetch(`${import.meta.env.VITE_GIFT_SHOP_API}/preselections`);
    const preselections = await response.json();
    return preselections.map(convertPreselection);
}

export const getPreselectionByName = async (name: string): Promise<PreselectionType> => {
    const response = await fetch(`${import.meta.env.VITE_GIFT_SHOP_API}/preselections/search?name=${name}`);
    const preselection = await response.json();
    return convertPreselection(preselection);
}
