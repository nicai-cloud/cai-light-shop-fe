import { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { CartContext, CartItem} from '../context/CartContext';

export type EditQuantityProps = {
    cartItem: CartItem;
    onTrashClick: () => void;
  };

export default function EditQuantity({ cartItem, onTrashClick }: EditQuantityProps) {
    const cartContext = useContext(CartContext);

    return <div className="flex flex-row items-center">
        <FontAwesomeIcon icon={faTrash} style={{ color: 'black' }} className="mr-4" onClick={onTrashClick}/>
        <button
            className="w-[25px] h-[25px] flex items-center justify-center bg-gray-200 text-gray-700 px-1 py-1 rounded hover:bg-gray-300"
            onClick={() => cartContext.decreaseItemQuantity(cartItem.itemId)}
            disabled={cartItem.quantity <= 1}
        >
            -
        </button>
        <p className="mx-2">{cartItem.quantity}</p>
        <button
            className="w-[25px] h-[25px] flex items-center justify-center bg-gray-200 text-gray-700 px-1 py-1 rounded hover:bg-gray-300"
            onClick={() => cartContext.increaseItemQuantity(cartItem.itemId)}
            disabled={cartItem.quantity >= 9}
        >
            +
        </button>
    </div>
}
