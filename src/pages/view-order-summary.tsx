import { useCallback, useContext, useEffect, useState } from 'react';
import { useMainContext } from './context';
import { CartContext } from '../context/CartContext';
import useSWR from 'swr';
import { getLights, getLightVariants } from '../services/light';
import Spinner from '../components/loading/spinner';
import { GET_ALL_LIGHT_VARIANTS_IMAGE_URLS, CUSTOMER_PAGE, CONFIRM_ORDER_PICKUP_PAGE, GET_LIGHTS, GET_LIGHT_VARIANTS, GET_FULFILLMENT_METHOD_INFO, HOME_PAGE } from '../utils/constants';
// import { getCoupon } from '../services/coupon';
import { getAllLightVariantsImageUrls } from '../services/image';
import { getFulfillmentMethodInfo } from '../services/fulfillmentMethod';
import { getNumberEnv } from '../utils/load-env';
import EditQuantity from '../components/edit-quantity';
import { formatMoney } from '../utils/format-money';
import DropdownWithoutLabel, { DropdownOption } from '../components/input/dropdown-without-label';
import { ConfirmCartItemDeletionModal } from "./confirm-cart-item-deletion-modal";
import Decimal from 'decimal.js';
import { preloadImage } from '../services/preload_image';

export default function ViewOrderSumary() {
    const FULFILLMENT_METHODS = [
        {id: 0, name: "Pickup"},
        {id: 1, name: "Standard Post"},
        {id: 2, name: "Express Post"}
    ]
    
    const DELIVERY_METHOD_PICKUP = 0;
    const DELIVERY_METHOD_POST_STANDARD = 1;
    const DELIVERY_METHOD_POST_EXPRESS = 2;

    const mainContext = useMainContext();
    const cartContext = useContext(CartContext);
    const { fulfillmentMethod, setFulfillmentMethod } = useContext(CartContext);
    // const { coupon, setCoupon } = useContext(CartContext);

    const [shippingCost, setShippingCost] = useState<Decimal>(Decimal(0));
    // const [enteredCouponCode, setEnteredCouponCode] = useState("");
    // const [emptyCoupon, setEmptyCoupon] = useState<boolean>(false);
    // const [invalidCoupon, setInvalidCoupon] = useState<boolean>(false);
    const [deletedCartItemId, setDeletedCartItemId] = useState<string | null>(null);
    const [confirmCartItemDeletionModalOpen, setConfirmCartItemDeletionModalOpen] = useState<boolean>(false);

    const {isLoading: isImagesLoading, data: images} = useSWR(GET_ALL_LIGHT_VARIANTS_IMAGE_URLS, getAllLightVariantsImageUrls, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const {isLoading: isLightsLoading, data: lights} = useSWR(GET_LIGHTS, getLights, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const {isLoading: isLightVariantsLoading, data: lightVariants} = useSWR(GET_LIGHT_VARIANTS, getLightVariants, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const {isLoading: isFulfillmentMethodLoading, data: fulfillmentMethodInfo} = useSWR(GET_FULFILLMENT_METHOD_INFO, getFulfillmentMethodInfo, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    })

    useEffect(() => {
        if (cartContext.cart.length === 0) {
            mainContext.navigateTo(HOME_PAGE)
        }
    }, [cartContext]);

    useEffect(() => {
        if (images) {
            images.forEach(preloadImage);
        }
    }, [images]);

    useEffect(() => {
        if (fulfillmentMethodInfo) {
            setShippingCost(calculateShippingCost())
        }
    }, [cartContext, fulfillmentMethodInfo])

    const calculateSubtotal = () => {
        return cartContext.cart.reduce((total, {price, quantity}) => price.times(quantity).add(total), Decimal(0));
    }

    // const calculateSubtotalWithCoupon = () => {
    //     const original = cartContext.cart.reduce((total, {price, quantity}) => price.times(quantity).add(total), Decimal(0));
    //     return original.times(1 - coupon!.discountPercentage / 100);
    // }

    const calculateShippingCost = () => {
        if (calculateSubtotal().gte(fulfillmentMethodInfo!.freeShippingThreshold)) {
            return fulfillmentMethodInfo!.fulfillmentMethods[fulfillmentMethod.id].discountFee;
        } else {
            return fulfillmentMethodInfo!.fulfillmentMethods[fulfillmentMethod.id].fee;
        }
    }

    const countLightItems = useCallback(() => {
        return cartContext.cart.filter(cartItem => cartItem.selection.lightVariantId !== undefined).length;
    }, [cartContext])

    const handleCheckout = () => {
        if (fulfillmentMethod.id === DELIVERY_METHOD_PICKUP) {
            mainContext.navigateTo(CONFIRM_ORDER_PICKUP_PAGE);
        } else {
            mainContext.navigateTo(CUSTOMER_PAGE);
        }
        setDeletedCartItemId(null);
    }

    const handleDropdownChange = (value: DropdownOption) => {
        setFulfillmentMethod(value);
    };

    // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setEnteredCouponCode(event.target.value);
    // };

    // const handleApplyCouponCode = async () => {
    //     const resp = await getCoupon(enteredCouponCode);
    //     if (resp.isValid) {
    //         setCoupon(resp);
    //     }

    //     if (enteredCouponCode === "") {
    //         setEmptyCoupon(true);
    //         setInvalidCoupon(false);
    //     } else {
    //         setEmptyCoupon(false);
    //         setInvalidCoupon(!resp.isValid);
    //     }
    // };

    if (isImagesLoading || !images ||
        isLightsLoading || !lights ||
        isLightVariantsLoading || !lightVariants ||
        isFulfillmentMethodLoading || !fulfillmentMethodInfo
    ) {
        return (
            <div className="w-full flex items-center justify-center">
                <Spinner size="h-20 w-20" />
            </div>
        )
    }

    return (
        <>
            <div className="w-full px-4">
                {confirmCartItemDeletionModalOpen === true && (
                    <ConfirmCartItemDeletionModal
                        onClose={() => {
                            setConfirmCartItemDeletionModalOpen(false);
                        }}
                        onYes={() => cartContext.removeItem(deletedCartItemId!)}
                    />
                )}
                <div className="text-2xl my-8 flex justify-center items-center">
                    <p>Order Summary</p>
                </div>
                <hr className={"border-2 border-gray-300"}/>
                <div>
                    {cartContext.cart.map((cartItem, index) => {
                        return (
                            <div key={cartItem.itemId} className="mb-8">
                                <div className="my-8">
                                    {index === 0 && (<div className="text-xl mb-4">Lights</div>)}
                                    <div className="flex flex-row justify-between items-center">
                                    <div className="flex flex-row items-center">
                                        <img src={cartItem.imageUrl} alt="image source" className="w-[80px] h-[80px]" />
                                        <div className="flex flex-col">
                                            <p className="ml-4">{cartItem.name}</p>
                                            <p className="ml-4">{cartItem.dimensionStr}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row">
                                        <EditQuantity
                                            cartItem={cartItem}
                                            onTrashClick={() => {
                                                setDeletedCartItemId(cartItem.itemId);
                                                setConfirmCartItemDeletionModalOpen(true);
                                            }}
                                        />
                                        <p className="ml-4 w-16 text-right">${cartItem.price.times(cartItem.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                                </div>
                                <hr className={`mt-8 ${(index === countLightItems() - 1 || index === cartContext.cart.length-1) ? "border-2 border-gray-300" : ""}`}/>
                            </div>
                        )
                    })}
                </div>
                {/* <div className="flex flex-row justify-end mt-4">
                    <input
                        type="text"
                        value={enteredCouponCode}
                        onChange={handleChange}
                        placeholder="Enter Coupon Code"
                        className="max-w-[160px] border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-none"
                    />
                    <button
                        className="text-white px-4 py-2 bg-black"
                        onClick={handleApplyCouponCode}
                    >
                        Apply
                    </button>
                </div>
                {coupon && coupon.isValid && (
                    <p className="mt-4 flex justify-end">{`${coupon.discountPercentage}% discount applied`}</p>
                )}
                {emptyCoupon && (
                    <p className="mt-4 flex justify-end text-red-500">Enter a coupon!</p>
                )}
                {invalidCoupon && (
                    <p className="mt-4 flex justify-end text-red-500">Invalid coupon!</p>
                )} */}
                <div className="flex flex-row text-lg justify-between mt-4">
                    <p>Subtotal</p>
                    <p>${formatMoney(calculateSubtotal())}</p>
                    {/* {coupon && coupon.isValid && (
                        <div className="flex flex-row">
                            <p className="line-through text-red-500 mr-4">${formatMoney(calculateSubtotal())}</p>
                            <p>${formatMoney(calculateSubtotalWithCoupon())}</p>
                        </div>
                    )}
                    {(!coupon || !coupon.isValid) && (
                        <p>${formatMoney(calculateSubtotal())}</p>
                    )} */}
                </div>
                <div className="flex flex-row text-lg justify-between mt-1">
                    <div className="flex flex-row">
                        <p className="mr-3">Pickup or Post</p>
                        <DropdownWithoutLabel
                            options={FULFILLMENT_METHODS}
                            value={fulfillmentMethod}
                            onChange={handleDropdownChange}
                            className="w-[150px]"
                        />
                    </div>
                    {shippingCost.eq(0) && (
                        <p>Free</p>
                    )}
                    {shippingCost.gt(0) && (
                        <p>${formatMoney(shippingCost)}</p>
                    )}
                </div>
                <div className="flex flex-row text-lg justify-between mt-1">
                    <p>Order Total</p>
                    {fulfillmentMethod.id === DELIVERY_METHOD_PICKUP && (
                        <p>${formatMoney(calculateSubtotal())}</p>
                    )}
                    {(fulfillmentMethod.id === DELIVERY_METHOD_POST_STANDARD ||
                      fulfillmentMethod.id === DELIVERY_METHOD_POST_EXPRESS) && (
                        <p>${formatMoney(calculateSubtotal().add(shippingCost))}</p>
                    )}
                    {/* {coupon && coupon.isValid && (
                        <p>${formatMoney(calculateSubtotalWithCoupon().add(shippingCost))}</p>
                    )}
                    {(!coupon || !coupon.isValid) && (
                        <p>${formatMoney(calculateSubtotal().add(shippingCost))}</p>
                    )} */}
                </div>
                <div className="mt-20 flex items-center justify-center">
                    <button
                        className="text-white px-8 py-2 rounded bg-pink-300"
                        onClick={handleCheckout}
                    >
                        Check out
                    </button>
                </div>
            </div>
        </>
    );
}
