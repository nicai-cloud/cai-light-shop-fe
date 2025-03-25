import Modal from "../components/modal";

type ConfirmCartItemDeletionModalProps = {
    onClose: () => void;
    onYes: () => void;
};

export const ConfirmCartItemDeletionModal = ({
    onClose,
    onYes
}: ConfirmCartItemDeletionModalProps) => {

    const handleNo = () => {
        onClose();
    }

    return (
      <div>
        <Modal open={true} onClose={onClose} className="sm:w-[28.4375rem]" modalPositionClassName="inset-0 items-center justify-center">
            <Modal.Body>
                <div className="flex flex-col justify-center items-center">
                    <p>Are you sure you want to delete this bag?</p>
                    <div className="flex flex-row">
                        <button
                            className="mt-8 bg-[#1bafe7] text-white items-center px-8 py-2 rounded mr-8"
                            onClick={() => {
                                onYes();
                                onClose();
                            }}
                        >
                            Yes
                        </button>
                        <button
                            className="mt-8 bg-[#1bafe7] text-white items-center px-8 py-2 rounded"
                            onClick={handleNo}
                        >
                            No
                        </button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
      </div>
    );
  };
