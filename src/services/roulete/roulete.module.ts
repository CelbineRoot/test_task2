import {forwardRef, Global, Module} from "@nestjs/common";
import {RouleteService} from "./roulete.service";
import {RouleteGateway} from "./roulete.gateway";
import {RouleteGamesRepository} from "./repository/roulete-games.repository";
import {RouleteOptionsRepository} from "./repository/roulete-options.repository";
import {TypeOrmModule} from "@nestjs/typeorm";
import RouleteGamesEntity from "./entities/roulete-games.entity";
import RouleteOptionsEntity from "./entities/roulete-options.entity";
import {UsersModule} from "../users/users.module";
import {BetsModule} from "../bets/bets.module";
import {RouleteController} from "./roulete.controller";

@Module({
    controllers: [RouleteController],
    imports: [forwardRef(() => BetsModule), forwardRef(() => UsersModule), TypeOrmModule.forFeature([RouleteGamesEntity, RouleteOptionsEntity])],
    providers: [RouleteGateway, RouleteService, RouleteGamesRepository, RouleteOptionsRepository],
    exports: [RouleteService, RouleteGateway],
})
export class RouleteModule {
}