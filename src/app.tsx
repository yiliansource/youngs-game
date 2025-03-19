import {
    Grid,
    GridIndex,
    generateWeakSortedGrid,
    isGridConsistent,
    isGridSolved,
    parseGridIndex,
    transposeSubgrid,
} from "./lib/grid";
import clsx from "clsx";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function App() {
    const [grid, setGrid] = useState<Grid<number>>({});

    const isInvalid = useMemo(() => !isGridConsistent(grid), [grid]);
    const isSolved = useMemo(() => isGridSolved(grid), [grid]);

    useEffect(() => {
        handleRegenerate();
    }, []);

    const handleRegenerate = () => {
        let grid: Grid<number>;
        do {
            grid = generateWeakSortedGrid(8);
        } while (isGridSolved(grid));
        setGrid(grid);
    };

    const handleGridClick = useCallback(
        (index: GridIndex) => {
            const newGrid = transposeSubgrid(grid, index);
            setGrid(newGrid);

            if (!isGridConsistent(newGrid)) {
                setTimeout(() => {
                    setGrid(grid);
                }, 500);
            }
        },
        [grid],
    );

    const cellSize = 32;
    const cellGap = 2;

    const gridWidth = 8;
    const gridHeight = 8;

    return (
        <div className="flex min-h-screen flex-col bg-neutral-100">
            <header></header>
            <main className="mx-auto flex w-full max-w-4xl grow px-2">
                <div className="m-auto flex flex-col items-center">
                    <div className="my-4">
                        <h1 className="mb-4 text-center text-4xl font-bold">Young's Game</h1>
                        <p className="text-center leading-7">
                            Your goal is to rearrange the rows in strictly decreasing order of widths.
                            <br />
                            Clicking a cell flips everything to the bottom-right of it. This may not break sorting or
                            create gaps.
                        </p>
                    </div>
                    <div
                        className={clsx("relative my-6", (isInvalid || isSolved) && "pointer-events-none")}
                        style={{
                            width: gridWidth * cellSize + (gridWidth - 1) * cellGap,
                            height: gridHeight * cellSize + (gridHeight - 1) * cellGap,
                        }}
                    >
                        {Object.entries(grid).map(([indexStr, value]) => {
                            const index = parseGridIndex(indexStr);
                            const [i, j] = index;

                            return (
                                <motion.div
                                    key={value}
                                    className={clsx(
                                        "absolute z-10 rounded-md",
                                        !isInvalid && !isSolved && "cursor-pointer bg-neutral-700",
                                        isInvalid && "bg-red-400",
                                        isSolved && "bg-green-500",
                                    )}
                                    onClick={() => handleGridClick(index)}
                                    style={{
                                        width: 32 + "px",
                                        height: 32 + "px",
                                    }}
                                    initial={false}
                                    animate={{
                                        x: j * (cellSize + cellGap),
                                        y: i * (cellSize + cellGap),
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    layout
                                ></motion.div>
                            );
                        })}
                    </div>
                    <motion.button
                        className="cursor-pointer rounded-sm bg-neutral-300 px-4 py-2 hover:bg-neutral-400"
                        onClick={handleRegenerate}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Regenerate
                    </motion.button>
                </div>
            </main>
            <footer></footer>
        </div>
    );
}
