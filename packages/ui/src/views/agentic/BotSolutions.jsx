import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Box,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Typography,
    Stack
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconPlus, IconTrash, IconArrowLeft, IconCheck, IconSettings } from '@tabler/icons-react'

// Project imports
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import botsApi from '@/api/bots'
import solutionsApi from '@/api/solutions'
import { useDispatch } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'

const BotSolutions = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { botId } = useParams()

    const [bot, setBot] = useState(null)
    const [solutions, setSolutions] = useState([])
    const [newSolutionName, setNewSolutionName] = useState('')
    const [newSolutionDescription, setNewSolutionDescription] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        console.log('🔄 BotSolutions mounted/updated, botId:', botId)
        if (botId) {
            loadBot()
            loadSolutions()
        } else {
            console.error('❌ No botId in URL params')
        }
    }, [botId])

    const loadBot = async () => {
        try {
            const response = await botsApi.getBotById(botId)
            setBot(response.data)
        } catch (error) {
            console.error('Error loading bot:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to load bot',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error'
                }
            }))
        }
    }

    const loadSolutions = async () => {
        try {
            setLoading(true)
            const response = await solutionsApi.getSolutionsByBotId(botId)
            // Sort solutions: orchestrator first, then by creation date descending
            const sorted = response.data.sort((a, b) => {
                if (a.type === 'ORCHESTRATOR' && b.type !== 'ORCHESTRATOR') return -1
                if (a.type !== 'ORCHESTRATOR' && b.type === 'ORCHESTRATOR') return 1
                return new Date(b.createdDate) - new Date(a.createdDate)
            })
            setSolutions(sorted)
        } catch (error) {
            console.error('Error loading solutions:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to load solutions',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error'
                }
            }))
        } finally {
            setLoading(false)
        }
    }

    const handleCreateSolution = async () => {
        console.log('🔍 Create Solution clicked:', { botId, newSolutionName, loading })
        
        if (!botId) {
            console.error('❌ No botId found in URL')
            dispatch(enqueueSnackbarAction({
                message: 'Error: Bot ID not found. Please navigate back to bots page.',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error'
                }
            }))
            return
        }
        
        if (!newSolutionName.trim()) {
            console.warn('⚠️ Solution name is empty')
            dispatch(enqueueSnackbarAction({
                message: 'Solution name is required',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'warning'
                }
            }))
            return
        }

        try {
            setLoading(true)
            console.log('📤 Sending create solution request:', {
                botId,
                name: newSolutionName,
                description: newSolutionDescription
            })
            
            const response = await solutionsApi.createSolution({
                botId,
                name: newSolutionName,
                description: newSolutionDescription
            })
            
            console.log('✅ Solution created successfully:', response.data)
            
            dispatch(enqueueSnackbarAction({
                message: 'Solution created successfully',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'success'
                }
            }))
            
            setNewSolutionName('')
            setNewSolutionDescription('')
            await loadSolutions()
        } catch (error) {
            console.error('❌ Error creating solution:', error)
            console.error('Error details:', error.response?.data || error.message)
            dispatch(enqueueSnackbarAction({
                message: `Failed to create solution: ${error.response?.data?.message || error.message}`,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error'
                }
            }))
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteSolution = async (solutionId) => {
        if (!window.confirm('Are you sure you want to delete this solution?')) {
            return
        }

        try {
            setLoading(true)
            await solutionsApi.deleteSolution(solutionId)
            
            dispatch(enqueueSnackbarAction({
                message: 'Solution deleted successfully',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'success'
                }
            }))
            
            await loadSolutions()
        } catch (error) {
            console.error('Error deleting solution:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to delete solution',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error'
                }
            }))
        } finally {
            setLoading(false)
        }
    }

    const handleSolutionClick = (solutionId) => {
        navigate(`/agentic/${solutionId}`)
    }

    const regularSolutionsCount = solutions.filter(s => s.type === 'REGULAR').length

    return (
        <>
            <ViewHeader />
            <MainCard>
                <Box sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                        <IconButton onClick={() => navigate('/bots')}>
                            <IconArrowLeft />
                        </IconButton>
                        <Typography variant="h3">
                            {bot?.name || 'Bot Solutions'}
                        </Typography>
                    </Stack>
                    {bot?.description && (
                        <Typography variant="body1" color="textSecondary" sx={{ ml: 6 }}>
                            {bot.description}
                        </Typography>
                    )}
                </Box>

                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <TextField
                            label="Solution Name"
                            size="small"
                            value={newSolutionName}
                            onChange={(e) => setNewSolutionName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && newSolutionName.trim() && !loading) {
                                    handleCreateSolution()
                                }
                            }}
                            sx={{ mr: 2, minWidth: 300 }}
                            placeholder="Enter solution name and press Enter"
                            helperText="Type a name and click the button or press Enter"
                        />
                        <Button
                            variant="contained"
                            startIcon={<IconPlus />}
                            onClick={handleCreateSolution}
                            disabled={!newSolutionName.trim() || loading}
                            sx={{
                                backgroundColor: '#00CED1',
                                '&:hover': {
                                    backgroundColor: '#00B8B8'
                                },
                                '&:disabled': {
                                    backgroundColor: '#B0E0E6',
                                    color: '#666'
                                }
                            }}
                        >
                            New Solution
                        </Button>
                    </Box>
                    {regularSolutionsCount > 1 && (
                        <Chip
                            label={`Auto-Orchestrator Active`}
                            color="success"
                            icon={<IconCheck />}
                        />
                    )}
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Solution Name</strong></TableCell>
                                <TableCell><strong>Type</strong></TableCell>
                                <TableCell><strong>Creation Time</strong></TableCell>
                                <TableCell align="center"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {solutions.map((solution) => (
                                <TableRow
                                    key={solution.id}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover,
                                            cursor: 'pointer'
                                        }
                                    }}
                                >
                                    <TableCell onClick={() => handleSolutionClick(solution.id)}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Typography variant="body1">
                                                {solution.name}
                                            </Typography>
                                            {solution.type === 'ORCHESTRATOR' && (
                                                <Chip
                                                    label="Orchestrator"
                                                    size="small"
                                                    color="primary"
                                                    sx={{ ml: 1 }}
                                                />
                                            )}
                                        </Stack>
                                        {solution.description && (
                                            <Typography variant="caption" color="textSecondary" display="block">
                                                {solution.description}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell onClick={() => handleSolutionClick(solution.id)}>
                                        <Chip
                                            label={solution.type}
                                            size="small"
                                            color={solution.type === 'ORCHESTRATOR' ? 'primary' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell onClick={() => handleSolutionClick(solution.id)}>
                                        {new Date(solution.createdDate).toLocaleString()}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleSolutionClick(solution.id)
                                                }}
                                                sx={{ color: theme.palette.primary.main }}
                                                title="Configure Agent"
                                            >
                                                <IconSettings size={18} />
                                            </IconButton>
                                            {solution.type !== 'ORCHESTRATOR' && (
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteSolution(solution.id)
                                                    }}
                                                    sx={{ color: theme.palette.error.main }}
                                                    title="Delete Solution"
                                                >
                                                    <IconTrash size={18} />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            
                            {solutions.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" color="textSecondary">
                                            No solutions yet. Create your first solution to get started.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {regularSolutionsCount > 1 && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.success.light + '22', borderRadius: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                            <strong>💡 Note:</strong> Since you have multiple solutions, an Orchestrator Solution has been automatically created 
                            to manage and coordinate between your solutions.
                        </Typography>
                    </Box>
                )}
                
                {solutions.length > 0 && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.info.light + '11', borderRadius: 1, border: `1px solid ${theme.palette.info.light}` }}>
                        <Typography variant="body2" color="textSecondary">
                            <strong>💡 Tip:</strong> Click on any solution name or click the <IconSettings size={14} style={{ verticalAlign: 'middle' }} /> button to configure its agents, tools, and settings.
                        </Typography>
                    </Box>
                )}
            </MainCard>
        </>
    )
}

export default BotSolutions

