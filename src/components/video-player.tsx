import React, { useRef, useState } from 'react';

interface VideoPlayerProps {
    videoSrc: string;
    onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoSrc, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

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
        <div className="fixed inset-0 bg-black bg-opacity-75 z-40">
            <div onClick={onClose} className="absolute inset-0 flex justify-center items-center z-50">
                <video 
                    ref={videoRef}
                    src={videoSrc}
                    playsInline
                    preload="auto"
                    autoPlay
                    controls
                    className="w-full max-w-[800px] h-auto z-60"
                    onClick={togglePlay}
                />
            </div>
        </div>
    );
};

export default VideoPlayer;
