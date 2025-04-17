import { useOutletContext } from 'react-router-dom';
import Decimal from 'decimal.js';

export type SubmissionError = {
    message: string;
};

export interface CustomerDetails {
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
}

export type MainContext = {
    navigateTo: (path: string) => void;
    handleAddToCart: (destinaionPath?: string) => void;
    submitCompleteOrder: (details: any) => Promise<SubmissionError | null>;
    setCustomer: (data: CustomerDetails) => void;
    getCustomer: () => CustomerDetails;
    setDeliveryCost: (data: Decimal | null) => void;
    getDeliveryCost: () => Decimal;
    setPickupOrDelivery: (data: number) => void;
    getPickupOrDelivery: () => number;
    setDeliveryAddress: (data: string | null) => void;
    getDeliveryAddress: () => string | null;
};

export function useMainContext(): MainContext {
    return useOutletContext();
}
