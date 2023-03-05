import {useEffect, useRef, useState} from 'react';

export function useTimer (): {
    time: number,
    startTimer:() => void,
    stopTimer: () => void,
    resetTimer: () => void
} {
    const [time, setTime] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(false);

    function startTimer (): void {
        setIsActive(true);
    }

    function stopTimer(): void {
        setIsActive(false);
    }

    function resetTimer (): void {
        setIsActive(false);
        setTime(0);
    }

    useEffect(() => {
        if (!isActive) return;

        const initialTime = new Date().getTime();
        function tick() {
            const currentTime = new Date().getTime();
            const timeDiff = (Math.floor((currentTime - initialTime)/1000));

            setTime(timeDiff);
        }

        const interval = setInterval(tick, 1000);
        return () => {
            clearInterval(interval);
        }
    }, [isActive])

    return {time, startTimer, stopTimer, resetTimer}
}