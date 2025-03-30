import { NavArrowLeft, NavArrowRight } from "iconoir-react";
import React from "react";
import { useSwipeable } from "react-swipeable";

type CarouselProps = {
    images: string[];
    imageIndex: number;
    stockStatus: string | null;
    onIndexChange: (index: number) => void;
};

const Carousel: React.FC<CarouselProps> = ({ images, imageIndex, stockStatus, onIndexChange }) => {
    const handlePrevious = () => {
        onIndexChange(imageIndex === 0 ? images.length - 1 : imageIndex - 1);
    };

    const handleNext = () => {
        onIndexChange(imageIndex === images.length - 1 ? 0 : imageIndex + 1);
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: handleNext,
        onSwipedRight: handlePrevious
    });

    return (
        <div className="flex flex-col">
            <div className="relative w-full max-w-xl mx-auto">
                {/* Image */}
                <div className="overflow-hidden rounded-lg shadow-md">
                    <div
                        {...swipeHandlers}
                        className="overflow-hidden rounded-lg shadow-md flex items-center justify-center"
                    >
                        <img
                            src={images[imageIndex]}
                            alt={`Slide ${imageIndex}`}
                            className="w-[320px] h-[320px]"
                        />
                        {stockStatus && (
                            <span className="absolute top-0 left-0 bg-black text-white rounded-md text-xs px-1 py-1">
                                {stockStatus === "LowInStock" ? "Low in stock" : "Out of stock"}
                            </span>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <button
                    onClick={handlePrevious}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 opacity-50 bg-gray-500 text-white px-2 py-2 rounded-full shadow hover:bg-gray-800"
                >
                    <NavArrowLeft />
                </button>
                <button
                    onClick={handleNext}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 opacity-50 bg-gray-500 text-white px-2 py-2 rounded-full shadow hover:bg-gray-800"
                >
                    <NavArrowRight />
                </button>
            </div>
            <div>
                {/* Indicators */}
                <div className="flex justify-center mt-4 space-x-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => onIndexChange(index)}
                            className={`w-3 h-3 rounded-full ${
                            index === imageIndex
                                ? "bg-gray-700"
                                : "bg-gray-300 hover:bg-gray-500"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Carousel;
