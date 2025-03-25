import { InventoryType } from "./inventory";
import { PreselectionType } from "./preselection";

export const LOW_STOCK_THRESHOLD = 5;

export const getPreselectionStockStatus = (inventories: InventoryType, preselection: PreselectionType) => {
    const bagId = preselection.bagId;
    const itemIds = preselection.itemIds;
    // Get the minimum stock of bag and all items and use it to determine preselection stock status
    let bagAndItemMinStock = inventories.bag[bagId.toString()];
    itemIds.forEach((itemId: number) => {
        const itemStock = inventories.item[itemId.toString()];
        if (itemStock < bagAndItemMinStock) {
            bagAndItemMinStock = itemStock;
        }
    });
    return bagAndItemMinStock === 0 ? "OutOfStock" : (bagAndItemMinStock < LOW_STOCK_THRESHOLD ? "LowInStock" : null);
}
