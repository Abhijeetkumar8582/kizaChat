/* eslint-disable */
import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Solution } from './Solution'

@Entity()
export class Bot {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ nullable: true, type: 'text' })
    description?: string

    @Column({ nullable: true, type: 'text' })
    workspaceId?: string

    @OneToMany(() => Solution, solution => solution.bot)
    solutions: Solution[]

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    createdDate: Date

    @Column({ type: 'timestamp' })
    @UpdateDateColumn()
    updatedDate: Date
}

