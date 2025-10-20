import express from 'express'
import chatUIController from '../../controllers/chatui'

const router = express.Router()

// ChatUI Management Routes
router.get('/bots', chatUIController.getAllBotsWithChatUI)
router.get('/:botId', chatUIController.getChatUIByBotId)
router.post('/:botId', chatUIController.saveChatUI)
router.put('/:botId', chatUIController.saveChatUI)
router.delete('/:botId', chatUIController.deleteChatUI)

// Embed Code Generation
router.post('/:botId/embed', chatUIController.generateEmbedCode)
router.post('/:botId/reset', chatUIController.resetToDefault)

export default router

