import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Practice } from './Practice';

@Entity('client_groups')
export class ClientGroup {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'uuid', nullable: true })
    practice_id: string | null;

    @ManyToOne(() => Practice, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'practice_id' })
    practice: Practice;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    constructor(partial: Partial<ClientGroup>) {
        Object.assign(this, partial);
    }
} 