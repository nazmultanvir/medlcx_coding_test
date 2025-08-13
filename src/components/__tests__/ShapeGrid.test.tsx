import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ShapeGrid from "../ShapeGrid";

describe("ShapeGrid Component", () => {
    const sampleData = [
        { id: 0, hasShape: true, shape: "triangle" as const, tint: "red" as const },
        { id: 1, hasShape: true, shape: "square" as const, tint: "green" as const },
        { id: 2, hasShape: false, shape: "circle" as const },
        { id: 3, hasShape: true, shape: "circle" as const, tint: "blue" as const }
    ];

    it("renders empty grid when no data provided", () => {
        render(<ShapeGrid />);
        for (let i = 1; i <= 9; i++) {
            expect(screen.getByText(i.toString())).toBeInTheDocument();
        }
    });

    it("displays shapes when grid data is passed", () => {
        render(<ShapeGrid gridData={sampleData} />);
        const gridCells = document.querySelectorAll(".cursor-pointer");
        expect(gridCells).toHaveLength(4);
    });

    it("handles click events", () => {
        const handleClick = vi.fn();
        render(<ShapeGrid gridData={sampleData} onSectorToggle={handleClick} />);
        const firstCell = document.querySelectorAll(".cursor-pointer")[0];
        fireEvent.click(firstCell);
        expect(handleClick).toHaveBeenCalledWith(0);
    });
});
