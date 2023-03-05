import React, {useEffect, useMemo, useState} from "react";

import {useTimer, useAppDispatch} from "../../hooks";

import styles from './Game.module.scss';
import cn from 'classnames';

import {useAppSelector} from "../../hooks/useAppDispatch";
import {selectField, actions} from "../../store/slices/FieldSlice";
import {Cell, Status} from "../../logic/game";

import {
    Closed,
    Flag,
    FlagWrong,
    FlagClosed,
    Mine,
    MineRed,

    Type0,
    Type1,
    Type2,
    Type3,
    Type4,
    Type5,
    Type6,
    Type7,
    Type8,

    FaceActive,
    FaceLose,
    FacePressed,
    FaceUnpressed,
    FaceWin,

    DigitsBackground,
    Digit0,
    Digit1,
    Digit2,
    Digit3,
    Digit4,
    Digit5,
    Digit6,
    Digit7,
    Digit8,
    Digit9
} from '../assets';

const statusFaces = {
    waiting: FaceActive,
    ready: FaceUnpressed,
    inGame: FaceUnpressed,
    loss: FaceLose,
    victory: FaceWin
};

const digits = [
    Digit0,
    Digit1,
    Digit2,
    Digit3,
    Digit4,
    Digit5,
    Digit6,
    Digit7,
    Digit8,
    Digit9];

const cellNums = [
    Type0,
    Type1,
    Type2,
    Type3,
    Type4,
    Type5,
    Type6,
    Type7,
    Type8
];

interface StatusFaceProps {
    status: Status | 'waiting';
    height: number;
    width: number;
}
interface NumberProps {
    digit: number;
    height: number;
    width: number;
}

function splitByDigits(number: number) {
    if (number > 1000) {
        number = number % 1000;
    }
    const a = number % 10;
    const b = ((number % 100 - a) / 10) | 0;
    const c = ((number % 1000 - number % 100) / 100) | 0;

    return [c, b, a]
}


const StatusFace: React.FC<StatusFaceProps> = ({status, height, width}) => {
    const FaceComponent = statusFaces[status];
    return <div>
        <FaceComponent height={height} width={width} style={{overflow: 'hidden'}}/>
    </div>
}
const Digit: React.FC<NumberProps> = ({digit, height, width}) => {
    const DigitComponent = digits[digit];
    return <div>
        <DigitComponent height={height} width={width}/>
    </div>
}

const GameMenu: React.FC = () => {
    const {time, startTimer, stopTimer, resetTimer} = useTimer();

    const {remainingMarks, status, isWaiting} = useAppSelector(selectField);
    const dispatch = useAppDispatch();

    useMemo(() => {
        if (status === 'inGame' && time === 0) {
            startTimer();
        }

        if (status === 'loss' || status === 'victory') {
            stopTimer();
        }
    }, [status])

    function handleClick() {
        resetTimer();
        dispatch(actions.restart());
    }


    return (
        <div className={styles.GameMenu}>
            <div className={styles.mines}>
                <div className={styles.numbers}>
                    {splitByDigits(remainingMarks).map((digit, index) => {
                        return <Digit key={`${digit}${index}`} digit={digit} height={54} width={30}/>
                    })}
                </div>
            </div>
            <div className={styles.face} onClick={handleClick}>
                <StatusFace status={isWaiting ? 'waiting' : status} height={54} width={54}/>
            </div>
            <div className={styles.time}>
                <div className={styles.numbers}>
                    {splitByDigits(time).map((digit, index) => {
                        return <Digit key={`${digit}${index}`} digit={digit} height={54} width={30}/>
                    })}
                </div>
            </div>
            {/*<div>{status}</div>*/}
        </div>
    )
}

const GameField: React.FC = () => {
    const field = useAppSelector(selectField);
    const dispatch = useAppDispatch();

    const openCell = (cell: Cell) => {
        dispatch(actions.openCell(cell));
    }

    const markCell = (cell: Cell) => {
        dispatch(actions.markCell(cell));
    }

    const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>, cell: Cell) => {
        if (
            event.button !== 0 ||
            field.status === 'loss'
            || field.status === 'victory'
        ) return;

        dispatch(actions.switchWait(false));
        openCell(cell);
    }
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>, cell: Cell) => {
        if (
            event.button !== 0  ||
            field.status === 'loss' ||
            field.status === 'victory'
        ) return;

        dispatch(actions.switchWait(true));
    }

    const handleRightClick = (event: React.MouseEvent<HTMLDivElement>, cell: Cell) => {
        markCell(cell);
    }

    return (
        <div className={styles.GameField}>
            {field.value.map((row) => {

                return (
                    <div className={styles.row}>
                        {row.map((cell) => { // here not using key is safe, order is unchanged
                            let CellBackground;

                            if (!cell.isOpened) {
                                if (cell.mark === 'flag') {
                                    if (
                                        field.status === 'loss' &&
                                        cell.type === 'mine'
                                    ) {
                                        CellBackground = FlagWrong;
                                    } else {
                                        CellBackground = Flag;
                                    }
                                } else if (cell.mark === 'question') {
                                    if (
                                        field.status === 'loss' &&
                                        cell.type === 'mine'
                                    ) {
                                        CellBackground = FlagWrong;
                                    } else {
                                        CellBackground = FlagClosed;
                                    }
                                } else {
                                    CellBackground = Closed;
                                }
                            } else if (cell.type === 'mine') {
                                CellBackground = Mine;
                            } else {
                                CellBackground = cellNums[cell.nearbyMines];
                            }
                            return (
                                <div
                                    className={cn(
                                        {
                                            [styles.opened]: cell.isOpened
                                        },
                                        styles.cell
                                    )}
                                    // onClick={(event) => {
                                    //     event.preventDefault();
                                    //     handleLeftClick(event, cell)
                                    // }}
                                    key={`${cell.coords.row}.${cell.coords.col}`}
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        handleMouseDown(event, cell)
                                    }}
                                    onMouseUp={(event) => {
                                        event.preventDefault();
                                        handleMouseUp(event, cell)
                                    }}
                                    onContextMenu={(event) => {
                                        event.preventDefault();
                                        handleRightClick(event, cell);
                                    }}
                                >
                                    <div className={styles.content}>
                                        <CellBackground width={30} height={30}/>
                                        {/*{cell.type === 'mine' ? 'X' : cell.nearbyMines}*/}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}

export const Game: React.FC = () => {

    return (
        <div className={styles.Game}>
            <GameMenu/>
            <GameField/>
        </div>
    )
}
