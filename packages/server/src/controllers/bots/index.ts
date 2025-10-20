import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import botsService from '../../services/bots'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'

/**
 * Get all bots
 */
const getAllBots = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const workspaceId = req.user?.activeWorkspaceId
        const bots = await botsService.getAllBots(workspaceId)
        return res.json(bots)
    } catch (error) {
        next(error)
    }
}

/**
 * Get bot by ID
 */
const getBotById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: Bot ID is required')
        }

        const bot = await botsService.getBotById(req.params.id)
        return res.json(bot)
    } catch (error) {
        next(error)
    }
}

/**
 * Create a new bot
 */
const createBot = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.body === 'undefined') {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: botsController.createBot - body not provided!')
        }

        const { name, description } = req.body

        if (!name) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: Bot name is required')
        }

        const workspaceId = req.user?.activeWorkspaceId
        const bot = await botsService.createBot(name, description, workspaceId)
        return res.status(StatusCodes.CREATED).json(bot)
    } catch (error) {
        next(error)
    }
}

/**
 * Update a bot
 */
const updateBot = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: Bot ID is required')
        }

        if (typeof req.body === 'undefined') {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: botsController.updateBot - body not provided!')
        }

        const { name, description } = req.body
        const bot = await botsService.updateBot(req.params.id, name, description)
        return res.json(bot)
    } catch (error) {
        next(error)
    }
}

/**
 * Delete a bot
 */
const deleteBot = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: Bot ID is required')
        }

        await botsService.deleteBot(req.params.id)
        return res.status(StatusCodes.OK).json({ message: 'Bot deleted successfully' })
    } catch (error) {
        next(error)
    }
}

export default {
    getAllBots,
    getBotById,
    createBot,
    updateBot,
    deleteBot
}

