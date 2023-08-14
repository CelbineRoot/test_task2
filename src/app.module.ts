import {Module} from '@nestjs/common';
import {ConfigurationModule} from './modules/config/config.module';
import {BetsModule} from './services/bets/bets.module';
import {RouleteModule} from "./services/roulete/roulete.module";
import {UsersModule} from "./services/users/users.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {appConfig} from "./modules/config/config";
import { ConfigType } from '@nestjs/config';

@Module({
    imports: [
        ConfigurationModule,
        TypeOrmModule.forRootAsync({
            // @ts-ignore
            useFactory: async (config: ConfigType<typeof appConfig>) => ({
                type: 'postgres',
                host: config.dbHost,
                port: config.dbPort,
                username: config.dbUsername,
                password: config.dbPassword,
                database: config.dbName,
                autoLoadEntities: true,
                synchronize: true,
            }),
            inject: [appConfig.KEY]
        }),
         RouleteModule, UsersModule, BetsModule],
})
export class AppModule {
}
