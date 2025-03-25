export type InventoryType = {
    bag: Record<string, number>,
    item: Record<string, number>
}

export const getInventories = async (): Promise<InventoryType> => {
    const response = await fetch(`${import.meta.env.VITE_GIFT_SHOP_API}/inventories`);
    return await response.json();
}
