import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Card,
    CardContent,
    Typography,
    IconButton,
    Stack
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconRobot, IconPlus, IconTrash } from '@tabler/icons-react'

// Project imports
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import botsApi from '@/api/bots'
import { useDispatch } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'

const BotsManagement = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [bots, setBots] = useState([])
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [newBotName, setNewBotName] = useState('')
    const [newBotDescription, setNewBotDescription] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadBots()
    }, [])

    const loadBots = async () => {
        try {
            setLoading(true)
            const response = await botsApi.getAllBots()
            setBots(response.data)
        } catch (error) {
            console.error('Error loading bots:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to load bots',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error'
                }
            }))
        } finally {
            setLoading(false)
        }
    }

    const handleCreateBot = async () => {
        if (!newBotName.trim()) {
            dispatch(enqueueSnackbarAction({
                message: 'Bot name is required',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'warning'
                }
            }))
            return
        }

        try {
            setLoading(true)
            await botsApi.createBot({
                name: newBotName,
                description: newBotDescription
            })
            
            dispatch(enqueueSnackbarAction({
                message: 'Bot created successfully',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'success'
                }
            }))
            
            setCreateDialogOpen(false)
            setNewBotName('')
            setNewBotDescription('')
            await loadBots()
        } catch (error) {
            console.error('Error creating bot:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to create bot',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error'
                }
            }))
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteBot = async (botId) => {
        if (!window.confirm('Are you sure you want to delete this bot? This will also delete all associated solutions.')) {
            return
        }

        try {
            setLoading(true)
            await botsApi.deleteBot(botId)
            
            dispatch(enqueueSnackbarAction({
                message: 'Bot deleted successfully',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'success'
                }
            }))
            
            await loadBots()
        } catch (error) {
            console.error('Error deleting bot:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to delete bot',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error'
                }
            }))
        } finally {
            setLoading(false)
        }
    }

    const handleBotClick = (botId) => {
        navigate(`/bots/${botId}/solutions`)
    }

    return (
        <>
            <ViewHeader title='Agentic Bots' />
            <MainCard>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Grid container spacing={3}>
                        {/* Left side - Bot cards */}
                        <Grid item xs={12} md={7}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h4" sx={{ mb: 2 }}>
                                    Your Bots
                                </Typography>
                            </Box>
                            
                            <Grid container spacing={2}>
                                {bots.map((bot) => (
                                    <Grid item xs={12} sm={6} key={bot.id}>
                                        <Card
                                            sx={{
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: theme.shadows[4]
                                                }
                                            }}
                                        >
                                            <CardContent>
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                    <Box sx={{ flex: 1 }} onClick={() => handleBotClick(bot.id)}>
                                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                                            <IconRobot size={24} color={theme.palette.primary.main} />
                                                            <Typography variant="h5">
                                                                {bot.name}
                                                            </Typography>
                                                        </Stack>
                                                        {bot.description && (
                                                            <Typography variant="body2" color="textSecondary">
                                                                {bot.description}
                                                            </Typography>
                                                        )}
                                                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                                            Created: {new Date(bot.createdDate).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteBot(bot.id)
                                                        }}
                                                        sx={{ color: theme.palette.error.main }}
                                                    >
                                                        <IconTrash size={18} />
                                                    </IconButton>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                                
                                {bots.length === 0 && !loading && (
                                    <Grid item xs={12}>
                                        <Box
                                            sx={{
                                                textAlign: 'center',
                                                py: 4,
                                                color: theme.palette.text.secondary
                                            }}
                                        >
                                            <IconRobot size={64} />
                                            <Typography variant="h5" sx={{ mt: 2 }}>
                                                No bots yet
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                Create your first bot to get started
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>

                        {/* Right side - Create bot card */}
                        <Grid item xs={12} md={5}>
                            <Card
                                sx={{
                                    height: '100%',
                                    minHeight: 300,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `linear-gradient(135deg, ${theme.palette.primary.light}22 0%, ${theme.palette.secondary.light}22 100%)`,
                                    border: `2px dashed ${theme.palette.primary.main}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: theme.palette.primary.dark,
                                        background: `linear-gradient(135deg, ${theme.palette.primary.light}33 0%, ${theme.palette.secondary.light}33 100%)`
                                    }
                                }}
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                <CardContent>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                background: theme.palette.primary.main,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto',
                                                mb: 2
                                            }}
                                        >
                                            <IconPlus size={40} color="white" />
                                        </Box>
                                        <Typography variant="h4" sx={{ mb: 1 }}>
                                            Create New Bot
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Set up a new agentic bot with multiple solutions
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </MainCard>

            {/* Create Bot Dialog */}
            <Dialog 
                open={createDialogOpen} 
                onClose={() => setCreateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Create New Bot</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            autoFocus
                            label="Bot Name"
                            fullWidth
                            value={newBotName}
                            onChange={(e) => setNewBotName(e.target.value)}
                            sx={{ mb: 2 }}
                            required
                        />
                        <TextField
                            label="Description (Optional)"
                            fullWidth
                            multiline
                            rows={3}
                            value={newBotDescription}
                            onChange={(e) => setNewBotDescription(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreateBot} 
                        variant="contained"
                        disabled={!newBotName.trim() || loading}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default BotsManagement

