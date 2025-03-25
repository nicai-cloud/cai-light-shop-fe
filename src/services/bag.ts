import Decimal from 'decimal.js';

type RawBagType = {
    id: number,
    imageUrl: string,
    videoUrl: string | null,
    name: string,
    description: string,
    price: string
}

export type BagType = {
    id: number,
    imageUrl: string,
    videoUrl: string | null,
    name: string,
    description: string,
    price: Decimal
}

function convertBag(bag: RawBagType): BagType {
    return {
        ...bag,
        price: new Decimal(bag.price)
    };
}

export const getBags = async (): Promise<BagType[]> => {
    const response = await fetch(`${import.meta.env.VITE_GIFT_SHOP_API}/bags`);
    const bags = await response.json();
    return bags.map(convertBag);
}

export const getBag = async (bagId: number): Promise<BagType> => {
    const response = await fetch(`${import.meta.env.VITE_GIFT_SHOP_API}/bags/${bagId}`);
    const bag = await response.json();
    return convertBag(bag);
}
