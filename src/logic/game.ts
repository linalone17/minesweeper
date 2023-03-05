import {Nullable} from "../typings/utils";
import {getRandomNumber} from "../utils";

export interface Size  {
    readonly rows: number;
    readonly cols: number;
}

export type Coords = {
    readonly row: number;
    readonly col: number;
}

type BatchedCoords = number; // 1209 for (12, 9)
type Mark = 'none' | 'flag' | 'question';

interface UninitializedCell {
    type: 'uninitialized';
    isOpened: boolean;
    nearbyMines?: number;
    coords: Nullable<Coords>;
    mark: Mark;
}

export interface MineCell {
    type: 'mine';
    isOpened: boolean;
    coords: Coords;
    mark: Mark;
}

export interface EmptyCell {
    type: 'empty';
    isOpened: boolean;
    nearbyMines: number;
    coords: Coords;
    mark: Mark;
}

export type Cell = MineCell | EmptyCell;
export type Status = 'ready' | 'inGame' | 'victory' | 'loss';

interface UninitializedField {
    status: Status;
    size: Size;
    extraMine: Nullable<MineCell>;
    minesAmount: number;
    remainingMarks: number;
    openedCells: number;
    value: Array<Array<Cell | UninitializedCell>>;
    isWaiting: boolean;
}

export interface Field {
    status: Status;
    size: Size;
    extraMine: Nullable<MineCell>;
    minesAmount: number;
    remainingMarks: number;
    openedCells: number;
    value: Array<Array<Cell>>;
    isWaiting: boolean;
}

const uninitializedCell: UninitializedCell = {
    type: 'uninitialized',
    isOpened: false,
    nearbyMines: 0,
    coords: null,
    mark: 'none'
}

function getNearbyCellsCoords (currentCellCoords: Coords, size: Size): Array<Coords> {
    const offsets: Array<Coords> = [
        {row: -1, col: -1},
        {row: -1, col: 0},
        {row: -1, col: 1},

        {row: 0, col: -1},
        {row: 0, col: 1},

        {row: 1, col: -1},
        {row: 1, col: 0},
        {row: 1, col: 1}
    ]
    const items = [];

    for (let offset of offsets) {
        const nearbyCoords: Coords = {
            row: offset.row + currentCellCoords.row,
            col: offset.col + currentCellCoords.col
        }

        if (
            nearbyCoords.row >= 0 &&
            nearbyCoords.row < size.rows &&

            nearbyCoords.col >= 0 &&
            nearbyCoords.col < size.cols
        ) {
            items.push(nearbyCoords);
        }
    }
    return items
}

function getBatchedCoords(coords: Coords, size: Size): BatchedCoords {
    const digits = Math.max(
        size.rows.toString().length,
        size.cols.toString().length
    )

    return coords.row * 10**digits + coords.col;
}

function generateMinesBatchedCoords(minesAmount: number, size: Size): Set<BatchedCoords> {
    const batchedCoordsSet = new Set();

    while (batchedCoordsSet.size < minesAmount) {
        const row = getRandomNumber(0, size.rows - 1);
        const col = getRandomNumber(0, size.cols - 1);

        const batchedCoords = getBatchedCoords({row, col}, size)
        if (!batchedCoordsSet.has(batchedCoords)) {
            batchedCoordsSet.add(batchedCoords);
        }
    }

    return batchedCoordsSet as Set<BatchedCoords>;
}

export function initField(
    size: Size = {rows:16, cols:16},
    minesAmount: number = 40
): Field {

    //init empty field with initialCells
    const fieldValue = new Array(size.rows);

    for (let i = 0; i < size.rows; i++) {
        fieldValue[i] = new Array(size.cols);

        for (let j = 0; j < size.cols; j++) {
            fieldValue[i][j] = {...uninitializedCell}
        }
    }

    const status: Status = "ready";

    const field: UninitializedField = {
        status: status,
        size: {...size},
        extraMine: null,
        minesAmount,
        remainingMarks: minesAmount,
        openedCells: 0,
        value: fieldValue,
        isWaiting: false
    };

    const minesBatchedCoords = generateMinesBatchedCoords(minesAmount + 1, size);

    // fill in field
    for (let row = 0; row < size.rows; row++) {

        for (let col = 0; col < size.cols; col++) {

            let currentCell = field.value[row][col];
            currentCell.coords = {row, col};

            if (minesBatchedCoords.has(getBatchedCoords(currentCell.coords, size))) {
                // if mine

                // make MineCell from InitialCell
                // @ts-ignore
                delete currentCell.nearbyMines!;
                currentCell.type = 'mine';
                currentCell = currentCell as MineCell;

                if (field.extraMine === null) {
                    field.extraMine = currentCell;
                }

                const nearbyCoords = getNearbyCellsCoords({row, col}, size);
                nearbyCoords.forEach((coords) => {
                    const nearbyCell = field.value[coords.row][coords.col];

                    if (nearbyCell.type !== 'mine') {
                        nearbyCell.nearbyMines! += 1;
                    }
                })
            } else {
                // if not mine

                // make EmptyCell from InitialCell
                currentCell.type = 'empty';
                currentCell = currentCell as EmptyCell;
            }
        }
    }

    return field as Field;
}

function copyField(field: Field): Field {
    const size: Size = field.size;

    const value = new Array(size.rows);
    for (let i = 0; i < size.rows; i++) {

        value[i] = new Array(size.cols);
        for (let j = 0; j < size.cols; j++) {

            value[i][j] = {...field.value[i][j]}
        }
    }

    const extraMine = Object.assign({}, field.extraMine);

    return {
        ...field,
        value,
        extraMine
    }
}

// immutable
export function openCell(cell: Cell, field: Field): Field {
    field = copyField(field);

    if (field.status === 'loss' || field.status === 'victory') {
        return field;
    }
    // to avoid misclicks
    if (cell.mark !== 'none') {
        return field;
    }

    if (field.openedCells === 0) {
        field.status = 'inGame';
        if (cell.type === 'mine') {
            changeToEmptyCell(cell, field);
        } else {
            changeToEmptyCell(field.extraMine!, field);
            field.extraMine = null;
        }
    } else if (cell.type === 'mine') {
        openAllMines(field);
        field.status = 'loss';
        return field;
    }

    const currentCellCoords: Coords = cell.coords;

    //mutates copied field
    function recursiveOpen(currentCellCoords: Coords, field: Field) {
        const currentCell = field.value[currentCellCoords.row][currentCellCoords.col];

        if (currentCell.isOpened || currentCell.type === 'mine') return;

        // open if not mine
        currentCell.isOpened = true;
        field.openedCells += 1;

        // and unmark aswell
        if (currentCell.mark !== 'none') {
            currentCell.mark = "none";
            field.remainingMarks += 1;
        }

        // drop if nearby mines
        if (currentCell.nearbyMines > 0) return;

        // recursively open adjacent cells if there are no nearby mines
        const size = field.size;
        const nearbyCellsCoords = getNearbyCellsCoords(currentCellCoords, size)

        nearbyCellsCoords.forEach((coords) => {
            recursiveOpen(coords, field);
        })
    }

    recursiveOpen(currentCellCoords, field);

    if (field.openedCells === field.size.rows * field.size.cols - field.minesAmount) {
        field.status = 'victory';
    }

    return field;
}

// immutable
export function markCell(cell: Cell, field: Field) {
    if (cell.isOpened || field.status === 'victory' || field.status === 'loss') {
        return field;
    }

    field = copyField(field);
    const cellCoords = cell.coords;
    const cellInCopied = field.value[cellCoords.row][cellCoords.col];
    switch (cell.mark) {
        case 'none':
            if (field.remainingMarks > 0) {
                field.remainingMarks -= 1;
                cellInCopied.mark = 'flag';
            }
            break
        case 'flag':
            cellInCopied.mark = 'question';
            break
        case 'question':
            field.remainingMarks += 1;
            cellInCopied.mark = 'none'
    }

    return field;
}

// mutates field
export function openAllMines(field: Field) {
    field.value.forEach((row) => {
        row.forEach(((cell) => {
            if (cell.type === 'mine') {
                cell.isOpened = true;
            }
        }))
    })
}

// mutates field, doesn't mutate cell
function changeToEmptyCell(cell: MineCell, field: Field): void {
    let nearbyMines: number = 0;

    const nearbyCellsCoords = getNearbyCellsCoords(cell.coords, field.size);
    nearbyCellsCoords.forEach((coords) => {
        const nearbyCell = field.value[coords.row][coords.col];
        if (nearbyCell.type === 'mine') {
            nearbyMines += 1;
        } else {
            nearbyCell.nearbyMines -= 1;
        }

    })

    field.value[cell.coords.row][cell.coords.col] = {
        type: 'empty',
        isOpened: cell.isOpened,
        nearbyMines: nearbyMines,
        coords: cell.coords,
        mark: cell.mark,
    } as EmptyCell;
}