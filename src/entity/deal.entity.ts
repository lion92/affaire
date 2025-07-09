import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Category} from './category.entity';

@Entity('deals')
export class Deal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 255, nullable: true })
    imageUrl: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ length: 255, nullable: true })
    dealUrl: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => Category, (category) => category.deals, { eager: true, nullable: true })
    @JoinColumn({ name: 'categoryId' }) // Ajout indispensable
    category: Category;

    @Column({ nullable: true })
    categoryId: number; // Ajout indispensable si tu veux accéder directement à l'ID
}
