import Decimal from 'decimal.js';

type LightType = {
    id: number,
    imageUrl: string,
    videoUrl: string | null,
    internalName: string,
    displayName: string,
    powerType: string,
    fromPrice: string
}

type RawLightVariantType = {
    id: number,
    lightId: number,
    dimensionId: number,
    colorId: number,
    color: string,
    imageUrl: string,
    description: string,
    price: string,
    stock: number
}

export type EnhancedLightVariantType = {
    id: number,
    lightId: number,
    dimensionId: number,
    colorId: number,
    color: string,
    imageUrl: string,
    dimensionStr: string,
    descriptions: string[],
    price: Decimal,
    stock: number
}

type LightAndVariantsType = {
    lightInternalName: string,
    lightDisplayName: string,
    lightPowerType: string,
    lightVideoUrl: string | null,
    lightDimensionTypeStr: string,
    lightVariants: EnhancedLightVariantType[]
}

export const getLights = async (): Promise<LightType[]> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/lights`);
    return await response.json();
}

export const getLightAndVariantsByInternalName = async (name: string): Promise<LightAndVariantsType> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/lights/search?internal_name=${name}`);
    const lightAndVariants = await response.json();
    return {
        lightInternalName: lightAndVariants.lightInternalName,
        lightDisplayName: lightAndVariants.lightDisplayName,
        lightPowerType: lightAndVariants.lightPowerType,
        lightVideoUrl: lightAndVariants.lightVideoUrl,
        lightDimensionTypeStr: lightAndVariants.lightDimensionTypeStr,
        lightVariants: lightAndVariants.lightVariants.map((variant: RawLightVariantType) => ({
            ...variant,
            price: new Decimal(variant.price),
        })),
    };
}
