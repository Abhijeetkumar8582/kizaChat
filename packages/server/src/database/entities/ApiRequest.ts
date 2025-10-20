/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Api } from './Api'

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS'
}

@Entity()
export class ApiRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ nullable: true, type: 'text' })
    description?: string

    @Column({ type: 'varchar', length: 10 })
    method: HttpMethod

    @Column()
    path: string

    @Column({ nullable: true, type: 'text' })
    headers?: string // JSON string for headers

    @Column({ nullable: true, type: 'text' })
    params?: string // JSON string for query parameters

    @Column({ nullable: true, type: 'text' })
    body?: string // Request body content

    @Column({ nullable: true, type: 'text' })
    tests?: string // JSON string for test assertions

    @Column({ nullable: true, type: 'text' })
    variables?: string // JSON string for request variables

    @Column({ nullable: true, type: 'text' })
    version?: string

    @Column({ nullable: true, type: 'text' })
    changelog?: string

    @Column({ type: 'integer', default: 0 })
    executionOrder: number // Order in which this request should be executed in a collection

    @Column()
    apiId: string

    @ManyToOne(() => Api, (api) => api.requests, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'apiId' })
    api: Api

    @Column({ nullable: true })
    workspaceId?: string

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    createdDate: Date

    @Column({ type: 'timestamp' })
    @UpdateDateColumn()
    updatedDate: Date
}

