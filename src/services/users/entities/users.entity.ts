import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {BetsEntity} from "../../bets/entities/bets.entity";

@Entity()
export default class UsersEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', { default: 0, precision: 9, scale: 2 })
    balance: number;

    @Column()
    img: string;

    @Column()
    name: string;

    @Column({ name: 'win_percent', default: 0, nullable: true })
    winPercent?: number;

    @OneToMany(() => BetsEntity, (bets) => bets.user)
    bets?: BetsEntity[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt?: Date;
}