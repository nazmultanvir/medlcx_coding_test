import React from 'react';

type ShapeType = "triangle" | "square" | "circle";
type ColorTint = "red" | "green" | "blue";

interface GridSector {
    id: number;
    hasShape: boolean;
    shape: ShapeType;
    tint?: ColorTint;
    rotation?: number;
    jitter?: { x: number; y: number };
}

interface ShapeGridProps {
    className?: string;
    gridData?: GridSector[];
    selectedSectors?: number[];
    onSectorToggle?: (sectorId: number) => void;
}

const ShapeGrid: React.FC<ShapeGridProps> = ({
    className = '',
    gridData = [],
    selectedSectors = [],
    onSectorToggle
}) => {
    // Color options for our shapes
    const shapeColors = {
        red: '#ef4444',
        green: '#22c55e',
        blue: '#3b82f6'
    };

    const createShape = (shape: ShapeType, tint?: ColorTint, rotation = 0, jitter = { x: 0, y: 0 }, sectorId = 0) => {
        const baseSize = 18;
        // Add slight size variation based on sector ID for more natural look
        const sizeVariation = (sectorId % 7) * 0.8;
        const finalSize = baseSize + sizeVariation;

        const shapeColor = shapeColors[tint || 'red'];

        const transform = `rotate(${rotation}deg) translate(${jitter.x}px, ${jitter.y}px)`;
        const commonStyle = {
            width: `${finalSize}px`,
            height: `${finalSize}px`,
            transform,
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.25))',
        };

        switch (shape) {
            case 'triangle':
                return (
                    <svg style={{ ...commonStyle, fill: shapeColor }} viewBox="0 0 24 24">
                        <path d="M12 2 L22 20 L2 20 Z" />
                    </svg>
                );

            case 'square':
                return (
                    <div
                        style={{
                            ...commonStyle,
                            backgroundColor: shapeColor,
                            borderRadius: '2px',
                        }}
                    />
                );

            case 'circle':
                return (
                    <div
                        style={{
                            ...commonStyle,
                            backgroundColor: shapeColor,
                            borderRadius: '50%',
                        }}
                    />
                );

            default:
                return null;
        }
    };

    // Create some visual noise to make it harder for bots
    const generateNoise = (sectorId: number) => {
        const particles = [];
        const noiseAmount = 4; // Keep it subtle

        for (let i = 0; i < noiseAmount; i++) {
            // Simple pseudo-random based on sector ID and index
            const xSeed = ((sectorId + i) * 7 + 23) % 100;
            const ySeed = ((sectorId + i + 11) * 13 + 7) % 100;

            particles.push(
                <div
                    key={`particle-${i}`}
                    className="absolute w-1 h-1 bg-gray-300 opacity-30 rounded-full"
                    style={{
                        left: `${xSeed}%`,
                        top: `${ySeed}%`,
                    }}
                />
            );
        }

        return <div className="absolute inset-0 pointer-events-none">{particles}</div>;
    };

    // Empty state - show numbered grid
    if (!gridData || gridData.length === 0) {
        const defaultCells = [];
        for (let i = 0; i < 9; i++) {
            defaultCells.push(
                <div
                    key={`default-${i}`}
                    className="bg-white border border-gray-300 rounded aspect-square flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                >
                    <span className="text-gray-400">{i + 1}</span>
                </div>
            );
        }

        return (
            <div className={`grid grid-cols-3 gap-2 ${className}`}>
                {defaultCells}
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-4 gap-1 ${className}`}>
            {gridData.map((sector) => {
                const isSelected = selectedSectors.includes(sector.id);

                const onSectorClick = () => {
                    if (onSectorToggle) {
                        onSectorToggle(sector.id);
                    }
                };

                return (
                    <div
                        key={sector.id}
                        onClick={onSectorClick}
                        className={`
                            relative aspect-square border-2 cursor-pointer transition-all duration-150
                            flex items-center justify-center
                            ${isSelected
                                ? 'border-gray-400 bg-gray-100 shadow-md'
                                : 'border-gray-300 bg-white hover:bg-gray-50'
                            }
                        `}
                        style={{ minHeight: '42px' }}
                    >
                        {generateNoise(sector.id)}

                        {sector.hasShape && createShape(
                            sector.shape,
                            sector.tint,
                            sector.rotation,
                            sector.jitter,
                            sector.id
                        )}

                        {isSelected && (
                            <div className="absolute top-1 right-1 w-3 h-3 bg-gray-600 rounded-full border border-white" />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ShapeGrid;
