import client from './client'

// ChatUI Management
const getAllBotsWithChatUI = () => client.get('/chat-ui/bots')

const getChatUIByBotId = (botId) => client.get(`/chat-ui/${botId}`)

const saveChatUI = (botId, body) => client.post(`/chat-ui/${botId}`, body)

const updateChatUI = (botId, body) => client.put(`/chat-ui/${botId}`, body)

const deleteChatUI = (botId) => client.delete(`/chat-ui/${botId}`)

// Embed Code Generation
const generateEmbedCode = (botId, isProduction = false) => 
    client.post(`/chat-ui/${botId}/embed`, { isProduction })

const resetToDefault = (botId) => client.post(`/chat-ui/${botId}/reset`)

export default {
    getAllBotsWithChatUI,
    getChatUIByBotId,
    saveChatUI,
    updateChatUI,
    deleteChatUI,
    generateEmbedCode,
    resetToDefault
}

