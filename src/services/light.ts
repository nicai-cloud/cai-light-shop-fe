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
    color: string,
    imageUrl: string,
    dimensionId: number,
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
    color: string,
    imageUrl: string,
    dimensionId: number,
    length: number,
    width: number | null,
    weight: number | null,
    description: string,
    price: Decimal,
    stock: number
}

function convertLightVariant(light: RawLightVariantType): LightVariantType {
    return {
        ...light,
        price: new Decimal(light.price)
    };
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

export const getLightVariantsByName = async (name: string): Promise<LightVariantType[]> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/lights/search?name=${name}`);
    const lightVariants = await response.json();
    return lightVariants.map(convertLightVariant);
}
