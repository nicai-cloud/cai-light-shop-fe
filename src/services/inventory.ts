export type InventoryType = {
    light: Record<string, number>
}

export const getInventories = async (): Promise<InventoryType> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/inventories`);
    return await response.json();
}
