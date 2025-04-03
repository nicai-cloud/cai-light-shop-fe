import { useMainContext } from './context';
import { useEffect } from 'react';
import useSWR from 'swr';
import { getLightImageUrls } from '../services/image';
import { getLights } from '../services/light';
import Spinner from '../components/loading/spinner';
import { GET_LIGHT_IMAGE_URLS, GET_LIGHTS, LIGHT_PAGE } from '../utils/constants';
import { getNumberEnv } from '../utils/load-env';
import { preloadImage } from '../services/preload_image';

export default function Lights() {
    const mainContext = useMainContext();

    const {isLoading: isImagesLoading, data: images} = useSWR(GET_LIGHT_IMAGE_URLS, getLightImageUrls, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const {isLoading, data: lights} = useSWR(GET_LIGHTS, getLights, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    useEffect(() => {
        if (images) {
            images.forEach(preloadImage);
        }
    }, [images]);

    if (isImagesLoading || !images ||
        isLoading || !lights
    ) {
        return (
            <div className="w-full flex items-center justify-center">
                <Spinner size="h-20 w-20" />
            </div>
        )
    }

    const handleClick = (internal_name: string) => {
        mainContext.navigateTo(`${LIGHT_PAGE}/${internal_name}`);
    }

    return (
        <div className="w-full">
            <div className="w-full h-16 bg-pink-300 flex items-center justify-center">
                <p className="text-white text-center">
                    POWER LIGHTS
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 mx-10 sm:mx-4 gap-4 sm:gap-4 justify-items-center">
                {lights.filter(light => light.powerType === "power").map((light) => (
                    <div key={light.id} className="relative flex flex-col items-center cursor-pointer mt-4 mr-4" onClick={() => handleClick(light.internalName)}>
                        <img
                            src={light.imageUrl}
                            alt={light.displayName}
                            className="h-[160px] w-[160px]"
                        />
                        <p>{light.displayName}</p>
                        <p>From ${light.fromPrice.toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <br />
            <div className="w-full h-16 bg-pink-300 flex items-center justify-center">
                <p className="text-white text-center">
                    SOLAR LIGHTS
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 mx-10 sm:mx-4 gap-4 sm:gap-4 justify-items-center">
                {lights.filter(light => light.powerType === "solar").map((light) => (
                    <div key={light.id} className="relative flex flex-col items-center cursor-pointer mt-4 mr-4" onClick={() => handleClick(light.internalName)}>
                        <img
                            src={light.imageUrl}
                            alt={light.displayName}
                            className="h-[160px] w-[160px]"
                        />
                        <p>{light.displayName}</p>
                        <p>From ${light.fromPrice.toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <br />
            <div className="w-full h-16 bg-pink-300 flex items-center justify-center">
                <p className="text-white text-center">
                    BATTERY LIGHTS
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 mx-10 sm:mx-4 gap-4 sm:gap-4 justify-items-center">
                {lights.filter(light => light.powerType === "battery").map((light) => (
                    <div key={light.id} className="relative flex flex-col items-center cursor-pointer mt-4 mr-4" onClick={() => handleClick(light.internalName)}>
                        <img
                            src={light.imageUrl}
                            alt={light.displayName}
                            className="h-[160px] w-[160px]"
                        />
                        <p>{light.displayName}</p>
                        <p>From ${light.fromPrice.toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
