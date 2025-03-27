import { InventoryType } from "./inventory";
import { LightType } from "./light";

export const LOW_STOCK_THRESHOLD = 5;

export const getLightStockStatus = (inventories: InventoryType, light: LightType) => {
    const lightId = light.id;
    let lightStock = inventories.light[lightId.toString()];
    return lightStock === 0 ? "OutOfStock" : (lightStock < LOW_STOCK_THRESHOLD ? "LowInStock" : null);
}
