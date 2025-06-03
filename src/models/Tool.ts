import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Practice } from './Practice';
import { Client } from './Client';

export enum ToolStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    ARCHIVED = 'Archived'
}

@Entity('tools')
export class Tool {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 100 })
    category: string;

    @Column({ type: 'text' })
    executionUrl: string;

    @Column({ type: 'text', nullable: true })
    startingPrompt: string;

    @Column({ type: 'boolean', default: false })
    sessionMemory: boolean;

    @Column({ type: 'uuid' })
    createdById: string;

    @Column({
        type: 'enum',
        enum: ToolStatus,
        default: ToolStatus.ACTIVE
    })
    status: ToolStatus;

    @ManyToMany(() => Practice)
    @JoinTable({
        name: 'tool_practice_map',
        joinColumn: { name: 'tool_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'practice_id', referencedColumnName: 'id' }
    })
    practices: Practice[];

    @ManyToMany(() => Client)
    @JoinTable({
        name: 'tool_client_entity_map',
        joinColumn: { name: 'tool_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'client_entity_id', referencedColumnName: 'id' }
    })
    clients: Client[];

    @OneToMany(() => ToolSession, session => session.tool)
    sessions: ToolSession[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    constructor(partial: Partial<Tool>) {
        Object.assign(this, partial);
    }
}

@Entity('tool_sessions')
export class ToolSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    toolId: string;

    @ManyToOne(() => Tool, tool => tool.sessions)
    @JoinColumn({ name: 'toolId' })
    tool: Tool;

    // @Column({ type: 'uuid' })
    // userId: string;

    @Column({ type: 'jsonb', nullable: true })
    contextMeta: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    sessionData: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    constructor(partial: Partial<ToolSession>) {
        Object.assign(this, partial);
    }
} 