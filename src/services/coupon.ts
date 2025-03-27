export type CouponType = {
    couponCode: string,
    isValid: boolean,
    discountPercentage: number
}

export const getCoupons = async (): Promise<CouponType[]> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/coupons`);
    return await response.json();
}

export const getCoupon = async (couponCode: string): Promise<CouponType> => {
    const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/coupons/search?code=${couponCode}`);
    return await response.json();
}
