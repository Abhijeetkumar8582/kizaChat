import express from 'express'
import apisController from '../../controllers/apis'

const router = express.Router()

// API Management Routes
router.get('/', apisController.getAllApis)
router.get('/:id', apisController.getApiById)
router.post('/', apisController.createApi)
router.put('/:id', apisController.updateApi)
router.delete('/:id', apisController.deleteApi)

// Request Management Routes
router.get('/:apiId/requests', apisController.getRequestsByApiId)
router.post('/requests', apisController.createRequest)
router.put('/requests/:id', apisController.updateRequest)
router.delete('/requests/:id', apisController.deleteRequest)

// Execution Routes
router.post('/requests/:id/execute', apisController.executeRequest)
router.get('/requests/:requestId/executions', apisController.getExecutionsByRequestId)

// Collection Execution
router.post('/:apiId/execute-collection', apisController.executeCollection)

// Request Ordering
router.put('/requests/:requestId/order', apisController.updateRequestOrder)

export default router

