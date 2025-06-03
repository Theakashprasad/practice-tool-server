import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import type { User } from './userModel';
import { ClientGroup } from './ClientGroup';
import { Tool } from './Tool';

@Entity('practices')
export class Practice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 3 })
    currency: string;

    @Column('simple-array', { nullable: true })
    clientGroupIds: string[] | null;

    // Staff positions with relationships
    @Column({ type: 'int', nullable: true })
    staffPartnerId: number | null;

    // Virtual field for populated data
    staffPartner?: User;

    @Column({ type: 'int', nullable: true })
    staffManager1Id: number | null;

    // Virtual field for populated data
    staffManager1?: User;

    @Column({ type: 'int', nullable: true })
    staffManager2Id: number | null;

    // Virtual field for populated data
    staffManager2?: User;

    @Column('simple-array', { nullable: true })
    staffAccountantIds: number[] | null;

    // Virtual field for populated data
    staffAccountants?: User[];

    @Column({ type: 'int', nullable: true })
    staffBookkeeper1Id: number | null;

    // Virtual field for populated data
    staffBookkeeper1?: User;

    @Column({ type: 'int', nullable: true })
    staffBookkeeper2Id: number | null;

    // Virtual field for populated data
    staffBookkeeper2?: User;

    @Column({ type: 'int', nullable: true })
    staffTaxSpecialistId: number | null;

    // Virtual field for populated data
    staffTaxSpecialist?: User;

    @Column({ type: 'int', nullable: true })
    staffOther1Id: number | null;

    // Virtual field for populated data
    staffOther1?: User;

    @Column({ type: 'int', nullable: true })
    staffOther2Id: number | null;

    // Virtual field for populated data
    staffOther2?: User;

    @Column({ type: 'int', nullable: true })
    staffOther3Id: number | null;

    // Virtual field for populated data
    staffOther3?: User;

    @Column({ type: 'int', nullable: true })
    staffOther4Id: number | null;

    // Virtual field for populated data
    staffOther4?: User;

    @Column({ type: 'int', nullable: true })
    staffOther5Id: number | null;

    // Virtual field for populated data
    staffOther5?: User;

    @Column({ type: 'int', nullable: true })
    staffAdmin1Id: number | null;

    // Virtual field for populated data
    staffAdmin1?: User;

    @Column({ type: 'int', nullable: true })
    staffAdmin2Id: number | null;

    // Virtual field for populated data
    staffAdmin2?: User;

    @OneToMany(() => ClientGroup, clientGroup => clientGroup.practice)
    clientGroups: ClientGroup[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    constructor(partial: Partial<Practice>) {
        Object.assign(this, partial);
    }
} 