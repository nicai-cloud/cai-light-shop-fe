export const getAllImageUrls = async (): Promise<string[]> => {
    const response = await fetch(`${import.meta.env.VITE_GIFT_SHOP_API}/images`);
    return await response.json();
}

export const getPreselectionImageUrls = async (): Promise<string[]> => {
    const response = await fetch(`${import.meta.env.VITE_GIFT_SHOP_API}/images/preselection`);
    return await response.json();
}
