import express from 'express'
import agenticController from '../../controllers/agentic'

const router = express.Router()

// Generate flow from description
router.post('/generate', agenticController.generateFlow)

// Analyze existing flow
router.get('/analyze/:id', agenticController.analyzeFlow)

// Debug flow error
router.post('/debug', agenticController.debugFlow)

// Get insights
router.get('/insights', agenticController.getInsights)

// Get smart suggestions
router.post('/suggestions', agenticController.getSmartSuggestions)

// Send chat message with function calling
router.post('/chat', agenticController.sendChatMessage)

export default router
