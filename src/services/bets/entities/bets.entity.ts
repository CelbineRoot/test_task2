import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import RouleteGamesEntity from "../../roulete/entities/roulete-games.entity";
import UsersEntity from "../../users/entities/users.entity";

@Entity()
export class BetsEntity {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column()
    amount: number;

    @Column({name: 'start_ticket'})
    startTicket: number;

    @ManyToOne(() => RouleteGamesEntity, (roulete) => roulete.bets)
    game: RouleteGamesEntity;

    @Column({ name: 'end_ticket', nullable: true })
    endTicket: number;

    @ManyToOne(() => UsersEntity, (user) => user.bets)
    user: UsersEntity;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt?: Date;
}
