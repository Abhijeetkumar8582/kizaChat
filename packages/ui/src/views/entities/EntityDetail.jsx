import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'

// Material-UI
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material'

// Icons
import { IconPlus, IconEdit, IconTrash, IconArrowLeft, IconDatabase } from '@tabler/icons-react'

// API
import entitiesApi from '@/api/entities'
import variablesApi from '@/api/variables'

const dataTypes = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'date', label: 'Date' },
    { value: 'object', label: 'Object' },
    { value: 'array', label: 'Array' }
]

const EntityDetail = () => {
    const { entityId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [entity, setEntity] = useState(null)
    const [variables, setVariables] = useState([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [currentVariable, setCurrentVariable] = useState(null)

    // Form state
    const [variableName, setVariableName] = useState('')
    const [variableDescription, setVariableDescription] = useState('')
    const [variableDataType, setVariableDataType] = useState('string')

    useEffect(() => {
        loadEntityAndVariables()
    }, [entityId])

    const loadEntityAndVariables = async () => {
        try {
            setLoading(true)
            
            // Load entity
            const entityResponse = await entitiesApi.getEntityById(entityId)
            setEntity(entityResponse.data)

            // Load variables for this entity
            const variablesResponse = await variablesApi.getVariablesByEntityId(entityId)
            setVariables(variablesResponse.data.data)

        } catch (error) {
            console.error('Error loading entity:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to load entity details',
                options: { variant: 'error' }
            }))
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (variable = null) => {
        if (variable) {
            setEditMode(true)
            setCurrentVariable(variable)
            setVariableName(variable.name)
            setVariableDescription(variable.value || '')
            setVariableDataType(variable.type || 'string')
        } else {
            setEditMode(false)
            setCurrentVariable(null)
            setVariableName('')
            setVariableDescription('')
            setVariableDataType('string')
        }
        setDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setDialogOpen(false)
        setEditMode(false)
        setCurrentVariable(null)
        setVariableName('')
        setVariableDescription('')
        setVariableDataType('string')
    }

    const handleSaveVariable = async () => {
        try {
            const variableData = {
                name: variableName,
                value: variableDescription,
                type: variableDataType,
                entityId: entityId
            }

            if (editMode) {
                await variablesApi.updateVariable(currentVariable.id, variableData)
                dispatch(enqueueSnackbarAction({
                    message: 'Variable updated successfully',
                    options: { variant: 'success' }
                }))
            } else {
                await variablesApi.createVariable(variableData)
                dispatch(enqueueSnackbarAction({
                    message: 'Variable created successfully',
                    options: { variant: 'success' }
                }))
            }

            handleCloseDialog()
            loadEntityAndVariables()

        } catch (error) {
            console.error('Error saving variable:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to save variable',
                options: { variant: 'error' }
            }))
        }
    }

    const handleDeleteVariable = async (variableId) => {
        if (!window.confirm('Are you sure you want to delete this variable?')) return

        try {
            await variablesApi.deleteVariable(variableId)
            dispatch(enqueueSnackbarAction({
                message: 'Variable deleted successfully',
                options: { variant: 'success' }
            }))
            loadEntityAndVariables()
        } catch (error) {
            console.error('Error deleting variable:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to delete variable',
                options: { variant: 'error' }
            }))
        }
    }

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading...</Typography>
            </Box>
        )
    }

    if (!entity) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Entity not found</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<IconArrowLeft />}
                    onClick={() => navigate('/variables')}
                    sx={{ mb: 2 }}
                >
                    Back to Entities
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconDatabase size={32} />
                            {entity.name}
                        </Typography>
                        {entity.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {entity.description}
                            </Typography>
                        )}
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<IconPlus />}
                        onClick={() => handleOpenDialog()}
                        sx={{
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)'
                            }
                        }}
                    >
                        Create Variable
                    </Button>
                </Box>
            </Box>

            {/* Variables Table */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Variables ({variables.length})
                    </Typography>

                    {variables.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <IconDatabase size={64} color="#ccc" />
                            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                                No variables yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Create your first variable for this entity
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<IconPlus />}
                                onClick={() => handleOpenDialog()}
                            >
                                Create Variable
                            </Button>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Variable Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Data Type</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {variables.map((variable) => (
                                        <TableRow key={variable.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {variable.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {variable.value || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={variable.type || 'string'} 
                                                    size="small" 
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(variable.createdDate).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenDialog(variable)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    <IconEdit size={18} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteVariable(variable.id)}
                                                >
                                                    <IconTrash size={18} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Variable Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editMode ? 'Edit Variable' : 'Create Variable'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Variable Name"
                            value={variableName}
                            onChange={(e) => setVariableName(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            value={variableDescription}
                            onChange={(e) => setVariableDescription(e.target.value)}
                            multiline
                            rows={3}
                            sx={{ mb: 2 }}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Data Type</InputLabel>
                            <Select
                                value={variableDataType}
                                label="Data Type"
                                onChange={(e) => setVariableDataType(e.target.value)}
                            >
                                {dataTypes.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSaveVariable}
                        variant="contained"
                        disabled={!variableName}
                    >
                        {editMode ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default EntityDetail

