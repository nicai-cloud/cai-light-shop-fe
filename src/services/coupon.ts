export type CouponType = {
    couponCode: string,
    isValid: boolean,
    discountPercentage: number
}

export const getCoupons = async (): Promise<CouponType[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/coupons`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return (await response.json()).coupons;
    } catch (error) {
        console.error('Failed to fetch coupons:', error);
        throw new Error('Unable to fetch coupons. Please try again later.');
    }
}

export const getCoupon = async (couponCode: string): Promise<CouponType> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/coupons/search?code=${couponCode}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch coupon with code ${couponCode}:`, error);
        throw new Error('Unable to fetch coupon. Please try again later.');
    }
}
