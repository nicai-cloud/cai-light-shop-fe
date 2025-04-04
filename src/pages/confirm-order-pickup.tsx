import { useCallback, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import ErrorPanel from '../components/error-panel';
import TextField from '../components/input/text-field';
import { ConfirmOrderPickupDetailsForm } from './types';
import { useMainContext } from './context';
import ActionButton from '../components/button/action-button';

export default function ConfirmOrderPickup() {
    const mainContext = useMainContext();

    const [globalError, setGlobalError] = useState<string | null>(null);

    const form = useForm<ConfirmOrderPickupDetailsForm>({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            mobile: ''
        },
    });

    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = useCallback(async (data: ConfirmOrderPickupDetailsForm) => {
        if (isLoading) {
            return;
        }

        setIsLoading(true);

        const submissionResult = await mainContext.submitCompleteOrderPickup({
            firstName: data.firstName,
            lastName: data.lastName,
            mobile: data.mobile,
            email: data.email
        });

        if (submissionResult !== null) {
            setGlobalError(submissionResult.message);
            setIsLoading(false);
            window.scrollTo(0, 0);
        }
    }, [mainContext, isLoading, setIsLoading, setGlobalError]);

    const onValidationError = useCallback(() => {
    }, []);

    return (
        <>
            <div className="w-full px-4">
                <div className="mt-8">
                    {globalError !== null && <ErrorPanel className="mt-8" text={globalError} />}

                    <form id="completeOrderForm" onSubmit={form.handleSubmit(onSubmit, onValidationError)}>
                        <FormProvider {...form}>

                            {/* Customer Details */}
                            <h2 className="text-h5 font-bold text-dark-strong mt-4 text-center">Enter your details</h2>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 justify-between gap-4">
                                <TextField
                                    className="flex-grow"
                                    type="text"
                                    label="First name"
                                    name="firstName"
                                    rules={{
                                        required: {
                                            value: true,
                                            message: 'Please enter your first name.',
                                        },
                                    }}
                                />
                                <TextField
                                    className="flex-grow"
                                    type="text"
                                    label="Last name"
                                    name="lastName"
                                    rules={{
                                        required: {
                                            value: true,
                                            message: 'Please enter your last name.',
                                        },
                                    }}
                                />
                            </div>
                            <div className="mt-4 flex flex-row justify-between gap-4">
                                <TextField
                                    className="flex-grow"
                                    type="tel"
                                    label="Mobile number"
                                    placeholder="e.g. 0400 000 000"
                                    name="mobile"
                                    rules={{
                                        required: {
                                            value: true,
                                            message: 'Please enter your mobile number.',
                                        },
                                        pattern: {
                                            value: /^(\+61\s?|0)4\d{2}\s?\d{3}\s?\d{3}$/,
                                            message: 'Please enter a valid Australian mobile number, e.g. 0400 000 000.',
                                        },
                                    }}
                                />
                            </div>
                            <div className="mt-4 flex flex-row justify-between gap-4">
                                <TextField
                                    className="flex-grow"
                                    type="email"
                                    label="Email address"
                                    placeholder="e.g. abc@gmail.com"
                                    name="email"
                                    rules={{
                                        required: {
                                            value: true,
                                            message: 'Please enter your email.',
                                        },
                                        pattern: {
                                            // eslint-disable-next-line no-control-regex
                                            value: /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
                                            message: 'Please enter a valid email address, e.g. abc@gmail.com',
                                        },
                                    }}
                                />
                            </div>
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
                        Complete order
                    </ActionButton>
                </div>
            </div>
        </>
    );
}
