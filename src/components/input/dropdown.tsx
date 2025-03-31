import { Field, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import tailwindMerge from '../../utils/tailwind-merge';
import Down from '../icons/16/Down';

export type DropdownOption = {
    id: number;
    name: string;
};

export type DropdownProps = {
    options: DropdownOption[];
    value: DropdownOption;
    onChange?: (value: DropdownOption) => void;
    className?: string;
};

export default function Dropdown(props: DropdownProps) {
    const { className, options, value, onChange } = props;

    // Handle change
    const handleChange = (newValue: DropdownOption) => {
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <Field className={tailwindMerge('relative', className)}>
            <Listbox as="div" value={value} onChange={handleChange}>
                <ListboxButton className={tailwindMerge(
                        'group peer w-[100px]',
                        'px-4 py-2 rounded',
                        'bg-white border-2 border-grey-2 transition-colors duration-150 ease-in-out',
                        'placeholder-transparent [&::placeholder]:transition-all [&::placeholder]:duration-150 [&::placeholder]:ease-in-out',
                        'text-p text-dark-strong text-left focus:outline-none caret-[#1bafe7]',
                        'focus:border-[#1bafe7] data-[open]:border-[#1bafe7]'
                    )}
                >
                    <div className="flex flex-row justify-between items-center">
                        <div>{value.name}</div>
                        <Down
                            className={tailwindMerge('transition duration-150 group-data-[open]:rotate-180')}
                            color="#5B5E70"
                        />
                    </div>
                </ListboxButton>
                <ListboxOptions
                    anchor="bottom"
                    modal={false}
                    transition
                    className={tailwindMerge(
                        '[--anchor-max-height:288px] [--anchor-gap:0.25rem] w-[var(--button-width)]',
                        'flex flex-col',
                        'bg-white rounded-xl border-2 border-[#1bafe7] shadow-dialogue !overflow-hidden',
                        'focus:outline-none',
                        'transition',
                        'data-[closed]:opacity-0 data-[closed]:scale-95',
                        'data-[enter]:ease-out data-[enter]:duration-100',
                        'data-[leave]:ease-in data-[leave]:duration-75',
                    )}
                >
                    <div className={tailwindMerge(
                            'h-full overflow-y-scroll',
                            'flex flex-col gap-1 p-1 items-stretch overflow-y-scroll',
                            '[scrollbar-width:thin] [scrollbar-color:#B9B9C8_#FFFFFF]',
                            '[--webkit-scrollbar-width:thin] [--webkit-scrollbar-color:#B9B9C8_#FFFFFF]',
                        )}
                    >
                        {options.map(v => (
                            <ListboxOption
                                key={v.id}
                                value={v}
                                className="group"
                            >
                                <div className={tailwindMerge(
                                        'w-full text-left rounded-lg px-4 py-[0.875rem] text-p text-dark-strong cursor-default select-none',
                                        'transition-colors duration-75 ease-in-out',
                                        'group-data-[focus]:bg-blue-100',
                                        'group-data-[selected]:text-[#1bafe7] group-data-[selected]:font-bold',
                                    )}
                                >
                                    {v.name}
                                </div>
                            </ListboxOption>
                        ))}
                    </div>
                </ListboxOptions>
            </Listbox>
        </Field>
    );
}
