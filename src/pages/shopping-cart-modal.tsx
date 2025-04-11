import { useEffect, useContext } from "react";
import useSWR from 'swr';
import { useNavigate } from "react-router-dom";
import { CartContext, CartItem } from "../context/CartContext";
import Modal from "../components/modal";
import EditQuantity from "../components/edit-quantity";
import { formatMoney } from "../utils/format-money";
import { GET_ALL_LIGHT_VARIANTS_IMAGE_URLS, CHECKOUT_PAGE } from "../utils/constants";
import { getNumberEnv } from '../utils/load-env';
import { getAllLightVariantsImageUrls } from "../services/image";
import { preloadImage } from '../services/preload_image';
import Spinner from '../components/loading/spinner';
import Decimal from 'decimal.js';

type ShoppingCartModalProps = {
    onClose: () => void;
    onTrashClick: () => void;
    setDeletedCartItemId: (itemId: string) => void;
};
  
export const ShoppingCartModal = ({
    onClose,
    onTrashClick,
    setDeletedCartItemId
}: ShoppingCartModalProps) => {
    const cartContext = useContext(CartContext);
    const navigate = useNavigate();

    const cart: CartItem[] = cartContext.cart;

    const calculateTotalCost = () => {
        return cart.reduce((total, {price, quantity}) => price.times(quantity).add(total), Decimal(0));
    }

    const handleCheckout = () => {
        onClose();
        navigate(CHECKOUT_PAGE);
    }

    const {isLoading: isImagesLoading, data: images} = useSWR(GET_ALL_LIGHT_VARIANTS_IMAGE_URLS, getAllLightVariantsImageUrls, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    useEffect(() => {
        if (images) {
            images.forEach(preloadImage);
        }
    }, [images]);

    if (isImagesLoading || !images)
    {
        return (
            <div className="w-full flex items-center justify-center">
                <Spinner size="h-20 w-20" />
            </div>
        )
    }
  
    return (
        <div>
            <Modal open={true} onClose={onClose} className="sm:w-[28.4375rem]" modalPositionClassName="inset-y-0 right-0 justify-end">
                <Modal.Body>
                {/* Empty cart */}
                {cart.length === 0 && (
                    <>
                        <h1 className="text-h5 text-left font-bold text-dark-strong">
                            CART
                        </h1>
                        <p>
                            Your cart is empty...
                        </p>
                    </>
                )}
                {/* Non-Empty cart */}
                {cart.length > 0 && (
                    <>
                        {cart.map((item, index) => (
                            <div key={item.itemId}>
                                <div className="flex flex-row justify-between items-center">
                                    <div className="flex flex-row items-center">
                                        <img src={item.imageUrl} alt="image source" className="w-[80px] h-[80px]" />
                                        <div className="flex flex-col">
                                            <p className="ml-4 max-w-[100px]">{item.name}</p>
                                            <p className="ml-4">{item.dimensionStr}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row">
                                        <EditQuantity
                                            cartItem={item}
                                            onTrashClick={() => {
                                                setDeletedCartItemId(item.itemId);
                                                onTrashClick();
                                            }}
                                        />
                                        <p className="ml-4 w-16 text-right">${item.price.times(item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                                <hr className={`my-4 ${index === cart.length - 1 ? "border-2 border-gray-300" : ""}`}/>
                            </div>
                        ))}
                        <div className="flex flex-row justify-between mt-4">
                            <p>Subtotal</p>
                            <p>${formatMoney(calculateTotalCost())}</p>
                        </div>
                    </>
                )}
                </Modal.Body>
                {cart.length > 0 && (
                    <div className="flex items-center justify-center">
                        <button
                            onClick={handleCheckout}
                            className={"mt-2 bg-pink-300 text-white px-8 py-2 rounded"}
                        >
                            CHECKOUT
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
  };
