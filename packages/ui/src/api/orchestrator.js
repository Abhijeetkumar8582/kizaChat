import client from './client'

/**
 * Send a chat message to the orchestrator
 * The orchestrator will analyze intent and route to the appropriate specialized agent
 * 
 * @param {string} solutionId - The orchestrator solution ID
 * @param {string} message - The user's message
 * @param {Array} conversationHistory - Optional conversation history
 * @returns {Promise} Response containing the agent's answer and routing information
 */
const chat = (solutionId, message, conversationHistory = []) => {
    return client.post('/orchestrator/chat', {
        solutionId,
        message,
        conversationHistory
    })
}

export default {
    chat
}

