import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { ClientGroup } from './ClientGroup';
import { Industry } from './Industry';
import { ServiceSubscribed } from './ServiceSubscribed';
import { Contact } from './Contact';
import { Tool } from './Tool';

// Enums for the client entity
export enum ClientStructure {
    INDIVIDUAL = 'Ind',
    CORPORATION = 'Corp',
    CHARITY = 'Charity',
    OTHER = 'Other'
}

export enum ClientStatus {
    PROSPECT = 'Prospect',
    CURRENT = 'Current',
    DORMANT = 'Dormant',
    CEASED = 'Ceased'
}

export enum AccountingSystem {
    XERO = 'Xero',
    QBO = 'QBO',
    NONE = 'None',
    OTHER = 'Other'
}

// Interface for tax ID
interface TaxID {
    id: string;
    type: string;
    number: string;
    description: string;
}

@Entity('clients')
export class Client {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({
        type: 'enum',
        enum: ClientStructure,
        default: ClientStructure.INDIVIDUAL
    })
    structure: ClientStructure;

    @Column({ type: 'uuid' })
    clientGroupId: string;

    @ManyToOne(() => ClientGroup, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'clientGroupId' })
    clientGroup: ClientGroup;

    @Column({ type: 'varchar', length: 255 })
    jurisdiction: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    regId: string;

    @Column({ type: 'date', nullable: true })
    yearEnd: Date;

    @Column({ type: 'jsonb', nullable: true })
    taxIds: TaxID[];

    @Column({
        type: 'enum',
        enum: ClientStatus,
        default: ClientStatus.PROSPECT
    })
    status: ClientStatus;

    @Column({ type: 'date', nullable: true })
    serviceStartDate: Date;

    @Column({ type: 'date', nullable: true })
    serviceEndDate: Date;

    // Staff fields
    @Column({ type: 'varchar', length: 255, nullable: true })
    staffPartnerId: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    staffManager1Id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    staffManager2Id: string;

    @Column('simple-array', { nullable: true })
    staffAccountantIds: string[];

    @Column({ type: 'varchar', length: 255, nullable: true })
    staffBookkeeper1Id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    staffBookkeeper2Id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    staffTaxSpecialistId: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    staffOther1Id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    staffOther2Id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    staffOther3Id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    staffOther4Id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    staffOther5Id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    staffAdmin1Id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    staffAdmin2Id: string;

    @Column({ type: 'uuid', nullable: true })
    industryId: string;

    @ManyToOne(() => Industry, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'industryId' })
    industry: Industry;

    @Column({
        type: 'enum',
        enum: AccountingSystem,
        default: AccountingSystem.NONE
    })
    accountingSystem: AccountingSystem;

    @Column({ type: 'varchar', length: 255, nullable: true })
    serviceLevel: string;

    @Column({ type: 'text', nullable: true })
    comments: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    linkType: string;

    @OneToMany(() => ServiceSubscribed, service => service.client)
    subscribedServices: ServiceSubscribed[];

    @Column('simple-array', { nullable: true })
    contactIds: string[];

    @ManyToMany(() => Contact)
    @JoinTable({
        name: 'client_contacts',
        joinColumn: { name: 'client_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'contact_id', referencedColumnName: 'id' }
    })
    contacts: Contact[];

   
    @JoinTable({
        name: 'tool_client_entity_map',
        joinColumn: { name: 'client_entity_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tool_id', referencedColumnName: 'id' }
    })
    tools: Tool[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    constructor(partial: Partial<Client>) {
        Object.assign(this, partial);
    }
} 