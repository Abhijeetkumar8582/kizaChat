import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { ChatUI, ChatUITheme, WidgetPosition } from '../../database/entities/ChatUI'
import { Bot } from '../../database/entities/Bot'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'
import logger from '../../utils/logger'

// Get all bots with their ChatUI configurations
const getAllBotsWithChatUI = async (workspaceId?: string) => {
    const appServer = getRunningExpressApp()
    const botRepository = appServer.AppDataSource.getRepository(Bot)
    const chatUIRepository = appServer.AppDataSource.getRepository(ChatUI)
    
    const where: any = {}
    if (workspaceId) {
        where.workspaceId = workspaceId
    }
    
    const bots = await botRepository.find({
        where,
        relations: ['solutions'],
        order: { createdDate: 'DESC' }
    })
    
    // Get ChatUI configurations for each bot
    const botsWithChatUI = await Promise.all(
        bots.map(async (bot) => {
            const chatUI = await chatUIRepository.findOne({
                where: { botId: bot.id }
            })
            
            return {
                ...bot,
                chatUI: chatUI || null
            }
        })
    )
    
    return botsWithChatUI
}

// Get ChatUI configuration for a specific bot
const getChatUIByBotId = async (botId: string) => {
    const appServer = getRunningExpressApp()
    const chatUIRepository = appServer.AppDataSource.getRepository(ChatUI)
    
    const chatUI = await chatUIRepository.findOne({
        where: { botId },
        relations: ['bot']
    })
    
    if (!chatUI) {
        throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Chat UI configuration not found for this bot')
    }
    
    return chatUI
}

// Create or update ChatUI configuration
const saveChatUI = async (botId: string, chatUIData: {
    theme?: ChatUITheme
    primaryColor?: string
    secondaryColor?: string
    backgroundColor?: string
    textColor?: string
    fontFamily?: string
    borderRadius?: string
    boxShadow?: string
    position?: WidgetPosition
    iconUrl?: string
    greeting?: string
    quickReplies?: string
    bubbleStyle?: string
    avatarUrl?: string
    showTypingIndicator?: boolean
    showTimestamp?: boolean
    enableFileUpload?: boolean
    enableMarkdown?: boolean
    highContrast?: boolean
    screenReaderSupport?: boolean
    ariaLabel?: string
    isProduction?: boolean
    workspaceId?: string
}) => {
    const appServer = getRunningExpressApp()
    const chatUIRepository = appServer.AppDataSource.getRepository(ChatUI)
    
    // Check if bot exists
    const botRepository = appServer.AppDataSource.getRepository(Bot)
    const bot = await botRepository.findOneBy({ id: botId })
    if (!bot) {
        throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Bot not found')
    }
    
    // Check if ChatUI already exists
    let chatUI = await chatUIRepository.findOne({
        where: { botId }
    })
    
    if (chatUI) {
        // Update existing configuration
        Object.assign(chatUI, chatUIData)
        chatUI = await chatUIRepository.save(chatUI)
        logger.info(`📝 Updated Chat UI configuration for bot: ${bot.name}`)
    } else {
        // Create new configuration
        chatUI = chatUIRepository.create({
            botId,
            ...chatUIData
        })
        chatUI = await chatUIRepository.save(chatUI)
        logger.info(`📝 Created Chat UI configuration for bot: ${bot.name}`)
    }
    
    return chatUI
}

// Delete ChatUI configuration
const deleteChatUI = async (botId: string) => {
    const appServer = getRunningExpressApp()
    const chatUIRepository = appServer.AppDataSource.getRepository(ChatUI)
    
    const chatUI = await chatUIRepository.findOne({
        where: { botId },
        relations: ['bot']
    })
    
    if (!chatUI) {
        throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Chat UI configuration not found')
    }
    
    await chatUIRepository.remove(chatUI)
    
    logger.info(`🗑️ Deleted Chat UI configuration for bot: ${chatUI.bot.name}`)
}

// Generate embed code for a bot
const generateEmbedCode = async (botId: string, isProduction: boolean = false) => {
    const appServer = getRunningExpressApp()
    const chatUI = await getChatUIByBotId(botId)
    
    const baseUrl = process.env.FLOWISE_PUBLIC_URL || 'http://localhost:3000'
    const version = chatUI.version || '1.0.0'
    
    const embedCode = `
<!-- Flowise Chat Widget -->
<div id="flowise-chat-widget" 
     data-bot-id="${botId}" 
     data-theme="${chatUI.theme.toLowerCase()}"
     data-position="${chatUI.position.toLowerCase()}"
     data-primary-color="${chatUI.primaryColor || '#2196F3'}"
     data-secondary-color="${chatUI.secondaryColor || '#1976D2'}"
     data-background-color="${chatUI.backgroundColor || '#ffffff'}"
     data-text-color="${chatUI.textColor || '#000000'}"
     data-font-family="${chatUI.fontFamily || 'Inter, sans-serif'}"
     data-border-radius="${chatUI.borderRadius || '8px'}"
     data-greeting="${chatUI.greeting || 'Hello! How can I help you today?'}"
     data-icon-url="${chatUI.iconUrl || ''}"
     data-avatar-url="${chatUI.avatarUrl || ''}"
     data-show-typing="${chatUI.showTypingIndicator}"
     data-show-timestamp="${chatUI.showTimestamp}"
     data-enable-file-upload="${chatUI.enableFileUpload}"
     data-enable-markdown="${chatUI.enableMarkdown}"
     data-high-contrast="${chatUI.highContrast}"
     data-aria-label="${chatUI.ariaLabel || 'Chat with our AI assistant'}"
     style="position: fixed; z-index: 9999;">
</div>

<script>
(function() {
    const widget = document.getElementById('flowise-chat-widget');
    if (!widget) return;
    
    const config = {
        botId: widget.dataset.botId,
        theme: widget.dataset.theme,
        position: widget.dataset.position,
        primaryColor: widget.dataset.primaryColor,
        secondaryColor: widget.dataset.secondaryColor,
        backgroundColor: widget.dataset.backgroundColor,
        textColor: widget.dataset.textColor,
        fontFamily: widget.dataset.fontFamily,
        borderRadius: widget.dataset.borderRadius,
        greeting: widget.dataset.greeting,
        iconUrl: widget.dataset.iconUrl,
        avatarUrl: widget.dataset.avatarUrl,
        showTyping: widget.dataset.showTyping === 'true',
        showTimestamp: widget.dataset.showTimestamp === 'true',
        enableFileUpload: widget.dataset.enableFileUpload === 'true',
        enableMarkdown: widget.dataset.enableMarkdown === 'true',
        highContrast: widget.dataset.highContrast === 'true',
        ariaLabel: widget.dataset.ariaLabel
    };
    
    // Load the chat widget script
    const script = document.createElement('script');
    script.src = '${baseUrl}/chat-widget/${version}/flowise-chat.js';
    script.async = true;
    script.onload = function() {
        if (window.FlowiseChat) {
            window.FlowiseChat.init(config);
        }
    };
    document.head.appendChild(script);
})();
</script>
<!-- End Flowise Chat Widget -->
    `.trim()
    
    // Update the embed code in the database
    chatUI.embedCode = embedCode
    chatUI.version = version
    chatUI.isProduction = isProduction
    
    const updatedChatUI = await appServer.AppDataSource.getRepository(ChatUI).save(chatUI)
    
    return {
        embedCode,
        version,
        isProduction,
        chatUI: updatedChatUI
    }
}

// Reset ChatUI to default values
const resetToDefault = async (botId: string) => {
    const defaultConfig = {
        theme: ChatUITheme.LIGHT,
        primaryColor: '#2196F3',
        secondaryColor: '#1976D2',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        position: WidgetPosition.BOTTOM_RIGHT,
        greeting: 'Hello! How can I help you today?',
        showTypingIndicator: true,
        showTimestamp: true,
        enableFileUpload: true,
        enableMarkdown: true,
        highContrast: false,
        screenReaderSupport: true,
        isProduction: false
    }
    
    return await saveChatUI(botId, defaultConfig)
}

export default {
    getAllBotsWithChatUI,
    getChatUIByBotId,
    saveChatUI,
    deleteChatUI,
    generateEmbedCode,
    resetToDefault
}

