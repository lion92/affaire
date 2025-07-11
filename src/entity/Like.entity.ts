import {CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import {User} from "./user.entity";
import {Deal} from "./deal.entity";

@Entity()
@Unique(['user', 'deal']) // Un seul like par user et par deal
export class Like {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.likes)
    user: User;

    @ManyToOne(() => Deal, (deal) => deal.likes)
    deal: Deal;

    @CreateDateColumn()
    createdAt: Date;
}
