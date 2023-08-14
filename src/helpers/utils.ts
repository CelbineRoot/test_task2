import {Bets, RadianMap} from "../constants";

export const toDigits = (number: number | string, length: number = 2) => {
    const p = 10 ** length;
    return Math.floor(Number(number) * p) / p;
};

export default toDigits;

export const delay = (time: number) => new Promise((resolve) => {
    setTimeout(resolve, time);
});

export function resetAllWeight(weights: number[]): number[] {
    const sum = weights.reduce((previousValue, currentValue) => previousValue + currentValue);
    for (const index in weights) {
        weights[index] /= sum;
    }
    return weights;
}

export function getRandomInRange(min: number, max: number): number {
    return parseFloat((Number(min) + Math.random() * (Number(max) - Number(min))).toFixed(2));
}

export function getIntRandomInRange(min: number, max: number): number {
    return Math.floor(parseFloat((Number(min) + Math.random() * (Number(max) + 1 - Number(min))).toFixed(2)));
}

const rad = 57.2958;

export function findOffset(bets: Bets, winId: string): number {
    const space: number = (Math.PI / 200) * rad;
    const radianMap = new Map<string, RadianMap>();
    const arrBets = Array.from(bets);

    arrBets.forEach(([userId, bet], index) => {
        radianMap.set(userId, {
            startRad: (radianMap.size === 0) ? space : radianMap.get(arrBets[index - 1][0])!.endRad + space,
            endRad: (radianMap.size === 0) ? (bet.percent! / 100) * 360 : (radianMap.get(arrBets[index - 1][0])!.endRad + (bet.percent! / 100) * 360),
        });
    });
    const randOffSet = 360 * getIntRandomInRange(4, 8) + 90;
    return randOffSet + 360 - (getRandomInRange(radianMap.get(winId)!.startRad, radianMap.get(winId)!.endRad));
}