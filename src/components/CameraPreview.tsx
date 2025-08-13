import React, { useRef, useEffect, useState } from 'react';

interface CameraPreviewProps {
    onStreamReady?: (stream: MediaStream) => void;
    onError?: (error: Error) => void;
    className?: string;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({
    onStreamReady,
    onError,
    className = ''
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initCamera = async () => {
            try {
                setLoading(true);
                setError(null);

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                    audio: false
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                setLoading(false);
                onStreamReady?.(stream);

            } catch (err) {
                console.warn('Camera setup failed:', err);
                const errorMsg = err instanceof Error ? err.message : 'Camera access denied';
                setError(errorMsg);
                setLoading(false);
                onError?.(err as Error);
            }
        };

        initCamera();

        // Cleanup on unmount
        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onStreamReady, onError]);

    if (error) {
        return (
            <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${className}`}>
                <p className="text-gray-600">Camera not available</p>
                <p className="text-sm text-gray-500 mt-1">{error}</p>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto rounded-lg bg-black"
            />
            {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                    <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <p>Connecting to camera...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CameraPreview;
