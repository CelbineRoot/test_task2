import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {RouleteState} from "../../../constants";
import {BetsEntity} from "../../bets/entities/bets.entity";

@Entity()
export default class RouleteGamesEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', {
        default: 0, precision: 9, scale: 2, nullable: true,
    })
    profit?: number;

    @Column('decimal', {
        default: 0, precision: 9, scale: 2, nullable: true,
    })
    totalAmount?: number;

    @Column('decimal', { default: 0, precision: 9, scale: 2 })
    commissionPercent: number;

    @Column('decimal', {
        default: 0, precision: 9, scale: 2, nullable: true,
    })
    offset?: number;

    @Column('integer', { nullable: true })
    winnerTicket?: number;

    @Column('decimal', { default: 0, precision: 9, scale: 2, nullable: true })
    winAmount?: number;

    @Column('integer', { default: RouleteState.WAITING, nullable: true })
    state: number;

    @Column('decimal', { nullable: true, precision: 20, scale: 18 })
    winPercent?: number;

    @Column('uuid', { nullable: true })
    winnerId?: string;

    @OneToMany(() => BetsEntity, (bets) => bets.game)
    bets?: BetsEntity[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt?: Date;
}
