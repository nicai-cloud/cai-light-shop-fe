export const getLightImageUrls = async (): Promise<string[]> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/images/light`);
    return await response.json();
}
