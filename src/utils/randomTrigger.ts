/**
 *
 * @param chance takes 0-100 as argument
 * value may take float values like 1.14
 * only 2 digit precision is calculated
 * other part of number is truncated
 */
export function randomTrigger (chance: number) {
    if (chance < 0 || chance > 100) {
        throw new Error('value must be 0-100');
    }

    const threshold = Math.floor(chance*100);
    const randomValue = Math.floor(Math.random()*10001);

    return randomValue <= threshold;
}
