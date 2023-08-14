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
export default class RouleteOptionsEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column('integer', { name: 'min_amount', default: 1 })
    minAmount?: number;

    @Column('integer', { name: 'max_amount', default: 10000000 })
    maxAmount?: number;

    @Column('integer', { name: 'max_count_bets', default: 3 })
    maxCountBets?: number;

    @Column('integer', { name: 'time_to_waiting', default: 15 })
    timeToWaiting?: number;

    @Column('integer', { name: 'time_wheel_rotation', default: 8 })
    timeWheelRotation?: number;

    @Column('integer', { name: 'time_to_start', default: 25 })
    timeToStart?: number;

    @Column('boolean', { default: true })
    available?: boolean;

    @Column('decimal', { default: 0.10, precision: 9, scale: 2 })
    commission?: number;
}
