import {
    CloseButton,
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
  } from '@headlessui/react';
  import { useCallback } from 'react';
  import ActionButton, { ButtonPropsWithChildren } from './button/action-button';
  import { Xmark } from 'iconoir-react';
  import tailwindMerge from '../utils/tailwind-merge';
  
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export type ModalHeaderProps = React.PropsWithChildren<{}>;
  
  function Header({ children }: ModalHeaderProps) {
    return <>{children}</>;
  }
  
  export type ModalBodyProps = React.PropsWithChildren<{
    title?: React.ReactNode;
  }>;
  
  function Body({ title, children }: ModalBodyProps) {
    return (
      <div className="px-4 py-6">
        {title !== undefined && (
          <DialogTitle className="text-dark-strong text-center text-h5 font-bold">
            {title}
          </DialogTitle>
        )}
        {children}
      </div>
    );
  }
  
  function Button<C extends ('button' | 'a') & React.ElementType = 'button'>(
    props: ButtonPropsWithChildren<C>
  ) {
    return (
      <div className="pt-2 px-4">
        <ActionButton className="w-full" size="medium" {...props}></ActionButton>
      </div>
    );
  }
  
  export type ModalProps = React.PropsWithChildren<{
    open: boolean;
    onClose: () => void;
    className?: string;
    modalPositionClassName?: string;
  }>;
  
  /**
   * A base implementation of a modal that includes a backdrop, an open prop and an onClose callback. It
   * also includes a close button.
   *
   * This should only be used for very specific non-reusable modal implementations. For the most part, the
   * Modal class should be used as it is based upon the modal template in Figma.
   */
  export function ModalBase({
    open,
    onClose,
    children,
    className = '',
    modalPositionClassName = ''
  }: ModalProps) {
    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);
  
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-scrim z-[60] duration-300 ease-out data-[closed]:opacity-0"
        />
        <div
          className={tailwindMerge(
            "font-mier-a antialiased fixed flex z-[60]",
            modalPositionClassName
          )}
        >
          <DialogPanel
            transition
            className={tailwindMerge(
              'relative w-screen overflow-y-auto sm:rounded-md bg-white pt-6 pb-4',
              className
            )}
          >
            {children}
            <CloseButton className="text-grey-400 text-dark-medium absolute top-4 right-4">
              <Xmark className="size-6 text-dark-soft" />
            </CloseButton>
          </DialogPanel>
        </div>
      </Dialog>
    );
  }
  
  const Modal = Object.assign(ModalBase, {
    Header,
    Body,
    Button,
  });
  
  export default Modal;