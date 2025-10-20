import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import solutionsService from '../../services/solutions'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'

/**
 * Get all solutions for a bot
 */
const getSolutionsByBotId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.botId) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: Bot ID is required')
        }

        const workspaceId = req.user?.activeWorkspaceId
        const solutions = await solutionsService.getSolutionsByBotId(req.params.botId, workspaceId)
        return res.json(solutions)
    } catch (error) {
        next(error)
    }
}

/**
 * Get solution by ID
 */
const getSolutionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: Solution ID is required')
        }

        const solution = await solutionsService.getSolutionById(req.params.id)
        return res.json(solution)
    } catch (error) {
        next(error)
    }
}

/**
 * Create a new solution
 */
const createSolution = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.body === 'undefined') {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: solutionsController.createSolution - body not provided!')
        }

        const { botId, name, description, configuration } = req.body

        if (!botId) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: Bot ID is required')
        }

        if (!name) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: Solution name is required')
        }

        const workspaceId = req.user?.activeWorkspaceId
        const solution = await solutionsService.createSolution(botId, name, description, configuration, workspaceId)
        return res.status(StatusCodes.CREATED).json(solution)
    } catch (error) {
        next(error)
    }
}

/**
 * Update a solution
 */
const updateSolution = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: Solution ID is required')
        }

        if (typeof req.body === 'undefined') {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: solutionsController.updateSolution - body not provided!')
        }

        const { name, description, configuration } = req.body
        const solution = await solutionsService.updateSolution(req.params.id, name, description, configuration)
        return res.json(solution)
    } catch (error) {
        next(error)
    }
}

/**
 * Delete a solution
 */
const deleteSolution = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Error: Solution ID is required')
        }

        await solutionsService.deleteSolution(req.params.id)
        return res.status(StatusCodes.OK).json({ message: 'Solution deleted successfully' })
    } catch (error) {
        next(error)
    }
}

export default {
    getSolutionsByBotId,
    getSolutionById,
    createSolution,
    updateSolution,
    deleteSolution
}

