import { useCallback, useContext, useState, useEffect } from 'react';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import ErrorPanel from '../components/error-panel';
import TextField from '../components/input/text-field';
import AsyncAutocomplete from '../components/input/async-autocomplete';
import { CustomerDetailsForm } from './types';
import { useMainContext } from './context';
import { CartContext } from '../context/CartContext';
import ActionButton from '../components/button/action-button';
import { HOME_PAGE, PAYMENT_PAGE } from '../utils/constants';
import Decimal from 'decimal.js';
import { ConfirmCartItemDeletionModal } from "./confirm-cart-item-deletion-modal";
import EditQuantity from '../components/edit-quantity';

export const PICKUP = 0;
export const DELIVERY = 1;

export default function Checkout() {
    const mainContext = useMainContext();
    const cartContext = useContext(CartContext);

    const [deletedCartItemId, setDeletedCartItemId] = useState<string | null>(null);
    const [confirmCartItemDeletionModalOpen, setConfirmCartItemDeletionModalOpen] = useState<boolean>(false);
    const [pickupOrDelivery, setPickupOrDelivery] = useState<number | null>(null);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const form = useForm<CustomerDetailsForm>({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            mobile: '',
            pickupOrDelivery: null,
            address: null,
        },
    });

    const address = form.watch('address')

    useEffect(() => {
        if (pickupOrDelivery === PICKUP) {
            mainContext.setDeliveryCost(Decimal(0))
        } else {
            if (address) {
                mainContext.setDeliveryCost(Decimal(14.95))
            } else {
                mainContext.setDeliveryCost(null)
            }
        }
    }, [pickupOrDelivery, address]);

    useEffect(() => {
        if (cartContext.cart.length === 0) {
            mainContext.navigateTo(HOME_PAGE);
        }
    }, [cartContext.cart]);

    const handlePickupOrDelivery = (value: number) => {
        setPickupOrDelivery(value);
        mainContext.setPickupOrDelivery(value);
    };

    const onSubmit = useCallback(async (data: CustomerDetailsForm) => {
        console.log(data)
        mainContext.setCustomer({
            firstName: data.firstName,
            lastName: data.lastName,
            mobile: data.mobile,
            email: data.email,
            address: data.address
        })
        mainContext.navigateTo(PAYMENT_PAGE);
    }, [mainContext, setGlobalError]);

    // Addresses
    const fetchAddresses = async (query: string) => {
        if (query.length < 3) {
            return [];
        }

        const data = await fetch(
            `${import.meta.env.VITE_LIGHT_SHOP_API}/address/auto-complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ search: query }),
            },
        );

        const result: string[] = (await data.json()).addresses;
        return result;
    };

    const countLightItems = useCallback(() => {
        return cartContext.cart.filter(cartItem => cartItem.selection.lightVariantId !== undefined).length;
    }, [cartContext])

    return (
        <>
            <div className="w-full px-4">
                {confirmCartItemDeletionModalOpen === true && (
                    <ConfirmCartItemDeletionModal
                        onClose={() => {
                            setConfirmCartItemDeletionModalOpen(false);
                        }}
                        onYes={() => {
                            cartContext.removeItem(deletedCartItemId!);
                        }}
                    />
                )}
                <h2 className="text-h5 font-bold text-dark-strong my-8 text-center">
                    Order Summary
                </h2>
                <hr className={"border-2 border-gray-300"}/>
                <div>
                    {cartContext.cart.map((cartItem, index) => {
                        return (
                            <div key={cartItem.itemId} className="mb-8">
                                <div className="my-8">
                                    <div className="flex flex-row justify-between items-center">
                                    <div className="flex flex-row items-center">
                                        <img src={cartItem.imageUrl} alt="image source" className="w-[80px] h-[80px]" />
                                        <div className="flex flex-col">
                                            <p className="ml-4">{cartItem.name}</p>
                                            <p className="ml-4">{cartItem.dimensionStr}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row">
                                        <EditQuantity
                                            cartItem={cartItem}
                                            onTrashClick={() => {
                                                setDeletedCartItemId(cartItem.itemId);
                                                setConfirmCartItemDeletionModalOpen(true);
                                            }}
                                        />
                                        <p className="ml-4 w-16 text-right">${cartItem.price.times(cartItem.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                                </div>
                                <hr className={`mt-8 ${(index === countLightItems() - 1 || index === cartContext.cart.length-1) ? "border-2 border-gray-300" : ""}`}/>
                            </div>
                        )
                    })}
                </div>
                <div className="mt-8">
                    {globalError !== null && <ErrorPanel className="mt-8" text={globalError} />}

                    <form id="customerDetailsForm" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormProvider {...form}>
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
                            <h2 className="text-h5 font-bold text-dark-strong my-4 text-center">Pick Up & Delivery Options</h2>
                            <Controller
                                name="pickupOrDelivery"
                                control={form.control}
                                rules={{ required: 'Please select a pickup or delivery option.' }}
                                render={({ field }) => (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div
                                                className={`border-2 rounded-xl p-4 text-center cursor-pointer
                                                    ${form.formState.errors.pickupOrDelivery ? 'border-red-500' : field.value === PICKUP ? 'border-pink-300 bg-pink-100' : 'border-gray-200'}
                                                `}
                                                onClick={() => {
                                                    field.onChange(PICKUP);
                                                    handlePickupOrDelivery(PICKUP);
                                                }}
                                            >
                                                Pickup
                                            </div>
                                            <div
                                                className={`border-2 rounded-xl p-4 text-center cursor-pointer
                                                    ${form.formState.errors.pickupOrDelivery ? 'border-red-500' : field.value === DELIVERY ? 'border-pink-300 bg-pink-100' : 'border-gray-200'}
                                                }`}
                                                onClick={() => {
                                                    field.onChange(DELIVERY);
                                                    handlePickupOrDelivery(DELIVERY);
                                                }}
                                            >
                                                Delivery
                                            </div>
                                        </div>
                                        {form.formState.errors.pickupOrDelivery && (
                                            <p className="pl-4 pt-[0.125rem] text-caption text-error text-left">{form.formState.errors.pickupOrDelivery.message}</p>
                                        )}
                                    </>
                                )}
                            />
                            {pickupOrDelivery === DELIVERY && (
                                <div>
                                    <h2 className="text-h5 font-bold text-dark-strong mt-8 text-center">What’s your delivery address?</h2>
                                    <p className="mt-2 text-p text-dark-medium text-center">We&apos;ll send your light order to this address.</p>
                                    <AsyncAutocomplete
                                        label="Address"
                                        className="mt-6"
                                        name="address"
                                        autoComplete="off"
                                        placeholder="Start typing your address..."
                                        fetchOptions={fetchAddresses}
                                        data-1p-ignore
                                        rules={{
                                            required: {
                                                value: true,
                                                message: 'Please enter your address.',
                                            },
                                        }}
                                    />
                                </div>
                            )}
                        </FormProvider>
                    </form>
                </div>
                <div className="mt-20 flex items-center justify-center">
                    <ActionButton
                        type="submit"
                        form="customerDetailsForm"
                        className="text-white px-8 py-2 rounded bg-pink-300"
                    >
                        Proceed to payment
                    </ActionButton>
                </div>
            </div>
        </>
    );
}
