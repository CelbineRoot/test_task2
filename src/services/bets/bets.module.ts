import {forwardRef, Global, Module} from '@nestjs/common';
import {BetsService} from './bets.service';
import {RouleteModule} from "../roulete/roulete.module";
import {BetsRepository} from "./repository/bets.repository";
import {TypeOrmModule} from "@nestjs/typeorm";
import {BetsEntity} from "./entities/bets.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([BetsEntity]),
        forwardRef(() => RouleteModule),
    ],
    providers: [
        BetsService,
        BetsRepository
    ],
    exports: [
        BetsService
    ]
})
export class BetsModule {
}
