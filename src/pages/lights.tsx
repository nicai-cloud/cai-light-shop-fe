import { useEffect } from 'react';
import useSWR from 'swr';
import { getAllLightsImageUrls } from '../services/image';
import { getLights } from '../services/light';
import Spinner from '../components/loading/spinner';
import { GET_ALL_LIGHTS_IMAGE_URLS, GET_FULFILLMENT_METHOD_INFO, GET_LIGHTS, LIGHT_PAGE } from '../utils/constants';
import { getNumberEnv } from '../utils/load-env';
import { preloadImage } from '../services/preload-image';
import { getFulfillmentMethodInfo } from '../services/fulfillment-method';
import { useNavigate } from 'react-router-dom';

export default function Lights() {
    const navigate = useNavigate();

    const {isLoading: isAllLightsImagesLoading, data: allLightsImages} = useSWR(GET_ALL_LIGHTS_IMAGE_URLS, getAllLightsImageUrls, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const {isLoading, data: lights} = useSWR(GET_LIGHTS, getLights, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const {isLoading: isfulfillmentMethodInfoLoading, data: fulfillmentMethodInfo} = useSWR(GET_FULFILLMENT_METHOD_INFO, getFulfillmentMethodInfo, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    useEffect(() => {
        if (allLightsImages) {
            allLightsImages.forEach(preloadImage);
        }
    }, [allLightsImages]);

    if (isAllLightsImagesLoading || !allLightsImages ||
        isLoading || !lights ||
        isfulfillmentMethodInfoLoading || !fulfillmentMethodInfo
    ) {
        return (
            <div className="w-full flex items-center justify-center">
                <Spinner size="h-20 w-20" />
            </div>
        )
    }

    const handleClick = (internalName: string) => {
        navigate(`${LIGHT_PAGE}/${internalName}`);
    }

    return (
        <div className="w-full">
            <div className="w-full h-10 bg-gray-600 text-white text-lg flex items-center justify-center">
                ${fulfillmentMethodInfo.fulfillmentMethods[1].fee.toFixed(2)} Flat Rate Shipping
            </div>
            <div className="w-full h-16 bg-pink-300 flex items-center justify-center">
                <p className="text-white text-center">
                    POWER LIGHTS
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 mx-4 sm:mx-4 gap-4 sm:gap-4 justify-items-center">
                {lights.filter(light => light.powerType === "power").map((light) => (
                    <div key={light.id} className="relative flex flex-col items-center cursor-pointer mt-4" onClick={() => handleClick(light.internalName)}>
                        <img
                            src={light.imageUrl}
                            alt={light.displayName}
                            className="h-[160px] w-[160px]"
                        />
                        <p>{light.displayName}</p>
                        <p>{light.priceTag}</p>
                    </div>
                ))}
            </div>
            <br />
            <div className="w-full h-16 bg-pink-300 flex items-center justify-center">
                <p className="text-white text-center">
                    SOLAR LIGHTS
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 mx-4 sm:mx-4 gap-4 sm:gap-4 justify-items-center">
                {lights.filter(light => light.powerType === "solar").map((light) => (
                    <div key={light.id} className="relative flex flex-col items-center cursor-pointer mt-4" onClick={() => handleClick(light.internalName)}>
                        <img
                            src={light.imageUrl}
                            alt={light.displayName}
                            className="h-[160px] w-[160px]"
                        />
                        <p>{light.displayName}</p>
                        <p>{light.priceTag}</p>
                    </div>
                ))}
            </div>
            <br />
            <div className="w-full h-16 bg-pink-300 flex items-center justify-center">
                <p className="text-white text-center">
                    BATTERY LIGHTS
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 mx-4 sm:mx-4 gap-4 sm:gap-4 justify-items-center">
                {lights.filter(light => light.powerType === "battery").map((light) => (
                    <div key={light.id} className="relative flex flex-col items-center cursor-pointer mt-4" onClick={() => handleClick(light.internalName)}>
                        <img
                            src={light.imageUrl}
                            alt={light.displayName}
                            className="h-[160px] w-[160px]"
                        />
                        <p>{light.displayName}</p>
                        <p>{light.priceTag}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
