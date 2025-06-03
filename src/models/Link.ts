import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('links')
export class Link {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    entity: string;

    @Column({ type: 'varchar', length: 100 })
    linkType: string;

    @Column({ type: 'varchar', length: 500 })
    url: string;

    @Column({ type: 'boolean', default: false })
    showToClient: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 