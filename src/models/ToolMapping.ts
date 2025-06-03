// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
// import { Tool } from './Tool';
// import { Practice } from './Practice';
// import { Client } from './Client';

// @Entity('tool_practice_map')
// export class ToolPracticeMap {
//     @PrimaryGeneratedColumn('uuid')
//     id: string;

//     @Column({ type: 'uuid' })
//     toolId: string;

//     @Column({ type: 'uuid' })
//     practiceId: string;

//     @ManyToOne(() => Tool)
//     @JoinColumn({ name: 'toolId' })
//     tool: Tool;

//     @ManyToOne(() => Practice)
//     @JoinColumn({ name: 'practiceId' })
//     practice: Practice;
// }

// @Entity('tool_client_entity_map')
// export class ToolClientEntityMap {
//     @PrimaryGeneratedColumn('uuid')
//     id: string;

//     @Column({ type: 'uuid' })
//     toolId: string;

//     @Column({ type: 'uuid' })
//     clientEntityId: string;

//     @ManyToOne(() => Tool)
//     @JoinColumn({ name: 'toolId' })
//     tool: Tool;

//     @ManyToOne(() => Client)
//     @JoinColumn({ name: 'clientEntityId' })
//     client: Client;
// } 