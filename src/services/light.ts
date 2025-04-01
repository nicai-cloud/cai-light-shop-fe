import Decimal from 'decimal.js';

export type RawLightType = {
    id: number,
    imageUrl: string,
    videoUrl: string | null,
    name: string,
    type: string,
    price: string
}

export type LightType = {
    id: number,
    imageUrl: string,
    videoUrl: string | null,
    name: string,
    type: string,
    price: Decimal
}

function convertLight(light: RawLightType): LightType {
    return {
        ...light,
        price: new Decimal(light.price)
    };
}

export type RawLightVariantType = {
    id: number,
    lightId: number,
    colorId: number,
    dimensionId: number,
    color: string,
    imageUrl: string,
    length: number,
    width: number | null,
    weight: number | null,
    description: string,
    price: string,
    stock: number
}

export type LightVariantType = {
    id: number,
    lightId: number,
    colorId: number,
    dimensionId: number,
    color: string,
    imageUrl: string,
    length: number,
    width: number | null,
    weight: number | null,
    description: string,
    price: Decimal,
    stock: number
}

export type RawLightAndVariantsType = {
    lightName: string,
    lightType: string,
    lightVideoUrl: string | null,
    lightVariants: RawLightVariantType[]
}

export type LightAndVariantsType = {
    lightName: string,
    lightType: string,
    lightVideoUrl: string | null,
    lightVariants: LightVariantType[]
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
        lightType: lightAndVariants.lightType,
        lightVideoUrl: lightAndVariants.lightVideoUrl,
        lightVariants: lightAndVariants.lightVariants.map((variant: RawLightVariantType) => ({
            ...variant,
            price: new Decimal(variant.price),
        })),
    };
}
