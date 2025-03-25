import { useEffect, useState } from "react";
import Modal from "../components/modal";
import { getNumberEnv } from "../utils/load-env";

type AddToCartModalProps = {
    onClose: () => void;
};

export const AddToCartModal = ({
    onClose,
}: AddToCartModalProps) => {
    const [isOpen, setIsOpen] = useState(true);

    const autoCloseTimeout = getNumberEnv(import.meta.env.VITE_ADD_TO_CART_MODAL_AUTO_CLOSE_MILLISECONDS);

    useEffect(() => {
        let timer: number;
        if (isOpen) {
            timer = window.setTimeout(() => {
                setIsOpen(false);
                onClose();
            }, autoCloseTimeout);
        }
        return () => window.clearTimeout(timer);
    }, [isOpen]);

    return (
      <div>
        <Modal open={isOpen} onClose={onClose} className="sm:w-[28.4375rem]" modalPositionClassName="inset-0 items-center justify-center">
            <Modal.Body>
                <h1 className="text-center">Item successfully added to the shopping cart!</h1>
            </Modal.Body>
        </Modal>
      </div>
    );
  };
