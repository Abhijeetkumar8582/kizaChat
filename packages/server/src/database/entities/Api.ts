/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { ApiRequest } from './ApiRequest'

export enum AuthType {
    NONE = 'NONE',
    BEARER = 'BEARER',
    API_KEY = 'API_KEY',
    OAUTH2 = 'OAUTH2'
}

@Entity()
export class Api {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ nullable: true, type: 'text' })
    description?: string

    @Column()
    baseUrl: string

    @Column({ type: 'varchar', length: 20, default: AuthType.NONE })
    authType: AuthType

    @Column({ nullable: true, type: 'text' })
    authConfig?: string // JSON string for auth configuration

    @Column({ nullable: true, type: 'text' })
    defaultHeaders?: string // JSON string for default headers

    @Column({ nullable: true, type: 'text' })
    environmentBindings?: string // JSON string for environment variables

    @Column({ nullable: true, type: 'text' })
    tags?: string // JSON string for tags

    @Column({ nullable: true })
    workspaceId?: string

    @OneToMany(() => ApiRequest, (request) => request.api, { cascade: true })
    requests: ApiRequest[]

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    createdDate: Date

    @Column({ type: 'timestamp' })
    @UpdateDateColumn()
    updatedDate: Date
}

