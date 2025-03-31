import { useContext, useEffect, useState } from 'react';
import { CartContext, CartItem} from '../context/CartContext';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { getLightVariantsByName, LightVariantType } from '../services/light';
import Spinner from '../components/loading/spinner';
import { GET_LIGHT_IMAGE_URLS, GET_LIGHT_VARIANTS_BY_NAME, LIGHTS_PAGE } from '../utils/constants';
import { useMainContext } from './context';
import { getNumberEnv } from '../utils/load-env';
import Carousel from '../components/carousel';
import { getLightImageUrls } from '../services/image';
import { preloadImage } from '../services/preload_image';
import { NavArrowLeft, ShareIos } from "iconoir-react";
import Dropdown, { DropdownOption } from '../components/input/dropdown';

type ColorType = {
    color: string,
    id: number
}

type DimensionType = {
    length: number,
    width: number | null
}

export default function Light() {
    const DEFAULT_QUANTITY_DROPDOWN_OPTION = {id: 1, name: "1"};

    const mainContext = useMainContext();
    const { addItem } = useContext(CartContext);
    const [lightImageUrls, setLightImageUrls] = useState<string[]>([]);
    const [selectedDropdown, setSelectedDropdown] = useState<DropdownOption>(DEFAULT_QUANTITY_DROPDOWN_OPTION);
    const [selectedLightVariant, setSelectedLightVariant] = useState<LightVariantType | null>(null);
    const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
    const [selectedDimensionId, setSelectedDimensionId] = useState<number | null>(null);
    const [colorsMapping, setColorsMapping] = useState<Record<number, ColorType> | null>(null);
    const [dimensionsMapping, setDimensionsMapping] = useState<Record<number, DimensionType> | null>(null);
    const [colorDimensionToLightVariant, setColorDimensionToLightVariant] = useState<Record<string, number> | null>(null);
    const [carouselImageIndex, setCarouselImageIndex] = useState<number>(0);
    const [lightVariantMapping, setLightVariantMapping] = useState<Record<number, LightVariantType> | null>(null);

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
        if (lightVariants) {
            const combinedImageUrls = new Set<string>();
            const colorIdsSet = new Set<number>();
            const dimensionIdsSet = new Set<number>();
            const tempColorsMapping: Record<number, ColorType> = {};
            const tempDimensionsMapping: Record<number, DimensionType> = {};
            const tempColorDimensionToLightVariant: Record<string, number> = {};
            const tempLightVariantMapping: Record<number, LightVariantType> = {};
            let index = 0;
            let uniqueColorIndex = 0;
            while (index < lightVariants.length) {
                const lightVariant = lightVariants[index];
                combinedImageUrls.add(lightVariant.imageUrl);

                tempLightVariantMapping[lightVariant.id] = lightVariant;

                const colorId = lightVariant.colorId;
                const color: ColorType = {"color": lightVariant.color, "id": uniqueColorIndex}
                if (!colorIdsSet.has(colorId)) {
                    colorIdsSet.add(colorId);
                    tempColorsMapping[colorId] = color;
                    uniqueColorIndex++;
                }

                const dimensionId = lightVariant.dimensionId;
                const dimension: DimensionType = {"length": lightVariant.length, "width": lightVariant.width}
                if (!dimensionIdsSet.has(lightVariant.dimensionId)) {
                    dimensionIdsSet.add(lightVariant.dimensionId);
                    tempDimensionsMapping[lightVariant.dimensionId] = dimension;
                }

                const key = `${colorId}+${dimensionId}`
                tempColorDimensionToLightVariant[key] = lightVariant.id

                if (index == 0) {
                    setSelectedLightVariant(lightVariant);
                    setSelectedColorId(lightVariant.colorId);
                    setSelectedDimensionId(lightVariant.dimensionId);
                }
                index++;
            }
            setLightImageUrls([...combinedImageUrls]);
            setColorsMapping(tempColorsMapping);
            setDimensionsMapping(tempDimensionsMapping);
            setColorDimensionToLightVariant(tempColorDimensionToLightVariant);
            setLightVariantMapping(tempLightVariantMapping);
        }
    }, [lightVariants]);

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
        !lightImageUrls ||
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
            name: selectedLightVariant.description,
            price: selectedLightVariant.price,
            quantity: selectedDropdown.id,
            selection: {
                lightVariantId: selectedLightVariant.id
            }
        }
        addItem(cartItem);

        setSelectedDropdown(DEFAULT_QUANTITY_DROPDOWN_OPTION);
        mainContext.handleAddToCart(LIGHTS_PAGE);
    };

    const handleSelectColor = (colorId: number) => {
        setCarouselImageIndex(colorsMapping![colorId].id);
        setSelectedColorId(colorId);
        const selectedLightVariantId = colorDimensionToLightVariant![`${colorId}+${selectedDimensionId}`];
        setSelectedLightVariant(lightVariantMapping![selectedLightVariantId]);
    }

    const handleSelectDimension = (dimensionId: number) => {
        setSelectedDimensionId(dimensionId);
        const selectedLightVariantId = colorDimensionToLightVariant![`${selectedColorId}+${dimensionId}`];
        setSelectedLightVariant(lightVariantMapping![selectedLightVariantId]);
    }

    return (
        <div className="w-full px-4">
            <div className="w-full flex flex-col">
                <div className="w-full flex flex-row justify-between pt-2">
                    <NavArrowLeft onClick={() => mainContext.navigateTo(LIGHTS_PAGE)}/>
                    <ShareIos onClick={handleShare}/>
                </div>
                <div className="px-2 my-4 flex flex-col">
                    {/* <p className="font-bold text-xl mb-10">{light.name}</p> */}
                    <Carousel
                        images={lightImageUrls}
                        imageIndex={carouselImageIndex}
                        stockStatus={null} 
                        onIndexChange={setCarouselImageIndex}
                    />
                </div>
                <div className="px-2 mt-4">
                    <p className="font-bold text-2xl mt-4">${selectedLightVariant.price.toFixed(2)}</p>
                    <p className="mt-4">Color:</p>
                    <div className="flex flex-row mt-4">
                        {Object.entries(colorsMapping!).map(([colorId, color]) => (
                            <div key={colorId} className={`w-[160px] border-2 ${selectedColorId! === Number(colorId) ? 'border-[#1bafe7]' : 'border-gray-100'} text-black items-center px-8 py-2 rounded mr-8`} onClick={() => handleSelectColor(Number(colorId))}>
                                {color.color}
                            </div>
                        ))}
                    </div>
                    <p className="mt-4">Length:</p>
                    <div className="flex flex-row mt-4">
                        {Object.entries(dimensionsMapping!).map(([dimensionId, dimension]) => (
                            <div key={dimension.length} className={`w-100px] border-2 ${selectedDimensionId! === Number(dimensionId) ? 'border-[#1bafe7]' : 'border-gray-100'} text-black items-center px-8 py-2 rounded mr-8`} onClick={() => handleSelectDimension(Number(dimensionId))}>
                                {dimension.length} m
                            </div>
                        ))}
                    </div>
                    <p className="mt-4">Quantity:</p>
                    <Dropdown
                        label="Quantity"
                        options={QUANTITY_CHOICES}
                        value={selectedDropdown}
                        onChange={handleDropdownChange}
                        className="w-32 mt-4"
                    />
                    <p className="font-bold mt-4">DESCRIPTION</p>
                    <div className="ml-4">
                        <p>The light's description goes here</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 w-full flex flex-row items-center justify-center">
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
