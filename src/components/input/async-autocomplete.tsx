import { Combobox, ComboboxButton, ComboboxInput, ComboboxInputProps, ComboboxOption, ComboboxOptions, Field, Label } from '@headlessui/react';
import tailwindMerge from '../../utils/tailwind-merge';
import { useController, UseControllerProps } from 'react-hook-form';
import { useCallback, useState } from 'react';
import Down from '../icons/16/Down';
// import LoadingSpinner from '../loading/loading-spinner';
import useSWR from 'swr';
import { useDebounce } from '@uidotdev/usehooks';

export type AsyncAutocompleteProps = {
    label: string;
    className?: React.HTMLAttributes<'input'>['className'];
    fetchOptions: (query: string) => Promise<string[]>;
} & UseControllerProps & Omit<ComboboxInputProps, 'className' | 'label'>;

export default function AsyncAutocomplete(props: AsyncAutocompleteProps) {
    // eslint-disable-next-line prefer-const
    let { placeholder, ...otherProps } = props;

    const {
        className,
        label,
        fetchOptions,
        name,
        rules,
        shouldUnregister,
        defaultValue,
        control,
        disabled,
        ...remaining
    } = otherProps;

    const cn = tailwindMerge('relative', className);

    if (placeholder === undefined) {
    // We need a placeholder to make sure that the floating label works with the CSS selectors.
        placeholder = ' ';
    }

    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);

    const fetcher = ([_, q]: [string, string]) => fetchOptions(q);

    const { isLoading, data } = useSWR([`autocomplete-${name}`, debouncedQuery], fetcher);

    const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control, disabled });

    const selectValueCallback = useCallback((v: string | null) => {
        field.onChange(v);
    }, [field]);

    return (
        <Field className={cn}>
            <Combobox value={field.value ?? ''} onChange={selectValueCallback}>
                <ComboboxInput
                    className={tailwindMerge(
                        'peer w-full',
                        'pl-[0.875rem] pr-[2.75rem] pt-6 pb-2 rounded-xl',
                        'bg-white border-2 border-grey-2 transition-colors duration-150 ease-in-out',
                        'placeholder-transparent [&::placeholder]:transition-all [&::placeholder]:duration-150 [&::placeholder]:ease-in-out',
                        'text-p text-dark-strong focus:outline-none caret-primary',
                        'focus:border-primary-pressed focus:placeholder-dark-soft',
                        fieldState.error && 'border-error focus:border-error',
                    )}
                    placeholder={placeholder}
                    /*
                // @ts-expect-error: We cannot infer the types in props. */
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    displayValue={(v) => v ?? ''}
                    onChange={(q) => { setQuery(q.target.value); }}
                    onBlur={field.onBlur}
                    name={field.name}
                    {...remaining}
                />
                <ComboboxButton className="group absolute inset-y-0 right-0 px-4">
                    <Down className="text-dark-medium transition group-data-[open]:rotate-180" />
                </ComboboxButton>
                {/* { isLoading && <LoadingSpinner className="absolute top-[1.125rem] right-[2.75rem]" />} */}
                { isLoading && <p>loading</p> }
                { data && data.length > 0
                && (
                    <ComboboxOptions
                        anchor="bottom"
                        modal={false}
                        transition
                        className={tailwindMerge(
                            '[--anchor-max-height:288px] [--anchor-gap:0.25rem] w-[var(--input-width)]',
                            'flex flex-col',
                            'bg-white rounded-xl border-2 border-primary shadow-dialogue !overflow-hidden',
                            'focus:outline-none',
                            'transition',
                            'data-[closed]:opacity-0 data-[closed]:scale-95',
                            'data-[enter]:ease-out data-[enter]:duration-100',
                            'data-[leave]:ease-in data-[leave]:duration-75',
                        )}
                    >
                        <div className={tailwindMerge(
                            'h-full overflow-y-auto',
                            'flex flex-col gap-1 p-1 items-stretch',
                            '[scrollbar-width:thin] [scrollbar-color:#B9B9C8_#FFFFFF]',
                            '[--webkit-scrollbar-width:thin] [--webkit-scrollbar-color:#B9B9C8_#FFFFFF]',
                        )}
                        >
                            {data.map((option) => {
                                return (
                                    <ComboboxOption
                                        key={option}
                                        value={option}
                                        className="group"
                                    >
                                        <div className={tailwindMerge(
                                            'w-full text-left rounded-lg px-4 py-[0.875rem] text-p text-dark-strong cursor-default select-none truncate',
                                            'transition-colors duration-75 ease-in-out',
                                            'group-data-[focus]:bg-secondary',
                                            'group-data-[selected]:text-primary group-data-[selected]:font-bold',
                                            'active:!bg-secondary-pressed',
                                        )}
                                        >
                                            {option}
                                        </div>
                                    </ComboboxOption>
                                );
                            })}
                        </div>
                    </ComboboxOptions>
                )}
            </Combobox>
            <Label
                className={tailwindMerge(
                    'transition-all duration-150 ease-in-out absolute left-4 top-[1.125rem]',
                    '-translate-y-[0.625rem]',
                    'text-caption text-dark-medium',
                    'peer-focus:-translate-y-[0.625rem] peer-focus:text-caption',
                    'peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-p',
                    'pointer-events-none',
                )}
            >
                {label}
            </Label>
            {fieldState.error && (
                <p className="pl-4 pt-[0.125rem] text-caption text-error text-start">
                    {fieldState.error.message}
                </p>
            )}
        </Field>
    );
}
