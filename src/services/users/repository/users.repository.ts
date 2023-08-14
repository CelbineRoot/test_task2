import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import UsersEntity from "../entities/users.entity";
import {fakerRU, th} from '@faker-js/faker';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly userRepository: Repository<UsersEntity>
    ) {}

    public async createNewRandomUser() {
        const newUser = this.userRepository.create({
            name: fakerRU.person.fullName(),
            img: fakerRU.internet.avatar(),
            balance: 1000,
        });

        return this.userRepository.save(newUser);
    }

    public async getAllUsers() {
        return this.userRepository.find();
    }

    public async addBalance(userId: string, amount: number) {
        await this.userRepository.increment({id: userId}, 'balance', amount)
    }
}