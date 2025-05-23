import { faGift } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMainContext } from "./context";
import { HOME_PAGE } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { DELIVERY } from "./checkout";

export default function Success() {
    const navigate = useNavigate();
    const mainContext = useMainContext();

    const handleContinueShopping = () => {
        mainContext.setSuccessfulOrderNumber(null);
        navigate(HOME_PAGE);
    }

    return (
        <div className="w-full px-4 flex flex-col items-center">
            <div className="flex flex-col items-center mt-10">
                <FontAwesomeIcon icon={faGift} size="4x" />
                <p className="mt-4">Thank You for Your Purchase!</p>
                <p>Your order has been successfully placed.</p>
            </div>
            <hr className="my-10"/>
            <div>
                <h1 className="text-2xl font-bold mb-4">Order Summary</h1>
                <p><span className="font-bold">Order Number:</span> {mainContext.successfulOrderNumber}</p>
                {mainContext.pickupOrDelivery !== null && mainContext.pickupOrDelivery === DELIVERY && (
                    <p><span className="font-bold">Estimated Delivery:</span> 7-10 business days</p>
                )}
                <p className="mt-4">You will receive a confirmation email with all the details shortly.</p>
            </div>
            <hr className="my-10"/>
            <div className="flex items-center justify-center">
                <button
                    className="text-white px-8 py-2 rounded bg-pink-300"
                    onClick={handleContinueShopping}
                >
                    CONTINUE SHOPPING
                </button>
            </div>
        </div>
    );
}