import express from 'express'
import orchestratorController from '../../controllers/orchestrator'

const router = express.Router()

// POST /api/v1/orchestrator/chat
router.post('/chat', orchestratorController.handleChat)

export default router

