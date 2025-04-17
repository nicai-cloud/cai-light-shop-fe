export type CustomerDetailsForm = {
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
    pickupOrDelivery: number | null;
    deliveryAddress: string | null;
};

export type PaymentForm = {
    nameOnCard: string;
};
