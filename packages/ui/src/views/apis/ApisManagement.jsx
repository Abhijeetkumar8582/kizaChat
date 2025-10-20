import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tooltip,
    Alert
} from '@mui/material'
import {
    IconPlus,
    IconApi,
    IconEdit,
    IconTrash,
    IconPlayerPlay,
    IconSettings,
    IconEye,
    IconCode,
    IconFlask
} from '@tabler/icons-react'
import apisApi from '@/api/apis'
import { enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'

const ApisManagement = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const [apis, setApis] = useState([])
    const [loading, setLoading] = useState(true)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedApi, setSelectedApi] = useState(null)
    
    // Helper function to parse tags
    const parseTags = (tags) => {
        if (!tags) return []
        if (Array.isArray(tags)) return tags
        try {
            return JSON.parse(tags)
        } catch {
            return []
        }
    }
    
    // Create API form
    const [createForm, setCreateForm] = useState({
        name: '',
        description: '',
        baseUrl: '',
        authType: 'NONE',
        tags: ''
    })

    useEffect(() => {
        loadApis()
    }, [])

    const loadApis = async () => {
        try {
            setLoading(true)
            const response = await apisApi.getAllApis()
            setApis(response.data)
        } catch (error) {
            console.error('Error loading APIs:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to load APIs',
                options: { variant: 'error' }
            }))
        } finally {
            setLoading(false)
        }
    }

    const handleCreateApi = async () => {
        try {
            const tags = createForm.tags ? createForm.tags.split(',').map(tag => tag.trim()) : []
            const apiData = {
                ...createForm,
                tags: tags.length > 0 ? JSON.stringify(tags) : undefined
            }
            
            const response = await apisApi.createApi(apiData)
            setApis(prev => [response.data, ...prev])
            setCreateDialogOpen(false)
            setCreateForm({
                name: '',
                description: '',
                baseUrl: '',
                authType: 'NONE',
                tags: ''
            })
            
            dispatch(enqueueSnackbarAction({
                message: 'API created successfully',
                options: { variant: 'success' }
            }))
        } catch (error) {
            console.error('Error creating API:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to create API',
                options: { variant: 'error' }
            }))
        }
    }

    const handleDeleteApi = async () => {
        try {
            await apisApi.deleteApi(selectedApi.id)
            setApis(prev => prev.filter(api => api.id !== selectedApi.id))
            setDeleteDialogOpen(false)
            setSelectedApi(null)
            
            dispatch(enqueueSnackbarAction({
                message: 'API deleted successfully',
                options: { variant: 'success' }
            }))
        } catch (error) {
            console.error('Error deleting API:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to delete API',
                options: { variant: 'error' }
            }))
        }
    }

    const getAuthTypeColor = (authType) => {
        switch (authType) {
            case 'NONE': return 'default'
            case 'BEARER': return 'success'
            case 'API_KEY': return 'warning'
            case 'OAUTH2': return 'info'
            default: return 'default'
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
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
                <Typography>Loading APIs...</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconApi size={32} />
                        APIs Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Manage your API collections and test endpoints
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<IconPlus />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{ 
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)'
                        }
                    }}
                >
                    Create New API
                </Button>
            </Box>

            {/* APIs Grid */}
            {apis.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <IconApi size={64} color="#ccc" />
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                            No APIs Created Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Create your first API collection to get started with testing and managing endpoints
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<IconPlus />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Create Your First API
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {apis.map((api) => (
                        <Grid item xs={12} md={6} lg={4} key={api.id}>
                            <Card 
                                sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.2s ease-in-out',
                                    backgroundColor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 3,
                                        borderColor: 'primary.main'
                                    }
                                }}
                            >
                                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    {/* API Header */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                {api.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {api.baseUrl}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            label={api.authType} 
                                            size="small" 
                                            color={getAuthTypeColor(api.authType)}
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>

                                    {/* Description */}
                                    {api.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                                            {api.description}
                                        </Typography>
                                    )}

                                    {/* Tags */}
                                    {parseTags(api.tags).length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            {parseTags(api.tags).map((tag, index) => (
                                                <Chip 
                                                    key={index}
                                                    label={tag} 
                                                    size="small" 
                                                    variant="outlined"
                                                    sx={{ mr: 0.5, mb: 0.5 }}
                                                />
                                            ))}
                                        </Box>
                                    )}

                                    {/* Stats */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {api.requests?.length || 0} requests
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(api.createdDate)}
                                        </Typography>
                                    </Box>

                                    {/* Actions */}
                                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                        <Tooltip title="Manage Requests">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/apis/${api.id}`)}
                                                sx={{ color: 'primary.main' }}
                                            >
                                                <IconEdit size={16} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/apis/${api.id}`)}
                                                sx={{ color: 'info.main' }}
                                            >
                                                <IconEye size={16} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete API">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setSelectedApi(api)
                                                    setDeleteDialogOpen(true)
                                                }}
                                                sx={{ color: 'error.main' }}
                                            >
                                                <IconTrash size={16} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Create API Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New API</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="API Name"
                            value={createForm.name}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Description"
                            value={createForm.description}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <TextField
                            label="Base URL"
                            value={createForm.baseUrl}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, baseUrl: e.target.value }))}
                            fullWidth
                            required
                            placeholder="https://api.example.com"
                        />
                        <TextField
                            select
                            label="Authentication Type"
                            value={createForm.authType}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, authType: e.target.value }))}
                            fullWidth
                        >
                            <MenuItem value="NONE">None</MenuItem>
                            <MenuItem value="BEARER">Bearer Token</MenuItem>
                            <MenuItem value="API_KEY">API Key</MenuItem>
                            <MenuItem value="OAUTH2">OAuth 2.0</MenuItem>
                        </TextField>
                        <TextField
                            label="Tags (comma-separated)"
                            value={createForm.tags}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, tags: e.target.value }))}
                            fullWidth
                            placeholder="production, v1, internal"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleCreateApi} 
                        variant="contained"
                        disabled={!createForm.name || !createForm.baseUrl}
                    >
                        Create API
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete API</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{selectedApi?.name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteApi} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default ApisManagement

