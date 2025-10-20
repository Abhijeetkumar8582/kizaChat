/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { ApiRequest } from './ApiRequest'

export enum ExecutionStatus {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    TIMEOUT = 'TIMEOUT',
    CANCELLED = 'CANCELLED'
}

@Entity()
export class ApiExecution {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    requestId: string

    @ManyToOne(() => ApiRequest, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'requestId' })
    request: ApiRequest

    @Column({ type: 'varchar', length: 20 })
    status: ExecutionStatus

    @Column({ nullable: true })
    statusCode?: number

    @Column({ nullable: true, type: 'text' })
    responseHeaders?: string // JSON string for response headers

    @Column({ nullable: true, type: 'text' })
    responseBody?: string

    @Column({ nullable: true, type: 'text' })
    errorMessage?: string

    @Column({ nullable: true })
    latency?: number // Response time in milliseconds

    @Column({ nullable: true })
    responseSize?: number // Response size in bytes

    @Column({ nullable: true, type: 'text' })
    testResults?: string // JSON string for test results

    @Column({ nullable: true, type: 'text' })
    variables?: string // JSON string for variables used

    @Column({ nullable: true })
    workspaceId?: string

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    executedDate: Date
}

