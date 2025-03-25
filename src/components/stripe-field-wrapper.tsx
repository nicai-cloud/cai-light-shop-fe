import tailwindMerge from '../utils/tailwind-merge';

type StripeFieldWrapperProps = {
    label: string;
    forceErrorState?: boolean;
    className?: string;
} & React.ComponentPropsWithoutRef<'label'>;

export default function StripeFieldWrapper({ label, children, className, forceErrorState, ...remaining }: React.PropsWithChildren<StripeFieldWrapperProps>) {
    return (
        <label
            className={tailwindMerge(
                'block relative placeholder-transparent px-[0.875rem] pt-6 pb-2 rounded-xl bg-white border-2 border-grey-2',
                'transition-colors duration-150 ease-in-out',
                'has-[.StripeElement--focus]:border-primary-pressed has-[.StripeElement--focus]:placeholder-dark-soft',
                'has-[.StripeElement--invalid]:border-error',
                forceErrorState && 'border-error',
                className,
            )}
            {...remaining}
        >
            { children }
            <span className={tailwindMerge(
                'transition-all duration-150 ease-in-out absolute left-[0.825rem] top-[1rem] -translate-y-[0.625rem] text-caption text-dark-medium',
                'peer-[.StripeElement--focus]:-translate-y-[0.625rem] peer-[.StripeElement--focus]:text-caption',
                'peer-[.StripeElement--empty]:translate-y-0 peer-[.StripeElement--empty]:text-p',
            )}
            >
                {label}
            </span>
        </label>
    );
}
