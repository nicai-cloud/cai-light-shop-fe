import { Field, Input, InputProps, Label } from '@headlessui/react';
import tailwindMerge from '../../utils/tailwind-merge';
import React from 'react';
import { FieldPath, FieldValues, useController, UseControllerProps } from 'react-hook-form';

export type TextFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
    label: string;
    className?: React.HTMLAttributes<'input'>['className'];

} & UseControllerProps<TFieldValues, TName> & Omit<InputProps, 'className' | 'label'>;

export default function TextField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(props: TextFieldProps<TFieldValues, TName>) {
    // eslint-disable-next-line prefer-const
    let { placeholder, ...otherProps } = props;

    const {
        className,
        label,
        name,
        rules,
        shouldUnregister,
        defaultValue,
        control,
        disabled,
        ...remaining
    } = otherProps;

    const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control, disabled });

    if (placeholder === undefined) {
    // We need a placeholder to make sure that the floating label works with the CSS selectors.
        placeholder = ' ';
    }

    return (
        <Field
            className={tailwindMerge(
                'relative',
                className,
            )}
        >
            <Input
                placeholder={placeholder}
                className={tailwindMerge(
                    'peer w-full',
                    'px-[0.875rem] pt-6 pb-2 rounded-xl',
                    'bg-white border-2 border-grey-2 transition-colors duration-150 ease-in-out',
                    'placeholder-transparent [&::placeholder]:transition-all [&::placeholder]:duration-150 [&::placeholder]:ease-in-out',
                    'text-p text-dark-strong focus:outline-none caret-primary',
                    'focus:border-primary-pressed focus:placeholder-dark-soft',
                    fieldState.error && 'border-error focus:border-error',
                )}
                {...remaining}
                {...field}
            />
            <Label
                className={tailwindMerge(
                    'transition-all duration-150 ease-in-out absolute left-4 top-[1.125rem] -translate-y-[0.625rem] text-caption text-dark-medium',
                    'peer-focus:-translate-y-[0.625rem] peer-focus:text-caption',
                    'peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-p',
                )}
            >
                {label}
            </Label>
            {fieldState.error?.message && (
                <p className="pl-4 pt-[0.125rem] text-caption text-error text-left">
                    {fieldState.error.message}
                </p>
            )}

        </Field>
    );
}
