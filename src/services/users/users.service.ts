import {Injectable} from "@nestjs/common";
import {UsersRepository} from "./repository/users.repository";

@Injectable()
export class UsersService {
    constructor(
        private usersRepository: UsersRepository,
    ) {}

    addBalance(userId: string, amount: number) {
        return this.usersRepository.addBalance(userId, amount);
    }

    createNewRandomUser() {
        return this.usersRepository.createNewRandomUser();
    }

    getAllUsers() {
        return this.usersRepository.getAllUsers();
    }
}