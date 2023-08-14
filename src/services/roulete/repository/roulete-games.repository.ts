import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import RouleteGamesEntity from "../entities/roulete-games.entity";
import {Not, Repository} from "typeorm";
import {RouleteGame} from "../roulete.game";
import {RouleteProps, RouleteState} from "../../../constants";

@Injectable()
export class RouleteGamesRepository {
    constructor(
        @InjectRepository(RouleteGamesEntity)
        private readonly rouleteGamesRepository: Repository<RouleteGamesEntity>
    ) {}

    public getLastRunningGame() {
        return this.rouleteGamesRepository.findOne({
            where: {
                state: Not(RouleteState.FINISH)
            }
        });
    }

    public createNewGame() {
        const newGame = this.rouleteGamesRepository.create();
        return this.rouleteGamesRepository.save(newGame);
    }

    public updateState(observer: RouleteGame) {
        const rouleteProps = observer.rouleteProps;

        return this.rouleteGamesRepository.createQueryBuilder()
            .update(RouleteGamesEntity)
            .set({
                winnerTicket: rouleteProps.winnerTicket!,
                winAmount: rouleteProps.winAmount!,
                // @ts-ignore
                winnerId: (rouleteProps.winnerBet) ? rouleteProps.winnerBet.owner.id : null,
                state: observer.state,
            })
            .where('id = :gameId', { gameId: observer.rouleteProps.gameId })
            .execute();
    }

    public updateGame({
                          gameId, winAmount, offset, profit, winnerTicket, winnerBet, totalAmount, winPercent,
                      }: RouleteProps, state: RouleteState) {
        return this.rouleteGamesRepository.createQueryBuilder()
            .update(RouleteGamesEntity)
            .set({
                offset,
                profit,
                state,
                totalAmount,
                winAmount,
                winPercent,
                winnerId: winnerBet!.owner.id,
                winnerTicket,
            })
            .where('id = :gameId', { gameId })
            .execute();
    }
}