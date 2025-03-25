import { NavArrowLeft, NavArrowRight } from "iconoir-react";
import React, { useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";

// For now, the ItemCarousel with have only 2 choices, first one being the image and second one being the video

type ItemCarouselProps = {
    imageUrl: string;
    videoUrl: string | null;
};

const ItemCarousel: React.FC<ItemCarouselProps> = ({ imageUrl, videoUrl }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? 1 : 0
        );
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 1 ? 0 : 1
        );
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: handleNext,
        onSwipedRight: handlePrevious
    });

    const togglePlay = (event: React.MouseEvent<HTMLVideoElement>) => {
        event.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="flex flex-col">
            <div className="relative w-full max-w-xl mx-auto">
                {/* Image or Video */}
                <div
                    {...swipeHandlers}
                    className="overflow-hidden rounded-lg shadow-md flex items-center justify-center h-[320px]"
                >
                    {currentIndex === 0 && (
                        <img
                            src={imageUrl}
                            alt={`Slide ${currentIndex}`}
                            className="w-[320px] h-[320px] opacity-100"
                        />
                    )}
                    {currentIndex === 1 && (
                        <video 
                            ref={videoRef}
                            src={videoUrl!}
                            playsInline
                            preload="auto"
                            autoPlay
                            controls
                            className="w-full max-w-[800px] h-auto z-60 opacity-100"
                            onClick={togglePlay}
                        />
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
            <div>
                {/* Indicators */}
                <div className="flex justify-center mt-4 space-x-2">
                    {Array.from({ length: 2 }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full ${
                            index === currentIndex
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

export default ItemCarousel;
