export const getAllLightsImageUrls = async (): Promise<string[]> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/images/lights`);
    return (await response.json()).images;
}

export const getLightImageUrlsByInternalName = async (internalName: string): Promise<string[]> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/images/lights/${internalName}`);
    return (await response.json()).images;
}

export const getAllLightVariantsImageUrls = async (): Promise<string[]> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/images/light-variants`);
    return (await response.json()).images;
}
