import express from 'express'
import entitiesController from '../../controllers/entities'

const router = express.Router()

router.get('/', entitiesController.getAllEntities)
router.get('/:id', entitiesController.getEntityById)
router.post('/', entitiesController.createEntity)
router.put('/:id', entitiesController.updateEntity)
router.delete('/:id', entitiesController.deleteEntity)

export default router

