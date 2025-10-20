import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'

// Material-UI
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Grid,
    IconButton,
    Chip
} from '@mui/material'

// Icons
import { IconPlus, IconEdit, IconTrash, IconDatabase, IconChevronRight } from '@tabler/icons-react'

// Components
import AddEntityDialog from '../variables/AddEntityDialog'

// API
import entitiesApi from '@/api/entities'

const EntitiesManagement = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [entities, setEntities] = useState([])
    const [loading, setLoading] = useState(true)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    useEffect(() => {
        loadEntities()
    }, [])

    const loadEntities = async () => {
        try {
            setLoading(true)
            const response = await entitiesApi.getAllEntities()
            setEntities(response.data || [])
        } catch (error) {
            console.error('Error loading entities:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to load entities',
                options: { variant: 'error' }
            }))
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteEntity = async (entityId) => {
        if (!window.confirm('Are you sure you want to delete this entity? All its variables will also be deleted.')) return

        try {
            await entitiesApi.deleteEntity(entityId)
            dispatch(enqueueSnackbarAction({
                message: 'Entity deleted successfully',
                options: { variant: 'success' }
            }))
            loadEntities()
        } catch (error) {
            console.error('Error deleting entity:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to delete entity',
                options: { variant: 'error' }
            }))
        }
    }

    const handleEntityCreated = () => {
        setCreateDialogOpen(false)
        dispatch(enqueueSnackbarAction({
            message: 'Entity created successfully',
            options: { variant: 'success' }
        }))
        loadEntities()
    }

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading entities...</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconDatabase size={32} />
                        Entities & Variables
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Manage entities and their variables
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
                    Create Entity
                </Button>
            </Box>

            {/* Entities Grid */}
            {entities.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <IconDatabase size={64} color="#ccc" />
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                            No Entities Created Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Create your first entity to organize variables
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<IconPlus />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Create Your First Entity
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {entities.map((entity) => (
                        <Grid item xs={12} md={6} lg={4} key={entity.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.2s ease-in-out',
                                    backgroundColor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 3,
                                        borderColor: 'primary.main'
                                    }
                                }}
                                onClick={() => navigate(`/entities/${entity.id}`)}
                            >
                                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    {/* Entity Header */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <IconDatabase size={20} />
                                                {entity.name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteEntity(entity.id)
                                                }}
                                            >
                                                <IconTrash size={16} />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    {/* Description */}
                                    {entity.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                                            {entity.description}
                                        </Typography>
                                    )}

                                    {/* Stats */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Chip
                                            label={`${entity.variables?.length || 0} variables`}
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                        />
                                        <IconButton size="small" color="primary">
                                            <IconChevronRight size={20} />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Create Entity Dialog */}
            <AddEntityDialog
                show={createDialogOpen}
                onCancel={() => setCreateDialogOpen(false)}
                onConfirm={handleEntityCreated}
            />
        </Box>
    )
}

export default EntitiesManagement

