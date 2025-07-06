import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Deal } from './deal.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, unique: true })
    name: string;

    @OneToMany(() => Deal, (deal) => deal.category)
    deals: Deal[];
}
