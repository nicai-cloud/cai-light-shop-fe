import { useContext, useEffect, useState } from 'react';
import { CartContext, CartItem} from '../context/CartContext';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { getPreselectionByName } from '../services/preselection';
import Spinner from '../components/loading/spinner';
import { GET_ALL_IMAGE_URLS, GET_BAG, GET_PRESELECTION_ITEMS, GET_PRESELECTION, PRESELECTIONS_PAGE, GET_INVENTORIES } from '../utils/constants';
import { useMainContext } from './context';
import { getNumberEnv } from '../utils/load-env';
import Carousel from '../components/carousel';
import { getAllImageUrls } from '../services/image';
import { getItemsByIds } from '../services/item';
import { getBag } from '../services/bag';
import { getInventories } from '../services/inventory';
import { preloadImage } from '../services/preload_image';
import { NavArrowLeft, ShareIos } from "iconoir-react";
import Dropdown, { DropdownOption } from '../components/input/dropdown';
import { getPreselectionStockStatus } from '../services/stock_status';

export default function Preselection() {
    const DEFAULT_QUANTITY_DROPDOWN_OPTION = {id: 1, name: "1"};

    const mainContext = useMainContext();
    const { addItem } = useContext(CartContext);
    const [preselectionImageUrls, setPreselectionImageUrls] = useState<string[]>([]);
    const [selectedDropdown, setSelectedDropdown] = useState<DropdownOption>(DEFAULT_QUANTITY_DROPDOWN_OPTION);
    const [presesionStockStatus, setPresesionStockStatus] = useState<string | null>(null);

    const { name } = useParams<{ name: string }>(); // Extract preselection name from the URL

    const {isLoading: isImagesLoading, data: images} = useSWR(GET_ALL_IMAGE_URLS, getAllImageUrls, {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const {isLoading: isPreselectionLoading, data: preselection} = useSWR([GET_PRESELECTION, name!], () => getPreselectionByName(name!), {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const shouldFetchBagAndItems = !!preselection;

    const {isLoading: isBagLoading, data: preselectionBag} = useSWR(shouldFetchBagAndItems ? [GET_BAG, preselection!.bagId] : null, () => getBag(preselection!.bagId), {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const {isLoading: isItemsLoading, data: preselectionItems} = useSWR(shouldFetchBagAndItems ? [GET_PRESELECTION_ITEMS, preselection!.itemIds] : null, () => getItemsByIds(preselection!.itemIds), {
        // revalidateIfStale: false, // Prevent re-fetching when cache is stale
        dedupingInterval: getNumberEnv(import.meta.env.VITE_DEDUPING_INTERVAL_MILLISECONDS)
    });

    const {isLoading: isInventoriesLoading, data: inventories} = useSWR(GET_INVENTORIES, getInventories);

    const QUANTITY_CHOICES = Array.from({ length: 9 }, (_, i) => ({
        id: i + 1,
        name: (i + 1).toString(),
    }));

    const handleDropdownChange = (value: DropdownOption) => {
        setSelectedDropdown(value);
    };

    useEffect(() => {
        if (preselection && preselectionBag && preselectionItems) {
            const preselectionImageUrl = preselection.imageUrl;
            const bagImageUrl = preselectionBag.imageUrl;
            const itemsImageUrls = preselectionItems.map(item => item.imageUrl);
            const combinedImageUrls = [preselectionImageUrl, bagImageUrl, ...itemsImageUrls];
            setPreselectionImageUrls(combinedImageUrls);
        }
    }, [preselection, preselectionBag, preselectionItems]);

    useEffect(() => {
        if (inventories && preselection) {
            setPresesionStockStatus(getPreselectionStockStatus(inventories, preselection));
        }
    }, [inventories, preselection]);

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
        isPreselectionLoading || !preselection ||
        isBagLoading || !preselectionBag ||
        isItemsLoading || !preselectionItems ||
        isInventoriesLoading || !inventories ||
        !preselectionImageUrls
    ) {
        return (
            <div className="w-full flex items-center justify-center">
                <Spinner size="h-20 w-20" />
            </div>
        )
    }

    const handleAddToCart = () => {
        const cartItem: CartItem = {
            itemId: 'preselection' + preselection.id,
            imageUrl: preselection.imageUrl,
            name: preselection.name,
            price: preselection.price,
            quantity: selectedDropdown.id,
            selection: {
                preselectionId: preselection.id
            }
        }
        addItem(cartItem);

        setSelectedDropdown(DEFAULT_QUANTITY_DROPDOWN_OPTION);
        mainContext.handleAddToCart(PRESELECTIONS_PAGE);
    };

    return (
        <div className="w-full px-4">
            <div className="w-full flex flex-col">
                <div className="w-full flex flex-row justify-between pt-2">
                    <NavArrowLeft onClick={() => mainContext.navigateTo(PRESELECTIONS_PAGE)}/>
                    <ShareIos onClick={handleShare}/>
                </div>
                <div className="px-2 my-4 flex flex-col">
                    <p className="font-bold text-xl mb-10">{preselection.name}</p>
                    <Carousel images={preselectionImageUrls} stockStatus={presesionStockStatus} />
                </div>
                <div className="px-2 mt-4">
                    <p className="font-bold text-2xl mt-4">${preselection.price.toFixed(2)}</p>
                    <br />
                    <p className="font-bold">DESCRIPTION</p>
                    <div className="ml-4">
                        <p>This preselection gift bag contains the following:</p>
                        <ul className="list-none">
                            <li className="relative pl-4">
                                <span className="absolute left-0">-</span>{preselectionBag.description} x 1
                            </li>
                            {preselectionItems.map(item => (
                                <li key={item.id} className="relative pl-4">
                                    <div className="flex flex-col">
                                        <span className="absolute left-0">-</span>{item.description} x 1
                                    </div>
                                </li>
                            ))}
                        </ul>
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
                    disabled={presesionStockStatus === "OutOfStock"}
                />
            </div>
            <div className="mt-10 w-full flex flex-row items-center justify-center">
                <button
                    onClick={handleAddToCart}
                    className={`mt-2 bg-[#1bafe7] text-white px-8 py-2 rounded ${presesionStockStatus === "OutOfStock" ? "bg-gray-400 cursor-not-allowed" : "bg-[#1bafe7]"}`}
                    disabled={presesionStockStatus === "OutOfStock"}
                >
                    Add to cart
                </button>
            </div>
        </div>
    );
}
