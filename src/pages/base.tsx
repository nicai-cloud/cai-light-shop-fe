import { Elements } from "@stripe/react-stripe-js";
import Page from "../components/page";
import tailwindMerge from "../utils/tailwind-merge";
import { Outlet, useNavigate } from "react-router-dom";
import { useCallback, useContext, useRef, useState } from "react";
import { loadStripe, Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { MainContext } from "./context";
import { ShoppingCart } from 'react-feather';
import { CartContext } from "../context/CartContext";
import { ShoppingCartModal } from "./shopping-cart-modal";
import { ConfirmCartItemDeletionModal } from "./confirm-cart-item-deletion-modal";
import { AddToCartModal } from "./add-to-cart-modal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faHome } from '@fortawesome/free-solid-svg-icons';
// import { faFacebook, faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { HOME_PAGE, SUCCESS_PAGE, PICKUP_ORDER_SUCCESS_PAGE } from "../utils/constants";
import Spinner from "../components/loading/spinner";

type LightVariantType = {
    quantity: number,
    lightVariantId: number
}

type OrderItemType = LightVariantType

type PublishableKeyResponse = {
    publishableKey: string;
};
  
async function retrievePublishableKey(): Promise<PublishableKeyResponse> {
    const response = await fetch(
      `${import.meta.env.VITE_LIGHT_SHOP_API}/complete-order/publishable-key`
    );
    return await response.json();
}

export default function Base() {
    const navigate = useNavigate();
    const cartContext = useContext(CartContext);
    const [isLoading, setIsLoading] = useState(true);
    const [shoppingCartModalOpen, setShoppingCartModalOpen] = useState<boolean>(false);
    const [confirmCartItemDeletionModalOpen, setConfirmCartItemDeletionModalOpen] = useState<boolean>(false);
    const [addToCartDestination, setAddToCartDestination] = useState<string | undefined>(undefined);
    const [addToCartModalOpen, setAddToCartModalOpen] = useState<boolean>(false);
    const [deletedCartItemId, setDeletedCartItemId] = useState<string | null>(null);

    const stripePromise = useRef<Promise<Stripe | null> | null>(null);

    const getStripePromise = () => {
        if (stripePromise.current === null) {
            stripePromise.current = retrievePublishableKey().then((details) => {
                setIsLoading(false);
                return loadStripe(details.publishableKey);
            });
        }

        return stripePromise.current;
    };

    const navigateTo = useCallback((path: string) => {
        navigate(path);
    }, [])

    const handleAddToCart = (addToCartDestination?: string) => {
        setAddToCartModalOpen(true);
        setAddToCartDestination(addToCartDestination);
    }

    // const handleInstagramIconClick = () => {
    //     window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer');
    // }

    // const handleFacebookIconClick = () => {
    //     window.open('https://www.facebook.com', '_blank', 'noopener,noreferrer');
    // }

    // const handleTiktokIconClick = () => {
    //     window.open('https://www.tiktok.com', '_blank', 'noopener,noreferrer');
    // }

    const submitCompleteOrder = async (finalPageDetails: any) => {
        const snakeCaseAddress = {};

        Object.keys(finalPageDetails.address ?? {}).forEach((k) => {
            const snakeCaseKey = k.split(/\.?(?=[A-Z])/).join('_').toLowerCase();
            // @ts-expect-error: We are iterating through keys of the Addres type.

            snakeCaseAddress[snakeCaseKey] = finalPageDetails.address[k];
        });

        const orderItems: OrderItemType[] = [];
        cartContext.cart.map((cartItem) => {
            if (cartItem.selection.lightVariantId) {
                orderItems.push({quantity: cartItem.quantity, lightVariantId: cartItem.selection.lightVariantId})
            }
        })

        let response;
        try {
            response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/complete-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerInfo: {
                        firstName: finalPageDetails?.firstName,
                        lastName: finalPageDetails?.lastName,
                        mobile: finalPageDetails?.mobile,
                        email: finalPageDetails?.email,
                        address: finalPageDetails?.address,
                    },
                    orderItems: orderItems,
                    shippingMethod: cartContext.shippingMethod.id,
                    couponCode: cartContext.coupon?.couponCode,
                    paymentMethodId: finalPageDetails?.paymentMethodId,
                }),
            });
        }
        catch (e) {
            return {
                message: 'There was an unexpected error completing your order. Please try again.',
            };
        }

        if (response.status === 400 && (await response.json()).description === "Out of stock") {
            return {
                message: 'Sorry, we are running out of stock for the items you have ordered.',
            }
        }

        if (response.status === 402) {
            return {
                message: 'There was an error processing the payment for your order. Please check you have sufficient funds and try again.',
            };
        }

        if (response.status >= 400) {
            return {
                message: 'There was an unexpected error completing your order. Please try again.',
            };
        }

        cartContext.clearCart();
        setDeletedCartItemId(null);
        navigateTo(`${SUCCESS_PAGE}#${(await response.json()).order_number}`);

        return null;
    };

    const submitCompleteOrderPickup = async (finalPageDetails: any) => {
        const orderItems: OrderItemType[] = [];
        cartContext.cart.map((cartItem) => {
            if (cartItem.selection.lightVariantId) {
                orderItems.push({quantity: cartItem.quantity, lightVariantId: cartItem.selection.lightVariantId})
            }
        })

        let response;
        try {
            response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/complete-order-pickup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerInfo: {
                        firstName: finalPageDetails?.firstName,
                        lastName: finalPageDetails?.lastName,
                        mobile: finalPageDetails?.mobile,
                        email: finalPageDetails?.email
                    },
                    orderItems: orderItems
                }),
            });
        }
        catch (e) {
            return {
                message: 'There was an unexpected error completing your order. Please try again.',
            };
        }

        if (response.status === 400 && (await response.json()).description === "Out of stock") {
            return {
                message: 'Sorry, we are running out of stock for the items you have ordered.',
            }
        }

        if (response.status >= 400) {
            return {
                message: 'There was an unexpected error completing your order. Please try again.',
            };
        }

        cartContext.clearCart();
        setDeletedCartItemId(null);
        navigateTo(`${PICKUP_ORDER_SUCCESS_PAGE}#${(await response.json()).order_number}`);

        return null;
    };

    const context: MainContext = {
        navigateTo,
        handleAddToCart,
        submitCompleteOrder,
        submitCompleteOrderPickup
    };

    const stripeElementsOptions: StripeElementsOptions = {
        fonts: [
            {
                family: 'MierA',
                weight: '500',
                src: 'url(\'https://assets.website-files.com/66011a06f3784731d8385669/66725bc1116596e6fbae0699_MierA-Book.woff\') format(\'woff\')',
            },
        ],
        appearance: {
            labels: 'floating',
        },
    };
    
    return (
        <Page>
            {shoppingCartModalOpen === true && (
                <ShoppingCartModal
                    onClose={() => {
                        setShoppingCartModalOpen(false);
                        if (cartContext.cart.length === 0) {
                            navigateTo(HOME_PAGE);
                        }
                    }}
                    onTrashClick={() => setConfirmCartItemDeletionModalOpen(true)}
                    setDeletedCartItemId={(cartItemId: string) => setDeletedCartItemId(cartItemId)}
                />
            )}
            {confirmCartItemDeletionModalOpen === true && (
                <ConfirmCartItemDeletionModal
                    onClose={() => {
                        setConfirmCartItemDeletionModalOpen(false);
                    }}
                    onYes={() => cartContext.removeItem(deletedCartItemId!)}
                />
            )}
            {addToCartModalOpen === true && (
                <AddToCartModal onClose={() => {
                    setAddToCartModalOpen(false);
                    if (addToCartDestination) {
                        navigateTo(addToCartDestination);
                    }
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                    });
                }}/>
            )}
            <Page.Header className="bg-white border-b border-gray-300">
                <div className="relative flex items-center justify-between p-3">
                    <div className="p-3 cursor-pointer" onClick={() => navigateTo(HOME_PAGE)}>
                        <FontAwesomeIcon icon={faHome} size="2x" />
                    </div>
                    <div className="flex items-center justify-center">
                        <p className="text-3xl">LightOZ</p>
                    </div>
                    <div className="p-3" onClick={() => setShoppingCartModalOpen(true)}>
                        <div className="relative">
                            <ShoppingCart className="text-gray-700" size={32}/>
                            <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full px-2 py-0.5">
                                {cartContext.cart.length}
                            </span>
                        </div>
                    </div>
                </div>
            </Page.Header>
            <Page.Content className={tailwindMerge('mb-10 flex-grow justify-start items-center')}>
                <Elements stripe={getStripePromise()} options={stripeElementsOptions}>
                    { isLoading
                        ? (
                            <div className="flex items-center justify-center w-full">
                                <div className="mt-[200px] mb-[160px]">
                                    <Spinner size="h-20 w-20" />
                                </div>
                            </div>
                        )
                        : (
                            <div className="flex items-center justify-center w-full">
                                <Outlet context={context} />
                            </div>
                        )
                    }
                </Elements>
            </Page.Content>
            <Page.Footer
                className={tailwindMerge(
                    'overflow-hidden bg-gray-600 flex justify-center items-start',
                    'transition-[padding] px-4 py-2 sm:py-8 duration-150 ease-in-out has-[[data-outlet]:empty]:py-0 has-[[data-outlet]:empty]:shadow-none',
                )}
            >
                <div className="w-full flex px-1">
                    <div className="flex flex-col">
                        <div className="flex flex-row justify-between items-center mb-4">
                            <FontAwesomeIcon className="text-white mr-2" icon={faEnvelope} size="2x"/>
                            <a className="text-white" href="mailto:support@lightoz.com.au">support@lightoz.com.au</a>
                        </div>
                        {/* <div className="flex flex-row">
                            <FontAwesomeIcon className="cursor-pointer text-white mr-8" icon={faInstagram} size="2x" onClick={handleInstagramIconClick} />
                            <FontAwesomeIcon className="cursor-pointer text-white mr-8" icon={faFacebook} size="2x" onClick={handleFacebookIconClick} />
                            <FontAwesomeIcon className="cursor-pointer text-white" icon={faTiktok} size="2x" onClick={handleTiktokIconClick} />
                        </div> */}
                    </div>
                </div>
            </Page.Footer>
        </Page>
    );
}
