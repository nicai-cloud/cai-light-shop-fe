import tailwindMerge from '../utils/tailwind-merge';

export type DividerProps = Pick<React.ComponentPropsWithoutRef<'div'>, 'className'>;

export default function Divider({ className }: DividerProps) {
    return <div className={tailwindMerge('border-b-[1px] border-grey-2 w-full', className)}></div>;
}
