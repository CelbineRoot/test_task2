import { Injectable, Logger } from '@nestjs/common';
import {BetsRepository} from "./repository/bets.repository";
import {CreateBetDto} from "./dto";
import {DataSource} from "typeorm";
import UsersEntity from "../users/entities/users.entity";
import {RouleteService} from "../roulete/roulete.service";
import {NewBet} from "../../constants";

@Injectable()
export class BetsService {
  private readonly logger = new Logger(BetsService.name);

  constructor(
      private betsRepository: BetsRepository,
      private dataSource: DataSource,
      private rouleteService: RouleteService,
  ) {}


  async bet(
      createBetDto: CreateBetDto
  ) {
      console.log(createBetDto)
    const queryRunner = this.dataSource.createQueryRunner();
      console.log(1)
    await queryRunner.connect();
    await queryRunner.startTransaction();
      console.log(2)
    try {
      const user = await queryRunner.manager.findOne(UsersEntity, {
        where: {
          id: createBetDto.userId
        },
        lock: { mode: 'pessimistic_write' }
      });

      if(!user) {
        throw new Error('Пользователь не найден')
      }

      if (user!.balance < createBetDto.amount) {
        throw new Error('Недостаточно баланса!');
      }

      await queryRunner.manager.decrement(UsersEntity, {id: createBetDto.userId}, 'balance', createBetDto.amount);

      await this.rouleteService.addBet(
          user!.id,
          {
            amount: createBetDto.amount,
          },
          {
            id: user!.id,
            img: user!.img,
            name: user!.name,
            winPercent: user!.winPercent
          })

      await queryRunner.commitTransaction();
    } catch (err) {
        console.error(err)
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

   // this.logger.debug('response', response);
   // return response;
  }

  async createBet(data: NewBet) {
    console.log(data)
    return this.betsRepository.createNewBet(data)
  }

  async getRawBets(gameId: string) {
    return this.betsRepository.getRawBets(gameId);
  }


}
