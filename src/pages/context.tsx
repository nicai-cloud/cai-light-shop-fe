import { useOutletContext } from 'react-router-dom';

export type SubmissionError = {
    message: string;
};

export interface CustomerDetails {
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
    address: string;
}

export type MainContext = {
    navigateTo: (path: string) => void;
    handleAddToCart: (destinaionPath?: string) => void;
    submitCompleteOrder: (details: any) => Promise<SubmissionError | null>;
    submitCompleteOrderPickup: (details: any) => Promise<SubmissionError | null>;
    setCustomer: (data: CustomerDetails) => void;
    getCustomer: () => CustomerDetails;
};

export function useMainContext(): MainContext {
    return useOutletContext();
}
