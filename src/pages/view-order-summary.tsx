import { useCallback, useContext, useEffect, useState } from 'react';
import { useMainContext } from './context';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { CartContext } from '../context/CartContext';
import useSWR from 'swr';
import { getPreselections } from '../services/preselection';
import Spinner from '../components/loading/spinner';
import { GET_ALL_IMAGE_URLS, CONFIRM_ORDER_PAGE, GET_BAGS, GET_ITEMS, GET_PRESELECTIONS, GET_SHIPPING_METHOD_INFO, HOME_PAGE } from '../utils/constants';
import { getCoupon } from '../services/coupon';
import { getAllImageUrls } from '../services/image';
import { getBags } from '../services/bag';
import { getItems } from '../services/item';
import { getShippingMethodInfo } from '../services/shippingMethod';
import { getNumberEnv } from '../utils/load-env';
import { NavArrowDown } from 'iconoir-react';
import EditQuantity from '../components/edit-quantity';
import { formatMoney } from '../utils/format-money';
import DropdownWithoutLabel, { DropdownOption } from '../components/input/dropdown-without-label';
import { ConfirmCartItemDeletionModal } from "./confirm-cart-item-deletion-modal";
import Decimal from 'decimal.js';
import { preloadImage } from '../services/preload_image';

export default function ViewOrderSumary() {
    const SHIPPING_METHODS = [{id: 1, name: "Standard"}, {id: 2, name: "Express"}]

    const mainContext = useMainContext();
    const cartContext = useContext(CartContext);
    const { shippingMethod, setShippingMethod } = useContext(CartContext);
    const { coupon, setCoupon } = useContext(CartContext);

    const [shippingCost, setShippingCost] = useState<Decimal>(Decimal(0));
    const [enteredCouponCode, setEnteredCouponCode] = useState("");
    const [emptyCoupon, setEmptyCoupon] = useState<boolean>(false);
    const [invalidCoupon, setInvalidCoupon] = useState<boolean>(false);
    const [deletedCartItemId, setDeletedCartItemId] = useState<string | null>(null);
    const [confirmCartItemDeletionModalOpen, setConfirmCartItemDeletionModalOpen] = useState<boolean>(false);

    const {isLoading: isImagesLoading, data: images} = useSWR(GET_ALL_IMAGE_URLS, getAllImageUrls, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const {isLoading: isPreselectionsLoading, data: preselections} = useSWR(GET_PRESELECTIONS, getPreselections, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });
    const {isLoading: isBagsLoading, data: bags} = useSWR(GET_BAGS, getBags, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });
    const {isLoading: isItemsLoading, data: items} = useSWR(GET_ITEMS, getItems, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });
    const {isLoading: isShippingMethodLoading, data: shippingMethodInfo} = useSWR(GET_SHIPPING_METHOD_INFO, getShippingMethodInfo, {
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
        if (shippingMethodInfo) {
            setShippingCost(calculateShippingCost())
        }
    }, [cartContext, shippingMethodInfo])

    const calculateSubtotal = () => {
        return cartContext.cart.reduce((total, {price, quantity}) => price.times(quantity).add(total), Decimal(0));
    }

    const calculateSubtotalWithCoupon = () => {
        const original = cartContext.cart.reduce((total, {price, quantity}) => price.times(quantity).add(total), Decimal(0));
        return original.times(1 - coupon!.discountPercentage / 100);
    }

    const calculateShippingCost = () => {
        if (calculateSubtotal().gte(shippingMethodInfo!.freeShippingThreshold)) {
            if (shippingMethod.id === 1) {
                return shippingMethodInfo!.shippingMethods[0].discountFee;
            } else {
                return shippingMethodInfo!.shippingMethods[1].discountFee;
            }
        } else {
            if (shippingMethod.id === 1) {
                return shippingMethodInfo!.shippingMethods[0].fee;
            } else {
                return shippingMethodInfo!.shippingMethods[1].fee;
            }
        }
    }

    const countPreselectionItems = useCallback(() => {
        return cartContext.cart.filter(cartItem => cartItem.selection.preselectionId !== undefined).length;
    }, [cartContext])

    const handleCheckout = useCallback(() => {
        mainContext.navigateTo(CONFIRM_ORDER_PAGE);
        setDeletedCartItemId(null);
    }, [mainContext])

    const handleDropdownChange = (value: DropdownOption) => {
        setShippingMethod(value);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEnteredCouponCode(event.target.value);
    };

    const handleApplyCouponCode = async () => {
        const resp = await getCoupon(enteredCouponCode);
        if (resp.isValid) {
            setCoupon(resp);
        }

        if (enteredCouponCode === "") {
            setEmptyCoupon(true);
            setInvalidCoupon(false);
        } else {
            setEmptyCoupon(false);
            setInvalidCoupon(!resp.isValid);
        }
    };

    if (isImagesLoading || !images ||
        isPreselectionsLoading || !preselections ||
        isBagsLoading || !bags ||
        isItemsLoading || !items ||
        isShippingMethodLoading || !shippingMethodInfo
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
                        const preselectionId = cartItem.selection.preselectionId;

                        return (
                            <div key={cartItem.itemId} className="mb-8">
                                {preselectionId && (
                                    <div className="my-8">
                                        {index === 0 && (<div className="text-xl mb-4">Surprise bags</div>)}
                                        <Disclosure
                                            as="div"
                                            className="flex flex-col items-start gap-3 text-start self-stretch"
                                            defaultOpen={true}
                                        >
                                            <div className="w-full flex flex-row justify-between">
                                                <div className="justify-start flex flex-row">
                                                    <DisclosureButton className="group self-stretch">
                                                        <NavArrowDown className="transition duration-150 ease-in-out group-data-[open]:rotate-180" />
                                                    </DisclosureButton>
                                                    <p className="ml-3 text-xl">No.{index + 1}</p>
                                                </div>
                                                <div className="flex flex-row items-center">
                                                    <EditQuantity
                                                        cartItem={cartItem}
                                                        onTrashClick={() => {
                                                            setDeletedCartItemId(cartItem.itemId);
                                                            setConfirmCartItemDeletionModalOpen(true);
                                                        }}
                                                    />
                                                    <p className="ml-4 w-16 text-right">${formatMoney(cartItem.price.times(cartItem.quantity))}</p>
                                                </div>
                                            </div>
                                            <DisclosurePanel
                                                transition
                                                className="transition duration-150 east-out data-[closed]:-translate-y-2 data-[closed]:opacity-0 self-stretch"
                                            >
                                                {(() => {
                                                    // Preselection gift
                                                    const preselection = preselections.find(preselection => preselection.id === preselectionId)!;
                                                    return (
                                                        <div className="flex flex-row items-center justify-between">
                                                            <img src={preselection.imageUrl} alt={preselection.name} className="w-[150px] h-[150px]" />
                                                            <p>{preselection.name}</p>
                                                        </div>
                                                    )
                                                })}
                                            </DisclosurePanel>
                                        </Disclosure>
                                    </div>
                                )}
                                <hr className={`mt-8 ${(index === countPreselectionItems() - 1 || index === cartContext.cart.length-1) ? "border-2 border-gray-300" : ""}`}/>
                            </div>
                        )
                    })}
                </div>
                <div className="flex flex-row justify-end mt-4">
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
                )}
                <div className="flex flex-row text-lg justify-between mt-4">
                    <p>Subtotal</p>
                    {coupon && coupon.isValid && (
                        <div className="flex flex-row">
                            <p className="line-through text-red-500 mr-4">${formatMoney(calculateSubtotal())}</p>
                            <p>${formatMoney(calculateSubtotalWithCoupon())}</p>
                        </div>
                    )}
                    {(!coupon || !coupon.isValid) && (
                        <p>${formatMoney(calculateSubtotal())}</p>
                    )}
                </div>
                <div className="flex flex-row text-lg justify-between mt-1">
                    <div className="flex flex-row">
                        <p className="mr-3">Shipping</p>
                        <DropdownWithoutLabel
                            options={SHIPPING_METHODS}
                            value={shippingMethod}
                            onChange={handleDropdownChange}
                            className="w-[100px] mt-[3px]"
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
                    {coupon && coupon.isValid && (
                        <p>${formatMoney(calculateSubtotalWithCoupon().add(shippingCost))}</p>
                    )}
                    {(!coupon || !coupon.isValid) && (
                        <p>${formatMoney(calculateSubtotal().add(shippingCost))}</p>
                    )}
                </div>
                <div className="mt-20 flex items-center justify-center">
                    <button
                        className="text-white px-8 py-2 rounded bg-[#1bafe7]"
                        onClick={handleCheckout}
                    >
                        Check out
                    </button>
                </div>
            </div>
        </>
    );
}
