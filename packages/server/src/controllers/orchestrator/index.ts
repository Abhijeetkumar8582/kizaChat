import { Request, Response, NextFunction } from 'express'
import orchestratorService from '../../services/orchestrator'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'

/**
 * Handle orchestrator chat requests
 * POST /api/v1/orchestrator/chat
 */
const handleChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { solutionId, message, conversationHistory } = req.body
        
        if (!solutionId || !message) {
            throw new InternalFlowiseError(
                StatusCodes.BAD_REQUEST,
                'solutionId and message are required'
            )
        }
        
        const result = await orchestratorService.processOrchestratorChat({
            solutionId,
            message,
            conversationHistory
        })
        
        return res.json(result)
    } catch (error) {
        next(error)
    }
}

export default {
    handleChat
}

