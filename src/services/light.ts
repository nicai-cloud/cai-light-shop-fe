type LightType = {
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
    lightDisplayName: string,
    lightVideoUrl: string | null,
    lightDimensionTypeStr: string,
    defaultLightVariant: EnhancedLightVariantType
    colorsMapping: Record<string, number>
    dimensionsMapping: Record<string, string>
    colorDimensionToLightVariantMapping: Record<string, EnhancedLightVariantType>
}

export const getLights = async (): Promise<LightType[]> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/lights`);
    return await response.json();
}

export const getLightAndVariantsByInternalName = async (name: string): Promise<LightAndVariantsType> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/lights/search?internal_name=${name}`);
    const lightAndVariants = await response.json();
    return {
        lightDisplayName: lightAndVariants.lightDisplayName,
        lightVideoUrl: lightAndVariants.lightVideoUrl,
        lightDimensionTypeStr: lightAndVariants.lightDimensionTypeStr,
        defaultLightVariant: lightAndVariants.defaultLightVariant,
        colorsMapping: lightAndVariants.colorsMapping,
        dimensionsMapping: lightAndVariants.dimensionsMapping,
        colorDimensionToLightVariantMapping: lightAndVariants.colorDimensionToLightVariantMapping
    };
}
