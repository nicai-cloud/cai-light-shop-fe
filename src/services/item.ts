import Decimal from "decimal.js";

type RawItemType = {
    id: number,
    imageUrl: string,
    videoUrl: string | null,
    product: string,
    name: string,
    description: string,
    price: string
}

export type ItemType = {
    id: number,
    imageUrl: string,
    videoUrl: string | null,
    product: string,
    name: string,
    description: string,
    price: Decimal
}

function convertItem(item: RawItemType): ItemType {
    return {
        ...item,
        price: new Decimal(item.price)
    };
}

export const getItems = async (): Promise<ItemType[]> => {
    const response = await fetch(`${import.meta.env.VITE_GIFT_SHOP_API}/items`);
    const items = await response.json();
    return items.map(convertItem);
}

export const getItemsByIds = async (itemIds: number[]): Promise<ItemType[]> => {
    const items = await Promise.all(
        itemIds.map(async (itemId) => {
            const response = await fetch(`${import.meta.env.VITE_GIFT_SHOP_API}/items/${itemId}`);
            const item = await response.json();
            return convertItem(item);
        })
    );
    return items;
}

export const getItemsWithProduct = async (): Promise<Record<string, ItemType[]>> => {
    const response = await fetch(`${import.meta.env.VITE_GIFT_SHOP_API}/items/with-product`);
    const itemsWithProduct = await response.json();

    const result: Record<string, ItemType[]> = {};
    for (const product in itemsWithProduct) {
        const items = itemsWithProduct[product];
        result[product] = items.map(convertItem);
    }
    return result;
}
