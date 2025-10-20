import client from './client'

const generateFlow = (body) => client.post('/agentic/generate', body)

const analyzeFlow = (id) => client.get(`/agentic/analyze/${id}`)

const debugFlow = (body) => client.post('/agentic/debug', body)

const getInsights = () => client.get('/agentic/insights')

const getSmartSuggestions = (body) => client.post('/agentic/suggestions', body)

const sendChatMessage = (body, authToken) => {
    const config = {}
    // Only add Authorization header if authToken is a non-empty string
    if (authToken && typeof authToken === 'string' && authToken.trim().length > 0) {
        config.headers = {
            'Authorization': `Bearer ${authToken.trim()}`
        }
        console.log('🔑 API: Adding Authorization header with API key:', authToken.substring(0, 20) + '...')
    } else {
        console.log('⚠️  API: No valid authToken provided, backend will use environment variable')
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

