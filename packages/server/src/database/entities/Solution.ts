/* eslint-disable */
import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Bot } from './Bot'

export enum SolutionType {
    REGULAR = 'REGULAR',
    ORCHESTRATOR = 'ORCHESTRATOR'
}

@Entity()
export class Solution {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ type: 'varchar', length: 20, default: SolutionType.REGULAR })
    type: SolutionType

    @Column({ nullable: true, type: 'text' })
    description?: string

    @Column({ nullable: true, type: 'text' })
    configuration?: string

    @Column()
    botId: string

    @ManyToOne(() => Bot, bot => bot.solutions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'botId' })
    bot: Bot

    @Column({ nullable: true, type: 'text' })
    workspaceId?: string

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    createdDate: Date

    @Column({ type: 'timestamp' })
    @UpdateDateColumn()
    updatedDate: Date
}

