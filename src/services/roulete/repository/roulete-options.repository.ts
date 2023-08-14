import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import RouleteOptionsEntity from "../entities/roulete-options.entity";
import {Repository} from "typeorm";

@Injectable()
export class RouleteOptionsRepository {
    constructor(
        @InjectRepository(RouleteOptionsEntity)
        private readonly rouleteOptionsRepository: Repository<RouleteOptionsEntity>
    ) {}

    public async findOptions() {
        return this.rouleteOptionsRepository.find();
    }
}