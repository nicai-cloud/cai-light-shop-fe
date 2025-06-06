import { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import ErrorPanel from '../components/error-panel';
import TextField from '../components/input/text-field';
import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { StripeElementChangeEvent, StripeElementStyle } from '@stripe/stripe-js';
import StripeFieldWrapper from '../components/stripe-field-wrapper';
import { PaymentForm } from './types';
import { useMainContext } from './context';
import ActionButton from '../components/button/action-button';
import { useNavigate } from 'react-router-dom';
import { SUCCESS_PAGE } from '../utils/constants';

const STRIPE_ELEMENT_STYLE_PROPS: StripeElementStyle = {
    base: {
        'fontFamily': 'MierA, sans-serif',
        'fontSize': '18px',
        'fontSmoothing': 'antialiased',
        'lineHeight': '24px',
        'fontWeight': '500',
        ':focus': {},
        '::placeholder': {
            color: '#9395A1',
        },
    },
    invalid: {
        color: '#1B1F39',
    },
};

export default function Payment() {
    const navigate = useNavigate();
    const mainContext = useMainContext();
    const stripe = useStripe();
    const elements = useElements();

    // We need to manually store the error state from Stripe elements to render
    // error messages. These messages come in during onChange events.
    // We also store whether or not the field is empty, because Stripe does not consider
    // an empty field to be invalid. We use a ref rather than state so that we don't force
    // a re-render every time we change it.
    const [cardNumberError, setCardNumberError] = useState<string | null>(null);
    const isCardNumberEmpty = useRef(true);
    const [cardExpiryError, setCardExpiryError] = useState<string | null>(null);
    const isCardExpiryEmpty = useRef(true);
    const [cardCVVError, setCardCVVError] = useState<string | null>(null);
    const isCardCVVEmpty = useRef(true);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const form = useForm<PaymentForm>({
        defaultValues: {
            nameOnCard: '',
        },
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (mainContext.successfulOrderNumber) {
            navigate(SUCCESS_PAGE);
        }
    }, [mainContext.successfulOrderNumber]);

    const onSubmit = useCallback(async () => {
        if (!stripe || !elements) {
            console.error("Stripe.js hasn't loaded yet.");
            return;
        }

        if (isLoading) {
            return;
        }

        setIsLoading(true);

        const clientSecret = await mainContext.createPaymentIntent();

        // Confirm the payment (this triggers 3DS if required)
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement('cardNumber')!,
            },
        });

        if (error) {
            form.resetField('nameOnCard');
            setGlobalError(error.message ?? 'There was an error with the payment, please try again. If the problem persists, please contact support.');
            setIsLoading(false);
            return;
        }

        if (!paymentIntent || paymentIntent.status !== 'succeeded') {
            setGlobalError('There was an error with the payment, please try again. If the problem persists, please contact support.');
            setIsLoading(false);
            return;
        }

        const submissionResult = await mainContext.submitCompleteOrder(paymentIntent.id);
        if (submissionResult !== null) {
            setGlobalError(submissionResult.message);
            setIsLoading(false);
            window.scrollTo(0, 0);
        }
    }, [mainContext, isLoading, setIsLoading, setGlobalError]);

    // Payments
    const validateStripeFields = useCallback(() => {
        if (isCardNumberEmpty.current) {
            setCardNumberError('Please enter your card number.');
        }

        if (isCardExpiryEmpty.current) {
            setCardExpiryError('Please enter your card expiry.');
        }

        if (isCardCVVEmpty.current) {
            setCardCVVError('Please enter your card CVV.');
        }
    }, [isCardNumberEmpty, setCardNumberError, isCardExpiryEmpty, setCardExpiryError, isCardCVVEmpty, setCardCVVError]);

    const onValidationError = useCallback(() => {
        validateStripeFields();
    }, [validateStripeFields]);

    const handleCardNumberChange = useCallback((event: StripeElementChangeEvent) => {
        if (event.error !== undefined) {
            setCardNumberError(event.error.message);
        }
        else {
            setCardNumberError(null);
        }

        isCardNumberEmpty.current = event.empty;
    }, [isCardNumberEmpty, setCardNumberError]);

    const handleCardExpiryChange = useCallback((event: StripeElementChangeEvent) => {
        if (event.error !== undefined) {
            setCardExpiryError(event.error.message);
        }
        else {
            setCardExpiryError(null);
        }

        isCardExpiryEmpty.current = event.empty;
    }, [isCardExpiryEmpty, setCardExpiryError]);

    const handleCardCVVChange = useCallback((event: StripeElementChangeEvent) => {
        if (event.error !== undefined) {
            setCardCVVError(event.error.message);
        }
        else {
            setCardCVVError(null);
        }

        isCardCVVEmpty.current = event.empty;
    }, [isCardCVVEmpty, setCardCVVError]);

    return (
        <>
            <div className="w-full px-4">
                <div className="mt-8">
                    {globalError !== null && <ErrorPanel className="mt-8" text={globalError} />}

                    <form id="completeOrderForm" onSubmit={form.handleSubmit(onSubmit, onValidationError)}>
                        <FormProvider {...form}>
                            {/* Payments */}
                            <h2 className="text-h5 font-bold text-dark-strong mt-8 text-center">Payment</h2>
                            <p className="mt-2 text-p text-dark-medium text-center">All transactions are secure and encrypted.</p>
                            <StripeFieldWrapper htmlFor="card-number" label="Card number" className="mt-6 marker:w-full" forceErrorState={cardNumberError !== null}>
                                <CardNumberElement
                                    id="card-number"
                                    
                                    onChange={handleCardNumberChange}
                                    className="peer [&_iframe]:!outline-none border-none opacity-0 [&.StripeElement--focus]:opacity-100 [&:not(.StripeElement--empty)]:opacity-100"
                                    options={{ style: STRIPE_ELEMENT_STYLE_PROPS }}
                                />
                            </StripeFieldWrapper>
                            { cardNumberError
                            && (
                                <p className="pl-4 pt-[0.125rem] text-caption text-error text-left">
                                    {cardNumberError}
                                </p>
                            )}
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 justify-evenly sm:gap-2">
                                <div className="flex-grow basis-full">
                                    <StripeFieldWrapper label="Expiry date" htmlFor="card-expiry" forceErrorState={cardExpiryError !== null}>
                                        <CardExpiryElement
                                            id="card-expiry"
                                            onChange={handleCardExpiryChange}
                                            className="peer [&_iframe]:!outline-none border-none opacity-0 [&.StripeElement--focus]:opacity-100 [&:not(.StripeElement--empty)]:opacity-100"
                                            options={{ style: STRIPE_ELEMENT_STYLE_PROPS }}
                                        />
                                    </StripeFieldWrapper>
                                    { cardExpiryError
                                    && (
                                        <p className="pl-4 pt-[0.125rem] text-caption text-error text-left">
                                            {cardExpiryError}
                                        </p>
                                    )}
                                </div>
                                <div className="flex-grow basis-full">
                                    <StripeFieldWrapper label="CVV" htmlFor="card-cvv" forceErrorState={cardCVVError !== null}>
                                        <CardCvcElement
                                            id="card-cvv"
                                            onChange={handleCardCVVChange}
                                            className="peer [&_iframe]:!outline-none border-none opacity-0 [&.StripeElement--focus]:opacity-100 [&:not(.StripeElement--empty)]:opacity-100"
                                            options={{ style: STRIPE_ELEMENT_STYLE_PROPS }}
                                        />
                                    </StripeFieldWrapper>
                                    { cardCVVError
                                    && (
                                        <p className="pl-4 pt-[0.125rem] text-caption text-error text-left">
                                            {cardCVVError}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <TextField
                                label="Name on card"
                                name="nameOnCard"
                                className="mt-4"
                                rules={{
                                    required: {
                                        value: true,
                                        message: 'Please enter the name as written on your card.',
                                    },
                                }}
                            />
                        </FormProvider>
                    </form>
                </div>
                <div className="mt-20 flex items-center justify-center">
                    <ActionButton
                        type="submit"
                        form="completeOrderForm"
                        className="text-white px-8 py-2 rounded bg-pink-300"
                        loading={isLoading}
                    >
                        COMPLETE ORDER
                    </ActionButton>
                </div>
            </div>
        </>
    );
}
