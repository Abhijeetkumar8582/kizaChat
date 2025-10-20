import client from './client'

// API Management
const getAllApis = () => client.get('/apis')

const getApiById = (id) => client.get(`/apis/${id}`)

const createApi = (body) => client.post('/apis', body)

const updateApi = (id, body) => client.put(`/apis/${id}`, body)

const deleteApi = (id) => client.delete(`/apis/${id}`)

// Request Management
const getRequestsByApiId = (apiId) => client.get(`/apis/${apiId}/requests`)

const createRequest = (body) => client.post('/apis/requests', body)

const updateRequest = (id, body) => client.put(`/apis/requests/${id}`, body)

const deleteRequest = (id) => client.delete(`/apis/requests/${id}`)

// Execution
const executeRequest = (id, variables) => client.post(`/apis/requests/${id}/execute`, { variables })

const getExecutionsByRequestId = (requestId, limit = 50) => client.get(`/apis/requests/${requestId}/executions?limit=${limit}`)

const executeCollection = (apiId) => client.post(`/apis/${apiId}/execute-collection`)

// Request Ordering
const updateRequestOrder = (requestId, executionOrder) => client.put(`/apis/requests/${requestId}/order`, { executionOrder })

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
    
    // Ordering
    updateRequestOrder
}

