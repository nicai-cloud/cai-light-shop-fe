export const getAllLightsImageUrls = async (): Promise<string[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/images/lights`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return (await response.json()).images;
    } catch (error) {
        console.error('Failed to fetch all lights image urls:', error);
        throw new Error('Unable to fetch all lights image urls. Please try again later.');
    }
}

export const getLightImageUrlsByInternalName = async (internalName: string): Promise<string[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/images/lights/${internalName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return (await response.json()).images;
    } catch (error) {
        console.error(`Failed to fetch light image url by internal name ${internalName}:`, error);
        throw new Error('Unable to fetch light image url. Please try again later.');
    }
}

export const getAllLightVariantsImageUrls = async (): Promise<string[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/images/light-variants`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return (await response.json()).images;
    } catch (error) {
        console.error('Failed to fetch all light variants image urls:', error);
        throw new Error('Unable to fetch all light variants image urls. Please try again later.');
    }
}
