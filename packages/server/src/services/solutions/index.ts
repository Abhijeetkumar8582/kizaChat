import { StatusCodes } from 'http-status-codes'
import path from 'path'
import fs from 'fs'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { Solution, SolutionType } from '../../database/entities/Solution'
import { Bot } from '../../database/entities/Bot'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'
import botsService from '../bots'
import logger from '../../utils/logger'

// Get all solutions for a bot
const getSolutionsByBotId = async (botId: string, workspaceId?: string) => {
    try {
        const appServer = getRunningExpressApp()
        
        // First verify the bot exists
        const bot = await appServer.AppDataSource.getRepository(Bot).findOneBy({ id: botId })
        if (!bot) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Bot ${botId} not found`)
        }

        const queryBuilder = appServer.AppDataSource.getRepository(Solution)
            .createQueryBuilder('solution')
            .where('solution.botId = :botId', { botId })
            .orderBy('solution.createdDate', 'DESC')

        if (workspaceId) {
            queryBuilder.andWhere('solution.workspaceId = :workspaceId', { workspaceId })
        }

        const solutions = await queryBuilder.getMany()
        return solutions
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: solutionsService.getSolutionsByBotId - ${getErrorMessage(error)}`
        )
    }
}

// Get solution by ID
const getSolutionById = async (id: string) => {
    try {
        const appServer = getRunningExpressApp()
        const solution = await appServer.AppDataSource.getRepository(Solution).findOne({
            where: { id },
            relations: ['bot']
        })

        if (!solution) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Solution ${id} not found`)
        }

        return solution
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: solutionsService.getSolutionById - ${getErrorMessage(error)}`
        )
    }
}

// Create a new solution
const createSolution = async (
    botId: string,
    name: string,
    description?: string,
    configuration?: string,
    workspaceId?: string
) => {
    try {
        const appServer = getRunningExpressApp()
        
        // Verify the bot exists
        const bot = await appServer.AppDataSource.getRepository(Bot).findOneBy({ id: botId })
        if (!bot) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Bot ${botId} not found`)
        }

        // Get existing solutions count
        const solutionsCount = await appServer.AppDataSource.getRepository(Solution)
            .count({ where: { botId } })

        // Create the new solution
        const solution = new Solution()
        solution.name = name
        solution.description = description
        solution.configuration = configuration
        solution.botId = botId
        solution.workspaceId = workspaceId
        solution.type = SolutionType.REGULAR

        const newSolution = await appServer.AppDataSource.getRepository(Solution).save(solution)
        
        // Create a folder for this solution
        try {
            const solutionsFolderPath = botsService.getBotSolutionsFolderPath(botId)
            const solutionFolderPath = path.join(solutionsFolderPath, newSolution.id)
            
            if (!fs.existsSync(solutionFolderPath)) {
                fs.mkdirSync(solutionFolderPath, { recursive: true })
                logger.info(`📁 Created solution folder: ${solutionFolderPath}`)
                
                // Create subfolders for organization
                const agentsFolderPath = path.join(solutionFolderPath, 'agents')
                const toolsFolderPath = path.join(solutionFolderPath, 'tools')
                const documentsFolderPath = path.join(solutionFolderPath, 'documents')
                
                fs.mkdirSync(agentsFolderPath, { recursive: true })
                fs.mkdirSync(toolsFolderPath, { recursive: true })
                fs.mkdirSync(documentsFolderPath, { recursive: true })
                
                // Create a README file with solution info
                const readmePath = path.join(solutionFolderPath, 'README.md')
                const readmeContent = `# ${newSolution.name}\n\n${newSolution.description || 'No description'}\n\n**Type:** ${newSolution.type}\n**Created:** ${newSolution.createdDate}\n**Solution ID:** ${newSolution.id}\n\n## Folders\n\n- **agents/**: Agent configurations\n- **tools/**: Custom tools and functions\n- **documents/**: Solution-specific documents\n\nThis folder contains all files related to this solution.`
                fs.writeFileSync(readmePath, readmeContent, 'utf8')
            }
        } catch (folderError) {
            logger.error(`Error creating solution folder: ${getErrorMessage(folderError)}`)
            // Don't fail the solution creation if folder creation fails
        }

        // If this is the second solution (count was 1, now 2), create orchestrator
        if (solutionsCount === 1) {
            const orchestrator = new Solution()
            orchestrator.name = 'Orchestrator Solution'
            orchestrator.description = 'Automatically created orchestrator for managing multiple solutions'
            orchestrator.botId = botId
            orchestrator.workspaceId = workspaceId
            orchestrator.type = SolutionType.ORCHESTRATOR
            orchestrator.configuration = JSON.stringify({
                isOrchestrator: true,
                managedSolutions: [newSolution.id]
            })

            await appServer.AppDataSource.getRepository(Solution).save(orchestrator)
        }

        return newSolution
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: solutionsService.createSolution - ${getErrorMessage(error)}`
        )
    }
}

// Update a solution
const updateSolution = async (
    id: string,
    name?: string,
    description?: string,
    configuration?: string
) => {
    try {
        const appServer = getRunningExpressApp()
        const solution = await appServer.AppDataSource.getRepository(Solution).findOneBy({ id })

        if (!solution) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Solution ${id} not found`)
        }

        if (name) solution.name = name
        if (description !== undefined) solution.description = description
        if (configuration !== undefined) solution.configuration = configuration

        const updatedSolution = await appServer.AppDataSource.getRepository(Solution).save(solution)
        return updatedSolution
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: solutionsService.updateSolution - ${getErrorMessage(error)}`
        )
    }
}

// Delete a solution
const deleteSolution = async (id: string) => {
    try {
        const appServer = getRunningExpressApp()
        
        const solution = await appServer.AppDataSource.getRepository(Solution).findOneBy({ id })
        if (!solution) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Solution ${id} not found`)
        }

        const result = await appServer.AppDataSource.getRepository(Solution).delete({ id })
        
        // Delete the solution's folder
        try {
            const solutionsFolderPath = botsService.getBotSolutionsFolderPath(solution.botId)
            const solutionFolderPath = path.join(solutionsFolderPath, id)
            
            if (fs.existsSync(solutionFolderPath)) {
                fs.rmSync(solutionFolderPath, { recursive: true, force: true })
                logger.info(`🗑️ Deleted solution folder: ${solutionFolderPath}`)
            }
        } catch (folderError) {
            logger.error(`Error deleting solution folder: ${getErrorMessage(folderError)}`)
            // Don't fail the solution deletion if folder deletion fails
        }
        
        // Check if we need to remove orchestrator (if only 1 regular solution remains)
        const remainingSolutions = await appServer.AppDataSource.getRepository(Solution)
            .find({ where: { botId: solution.botId, type: SolutionType.REGULAR } })

        if (remainingSolutions.length === 1) {
            // Delete orchestrator since we only have 1 solution now
            await appServer.AppDataSource.getRepository(Solution)
                .delete({ botId: solution.botId, type: SolutionType.ORCHESTRATOR })
        }

        return result
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: solutionsService.deleteSolution - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getSolutionsByBotId,
    getSolutionById,
    createSolution,
    updateSolution,
    deleteSolution
}

