import React from 'react';

interface CaptureCanvasProps {
    className?: string;
}

const CaptureCanvas: React.FC<CaptureCanvasProps> = ({ className = '' }) => {
    return (
        <div className={`bg-gray-100 border border-gray-300 rounded-lg ${className}`}>
            <canvas className="w-full h-full">
                <p className="text-gray-500">Capture Canvas Component</p>
            </canvas>
        </div>
    );
};

export default CaptureCanvas;
