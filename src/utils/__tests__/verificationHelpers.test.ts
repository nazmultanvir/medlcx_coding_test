import { describe, it, expect } from 'vitest';
import { 
    createShapeGrid, 
    checkShapeSelection, 
    calculateScore,
    generateSessionId 
} from '../verificationHelpers';

describe('Verification Helpers', () => {
    describe('createShapeGrid', () => {
        it('generates a 16-sector grid', () => {
            const grid = createShapeGrid('triangle', 'red');
            expect(grid).toHaveLength(16);
        });

        it('includes target shapes in the grid', () => {
            const grid = createShapeGrid('circle', 'blue');
            const hasTargets = grid.some(sector => 
                sector.hasShape && sector.shape === 'circle' && sector.tint === 'blue'
            );
            expect(hasTargets).toBe(true);
        });

        it('includes some empty sectors', () => {
            const grid = createShapeGrid('square', 'green');
            const hasEmptySpaces = grid.some(sector => !sector.hasShape);
            expect(hasEmptySpaces).toBe(true);
        });
    });

    describe('checkShapeSelection', () => {
        const mockGrid = [
            { id: 0, hasShape: true, shape: 'triangle' as const, tint: 'red' as const },
            { id: 1, hasShape: true, shape: 'square' as const, tint: 'blue' as const },
            { id: 2, hasShape: true, shape: 'triangle' as const, tint: 'red' as const },
            { id: 3, hasShape: false, shape: 'circle' as const }
        ];

        it('returns true for correct selections', () => {
            const result = checkShapeSelection(mockGrid, [0, 2], 'triangle', 'red');
            expect(result).toBe(true);
        });

        it('returns false for wrong selections', () => {
            const result = checkShapeSelection(mockGrid, [1], 'triangle', 'red');
            expect(result).toBe(false);
        });

        it('returns false for partial selections', () => {
            const result = checkShapeSelection(mockGrid, [0], 'triangle', 'red');
            expect(result).toBe(false);
        });
    });

    describe('calculateScore', () => {
        it('gives full score for correct fast answers', () => {
            const score = calculateScore(1000, true);
            expect(score).toBeGreaterThan(100);
        });

        it('gives zero for wrong answers', () => {
            const score = calculateScore(1000, false);
            expect(score).toBe(0);
        });
    });

    describe('generateSessionId', () => {
        it('creates unique session IDs', () => {
            const id1 = generateSessionId();
            const id2 = generateSessionId();
            expect(id1).not.toBe(id2);
        });

        it('includes session prefix', () => {
            const id = generateSessionId();
            expect(id).toMatch(/^sess_/);
        });
    });
});
