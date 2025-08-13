import React, { useState, useRef, useEffect, useCallback } from 'react';
import ShapeGrid from '../components/ShapeGrid';
import { createShapeGrid, checkShapeSelection } from '../utils/verificationHelpers';

type VerificationStep = "camera" | "selection" | "results";
type ShapeType = "triangle" | "square" | "circle";
type ColorTint = "red" | "green" | "blue";

interface CaptchaVerificationProps {
    onComplete?: (success: boolean) => void;
}

interface GridSector {
    id: number;
    hasShape: boolean;
    shape: ShapeType;
    tint?: ColorTint;
    rotation?: number;
    jitter?: { x: number; y: number };
}

interface Position {
    x: number;
    y: number;
}

const CaptchaVerification: React.FC<CaptchaVerificationProps> = ({ onComplete }) => {
    // Camera and permissions
    const [cameraState, setCameraState] = useState<'requesting' | 'allowed' | 'blocked'>('requesting');

    // Verification flow
    const [currentStep, setCurrentStep] = useState<VerificationStep>("camera");
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [squarePosition, setSquarePosition] = useState<Position>({ x: 30, y: 30 });
    const [lockedPosition, setLockedPosition] = useState<Position | null>(null);
    const [gridSectors, setGridSectors] = useState<GridSector[]>([]);
    const [selectedSectors, setSelectedSectors] = useState<number[]>([]);
    const [result, setResult] = useState<"PASS" | "FAIL" | null>(null);
    const [targetShape, setTargetShape] = useState<ShapeType>("triangle");
    const [targetTint, setTargetTint] = useState<ColorTint>("red");
    const [attemptsMade, setAttemptsMade] = useState(0);
    const [isValidating, setIsValidating] = useState(false);

    // DOM refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const movementTimer = useRef<NodeJS.Timeout | null>(null);

    const buildShapeChallenge = useCallback(() => {
        // Pick random target before generating grid
        const shapes: ShapeType[] = ["triangle", "square", "circle"];
        const tints: ColorTint[] = ["red", "green", "blue"];
        const newTargetShape = shapes[Math.floor(Math.random() * shapes.length)];
        const newTargetTint = tints[Math.floor(Math.random() * tints.length)];

        setTargetShape(newTargetShape);
        setTargetTint(newTargetTint);

        const newGrid = createShapeGrid(newTargetShape, newTargetTint);
        setGridSectors(newGrid);
        setSelectedSectors([]);
    }, []);

    const checkUserSelection = useCallback(() => {
        setIsValidating(true);

        const isCorrect = checkShapeSelection(
            gridSectors,
            selectedSectors,
            targetShape,
            targetTint
        );

        setTimeout(() => {
            const success = isCorrect;
            setResult(success ? "PASS" : "FAIL");
            setIsValidating(false);

            // Return result to parent component if callback provided
            if (onComplete) {
                setTimeout(() => {
                    onComplete(success);
                }, 600);
            } else {
                setCurrentStep("results");
            }
        }, 1200);
    }, [gridSectors, targetShape, targetTint, selectedSectors, onComplete]);

    const requestCameraAccess = useCallback(async () => {
        try {
            setCameraState('requesting');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 640, height: 480 },
                audio: false
            });
            setCameraState('allowed');

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (error) {
            console.error("Camera access denied:", error);
            setTimeout(() => setCameraState('blocked'), 1000);
        }
    }, []);

    const getRandomSquarePosition = useCallback((): Position => {
        // Use percentage-based positioning with proper constraints for square size
        const minPercent = 5; // 5% margin from edges
        const maxPercent = 55; // Leave space for 30vw square (max 200px)
        return {
            x: Math.random() * (maxPercent - minPercent) + minPercent,
            y: Math.random() * (maxPercent - minPercent) + minPercent
        };
    }, []);

    const startSquareAnimation = useCallback(() => {
        if (movementTimer.current) {
            clearInterval(movementTimer.current);
        }

        movementTimer.current = setInterval(() => {
            setSquarePosition(getRandomSquarePosition());
        }, 1000);
    }, [getRandomSquarePosition]);

    const captureCurrentFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Match canvas to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Capture the frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Save as image data
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoData);

        // Lock square position
        setLockedPosition({ ...squarePosition });

        // Stop animation and camera
        if (movementTimer.current) {
            clearInterval(movementTimer.current);
            movementTimer.current = null;
        }

        const stream = video.srcObject as MediaStream;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        // Generate challenge and move to next step
        buildShapeChallenge();
        setCurrentStep("selection");
    }, [squarePosition, buildShapeChallenge]);

    const restartVerification = useCallback(() => {
        if (attemptsMade >= 3) {
            alert("Too many attempts. Please refresh to try again.");
            if (onComplete) {
                onComplete(false);
            }
            return;
        }

        setAttemptsMade(prev => prev + 1);
        setCurrentStep("camera");
        setCapturedPhoto(null);
        setLockedPosition(null);
        setGridSectors([]);
        setSelectedSectors([]);
        setResult(null);
        setSquarePosition({ x: 30, y: 30 });

        requestCameraAccess();
        startSquareAnimation();
    }, [attemptsMade, requestCameraAccess, startSquareAnimation, onComplete]);

    const toggleSector = useCallback((sectorId: number) => {
        setSelectedSectors(prev =>
            prev.includes(sectorId)
                ? prev.filter(id => id !== sectorId)
                : [...prev, sectorId]
        );
    }, []);

    // Initialize on mount
    useEffect(() => {
        if (currentStep === "camera") {
            requestCameraAccess();
            startSquareAnimation();
        }

        return () => {
            if (movementTimer.current) {
                clearInterval(movementTimer.current);
            }
        };
    }, [currentStep, requestCameraAccess, startSquareAnimation]);

    const renderCameraStep = () => (
        <div className="text-center bg-white py-6 sm:py-8 px-4 sm:px-8 lg:px-16">
            <h2 className="text-xl sm:text-2xl text-brand-navy mb-4 sm:mb-6">Take Your Photo</h2>

            {cameraState === 'requesting' && (
                <div className="text-gray-500 text-base sm:text-lg mb-6 w-full max-w-[648px] min-h-[250px] sm:min-h-[488px] flex items-center justify-center mx-auto">
                    Accessing camera...
                </div>
            )}

            {cameraState === 'blocked' && (
                <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-4 sm:p-6 w-full max-w-[648px] min-h-[250px] sm:min-h-[488px] border border-red-200 mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <svg width="24" height="24" className="sm:w-7 sm:h-7" fill="none" viewBox="0 0 28 28">
                            <circle cx="14" cy="14" r="14" fill="#F87171" />
                            <path d="M9 9l10 10M19 9l-10 10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="text-red-600 font-semibold text-sm sm:text-base">Camera Blocked</span>
                    </div>
                    <div className="text-gray-700 text-xs sm:text-sm text-center mb-4">
                        Please allow camera access in your browser settings and try again.
                    </div>
                    <button
                        className="bg-brand-gold hover:bg-yellow-600 text-white py-2 px-4 rounded-md shadow transition-colors text-sm sm:text-base"
                        onClick={requestCameraAccess}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {cameraState === 'allowed' && (
                <div className="relative inline-block w-full max-w-[648px] mx-auto rounded-sm overflow-hidden">
                    <video
                        ref={videoRef}
                        className="rounded-sm border-2 border-white w-full h-auto max-w-full block"
                        style={{ aspectRatio: '4/3' }}
                        playsInline
                        muted
                    />

                    <div
                        className="absolute border-2 border-gray-50 transition-all duration-1000 aspect-square"
                        style={{
                            width: 'min(150px, 25vw)',
                            left: `${Math.max(2, Math.min(75, squarePosition.x))}%`,
                            top: `${Math.max(2, Math.min(75, squarePosition.y))}%`,
                            background: 'rgba(255,255,255,0.25)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                        }}
                    />

                    <canvas ref={canvasRef} className="hidden" />
                </div>
            )}

            <div className="mt-4 sm:mt-6">
                <button
                    onClick={captureCurrentFrame}
                    className="bg-brand-gold uppercase hover:bg-yellow-600 text-white py-2 sm:py-3 px-4 sm:px-6 transition-colors text-sm sm:text-lg rounded-md"
                    disabled={cameraState !== 'allowed'}
                >
                    Continue
                </button>
            </div>
        </div>
    );

    const renderSelectionStep = () => (
        <div className="text-center bg-white py-6 sm:py-8 px-4 sm:px-8 lg:px-16">
            <h2 className="text-lg sm:text-2xl text-brand-navy mb-4 sm:mb-6">
                Select all <span className="font-bold text-brand-gold">{targetShape}s</span> with{' '}
                <span className="font-bold text-brand-gold">{targetTint}</span> tint
            </h2>

            {capturedPhoto && lockedPosition && (
                <div className="relative inline-block w-full max-w-[640px] mx-auto rounded-sm overflow-hidden">
                    <img
                        src={capturedPhoto}
                        alt="Your photo"
                        className="border-2 border-white w-full h-auto rounded-sm block"
                        style={{ maxWidth: '100%' }}
                    />

                    <div
                        className="absolute border-2 border-brand-gold aspect-square"
                        style={{
                            width: 'min(150px, 25vw)',
                            left: `${Math.max(2, Math.min(75, lockedPosition.x))}%`,
                            top: `${Math.max(2, Math.min(75, lockedPosition.y))}%`,
                            background: 'rgba(255,255,255,0.25)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                        }}
                    >
                        <ShapeGrid
                            gridData={gridSectors}
                            selectedSectors={selectedSectors}
                            onSectorToggle={toggleSector}
                            className="w-full h-full"
                        />
                    </div>
                </div>
            )}

            <div className="mt-4 sm:mt-6">
                <button
                    onClick={checkUserSelection}
                    disabled={isValidating || selectedSectors.length === 0}
                    className="bg-brand-gold uppercase hover:bg-yellow-600 text-white py-2 sm:py-3 px-4 sm:px-6 transition-colors text-sm sm:text-lg rounded-md disabled:bg-gray-400"
                >
                    {isValidating ? 'Checking...' : 'Submit'}
                </button>
            </div>
        </div>
    );

    const renderResultsStep = () => (
        <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Verification Complete</h2>

            <div className="mb-4 sm:mb-6">
                {result === "PASS" ? (
                    <div className="text-success-green text-3xl sm:text-4xl font-bold">
                        ✓ Verified!
                    </div>
                ) : (
                    <div className="text-red-400 text-3xl sm:text-4xl font-bold">
                        ✗ Verification Failed
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                {result === "FAIL" && attemptsMade < 3 && (
                    <button
                        onClick={restartVerification}
                        className="bg-brand-gold hover:bg-yellow-600 text-brand-navy font-bold py-2 sm:py-3 px-4 sm:px-8 rounded-lg transition-colors text-sm sm:text-lg"
                    >
                        Try Again ({3 - attemptsMade} left)
                    </button>
                )}

                <button
                    onClick={() => window.location.reload()}
                    className="bg-white hover:bg-gray-100 text-brand-navy font-bold py-2 sm:py-3 px-4 sm:px-8 rounded-lg transition-colors text-sm sm:text-lg"
                >
                    Start Over
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-200 p-2 sm:p-4">
            <div className="bg-brand-navy px-4 sm:px-8 lg:px-16 py-6 sm:py-10 lg:py-14 rounded-lg max-w-4xl w-full mx-auto">
                {currentStep === "camera" && renderCameraStep()}
                {currentStep === "selection" && renderSelectionStep()}
                {currentStep === "results" && renderResultsStep()}
            </div>
        </div>
    );
};

export default CaptchaVerification;
