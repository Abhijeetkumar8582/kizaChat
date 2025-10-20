/* eslint-disable */
import { Entity as TypeORMEntity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Variable } from './Variable'

@TypeORMEntity()
export class Entity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ nullable: true, type: 'text' })
    description?: string

    @OneToMany(() => Variable, (variable) => variable.entity)
    variables: Variable[]

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    createdDate: Date

    @Column({ type: 'timestamp' })
    @UpdateDateColumn()
    updatedDate: Date

    @Column({ nullable: true, type: 'text' })
    workspaceId?: string
}

