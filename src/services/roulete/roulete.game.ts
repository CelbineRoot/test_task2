import EventEmitter from 'events';
// @ts-ignore
import randomColor from 'random-color';
// @ts-ignore
import randomChoice from 'random-choice';

import {
    Bet,
    Bets,
    Options,
    Owner,
    MAIN_EVENTS,
    ResultBets,
    RouleteProps,
    RouleteState,
    TGetState,
    UserBets, PUB_EVENTS
} from "../../constants";
import {delay, toDigits, findOffset, getIntRandomInRange, resetAllWeight} from "../../helpers";
import RouleteOptionsEntity from "./entities/roulete-options.entity";

export class RouleteGame extends EventEmitter {
    public options: Partial<RouleteOptionsEntity>;

    public bets: Bets;

    public state: RouleteState;

    public rouleteProps: RouleteProps;

    constructor() {
        super();
    }

    public initialization(options: Partial<RouleteOptionsEntity>) {
        this.options = options;
        this.bets = new Map<string, UserBets>();
        this.state = RouleteState.WAITING;

        this.resetGame();
    }

    public addBet(userId: string, bet: Bet, user: Owner): Bet {
        this.checkAmount(userId, bet.amount);

        bet.startTicket = this.rouleteProps.totalAmount! + 1;

        this.rouleteProps.totalAmount! += bet.amount;

        bet.endTicket = this.rouleteProps.totalAmount!;

        bet.gameId = this.rouleteProps.gameId;

        if (!this.bets.has(userId)) {
            this.bets.set(userId, {
                percent: null,
                allAmount: bet.amount,
                owner: user,
                userBets: [bet],
                color: randomColor(0.6, 0.99).rgb()
            });
        } else {

            this.bets.get(userId)!.allAmount += bet.amount;
            this.bets.get(userId)!.userBets.push(bet);
        }

        this.resetAllPercent();

        if (this.bets.size >= 2 && this.state === RouleteState.WAITING) {
            this.timerStart();
        }

        this.emit(MAIN_EVENTS.ADD_BET, { bet, userId, user });
        return bet;
    }

    public get available(): boolean {
        return this.options.available!;
    }

    public checkAmount(userId: string, amount: number): void {
        if (!this.available) {
            throw new Error('Прием ставок временно заблокирован!');
        }

        if (this.state !== RouleteState.WAITING && this.state !== RouleteState.TIMER_START) {
            throw new Error('Дождитесь окончания игры.');
        }

        if (this.bets.size !== 0 && this.bets.has(userId) && this.bets.get(userId)!.allAmount + amount < this.options.minAmount!) {
            throw new Error(`Минимальная сумма ставки: ${ this.options.minAmount }.`);
        }

        if (!this.bets.has(userId) && amount < this.options.minAmount!) {
            throw new Error(`Минимальная сумма ставки: ${ this.options.minAmount }.`);
        }

        if (amount > this.options.maxAmount!) {
            throw new Error(`Максимальная сумма ваших ставок: ${ this.options.maxAmount }.`);
        }

        if (this.options.maxAmount! > 0 && this.bets.has(userId) && (this.bets.get(userId)!.allAmount + amount > this.options.maxAmount!)) {
            throw new Error(`Максимальная сумма ваших ставок: ${ this.options.maxAmount }.`);
        }

        if (this.bets.has(userId) && this.bets.get(userId)!.userBets.length >= this.options.maxCountBets!) {
            throw new Error(`Максимальное кол-во ставок за раунд: ${ this.options.maxCountBets }.`);
        }
    }

    private async waiting() {
        this.emit(MAIN_EVENTS.ROULETE_WAITING);
        this.emit(MAIN_EVENTS.CHANGE_STATE);
        console.debug('Ожидание игроков...');
    }

    private async timerStart() {
        this.state = RouleteState.TIMER_START;
        this.emit(MAIN_EVENTS.CHANGE_STATE); // сделать сетте
        console.debug('Отсчет времени до старта...');
        this.rouleteProps.timerStart = new Date().getTime();
        this.emit(MAIN_EVENTS.ROULETE_TIMER_START);
        await delay(this.options.timeToStart! * 1000);
        this.chooseWinner();
        this.wheelStart();
    }

    private async wheelStart() {
        this.state = RouleteState.WHEEL_START;
        this.rouleteProps.wheelStartTime = new Date().getTime();
        this.emit(MAIN_EVENTS.CHANGE_STATE);
        this.emit(MAIN_EVENTS.ROULETE_WHEEL_START);
        console.debug('Прокручивание рулетки...');

        await delay(this.options.timeWheelRotation! * 1000);
        this.finish();
    }

    private async finish() {
        this.emit(MAIN_EVENTS.ROULETE_FINISH, { props: { ...this.rouleteProps } });
        this.emit(MAIN_EVENTS.CHANGE_STATE);
        console.debug('Финиш...');

        this.rouleteProps.finishStartTime = new Date().getTime();
        await delay(this.options.timeToWaiting! * 1000);

        this.resetGame();
        this.waiting();
    }

    private resetGame() {
        this.rouleteProps = {
            winPercent: undefined,
            offset: undefined,
            profit: undefined,
            winAmount: undefined,
            winnerTicket: undefined,
            winnerBet: undefined,
            finishStartTime: undefined,
            timerStart: undefined,
            wheelStartTime: undefined,
            totalAmount: 0,
        };
        this.bets.clear();
        this.emit(MAIN_EVENTS.RESET_GAME);
        this.emit(MAIN_EVENTS.CHANGE_STATE);
    }

    public resetAllPercent(): void {
        this.bets.forEach((bet: UserBets) => {
            bet.percent = 100 * (bet.allAmount / this.rouleteProps.totalAmount!);
        });
    }

    private chooseWinner() {
        const ticketsArray: Array<number[]> = [];
        let weights: number[] = [];
        let winnerTickets: number[] = [];

        /** Формирую массивы весов и тикетов */
        for (const [userId, bet] of this.bets) {
            const userTickets: number[] = [];
            let weight = bet.percent! / 100;

            bet.userBets.forEach((betUser: Bet) => {
                userTickets.push(betUser.startTicket!, betUser.endTicket!);
            });

            ticketsArray.push(userTickets);

            weights.push(weight);
        }

        weights = resetAllWeight(weights);

        if (this.rouleteProps.winnerBet) {
            return;
        }

        winnerTickets = randomChoice(ticketsArray, weights);

        for (const [userId, bet] of this.bets) {
            for (const userBet of bet.userBets) {
                if (userBet.startTicket! >= winnerTickets[0] && userBet.endTicket! <= winnerTickets[1]) {
                    this.rouleteProps.winnerBet = { ...bet };
                    this.rouleteProps.winnerTicket = getIntRandomInRange(winnerTickets[0], winnerTickets[1]);
                    this.rouleteProps.offset = findOffset(this.bets, bet.owner.id);
                    this.rouleteProps.winAmount = bet.allAmount + ((this.rouleteProps.totalAmount! - bet.allAmount) * (1 - this.options.commission!));

                    this.rouleteProps.profit = this.rouleteProps.totalAmount! - this.rouleteProps.winAmount;
                    this.rouleteProps.winPercent = bet.percent!;
                    return;
                }
            }
        }
    }

    public init({
                    gameId, state, bets, rouleteProps,
                }: { gameId: string; state: RouleteState, bets: Bets | undefined, rouleteProps?: RouleteProps }) {
        if (rouleteProps && rouleteProps.gameId === gameId) {
            this.rouleteProps = rouleteProps;
            this.bets = bets!;
        } else {
            this.resetGame();
            this.rouleteProps.gameId = gameId;
        }
        this.state = state;
        this.resetAllPercent();
        switch (this.state) {
            case RouleteState.WAITING:
                this.waiting();
                break;

            case RouleteState.TIMER_START:
                this.timerStart();
                break;

            case RouleteState.WHEEL_START:
                this.wheelStart();
                break;

            case RouleteState.FINISH:
                this.finish();
                break;

            default:
                break;
        }
    }

    public getBets(): ResultBets[] {
        const result: ResultBets[] = [];
        Array.from(this.bets).reduce((obj, [key, value]) => {
            const copyOwner = {...value.owner};
            const copyValue = {...value, owner: copyOwner};

            result.push({ userId: key, value: copyValue });
            return obj;
        }, {});
        return result;
    }


    public getState(): TGetState | undefined {
        const body: TGetState = {
            state: this.state,
            offset: null,
            time: null,
            bets: this.getBets(),
            gameId: this.rouleteProps.gameId!,
            totalAmount: this.rouleteProps.totalAmount!,
        };
        switch (this.state) {
            case RouleteState.WAITING:
                return body;
            case RouleteState.TIMER_START:
                body.time = (this.rouleteProps.timerStart) ? new Date().getTime() - this.rouleteProps.timerStart : null;
                return body;
            case RouleteState.WHEEL_START:
                body.offset = this.rouleteProps.offset!;
                body.time = (this.rouleteProps.wheelStartTime) ? new Date().getTime() - this.rouleteProps.wheelStartTime : null;
                return body;
            case RouleteState.FINISH:
                body.time = (this.rouleteProps.finishStartTime) ? new Date().getTime() - this.rouleteProps.finishStartTime : null;
                body.offset = this.rouleteProps.offset!;
                body.winnerBet = this.rouleteProps.winnerBet!;
                body.winAmount = toDigits(this.rouleteProps.winAmount!);
                return body;
            default:
                break;
        }
    }
}