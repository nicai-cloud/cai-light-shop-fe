export type ConfirmOrderDetailsForm = {
    // Customer Details
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;

    // Address
    address: string | null;

    // Payments
    nameOnCard: string;
    paymentMethodId: string;
    lastFour: string;
    expiry: {
        month: number;
        year: number;
    };
};

export type ConfirmOrderPickupDetailsForm = {
    // Customer Details
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
};
