import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
    Card,
    CardContent,
    Chip,
    Stack
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconSparkles, IconRocket, IconCode } from '@tabler/icons-react'

// API
import agenticApi from '@/api/agentic'
import useApi from '@/hooks/useApi'
import { StyledButton } from '@/ui-component/button/StyledButton'

const FLOW_TYPES = [
    { value: 'CHATFLOW', label: 'Chatflow', description: 'Traditional chatbot flow' },
    { value: 'AGENTFLOW', label: 'Agentflow', description: 'Agent-based workflow' },
    { value: 'MULTIAGENT', label: 'Multi-Agent', description: 'Multiple cooperating agents' }
]

const EXAMPLE_PROMPTS = [
    'Create a customer support chatbot that can answer questions from a knowledge base',
    'Build an agent that researches topics on the web and summarizes findings',
    'Create a document Q&A system that can answer questions from uploaded PDFs',
    'Build a code generation assistant that helps with Python programming',
    'Create a multi-agent system for data analysis with web search capabilities'
]

const FlowGenerator = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const [description, setDescription] = useState('')
    const [flowType, setFlowType] = useState('CHATFLOW')
    const [generatedFlow, setGeneratedFlow] = useState(null)
    const [error, setError] = useState(null)

    const generateFlowApi = useApi(agenticApi.generateFlow)

    const handleGenerate = async () => {
        if (!description.trim()) {
            setError('Please enter a description')
            return
        }

        setError(null)
        setGeneratedFlow(null)

        try {
            const response = await generateFlowApi.request({
                description,
                flowType
            })

            if (response.data.success) {
                setGeneratedFlow(response.data)
            } else {
                setError('Failed to generate flow. Please try again.')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while generating the flow')
        }
    }

    const handleCreateFlow = () => {
        if (generatedFlow && generatedFlow.flowData) {
            // Navigate to canvas with generated flow data
            navigate('/canvas', {
                state: {
                    templateFlowData: JSON.stringify({
                        nodes: generatedFlow.flowData.nodes,
                        edges: generatedFlow.flowData.edges,
                        viewport: { x: 0, y: 0, zoom: 1 }
                    })
                }
            })
        }
    }

    const handleExampleClick = (example) => {
        setDescription(example)
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant='h4' sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconSparkles size={24} />
                    AI Flow Generator
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                    Describe what you want to build and let AI create a complete flow for you
                </Typography>
            </Box>

            {/* Flow Type Selection */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                    Select Flow Type
                </Typography>
                <ToggleButtonGroup
                    value={flowType}
                    exclusive
                    onChange={(e, newType) => newType && setFlowType(newType)}
                    aria-label='flow type'
                    sx={{ mb: 2 }}
                >
                    {FLOW_TYPES.map((type) => (
                        <ToggleButton key={type.value} value={type.value} sx={{ px: 3, py: 1.5 }}>
                            <Box sx={{ textAlign: 'left' }}>
                                <Typography variant='body1' sx={{ fontWeight: 600 }}>
                                    {type.label}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                    {type.description}
                                </Typography>
                            </Box>
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Paper>

            {/* Example Prompts */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                    Example Prompts
                </Typography>
                <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                    {EXAMPLE_PROMPTS.map((example, idx) => (
                        <Chip
                            key={idx}
                            label={example}
                            onClick={() => handleExampleClick(example)}
                            sx={{ 
                                mb: 1,
                                height: 'auto',
                                py: 1,
                                px: 1.5,
                                '& .MuiChip-label': {
                                    whiteSpace: 'normal',
                                    textAlign: 'left'
                                }
                            }}
                        />
                    ))}
                </Stack>
            </Paper>

            {/* Description Input */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                    Describe Your Flow
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={6}
                    placeholder='Example: Create a customer support chatbot that can answer questions from a knowledge base stored in Pinecone. It should have conversation memory and be able to search the web for additional information if needed.'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Button
                    variant='contained'
                    size='large'
                    startIcon={generateFlowApi.loading ? <CircularProgress size={20} /> : <IconSparkles />}
                    onClick={handleGenerate}
                    disabled={generateFlowApi.loading || !description.trim()}
                    sx={{ px: 4 }}
                >
                    {generateFlowApi.loading ? 'Generating...' : 'Generate Flow'}
                </Button>
            </Paper>

            {/* Error Display */}
            {error && (
                <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Generated Flow */}
            {generatedFlow && (
                <Paper elevation={2} sx={{ p: 3, bgcolor: theme.palette.success.lighter }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <IconRocket size={24} color={theme.palette.success.dark} />
                        <Typography variant='h5' sx={{ fontWeight: 600, color: theme.palette.success.dark }}>
                            Flow Generated Successfully!
                        </Typography>
                    </Box>

                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant='h6' sx={{ mb: 1 }}>
                                {generatedFlow.flowData.name}
                            </Typography>
                            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                                {generatedFlow.flowData.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <Chip label={`${generatedFlow.flowData.nodes?.length || 0} Nodes`} color='primary' size='small' />
                                <Chip label={`${generatedFlow.flowData.edges?.length || 0} Connections`} color='primary' size='small' />
                            </Box>
                        </CardContent>
                    </Card>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant='contained'
                            size='large'
                            startIcon={<IconCode />}
                            onClick={handleCreateFlow}
                            sx={{ px: 4 }}
                        >
                            Open in Canvas
                        </Button>
                        <Button
                            variant='outlined'
                            size='large'
                            onClick={() => setGeneratedFlow(null)}
                        >
                            Generate Another
                        </Button>
                    </Box>
                </Paper>
            )}
        </Box>
    )
}

export default FlowGenerator

