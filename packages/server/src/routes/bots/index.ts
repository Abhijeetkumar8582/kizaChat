import express from 'express'
import botsController from '../../controllers/bots'

const router = express.Router()

// Get all bots
router.get('/', botsController.getAllBots)

// Get bot by ID
router.get('/:id', botsController.getBotById)

// Create a new bot
router.post('/', botsController.createBot)

// Update a bot
router.patch('/:id', botsController.updateBot)

// Delete a bot
router.delete('/:id', botsController.deleteBot)

export default router

