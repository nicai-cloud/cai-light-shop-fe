import { ItemDropdownOption } from "../components/input/item_dropdown";
import ItemCarousel from "../components/item-carousel";
import Modal from "../components/modal";

type ConfirmCartItemDeletionModalProps = {
    onClose: () => void;
    itemDropdown: ItemDropdownOption;
};

export const ItemDetailsModal = ({
    onClose,
    itemDropdown
}: ConfirmCartItemDeletionModalProps) => {
    return (
      <div>
        <Modal open={true} onClose={onClose} className="w-full max-w-[800px]" modalPositionClassName="inset-0 items-center justify-center">
            <Modal.Body>
                <div className="flex flex-col justify-center items-center">
                    <ItemCarousel imageUrl={itemDropdown.item.imageUrl} videoUrl={itemDropdown.item.videoUrl}/>
                    <div className="mt-8 flex flex-col">
                        <div className="flex flex-row">
                            <p>{itemDropdown.item.name}</p>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
      </div>
    );
  };
