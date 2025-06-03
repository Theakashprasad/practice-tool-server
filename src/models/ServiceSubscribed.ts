import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ServiceType } from './ServiceType';
import { Client } from './Client';

export enum ServiceFrequency {
    WEEKLY = 'Weekly',
    BIWEEKLY = 'Bi-weekly',
    SEMIMONTHLY = 'Semi-Monthly',
    MONTHLY = 'Monthly',
    QUARTERLY = 'Quarterly',
    SEMIANNUAL = 'Semi-Annual',
    ANNUAL = 'Annual',
    CASUAL = 'Casual',
}

@Entity('services_subscribed')
export class ServiceSubscribed {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => ServiceType, { nullable: false })
    type: ServiceType;

    @Column({ type: 'uuid' })
    clientId: string;

    @ManyToOne(() => Client, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clientId' })
    client: Client;

    @Column({ type: 'enum', enum: ServiceFrequency })
    frequency: ServiceFrequency;

    @Column({ type: 'date', nullable: true })
    reportingDate: Date;

    @Column({ type: 'date', nullable: true })
    dueDate: Date;

    @Column({ type: 'boolean', default: false })
    nonBillable: boolean;

    @Column({ type: 'boolean', default: false })
    packageBilled: boolean;

    @Column({ type: 'numeric', nullable: true })
    mrr: number;

    @Column({ type: 'date', nullable: true })
    serviceStartDate: Date;

    @Column({ type: 'date', nullable: true })
    serviceEndDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 