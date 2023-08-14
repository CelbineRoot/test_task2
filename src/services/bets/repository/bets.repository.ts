import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {BetsEntity} from "../entities/bets.entity";
import {NewBet} from "../../../constants";

@Injectable()
export class BetsRepository {
    constructor(
        @InjectRepository(BetsEntity)
        private readonly betsRepository: Repository<BetsEntity>
    ) {}

    public async getRawBets(gameId: string) {
        return this.betsRepository.find({
            where: { game: {id: gameId} },
            relations: ['user'],
        });
    }

    public async createNewBet({amount, startTicket, gameId, endTicket, userId}: NewBet) {
        return this.betsRepository.save({
            amount,
            startTicket,
            game: {id: gameId},
            endTicket,
            user: {id: userId},
        });
    }
}