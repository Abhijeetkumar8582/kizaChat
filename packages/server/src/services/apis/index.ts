import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { Api, AuthType } from '../../database/entities/Api'
import { ApiRequest, HttpMethod } from '../../database/entities/ApiRequest'
import { ApiExecution, ExecutionStatus } from '../../database/entities/ApiExecution'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'
import { StatusCodes } from 'http-status-codes'
import logger from '../../utils/logger'

// API Management
const getAllApis = async (workspaceId?: string) => {
    const appServer = getRunningExpressApp()
    const apiRepository = appServer.AppDataSource.getRepository(Api)
    
    const where: any = {}
    if (workspaceId) {
        where.workspaceId = workspaceId
    }
    
    return await apiRepository.find({
        where,
        relations: ['requests'],
        order: { createdDate: 'DESC' }
    })
}

const getApiById = async (id: string) => {
    const appServer = getRunningExpressApp()
    const apiRepository = appServer.AppDataSource.getRepository(Api)
    
    const api = await apiRepository.findOne({
        where: { id },
        relations: ['requests']
    })
    
    if (!api) {
        throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'API not found')
    }
    
    return api
}

const createApi = async (apiData: {
    name: string
    description?: string
    baseUrl: string
    authType?: AuthType
    authConfig?: string
    defaultHeaders?: string
    environmentBindings?: string
    tags?: string
    workspaceId?: string
}) => {
    const appServer = getRunningExpressApp()
    const apiRepository = appServer.AppDataSource.getRepository(Api)
    
    const api = apiRepository.create({
        name: apiData.name,
        description: apiData.description,
        baseUrl: apiData.baseUrl,
        authType: apiData.authType || AuthType.NONE,
        authConfig: apiData.authConfig,
        defaultHeaders: apiData.defaultHeaders,
        environmentBindings: apiData.environmentBindings,
        tags: apiData.tags,
        workspaceId: apiData.workspaceId
    })
    
    return await apiRepository.save(api)
}

const updateApi = async (id: string, apiData: Partial<{
    name: string
    description: string
    baseUrl: string
    authType: AuthType
    authConfig: string
    defaultHeaders: string
    environmentBindings: string
    tags: string
}>) => {
    const appServer = getRunningExpressApp()
    const apiRepository = appServer.AppDataSource.getRepository(Api)
    
    const api = await getApiById(id)
    
    Object.assign(api, apiData)
    
    return await apiRepository.save(api)
}

const deleteApi = async (id: string) => {
    const appServer = getRunningExpressApp()
    const apiRepository = appServer.AppDataSource.getRepository(Api)
    
    const api = await getApiById(id)
    
    await apiRepository.remove(api)
    
    logger.info(`🗑️ Deleted API: ${api.name}`)
}

// API Request Management
const getRequestsByApiId = async (apiId: string) => {
    const appServer = getRunningExpressApp()
    const requestRepository = appServer.AppDataSource.getRepository(ApiRequest)
    
    return await requestRepository.find({
        where: { apiId },
        order: { createdDate: 'DESC' }
    })
}

const createRequest = async (requestData: {
    name: string
    description?: string
    method: HttpMethod
    path: string
    headers?: string
    params?: string
    body?: string
    tests?: string
    variables?: string
    apiId: string
    workspaceId?: string
}) => {
    const appServer = getRunningExpressApp()
    const requestRepository = appServer.AppDataSource.getRepository(ApiRequest)
    
    const request = requestRepository.create({
        name: requestData.name,
        description: requestData.description,
        method: requestData.method,
        path: requestData.path,
        headers: requestData.headers,
        params: requestData.params,
        body: requestData.body,
        tests: requestData.tests,
        variables: requestData.variables,
        apiId: requestData.apiId,
        workspaceId: requestData.workspaceId
    })
    
    return await requestRepository.save(request)
}

const updateRequest = async (id: string, requestData: Partial<{
    name: string
    description: string
    method: HttpMethod
    path: string
    headers: string
    params: string
    body: string
    tests: string
    variables: string
    version: string
    changelog: string
}>) => {
    const appServer = getRunningExpressApp()
    const requestRepository = appServer.AppDataSource.getRepository(ApiRequest)
    
    const request = await requestRepository.findOneBy({ id })
    if (!request) {
        throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Request not found')
    }
    
    Object.assign(request, requestData)
    
    return await requestRepository.save(request)
}

const deleteRequest = async (id: string) => {
    const appServer = getRunningExpressApp()
    const requestRepository = appServer.AppDataSource.getRepository(ApiRequest)
    
    const request = await requestRepository.findOneBy({ id })
    if (!request) {
        throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Request not found')
    }
    
    await requestRepository.remove(request)
    
    logger.info(`🗑️ Deleted API request: ${request.name}`)
}

// API Execution
const executeRequest = async (requestId: string, variables?: Record<string, any>) => {
    const appServer = getRunningExpressApp()
    const requestRepository = appServer.AppDataSource.getRepository(ApiRequest)
    const executionRepository = appServer.AppDataSource.getRepository(ApiExecution)
    
    const request = await requestRepository.findOne({
        where: { id: requestId },
        relations: ['api']
    })
    
    if (!request) {
        throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Request not found')
    }
    
    const startTime = Date.now()
    
    try {
        // Build the full URL
        let fullUrl: string
        
        // Check if using full URL (stored in variables)
        const requestVariables = request.variables ? JSON.parse(request.variables) : {}
        const useFullUrl = requestVariables.useFullUrl === true
        
        if (useFullUrl) {
            // Use the path as the complete URL
            fullUrl = request.path
        } else {
            // Build URL from base URL + path
            let baseUrl = request.api.baseUrl
            let path = request.path
            
            // Ensure baseUrl ends with / and path starts without /
            if (!baseUrl.endsWith('/')) {
                baseUrl += '/'
            }
            if (path.startsWith('/')) {
                path = path.substring(1)
            }
            
            fullUrl = `${baseUrl}${path}`
        }
        
        // Parse headers, params, and body
        const headers = request.headers ? JSON.parse(request.headers) : {}
        const params = request.params ? JSON.parse(request.params) : {}
        const body = request.body || undefined
        
        // Apply variables if provided
        let processedUrl = fullUrl
        let processedHeaders = { ...headers }
        let processedBody = body
        
        if (variables) {
            // Replace variables in URL
            Object.entries(variables).forEach(([key, value]) => {
                processedUrl = processedUrl.replace(`{{${key}}}`, String(value))
            })
            
            // Replace variables in headers
            Object.entries(processedHeaders).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    Object.entries(variables).forEach(([varKey, varValue]) => {
                        processedHeaders[key] = value.replace(`{{${varKey}}}`, String(varValue))
                    })
                }
            })
            
            // Replace variables in body
            if (processedBody && typeof processedBody === 'string') {
                let updatedBody = processedBody
                Object.entries(variables).forEach(([key, value]) => {
                    updatedBody = updatedBody.replace(`{{${key}}}`, String(value))
                })
                processedBody = updatedBody
            }
        }
        
        // Make the HTTP request
        const fetchOptions: any = {
            method: request.method,
            headers: processedHeaders
        }
        
        if (body && processedBody && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
            fetchOptions.body = processedBody
        }
        
        const response = await fetch(processedUrl, fetchOptions)
        const responseBody = await response.text()
        const responseHeaders = Object.fromEntries(response.headers.entries())
        
        const latency = Date.now() - startTime
        
        // Create execution record
        const execution = executionRepository.create({
            requestId,
            status: response.ok ? ExecutionStatus.SUCCESS : ExecutionStatus.ERROR,
            statusCode: response.status,
            responseHeaders: JSON.stringify(responseHeaders),
            responseBody,
            latency,
            responseSize: responseBody.length,
            variables: variables ? JSON.stringify(variables) : undefined
        })
        
        const savedExecution = await executionRepository.save(execution)
        
        logger.info(`✅ Executed API request: ${request.name} (${response.status}) - ${latency}ms`)
        
        return {
            execution: savedExecution,
            response: {
                status: response.status,
                headers: responseHeaders,
                body: responseBody,
                latency
            }
        }
        
    } catch (error) {
        const latency = Date.now() - startTime
        
        // Create error execution record
        const execution = executionRepository.create({
            requestId,
            status: ExecutionStatus.ERROR,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            latency
        })
        
        const savedExecution = await executionRepository.save(execution)
        
        logger.error(`❌ Failed to execute API request: ${request.name}`, error)
        
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Request execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }
}

const getExecutionsByRequestId = async (requestId: string, limit: number = 50) => {
    const appServer = getRunningExpressApp()
    const executionRepository = appServer.AppDataSource.getRepository(ApiExecution)
    
    return await executionRepository.find({
        where: { requestId },
        order: { executedDate: 'DESC' },
        take: limit
    })
}

// Execute API collection (all requests in sequence with variable chaining)
const executeCollection = async (apiId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        
        // Get API with all requests ordered by executionOrder
        const api = await appServer.AppDataSource.getRepository(Api).findOne({
            where: { id: apiId },
            relations: ['requests']
        })
        
        if (!api) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `API ${apiId} not found`)
        }
        
        // Sort requests by executionOrder
        const sortedRequests = api.requests.sort((a, b) => a.executionOrder - b.executionOrder)
        
        // Variable store for chaining
        const variables: Record<string, any> = {}
        const results: any[] = []
        
        // Execute each request in sequence
        for (const request of sortedRequests) {
            try {
                // Parse request data
                let processedHeaders = request.headers ? JSON.parse(request.headers) : {}
                let processedParams = request.params ? JSON.parse(request.params) : {}
                let processedBody = request.body
                let processedPath = request.path
                
                // Get request variables
                const requestVariables = request.variables ? JSON.parse(request.variables) : {}
                const responseMapping = requestVariables.responseMapping || []
                
                // Replace {{variable}} syntax with stored values
                Object.entries(variables).forEach(([key, value]) => {
                    const placeholder = `{{${key}}}`
                    processedPath = processedPath.replace(placeholder, String(value))
                    
                    // Replace in headers
                    Object.keys(processedHeaders).forEach(headerKey => {
                        if (typeof processedHeaders[headerKey] === 'string') {
                            processedHeaders[headerKey] = processedHeaders[headerKey].replace(placeholder, String(value))
                        }
                    })
                    
                    // Replace in params
                    Object.keys(processedParams).forEach(paramKey => {
                        if (typeof processedParams[paramKey] === 'string') {
                            processedParams[paramKey] = processedParams[paramKey].replace(placeholder, String(value))
                        }
                    })
                    
                    // Replace in body
                    if (processedBody && typeof processedBody === 'string') {
                        processedBody = processedBody.replace(placeholder, String(value))
                    }
                })
                
                // Build URL
                const useFullUrl = requestVariables.useFullUrl === true
                let fullUrl: string
                
                if (useFullUrl) {
                    fullUrl = processedPath
                } else {
                    let baseUrl = api.baseUrl
                    let path = processedPath
                    if (!baseUrl.endsWith('/')) baseUrl += '/'
                    if (path.startsWith('/')) path = path.substring(1)
                    fullUrl = `${baseUrl}${path}`
                }
                
                // Add query params
                if (Object.keys(processedParams).length > 0) {
                    fullUrl += '?' + new URLSearchParams(processedParams).toString()
                }
                
                // Set Content-Type
                const requestType = requestVariables.requestType || 'BODY_TEMPLATE'
                if (!processedHeaders['Content-Type']) {
                    if (requestType === 'FORM_DATA') {
                        processedHeaders['Content-Type'] = 'multipart/form-data'
                    } else if (requestType === 'WWW_FORM_URLENCODED') {
                        processedHeaders['Content-Type'] = 'application/x-www-form-urlencoded'
                    } else {
                        processedHeaders['Content-Type'] = 'application/json'
                    }
                }
                
                // Execute request
                const startTime = Date.now()
                const response = await fetch(fullUrl, {
                    method: request.method,
                    headers: processedHeaders,
                    body: ['GET', 'HEAD'].includes(request.method) ? undefined : processedBody
                })
                const latency = Date.now() - startTime
                
                // Parse response
                const responseHeaders: Record<string, string> = {}
                response.headers.forEach((value, key) => {
                    responseHeaders[key] = value
                })
                
                const responseText = await response.text()
                let responseBody: any = responseText
                
                try {
                    responseBody = JSON.parse(responseText)
                } catch (e) {
                    // Not JSON
                }
                
                // Extract variables from response
                if (responseMapping && Array.isArray(responseMapping) && typeof responseBody === 'object') {
                    responseMapping.forEach((mapping: any) => {
                        if (mapping.key && mapping.value) {
                            const path = mapping.key.split(/[\.\[\]]/).filter((p: string) => p)
                            let value = responseBody
                            
                            for (const part of path) {
                                if (value === null || value === undefined) break
                                if (Array.isArray(value) && !isNaN(Number(part))) {
                                    value = value[Number(part)]
                                } else if (typeof value === 'object') {
                                    value = value[part]
                                } else {
                                    break
                                }
                            }
                            
                            if (value !== null && value !== undefined) {
                                variables[mapping.value] = value
                            }
                        }
                    })
                }
                
                results.push({
                    requestId: request.id,
                    requestName: request.name,
                    status: response.status,
                    latency,
                    headers: responseHeaders,
                    body: responseBody,
                    extractedVariables: { ...variables }
                })
                
            } catch (error: any) {
                results.push({
                    requestId: request.id,
                    requestName: request.name,
                    error: error.message,
                    extractedVariables: { ...variables }
                })
            }
        }
        
        return {
            apiId,
            apiName: api.name,
            totalRequests: sortedRequests.length,
            results,
            finalVariables: variables
        }
        
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: apisService.executeCollection - ${getErrorMessage(error)}`
        )
    }
}

// Update request execution order
const updateRequestOrder = async (requestId: string, newOrder: number): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const request = await appServer.AppDataSource.getRepository(ApiRequest).findOneBy({ id: requestId })
        
        if (!request) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Request ${requestId} not found`)
        }
        
        request.executionOrder = newOrder
        return await appServer.AppDataSource.getRepository(ApiRequest).save(request)
        
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: apisService.updateRequestOrder - ${getErrorMessage(error)}`
        )
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

