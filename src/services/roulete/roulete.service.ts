import {forwardRef, Inject, Injectable, Logger, OnModuleInit, Scope} from "@nestjs/common";
import {RouleteOptionsRepository} from "./repository/roulete-options.repository";
import {RouleteGamesRepository} from "./repository/roulete-games.repository";
import RouleteOptionsEntity from "./entities/roulete-options.entity";
import {RouleteGame} from "./roulete.game";
import {Bets, MAIN_EVENTS, RouleteProps, RouleteState, Owner, Bet, PUB_EVENTS} from "../../constants";
// @ts-ignore
import randomColor from 'random-color';
import {BetsService} from "../bets/bets.service";
import {UsersService} from "../users/users.service";
import {BetsEntity} from "../bets/entities/bets.entity";
import {RouleteGateway} from "./roulete.gateway";

@Injectable({ scope: Scope.DEFAULT })
export class RouleteService implements OnModuleInit {
    private running: boolean;
    private logger: Logger;
    private options: RouleteOptionsEntity | null;
    private game: RouleteGame | null;

    constructor(
        private rouleteOptionsRepository: RouleteOptionsRepository,
        private rouleteGamesRepository: RouleteGamesRepository,
        private usersService: UsersService,
        @Inject(forwardRef(() => BetsService))
        private betsService: BetsService,
        private wsGateway: RouleteGateway,
    ) {
        this.running = false;
        this.logger = new Logger(RouleteGame.name);
        this.options = null;
        this.game = null;
    }

    onModuleInit() {
        this.initialize().catch(this.logger.error);
    }

    public async initialize(): Promise<void> {
        try {
            if(this.running) {
                throw new Error('Игра уже инициализированна');
            }

            this.running = true;

            const options = await this.rouleteOptionsRepository.findOptions(); // получаем список комнат

            if (!options || !options[0]) {
                throw new Error('Нет созданных настроек.');
            }

            this.options = options[0]

            const game = this.createGame();

            await game;

        } catch (error) {
            this.logger.error(error);
        }
    }

    private async createGame() {
        const game = new RouleteGame();

        game.initialization({ ...this.options });

        this.observe(game);

        this.game = game;

        const {
            bets, rouleteProps,
        } = await this.getGameProps() || {}; // получаем пропсы

        const gameId = (rouleteProps && rouleteProps.gameId) ? rouleteProps.gameId : (await this.rouleteGamesRepository.createNewGame()).id; // получаем gameId
        const state = (rouleteProps && rouleteProps.state) ? rouleteProps.state : RouleteState.WAITING; // получаем текущий стейт

        if (state !== RouleteState.FINISH) {

            this.game.init({
                bets, gameId, rouleteProps, state,
            });

        } else {
            this.game.init({bets, gameId, state});
        }
    }

    private observe(observer: RouleteGame) {
        observer
            .on(MAIN_EVENTS.ADD_BET, async ({ bet, userId }) => {
            await this.betsService.createBet({
                amount: bet.amount,
                endTicket: bet.endTicket,
                gameId: bet.gameId,
                startTicket: bet.startTicket,
                userId: userId
            });

                this.wsGateway.sendEventToClients(PUB_EVENTS.ADD_BET, { bets: observer.getBets() });
                this.wsGateway.sendEventToClients(PUB_EVENTS.GAME_BALANCE_CHANGE, { balance: observer.rouleteProps.totalAmount });
        })
            .on(MAIN_EVENTS.ROULETE_FINISH, async (_: RouleteProps) => {

                await this.rouleteGamesRepository.updateGame({ ...observer.rouleteProps }, observer.state);

                observer.state = RouleteState.FINISH;

                await this.usersService.addBalance(observer.rouleteProps.winnerBet!.owner.id, observer.rouleteProps.winAmount!);

                this.wsGateway.sendEventToClients(PUB_EVENTS.CHANGE_STATE, {...observer.getState(),});
            })
            .on(MAIN_EVENTS.ROULETE_WAITING, async () => {
                if (observer.state === RouleteState.FINISH) {
                    const {id} = await this.rouleteGamesRepository.createNewGame();
                    observer.rouleteProps.gameId = id;
                    observer.state = RouleteState.WAITING;
                }
                this.wsGateway.sendEventToClients(PUB_EVENTS.GAME_BALANCE_CHANGE, {balance: observer.rouleteProps.totalAmount});
                this.wsGateway.sendEventToClients(PUB_EVENTS.CHANGE_STATE, {...observer.getState(),});
            })
            .on(MAIN_EVENTS.ROULETE_TIMER_START, () => {
                this.wsGateway.sendEventToClients(PUB_EVENTS.CHANGE_STATE, {...observer.getState(),})
            })
            .on(MAIN_EVENTS.ROULETE_WHEEL_START, () => {
                this.wsGateway.sendEventToClients(PUB_EVENTS.CHANGE_STATE, {...observer.getState(),})
            })
            .on(MAIN_EVENTS.RESET_GAME, () => {
                this.wsGateway.sendEventToClients(PUB_EVENTS.CHANGE_STATE, {...observer.getState(),})
            })
            .on(MAIN_EVENTS.CHANGE_STATE, async () => {
                await this.rouleteGamesRepository.updateState(observer);
            });
    }

    private async getGameProps() {
        const data = await this.rouleteGamesRepository. getLastRunningGame();

        if (!data) {
            return null;
        }
        
        const rawBets = await this.betsService.getRawBets(data.id);

        const bets = this.serializeBets(rawBets, data.id);

        const rouleteProps: RouleteProps = {
            finishStartTime: null,
            gameId: data.id,
            offset: data.offset,
            profit: data.profit,
            state: data.state,
            timerStart: null,
            totalAmount: (rawBets) ? rawBets.reduce((prev: any, curr: any) => prev + Number(curr.amount), 0) : 0,
            wheelStartTime: null,
            winAmount: data.winAmount,
            winPercent: data.winPercent,
            winnerBet: bets.get(data.winnerId!),
            winnerTicket: data.winnerTicket,
        };

        return {
            bets, rouleteProps,
        };
    }

    public addBet(userId: string, bet: Bet, user: Owner) {
        return this.game?.addBet(userId, bet, user);
    }

    private serializeBets(data: BetsEntity[], gameId: string) {
        const bets: Bets = new Map();

        if (data) {
            data.forEach((bet) => {
                if (!bets.has(bet.user.id)) {
                    bets.set(bet.user.id, {
                        percent: null,
                        color: randomColor(0.6, 0.99).rgb(),
                        allAmount: Number(bet.amount),
                        userBets: [{
                            gameId,
                            amount: Number(bet.amount),
                            startTicket: Number(bet.startTicket),
                            endTicket: Number(bet.endTicket),
                        }],
                        owner: {
                            img: bet.user.img,
                            id: bet.user.id,
                            name: bet.user.name,
                            winPercent: Number(bet.user.winPercent),
                        }
                    });
                } else {
                    bets.get(bet.user.id)!.allAmount += Number(bet.amount);
                    bets.get(bet.user.id)!.userBets.push({
                        gameId,
                        amount: Number(bet.amount),
                        startTicket: Number(bet.startTicket),
                        endTicket: Number(bet.endTicket),
                    });
                }
            });
        }

        return bets;
    }

    public getGame() {
        return {...this.game!.getState()}
    }
}
