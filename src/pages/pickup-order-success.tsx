import { faGift } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useState } from "react";
import { useMainContext } from "./context";
import { HOME_PAGE } from "../utils/constants";

export default function PickupOrderSuccess() {
    const mainContext = useMainContext();
    const [orderNumber, setOrderNumber] = useState<String>('');

    useEffect(() => {
        setOrderNumber(window.location.hash.slice(1));  // Exclude the #
    })

    const handleContinueShopping = useCallback(() => {
        mainContext.navigateTo(HOME_PAGE);
    }, [mainContext])

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
                <p><span className="font-bold">Order Number:</span> {orderNumber}</p>
                <p className="mt-4">You will receive a confirmation email with all the details shortly.</p>
            </div>
            <hr className="my-10"/>
            <div className="flex items-center justify-center">
                <button
                    className="text-white px-8 py-2 rounded bg-pink-300"
                    onClick={handleContinueShopping}
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
}