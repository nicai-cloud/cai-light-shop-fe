import { useMainContext } from './context';
import { useEffect } from 'react';
import useSWR from 'swr';
import { getPreselectionImageUrls } from '../services/image';
import { getPreselections } from '../services/preselection';
import { getInventories } from '../services/inventory';
import Spinner from '../components/loading/spinner';
import { GET_PRESELECTION_IMAGE_URLS, GET_PRESELECTIONS, PRESELECTION_PAGE, GET_INVENTORIES } from '../utils/constants';
import { getNumberEnv } from '../utils/load-env';
import { getPreselectionStockStatus } from '../services/stock_status';
import { preloadImage } from '../services/preload_image';

export default function Preselections() {
    const mainContext = useMainContext();

    const {isLoading: isImagesLoading, data: images} = useSWR(GET_PRESELECTION_IMAGE_URLS, getPreselectionImageUrls, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const {isLoading, data: preselections} = useSWR(GET_PRESELECTIONS, getPreselections, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const {isLoading: isInventoriesLoading, data: inventories} = useSWR(GET_INVENTORIES, getInventories);

    useEffect(() => {
        if (images) {
            images.forEach(preloadImage);
        }
    }, [images]);

    if (isImagesLoading || !images ||
        isLoading || !preselections ||
        isInventoriesLoading || !inventories
    ) {
        return (
            <div className="w-full flex items-center justify-center">
                <Spinner size="h-20 w-20" />
            </div>
        )
    }

    const handleClick = (preselection_name: string) => {
        mainContext.navigateTo(`${PRESELECTION_PAGE}/${preselection_name}`);
    }

    return (
        <div className="w-full">
            <div className="w-full h-16 bg-blue-400 flex items-center justify-center">
                <p className="text-white text-center">
                    BOYS GIFTS
                </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 mx-10 sm:mx-5 gap-4 sm:gap-4 justify-items-center">
                {preselections.filter(preselection => preselection.gender === "boys").map((preselection) => (
                    <div key={preselection.id} className="relative flex flex-col items-center cursor-pointer mt-4 mr-4" onClick={() => handleClick(preselection.name)}>
                        <img
                            src={preselection.imageUrl}
                            alt={preselection.name}
                            className="h-full w-full aspect-square"
                        />
                        {(() => {
                            const stockStatus = getPreselectionStockStatus(inventories, preselection);
                            return stockStatus && (
                                <span className="absolute top-0 left-0 bg-black text-white rounded-md text-xs px-1 py-1">
                                    {stockStatus === "LowInStock" ? "Low In Stock" : "Out Of Stock"}
                                </span>
                            );
                        })()}
                        <p>{preselection.name}</p>
                        <p>${preselection.price.toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <br />
            <div className="w-full h-16 bg-pink-300 flex items-center justify-center">
                <p className="text-white text-center">
                    GIRLS GIFTS
                </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 mx-10 sm:mx-5 gap-4 sm:gap-4 justify-items-center">
                {preselections.filter(preselection => preselection.gender === "girls").map((preselection) => (
                    <div key={preselection.id} className="relative flex flex-col items-center cursor-pointer mt-4 mr-4" onClick={() => handleClick(preselection.name)}>
                        <img
                            src={preselection.imageUrl}
                            alt={preselection.name}
                            className="h-full w-full aspect-square"
                        />
                        {(() => {
                            const stockStatus = getPreselectionStockStatus(inventories, preselection);
                            return stockStatus && (
                                <span className="absolute top-0 left-0 bg-black text-white rounded-md text-xs px-1 py-1">
                                    {stockStatus === "LowInStock" ? "Low In Stock" : "Out Of Stock"}
                                </span>
                            );
                        })()}
                        <p>{preselection.name}</p>
                        <p>${preselection.price.toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
