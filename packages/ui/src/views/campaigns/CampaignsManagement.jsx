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
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    Tabs,
    Tab,
    Paper,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stepper,
    Step,
    StepLabel,
    Select,
    FormControl,
    InputLabel
} from '@mui/material'
import {
    IconPlus,
    IconTarget,
    IconEdit,
    IconTrash,
    IconCopy,
    IconRobot,
    IconCheck,
    IconX,
    IconPlayerPlay,
    IconPlayerPause
} from '@tabler/icons-react'
import botsApi from '@/api/bots'
import { enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'

const CampaignsManagement = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const [bots, setBots] = useState([])
    const [selectedBot, setSelectedBot] = useState(null)
    const [campaigns, setCampaigns] = useState([])
    const [loading, setLoading] = useState(true)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [activeStep, setActiveStep] = useState(0)
    
    // Campaign form
    const [campaignForm, setCampaignForm] = useState({
        name: '',
        type: 'INBOUND',
        state: 'DRAFT',
        targetUrl: '',
        targetDevice: 'ALL',
        targetGeo: '',
        targetSegments: '',
        triggerType: 'TIME_ON_PAGE',
        triggerValue: '30',
        openerMessage: 'Hello! How can we help you?',
        prefillParams: '',
        ctaText: 'Get Started',
        scheduleStart: '',
        scheduleEnd: '',
        frequencyCap: '1',
        conversionEvent: '',
        tags: ''
    })

    const steps = ['Basics', 'Targeting', 'Trigger', 'Message', 'Schedule & Goals']

    useEffect(() => {
        loadBots()
    }, [])

    const loadBots = async () => {
        try {
            setLoading(true)
            const response = await botsApi.getAllBots()
            setBots(response.data)
            if (response.data.length > 0) {
                setSelectedBot(response.data[0])
                loadCampaigns(response.data[0].id)
            }
        } catch (error) {
            console.error('Error loading bots:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to load bots',
                options: { variant: 'error' }
            }))
        } finally {
            setLoading(false)
        }
    }

    const loadCampaigns = async (botId) => {
        // TODO: Implement campaigns API
        // For now, using mock data
        setCampaigns([
            {
                id: '1',
                name: 'Welcome Campaign',
                type: 'ON_SITE',
                state: 'ACTIVE',
                targets: 100,
                conversions: 25,
                createdDate: new Date().toISOString()
            }
        ])
    }

    const handleBotSelect = (bot) => {
        setSelectedBot(bot)
        loadCampaigns(bot.id)
    }

    const handleOpenCreateCampaign = () => {
        setActiveStep(0)
        setCampaignForm({
            name: '',
            type: 'INBOUND',
            state: 'DRAFT',
            targetUrl: '',
            targetDevice: 'ALL',
            targetGeo: '',
            targetSegments: '',
            triggerType: 'TIME_ON_PAGE',
            triggerValue: '30',
            openerMessage: 'Hello! How can we help you?',
            prefillParams: '',
            ctaText: 'Get Started',
            scheduleStart: '',
            scheduleEnd: '',
            frequencyCap: '1',
            conversionEvent: '',
            tags: ''
        })
        setCreateDialogOpen(true)
    }

    const handleNext = () => {
        setActiveStep((prev) => prev + 1)
    }

    const handleBack = () => {
        setActiveStep((prev) => prev - 1)
    }

    const handleCreateCampaign = () => {
        dispatch(enqueueSnackbarAction({
            message: 'Campaign created successfully! (Backend integration pending)',
            options: { variant: 'success' }
        }))
        setCreateDialogOpen(false)
    }

    const toggleCampaignState = (campaignId, currentState) => {
        dispatch(enqueueSnackbarAction({
            message: `Campaign ${currentState === 'ACTIVE' ? 'paused' : 'activated'}!`,
            options: { variant: 'success' }
        }))
    }

    const getStateColor = (state) => {
        switch (state) {
            case 'ACTIVE': return 'success'
            case 'DRAFT': return 'default'
            case 'PAUSED': return 'warning'
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
                <Typography>Loading campaigns...</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconTarget size={32} />
                        Campaigns Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Manage marketing campaigns and bot triggers
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<IconPlus />}
                    onClick={handleOpenCreateCampaign}
                    disabled={!selectedBot}
                    sx={{ 
                        background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #FF5252 30%, #FF7043 90%)'
                        }
                    }}
                >
                    Create New Campaign
                </Button>
            </Box>

            {/* Bots Strip */}
            {bots.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <IconRobot size={64} color="#ccc" />
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                            No Bots Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Create some bots first to set up campaigns
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/bots')}
                        >
                            Go to Bots Management
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Select Bot
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {bots.map((bot) => (
                                <Chip
                                    key={bot.id}
                                    label={bot.name}
                                    icon={<IconRobot size={16} />}
                                    onClick={() => handleBotSelect(bot)}
                                    color={selectedBot?.id === bot.id ? 'primary' : 'default'}
                                    variant={selectedBot?.id === bot.id ? 'filled' : 'outlined'}
                                    sx={{ cursor: 'pointer' }}
                                />
                            ))}
                        </Box>
                    </Paper>

                    {/* Campaigns Table */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Campaigns for {selectedBot?.name}
                            </Typography>
                            
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Targets</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Conversions</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {campaigns.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                        No campaigns yet
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<IconPlus />}
                                                        onClick={handleOpenCreateCampaign}
                                                    >
                                                        Create First Campaign
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            campaigns.map((campaign) => (
                                                <TableRow key={campaign.id} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {campaign.name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={campaign.type} size="small" variant="outlined" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={campaign.state} 
                                                            size="small" 
                                                            color={getStateColor(campaign.state)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{campaign.targets}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {campaign.conversions} ({Math.round((campaign.conversions / campaign.targets) * 100)}%)
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatDate(campaign.createdDate)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title={campaign.state === 'ACTIVE' ? 'Pause' : 'Activate'}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => toggleCampaignState(campaign.id, campaign.state)}
                                                                sx={{ color: campaign.state === 'ACTIVE' ? 'warning.main' : 'success.main' }}
                                                            >
                                                                {campaign.state === 'ACTIVE' ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                size="small"
                                                                sx={{ color: 'primary.main' }}
                                                            >
                                                                <IconEdit size={16} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Duplicate">
                                                            <IconButton
                                                                size="small"
                                                                sx={{ color: 'info.main' }}
                                                            >
                                                                <IconCopy size={16} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                size="small"
                                                                sx={{ color: 'error.main' }}
                                                            >
                                                                <IconTrash size={16} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Create Campaign Wizard Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {/* Step 1: Basics */}
                        {activeStep === 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label="Campaign Name"
                                    value={campaignForm.name}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                                    fullWidth
                                    required
                                    placeholder="Summer Promotion 2024"
                                />
                                <FormControl fullWidth>
                                    <InputLabel>Campaign Type</InputLabel>
                                    <Select
                                        value={campaignForm.type}
                                        onChange={(e) => setCampaignForm(prev => ({ ...prev, type: e.target.value }))}
                                        label="Campaign Type"
                                    >
                                        <MenuItem value="INBOUND">Inbound (Link/QR/UTM)</MenuItem>
                                        <MenuItem value="ON_SITE">On-Site Trigger</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Tags (comma-separated)"
                                    value={campaignForm.tags}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, tags: e.target.value }))}
                                    fullWidth
                                    placeholder="summer, promotion, homepage"
                                />
                            </Box>
                        )}

                        {/* Step 2: Targeting */}
                        {activeStep === 1 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label="Target URL Rules"
                                    value={campaignForm.targetUrl}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, targetUrl: e.target.value }))}
                                    fullWidth
                                    placeholder="/pricing, /product/*"
                                    helperText="Comma-separated URL patterns. Use * as wildcard"
                                />
                                <FormControl fullWidth>
                                    <InputLabel>Target Device</InputLabel>
                                    <Select
                                        value={campaignForm.targetDevice}
                                        onChange={(e) => setCampaignForm(prev => ({ ...prev, targetDevice: e.target.value }))}
                                        label="Target Device"
                                    >
                                        <MenuItem value="ALL">All Devices</MenuItem>
                                        <MenuItem value="MOBILE">Mobile Only</MenuItem>
                                        <MenuItem value="DESKTOP">Desktop Only</MenuItem>
                                        <MenuItem value="TABLET">Tablet Only</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Target Geo (Country Codes)"
                                    value={campaignForm.targetGeo}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, targetGeo: e.target.value }))}
                                    fullWidth
                                    placeholder="US, UK, CA (leave empty for all)"
                                />
                                <TextField
                                    label="Target Segments"
                                    value={campaignForm.targetSegments}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, targetSegments: e.target.value }))}
                                    fullWidth
                                    placeholder="premium_users, first_time_visitors"
                                />
                            </Box>
                        )}

                        {/* Step 3: Trigger */}
                        {activeStep === 2 && campaignForm.type === 'ON_SITE' && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Trigger Type</InputLabel>
                                    <Select
                                        value={campaignForm.triggerType}
                                        onChange={(e) => setCampaignForm(prev => ({ ...prev, triggerType: e.target.value }))}
                                        label="Trigger Type"
                                    >
                                        <MenuItem value="TIME_ON_PAGE">Time on Page</MenuItem>
                                        <MenuItem value="SCROLL_PERCENT">Scroll Percentage</MenuItem>
                                        <MenuItem value="EXIT_INTENT">Exit Intent</MenuItem>
                                        <MenuItem value="ELEMENT_CLICK">Element Click</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Trigger Value"
                                    value={campaignForm.triggerValue}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, triggerValue: e.target.value }))}
                                    fullWidth
                                    placeholder={
                                        campaignForm.triggerType === 'TIME_ON_PAGE' ? '30 (seconds)' :
                                        campaignForm.triggerType === 'SCROLL_PERCENT' ? '50 (percent)' :
                                        campaignForm.triggerType === 'ELEMENT_CLICK' ? '#signup-button' :
                                        'Value'
                                    }
                                    helperText={
                                        campaignForm.triggerType === 'TIME_ON_PAGE' ? 'Seconds before trigger' :
                                        campaignForm.triggerType === 'SCROLL_PERCENT' ? 'Percentage of page scrolled' :
                                        campaignForm.triggerType === 'ELEMENT_CLICK' ? 'CSS selector of element' :
                                        ''
                                    }
                                />
                            </Box>
                        )}
                        
                        {activeStep === 2 && campaignForm.type === 'INBOUND' && (
                            <Alert severity="info">
                                Inbound campaigns are triggered by external links, QR codes, or UTM parameters. No trigger configuration needed.
                            </Alert>
                        )}

                        {/* Step 4: Message */}
                        {activeStep === 3 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label="Opening Message"
                                    value={campaignForm.openerMessage}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, openerMessage: e.target.value }))}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Hello! Welcome to our summer sale!"
                                />
                                <TextField
                                    label="Prefill Parameters (JSON)"
                                    value={campaignForm.prefillParams}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, prefillParams: e.target.value }))}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder='{"utm_campaign": "summer2024", "source": "homepage"}'
                                />
                                <TextField
                                    label="CTA Button Text"
                                    value={campaignForm.ctaText}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, ctaText: e.target.value }))}
                                    fullWidth
                                    placeholder="Get Started"
                                />
                            </Box>
                        )}

                        {/* Step 5: Schedule & Goals */}
                        {activeStep === 4 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label="Start Date"
                                    type="datetime-local"
                                    value={campaignForm.scheduleStart}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduleStart: e.target.value }))}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    label="End Date"
                                    type="datetime-local"
                                    value={campaignForm.scheduleEnd}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduleEnd: e.target.value }))}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    label="Frequency Cap (per user)"
                                    type="number"
                                    value={campaignForm.frequencyCap}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, frequencyCap: e.target.value }))}
                                    fullWidth
                                    placeholder="1"
                                    helperText="How many times a user can see this campaign"
                                />
                                <TextField
                                    label="Conversion Event"
                                    value={campaignForm.conversionEvent}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, conversionEvent: e.target.value }))}
                                    fullWidth
                                    placeholder="signup_completed, purchase_made"
                                    helperText="Event name to track as conversion"
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    {activeStep > 0 && (
                        <Button onClick={handleBack}>Back</Button>
                    )}
                    {activeStep < steps.length - 1 ? (
                        <Button onClick={handleNext} variant="contained">
                            Next
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleCreateCampaign} 
                            variant="contained"
                            disabled={!campaignForm.name}
                        >
                            Create Campaign
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default CampaignsManagement
