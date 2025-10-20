/* eslint-disable */
import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { IVariable } from '../../Interface'
import { Entity as EntityModel } from './Entity'

@Entity()
export class Variable implements IVariable {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ nullable: true, type: 'text' })
    value: string

    @Column({ default: 'string', type: 'text' })
    type: string

    @Column({ nullable: true })
    entityId?: string

    @ManyToOne(() => EntityModel, (entity) => entity.variables, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'entityId' })
    entity?: EntityModel

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    createdDate: Date

    @Column({ type: 'timestamp' })
    @UpdateDateColumn()
    updatedDate: Date

    @Column({ nullable: true, type: 'text' })
    workspaceId?: string
}
