export type Grid<T> = Record<string, T>;
export type GridIndex = [number, number];

export function gridGet<T>(g: Grid<T>, i: GridIndex) {
    return g[stringifyGridIndex(i)];
}
export function gridSet<T>(g: Grid<T>, i: GridIndex, v: T) {
    g[stringifyGridIndex(i)] = v;
}
export function gridDelete<T>(g: Grid<T>, i: GridIndex) {
    delete g[stringifyGridIndex(i)];
}

export function parseGridIndex(s: string): GridIndex {
    return s.split(",").map(Number) as GridIndex;
}
export function stringifyGridIndex(i: GridIndex) {
    return i.join(",");
}

export function transposeSubgrid<T>(m: Grid<T>, rel: GridIndex): Grid<T> {
    const [i0, j0] = rel;

    const newGrid: Grid<T> = {};

    for (const [gridIndexStr, gridValue] of Object.entries(m)) {
        const gridIndex = parseGridIndex(gridIndexStr);
        const [i, j] = gridIndex;

        if (i >= i0 && j >= j0) {
            const transposedGridIndex = transposeIndexRelative(gridIndex, rel);
            newGrid[stringifyGridIndex(transposedGridIndex)] = gridValue;
        } else {
            newGrid[stringifyGridIndex(gridIndex)] = gridValue;
        }
    }

    return newGrid;
}

export function transposeIndex([i, j]: GridIndex) {
    return [j, i] as GridIndex;
}
export function transposeIndexRelative([i, j]: GridIndex, [i0, j0]: GridIndex): GridIndex {
    return [i0 + j - j0, j0 + i - i0] as GridIndex;
}

function getGridIndices<T>(grid: Grid<T>): GridIndex[] {
    return Object.keys(grid).map(parseGridIndex);
}

export function isGridConsistent<T>(grid: Grid<T>): boolean {
    const gridIndices = getGridIndices(grid);
    const indicesByRow = groupByMapped(
        gridIndices,
        (c) => c[0].toString(),
        (c) => c[1],
    );
    const rowIndices = Object.keys(indicesByRow).map(Number);
    const rowWidths = rowIndices.map((rowIndex) => Math.max(...indicesByRow[rowIndex]) + 1);

    for (const rowIndex of rowIndices) {
        if (indicesByRow[rowIndex].length !== rowWidths[rowIndex]) {
            return false;
        }
    }

    for (let i = 0; i < rowIndices.length - 1; i++) {
        if (rowWidths[i + 1] > rowWidths[i]) {
            return false;
        }
    }

    return true;
}

export function isGridSolved<T>(grid: Grid<T>): boolean {
    const gridIndices = getGridIndices(grid);
    const indicesByRow = groupByMapped(
        gridIndices,
        (c) => c[0].toString(),
        (c) => c[1],
    );
    const rowIndices = Object.keys(indicesByRow).map(Number);
    const rowWidths = rowIndices.map((rowIndex) => Math.max(...indicesByRow[rowIndex]) + 1);

    for (const rowIndex of rowIndices) {
        if (indicesByRow[rowIndex].length !== rowWidths[rowIndex]) {
            return false;
        }
    }

    for (let i = 0; i < rowIndices.length - 1; i++) {
        if (rowWidths[i + 1] >= rowWidths[i]) {
            return false;
        }
    }

    return true;
}

const groupByMapped = <T, K>(
    array: T[],
    predicate: (value: T, index: number, array: T[]) => string,
    map: (value: T, index: number, array: T[]) => K,
) =>
    array.reduce(
        (acc, value, index, array) => {
            (acc[predicate(value, index, array)] ||= []).push(map(value, index, array));
            return acc;
        },
        {} as { [key: string]: K[] },
    );

export function generateWeakSortedGridUnsolved(size: number): Grid<number> {
    let grid: Grid<number>;
    do {
        grid = generateWeakSortedGrid(size);
    } while (isGridSolved(grid));
    return grid;
}

export function generateWeakSortedGrid(size: number): Grid<number> {
    return createGridFromWidths(
        [...Array(size).keys()].map(() => Math.floor(Math.random() * (size - 2))).sort((a, b) => b - a),
    );
}

export function serializeGridCoords<T>(g: Grid<T>): string {
    return getGridWidths(g).join("");
}

export function deserializeGridCoords(encoded: string) {
    if (!/\d+/.test(encoded)) return null;

    const widths = encoded.split("").map(Number);
    return createGridFromWidths(widths);
}

function createGridFromWidths(widths: number[]): Grid<number> {
    const grid: Grid<number> = {};

    // this ensures a unique key for animating.
    let n = Date.now();

    for (let j = 0; j < widths.length; j++) {
        for (let i = 0; i < widths[j]; i++) {
            gridSet(grid, [j, i], n++);
        }
    }

    return grid;
}

function getGridWidths<T>(grid: Grid<T>): number[] {
    const gridIndices = getGridIndices(grid);
    const indicesByRow = groupByMapped(
        gridIndices,
        (c) => c[0].toString(),
        (c) => c[1],
    );
    const rowIndices = Object.keys(indicesByRow).map(Number);
    const rowWidths = rowIndices.map((rowIndex) => Math.max(...indicesByRow[rowIndex]) + 1);
    return rowWidths;
}
