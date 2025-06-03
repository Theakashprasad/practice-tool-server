import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('contacts')
export class Contact {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    firstName: string;

    @Column({ type: 'varchar', length: 100 })
    lastName: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    title: string;

    @Column({ type: 'jsonb', nullable: true })
    emails: Array<{
        address: string;
        description?: string;
        isDefault?: boolean;
    }>;

    @Column({ type: 'jsonb', nullable: true })
    phones: Array<{
        number: string;
        description?: string;
        isDefault?: boolean;
        isSmsDefault?: boolean;
    }>;

    @Column({ type: 'date', nullable: true })
    dob: Date;

    @Column('simple-array', { nullable: true })
    clientGroupIds: string[] | null;

    @Column('simple-array', { nullable: true })
    clientEntityIds: string[] | null;

    @Column({ type: 'jsonb', nullable: true })
    permissions: Array<{
        group: string;
        entity: string;
        permission: string;
    }>;

    @Column({ type: 'text', nullable: true })
    comments: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 