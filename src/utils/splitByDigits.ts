export function splitByDigits(number: number) {
    if (number > 1000) {
        number = number % 1000;
    }
    const a = number % 10;
    const b = ((number % 100 - a) / 10) | 0;
    const c = ((number % 1000 - number % 100) / 100) | 0;

    return [c, b, a]
}