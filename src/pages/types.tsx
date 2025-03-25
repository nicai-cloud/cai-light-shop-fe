export type ConfirmOrderDetailsForm = {
    // Parent Details
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
