import { ComponentPropsWithoutRef, useCallback } from 'react';

import RoundSpinner, { RoundSpinnerTheme } from '../loading/round-spinner';
import { Transition } from '@headlessui/react';
import { getComponentForKey, Icon16 } from '../icons/16';
import { Link } from 'react-router-dom';
import tailwindMerge from '../../utils/tailwind-merge';

type ButtonTheme = 'primary' | 'secondary' | 'tertiary' | 'destructive';
type ButtonSize = 'small' | 'medium' | 'large';

type ButtonProps<C extends React.ElementType, P = object> = P & {
  /** The underlying html component that will be used. */
  as?: C;
  /** The theme (maps to Figma). */
  theme?: ButtonTheme;
  /** The size of the button (maps to Figma). */
  size?: ButtonSize;
  /** Whether or not the button should show a loading state. */
  loading?: boolean;
  /** If provided, the icon to be displayed on the left side of the button. */
  leadingIcon?: Icon16;
} & Omit<ComponentPropsWithoutRef<C>, 'as' | 'theme' | 'size' | 'loading'>;

export type ButtonPropsWithChildren<
  C extends React.ElementType,
  P = object,
> = React.PropsWithChildren<ButtonProps<C, P>>;

/**
 * Action buttons: https://www.figma.com/design/NeWdwCXghiJNXJfDozajDm/Product-Design-System?node-id=2-55&m=dev
 *
 * This button can use an underlying button or an a component, depending on what's required. The default component is button.
 * It accepts any of the props of the underlying component, for example:
 *
 * When used as a typical submit button:
 * <ActionButton type="submit">Submit</ActionButton>
 *
 * When used as an a tag:
 * <ActionButon as="a" href="https://www.spriggy.com.au">This is an anchor tag styled as a button</a>
 *
 * It also takes theme and size props that map to the themes and sizes in Figma.
 */
export default function ActionButton<
  C extends ('button' | 'a' | typeof Link) & React.ElementType = 'button',
>(props: ButtonPropsWithChildren<C>) {
  const {
    as,
    children,
    className,
    theme = 'primary',
    size = 'medium',
    loading = false,
    onClick,
    leadingIcon,
    ...remaining
  } = props;

  const Component = as ?? 'button';

  const baseClassNames = 'relative text-p font-bold';

  let sizeClassNames: string;
  switch (size) {
    case 'small':
      sizeClassNames =
        'text-p-small px-4 pt-[0.46875rem] pb-[0.53125rem] rounded-[0.875rem]';
      break;
    case 'medium':
      sizeClassNames = 'px-5 pt-[0.96875rem] pb-[1.03125rem] rounded-2xl';
      break;
    case 'large':
      sizeClassNames = 'px-6 pt-[1.21875rem] pb-[1.28125rem] rounded-2xl';
      break;
  }

  let themeClassNames: string;
  let spinnerTheme: RoundSpinnerTheme;
  switch (theme) {
    case 'primary':
      themeClassNames =
        'bg-primary text-light-strong';
      spinnerTheme = 'white';
      break;
    case 'secondary':
      themeClassNames =
        'bg-secondary text-primary hover:bg-secondary-pressed active:bg-secondary-pressed';
      spinnerTheme = 'primary';
      break;
    case 'tertiary':
      themeClassNames =
        'bg-transparent text-primary hover:bg-secondary active:bg-secondary-pressed';
      spinnerTheme = 'primary';
      break;
    case 'destructive':
      themeClassNames =
        'bg-destructive text-light-strong hover:bg-destructive-pressed active:bg-destructive-pressed';
      spinnerTheme = 'white';
      break;
  }

  const compositeClassName = tailwindMerge(
    baseClassNames,
    themeClassNames,
    sizeClassNames,
    className
  );

  const handleClick = useCallback(() => {
    if (!loading) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      onClick?.();
    }
  }, [onClick, loading]);

  const LeadingIconComponent =
    leadingIcon === undefined ? null : getComponentForKey(leadingIcon);

  return (
    <Component
      className={compositeClassName}
      onClick={handleClick}
      {...remaining}
    >
      <div
        className={tailwindMerge(
          'flex flex-row justify-center items-center gap-[0.625rem] transition-opacity duration-150',
          loading && 'opacity-0',
          loading ? 'ease-out' : 'ease-in'
        )}
      >
        {LeadingIconComponent && <LeadingIconComponent />}
        <div className="flex-grow flex flex-row justify-center items-center">
          {children}
        </div>
      </div>
      <Transition
        as="div"
        show={loading}
        enter="transition-opacity ease-in duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-1"
        leave="transition-opacity ease-out duration-150"
        leaveFrom="opacity-1"
        leaveTo="opacity-0"
      >
        <RoundSpinner
          className="absolute top-2/4 left-2/4 -translate-x-1/2 -translate-y-1/2"
          theme={spinnerTheme}
        />
      </Transition>
    </Component>
  );
}
