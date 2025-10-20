import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import agenticService from '../../services/agentic'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'

/**
 * Generate a flow from natural language description
 */
const generateFlow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.body === 'undefined') {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: agenticController.generateFlow - body not provided!')
        }

        const description = req.body.description
        const flowType = req.body.flowType || 'CHATFLOW'
        const chatflowId = req.body.chatflowId // Optional: for regenerating existing flow

        if (!description) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: Description is required')
        }

        const result = await agenticService.generateFlow(description, flowType, chatflowId)
        return res.json(result)
    } catch (error) {
        next(error)
    }
}

/**
 * Analyze a flow and provide optimization suggestions
 */
const analyzeFlow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: Flow ID is required')
        }

        const chatflowId = req.params.id
        const result = await agenticService.analyzeFlow(chatflowId)
        return res.json(result)
    } catch (error) {
        next(error)
    }
}

/**
 * Debug a flow error using AI
 */
const debugFlow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.body === 'undefined') {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: agenticController.debugFlow - body not provided!')
        }

        const chatflowId = req.body.chatflowId
        const errorMessage = req.body.errorMessage
        const flowData = req.body.flowData

        if (!errorMessage && !chatflowId) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: Either chatflowId or errorMessage is required')
        }

        const result = await agenticService.debugFlow(chatflowId, errorMessage, flowData)
        return res.json(result)
    } catch (error) {
        next(error)
    }
}

/**
 * Get agentic insights for all flows
 */
const getInsights = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const workspaceId = req.user?.activeWorkspaceId
        const result = await agenticService.getInsights(workspaceId)
        return res.json(result)
    } catch (error) {
        next(error)
    }
}

/**
 * Get smart suggestions for flow building
 */
const getSmartSuggestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.body === 'undefined') {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: agenticController.getSmartSuggestions - body not provided!')
        }

        const currentFlow = req.body.currentFlow
        const context = req.body.context

        const result = await agenticService.getSmartSuggestions(currentFlow, context)
        return res.json(result)
    } catch (error) {
        next(error)
    }
}

/**
 * Handle agentic chat with function calling
 */
const sendChatMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('=' .repeat(80))
        console.log('🟢 CONTROLLER: Request received at /api/v1/agentic/chat')
        console.log('=' .repeat(80))
        console.log('📋 Request Headers:', JSON.stringify(req.headers, null, 2))
        console.log('📦 Request Body (stringified):', JSON.stringify(req.body, null, 2))
        console.log('🔍 Request Details:')
        console.log('  - Method:', req.method)
        console.log('  - URL:', req.url)
        console.log('  - Content-Type:', req.headers['content-type'])
        console.log('  - User-Agent:', req.headers['user-agent'])
        console.log('=' .repeat(80))
        
        if (typeof req.body === 'undefined') {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: agenticController.sendChatMessage - body not provided!')
        }

        const { model, messages, temperature, max_tokens, top_p, tools, toolResponses, documents } = req.body
        
        // Extract API key from Authorization header
        const authHeader = req.headers['authorization']
        let apiKey = undefined
        if (authHeader && authHeader.startsWith('Bearer ')) {
            apiKey = authHeader.substring(7) // Remove 'Bearer ' prefix
            console.log('🔑 API Key extracted from Authorization header:', `${apiKey.substring(0, 20)}...`)
        } else {
            console.log('⚠️  No Authorization header found, backend will use environment variable')
        }

        if (!messages || messages.length === 0) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: Messages are required')
        }

        const result = await agenticService.sendChatMessage({
            model,
            messages,
            temperature,
            max_tokens,
            top_p,
            tools,
            toolResponses,
            documents,
            apiKey
        })
        
        console.log('=' .repeat(80))
        console.log('🟢 CONTROLLER: Sending response back to client')
        console.log('=' .repeat(80))
        console.log('📦 Response Body (stringified):', JSON.stringify(result, null, 2))
        console.log('✅ Status Code:', 200)
        console.log('=' .repeat(80))
        
        return res.json(result)
    } catch (error) {
        next(error)
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


