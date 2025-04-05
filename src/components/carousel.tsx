import { NavArrowLeft, NavArrowRight } from "iconoir-react";
import React, { useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";

type CarouselProps = {
    images: string[];
    videoUrl: string | null;
    imageIndex: number;
    onIndexChange: (index: number) => void;
};

const Carousel: React.FC<CarouselProps> = ({ images, imageIndex, videoUrl, onIndexChange }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePrevious = () => {
        const mediaLength = images.length + (videoUrl === null ? 0 : 1);
        onIndexChange(imageIndex === 0 ? mediaLength - 1 : imageIndex - 1);
    };

    const handleNext = () => {
        const mediaLength = images.length + (videoUrl === null ? 0 : 1);
        onIndexChange(imageIndex === mediaLength - 1 ? 0 : imageIndex + 1);
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
                {/* Image */}
                <div className="overflow-hidden rounded-lg shadow-md">
                    <div
                        {...swipeHandlers}
                        className="overflow-hidden rounded-lg shadow-md flex items-center justify-center"
                    >
                        {imageIndex < images.length && (
                            <img
                                src={images[imageIndex]}
                                alt={`Image ${imageIndex}`}
                                className="w-[320px] h-[320px]"
                            />
                        )}
                        {videoUrl !== null && imageIndex == images.length && (
                            <video 
                                ref={videoRef}
                                src={videoUrl!}
                                playsInline
                                preload="auto"
                                autoPlay
                                controls
                                className="w-[320px] h-[320px] z-60 opacity-100"
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
                    {videoUrl !== null && (
                        <button
                            key={images.length}
                            onClick={() => onIndexChange(images.length)}
                            className={`w-3 h-3 rounded-full ${
                            images.length === imageIndex
                                ? "bg-gray-700"
                                : "bg-gray-300 hover:bg-gray-500"
                            }`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Carousel;
