import {Global, Module} from "@nestjs/common";
import {UsersService} from "./users.service";
import {UsersRepository} from "./repository/users.repository";
import {TypeOrmModule} from "@nestjs/typeorm";
import UsersEntity from "./entities/users.entity";
import {UsersController} from "./users.controller";

@Module({
    imports: [TypeOrmModule.forFeature([UsersEntity])],
    providers: [UsersService, UsersRepository],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}