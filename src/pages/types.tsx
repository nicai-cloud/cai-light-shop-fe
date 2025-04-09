export type BasicCustomerDetailsForm = {
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
};

export type CustomerDetailsForm = {
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
    address: string | null;
};

export type PaymentForm = {
    nameOnCard: string;
};
