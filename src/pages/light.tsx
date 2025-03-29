import { useContext, useEffect, useState } from 'react';
import { CartContext, CartItem} from '../context/CartContext';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { getLightVariantsByName } from '../services/light';
import Spinner from '../components/loading/spinner';
import { GET_LIGHT_IMAGE_URLS, GET_LIGHT_VARIANTS_BY_NAME, LIGHTS_PAGE } from '../utils/constants';
import { useMainContext } from './context';
import { getNumberEnv } from '../utils/load-env';
import Carousel from '../components/carousel';
import { getLightImageUrls } from '../services/image';
import { preloadImage } from '../services/preload_image';
import { NavArrowLeft, ShareIos } from "iconoir-react";
import Dropdown, { DropdownOption } from '../components/input/dropdown';

export default function Light() {
    const DEFAULT_QUANTITY_DROPDOWN_OPTION = {id: 1, name: "1"};

    const mainContext = useMainContext();
    const { addItem } = useContext(CartContext);
    const [lightImageUrls, setLightImageUrls] = useState<string[]>([]);
    const [selectedDropdown, setSelectedDropdown] = useState<DropdownOption>(DEFAULT_QUANTITY_DROPDOWN_OPTION);

    const { name } = useParams<{ name: string }>(); // Extract light name from the URL

    const {isLoading: isImagesLoading, data: images} = useSWR(GET_LIGHT_IMAGE_URLS, getLightImageUrls, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const {isLoading: isLightVariantsLoading, data: lightVariants} = useSWR([GET_LIGHT_VARIANTS_BY_NAME, name!], () => getLightVariantsByName(name!), {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const QUANTITY_CHOICES = Array.from({ length: 9 }, (_, i) => ({
        id: i + 1,
        name: (i + 1).toString(),
    }));

    const handleDropdownChange = (value: DropdownOption) => {
        setSelectedDropdown(value);
    };

    useEffect(() => {
        if (light) {
            const lightImageUrl = light.imageUrl;
            const combinedImageUrls = [lightImageUrl];
            setLightImageUrls(combinedImageUrls);
        }
    }, [light]);

    useEffect(() => {
        if (images) {
            images.forEach(preloadImage);
        }
    }, [images]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({url: window.location.href});
            } catch (error) {
                console.error('Error sharing content:', error);
            }
        } else {
            alert('Web Share API is not supported in your browser.');
        }
    };

    if (isImagesLoading || !images ||
        isLightVariantsLoading || !lightVariants ||
        !lightImageUrls
    ) {
        return (
            <div className="w-full flex items-center justify-center">
                <Spinner size="h-20 w-20" />
            </div>
        )
    }

    const handleAddToCart = () => {
        const cartItem: CartItem = {
            itemId: 'light' + light.id,
            imageUrl: light.imageUrl,
            name: light.name,
            price: light.price,
            quantity: selectedDropdown.id,
            selection: {
                lightId: light.id
            }
        }
        addItem(cartItem);

        setSelectedDropdown(DEFAULT_QUANTITY_DROPDOWN_OPTION);
        mainContext.handleAddToCart(LIGHTS_PAGE);
    };

    return (
        <div className="w-full px-4">
            <div className="w-full flex flex-col">
                <div className="w-full flex flex-row justify-between pt-2">
                    <NavArrowLeft onClick={() => mainContext.navigateTo(LIGHTS_PAGE)}/>
                    <ShareIos onClick={handleShare}/>
                </div>
                <div className="px-2 my-4 flex flex-col">
                    <p className="font-bold text-xl mb-10">{light.name}</p>
                    <Carousel images={lightImageUrls} stockStatus={null} />
                </div>
                <div className="px-2 mt-4">
                    <p className="font-bold text-2xl mt-4">${light.price.toFixed(2)}</p>
                    <br />
                    <p className="font-bold">DESCRIPTION</p>
                    <div className="ml-4">
                        <p>The light's description goes here</p>
                    </div>
                </div>
            </div>
            <div className="px-2 mt-10">
                <Dropdown
                    label="Quantity"
                    options={QUANTITY_CHOICES}
                    value={selectedDropdown}
                    onChange={handleDropdownChange}
                    className="w-32"
                />
            </div>
            <div className="mt-10 w-full flex flex-row items-center justify-center">
                <button
                    onClick={handleAddToCart}
                    className={`mt-2 bg-[#1bafe7] text-white px-8 py-2 rounded "bg-[#1bafe7]"}`}
                >
                    Add to cart
                </button>
            </div>
        </div>
    );
}
