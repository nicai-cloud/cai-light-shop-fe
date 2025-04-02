import Decimal from 'decimal.js';

export type RawLightType = {
    id: number,
    imageUrl: string,
    videoUrl: string | null,
    name: string,
    powerType: string,
    dimensionType: string,
    fromPrice: string
}

export type LightType = {
    id: number,
    imageUrl: string,
    videoUrl: string | null,
    name: string,
    powerType: string,
    dimensionType: string,
    fromPrice: Decimal
}

function convertLight(light: RawLightType): LightType {
    return {
        ...light,
        fromPrice: new Decimal(light.fromPrice)
    };
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

export type RawEnhancedLightVariantType = {
    id: number,
    lightId: number,
    dimensionId: number,
    colorId: number,
    color: string,
    imageUrl: string,
    length: number | null,
    width: number | null,
    height: number | null,
    weight: number | null,
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
    length: number | null,
    width: number | null,
    height: number | null,
    weight: number | null,
    description: string,
    price: Decimal,
    stock: number
}

export type RawLightAndVariantsType = {
    lightName: string,
    lightPowerType: string,
    lightVideoUrl: string | null,
    lightDimensionType: string,
    lightVariants: RawEnhancedLightVariantType[]
}

export type LightAndVariantsType = {
    lightName: string,
    lightPowerType: string,
    lightVideoUrl: string | null,
    lightDimensionType: string,
    lightVariants: EnhancedLightVariantType[]
}

export const getLights = async (): Promise<LightType[]> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/lights`);
    const lights = await response.json();
    return lights.map(convertLight);
}

export const getLightVariants = async (): Promise<LightVariantType[]> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/light-variants`);
    const lightVariants = await response.json();
    return lightVariants.map(convertLight);
}

export const getLightAndVariantsByName = async (name: string): Promise<LightAndVariantsType> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/lights/search?name=${name}`);
    const lightAndVariants = await response.json();
    return {
        lightName: lightAndVariants.lightName,
        lightPowerType: lightAndVariants.lightPowerType,
        lightVideoUrl: lightAndVariants.lightVideoUrl,
        lightDimensionType: lightAndVariants.lightDimensionType,
        lightVariants: lightAndVariants.lightVariants.map((variant: RawLightVariantType) => ({
            ...variant,
            price: new Decimal(variant.price),
        })),
    };
}
