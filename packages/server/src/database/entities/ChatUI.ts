/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Bot } from './Bot'

export enum ChatUITheme {
    LIGHT = 'LIGHT',
    DARK = 'DARK',
    AUTO = 'AUTO'
}

export enum WidgetPosition {
    BOTTOM_RIGHT = 'BOTTOM_RIGHT',
    BOTTOM_LEFT = 'BOTTOM_LEFT',
    TOP_RIGHT = 'TOP_RIGHT',
    TOP_LEFT = 'TOP_LEFT'
}

@Entity()
export class ChatUI {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    botId: string

    @ManyToOne(() => Bot, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'botId' })
    bot: Bot

    // Theme Configuration
    @Column({ type: 'varchar', length: 20, default: ChatUITheme.LIGHT })
    theme: ChatUITheme

    @Column({ nullable: true, type: 'text' })
    primaryColor?: string

    @Column({ nullable: true, type: 'text' })
    secondaryColor?: string

    @Column({ nullable: true, type: 'text' })
    backgroundColor?: string

    @Column({ nullable: true, type: 'text' })
    textColor?: string

    @Column({ nullable: true, type: 'text' })
    fontFamily?: string

    @Column({ nullable: true, type: 'text' })
    borderRadius?: string

    @Column({ nullable: true, type: 'text' })
    boxShadow?: string

    // Widget Configuration
    @Column({ type: 'varchar', length: 20, default: WidgetPosition.BOTTOM_RIGHT })
    position: WidgetPosition

    @Column({ nullable: true, type: 'text' })
    iconUrl?: string

    @Column({ nullable: true, type: 'text' })
    greeting?: string

    @Column({ nullable: true, type: 'text' })
    quickReplies?: string // JSON string for quick reply buttons

    // Chat Configuration
    @Column({ nullable: true, type: 'text' })
    bubbleStyle?: string // JSON string for message bubble styles

    @Column({ nullable: true, type: 'text' })
    avatarUrl?: string

    @Column({ default: true })
    showTypingIndicator: boolean

    @Column({ default: true })
    showTimestamp: boolean

    @Column({ default: true })
    enableFileUpload: boolean

    @Column({ default: true })
    enableMarkdown: boolean

    // Accessibility
    @Column({ default: true })
    highContrast: boolean

    @Column({ default: true })
    screenReaderSupport: boolean

    @Column({ nullable: true, type: 'text' })
    ariaLabel?: string

    // Embed Configuration
    @Column({ nullable: true, type: 'text' })
    embedCode?: string

    @Column({ nullable: true, type: 'text' })
    version?: string

    @Column({ default: false })
    isProduction: boolean

    @Column({ nullable: true })
    workspaceId?: string

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    createdDate: Date

    @Column({ type: 'timestamp' })
    @UpdateDateColumn()
    updatedDate: Date
}

