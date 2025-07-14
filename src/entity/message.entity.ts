import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.sentMessages, { eager: true })
    @JoinColumn({ name: 'senderId' }) // 👈 permet d’avoir senderId dans la table
    sender: User;

    @ManyToOne(() => User, (user) => user.receivedMessages, { nullable: true })
    @JoinColumn({ name: 'receiverId' }) // 👈 permet d’avoir receiverId dans la table
    receiver: User;

    @Column()
    senderId: number;

    @Column({ nullable: true })
    receiverId: number;
}
