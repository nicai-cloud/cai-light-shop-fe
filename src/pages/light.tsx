import { useContext, useEffect, useState } from 'react';
import { CartContext, CartItem} from '../context/CartContext';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { getLightAndVariantsByInternalName, EnhancedLightVariantType } from '../services/light';
import Spinner from '../components/loading/spinner';
import { GET_LIGHT_IMAGE_URLS, GET_LIGHT_AND_VARIANTS_BY_NAME, LIGHTS_PAGE, MAXIMUM_SELECTION_QUANTITY, LOW_STOCK_QUANTITY } from '../utils/constants';
import { getNumberEnv } from '../utils/load-env';
import Carousel from '../components/carousel';
import { getLightImageUrlsByInternalName } from '../services/image';
import { preloadImage } from '../services/preload-image';
import { NavArrowLeft, ShareIos } from "iconoir-react";
import Dropdown, { DropdownOption } from '../components/input/dropdown';
import { AddToCartModal } from './add-to-cart-modal';
import Decimal from 'decimal.js';

export default function Light() {
    const DEFAULT_QUANTITY_DROPDOWN_OPTION = {id: 1, name: "1"};
    // const LIGHT_DIMENSION_TYPE_NO_DIMENSION = "no-dimension"; -- this is not being used, only for explanation
    const LIGHT_DIMENSION_TYPE_LENGTH_WIDTH = "length-width";
    const LIGHT_DIMENSION_TYPE_LENGTH_HEIGHT = "length-height";
    const LIGHT_DIMENSION_TYPE_LENGTH_ONLY = "length-only";

    const navigate = useNavigate();
    const { addItem } = useContext(CartContext);
    const [selectedDropdown, setSelectedDropdown] = useState<DropdownOption>(DEFAULT_QUANTITY_DROPDOWN_OPTION);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedDimensionId, setSelectedDimensionId] = useState<string | null>(null);
    const [selectedLightVariant, setSelectedLightVariant] = useState<EnhancedLightVariantType | null>(null);
    const [carouselImageIndex, setCarouselImageIndex] = useState<number>(0);
    const [addToCartModalOpen, setAddToCartModalOpen] = useState<boolean>(false);

    const { internal_name } = useParams<{ internal_name: string }>(); // Extract internal name from the URL

    const {isLoading: isImagesLoading, data: images} = useSWR([GET_LIGHT_IMAGE_URLS, internal_name!], () => getLightImageUrlsByInternalName(internal_name!), {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const {isLoading: isLightAndVariantsLoading, data: lightAndVariants} = useSWR([GET_LIGHT_AND_VARIANTS_BY_NAME, internal_name!], () => getLightAndVariantsByInternalName(internal_name!), {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const QUANTITY_CHOICES = Array.from({ length: MAXIMUM_SELECTION_QUANTITY }, (_, i) => ({
        id: i + 1,
        name: (i + 1).toString(),
    }));

    const handleDropdownChange = (value: DropdownOption) => {
        setSelectedDropdown(value);
    };

    useEffect(() => {
        if (lightAndVariants) {
            setSelectedLightVariant(lightAndVariants.defaultLightVariant);
            setSelectedColor(lightAndVariants.defaultLightVariant.color);
            setSelectedDimensionId(lightAndVariants.defaultLightVariant.dimensionId);
        }
    }, [lightAndVariants]);

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
        isLightAndVariantsLoading || !lightAndVariants ||
        !selectedLightVariant
    ) {
        return (
            <div className="w-full flex items-center justify-center">
                <Spinner size="h-20 w-20" />
            </div>
        )
    }

    const handleAddToCart = () => {
        const cartItem: CartItem = {
            itemId: 'light' + selectedLightVariant.id,
            imageUrl: selectedLightVariant.imageUrl,
            name: lightAndVariants.lightDisplayName,
            dimensionStr: selectedLightVariant.dimensionStr,
            price: new Decimal(selectedLightVariant.price),
            quantity: selectedDropdown.id,
            selection: {
                lightVariantId: selectedLightVariant.id
            }
        }
        addItem(cartItem);

        setSelectedDropdown(DEFAULT_QUANTITY_DROPDOWN_OPTION);
        setAddToCartModalOpen(true);
    };

    const handleSelectColor = (color: string) => {
        setCarouselImageIndex(lightAndVariants.colorsMapping![color]);
        setSelectedColor(color);
        setSelectedLightVariant(lightAndVariants.colorDimensionToLightVariantMapping[`${color}${selectedDimensionId}`]);
    }

    const handleSelectDimension = (dimensionId: string) => {
        setSelectedDimensionId(dimensionId);
        setSelectedLightVariant(lightAndVariants.colorDimensionToLightVariantMapping[`${selectedColor}${dimensionId}`]);
    }

    return (
        <div className="w-full px-4">
            {addToCartModalOpen === true && (
                <AddToCartModal onClose={() => {
                    setAddToCartModalOpen(false);
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                    });
                }}/>
            )}
            <div className="w-full flex flex-col">
                <div className="w-full flex flex-row justify-between pt-2">
                    <NavArrowLeft onClick={() => navigate(LIGHTS_PAGE)}/>
                    <ShareIos onClick={handleShare}/>
                </div>
                <div className="px-2 my-4 flex flex-col">
                    <Carousel
                        images={images}
                        videoUrl={lightAndVariants.lightVideoUrl}
                        imageIndex={carouselImageIndex}
                        onIndexChange={setCarouselImageIndex}
                    />
                </div>
                <div className="px-2 mt-4">
                    <p className="mt-4 text-xl">{lightAndVariants.lightDisplayName} light</p>
                    <p className="mt-4">
                        <span className="text-xl">
                            ${new Decimal(selectedLightVariant.price).toFixed(2)} 
                        </span>{" "}
                        each
                    </p>
                    <p className="mt-4">Color:</p>
                    {/* Single color */}
                    {Object.keys(lightAndVariants.colorsMapping).length === 1 && (
                        <div className={'flex justify-start mt-4'}>
                            <div className={'border-2 border-pink-300 text-black text-center px-4 py-2 rounded'}>
                                {Object.keys(lightAndVariants.colorsMapping)[0]}
                            </div>
                        </div>
                    )}
                    {/* Multiple colors */}
                    {Object.keys(lightAndVariants.colorsMapping).length > 1 && (
                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-6 sm:gap-6">
                            {Object.keys(lightAndVariants.colorsMapping).map((color) => (
                                <div key={color} className={`border-2 ${selectedColor! === color ? 'border-pink-300' : 'border-gray-100'} text-black text-center px-1 py-2 rounded`} onClick={() => handleSelectColor(color)}>
                                    {color}
                                </div>
                            ))}
                        </div>
                    )}
                    {/* length only lights */}
                    {lightAndVariants.lightDimensionTypeStr === LIGHT_DIMENSION_TYPE_LENGTH_ONLY && (
                        <div>
                            <p className="mt-4">Length:</p>
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-6 sm:gap-6">
                                {Object.entries(lightAndVariants.dimensionsMapping).map(([dimensionId, dimensionStr]) => (
                                    <div key={dimensionId} className={`w-[120px] border-2 ${selectedDimensionId! === dimensionId ? 'border-pink-300' : 'border-gray-100'} text-black text-center px-1 py-2 rounded`} onClick={() => handleSelectDimension(dimensionId)}>
                                        {dimensionStr}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* length-width lights */}
                    {lightAndVariants.lightDimensionTypeStr === LIGHT_DIMENSION_TYPE_LENGTH_WIDTH && (
                        <div>
                            <p className="mt-4">Dimension:</p>
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-6 sm:gap-6">
                                {Object.entries(lightAndVariants.dimensionsMapping).map(([dimensionId, dimensionStr]) => (
                                    <div key={dimensionId} className={`w-[120px] border-2 ${selectedDimensionId! === dimensionId ? 'border-pink-300' : 'border-gray-100'} text-black text-center px-1 py-2 rounded`} onClick={() => handleSelectDimension(dimensionId)}>
                                        {dimensionStr}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* length-height lights */}
                    {lightAndVariants.lightDimensionTypeStr === LIGHT_DIMENSION_TYPE_LENGTH_HEIGHT && (
                        <div>
                            <p className="mt-4">Dimension:</p>
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-6 sm:gap-6">
                                {Object.entries(lightAndVariants.dimensionsMapping).map(([dimensionId, dimensionStr]) => (
                                    <div key={dimensionId} className={`w-[120px] border-2 ${selectedDimensionId! === dimensionId ? 'border-pink-300' : 'border-gray-100'} text-black text-center px-1 py-2 rounded`} onClick={() => handleSelectDimension(dimensionId)}>
                                        {dimensionStr}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <p className="mt-4">Quantity:</p>
                    <div className="flex flex-row mt-4 items-center">
                        <Dropdown
                            options={QUANTITY_CHOICES}
                            value={selectedDropdown}
                            onChange={handleDropdownChange}
                            className="w-28"
                        />
                        <p>
                            <span className={selectedLightVariant.stock <= LOW_STOCK_QUANTITY ? "text-red-500" : "text-black"}>
                                {selectedLightVariant.stock}
                            </span>{" "}
                            left
                        </p>
                    </div>
                    <div>
                        <p className="font-bold mt-4">DESCRIPTION</p>
                        <ul className="ml-4 list-disc">
                            {selectedLightVariant.descriptions.map((description, index) => (
                                <li key={index} className='ml-4'>{description}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="mt-4 w-full flex flex-row items-center justify-center">
                <button
                    onClick={handleAddToCart}
                    className={`mt-2 text-white px-8 py-2 rounded ${selectedLightVariant.stock < selectedDropdown.id ? "bg-gray-300 cursor-not-allowed" : "bg-pink-300 cursor-pointer"}`}
                    disabled={selectedLightVariant.stock < selectedDropdown.id}
                >
                    ADD TO CART
                </button>
            </div>
        </div>
    );
}
