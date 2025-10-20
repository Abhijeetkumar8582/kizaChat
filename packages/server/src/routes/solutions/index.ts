import express from 'express'
import solutionsController from '../../controllers/solutions'

const router = express.Router()

// Get all solutions for a bot
router.get('/bot/:botId', solutionsController.getSolutionsByBotId)

// Get solution by ID
router.get('/:id', solutionsController.getSolutionById)

// Create a new solution
router.post('/', solutionsController.createSolution)

// Update a solution
router.patch('/:id', solutionsController.updateSolution)

// Delete a solution
router.delete('/:id', solutionsController.deleteSolution)

export default router

