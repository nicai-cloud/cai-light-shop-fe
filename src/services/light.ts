export type LightType = {
    id: number,
    imageUrl: string,
    videoUrl: string | null,
    internalName: string,
    displayName: string,
    powerType: string,
    priceTag: string
}

export type EnhancedLightVariantType = {
    id: number,
    lightId: number,
    dimensionId: string,
    color: string,
    imageUrl: string,
    dimensionStr: string,
    descriptions: string[],
    price: string,
    stock: number
}

type LightAndVariantsType = {
    lightPowerType: string,
    lightDisplayName: string,
    lightVideoUrl: string | null,
    lightDimensionTypeStr: string,
    defaultLightVariant: EnhancedLightVariantType
    colorsMapping: Record<string, number>
    dimensionsMapping: Record<string, string>
    colorDimensionToLightVariantMapping: Record<string, EnhancedLightVariantType>
    defaultDimensionToLightVariantMapping: Record<string, EnhancedLightVariantType>
}

export const getLights = async (): Promise<LightType[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/lights`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return (await response.json()).lights;
    } catch (error) {
        console.error('Failed to fetch lights:', error);
        throw new Error('Unable to fetch lights. Please try again later.');
    }
}

export const getLightAndVariantsByInternalName = async (name: string): Promise<LightAndVariantsType> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/lights/search?internal-name=${name}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const lightAndVariants = (await response.json()).lightAndVariants;
        return {
            lightPowerType: lightAndVariants.lightPowerType,
            lightDisplayName: lightAndVariants.lightDisplayName,
            lightVideoUrl: lightAndVariants.lightVideoUrl,
            lightDimensionTypeStr: lightAndVariants.lightDimensionTypeStr,
            defaultLightVariant: lightAndVariants.defaultLightVariant,
            colorsMapping: lightAndVariants.colorsMapping,
            dimensionsMapping: lightAndVariants.dimensionsMapping,
            colorDimensionToLightVariantMapping: lightAndVariants.colorDimensionToLightVariantMapping,
            defaultDimensionToLightVariantMapping: lightAndVariants.defaultDimensionToLightVariantMapping
        };
    } catch (error) {
        console.error(`Failed to fetch light and variants by internal name ${name}:`, error);
        throw new Error('Unable to fetch light and variants. Please try again later.');
    }
}
