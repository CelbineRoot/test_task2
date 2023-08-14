export enum RouleteState {
    WAITING = 0,
    TIMER_START = 1,
    WHEEL_START = 2,
    FINISH = 3,
}

export type Owner = {
    img: string;
    name: string;
    id: string;
    winPercent?: number;
}

export type RGB = {
    r: number;
    g: number;
    b: number;
}

export interface Bet {
    gameId?: string;
    amount: number;
    startTicket?: number;
    endTicket?: number;
}

export interface NewBet extends Bet {
    userId: string;
}

export type UserBets = {
    percent: number | null;
    allAmount: number;
    color: RGB;
    userBets: Bet[];
    owner: Owner;
}

export type RouleteProps = {
    gameId?: string;
    totalAmount: number;
    wheelStartTime?: number | null;
    timerStart?: number | null;
    finishStartTime?: number | null;
    winnerBet?: UserBets;
    profit?: number;
    winAmount?: number;
    offset?: number;
    winPercent?: number;
    winnerTicket?: number;
    state?: RouleteState;
}

export type Options = {
    id?: string;
    name?: string,
    maxCountBets?: number;
    minAmount?: number;
    maxAmount?: number;
    available?: boolean;
    timeToWaiting?: number;
    timeToStart?: number;
    timeWheelRotation?: number;
}

export type TGetState = {
    state: RouleteState;
    time: number | null;
    bets: any;
    offset: number | null;
    gameId: string;
    totalAmount: number;
    winnerBet?: UserBets;
    winAmount?: number;
}

export type RadianMap = { startRad: number, endRad: number };
export type Bets = Map<string, UserBets>;
export type ResultBets = { userId: string, value: UserBets };