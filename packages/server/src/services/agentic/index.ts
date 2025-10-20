import { StatusCodes } from 'http-status-codes'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { getDataSource } from '../../DataSource'
import { ChatFlow } from '../../database/entities/ChatFlow'
import { ChatMessage } from '../../database/entities/ChatMessage'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import logger from '../../utils/logger'

/**
 * Initialize OpenAI model for agentic features
 */
const getAIModel = () => {
    const apiKey = process.env.OPENAI_API_KEY || process.env.AGENTIC_AI_API_KEY
    
    if (!apiKey) {
        throw new InternalFlowiseError(
            StatusCodes.PRECONDITION_FAILED,
            'OpenAI API key is required for Agentic features. Please set OPENAI_API_KEY or AGENTIC_AI_API_KEY environment variable.'
        )
    }

    return new ChatOpenAI({
        modelName: process.env.AGENTIC_AI_MODEL || 'gpt-4o',
        temperature: 0.7,
        openAIApiKey: apiKey
    })
}

/**
 * Generate a flow from natural language description
 */
const generateFlow = async (description: string, flowType: string = 'CHATFLOW', chatflowId?: string) => {
    try {
        const model = getAIModel()

        const systemPrompt = `You are an expert AI flow designer for Flowise, an LLM orchestration platform.
Your task is to generate a complete flow configuration in JSON format based on the user's description.

The flow should be a valid Flowise flow with nodes and edges. Each node has:
- id: unique identifier
- position: {x, y} coordinates
- type: "customNode"
- data: {
    id: node id,
    label: node name,
    name: node type (e.g., "chatOpenAI", "conversationalRetrievalQAChain", etc.),
    type: node category,
    baseClasses: array of base classes,
    category: string,
    inputParams: array of parameters with values,
    inputs: object with input connections
  }

Available node types include:
- Chat Models: chatOpenAI, chatAnthropic, chatGoogleGenerativeAI, etc.
- Chains: conversationalRetrievalQAChain, llmChain, apiChain, etc.
- Agents: conversationalAgent, openAIFunctionAgent, toolAgent, etc.
- Memory: bufferMemory, conversationSummaryMemory, etc.
- Embeddings: openAIEmbeddings, cohereEmbeddings, etc.
- Vector Stores: pinecone, qdrant, chroma, weaviate, etc.
- Document Loaders: pdfFile, csvFile, webScraper, etc.
- Tools: calculator, webBrowser, serpAPI, customTool, etc.

Return ONLY a valid JSON object with this structure:
{
  "nodes": [...],
  "edges": [...],
  "name": "Generated Flow Name",
  "description": "Brief description of what this flow does"
}

Make the flow functional, well-structured, and production-ready.`

        const userPrompt = `Create a ${flowType.toLowerCase()} flow for: ${description}

Requirements:
- Make it production-ready with proper error handling
- Include all necessary nodes (LLM, memory, tools, etc.)
- Connect nodes logically
- Use best practices for the type of flow requested
- Add helpful descriptions in node configurations

Generate the complete flow now.`

        const response = await model.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt)
        ])

        let flowData
        try {
            // Extract JSON from response (handle markdown code blocks)
            let content = response.content.toString()
            const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
            if (jsonMatch) {
                content = jsonMatch[1]
            }
            flowData = JSON.parse(content)
        } catch (parseError) {
            logger.error('Failed to parse AI response:', parseError)
            throw new InternalFlowiseError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to parse AI-generated flow. Please try again.'
            )
        }

        return {
            success: true,
            flowData: flowData,
            message: 'Flow generated successfully',
            aiResponse: response.content
        }
    } catch (error) {
        logger.error('Error generating flow:', error)
        throw error
    }
}

/**
 * Analyze a flow and provide optimization suggestions
 */
const analyzeFlow = async (chatflowId: string) => {
    try {
        const appDataSource = getDataSource()
        const chatflow = await appDataSource.getRepository(ChatFlow).findOneBy({ id: chatflowId })

        if (!chatflow) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Flow ${chatflowId} not found`)
        }

        const flowData = JSON.parse(chatflow.flowData)
        const model = getAIModel()

        const systemPrompt = `You are an expert AI flow analyzer and optimizer for Flowise.
Analyze the provided flow configuration and provide detailed optimization suggestions.

Focus on:
1. Performance optimizations
2. Best practices compliance
3. Security concerns
4. Cost optimization
5. Scalability improvements
6. Error handling improvements
7. Missing or redundant nodes
8. Better node configurations

Provide specific, actionable recommendations in a structured format.`

        const userPrompt = `Analyze this Flowise flow and provide optimization suggestions:

Flow Name: ${chatflow.name}
Flow Type: ${chatflow.type}
Flow Data: ${JSON.stringify(flowData, null, 2)}

Provide your analysis in the following JSON format:
{
  "overallScore": 0-100,
  "strengths": ["list of strengths"],
  "issues": [
    {
      "severity": "high|medium|low",
      "category": "performance|security|best-practice|cost",
      "issue": "description of issue",
      "recommendation": "specific recommendation",
      "nodeIds": ["affected node ids"]
    }
  ],
  "optimizations": [
    {
      "title": "optimization title",
      "description": "detailed description",
      "impact": "high|medium|low",
      "effort": "high|medium|low",
      "steps": ["step 1", "step 2"]
    }
  ],
  "summary": "overall summary"
}`

        const response = await model.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt)
        ])

        let analysis
        try {
            let content = response.content.toString()
            const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
            if (jsonMatch) {
                content = jsonMatch[1]
            }
            analysis = JSON.parse(content)
        } catch (parseError) {
            // If parsing fails, return raw response
            analysis = {
                summary: response.content,
                rawResponse: true
            }
        }

        return {
            success: true,
            chatflowId,
            chatflowName: chatflow.name,
            analysis,
            analyzedAt: new Date().toISOString()
        }
    } catch (error) {
        logger.error('Error analyzing flow:', error)
        throw error
    }
}

/**
 * Debug a flow error using AI
 */
const debugFlow = async (chatflowId?: string, errorMessage?: string, flowData?: any) => {
    try {
        const appDataSource = getDataSource()
        let chatflow
        let flow = flowData

        if (chatflowId) {
            chatflow = await appDataSource.getRepository(ChatFlow).findOneBy({ id: chatflowId })
            if (!chatflow) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Flow ${chatflowId} not found`)
            }
            flow = JSON.parse(chatflow.flowData)
        }

        const model = getAIModel()

        const systemPrompt = `You are an expert AI debugging assistant for Flowise, an LLM orchestration platform.
Your job is to analyze errors and provide clear, actionable solutions.

When debugging:
1. Identify the root cause of the error
2. Explain why it happened
3. Provide step-by-step solution
4. Suggest preventive measures
5. Offer alternative approaches if applicable

Be specific and practical in your recommendations.`

        const userPrompt = `Debug this Flowise flow issue:

${chatflow ? `Flow Name: ${chatflow.name}\nFlow Type: ${chatflow.type}\n` : ''}
${flow ? `Flow Configuration: ${JSON.stringify(flow, null, 2)}\n` : ''}
${errorMessage ? `Error Message: ${errorMessage}\n` : ''}

Provide your debugging analysis in the following JSON format:
{
  "rootCause": "explanation of root cause",
  "errorType": "configuration|runtime|dependency|network|authentication",
  "affectedComponents": ["list of affected nodes/components"],
  "solution": {
    "steps": ["step 1", "step 2"],
    "codeChanges": [
      {
        "nodeId": "node id",
        "parameter": "parameter name",
        "currentValue": "current value",
        "suggestedValue": "suggested value",
        "reason": "why this change"
      }
    ]
  },
  "prevention": ["preventive measure 1", "preventive measure 2"],
  "alternatives": ["alternative approach 1", "alternative approach 2"],
  "documentation": ["relevant doc link 1", "relevant doc link 2"]
}`

        const response = await model.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt)
        ])

        let debugInfo
        try {
            let content = response.content.toString()
            const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
            if (jsonMatch) {
                content = jsonMatch[1]
            }
            debugInfo = JSON.parse(content)
        } catch (parseError) {
            debugInfo = {
                summary: response.content,
                rawResponse: true
            }
        }

        return {
            success: true,
            debugInfo,
            analyzedAt: new Date().toISOString()
        }
    } catch (error) {
        logger.error('Error debugging flow:', error)
        throw error
    }
}

/**
 * Get agentic insights for workspace
 */
const getInsights = async (workspaceId?: string) => {
    try {
        const appDataSource = getDataSource()
        
        // Get all flows for workspace
        const whereClause = workspaceId ? { workspaceId } : {}
        const chatflows = await appDataSource.getRepository(ChatFlow).find({
            where: whereClause,
            order: { updatedDate: 'DESC' }
        })

        // Get message statistics
        const messageStats = await appDataSource.getRepository(ChatMessage)
            .createQueryBuilder('message')
            .select('message.chatflowid', 'chatflowId')
            .addSelect('COUNT(*)', 'count')
            .groupBy('message.chatflowid')
            .getRawMany()

        const statsMap = messageStats.reduce((acc, stat) => {
            acc[stat.chatflowId] = parseInt(stat.count)
            return acc
        }, {} as Record<string, number>)

        const insights = {
            totalFlows: chatflows.length,
            flowsByType: chatflows.reduce((acc, flow) => {
                acc[flow.type || 'CHATFLOW'] = (acc[flow.type || 'CHATFLOW'] || 0) + 1
                return acc
            }, {} as Record<string, number>),
            deployedFlows: chatflows.filter(f => f.deployed).length,
            publicFlows: chatflows.filter(f => f.isPublic).length,
            topFlows: chatflows
                .map(flow => ({
                    id: flow.id,
                    name: flow.name,
                    type: flow.type,
                    messageCount: statsMap[flow.id] || 0,
                    deployed: flow.deployed,
                    updatedDate: flow.updatedDate
                }))
                .sort((a, b) => b.messageCount - a.messageCount)
                .slice(0, 10),
            recentlyUpdated: chatflows.slice(0, 5).map(flow => ({
                id: flow.id,
                name: flow.name,
                type: flow.type,
                updatedDate: flow.updatedDate
            })),
            recommendations: [
                {
                    type: 'deployment',
                    message: `You have ${chatflows.length - chatflows.filter(f => f.deployed).length} undeployed flows. Consider deploying or archiving them.`,
                    priority: 'medium'
                },
                {
                    type: 'usage',
                    message: 'Consider analyzing low-usage flows for optimization opportunities.',
                    priority: 'low'
                }
            ]
        }

        return {
            success: true,
            insights,
            generatedAt: new Date().toISOString()
        }
    } catch (error) {
        logger.error('Error getting insights:', error)
        throw error
    }
}

/**
 * Get smart suggestions for flow building
 */
const getSmartSuggestions = async (currentFlow: any, context: string) => {
    try {
        const model = getAIModel()

        const systemPrompt = `You are an AI assistant helping users build Flowise flows.
Based on the current flow state and user context, provide smart suggestions for:
1. Next nodes to add
2. Configuration improvements
3. Common patterns to implement
4. Best practices to follow

Be concise and actionable.`

        const userPrompt = `Current flow state: ${JSON.stringify(currentFlow, null, 2)}
User context: ${context}

Provide 3-5 smart suggestions in the following JSON format:
{
  "suggestions": [
    {
      "title": "suggestion title",
      "description": "brief description",
      "action": "add-node|configure-node|connect-nodes",
      "priority": "high|medium|low",
      "nodeType": "suggested node type (if action is add-node)",
      "reasoning": "why this suggestion"
    }
  ]
}`

        const response = await model.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt)
        ])

        let suggestions
        try {
            let content = response.content.toString()
            const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
            if (jsonMatch) {
                content = jsonMatch[1]
            }
            suggestions = JSON.parse(content)
        } catch (parseError) {
            suggestions = {
                suggestions: [],
                rawResponse: response.content
            }
        }

        return {
            success: true,
            ...suggestions,
            generatedAt: new Date().toISOString()
        }
    } catch (error) {
        logger.error('Error getting smart suggestions:', error)
        throw error
    }
}

/**
 * Send chat message with function calling support
 */
const sendChatMessage = async (payload: any) => {
    try {
        logger.info('=' .repeat(80))
        logger.info('🔥 AGENTIC CHAT REQUEST RECEIVED')
        logger.info('=' .repeat(80))
        logger.info('Full Payload:', JSON.stringify(payload, null, 2))
        
        const { model: modelName, messages, temperature, max_tokens, top_p, tools, toolResponses, documents, apiKey: providedApiKey } = payload
        
        logger.info('🔍 API Key Extraction Debug:')
        logger.info('  - providedApiKey exists:', !!providedApiKey)
        logger.info('  - providedApiKey type:', typeof providedApiKey)
        logger.info('  - providedApiKey length:', providedApiKey ? providedApiKey.length : 0)
        logger.info('  - providedApiKey preview:', providedApiKey ? providedApiKey.substring(0, 20) + '...' : 'N/A')
        logger.info('  - env OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
        logger.info('  - env AGENTIC_AI_API_KEY exists:', !!process.env.AGENTIC_AI_API_KEY)
        
        // Get API key from header (providedApiKey) or environment variable
        // Trim the API key to remove any whitespace
        let apiKey = (providedApiKey && providedApiKey.trim()) || process.env.OPENAI_API_KEY || process.env.AGENTIC_AI_API_KEY
        
        logger.info('  - Final apiKey selected:', apiKey ? apiKey.substring(0, 20) + '...' : 'NONE')
        
        if (!apiKey || apiKey.trim() === '') {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                'OpenAI API key is required. Please select a credential or set OPENAI_API_KEY environment variable.'
            )
        }
        
        // Log configuration for debugging
        logger.info('=' .repeat(80))
        logger.info('🔑 AUTHORIZATION & API KEY INFO')
        logger.info('=' .repeat(80))
        logger.info('API Key Details:', {
            source: providedApiKey ? 'Authorization Header (from frontend credential)' : 'Environment Variable',
            apiKeyPresent: !!apiKey,
            apiKeyPrefix: apiKey ? apiKey.substring(0, 20) + '...' : 'none',
            apiKeyLength: apiKey ? apiKey.length : 0
        })
        logger.info('Authorization Header that will be sent to OpenAI:', `Bearer ${apiKey ? apiKey.substring(0, 20) + '...' : 'MISSING'}`)
        logger.info('=' .repeat(80))
        
        logger.info('Initializing OpenAI model with config:', {
            modelName: modelName || 'gpt-4o',
            temperature: temperature || 0.7,
            maxTokens: max_tokens,
            topP: top_p,
            apiKeyPresent: !!apiKey
        })

        const model = new ChatOpenAI({
            modelName: modelName || 'gpt-4o',
            temperature: temperature || 0.7,
            maxTokens: max_tokens,
            topP: top_p,
            openAIApiKey: apiKey
        })

        // Convert messages to LangChain format
        logger.info('Converting messages to LangChain format:', { 
            messageCount: messages.length,
            roles: messages.map((m: any) => m.role)
        })
        
        const langchainMessages = messages.map((msg: any) => {
            if (msg.role === 'system') {
                return new SystemMessage(msg.content)
            } else if (msg.role === 'user') {
                return new HumanMessage(msg.content)
            } else {
                // assistant messages
                return new SystemMessage(`Assistant: ${msg.content}`)
            }
        })
        
        logger.info('Converted messages:', { 
            langchainMessageCount: langchainMessages.length,
            firstMessageType: langchainMessages[0]?.constructor.name,
            firstMessagePreview: langchainMessages[0]?.content?.substring(0, 50)
        })

        // If tools are provided, bind them to the model
        let responseModel = model
        if (tools && tools.length > 0) {
            // Convert tools to LangChain format
            const langchainTools = tools.map((tool: any) => ({
                name: tool.function.name,
                description: tool.function.description,
                schema: tool.function.parameters
            }))
            
            // For now, invoke without binding tools (OpenAI function calling would require more complex setup)
            // This is a simplified version - you can enhance this with actual function calling
        }

        // Invoke the model
        logger.info('=' .repeat(80))
        logger.info('📡 CALLING OPENAI API')
        logger.info('=' .repeat(80))
        logger.info('Model Configuration:', {
            modelName: modelName || 'gpt-4o',
            temperature: temperature || 0.7,
            maxTokens: max_tokens,
            topP: top_p
        })
        logger.info('Message Count:', langchainMessages.length)
        logger.info('Messages Being Sent:')
        langchainMessages.forEach((msg: any, idx: number) => {
            logger.info(`  [${idx}] ${msg.constructor.name}: ${msg.content.substring(0, 100)}...`)
        })
        logger.info('=' .repeat(80))
        
        const response = await responseModel.invoke(langchainMessages)
        
        logger.info('=' .repeat(80))
        logger.info('📥 OPENAI API RESPONSE RECEIVED')
        logger.info('=' .repeat(80))
        logger.info('Response Metadata:', { 
            contentType: typeof response.content, 
            isArray: Array.isArray(response.content),
            hasToolCalls: !!response.tool_calls,
            responseKeys: Object.keys(response)
        })
        logger.info('Full Response Structure:', JSON.stringify(response, null, 2))
        logger.info('=' .repeat(80))

        // Extract the response text
        let responseText = ''
        
        try {
            // Handle different response formats
            if (typeof response.content === 'string') {
                responseText = response.content
                logger.info('Extracted string response:', { length: responseText.length })
            } else if (Array.isArray(response.content)) {
                // Handle array content format (like the sample provided)
                const textItems = response.content.filter((item: any) => 
                    item && (item.type === 'text' || item.type === 'output_text' || item.text)
                )
                
                if (textItems.length > 0) {
                    responseText = textItems
                        .map((item: any) => item.text || item.content || JSON.stringify(item))
                        .join('\n')
                    logger.info('Extracted array response:', { length: responseText.length, items: textItems.length })
                } else {
                    // Try to extract any text from the array
                    responseText = response.content
                        .map((item: any) => {
                            if (typeof item === 'string') return item
                            if (item.text) return item.text
                            if (item.content) return item.content
                            return JSON.stringify(item)
                        })
                        .filter(Boolean)
                        .join('\n')
                    logger.info('Extracted from array (fallback):', { length: responseText.length })
                }
            } else if (response.content && typeof response.content === 'object') {
                // Handle object content format
                const contentObj = response.content as any
                if (contentObj.text) {
                    responseText = contentObj.text
                } else if (contentObj.content) {
                    responseText = contentObj.content
                } else {
                    responseText = JSON.stringify(response.content)
                }
                logger.info('Extracted object response:', { length: responseText.length })
            } else if ((response as any).text) {
                // Check if response has a direct text property
                responseText = (response as any).text
                logger.info('Extracted from response.text:', { length: responseText.length })
            } else {
                responseText = (response.content as any)?.toString() || ''
                logger.warn('Fallback response extraction:', { responseText })
            }
        } catch (extractError: any) {
            logger.error('Error extracting response text:', extractError)
            responseText = ''
        }
        
        if (!responseText || responseText.trim() === '') {
            logger.error('Empty response text after extraction', { 
                responseKeys: Object.keys(response),
                responseContent: response.content,
                fullResponse: response 
            })
            throw new InternalFlowiseError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Received empty response from OpenAI. Response structure: ${JSON.stringify(Object.keys(response))}. Please check your API key and model settings.`
            )
        }

        const finalResponse = {
            success: true,
            message: responseText,
            response: responseText,
            toolCalls: response.tool_calls || [], // Extract tool calls if present
            model: modelName || 'gpt-4o',
            timestamp: new Date().toISOString()
        }
        
        logger.info('=' .repeat(80))
        logger.info('✅ SENDING RESPONSE TO FRONTEND')
        logger.info('=' .repeat(80))
        logger.info('Response Summary:', {
            success: finalResponse.success,
            messageLength: responseText.length,
            messagePreview: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''),
            toolCallsCount: finalResponse.toolCalls.length,
            model: finalResponse.model
        })
        logger.info('=' .repeat(80))
        
        return finalResponse
    } catch (error: any) {
        logger.error('=' .repeat(80))
        logger.error('❌ ERROR IN AGENTIC CHAT')
        logger.error('=' .repeat(80))
        logger.error('Error Details:', {
            name: error?.name,
            message: error?.message,
            code: error?.code,
            status: error?.status,
            response: error?.response?.data
        })
        logger.error('Full Error Object:', error)
        logger.error('Stack Trace:', error?.stack)
        logger.error('=' .repeat(80))
        
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error sending chat message: ${error?.message || 'Unknown error'}`
        )
    }
}

export default {
    generateFlow,
    analyzeFlow,
    debugFlow,
    getInsights,
    getSmartSuggestions,
    sendChatMessage
}

