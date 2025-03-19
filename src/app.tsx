import {
    Grid,
    GridIndex,
    deserializeGridCoords,
    generateWeakSortedGridUnsolved,
    isGridConsistent,
    isGridSolved,
    parseGridIndex,
    serializeGridCoords,
    transposeSubgrid,
} from "./lib/grid";
import clsx from "clsx";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCheck, FaCopy } from "react-icons/fa";

export default function App() {
    const [grid, setGrid] = useState<Grid<number>>({});
    const [hasCopied, setHasCopied] = useState(false);

    const isInvalid = useMemo(() => !isGridConsistent(grid), [grid]);
    const isSolved = useMemo(() => isGridSolved(grid), [grid]);

    useEffect(() => {
        const params = new URL(document.location.toString()).searchParams;
        const p = params.get("p");

        let initialGrid = generateWeakSortedGridUnsolved(8);

        if (p) {
            const deserializedGrid = deserializeGridCoords(p);
            if (deserializedGrid && isGridConsistent(deserializedGrid)) {
                initialGrid = deserializedGrid;
            }
        }

        setGrid(initialGrid);
    }, []);

    const handleRegenerate = () => {
        setGrid(generateWeakSortedGridUnsolved(8));
    };

    const handleGridClick = useCallback(
        (index: GridIndex) => {
            const newGrid = transposeSubgrid(grid, index);
            setGrid(newGrid);

            if (!isGridConsistent(newGrid)) {
                setTimeout(() => {
                    setGrid(grid);
                }, 600);
            }
        },
        [grid],
    );

    const handleCopy = useCallback(() => {
        const url = window.location.origin + window.location.pathname + "?p=" + serializeGridCoords(grid);
        window.history.replaceState({}, "", url);
        navigator.clipboard.writeText(url);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 1000);
    }, [grid]);

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
                    <div className="flex flex-row items-center gap-2">
                        <motion.button
                            className="flex h-10 w-10 cursor-pointer rounded-sm bg-neutral-300 hover:bg-neutral-400"
                            onClick={handleCopy}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="m-auto">
                                {hasCopied ? (
                                    <FaCheck className="text-green-600" />
                                ) : (
                                    <FaCopy className="text-neutral-600" />
                                )}
                            </span>
                        </motion.button>
                        <motion.button
                            className="cursor-pointer rounded-sm bg-neutral-300 px-4 py-2 hover:bg-neutral-400"
                            onClick={handleRegenerate}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Regenerate
                        </motion.button>
                    </div>
                </div>
            </main>
            <footer></footer>
        </div>
    );
}
