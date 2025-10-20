import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import apisService from '../../services/apis'
import { getErrorMessage } from '../../errors/utils'
import logger from '../../utils/logger'

// API Management Controllers
const getAllApis = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.query.workspaceId as string
        const apis = await apisService.getAllApis(workspaceId)
        return res.json(apis)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

const getApiById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const api = await apisService.getApiById(id)
        return res.json(api)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

const createApi = async (req: Request, res: Response) => {
    try {
        const api = await apisService.createApi(req.body)
        logger.info(`📝 Created API: ${api.name}`)
        return res.status(StatusCodes.CREATED).json(api)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

const updateApi = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const api = await apisService.updateApi(id, req.body)
        logger.info(`📝 Updated API: ${api.name}`)
        return res.json(api)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

const deleteApi = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await apisService.deleteApi(id)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

// Request Management Controllers
const getRequestsByApiId = async (req: Request, res: Response) => {
    try {
        const { apiId } = req.params
        const requests = await apisService.getRequestsByApiId(apiId)
        return res.json(requests)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

const createRequest = async (req: Request, res: Response) => {
    try {
        const request = await apisService.createRequest(req.body)
        logger.info(`📝 Created API request: ${request.name}`)
        return res.status(StatusCodes.CREATED).json(request)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

const updateRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const request = await apisService.updateRequest(id, req.body)
        logger.info(`📝 Updated API request: ${request.name}`)
        return res.json(request)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

const deleteRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await apisService.deleteRequest(id)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

// Execution Controllers
const executeRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { variables } = req.body
        const result = await apisService.executeRequest(id, variables)
        return res.json(result)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

const getExecutionsByRequestId = async (req: Request, res: Response) => {
    try {
        const { requestId } = req.params
        const limit = parseInt(req.query.limit as string) || 50
        const executions = await apisService.getExecutionsByRequestId(requestId, limit)
        return res.json(executions)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

// Execute API collection
const executeCollection = async (req: Request, res: Response) => {
    try {
        const { apiId } = req.params
        const result = await apisService.executeCollection(apiId)
        return res.json(result)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

// Update request order
const updateRequestOrder = async (req: Request, res: Response) => {
    try {
        const { requestId } = req.params
        const { executionOrder } = req.body
        const result = await apisService.updateRequestOrder(requestId, executionOrder)
        return res.json(result)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getErrorMessage(error) })
    }
}

export default {
    // API Management
    getAllApis,
    getApiById,
    createApi,
    updateApi,
    deleteApi,
    
    // Request Management
    getRequestsByApiId,
    createRequest,
    updateRequest,
    deleteRequest,
    
    // Execution
    executeRequest,
    getExecutionsByRequestId,
    executeCollection,
    updateRequestOrder
}
