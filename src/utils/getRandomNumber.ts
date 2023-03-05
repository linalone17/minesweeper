// generates random number in interval [start, end]
export function getRandomNumber (start: number, end: number): number {
    if (start > end) {
        throw new Error('incorrect interval')
    }

    return start + (Math.random() * (end - start + 1)) | 0;
}