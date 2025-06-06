import Decimal from 'decimal.js';
import { createContext, useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';

export type SubmissionError = {
    message: string;
};

type OrderItemType = {
    quantity: number,
    lightVariantId: number
}

export interface CustomerDetails {
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
}

interface MainContextProps {
    getOrderItemsFromCart: () => OrderItemType[];
    createPaymentIntent: () => Promise<string>;
    submitCompleteOrder: (paymentIntentId: string) => Promise<SubmissionError | null>;
    expandOrderTotal: boolean;
    setExpandOrderTotal: (expandOrderTotal: boolean) => void;
    deletedCartItemId: string | null;
    setDeletedCartItemId: (deletedCartItemId: string | null) => void;
    confirmCartItemDeletionModalOpen: boolean;
    setConfirmCartItemDeletionModalOpen: (confirmCartItemDeletionModalOpen: boolean) => void;
    customer: CustomerDetails | null;
    setCustomer: (customerDetails: CustomerDetails) => void;
    pickupOrDelivery: number | null;
    setPickupOrDelivery: (pickupOrDelivery: number) => void;
    deliveryAddress: string | null;
    setDeliveryAddress: (deliveryAddress: string | null) => void;
    deliveryCost: Decimal | null;
    setDeliveryCost: (deliveryCost: Decimal | null) => void;
    successfulOrderNumber: string | null;
    setSuccessfulOrderNumber: (successfulOrderNumber: string | null) => void;
};

export const MainContext = createContext<MainContextProps | null>(null);

export const useMainContext = () => {
    const context = useContext(MainContext);
    if (!context) throw new Error("useMainContext must be within a MainContextProvider");
    return context;
}

export const MainContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const cartContext = useContext(CartContext);
    const [deletedCartItemId, setDeletedCartItemId] = useState<string | null>(null);
    const [expandOrderTotal, setExpandOrderTotal] = useState(false);
    const [successfulOrderNumber, setSuccessfulOrderNumber] = useState<string | null>(null);
    const [confirmCartItemDeletionModalOpen, setConfirmCartItemDeletionModalOpen] = useState<boolean>(false);

    const [customer, setCustomer] = useState<CustomerDetails | null>(null);
    const [pickupOrDelivery, setPickupOrDelivery] = useState<number | null>(null);
    const [deliveryAddress, setDeliveryAddress] = useState<string | null>(null);
    const [deliveryCost, setDeliveryCost] = useState<Decimal | null>(null);

    const getOrderItemsFromCart = () => {
        const orderItems: OrderItemType[] = cartContext.cart.map((cartItem) => ({
            quantity: cartItem.quantity,
            lightVariantId: cartItem.selection.lightVariantId,
        }));
        return orderItems;
    }

    const createPaymentIntent = async () => {
        const res = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/payment/payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderItems: getOrderItemsFromCart(),
                fulfillmentMethod: pickupOrDelivery,
            }),
        });
        const { clientSecret } = await res.json();
        return clientSecret;
    }

    const submitCompleteOrder = async (paymentIntentId: string) => {
        let response;
        try {
            response = await fetch(`${import.meta.env.VITE_LIGHT_SHOP_API}/complete-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerInfo: {
                        firstName: customer!.firstName,
                        lastName: customer!.lastName,
                        mobile: customer!.mobile,
                        email: customer!.email,
                    },
                    orderItems: getOrderItemsFromCart(),
                    paymentIntentId: paymentIntentId,
                    fulfillmentMethod: pickupOrDelivery,
                    deliveryAddress: deliveryAddress,
                    couponCode: cartContext.coupon?.couponCode,
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

        setSuccessfulOrderNumber((await response.json()).orderNumber);
        cartContext.clearCart();
        setDeletedCartItemId(null);
        setExpandOrderTotal(false);

        return null;
    };
    
    return (
        <MainContext.Provider value={
            {
                getOrderItemsFromCart,
                createPaymentIntent,
                submitCompleteOrder,
                expandOrderTotal,
                setExpandOrderTotal,
                deletedCartItemId,
                setDeletedCartItemId,
                confirmCartItemDeletionModalOpen,
                setConfirmCartItemDeletionModalOpen,
                customer,
                setCustomer,
                pickupOrDelivery,
                setPickupOrDelivery,
                deliveryAddress,
                setDeliveryAddress,
                deliveryCost,
                setDeliveryCost,
                successfulOrderNumber,
                setSuccessfulOrderNumber,
            }
        }>
            {children}
        </MainContext.Provider>
    );
};