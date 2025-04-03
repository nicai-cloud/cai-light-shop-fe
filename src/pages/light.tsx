import { useContext, useEffect, useState } from 'react';
import { CartContext, CartItem} from '../context/CartContext';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { getLightAndVariantsByInternalName, EnhancedLightVariantType } from '../services/light';
import Spinner from '../components/loading/spinner';
import { GET_LIGHT_IMAGE_URLS, GET_LIGHT_AND_VARIANTS_BY_NAME, LIGHTS_PAGE, MAXIMUM_SELECTION_QUANTITY, LOW_STOCK_QUANTITY } from '../utils/constants';
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
    length: number | null,
    width: number | null,
    height: number | null,
    weight: number | null
}

export default function Light() {
    const DEFAULT_QUANTITY_DROPDOWN_OPTION = {id: 1, name: "1"};

    const mainContext = useMainContext();
    const { addItem } = useContext(CartContext);
    const [lightDimensionType, setLightDimensionType] = useState<string | null>(null);
    const [lightImageUrls, setLightImageUrls] = useState<string[]>([]);
    const [selectedDropdown, setSelectedDropdown] = useState<DropdownOption>(DEFAULT_QUANTITY_DROPDOWN_OPTION);
    const [selectedLightVariant, setSelectedLightVariant] = useState<EnhancedLightVariantType | null>(null);
    const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
    const [selectedDimensionId, setSelectedDimensionId] = useState<number | null>(null);
    const [colorsMapping, setColorsMapping] = useState<Record<number, ColorType> | null>(null);
    const [dimensionsMapping, setDimensionsMapping] = useState<Record<number, DimensionType> | null>(null);
    const [colorDimensionToLightVariant, setColorDimensionToLightVariant] = useState<Record<string, number> | null>(null);
    const [carouselImageIndex, setCarouselImageIndex] = useState<number>(0);
    const [lightVariantMapping, setLightVariantMapping] = useState<Record<number, EnhancedLightVariantType> | null>(null);

    const { internal_name } = useParams<{ internal_name: string }>(); // Extract internal name from the URL

    const {isLoading: isImagesLoading, data: images} = useSWR(GET_LIGHT_IMAGE_URLS, getLightImageUrls, {
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
            console.log(lightAndVariants.lightInternalName, lightAndVariants.lightDisplayName, lightAndVariants.lightPowerType, lightAndVariants.lightVideoUrl, lightAndVariants.lightDimensionType);
            const lightVariants = lightAndVariants.lightVariants;
            const combinedImageUrls = new Set<string>();
            const colorIdsSet = new Set<number>();
            const dimensionIdsSet = new Set<number>();
            const tempColorsMapping: Record<number, ColorType> = {};
            const tempDimensionsMapping: Record<number, DimensionType> = {};
            const tempColorDimensionToLightVariant: Record<string, number> = {};
            const tempLightVariantMapping: Record<number, EnhancedLightVariantType> = {};
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
                const dimension: DimensionType = {
                    "length": lightVariant.length,
                    "width": lightVariant.width,
                    "height": lightVariant.height,
                    "weight": lightVariant.weight
                }
                if (!dimensionIdsSet.has(dimensionId)) {
                    dimensionIdsSet.add(dimensionId);
                    tempDimensionsMapping[dimensionId] = dimension;
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
            setLightDimensionType(lightAndVariants.lightDimensionType);
            setLightImageUrls([...combinedImageUrls]);
            setColorsMapping(tempColorsMapping);
            setDimensionsMapping(tempDimensionsMapping);
            setColorDimensionToLightVariant(tempColorDimensionToLightVariant);
            setLightVariantMapping(tempLightVariantMapping);
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
        !lightDimensionType ||
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
            name: lightAndVariants.lightDisplayName,
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
                    <p className="font-bold text-xl mb-10">{lightAndVariants.lightDisplayName}</p>
                    <Carousel
                        images={lightImageUrls}
                        videoUrl={lightAndVariants.lightVideoUrl}
                        imageIndex={carouselImageIndex}
                        onIndexChange={setCarouselImageIndex}
                    />
                </div>
                <div className="px-2 mt-4">
                    <p className="font-bold text-2xl mt-4">${selectedLightVariant.price.toFixed(2)}</p>
                    <p className="mt-4">Color:</p>
                    <div className="flex flex-row mt-4">
                        {Object.entries(colorsMapping!).map(([colorId, color]) => (
                            <div key={colorId} className={`w-[120px] border-2 ${selectedColorId! === Number(colorId) ? 'border-pink-300' : 'border-gray-100'} text-black text-center px-2 py-2 rounded mr-8`} onClick={() => handleSelectColor(Number(colorId))}>
                                {color.color}
                            </div>
                        ))}
                    </div>
                    {/* length only lights */}
                    {lightDimensionType === "length-only" && (
                        <div>
                            <p className="mt-4">Length:</p>
                            <div className="flex flex-row mt-4">
                                {Object.entries(dimensionsMapping!).map(([dimensionId, dimension]) => (
                                    <div key={dimensionId} className={`w-[120px] border-2 ${selectedDimensionId! === Number(dimensionId) ? 'border-pink-300' : 'border-gray-100'} text-black text-center px-2 py-2 rounded mr-4`} onClick={() => handleSelectDimension(Number(dimensionId))}>
                                        {dimension.length}m
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* length-width lights */}
                    {lightDimensionType === "length-width" && (
                        <div>
                            <p className="mt-4">Dimension:</p>
                            <div className="flex flex-row mt-4">
                                {Object.entries(dimensionsMapping!).map(([dimensionId, dimension]) => (
                                    <div key={dimensionId} className={`w-[120px] border-2 ${selectedDimensionId! === Number(dimensionId) ? 'border-pink-300' : 'border-gray-100'} text-black text-center px-2 py-2 rounded mr-4`} onClick={() => handleSelectDimension(Number(dimensionId))}>
                                        {dimension.length}m x {dimension.width}m
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* length-height lights */}
                    {lightDimensionType === "length-height" && (
                        <div>
                            <p className="mt-4">Dimension:</p>
                            <div className="flex flex-row mt-4">
                                {Object.entries(dimensionsMapping!).map(([dimensionId, dimension]) => (
                                    <div key={dimensionId} className={`w-[120px] border-2 ${selectedDimensionId! === Number(dimensionId) ? 'border-pink-300' : 'border-gray-100'} text-black text-center px-2 py-2 rounded mr-4`} onClick={() => handleSelectDimension(Number(dimensionId))}>
                                        {dimension.length}m x {dimension.height}m
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
                            className="w-32 mr-2"
                        />
                        <p>
                            <span className={selectedLightVariant.stock <= LOW_STOCK_QUANTITY ? "text-red-500" : "text-black"}>
                                {selectedLightVariant.stock}
                            </span>{" "}
                            left
                        </p>
                    </div>
                    <p className="font-bold mt-4">DESCRIPTION</p>
                    <div className="ml-4">
                        <p>The light's description goes here</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 w-full flex flex-row items-center justify-center">
                <button
                    onClick={handleAddToCart}
                    className={"mt-2 bg-pink-300 text-white px-8 py-2 rounded"}
                >
                    Add to cart
                </button>
            </div>
        </div>
    );
}
