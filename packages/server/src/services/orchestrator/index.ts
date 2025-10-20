import { StatusCodes } from 'http-status-codes'
import OpenAI from 'openai'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { Solution, SolutionType } from '../../database/entities/Solution'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'
import logger from '../../utils/logger'

interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool'
    content: string
    name?: string
    tool_calls?: any[]
    tool_call_id?: string
}

interface OrchestratorChatRequest {
    solutionId: string // The orchestrator solution ID
    message: string
    conversationHistory?: ChatMessage[]
}

// The redirect tool definition (configured in backend)
const REDIRECT_TOOL = {
    type: 'function' as const,
    function: {
        name: 'redirect_to_agent',
        description: 'Redirect the conversation to a specialized agent based on user intent. Analyze the user query and choose the most appropriate agent.',
        parameters: {
            type: 'object',
            properties: {
                flowName: {
                    type: 'string',
                    description: 'The name of the specialized agent/solution to redirect to (exact match required)'
                },
                reason: {
                    type: 'string',
                    description: 'Brief explanation of why this agent was chosen'
                }
            },
            required: ['flowName']
        }
    }
}

/**
 * Process a chat message through the orchestrator
 * This handles the intelligent routing to specialized agents
 */
const processOrchestratorChat = async (request: OrchestratorChatRequest) => {
    try {
        const appServer = getRunningExpressApp()
        
        // 1. Load the orchestrator solution
        const orchestratorSolution = await appServer.AppDataSource.getRepository(Solution).findOne({
            where: { id: request.solutionId },
            relations: ['bot']
        })
        
        if (!orchestratorSolution) {
            throw new InternalFlowiseError(
                StatusCodes.NOT_FOUND,
                'Orchestrator solution not found'
            )
        }
        
        if (orchestratorSolution.type !== SolutionType.ORCHESTRATOR) {
            throw new InternalFlowiseError(
                StatusCodes.BAD_REQUEST,
                'This solution is not an orchestrator'
            )
        }
        
        // 2. Parse orchestrator configuration
        let orchestratorConfig: any = {}
        if (orchestratorSolution.configuration) {
            try {
                orchestratorConfig = JSON.parse(orchestratorSolution.configuration)
            } catch (error) {
                logger.error('Failed to parse orchestrator configuration:', error)
            }
        }
        
        // 3. Get all sibling solutions (available agents to route to)
        const siblingSolutions = await appServer.AppDataSource.getRepository(Solution).find({
            where: { 
                botId: orchestratorSolution.botId,
                type: SolutionType.REGULAR
            }
        })
        
        if (siblingSolutions.length === 0) {
            throw new InternalFlowiseError(
                StatusCodes.BAD_REQUEST,
                'No specialized agents available for routing'
            )
        }
        
        // 4. Build the orchestrator system prompt with available agents
        const agentsList = siblingSolutions.map(s => `- ${s.name}: ${s.description || 'Specialized agent'}`).join('\n')
        
        const systemPrompt = orchestratorConfig.prompt || `You are an intelligent orchestrator agent. Your role is to analyze user queries and redirect them to the most appropriate specialized agent.

Available agents:
${agentsList}

Analyze the user's intent carefully and use the redirect_to_agent tool to route the conversation to the best agent. Use the exact agent name from the list above.`
        
        // 5. Initialize OpenAI with credentials from config
        const apiKey = orchestratorConfig.selectedCredential || process.env.OPENAI_API_KEY
        if (!apiKey) {
            throw new InternalFlowiseError(
                StatusCodes.BAD_REQUEST,
                'No OpenAI API key configured for orchestrator'
            )
        }
        
        const openai = new OpenAI({ apiKey })
        
        // 6. Build conversation messages
        const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            ...(request.conversationHistory || []),
            { role: 'user', content: request.message }
        ]
        
        logger.info(`🎯 [Orchestrator]: Processing message: "${request.message}"`)
        
        // 7. Call OpenAI with the redirect tool
        const response = await openai.chat.completions.create({
            model: orchestratorConfig.selectedModel || 'gpt-4o',
            messages: messages as any,
            tools: [REDIRECT_TOOL],
            tool_choice: 'auto',
            temperature: orchestratorConfig.temperature || 0.7,
            max_tokens: orchestratorConfig.maxTokens || 2000
        })
        
        const assistantMessage = response.choices[0].message
        
        // 8. Check if the model called the redirect tool
        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
            const toolCall = assistantMessage.tool_calls[0]
            
            if (toolCall.function.name === 'redirect_to_agent') {
                const toolArgs = JSON.parse(toolCall.function.arguments)
                const targetFlowName = toolArgs.flowName
                const reason = toolArgs.reason || 'Agent selected based on user intent'
                
                logger.info(`🔀 [Orchestrator]: Redirecting to agent "${targetFlowName}" - ${reason}`)
                
                // 9. Find the target solution by name
                const targetSolution = siblingSolutions.find(
                    s => s.name.toLowerCase() === targetFlowName.toLowerCase()
                )
                
                if (!targetSolution) {
                    // If agent not found, return error message
                    return {
                        success: false,
                        response: `I apologize, but I couldn't find an agent named "${targetFlowName}". Available agents are: ${siblingSolutions.map(s => s.name).join(', ')}. Please try again.`,
                        orchestratorMessage: assistantMessage.content || '',
                        redirected: false
                    }
                }
                
                // 10. Load target agent configuration
                let targetConfig: any = {}
                if (targetSolution.configuration) {
                    try {
                        targetConfig = JSON.parse(targetSolution.configuration)
                    } catch (error) {
                        logger.error('Failed to parse target agent configuration:', error)
                    }
                }
                
                // 11. Call the specialized agent with FRESH CONTEXT (reset GPT)
                // Store the original user message and start a new conversation
                const originalUserMessage = request.message
                
                const targetSystemPrompt = targetConfig.prompt || `You are a helpful AI assistant specialized in handling specific tasks.`
                
                // Fresh conversation - only system prompt + user's original message
                const freshMessages: ChatMessage[] = [
                    { role: 'system', content: targetSystemPrompt },
                    { role: 'user', content: originalUserMessage }
                ]
                
                logger.info(`🤖 [${targetSolution.name}]: Processing with fresh context`)
                
                // Call the specialized agent
                const agentResponse = await openai.chat.completions.create({
                    model: targetConfig.selectedModel || 'gpt-4o',
                    messages: freshMessages as any,
                    temperature: targetConfig.temperature || 0.7,
                    max_tokens: targetConfig.maxTokens || 2000
                })
                
                const finalResponse = agentResponse.choices[0].message.content || 'No response from agent'
                
                logger.info(`✅ [${targetSolution.name}]: Response generated successfully`)
                
                return {
                    success: true,
                    response: finalResponse,
                    redirectedTo: targetSolution.name,
                    redirectedToId: targetSolution.id,
                    reason: reason,
                    orchestratorMessage: assistantMessage.content,
                    redirected: true
                }
            }
        }
        
        // If no tool call, return the orchestrator's direct response
        return {
            success: true,
            response: assistantMessage.content || 'No response generated',
            orchestratorMessage: assistantMessage.content,
            redirected: false
        }
        
    } catch (error) {
        logger.error('❌ [Orchestrator]: Error processing chat:', error)
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Failed to process orchestrator chat: ${getErrorMessage(error)}`
        )
    }
}

export default {
    processOrchestratorChat
}

