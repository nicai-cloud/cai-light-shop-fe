import Decimal from 'decimal.js';

export type LightType = {
    id: number,
    imageUrl: string,
    videoUrl: string | null,
    internalName: string,
    displayName: string,
    powerType: string,
    fromPrice: string
}

export type RawLightVariantType = {
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

export type LightVariantType = {
    id: number,
    lightId: number,
    dimensionId: number,
    colorId: number,
    color: string,
    imageUrl: string,
    description: string,
    price: Decimal,
    stock: number
}

function convertLightVariant(lightVariant: RawLightVariantType): LightVariantType {
    return {
        ...lightVariant,
        price: new Decimal(lightVariant.price)
    };
}

export type RawEnhancedLightVariantType = {
    id: number,
    lightId: number,
    dimensionId: number,
    colorId: number,
    color: string,
    imageUrl: string,
    dimensionStr: string,
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
    description: string,
    price: Decimal,
    stock: number
}

export type RawLightAndVariantsType = {
    lightInternalName: string,
    lightDisplayName: string,
    lightPowerType: string,
    lightVideoUrl: string | null,
    lightDimensionTypeStr: string,
    lightVariants: RawEnhancedLightVariantType[]
}

export type LightAndVariantsType = {
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

export const getLightVariants = async (): Promise<LightVariantType[]> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/light-variants`);
    const lightVariants = await response.json();
    return lightVariants.map(convertLightVariant);
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
