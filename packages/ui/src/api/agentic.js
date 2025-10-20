import client from './client'

const generateFlow = (body) => client.post('/agentic/generate', body)

const analyzeFlow = (id) => client.get(`/agentic/analyze/${id}`)

const debugFlow = (body) => client.post('/agentic/debug', body)

const getInsights = () => client.get('/agentic/insights')

const getSmartSuggestions = (body) => client.post('/agentic/suggestions', body)

const sendChatMessage = (body, authToken) => {
    const config = {}
    if (authToken) {
        config.headers = {
            'Authorization': `Bearer ${authToken}`
        }
    }
    return client.post('/agentic/chat', body, config)
}

export default {
    generateFlow,
    analyzeFlow,
    debugFlow,
    getInsights,
    getSmartSuggestions,
    sendChatMessage
}

