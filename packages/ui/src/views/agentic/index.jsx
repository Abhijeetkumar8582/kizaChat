import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Box,
    Grid,
    TextField,
    Typography,
    Paper,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Slider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Divider,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    Stack,
    Alert
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconRobot, IconPlus, IconTrash, IconFile, IconTool, IconSettings, IconEdit, IconVariable, IconApi, IconFunction, IconMaximize, IconSend, IconUser, IconRefresh, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react'

// Project imports
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import documentStoreApi from '@/api/documentstore'
import agenticApi from '@/api/agentic'
import credentialsApi from '@/api/credentials'
import solutionsApi from '@/api/solutions'
import orchestratorApi from '@/api/orchestrator'
import robotPNG from '@/assets/images/robot.png'
import userPNG from '@/assets/images/account.png'
import { useDispatch } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'

const MODELS = [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' }
]

const DATA_TYPES = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'array', label: 'Array' },
    { value: 'object', label: 'Object' }
]

const Agentic = () => {
    const theme = useTheme()
    const chatMessagesRef = useRef(null)
    const { solutionId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    // Solution state
    const [solution, setSolution] = useState(null)
    const [isLoadingSolution, setIsLoadingSolution] = useState(false)
    const [isOrchestrator, setIsOrchestrator] = useState(false)
    const [siblingSolutions, setSiblingSolutions] = useState([]) // For orchestrator agent transfer
    
    // State management
    const [welcomeMessage, setWelcomeMessage] = useState('Hi there! How can I help you today?')
    const [prompt, setPrompt] = useState('')
    const [selectedModel, setSelectedModel] = useState('gpt-4o')
    const [temperature, setTemperature] = useState(0.7)
    const [maxTokens, setMaxTokens] = useState(2000)
    const [topP, setTopP] = useState(1.0)
    
    // Credentials state
    const [credentials, setCredentials] = useState([])
    const [credentialsFetched, setCredentialsFetched] = useState(false)
    const [selectedCredential, setSelectedCredential] = useState('')
    const [bearerToken, setBearerToken] = useState('')
    const [fullApiKey, setFullApiKey] = useState('')
    
    // Tools state
    const [tools, setTools] = useState([])
    const [toolDialogOpen, setToolDialogOpen] = useState(false)
    const [currentTool, setCurrentTool] = useState({
        name: '',
        description: '',
        parameters: []
    })
    
    // Parameter state
    const [parameterDialogOpen, setParameterDialogOpen] = useState(false)
    const [currentParameter, setCurrentParameter] = useState({
        name: '',
        description: '',
        datatype: 'string',
        required: false
    })
    
    // Documents state
    const [documents, setDocuments] = useState([
        { id: 1, name: 'Sample Document.pdf', type: 'PDF', size: '2.5 MB', added: '2024-01-15' }
    ])
    const [documentStoreDialogOpen, setDocumentStoreDialogOpen] = useState(false)
    const [documentStores, setDocumentStores] = useState([])
    const [selectedDocumentStore, setSelectedDocumentStore] = useState('')
    
    // Prompt Dialog state
    const [promptDialogOpen, setPromptDialogOpen] = useState(false)
    
    // Chat state
    const getInitialMessage = () => [{
        id: 1,
        type: 'apiMessage',
        message: welcomeMessage,
        timestamp: new Date().toISOString()
    }]
    
    const [chatMessages, setChatMessages] = useState(getInitialMessage())
    const [chatInput, setChatInput] = useState('')
    const [isChatLoading, setIsChatLoading] = useState(false)
    
    // Tool Response state
    const [toolResponses, setToolResponses] = useState([])
    const [toolResponseDialogOpen, setToolResponseDialogOpen] = useState(false)
    const [currentToolResponse, setCurrentToolResponse] = useState({
        toolId: null,
        toolName: '',
        queryVariables: [],
        selectedApi: '',
        variableMappings: [],
        functionResponse: { type: 'string', value: '' }
    })
    
    // Temporary state for editing inside dialog
    const [tempQueryVar, setTempQueryVar] = useState({ name: '', code: '' })
    const [tempMapping, setTempMapping] = useState({ varName: '', apiPath: '' })
    
    // API list for dropdown
    const [apiList] = useState([
        { value: 'api1', label: 'API 1 - Search API' },
        { value: 'api2', label: 'API 2 - Data API' },
        { value: 'api3', label: 'API 3 - Custom API' }
    ])

    // Tool Dialog Handlers
    const handleOpenToolDialog = () => {
        setCurrentTool({
            name: '',
            description: '',
            parameters: []
        })
        setToolDialogOpen(true)
    }

    const handleCloseToolDialog = () => {
        setToolDialogOpen(false)
        setCurrentTool({
            name: '',
            description: '',
            parameters: []
        })
    }

    const handleSaveTool = () => {
        if (currentTool.name && currentTool.description) {
            const newTool = {
                id: tools.length + 1,
                ...currentTool,
                created: new Date().toISOString().split('T')[0]
            }
            setTools([...tools, newTool])
            handleCloseToolDialog()
        }
    }

    const handleDeleteTool = (id) => {
        setTools(tools.filter(tool => tool.id !== id))
    }

    // Parameter Dialog Handlers
    const handleOpenParameterDialog = () => {
        setCurrentParameter({
            name: '',
            description: '',
            datatype: 'string',
            required: false
        })
        setParameterDialogOpen(true)
    }

    const handleCloseParameterDialog = () => {
        setParameterDialogOpen(false)
        setCurrentParameter({
            name: '',
            description: '',
            datatype: 'string',
            required: false
        })
    }

    const handleSaveParameter = () => {
        if (currentParameter.name) {
            const newParameter = {
                id: currentTool.parameters.length + 1,
                ...currentParameter
            }
            setCurrentTool({
                ...currentTool,
                parameters: [...currentTool.parameters, newParameter]
            })
            handleCloseParameterDialog()
        }
    }

    const handleDeleteParameter = (parameterId) => {
        setCurrentTool({
            ...currentTool,
            parameters: currentTool.parameters.filter(p => p.id !== parameterId)
        })
    }

    // Document Handlers
    const handleDeleteDocument = (id) => {
        setDocuments(documents.filter(doc => doc.id !== id))
    }
    
    // Prompt Dialog Handlers
    const handleOpenPromptDialog = () => {
        setPromptDialogOpen(true)
    }
    
    const handleClosePromptDialog = () => {
        setPromptDialogOpen(false)
    }
    
    // Tool Response Handlers
    const handleOpenToolResponseDialog = (tool) => {
        // Find existing response for this tool
        const existingResponse = toolResponses.find(tr => tr.toolId === tool.id)
        
        if (existingResponse) {
            setCurrentToolResponse(existingResponse)
        } else {
            setCurrentToolResponse({
                toolId: tool.id,
                toolName: tool.name,
                queryVariables: [],
                selectedApi: '',
                variableMappings: [],
                functionResponse: { type: 'string', value: '' }
            })
        }
        setTempQueryVar({ name: '', code: '' })
        setTempMapping({ varName: '', apiPath: '' })
        setToolResponseDialogOpen(true)
    }
    
    const handleCloseToolResponseDialog = () => {
        setToolResponseDialogOpen(false)
        setTempQueryVar({ name: '', code: '' })
        setTempMapping({ varName: '', apiPath: '' })
    }
    
    const handleSaveToolResponse = () => {
        // Check if response already exists for this tool
        const existingIndex = toolResponses.findIndex(tr => tr.toolId === currentToolResponse.toolId)
        
        if (existingIndex >= 0) {
            // Update existing
            const updated = [...toolResponses]
            updated[existingIndex] = currentToolResponse
            setToolResponses(updated)
        } else {
            // Add new
            setToolResponses([...toolResponses, currentToolResponse])
        }
        
        handleCloseToolResponseDialog()
    }

    // Document Store functions
    const fetchDocumentStores = async () => {
        try {
            const response = await documentStoreApi.getAllDocumentStores()
            if (response.data) {
                // Transform the data to include necessary fields
                const stores = (Array.isArray(response.data) ? response.data : []).map(store => ({
                    id: store.id,
                    name: store.name,
                    label: store.name,
                    description: store.description || `Document Store: ${store.name}`
                }))
                setDocumentStores(stores)
            } else {
                console.error('Failed to fetch document stores')
                setDocumentStores([])
            }
        } catch (error) {
            console.error('Error fetching document stores:', error)
            setDocumentStores([])
        }
    }

    const handleAddDocument = () => {
        setDocumentStoreDialogOpen(true)
        fetchDocumentStores()
    }

    const handleCloseDocumentStoreDialog = () => {
        setDocumentStoreDialogOpen(false)
        setSelectedDocumentStore('')
    }

    const handleSaveDocumentFromStore = () => {
        if (selectedDocumentStore) {
            const selectedStore = documentStores.find(store => store.id === selectedDocumentStore)
            if (selectedStore) {
                const newDoc = {
                    id: Date.now(),
                    name: selectedStore.label || selectedStore.name,
                    type: 'Document Store',
                    size: 'N/A',
                    added: new Date().toISOString().split('T')[0],
                    storeId: selectedStore.id,
                    description: selectedStore.description || ''
                }
                setDocuments(prev => [...prev, newDoc])
            }
        }
        handleCloseDocumentStoreDialog()
    }
    
    // Handlers for inside dialog
    const handleAddQueryVariableInDialog = () => {
        if (tempQueryVar.name.trim()) {
            setCurrentToolResponse({
                ...currentToolResponse,
                queryVariables: [...currentToolResponse.queryVariables, { 
                    id: Date.now(), 
                    name: tempQueryVar.name,
                    code: tempQueryVar.code
                }]
            })
            setTempQueryVar({ name: '', code: '' })
        }
    }
    
    const handleDeleteQueryVariableInDialog = (id) => {
        setCurrentToolResponse({
            ...currentToolResponse,
            queryVariables: currentToolResponse.queryVariables.filter(v => v.id !== id)
        })
    }
    
    const handleAddVariableMappingInDialog = () => {
        if (tempMapping.varName.trim()) {
            setCurrentToolResponse({
                ...currentToolResponse,
                variableMappings: [...currentToolResponse.variableMappings, { 
                    id: Date.now(), 
                    ...tempMapping 
                }]
            })
            setTempMapping({ varName: '', apiPath: '' })
        }
    }
    
    const handleDeleteVariableMappingInDialog = (id) => {
        setCurrentToolResponse({
            ...currentToolResponse,
            variableMappings: currentToolResponse.variableMappings.filter(m => m.id !== id)
        })
    }
    
    const handleEditVariableMappingInDialog = (id) => {
        const mapping = currentToolResponse.variableMappings.find(m => m.id === id)
        if (mapping) {
            setTempMapping({ varName: mapping.varName, apiPath: mapping.apiPath })
            handleDeleteVariableMappingInDialog(id)
        }
    }

    const handleSendMessage = async (messageText) => {
        if (!messageText.trim()) return
        
        // Add user message
        const userMessage = {
            id: Date.now(),
            type: 'userMessage',
            message: messageText,
            timestamp: new Date().toISOString()
        }
        
        setChatMessages(prev => [...prev, userMessage])
        setChatInput('')
        setIsChatLoading(true)
        
        try {
            // Prepare tools in OpenAI format
            const openAITools = tools.map(tool => ({
                type: 'function',
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: {
                        type: 'object',
                        properties: tool.parameters.reduce((acc, param) => {
                            acc[param.name] = {
                                type: param.datatype,
                                description: param.description
                            }
                            return acc
                        }, {}),
                        required: tool.parameters
                            .filter(param => param.required)
                            .map(param => param.name)
                    }
                }
            }))
            
            // Build conversation history
            const conversationHistory = chatMessages.map(msg => ({
                role: msg.type === 'userMessage' ? 'user' : 'assistant',
                content: msg.message
            }))
            
            // Add current message
            conversationHistory.push({
                role: 'user',
                content: messageText
            })
            
            // Add system prompt if provided
            if (prompt.trim()) {
                conversationHistory.unshift({
                    role: 'system',
                    content: prompt
                })
            }
            
            // Prepare request payload
            const requestPayload = {
            model: selectedModel,
                messages: conversationHistory,
                temperature: temperature,
                max_tokens: maxTokens,
                top_p: topP,
                tools: openAITools.length > 0 ? openAITools : undefined,
                tool_choice: openAITools.length > 0 ? 'auto' : undefined
            }
            
            // Add document context if available
            if (documents.length > 0) {
                const documentContext = documents.map(doc => 
                    `Document: ${doc.name} (${doc.description || 'No description'})`
                ).join('\n')
                
                requestPayload.messages.unshift({
                    role: 'system',
                    content: `You have access to the following documents:\n${documentContext}`
                })
            }
            
            // Prepare final payload (without credentialId)
            const finalPayload = {
                ...requestPayload
            }
            
            // Only add toolResponses if not empty
            if (toolResponses && toolResponses.length > 0) {
                finalPayload.toolResponses = toolResponses
            }
            
            // Only add documents if not empty
            if (documents && documents.length > 0) {
                finalPayload.documents = documents
            }
            
            console.log('=' .repeat(80))
            console.log('🚀 SENDING API REQUEST TO BACKEND')
            console.log('=' .repeat(80))
            console.log('📍 Endpoint: POST /api/v1/agentic/chat')
            console.log('=' .repeat(80))
            console.log('🔐 AUTHENTICATION FLOW:')
            console.log('  ℹ️  Authorization: Bearer token will be sent in header')
            console.log('  ℹ️  API Key Source:', fullApiKey ? 'Manual Entry / Selected Credential' : 'Will use backend env variable')
            console.log('  ℹ️  Full Bearer Token Field:', bearerToken || 'Not set')
            console.log('  ℹ️  API Key (extracted):', fullApiKey ? `${fullApiKey.substring(0, 20)}...${fullApiKey.substring(fullApiKey.length - 4)}` : 'Not set (using backend default)')
            console.log('  ℹ️  API Key Length:', fullApiKey ? fullApiKey.length : 0)
            console.log('  ℹ️  API Key is valid format:', fullApiKey ? (fullApiKey.startsWith('sk-') || fullApiKey.startsWith('sk_')) : false)
            console.log('  ℹ️  API Key trimmed:', fullApiKey ? fullApiKey.trim() : '')
            console.log('=' .repeat(80))
            console.log('📋 FULL REQUEST PAYLOAD (STRINGIFIED):')
            console.log(JSON.stringify(finalPayload, null, 2))
            console.log('=' .repeat(80))
            console.log('📊 REQUEST SUMMARY:')
            console.log('  - Model:', finalPayload.model)
            console.log('  - Messages Count:', finalPayload.messages.length)
            console.log('  - Message Details:')
            finalPayload.messages.forEach((msg, idx) => {
                console.log(`    [${idx}] ${msg.role}: ${msg.content.substring(0, 100)}...`)
            })
            console.log('  - Temperature:', finalPayload.temperature)
            console.log('  - Max Tokens:', finalPayload.max_tokens)
            console.log('  - Top P:', finalPayload.top_p)
            console.log('  - Tools Count:', finalPayload.tools?.length || 0)
            if (finalPayload.documents) {
                console.log('  - Documents Count:', finalPayload.documents.length)
            }
            if (finalPayload.toolResponses) {
                console.log('  - Tool Responses:', finalPayload.toolResponses.length)
            }
            console.log('=' .repeat(80))
            console.log('📤 RAW REQUEST BODY AS STRING:')
            console.log(JSON.stringify(finalPayload))
            console.log('=' .repeat(80))
            console.log('📤 AUTHORIZATION HEADER:')
            console.log('  Authorization:', fullApiKey ? `Bearer ${fullApiKey.substring(0, 20)}...` : 'Not set (will use backend env)')
            console.log('=' .repeat(80))
            
            let response
            
            // Check if this is an orchestrator solution
            if (isOrchestrator && solutionId) {
                console.log('🎯 USING ORCHESTRATOR MODE')
                console.log('  - Solution ID:', solutionId)
                console.log('  - Will route to specialized agent based on intent')
                console.log('=' .repeat(80))
                
                // Build conversation history for orchestrator (simplified format)
                const orchestratorHistory = chatMessages.map(msg => ({
                    role: msg.type === 'userMessage' ? 'user' : 'assistant',
                    content: msg.message
                }))
                
                // Call orchestrator chat endpoint
                response = await orchestratorApi.chat(solutionId, messageText, orchestratorHistory)
                
                console.log('✅ RECEIVED ORCHESTRATOR RESPONSE')
                console.log('Response Data:', JSON.stringify(response.data, null, 2))
                
                // Add routing information to the message if redirected
                if (response.data.redirected) {
                    console.log(`🔀 Redirected to: ${response.data.redirectedTo}`)
                    console.log(`   Reason: ${response.data.reason}`)
                }
            } else {
                console.log('🤖 USING STANDARD AGENT MODE')
                console.log('=' .repeat(80))
                
                // Call backend API with Authorization header (standard mode)
                // Ensure API key is trimmed and valid
                const apiKeyToSend = fullApiKey ? fullApiKey.trim() : undefined
                console.log('📤 Final API Key to send:', apiKeyToSend ? `${apiKeyToSend.substring(0, 20)}...` : 'undefined (will use backend env)')
                response = await agenticApi.sendChatMessage(finalPayload, apiKeyToSend)
            }
            
            console.log('✅ RECEIVED RESPONSE FROM BACKEND')
            console.log('Response Data:', JSON.stringify(response.data, null, 2))
            console.log('=' .repeat(80))
            
            // Handle the response
            console.log('🔍 PARSING RESPONSE')
            console.log('response.data type:', typeof response.data)
            console.log('response.data is string?', typeof response.data === 'string')
            console.log('response.data keys:', typeof response.data === 'object' ? Object.keys(response.data) : 'N/A')
            
            // Check if response.data is HTML (error case)
            if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
                throw new Error('Backend server returned HTML instead of JSON. Please ensure the backend is running correctly on port 3000.')
            }
            
            if (response.data) {
                const messageText = response.data.message || response.data.response || ''
                
                console.log('📝 Extracted message text:', messageText ? messageText.substring(0, 100) + '...' : 'EMPTY')
                
                if (!messageText || messageText.trim() === '') {
                    console.error('❌ Empty message text!')
                    console.error('response.data.message:', response.data.message)
                    console.error('response.data.response:', response.data.response)
                    throw new Error('Empty response received from AI. Please check your configuration and try again.')
                }
                
                const aiMessage = {
                    id: Date.now() + 1,
                    type: 'apiMessage',
                    message: messageText,
                    timestamp: new Date().toISOString(),
                    toolCalls: response.data.toolCalls || [],
                    // Add orchestrator routing metadata
                    isFromOrchestrator: isOrchestrator,
                    redirectedTo: response.data.redirectedTo,
                    redirectReason: response.data.reason
                }
                
                console.log('✅ Adding AI message to chat:', aiMessage)
                setChatMessages(prev => [...prev, aiMessage])
                
                // Show notification if redirected to a specialized agent
                if (response.data.redirected && response.data.redirectedTo) {
                    dispatch(enqueueSnackbarAction({
                        message: `🔀 Routed to ${response.data.redirectedTo} agent`,
                        options: {
                            key: new Date().getTime() + Math.random(),
                            variant: 'info'
                        }
                    }))
                }
                
                // Log successful response for debugging
                console.log('🎉 AI Response added successfully:', messageText.substring(0, 200))
            } else {
                throw new Error('Invalid response from server')
            }
            
            setIsChatLoading(false)
            
        } catch (error) {
            console.error('Error sending message:', error)
            
            // Extract meaningful error message
            let errorText = 'Failed to get response from AI'
            if (error.response?.data?.message) {
                errorText = error.response.data.message
            } else if (error.message) {
                errorText = error.message
            }
            
            const errorMessage = {
                id: Date.now() + 1,
                type: 'apiMessage',
                message: `❌ Error: ${errorText}\n\nPlease check:\n- Your OpenAI credential is valid\n- The selected model is available\n- Your prompt is not empty\n- You have an active internet connection`,
                timestamp: new Date().toISOString()
            }
            setChatMessages(prev => [...prev, errorMessage])
            setIsChatLoading(false)
        }
    }

    const handleGenerate = () => {
        if (prompt.trim()) {
            handleSendMessage(prompt)
        }
    }
    
    const handleChatSubmit = (e) => {
        e.preventDefault()
        handleSendMessage(chatInput)
    }
    
    const handleResetConversation = () => {
        setChatMessages([{
            id: Date.now(),
            type: 'apiMessage',
            message: welcomeMessage,
            timestamp: new Date().toISOString()
        }])
        setChatInput('')
    }
    
    // Fetch credentials on mount
    useEffect(() => {
        fetchCredentials()
    }, [])
    
    // Load solution data if solutionId is provided (and credentials are loaded)
    useEffect(() => {
        if (solutionId && credentialsFetched) {
            // Only load solution after credentials have been fetched
            loadSolution()
        }
    }, [solutionId, credentialsFetched])
    
    const loadSolution = async () => {
        try {
            setIsLoadingSolution(true)
            const response = await solutionsApi.getSolutionById(solutionId)
            setSolution(response.data)
            
            // Check if this is an orchestrator solution
            const isOrchestratorSolution = response.data.type === 'ORCHESTRATOR'
            setIsOrchestrator(isOrchestratorSolution)
            
            // If orchestrator, load sibling solutions for agent transfer
            if (isOrchestratorSolution && response.data.botId) {
                try {
                    const siblingsResponse = await solutionsApi.getSolutionsByBotId(response.data.botId)
                    // Filter out the orchestrator itself, only show regular solutions
                    const regularSolutions = siblingsResponse.data.filter(s => s.type === 'REGULAR')
                    setSiblingSolutions(regularSolutions)
                } catch (error) {
                    console.error('Error loading sibling solutions:', error)
                }
            }
            
            // Load configuration if available
            if (response.data.configuration) {
                try {
                    const config = JSON.parse(response.data.configuration)
                    if (config.welcomeMessage) setWelcomeMessage(config.welcomeMessage)
                    if (config.prompt) setPrompt(config.prompt)
                    if (config.selectedModel) setSelectedModel(config.selectedModel)
                    if (config.temperature !== undefined) setTemperature(config.temperature)
                    if (config.maxTokens) setMaxTokens(config.maxTokens)
                    if (config.topP !== undefined) setTopP(config.topP)
                    if (config.tools) setTools(config.tools)
                    if (config.documents) setDocuments(config.documents)
                    
                    // Handle credential loading with validation
                    if (config.selectedCredential) {
                        // First check if the credential exists before setting it
                        const credentialExists = credentials.find(c => c.id === config.selectedCredential)
                        if (credentialExists) {
                            setSelectedCredential(config.selectedCredential)
                            // Fetch the credential details
                            handleCredentialChange(config.selectedCredential)
                        } else {
                            console.warn('Saved credential not found:', config.selectedCredential)
                            // Clear the credential selection if it doesn't exist
                            setSelectedCredential('')
                            setFullApiKey('')
                            setBearerToken('')
                        }
                    } else if (config.manualApiKey) {
                        // Restore manually entered API key
                        console.log('Restoring manually entered API key')
                        setFullApiKey(config.manualApiKey)
                        setBearerToken(`Bearer ${config.manualApiKey.substring(0, 10)}...${config.manualApiKey.substring(config.manualApiKey.length - 4)}`)
                    }
                } catch (error) {
                    console.error('Error parsing solution configuration:', error)
                }
            }
        } catch (error) {
            console.error('Error loading solution:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to load solution',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error'
                }
            }))
        } finally {
            setIsLoadingSolution(false)
        }
    }
    
    const saveConfiguration = async () => {
        if (!solutionId) {
            dispatch(enqueueSnackbarAction({
                message: 'No solution selected. Please navigate from a bot solution.',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'warning'
                }
            }))
            return
        }
        
        try {
            const config = {
                welcomeMessage,
                prompt,
                selectedModel,
                temperature,
                maxTokens,
                topP,
                tools,
                documents,
                // Only save selectedCredential if it's a valid non-empty string
                ...(selectedCredential && selectedCredential.trim() !== '' && { selectedCredential }),
                // Save manually entered API key (if any) - note: this will be encrypted by backend
                ...(fullApiKey && fullApiKey.trim() !== '' && !selectedCredential && { manualApiKey: fullApiKey })
            }
            
            await solutionsApi.updateSolution(solutionId, {
                configuration: JSON.stringify(config)
            })
            
            dispatch(enqueueSnackbarAction({
                message: 'Configuration saved successfully',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'success'
                }
            }))
        } catch (error) {
            console.error('Error saving configuration:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to save configuration',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error'
                }
            }))
        }
    }
    
    const fetchCredentials = async () => {
        try {
            const response = await credentialsApi.getAllCredentials()
            console.log('🔍 Fetching ALL Credentials from Credentials section')
            console.log('📋 All Credentials Response:', response.data)
            
            if (response.data) {
                // Show ALL configured credentials (not filtering)
                setCredentials(response.data)
                console.log(`✅ Loaded ${response.data.length} credentials:`)
                response.data.forEach((cred, idx) => {
                    console.log(`  [${idx}] ${cred.name || cred.credentialName} (ID: ${cred.id})`)
                })
            }
        } catch (error) {
            console.error('❌ Error fetching credentials:', error)
            setCredentials([])
        } finally {
            setCredentialsFetched(true)
        }
    }
    
    const handleCredentialChange = async (credentialId) => {
        setSelectedCredential(credentialId)
        
        if (credentialId) {
            try {
                // Find the selected credential name for display
                const selectedCred = credentials.find(c => c.id === credentialId)
                
                if (!selectedCred) {
                    console.warn('⚠️  Credential ID not found in credentials list:', credentialId)
                    setFullApiKey('')
                    setBearerToken('')
                    return
                }
                
                console.log('=' .repeat(80))
                console.log('🔐 USER SELECTED CREDENTIAL FROM CREDENTIALS SECTION')
                console.log('=' .repeat(80))
                console.log('📋 Credential Name:', selectedCred?.name || selectedCred?.credentialName || 'Unknown')
                console.log('🆔 Credential ID:', credentialId)
                console.log('=' .repeat(80))
                
                // Fetch the specific credential to get the bearer token
                const response = await credentialsApi.getSpecificCredential(credentialId)
                
                console.log('🔍 Full Credential Response:', JSON.stringify(response.data, null, 2))
                console.log('🔍 Plain Data Object:', JSON.stringify(response.data.plainDataObj, null, 2))
                
                if (response.data && response.data.plainDataObj) {
                    // Extract the API key (bearer token) - try multiple possible field names
                    const plainData = response.data.plainDataObj
                    
                    console.log('=' .repeat(80))
                    console.log('🔍 DETAILED CREDENTIAL ANALYSIS')
                    console.log('=' .repeat(80))
                    console.log('Available fields:', Object.keys(plainData))
                    console.log('Field values:')
                    Object.keys(plainData).forEach(key => {
                        const value = plainData[key]
                        if (typeof value === 'string' && value.length > 20) {
                            console.log(`  - ${key}: ${value.substring(0, 30)}... (length: ${value.length})`)
                        } else {
                            console.log(`  - ${key}: ${value}`)
                        }
                    })
                    console.log('=' .repeat(80))
                    
                    // Try to extract API key
                    let apiKey = plainData.Value ||           // Capital V (common in Flowise)
                                 plainData.value ||           // lowercase v
                                 plainData.openAIApiKey || 
                                 plainData.apiKey || 
                                 plainData.key ||
                                 plainData.api_key ||
                                 plainData.authorization ||
                                 plainData.Authorization ||
                                 ''
                    
                    // If still not found, try to find any field that looks like an API key
                    if (!apiKey || apiKey.startsWith('_FLOWISE_BLANK_')) {
                        console.log('⚠️  Standard fields empty, searching for SK key pattern...')
                        for (const [key, value] of Object.entries(plainData)) {
                            if (typeof value === 'string' && 
                                (value.startsWith('sk-') || value.startsWith('Bearer ')) &&
                                !value.startsWith('_FLOWISE_BLANK_')) {
                                console.log(`✅ Found API key-like value in field: ${key}`)
                                apiKey = value.replace('Bearer ', '').trim()
                                break
                            }
                        }
                    }
                    
                    console.log('🔑 Final Extracted API Key:', apiKey ? `${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT FOUND')
                    console.log('🔍 API Key starts with:', apiKey ? apiKey.substring(0, 10) : 'N/A')
                    
                    // Set the full API key (for Authorization header)
                    if (apiKey && apiKey.length > 0 && !apiKey.startsWith('_FLOWISE_BLANK_')) {
                        setFullApiKey(apiKey)
                        // Set the bearer token (masked for display)
                        setBearerToken(`Bearer ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`)
                        console.log('✅ API Key set successfully')
                    } else {
                        setFullApiKey('')
                        setBearerToken('Bearer token not found in credential')
                        console.error('❌ API Key not found or is blank placeholder')
                    }
                } else {
                    setFullApiKey('')
                    setBearerToken('')
                    console.error('❌ No plainDataObj in credential response')
                }
            } catch (error) {
                console.error('❌ Error fetching credential details:', error)
                setFullApiKey('')
                setBearerToken('')
            }
        } else {
            setFullApiKey('')
            setBearerToken('')
        }
    }
    
    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
        }
    }, [chatMessages, isChatLoading])

    return (
        <>
            <MainCard>
                {solutionId ? (
                    <>
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <IconButton onClick={() => {
                                    if (solution?.botId) {
                                        navigate(`/bots/${solution.botId}/solutions`)
                                    } else {
                                        navigate('/bots')
                                    }
                                }}>
                                    <IconArrowLeft />
                                </IconButton>
                                <Box>
                                    <Typography variant="h3">
                                        {solution?.name || 'Agentic AI Assistant'}
                                    </Typography>
                                    {solution?.description && (
                                        <Typography variant="body2" color="textSecondary">
                                            {solution.description}
                                        </Typography>
                                    )}
                                    {solution?.type === 'ORCHESTRATOR' && (
                                        <Chip label="Orchestrator" size="small" color="primary" sx={{ mt: 0.5 }} />
                                    )}
                                </Box>
                            </Stack>
                            <Button
                                variant="contained"
                                startIcon={<IconDeviceFloppy />}
                                onClick={saveConfiguration}
                                disabled={isLoadingSolution}
                            >
                                Save Configuration
                            </Button>
                        </Box>
                        
                        {/* Orchestrator Explanation Banner */}
                        {isOrchestrator && (
                            <Alert severity="info" icon={<IconRobot />} sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: '#000' }}>
                                    🎯 Orchestrator Agent - Smart Routing
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#000' }}>
                                    This orchestrator intelligently routes conversations to specialized agents based on user intent. 
                                    Configure the prompt to define routing logic, and the "Agent Transfer" section below shows all available specialized agents.
                                </Typography>
                            </Alert>
                        )}
                        
                        {!isLoadingSolution && !solution && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                Failed to load solution. Please try again or navigate back.
                            </Alert>
                        )}
                    </>
                ) : (
                    <>
                        <ViewHeader
                            title="Agentic AI Assistant"
                            search={false}
                            isBackButton={false}
                        />
                        <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
                            You are viewing the Agentic AI Assistant in standalone mode. To save configurations, please access this page through a bot solution.
                        </Alert>
                    </>
                )}

                <Box sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        {/* Left Panel - 50% */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                                {/* Welcome Message Box */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
                                        Welcome Message
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder='Enter welcome message for the chatbot...'
                                        value={welcomeMessage}
                                        onChange={(e) => setWelcomeMessage(e.target.value)}
                                        variant='outlined'
                                        helperText='This message will be displayed when the chat starts or is reset'
                                    />
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                {/* Prompt Box */}
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                            System Prompt
                                        </Typography>
                                        <IconButton
                                            size='small'
                                            color='primary'
                                            onClick={handleOpenPromptDialog}
                                            title='Expand prompt editor'
                                        >
                                            <IconMaximize size={20} />
                                        </IconButton>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={6}
                                        placeholder='Enter your system prompt here...'
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        variant='outlined'
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                fontFamily: 'monospace'
                                            }
                                        }}
                                    />
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                {/* Credentials Selection */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
                                        Credentials (from Credentials Section)
                                    </Typography>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Select Credential</InputLabel>
                                        <Select
                                            value={selectedCredential}
                                            label='Select Credential'
                                            onChange={(e) => handleCredentialChange(e.target.value)}
                                        >
                                            {credentials.length === 0 ? (
                                                <MenuItem disabled>
                                                    No credentials configured. Please add credentials in the Credentials section.
                                                </MenuItem>
                                            ) : (
                                                credentials.map((cred) => (
                                                    <MenuItem key={cred.id} value={cred.id}>
                                                        {cred.name || cred.credentialName || `Credential ${cred.id}`}
                                                        {cred.credentialName && ` (${cred.credentialName})`}
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </FormControl>
                                    
                                    {/* Bearer Token Input - Editable for Manual Entry */}
                                    <TextField
                                        fullWidth
                                        label='Bearer Token (Manual Entry for Testing)'
                                        placeholder='Bearer sk-proj-...'
                                        value={bearerToken}
                                        onChange={(e) => {
                                            const value = e.target.value
                                            setBearerToken(value)
                                            // Extract just the API key (remove "Bearer " if present) for fullApiKey
                                            if (value.startsWith('Bearer ')) {
                                                setFullApiKey(value.substring(7).trim())
                                            } else {
                                                setFullApiKey(value.trim())
                                            }
                                            // Clear the selected credential when manually entering an API key
                                            if (value.trim()) {
                                                setSelectedCredential('')
                                            }
                                        }}
                                        variant='outlined'
                                        size='small'
                                        multiline
                                        rows={2}
                                        helperText='Paste your full Bearer token here (e.g., "Bearer sk-proj-...")'
                                        sx={{
                                            mb: 2,
                                            '& .MuiInputBase-input': {
                                                fontFamily: 'monospace',
                                                fontSize: '0.875rem'
                                            }
                                        }}
                                    />
                                    
                                    {credentials.length === 0 && (
                                        <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                                            No credentials found. Please add credentials in the Credentials section.
                                        </Typography>
                                    )}
                                    
                                    {selectedCredential && (
                                        <Box sx={{ mt: 1, p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                                            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                                                ℹ️ Selected Credential
                                            </Typography>
                                            <Typography variant='body2' color='text.secondary'>
                                                {credentials.find(c => c.id === selectedCredential)?.name || 
                                                 credentials.find(c => c.id === selectedCredential)?.credentialName || 
                                                 'Unknown'}
                                            </Typography>
                                            <Typography variant='caption' color='warning.main' sx={{ mt: 1, display: 'block' }}>
                                                Note: If Bearer Token is blank, paste your API key manually in the field above
                                            </Typography>
                                        </Box>
                                    )}
                                    
                                    {fullApiKey && fullApiKey.length > 20 && (
                                        <Typography variant='caption' color='success.main' sx={{ mt: 1, display: 'block' }}>
                                            ✓ API Key ready to use ({fullApiKey.length} characters)
                                        </Typography>
                                    )}
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                {/* Model Selection */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
                                        Model Selection
                                    </Typography>
                                    <FormControl fullWidth>
                                        <InputLabel>Select Model</InputLabel>
                                        <Select
                                            value={selectedModel}
                                            label='Select Model'
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                        >
                                            {MODELS.map((model) => (
                                                <MenuItem key={model.value} value={model.value}>
                                                    {model.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                {/* Parameters */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
                                        Parameters
                                    </Typography>

                                    {/* Temperature */}
                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant='body2'>Temperature</Typography>
                                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                                {temperature}
                                            </Typography>
                                        </Box>
                                        <Slider
                                            value={temperature}
                                            onChange={(e, val) => setTemperature(val)}
                                            min={0}
                                            max={2}
                                            step={0.1}
                                            marks={[
                                                { value: 0, label: '0' },
                                                { value: 1, label: '1' },
                                                { value: 2, label: '2' }
                                            ]}
                                            valueLabelDisplay='auto'
                                        />
                                    </Box>

                                    {/* Max Tokens */}
                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant='body2'>Max Tokens</Typography>
                                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                                {maxTokens}
                                            </Typography>
                                        </Box>
                                        <Slider
                                            value={maxTokens}
                                            onChange={(e, val) => setMaxTokens(val)}
                                            min={100}
                                            max={8000}
                                            step={100}
                                            marks={[
                                                { value: 100, label: '100' },
                                                { value: 4000, label: '4000' },
                                                { value: 8000, label: '8000' }
                                            ]}
                                            valueLabelDisplay='auto'
                                        />
                                    </Box>

                                    {/* Top P */}
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant='body2'>Top P</Typography>
                                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                                {topP}
                                            </Typography>
                                        </Box>
                                        <Slider
                                            value={topP}
                                            onChange={(e, val) => setTopP(val)}
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            marks={[
                                                { value: 0, label: '0' },
                                                { value: 0.5, label: '0.5' },
                                                { value: 1, label: '1' }
                                            ]}
                                            valueLabelDisplay='auto'
                                        />
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                {/* Tools Section */}
                                <Box sx={{ mb: 3 }}>
                                    {isOrchestrator ? (
                                        // Orchestrator: Agent Transfer Section
                                        <>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Box>
                                                    <Typography variant='h6' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <IconRobot size={20} />
                                                        Agent Transfer
                                                    </Typography>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        Orchestrator will automatically route conversations to these specialized agents
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <TableContainer component={Paper} variant='outlined'>
                                                <Table size='small'>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 600 }}>Agent Name</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {siblingSolutions.length === 0 ? (
                                                            <TableRow>
                                                                <TableCell colSpan={3} align='center' sx={{ py: 3 }}>
                                                                    <Typography variant='body2' color='text.secondary'>
                                                                        No specialized agents available. Create solutions in the bot to see them here.
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            siblingSolutions.map((sol) => (
                                                                <TableRow key={sol.id} hover>
                                                                    <TableCell>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <IconRobot size={16} color={theme.palette.primary.main} />
                                                                            <strong>{sol.name}</strong>
                                                                        </Box>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {sol.description || 'Specialized agent for specific tasks'}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Chip 
                                                                            label='Active' 
                                                                            size='small' 
                                                                            color='success'
                                                                            sx={{ fontWeight: 600 }}
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </>
                                    ) : (
                                        // Regular Solution: Standard Tools Section
                                        <>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                                    Tools
                                                </Typography>
                                                <Button
                                                    variant='contained'
                                                    startIcon={<IconPlus />}
                                                    size='small'
                                                    onClick={handleOpenToolDialog}
                                                >
                                                    Create Tool
                                                </Button>
                                            </Box>

                                            <TableContainer component={Paper} variant='outlined'>
                                                <Table size='small'>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Parameters</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }} align='right'>
                                                                Actions
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {tools.length === 0 ? (
                                                            <TableRow>
                                                                <TableCell colSpan={4} align='center' sx={{ py: 3 }}>
                                                                    <Typography variant='body2' color='text.secondary'>
                                                                        No tools created yet
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            tools.map((tool) => (
                                                                <TableRow key={tool.id} hover>
                                                                    <TableCell>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <IconTool size={16} />
                                                                            {tool.name}
                                                                        </Box>
                                                                    </TableCell>
                                                                    <TableCell>{tool.description}</TableCell>
                                                                    <TableCell>
                                                                        <Chip 
                                                                            label={`${tool.parameters.length} params`} 
                                                                            size='small' 
                                                                            color='primary'
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell align='right'>
                                                                        <IconButton
                                                                            size='small'
                                                                            color='error'
                                                                            onClick={() => handleDeleteTool(tool.id)}
                                                                        >
                                                                            <IconTrash size={16} />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </>
                                    )}
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                {/* Document Selector */}
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                            Documents
                                        </Typography>
                                        <Button
                                            variant='contained'
                                            startIcon={<IconPlus />}
                                            size='small'
                                            onClick={handleAddDocument}
                                        >
                                            Add Document
                                        </Button>
                                    </Box>

                                    <TableContainer component={Paper} variant='outlined'>
                                        <Table size='small'>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Added</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }} align='right'>
                                                        Actions
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {documents.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} align='center' sx={{ py: 3 }}>
                                                            <Typography variant='body2' color='text.secondary'>
                                                                No documents added yet
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    documents.map((doc) => (
                                                        <TableRow key={doc.id} hover>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <IconFile size={16} />
                                                                    {doc.name}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip label={doc.type} size='small' />
                                                            </TableCell>
                                                            <TableCell>{doc.size}</TableCell>
                                                            <TableCell>{doc.added}</TableCell>
                                                            <TableCell align='right'>
                                                                <IconButton
                                                                    size='small'
                                                                    color='error'
                                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                                >
                                                                    <IconTrash size={16} />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Paper>
                </Grid>

                        {/* Right Panel - 50% */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                        AI Assistant Chat
                                </Typography>
                                    <Button
                                        variant='outlined'
                                        size='small'
                                        startIcon={<IconRefresh size={16} />}
                                        onClick={handleResetConversation}
                                        disabled={isChatLoading}
                                    >
                                        Reset Conversation
                                    </Button>
                                </Box>

                                {/* Chat Messages Container */}
                                <Box
                                    ref={chatMessagesRef}
                                    sx={{
                                        flex: 1,
                                        minHeight: 400,
                                        maxHeight: 600,
                                        overflowY: 'auto',
                                        p: 2,
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 1,
                                        bgcolor: theme.palette.background.default,
                                        mb: 2
                                    }}
                                >
                                    {chatMessages.map((message) => (
                                        <Box
                                            key={message.id}
                                            sx={{
                                                display: 'flex',
                                                gap: 2,
                                                mb: 2,
                                                alignItems: 'flex-start'
                                            }}
                                        >
                                            {/* Avatar */}
                                            <Box
                                                component='img'
                                                src={message.type === 'apiMessage' ? robotPNG : userPNG}
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: `2px solid ${theme.palette.divider}`
                                                }}
                                            />
                                            
                                            {/* Message Content */}
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        {message.type === 'apiMessage' ? 'AI Assistant' : 'You'}
                                                    </Typography>
                                                    {/* Show routing badge for orchestrator-routed messages */}
                                                    {message.redirectedTo && (
                                                        <Chip 
                                                            label={`via ${message.redirectedTo}`}
                                                            size="small"
                                                            color="primary"
                                                            sx={{ 
                                                                height: 18,
                                                                fontSize: '0.7rem',
                                                                fontWeight: 600
                                                            }}
                                                            icon={<IconRobot size={12} />}
                                                        />
                                                    )}
                                                </Box>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        bgcolor: message.type === 'apiMessage' 
                                                            ? theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(33, 150, 243, 0.08)'
                                                            : theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.08)' : 'rgba(156, 39, 176, 0.08)',
                                                        borderRadius: 2,
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
                                                    <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                                                        {message.message}
                                                    </Typography>
                                                </Paper>
                                </Box>
                                        </Box>
                                    ))}
                                    
                                    {/* Loading Indicator */}
                                    {isChatLoading && (
                                        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                                            <Box
                                                component='img'
                                                src={robotPNG}
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: `2px solid ${theme.palette.divider}`
                                                }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                                                    AI Assistant
                                                </Typography>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(33, 150, 243, 0.08)',
                                                        borderRadius: 2
                                                    }}
                                                >
                                                    <Typography variant='body2' color='text.secondary'>
                                                        Typing...
                                                    </Typography>
                                                </Paper>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>

                                {/* Chat Input */}
                                <Box component='form' onSubmit={handleChatSubmit}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            fullWidth
                                            placeholder='Type your message here...'
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            variant='outlined'
                                            size='small'
                                            disabled={isChatLoading}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2
                                                }
                                            }}
                                        />
                                <Button
                                            type='submit'
                                    variant='contained'
                                            disabled={!chatInput.trim() || isChatLoading}
                                            sx={{
                                                minWidth: 50,
                                                borderRadius: 2
                                            }}
                                        >
                                            <IconSend size={20} />
                                </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Bottom Section - Full Width (Only for non-orchestrator solutions) */}
                        {!isOrchestrator && (
                            <Grid item xs={12}>
                                <Paper elevation={2} sx={{ p: 3 }}>
                                    <Typography variant='h5' sx={{ mb: 3, fontWeight: 600 }}>
                                        GPT Function Calling Configuration
                                    </Typography>

                                    <Grid container spacing={3}>
                                        {/* Tool Response Section */}
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant='h6' sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <IconTool size={20} />
                                                    Tool Response
                                                </Typography>
                                                <Paper variant='outlined' sx={{ p: 2 }}>
                                                    <TableContainer>
                                                        <Table size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Tool Name</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }} align='right'>Actions</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {tools.length === 0 ? (
                                                                    <TableRow>
                                                                        <TableCell colSpan={3} align='center' sx={{ py: 3 }}>
                                                                            <Typography variant='body2' color='text.secondary'>
                                                                                Create a tool first to configure responses
                                                                            </Typography>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ) : (
                                                                    tools.map((tool) => {
                                                                        const hasResponse = toolResponses.some(tr => tr.toolId === tool.id)
                                                                        return (
                                                                            <TableRow key={tool.id} hover>
                                                                                <TableCell>
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                        <IconTool size={16} />
                                                                                        {tool.name}
                                                                                    </Box>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {hasResponse ? (
                                                                                        <Chip label='Configured' size='small' color='success' />
                                                                                    ) : (
                                                                                        <Chip label='Not Configured' size='small' color='default' />
                                                                                    )}
                                                                                </TableCell>
                                                                                <TableCell align='right'>
                                                                                    <IconButton
                                                                                        size='small'
                                                                                        color='primary'
                                                                                        onClick={() => handleOpenToolResponseDialog(tool)}
                                                                                    >
                                                                                        <IconEdit size={16} />
                                                                                    </IconButton>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        )
                                                                    })
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </Paper>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </MainCard>

            {/* Tool Creation Dialog */}
            <Dialog open={toolDialogOpen} onClose={handleCloseToolDialog} maxWidth='md' fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconTool />
                        Create New Tool
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {/* Tool Name */}
                        <TextField
                            fullWidth
                            label='Tool Name'
                            value={currentTool.name}
                            onChange={(e) => setCurrentTool({ ...currentTool, name: e.target.value })}
                            sx={{ mb: 3 }}
                            required
                        />

                        {/* Tool Description */}
                        <TextField
                            fullWidth
                            label='Tool Description'
                            multiline
                            rows={3}
                            value={currentTool.description}
                            onChange={(e) => setCurrentTool({ ...currentTool, description: e.target.value })}
                            sx={{ mb: 3 }}
                            required
                        />

                        {/* Parameters Section */}
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant='h6'>Parameters</Typography>
                                <Button
                                    variant='outlined'
                                    startIcon={<IconPlus />}
                                    size='small'
                                    onClick={handleOpenParameterDialog}
                                >
                                    Add Parameter
                                </Button>
                            </Box>

                            {/* Parameters Table */}
                            <TableContainer component={Paper} variant='outlined'>
                                <Table size='small'>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Required</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }} align='right'>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {currentTool.parameters.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align='center' sx={{ py: 2 }}>
                                                    <Typography variant='body2' color='text.secondary'>
                                                        No parameters added yet
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            currentTool.parameters.map((param) => (
                                                <TableRow key={param.id} hover>
                                                    <TableCell>{param.name}</TableCell>
                                                    <TableCell>{param.description}</TableCell>
                                                    <TableCell>
                                                        <Chip label={param.datatype} size='small' />
                                                    </TableCell>
                                                    <TableCell>
                                                        {param.required ? (
                                                            <Chip label='Yes' size='small' color='error' />
                                                        ) : (
                                                            <Chip label='No' size='small' />
                                                        )}
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        <IconButton
                                                            size='small'
                                                            color='error'
                                                            onClick={() => handleDeleteParameter(param.id)}
                                                        >
                                                            <IconTrash size={16} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseToolDialog}>Cancel</Button>
                    <Button
                        variant='contained'
                        onClick={handleSaveTool}
                        disabled={!currentTool.name || !currentTool.description}
                    >
                        Save Tool
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Parameter Creation Dialog */}
            <Dialog open={parameterDialogOpen} onClose={handleCloseParameterDialog} maxWidth='sm' fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconSettings />
                        Add Parameter
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {/* Parameter Name */}
                        <TextField
                            fullWidth
                            label='Parameter Name'
                            value={currentParameter.name}
                            onChange={(e) => setCurrentParameter({ ...currentParameter, name: e.target.value })}
                            sx={{ mb: 3 }}
                            required
                        />

                        {/* Parameter Description */}
                        <TextField
                            fullWidth
                            label='Parameter Description'
                            multiline
                            rows={2}
                            value={currentParameter.description}
                            onChange={(e) => setCurrentParameter({ ...currentParameter, description: e.target.value })}
                            sx={{ mb: 3 }}
                        />

                        {/* Data Type */}
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Data Type</InputLabel>
                            <Select
                                value={currentParameter.datatype}
                                label='Data Type'
                                onChange={(e) => setCurrentParameter({ ...currentParameter, datatype: e.target.value })}
                            >
                                {DATA_TYPES.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Required Checkbox */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={currentParameter.required}
                                    onChange={(e) =>
                                        setCurrentParameter({ ...currentParameter, required: e.target.checked })
                                    }
                                />
                            }
                            label='Required'
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseParameterDialog}>Cancel</Button>
                    <Button variant='contained' onClick={handleSaveParameter} disabled={!currentParameter.name}>
                        Save Parameter
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Tool Response Configuration Dialog */}
            <Dialog open={toolResponseDialogOpen} onClose={handleCloseToolResponseDialog} maxWidth='lg' fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconTool />
                        Configure Tool Response: {currentToolResponse.toolName}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={3}>
                            {/* Left Column */}
                            <Grid item xs={12} md={6}>
                                {/* Query Variables Section */}
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant='h6' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconVariable size={20} />
                                            Query Variables
                                        </Typography>
                                        <IconButton
                                            size='small'
                                            color='primary'
                                            onClick={handleAddQueryVariableInDialog}
                                            disabled={!tempQueryVar.name.trim()}
                                        >
                                            <IconPlus />
                                        </IconButton>
                                    </Box>
                                    <Paper variant='outlined' sx={{ p: 2 }}>
                                        <TextField
                                            fullWidth
                                            size='small'
                                            label='Variable Name'
                                            placeholder='e.g., searchQuery'
                                            value={tempQueryVar.name}
                                            onChange={(e) => setTempQueryVar({ ...tempQueryVar, name: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            label='JavaScript Code (Return Value)'
                                            placeholder='return value;'
                                            value={tempQueryVar.code}
                                            onChange={(e) => setTempQueryVar({ ...tempQueryVar, code: e.target.value })}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.875rem'
                                                }
                                            }}
                                        />

                                        <Divider sx={{ my: 2 }} />

                                        <TableContainer>
                                            <Table size='small'>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 600 }}>Variable Name</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Code Preview</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }} align='right'>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {currentToolResponse.queryVariables.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={3} align='center' sx={{ py: 2 }}>
                                                                <Typography variant='body2' color='text.secondary'>
                                                                    No query variables added
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        currentToolResponse.queryVariables.map((variable) => (
                                                            <TableRow key={variable.id} hover>
                                                                <TableCell>
                                                                    <Chip label={variable.name} size='small' color='primary' />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>
                                                                        {variable.code ? variable.code.substring(0, 30) + (variable.code.length > 30 ? '...' : '') : '(no code)'}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align='right'>
                                                                    <IconButton
                                                                        size='small'
                                                                        color='error'
                                                                        onClick={() => handleDeleteQueryVariableInDialog(variable.id)}
                                                                    >
                                                                        <IconTrash size={16} />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Box>

                                {/* API Selection Section */}
                                <Box>
                                    <Typography variant='h6' sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconApi size={20} />
                                        API Selection
                                    </Typography>
                                    <Paper variant='outlined' sx={{ p: 2 }}>
                                        <FormControl fullWidth size='small'>
                                            <InputLabel>Select API</InputLabel>
                                            <Select
                                                value={currentToolResponse.selectedApi}
                                                label='Select API'
                                                onChange={(e) => setCurrentToolResponse({ 
                                                    ...currentToolResponse, 
                                                    selectedApi: e.target.value 
                                                })}
                                            >
                                                {apiList.map((api) => (
                                                    <MenuItem key={api.value} value={api.value}>
                                                        {api.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        {currentToolResponse.selectedApi && (
                                            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'success.lighter', borderRadius: 1 }}>
                                                <Typography variant='caption' color='success.dark'>
                                                    Selected: {apiList.find(a => a.value === currentToolResponse.selectedApi)?.label}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </Box>
                            </Grid>

                            {/* Right Column */}
                            <Grid item xs={12} md={6}>
                                {/* Variable Mapping Section */}
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant='h6' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconSettings size={20} />
                                            Variable Mapping (API Response)
                                        </Typography>
                                        <IconButton
                                            size='small'
                                            color='primary'
                                            onClick={handleAddVariableMappingInDialog}
                                            disabled={!tempMapping.varName.trim()}
                                        >
                                            <IconPlus />
                                        </IconButton>
                                    </Box>
                                    <Paper variant='outlined' sx={{ p: 2 }}>
                                        <TextField
                                            fullWidth
                                            size='small'
                                            label='Variable Name'
                                            placeholder='e.g., searchResults'
                                            value={tempMapping.varName}
                                            onChange={(e) => setTempMapping({ ...tempMapping, varName: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            label='JavaScript Code (Return Value)'
                                            placeholder='return response.data.items;'
                                            value={tempMapping.apiPath}
                                            onChange={(e) => setTempMapping({ ...tempMapping, apiPath: e.target.value })}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.875rem'
                                                }
                                            }}
                                        />

                                        <Divider sx={{ my: 2 }} />

                                        <TableContainer>
                                            <Table size='small'>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 600 }}>Variable</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Code Preview</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }} align='right'>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {currentToolResponse.variableMappings.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={3} align='center' sx={{ py: 2 }}>
                                                                <Typography variant='body2' color='text.secondary'>
                                                                    No variable mappings added
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        currentToolResponse.variableMappings.map((mapping) => (
                                                            <TableRow key={mapping.id} hover>
                                                                <TableCell>
                                                                    <Chip label={mapping.varName} size='small' color='secondary' />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>
                                                                        {mapping.apiPath ? mapping.apiPath.substring(0, 30) + (mapping.apiPath.length > 30 ? '...' : '') : '(no code)'}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align='right'>
                                                                    <IconButton
                                                                        size='small'
                                                                        onClick={() => handleEditVariableMappingInDialog(mapping.id)}
                                                                    >
                                                                        <IconEdit size={16} />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        size='small'
                                                                        color='error'
                                                                        onClick={() => handleDeleteVariableMappingInDialog(mapping.id)}
                                                                    >
                                                                        <IconTrash size={16} />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Box>

                                {/* Function Response Section */}
                                <Box>
                                    <Typography variant='h6' sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconFunction size={20} />
                                        Function Response
                                    </Typography>
                                    <Paper variant='outlined' sx={{ p: 2 }}>
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Data Type</InputLabel>
                                            <Select
                                                value={currentToolResponse.functionResponse.type}
                                                label='Data Type'
                                                size='small'
                                                onChange={(e) => setCurrentToolResponse({
                                                    ...currentToolResponse,
                                                    functionResponse: {
                                                        ...currentToolResponse.functionResponse,
                                                        type: e.target.value
                                                    }
                                                })}
                                            >
                                                <MenuItem value='string'>String</MenuItem>
                                                <MenuItem value='number'>Number</MenuItem>
                                                <MenuItem value='boolean'>Boolean</MenuItem>
                                                <MenuItem value='object'>Object</MenuItem>
                                                <MenuItem value='array'>Array</MenuItem>
                                            </Select>
                                        </FormControl>
                                        
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={6}
                                            label='Response Value'
                                            placeholder='Enter the function response value...'
                                            value={currentToolResponse.functionResponse.value}
                                            onChange={(e) => setCurrentToolResponse({
                                                ...currentToolResponse,
                                                functionResponse: {
                                                    ...currentToolResponse.functionResponse,
                                                    value: e.target.value
                                                }
                                            })}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.875rem'
                                                }
                                            }}
                                        />
                                    </Paper>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseToolResponseDialog} size='large'>
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        size='large'
                        onClick={handleSaveToolResponse}
                    >
                        Save & Go Back
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Document Store Selection Dialog */}
            <Dialog open={documentStoreDialogOpen} onClose={handleCloseDocumentStoreDialog} maxWidth='md' fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconFile />
                        Add Document from Store
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant='body1' sx={{ mb: 3, color: 'text.secondary' }}>
                            Select a document store to add documents from your knowledge base.
                        </Typography>
                        
                        <FormControl fullWidth>
                            <InputLabel>Document Store</InputLabel>
                            <Select
                                value={selectedDocumentStore}
                                label='Document Store'
                                onChange={(e) => setSelectedDocumentStore(e.target.value)}
                            >
                                {documentStores.length === 0 ? (
                                    <MenuItem disabled>
                                        No document stores available
                                    </MenuItem>
                                ) : (
                                    documentStores.map((store) => (
                                        <MenuItem key={store.id} value={store.id}>
                                            <Box>
                                                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                                    {store.label || store.name}
                                                </Typography>
                                                {store.description && (
                                                    <Typography variant='caption' color='text.secondary'>
                                                        {store.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        {selectedDocumentStore && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                                <Typography variant='body2' color='primary.dark'>
                                    <strong>Selected:</strong> {documentStores.find(s => s.id === selectedDocumentStore)?.label || documentStores.find(s => s.id === selectedDocumentStore)?.name}
                                </Typography>
                                {documentStores.find(s => s.id === selectedDocumentStore)?.description && (
                                    <Typography variant='caption' color='primary.dark' sx={{ mt: 1, display: 'block' }}>
                                        {documentStores.find(s => s.id === selectedDocumentStore)?.description}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDocumentStoreDialog} size='large'>
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        size='large'
                        onClick={handleSaveDocumentFromStore}
                        disabled={!selectedDocumentStore}
                    >
                        Add Document
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Expanded Prompt Dialog */}
            <Dialog 
                open={promptDialogOpen} 
                onClose={handleClosePromptDialog} 
                maxWidth='lg' 
                fullWidth
                PaperProps={{
                    sx: {
                        height: '90vh',
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconEdit />
                        <Typography variant='h6'>System Prompt Editor</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, height: '100%' }}>
                        <TextField
                            fullWidth
                            multiline
                            placeholder='Enter your prompt here...'
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            variant='outlined'
                            sx={{
                                height: '100%',
                                '& .MuiOutlinedInput-root': {
                                    fontFamily: 'monospace',
                                    fontSize: '1rem',
                                    height: '100%',
                                    alignItems: 'flex-start'
                                },
                                '& .MuiInputBase-input': {
                                    height: '100% !important',
                                    overflow: 'auto !important'
                                }
                            }}
                        />
                        <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                            Changes are auto-saved. Click close when done.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        variant='contained' 
                        onClick={handleClosePromptDialog}
                        size='large'
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default Agentic
