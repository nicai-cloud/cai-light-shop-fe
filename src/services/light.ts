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

export const getLights = async (): Promise<LightType[]> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/lights`);
    const lights = await response.json();
    return lights.map(convertLight);
}

export const getLightByName = async (name: string): Promise<LightType> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/lights/search?name=${name}`);
    const light = await response.json();
    return convertLight(light);
}
