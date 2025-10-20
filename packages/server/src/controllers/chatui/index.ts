import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import chatUIService from '../../services/chatui'
import { getErrorMessage } from '../../errors/utils'
import logger from '../../utils/logger'

// Get all bots with their ChatUI configurations
const getAllBotsWithChatUI = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.query.workspaceId as string
        const bots = await chatUIService.getAllBotsWithChatUI(workspaceId)
        return res.json(bots)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

// Get ChatUI configuration for a specific bot
const getChatUIByBotId = async (req: Request, res: Response) => {
    try {
        const { botId } = req.params
        const chatUI = await chatUIService.getChatUIByBotId(botId)
        return res.json(chatUI)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

// Save ChatUI configuration
const saveChatUI = async (req: Request, res: Response) => {
    try {
        const { botId } = req.params
        const chatUI = await chatUIService.saveChatUI(botId, req.body)
        logger.info(`📝 Saved Chat UI configuration for bot: ${botId}`)
        return res.json(chatUI)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

// Delete ChatUI configuration
const deleteChatUI = async (req: Request, res: Response) => {
    try {
        const { botId } = req.params
        await chatUIService.deleteChatUI(botId)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

// Generate embed code
const generateEmbedCode = async (req: Request, res: Response) => {
    try {
        const { botId } = req.params
        const { isProduction } = req.body
        const result = await chatUIService.generateEmbedCode(botId, isProduction)
        return res.json(result)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

// Reset to default configuration
const resetToDefault = async (req: Request, res: Response) => {
    try {
        const { botId } = req.params
        const chatUI = await chatUIService.resetToDefault(botId)
        logger.info(`🔄 Reset Chat UI configuration to default for bot: ${botId}`)
        return res.json(chatUI)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

export default {
    getAllBotsWithChatUI,
    getChatUIByBotId,
    saveChatUI,
    deleteChatUI,
    generateEmbedCode,
    resetToDefault
}

