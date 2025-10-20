import { StatusCodes } from 'http-status-codes'
import path from 'path'
import fs from 'fs'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { Bot } from '../../database/entities/Bot'
import { Solution } from '../../database/entities/Solution'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'
import { getUserHome } from '../../utils'
import logger from '../../utils/logger'

// Get all bots
const getAllBots = async (workspaceId?: string) => {
    try {
        const appServer = getRunningExpressApp()
        const queryBuilder = appServer.AppDataSource.getRepository(Bot)
            .createQueryBuilder('bot')
            .orderBy('bot.createdDate', 'DESC')

        if (workspaceId) {
            queryBuilder.andWhere('bot.workspaceId = :workspaceId', { workspaceId })
        }

        const bots = await queryBuilder.getMany()
        return bots
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: botsService.getAllBots - ${getErrorMessage(error)}`
        )
    }
}

// Get bot by ID
const getBotById = async (id: string) => {
    try {
        const appServer = getRunningExpressApp()
        const bot = await appServer.AppDataSource.getRepository(Bot).findOne({
            where: { id },
            relations: ['solutions']
        })

        if (!bot) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Bot ${id} not found`)
        }

        return bot
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: botsService.getBotById - ${getErrorMessage(error)}`
        )
    }
}

// Get the bots storage path
const getBotsPath = (): string => {
    const flowisePath = path.join(getUserHome(), '.flowise')
    const botsPath = path.join(flowisePath, 'bots')
    
    // Ensure the bots directory exists
    if (!fs.existsSync(botsPath)) {
        fs.mkdirSync(botsPath, { recursive: true })
        logger.info(`📁 Created bots directory at: ${botsPath}`)
    }
    
    return botsPath
}

// Create a new bot
const createBot = async (name: string, description?: string, workspaceId?: string) => {
    try {
        const appServer = getRunningExpressApp()
        const bot = new Bot()
        bot.name = name
        bot.description = description
        bot.workspaceId = workspaceId

        const newBot = await appServer.AppDataSource.getRepository(Bot).save(bot)
        
        // Create a folder for this bot
        try {
            const botsPath = getBotsPath()
            const botFolderPath = path.join(botsPath, newBot.id)
            
            if (!fs.existsSync(botFolderPath)) {
                fs.mkdirSync(botFolderPath, { recursive: true })
                logger.info(`📁 Created bot folder: ${botFolderPath}`)
                
                // Create a solutions subfolder
                const solutionsFolderPath = path.join(botFolderPath, 'solutions')
                fs.mkdirSync(solutionsFolderPath, { recursive: true })
                logger.info(`📁 Created solutions folder: ${solutionsFolderPath}`)
                
                // Create a README file with bot info
                const readmePath = path.join(botFolderPath, 'README.md')
                const readmeContent = `# ${newBot.name}\n\n${newBot.description || 'No description'}\n\n**Created:** ${newBot.createdDate}\n**Bot ID:** ${newBot.id}\n\nThis folder contains all solutions and files related to this bot.`
                fs.writeFileSync(readmePath, readmeContent, 'utf8')
            }
        } catch (folderError) {
            logger.error(`Error creating bot folder: ${getErrorMessage(folderError)}`)
            // Don't fail the bot creation if folder creation fails
        }
        
        return newBot
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: botsService.createBot - ${getErrorMessage(error)}`
        )
    }
}

// Update a bot
const updateBot = async (id: string, name?: string, description?: string) => {
    try {
        const appServer = getRunningExpressApp()
        const bot = await appServer.AppDataSource.getRepository(Bot).findOneBy({ id })

        if (!bot) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Bot ${id} not found`)
        }

        if (name) bot.name = name
        if (description !== undefined) bot.description = description

        const updatedBot = await appServer.AppDataSource.getRepository(Bot).save(bot)
        return updatedBot
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: botsService.updateBot - ${getErrorMessage(error)}`
        )
    }
}

// Delete a bot
const deleteBot = async (id: string) => {
    try {
        const appServer = getRunningExpressApp()
        
        // Delete all solutions associated with this bot (cascade should handle this, but let's be explicit)
        await appServer.AppDataSource.getRepository(Solution).delete({ botId: id })
        
        // Delete the bot
        const result = await appServer.AppDataSource.getRepository(Bot).delete({ id })
        
        if (result.affected === 0) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Bot ${id} not found`)
        }
        
        // Delete the bot's folder
        try {
            const botsPath = getBotsPath()
            const botFolderPath = path.join(botsPath, id)
            
            if (fs.existsSync(botFolderPath)) {
                fs.rmSync(botFolderPath, { recursive: true, force: true })
                logger.info(`🗑️ Deleted bot folder: ${botFolderPath}`)
            }
        } catch (folderError) {
            logger.error(`Error deleting bot folder: ${getErrorMessage(folderError)}`)
            // Don't fail the bot deletion if folder deletion fails
        }

        return result
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: botsService.deleteBot - ${getErrorMessage(error)}`
        )
    }
}

// Get the path for a specific bot
const getBotFolderPath = (botId: string): string => {
    return path.join(getBotsPath(), botId)
}

// Get the path for solutions in a bot
const getBotSolutionsFolderPath = (botId: string): string => {
    return path.join(getBotFolderPath(botId), 'solutions')
}

export default {
    getAllBots,
    getBotById,
    createBot,
    updateBot,
    deleteBot,
    getBotFolderPath,
    getBotSolutionsFolderPath,
    getBotsPath
}

