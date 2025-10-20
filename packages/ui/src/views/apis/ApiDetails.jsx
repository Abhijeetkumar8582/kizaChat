import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Tooltip,
    Divider,
    Select,
    FormControl,
    InputLabel,
    Alert,
    FormControlLabel,
    Checkbox
} from '@mui/material'
import {
    IconPlus,
    IconArrowLeft,
    IconTrash,
    IconPlayerPlay,
    IconCode,
    IconFlask,
    IconApi,
    IconEdit
} from '@tabler/icons-react'
import apisApi from '@/api/apis'
import { enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'

const ApiDetails = () => {
    const { apiId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const [api, setApi] = useState(null)
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [requestDialogOpen, setRequestDialogOpen] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [activeTab, setActiveTab] = useState(0)
    
    // Request form
    const [requestForm, setRequestForm] = useState({
        name: '',
        description: '',
        method: 'GET',
        path: '',
        body: '',
        tests: ''
    })
    
    // Request Type
    const [requestType, setRequestType] = useState('BODY_TEMPLATE')
    
    // Use full URL instead of base URL + path
    const [useFullUrl, setUseFullUrl] = useState(false)
    
    // Headers as key-value pairs
    const [headers, setHeaders] = useState([
        { key: 'Content-Type', value: 'application/json', enabled: true }
    ])
    
    // Params as key-value pairs
    const [params, setParams] = useState([
        { key: '', value: '', enabled: true }
    ])
    
    // Field Mapping (for field mapping type)
    const [fieldMappings, setFieldMappings] = useState([
        { key: '', value: '', enabled: true }
    ])
    
    // Response Configuration
    const [tokenQuery, setTokenQuery] = useState('')
    const [responseMapping, setResponseMapping] = useState([
        { key: '', value: '', enabled: true }
    ])
    
    // Test Results
    const [testRunning, setTestRunning] = useState(false)
    const [testResponse, setTestResponse] = useState(null)
    const [testError, setTestError] = useState(null)
    const [testResultTab, setTestResultTab] = useState(1) // 0 = Response JSON, 1 = Response Entity (default), 2 = Response Headers, 3 = Error

    useEffect(() => {
        loadApiData()
    }, [apiId])
    
    // Update Content-Type header when request type changes
    useEffect(() => {
        if (requestType === 'BODY_TEMPLATE') {
            updateHeader(0, 'value', 'application/json')
        } else if (requestType === 'FORM_DATA') {
            updateHeader(0, 'value', 'multipart/form-data')
        } else if (requestType === 'WWW_FORM_URLENCODED') {
            updateHeader(0, 'value', 'application/x-www-form-urlencoded')
        }
    }, [requestType])

    const loadApiData = async () => {
        try {
            setLoading(true)
            const [apiResponse, requestsResponse] = await Promise.all([
                apisApi.getApiById(apiId),
                apisApi.getRequestsByApiId(apiId)
            ])
            setApi(apiResponse.data)
            setRequests(requestsResponse.data)
        } catch (error) {
            console.error('Error loading API data:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to load API data',
                options: { variant: 'error' }
            }))
        } finally {
            setLoading(false)
        }
    }

    const handleCloseRequestDialog = () => {
        setRequestDialogOpen(false)
        setTestResponse(null)
        setTestError(null)
        setTestRunning(false)
        setTestResultTab(1) // Reset to Response Entity tab (default)
    }

    const handleOpenCreateRequest = () => {
        setEditMode(false)
        setRequestForm({
            name: '',
            description: '',
            method: 'GET',
            path: '',
            body: '',
            tests: ''
        })
        setRequestType('BODY_TEMPLATE')
        setHeaders([
            { key: 'Content-Type', value: 'application/json', enabled: true }
        ])
        setParams([
            { key: '', value: '', enabled: true }
        ])
        setFieldMappings([
            { key: '', value: '', enabled: true }
        ])
        setTokenQuery('')
        setResponseMapping([
            { key: '', value: '', enabled: true }
        ])
        setActiveTab(0)
        setRequestDialogOpen(true)
    }

    const handleOpenEditRequest = (request) => {
        setEditMode(true)
        setSelectedRequest(request)
        setRequestForm({
            name: request.name,
            description: request.description || '',
            method: request.method,
            path: request.path,
            body: request.body || '',
            tests: request.tests || ''
        })
        
        // Parse request type and full URL flag from variables
        try {
            const variablesObj = request.variables ? JSON.parse(request.variables) : {}
            setRequestType(variablesObj.requestType || 'BODY_TEMPLATE')
            setUseFullUrl(variablesObj.useFullUrl || false)
        } catch {
            setRequestType('BODY_TEMPLATE')
            setUseFullUrl(false)
        }
        
        // Parse headers from JSON
        try {
            const headersObj = request.headers ? JSON.parse(request.headers) : {}
            const headersArray = Object.entries(headersObj).map(([key, value]) => ({
                key,
                value,
                enabled: true
            }))
            setHeaders(headersArray.length > 0 ? headersArray : [{ key: 'Content-Type', value: 'application/json', enabled: true }])
        } catch {
            setHeaders([{ key: 'Content-Type', value: 'application/json', enabled: true }])
        }
        
        // Parse params from JSON
        try {
            const paramsObj = request.params ? JSON.parse(request.params) : {}
            const paramsArray = Object.entries(paramsObj).map(([key, value]) => ({
                key,
                value,
                enabled: true
            }))
            setParams(paramsArray.length > 0 ? paramsArray : [{ key: '', value: '', enabled: true }])
        } catch {
            setParams([{ key: '', value: '', enabled: true }])
        }
        
        // Parse field mappings from body if not BODY_TEMPLATE
        try {
            const variablesObj = request.variables ? JSON.parse(request.variables) : {}
            const reqType = variablesObj.requestType || 'BODY_TEMPLATE'
            
            if (reqType !== 'BODY_TEMPLATE' && request.body) {
                const bodyObj = JSON.parse(request.body)
                const mappingsArray = Object.entries(bodyObj).map(([key, value]) => ({
                    key,
                    value,
                    enabled: true
                }))
                setFieldMappings(mappingsArray.length > 0 ? mappingsArray : [{ key: '', value: '', enabled: true }])
            } else {
                setFieldMappings([{ key: '', value: '', enabled: true }])
            }
        } catch {
            setFieldMappings([{ key: '', value: '', enabled: true }])
        }
        
        // Parse response configuration from variables
        try {
            const variablesObj = request.variables ? JSON.parse(request.variables) : {}
            setTokenQuery(variablesObj.tokenQuery || '')
            
            if (variablesObj.responseMapping && Object.keys(variablesObj.responseMapping).length > 0) {
                const responseMappingsArray = Object.entries(variablesObj.responseMapping).map(([key, value]) => ({
                    key,
                    value,
                    enabled: true
                }))
                setResponseMapping(responseMappingsArray)
            } else {
                setResponseMapping([{ key: '', value: '', enabled: true }])
            }
        } catch {
            setTokenQuery('')
            setResponseMapping([{ key: '', value: '', enabled: true }])
        }
        
        setActiveTab(0)
        setRequestDialogOpen(true)
    }
    
    const addHeader = () => {
        setHeaders(prev => [...prev, { key: '', value: '', enabled: true }])
    }
    
    const removeHeader = (index) => {
        setHeaders(prev => prev.filter((_, i) => i !== index))
    }
    
    const updateHeader = (index, field, value) => {
        setHeaders(prev => prev.map((header, i) => 
            i === index ? { ...header, [field]: value } : header
        ))
    }
    
    const addParam = () => {
        setParams(prev => [...prev, { key: '', value: '', enabled: true }])
    }
    
    const removeParam = (index) => {
        setParams(prev => prev.filter((_, i) => i !== index))
    }
    
    const updateParam = (index, field, value) => {
        setParams(prev => prev.map((param, i) => 
            i === index ? { ...param, [field]: value } : param
        ))
    }
    
    const addFieldMapping = () => {
        setFieldMappings(prev => [...prev, { key: '', value: '', enabled: true }])
    }
    
    const removeFieldMapping = (index) => {
        setFieldMappings(prev => prev.filter((_, i) => i !== index))
    }
    
    const updateFieldMapping = (index, field, value) => {
        setFieldMappings(prev => prev.map((mapping, i) => 
            i === index ? { ...mapping, [field]: value } : mapping
        ))
    }
    
    const addResponseMapping = () => {
        setResponseMapping(prev => [...prev, { key: '', value: '', enabled: true }])
    }
    
    const removeResponseMapping = (index) => {
        setResponseMapping(prev => prev.filter((_, i) => i !== index))
    }
    
    const updateResponseMapping = (index, field, value) => {
        setResponseMapping(prev => prev.map((mapping, i) => 
            i === index ? { ...mapping, [field]: value } : mapping
        ))
    }

    const handleSaveRequest = async () => {
        try {
            // Convert headers array to JSON object
            const headersObj = {}
            headers.forEach(header => {
                if (header.key && header.enabled) {
                    headersObj[header.key] = header.value
                }
            })
            
            // Convert params array to JSON object
            const paramsObj = {}
            params.forEach(param => {
                if (param.key && param.enabled) {
                    paramsObj[param.key] = param.value
                }
            })
            
            // Convert field mappings for non-body-template types
            let finalBody = requestForm.body
            if (requestType !== 'BODY_TEMPLATE' && ['POST', 'PUT', 'PATCH'].includes(requestForm.method)) {
                const mappingsObj = {}
                fieldMappings.forEach(field => {
                    if (field.key && field.enabled) {
                        mappingsObj[field.key] = field.value
                    }
                })
                
                if (requestType === 'FIELD_MAPPING' || requestType === 'FORM_DATA' || requestType === 'WWW_FORM_URLENCODED') {
                    finalBody = JSON.stringify(mappingsObj)
                }
            }
            
            // Convert response mappings to object
            const responseMappingObj = {}
            responseMapping.forEach(mapping => {
                if (mapping.key && mapping.enabled) {
                    responseMappingObj[mapping.key] = mapping.value
                }
            })
            
            // Store request type and response config in variables for later retrieval
            const variablesObj = {
                requestType: requestType,
                tokenQuery: tokenQuery,
                responseMapping: responseMappingObj,
                useFullUrl: useFullUrl
            }
            
            const requestData = {
                ...requestForm,
                body: finalBody,
                apiId: apiId,
                headers: Object.keys(headersObj).length > 0 ? JSON.stringify(headersObj) : undefined,
                params: Object.keys(paramsObj).length > 0 ? JSON.stringify(paramsObj) : undefined,
                variables: JSON.stringify(variablesObj)
            }
            
            if (editMode) {
                const response = await apisApi.updateRequest(selectedRequest.id, requestData)
                setRequests(prev => prev.map(req => req.id === selectedRequest.id ? response.data : req))
                dispatch(enqueueSnackbarAction({
                    message: 'Request updated successfully',
                    options: { variant: 'success' }
                }))
            } else {
                const response = await apisApi.createRequest(requestData)
                setRequests(prev => [response.data, ...prev])
                dispatch(enqueueSnackbarAction({
                    message: 'Request created successfully',
                    options: { variant: 'success' }
                }))
            }
            
            handleCloseRequestDialog()
            setSelectedRequest(null)
        } catch (error) {
            console.error('Error saving request:', error)
            dispatch(enqueueSnackbarAction({
                message: `Failed to ${editMode ? 'update' : 'create'} request`,
                options: { variant: 'error' }
            }))
        }
    }

    const handleDeleteRequest = async (requestId) => {
        try {
            await apisApi.deleteRequest(requestId)
            setRequests(prev => prev.filter(req => req.id !== requestId))
            dispatch(enqueueSnackbarAction({
                message: 'Request deleted successfully',
                options: { variant: 'success' }
            }))
        } catch (error) {
            console.error('Error deleting request:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to delete request',
                options: { variant: 'error' }
            }))
        }
    }

    const handleExecuteRequest = async (requestId) => {
        try {
            const result = await apisApi.executeRequest(requestId, {})
            dispatch(enqueueSnackbarAction({
                message: `Request executed successfully (${result.data.response.status})`,
                options: { variant: 'success' }
            }))
        } catch (error) {
            console.error('Error executing request:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to execute request',
                options: { variant: 'error' }
            }))
        }
    }
    
    const handleRunTest = async () => {
        if (!selectedRequest && !editMode) return
        
        setTestRunning(true)
        setTestError(null)
        
        try {
            // First, save the request if in create mode
            if (!editMode) {
                await handleSaveRequest()
            }
            
            // Execute the request
            const requestId = editMode ? selectedRequest.id : requests[0]?.id
            if (!requestId) {
                throw new Error('No request to test')
            }
            
            const result = await apisApi.executeRequest(requestId, {})
            
            // Check Content-Type from headers
            let headers = {}
            if (result.data.response.headers) {
                if (typeof result.data.response.headers === 'string') {
                    try {
                        headers = JSON.parse(result.data.response.headers)
                    } catch (err) {
                        console.error('Failed to parse headers:', err)
                    }
                } else {
                    headers = result.data.response.headers
                }
            }
            const contentType = headers['content-type'] || headers['Content-Type'] || ''
            const isJson = contentType.includes('application/json')
            const isHtml = contentType.includes('text/html')
            
            // Parse response
            let responseJson = {}
            let isActuallyJson = false
            try {
                responseJson = JSON.parse(result.data.response.body)
                isActuallyJson = true
            } catch {
                // Not JSON - keep as raw text
                responseJson = result.data.response.body
            }
            
            // Extract token if token query is set (only for JSON)
            let extractedToken = null
            if (tokenQuery && isActuallyJson) {
                try {
                    // Parse JSONPath-like query (supports: [0].data[0].id or $.data[0].id or data.items[0].id)
                    let value = responseJson
                    let query = tokenQuery.trim()
                    
                    // Remove leading $ if present
                    if (query.startsWith('$')) {
                        query = query.substring(1)
                    }
                    
                    // Remove leading . if present
                    if (query.startsWith('.')) {
                        query = query.substring(1)
                    }
                    
                    // Split by . but keep array indices [0] intact
                    const parts = query.split(/\.(?![^\[]*\])/)
                    
                    for (const part of parts) {
                        if (!part) continue
                        if (value === null || value === undefined) break
                        
                        // Check if part has array index like "data[0]" or just "[0]"
                        const arrayMatch = part.match(/^([^\[]*)\[(\d+)\]$/)
                        if (arrayMatch) {
                            const [, propertyName, index] = arrayMatch
                            if (propertyName) {
                                value = value[propertyName]
                                if (value !== null && value !== undefined) {
                                    value = value[parseInt(index)]
                                }
                            } else {
                                value = value[parseInt(index)]
                            }
                        } else {
                            // Check if part is a numeric string (array index in dot notation like "0" in "data.0.id")
                            const numericIndex = parseInt(part)
                            if (!isNaN(numericIndex) && numericIndex.toString() === part && Array.isArray(value)) {
                                value = value[numericIndex]
                            } else {
                                value = value[part]
                            }
                        }
                    }
                    
                    extractedToken = value
                } catch (err) {
                    console.error('Failed to extract token:', err)
                }
            }
            
            // Map response data (only if JSON)
            const mappedData = {}
            if (isActuallyJson) {
                responseMapping.forEach(mapping => {
                    if (mapping.key && mapping.value && mapping.enabled) {
                        try {
                            // Build full path: tokenQuery (base path) + mapping.key (field name)
                            let fullPath = tokenQuery ? `${tokenQuery}.${mapping.key}` : mapping.key
                            
                            // Parse JSONPath-like query (supports: [0].data[0].id or $.data[0].id or data.items[0].id)
                            let value = responseJson
                            let query = fullPath.trim()
                            
                            // Remove leading $ if present
                            if (query.startsWith('$')) {
                                query = query.substring(1)
                            }
                            
                            // Remove leading . if present
                            if (query.startsWith('.')) {
                                query = query.substring(1)
                            }
                            
                            // Split by . but keep array indices [0] intact
                            const parts = query.split(/\.(?![^\[]*\])/)
                            
                            for (const part of parts) {
                                if (!part) continue
                                if (value === null || value === undefined) break
                                
                                // Check if part has array index like "data[0]" or just "[0]"
                                const arrayMatch = part.match(/^([^\[]*)\[(\d+)\]$/)
                                if (arrayMatch) {
                                    const [, propertyName, index] = arrayMatch
                                    if (propertyName) {
                                        value = value[propertyName]
                                        if (value !== null && value !== undefined) {
                                            value = value[parseInt(index)]
                                        }
                                    } else {
                                        value = value[parseInt(index)]
                                    }
                                } else {
                                    // Check if part is a numeric string (array index in dot notation like "0" in "data.0.id")
                                    const numericIndex = parseInt(part)
                                    if (!isNaN(numericIndex) && numericIndex.toString() === part && Array.isArray(value)) {
                                        value = value[numericIndex]
                                    } else {
                                        value = value[part]
                                    }
                                }
                            }
                            
                            mappedData[mapping.value] = value
                        } catch (err) {
                            mappedData[mapping.value] = null
                        }
                    }
                })
            }
            
            setTestResponse({
                status: result.data.response.status,
                headers: result.data.response.headers,
                body: responseJson,
                latency: result.data.response.latency,
                extractedToken,
                mappedData,
                contentType,
                isJson: isActuallyJson,
                isHtml
            })
            
            // Auto-switch to Error tab if status >= 400, otherwise Response Entity
            if (result.data.response.status >= 400) {
                setTestResultTab(3) // Error tab
            } else {
                setTestResultTab(1) // Response Entity tab
            }
            
            dispatch(enqueueSnackbarAction({
                message: `Test completed successfully (${result.data.response.status})`,
                options: { variant: 'success' }
            }))
        } catch (error) {
            console.error('Test execution error:', error)
            setTestError(error.message || 'Test execution failed')
            dispatch(enqueueSnackbarAction({
                message: 'Test execution failed',
                options: { variant: 'error' }
            }))
        } finally {
            setTestRunning(false)
        }
    }

    const getMethodColor = (method) => {
        switch (method) {
            case 'GET': return 'success'
            case 'POST': return 'primary'
            case 'PUT': return 'warning'
            case 'PATCH': return 'info'
            case 'DELETE': return 'error'
            default: return 'default'
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading API details...</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<IconArrowLeft />}
                    onClick={() => navigate('/apis')}
                    sx={{ mb: 2 }}
                >
                    Back to APIs
                </Button>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconApi size={32} />
                            {api?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {api?.baseUrl}
                        </Typography>
                        {api?.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {api.description}
                            </Typography>
                        )}
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<IconPlus />}
                        onClick={handleOpenCreateRequest}
                        sx={{ 
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)'
                            }
                        }}
                    >
                        New Request
                    </Button>
                </Box>
            </Box>

            {/* Requests Table */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Requests
                    </Typography>
                    
                    {requests.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                No requests created yet
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<IconPlus />}
                                onClick={handleOpenCreateRequest}
                            >
                                Create First Request
                            </Button>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Path</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {requests.map((request) => (
                                        <TableRow key={request.id} hover>
                                            <TableCell>
                                                <Chip 
                                                    label={request.method} 
                                                    size="small" 
                                                    color={getMethodColor(request.method)}
                                                    sx={{ fontWeight: 600, width: 70 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {request.name}
                                                </Typography>
                                                {request.description && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {request.description}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                    {request.path}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(request.createdDate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Execute">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleExecuteRequest(request.id)}
                                                        sx={{ color: 'success.main' }}
                                                    >
                                                        <IconPlayerPlay size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenEditRequest(request)}
                                                        sx={{ color: 'primary.main' }}
                                                    >
                                                        <IconEdit size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteRequest(request.id)}
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <IconTrash size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Request Dialog (Postman-like Interface) */}
            <Dialog open={requestDialogOpen} onClose={handleCloseRequestDialog} maxWidth="lg" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconCode size={24} />
                        {editMode ? 'Edit Request' : 'New Request'}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {/* Request Name and Description */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, pt: 1 }}>
                        <TextField
                            label="Request Name"
                            value={requestForm.name}
                            onChange={(e) => setRequestForm(prev => ({ ...prev, name: e.target.value }))}
                            fullWidth
                            required
                            placeholder="Get Users"
                        />
                        <TextField
                            label="Description"
                            value={requestForm.description}
                            onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                            fullWidth
                            placeholder="Fetches list of users"
                            size="small"
                        />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                            <Tab label="Request" />
                            <Tab label="Response" />
                            <Tab label="Test" />
                        </Tabs>
                    </Box>

                    {/* Request Tab */}
                    {activeTab === 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Remove Base URL Checkbox */}
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={useFullUrl}
                                        onChange={(e) => setUseFullUrl(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label="Remove baseurl"
                            />
                            
                            {/* Method and URL */}
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <FormControl sx={{ minWidth: 120 }}>
                                    <InputLabel>Method</InputLabel>
                                    <Select
                                        value={requestForm.method}
                                        onChange={(e) => setRequestForm(prev => ({ ...prev, method: e.target.value }))}
                                        label="Method"
                                    >
                                        <MenuItem value="GET">GET</MenuItem>
                                        <MenuItem value="POST">POST</MenuItem>
                                        <MenuItem value="PUT">PUT</MenuItem>
                                        <MenuItem value="PATCH">PATCH</MenuItem>
                                        <MenuItem value="DELETE">DELETE</MenuItem>
                                        <MenuItem value="HEAD">HEAD</MenuItem>
                                        <MenuItem value="OPTIONS">OPTIONS</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    label={useFullUrl ? "Full URL" : "Path"}
                                    value={requestForm.path}
                                    onChange={(e) => setRequestForm(prev => ({ ...prev, path: e.target.value }))}
                                    fullWidth
                                    required
                                    placeholder={useFullUrl ? "https://api.example.com/endpoint" : ""}
                                    helperText={useFullUrl ? "Enter the complete URL" : `Full URL: ${api?.baseUrl || ''}${requestForm.path}`}
                                />
                            </Box>

                            {/* Headers */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        Headers
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<IconPlus />}
                                        onClick={addHeader}
                                    >
                                        Add Header
                                    </Button>
                                </Box>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    {headers.map((header, index) => (
                                        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            <TextField
                                                label="Key"
                                                value={header.key}
                                                onChange={(e) => updateHeader(index, 'key', e.target.value)}
                                                size="small"
                                                sx={{ flex: 1 }}
                                                placeholder="Content-Type"
                                            />
                                            <TextField
                                                label="Value"
                                                value={header.value}
                                                onChange={(e) => updateHeader(index, 'value', e.target.value)}
                                                size="small"
                                                sx={{ flex: 1 }}
                                                placeholder="application/json"
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => removeHeader(index)}
                                                sx={{ color: 'error.main' }}
                                                disabled={headers.length === 1}
                                            >
                                                <IconTrash size={16} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Paper>
                            </Box>

                            {/* Request Type Selector - Right after Headers */}
                            {['POST', 'PUT', 'PATCH'].includes(requestForm.method) && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                        Request Type
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={requestType}
                                            onChange={(e) => setRequestType(e.target.value)}
                                        >
                                            <MenuItem value="FIELD_MAPPING">Field Mapping</MenuItem>
                                            <MenuItem value="BODY_TEMPLATE">Body Template</MenuItem>
                                            <MenuItem value="FORM_DATA">Use Form Data</MenuItem>
                                            <MenuItem value="WWW_FORM_URLENCODED">Use WWW-Form-URLEncoded</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            )}

                            {/* Query Parameters */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        Query Parameters
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<IconPlus />}
                                        onClick={addParam}
                                    >
                                        Add Parameter
                                    </Button>
                                </Box>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    {params.map((param, index) => (
                                        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            <TextField
                                                label="Key"
                                                value={param.key}
                                                onChange={(e) => updateParam(index, 'key', e.target.value)}
                                                size="small"
                                                sx={{ flex: 1 }}
                                                placeholder="page"
                                            />
                                            <TextField
                                                label="Value"
                                                value={param.value}
                                                onChange={(e) => updateParam(index, 'value', e.target.value)}
                                                size="small"
                                                sx={{ flex: 1 }}
                                                placeholder="1"
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => removeParam(index)}
                                                sx={{ color: 'error.main' }}
                                                disabled={params.length === 1}
                                            >
                                                <IconTrash size={16} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Paper>
                            </Box>

                            {/* Body Content based on Request Type */}
                            {['POST', 'PUT', 'PATCH'].includes(requestForm.method) && (
                                <Box>

                                    {/* Field Mapping */}
                                    {requestType === 'FIELD_MAPPING' && (
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    Field Mapping
                                                </Typography>
                                                <Button
                                                    size="small"
                                                    startIcon={<IconPlus />}
                                                    onClick={addFieldMapping}
                                                >
                                                    Add Field
                                                </Button>
                                            </Box>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                {fieldMappings.map((field, index) => (
                                                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                        <TextField
                                                            label="Field Name"
                                                            value={field.key}
                                                            onChange={(e) => updateFieldMapping(index, 'key', e.target.value)}
                                                            size="small"
                                                            sx={{ flex: 1 }}
                                                            placeholder="name"
                                                        />
                                                        <TextField
                                                            label="Field Value"
                                                            value={field.value}
                                                            onChange={(e) => updateFieldMapping(index, 'value', e.target.value)}
                                                            size="small"
                                                            sx={{ flex: 1 }}
                                                            placeholder="{{user.name}}"
                                                        />
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeFieldMapping(index)}
                                                            sx={{ color: 'error.main' }}
                                                            disabled={fieldMappings.length === 1}
                                                        >
                                                            <IconTrash size={16} />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Paper>
                                        </Box>
                                    )}

                                    {/* Body Template */}
                                    {requestType === 'BODY_TEMPLATE' && (
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                                Request Body (JSON or text)
                                            </Typography>
                                            <TextField
                                                value={requestForm.body}
                                                onChange={(e) => setRequestForm(prev => ({ ...prev, body: e.target.value }))}
                                                fullWidth
                                                multiline
                                                rows={8}
                                                placeholder='{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
                                                sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                                            />
                                        </Box>
                                    )}

                                    {/* Form Data */}
                                    {requestType === 'FORM_DATA' && (
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    Form Data Fields
                                                </Typography>
                                                <Button
                                                    size="small"
                                                    startIcon={<IconPlus />}
                                                    onClick={addFieldMapping}
                                                >
                                                    Add Field
                                                </Button>
                                            </Box>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                {fieldMappings.map((field, index) => (
                                                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                        <TextField
                                                            label="Key"
                                                            value={field.key}
                                                            onChange={(e) => updateFieldMapping(index, 'key', e.target.value)}
                                                            size="small"
                                                            sx={{ flex: 1 }}
                                                            placeholder="file"
                                                        />
                                                        <TextField
                                                            label="Value"
                                                            value={field.value}
                                                            onChange={(e) => updateFieldMapping(index, 'value', e.target.value)}
                                                            size="small"
                                                            sx={{ flex: 1 }}
                                                            placeholder="@file.pdf or text value"
                                                        />
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeFieldMapping(index)}
                                                            sx={{ color: 'error.main' }}
                                                            disabled={fieldMappings.length === 1}
                                                        >
                                                            <IconTrash size={16} />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Paper>
                                        </Box>
                                    )}

                                    {/* WWW-Form-URLEncoded */}
                                    {requestType === 'WWW_FORM_URLENCODED' && (
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    Form Fields
                                                </Typography>
                                                <Button
                                                    size="small"
                                                    startIcon={<IconPlus />}
                                                    onClick={addFieldMapping}
                                                >
                                                    Add Field
                                                </Button>
                                            </Box>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                {fieldMappings.map((field, index) => (
                                                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                        <TextField
                                                            label="Key"
                                                            value={field.key}
                                                            onChange={(e) => updateFieldMapping(index, 'key', e.target.value)}
                                                            size="small"
                                                            sx={{ flex: 1 }}
                                                            placeholder="username"
                                                        />
                                                        <TextField
                                                            label="Value"
                                                            value={field.value}
                                                            onChange={(e) => updateFieldMapping(index, 'value', e.target.value)}
                                                            size="small"
                                                            sx={{ flex: 1 }}
                                                            placeholder="john_doe"
                                                        />
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeFieldMapping(index)}
                                                            sx={{ color: 'error.main' }}
                                                            disabled={fieldMappings.length === 1}
                                                        >
                                                            <IconTrash size={16} />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Paper>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Response Tab */}
                    {activeTab === 1 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Select Token Query */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Select Token Query
                                </Typography>
                                <TextField
                                    value={tokenQuery}
                                    onChange={(e) => setTokenQuery(e.target.value)}
                                    fullWidth
                                    placeholder="0.data.0 or [0].data[0] or $.items[0]"
                                    helperText="Base path for data extraction. Response mappings will be relative to this path."
                                />
                            </Box>

                            {/* Response Data Mapping */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        Response Data Mapping
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<IconPlus />}
                                        onClick={addResponseMapping}
                                    >
                                        Add Mapping
                                    </Button>
                                </Box>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    {responseMapping.map((mapping, index) => (
                                        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            <TextField
                                                label="Field Name"
                                                value={mapping.key}
                                                onChange={(e) => updateResponseMapping(index, 'key', e.target.value)}
                                                size="small"
                                                sx={{ flex: 1 }}
                                                placeholder="id or Contact_Name or Email"
                                                helperText={tokenQuery ? `Full path: ${tokenQuery}.${mapping.key || '...'}` : 'Set base path in "Select Token Query" first'}
                                            />
                                            <TextField
                                                label="Variable Name"
                                                value={mapping.value}
                                                onChange={(e) => updateResponseMapping(index, 'value', e.target.value)}
                                                size="small"
                                                sx={{ flex: 1 }}
                                                placeholder="id"
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => removeResponseMapping(index)}
                                                sx={{ color: 'error.main' }}
                                                disabled={responseMapping.length === 1}
                                            >
                                                <IconTrash size={16} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Paper>
                            </Box>
                        </Box>
                    )}

                    {/* Test Tab */}
                    {activeTab === 2 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Test Button */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    startIcon={<IconPlayerPlay />}
                                    onClick={handleRunTest}
                                    disabled={testRunning || !requestForm.name || !requestForm.path}
                                    sx={{ minWidth: 200 }}
                                >
                                    {testRunning ? 'Running Test...' : 'Run Test'}
                                </Button>
                            </Box>

                            {/* Error Display */}
                            {testError && (
                                <Alert severity="error">
                                    <Typography variant="body2">{testError}</Typography>
                                </Alert>
                            )}

                            {/* Test Results - Tabbed Layout */}
                            {testResponse && (
                                <Box>
                                    {/* Status and Latency - Always Visible */}
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <Chip 
                                            label={`Status: ${testResponse.status}`}
                                            size="small"
                                            color={testResponse.status < 300 ? 'success' : 'error'}
                                        />
                                        <Chip 
                                            label={`${testResponse.latency}ms`}
                                            size="small"
                                            variant="outlined"
                                        />
                                        <Chip 
                                            label={testResponse.isJson ? 'JSON' : testResponse.isHtml ? 'HTML' : 'Text'}
                                            size="small"
                                            color={testResponse.isJson ? 'success' : 'warning'}
                                        />
                                    </Box>

                                    {/* Tabs for Response */}
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                        <Tabs value={testResultTab} onChange={(e, newValue) => setTestResultTab(newValue)}>
                                            <Tab label="Response JSON" />
                                            <Tab label="Response Entity" />
                                            <Tab label="Response Headers" />
                                            {testResponse.status >= 400 && (
                                                <Tab 
                                                    label="Error" 
                                                    sx={{ 
                                                        color: 'error.main',
                                                        '&.Mui-selected': { color: 'error.main' }
                                                    }} 
                                                />
                                            )}
                                        </Tabs>
                                    </Box>

                                    {/* Response JSON Tab */}
                                    {testResultTab === 0 && (
                                        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                                            <TextField
                                                value={testResponse.isJson ? JSON.stringify(testResponse.body, null, 2) : testResponse.body}
                                                fullWidth
                                                multiline
                                                rows={20}
                                                InputProps={{
                                                    readOnly: true,
                                                }}
                                                sx={{ 
                                                    fontFamily: 'monospace', 
                                                    fontSize: '0.85rem',
                                                    '& .MuiInputBase-input': {
                                                        color: 'text.primary'
                                                    }
                                                }}
                                            />
                                        </Paper>
                                    )}

                                    {/* Response Entity Tab */}
                                    {testResultTab === 1 && (
                                        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                                            {/* Show message if not JSON */}
                                            {!testResponse.isJson && (
                                                <Alert severity="info" sx={{ mb: 2 }}>
                                                    Token extraction and data mapping only work with JSON responses.
                                                    This response is {testResponse.isHtml ? 'HTML' : 'text'}.
                                                </Alert>
                                            )}
                                            
                                            {/* Mapped Data */}
                                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                                Mapped Data:
                                            </Typography>
                                            
                                            {Object.keys(testResponse.mappedData).length === 0 ? (
                                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                    No response mappings configured
                                                </Typography>
                                            ) : (
                                                <TableContainer component={Paper} variant="outlined">
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell sx={{ fontWeight: 600 }}>Variable</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }}>Extracted Value</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {Object.entries(testResponse.mappedData).map(([key, value]) => (
                                                                <TableRow key={key}>
                                                                    <TableCell sx={{ fontWeight: 500 }}>{key}</TableCell>
                                                                    <TableCell>
                                                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                                            {value !== null ? JSON.stringify(value) : 'null'}
                                                                        </Typography>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            )}
                                        </Paper>
                                    )}

                                    {/* Response Headers Tab */}
                                    {testResultTab === 2 && (
                                        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                                            <TextField
                                                value={JSON.stringify(testResponse.headers, null, 2)}
                                                fullWidth
                                                multiline
                                                rows={20}
                                                InputProps={{
                                                    readOnly: true,
                                                }}
                                                sx={{ 
                                                    fontFamily: 'monospace', 
                                                    fontSize: '0.85rem',
                                                    '& .MuiInputBase-input': {
                                                        color: 'text.primary'
                                                    }
                                                }}
                                            />
                                        </Paper>
                                    )}

                                    {/* Error Tab */}
                                    {testResultTab === 3 && testResponse.status >= 400 && (
                                        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                                            <Alert severity="error" sx={{ mb: 2 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    HTTP Error {testResponse.status}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {testResponse.status === 400 && 'Bad Request - The request was invalid or cannot be served.'}
                                                    {testResponse.status === 401 && 'Unauthorized - Authentication is required.'}
                                                    {testResponse.status === 403 && 'Forbidden - Access is denied.'}
                                                    {testResponse.status === 404 && 'Not Found - The requested resource was not found.'}
                                                    {testResponse.status === 500 && 'Internal Server Error - The server encountered an error.'}
                                                    {testResponse.status >= 500 && 'Server Error - The server is experiencing issues.'}
                                                    {testResponse.status >= 400 && testResponse.status < 500 && 'Client Error - The request cannot be fulfilled.'}
                                                </Typography>
                                            </Alert>
                                            
                                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                                Error Details:
                                            </Typography>
                                            
                                            <TextField
                                                value={testResponse.isJson ? JSON.stringify(testResponse.body, null, 2) : testResponse.body}
                                                fullWidth
                                                multiline
                                                rows={15}
                                                InputProps={{
                                                    readOnly: true,
                                                }}
                                                sx={{ 
                                                    fontFamily: 'monospace', 
                                                    fontSize: '0.85rem',
                                                    '& .MuiInputBase-input': {
                                                        color: 'error.main'
                                                    }
                                                }}
                                            />
                                            
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                                    Request Information:
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Chip 
                                                        label={`Method: ${requestForm.method}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip 
                                                        label={`URL: ${requestForm.path}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip 
                                                        label={`Latency: ${testResponse.latency}ms`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            </Box>
                                        </Paper>
                                    )}
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRequestDialog}>Cancel</Button>
                    <Button 
                        onClick={handleSaveRequest} 
                        variant="contained"
                        disabled={!requestForm.name || !requestForm.path}
                    >
                        {editMode ? 'Update Request' : 'Create Request'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default ApiDetails
