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
    Badge
} from '@mui/material'
import {
    IconMessageCircle,
    IconEdit,
    IconTrash,
    IconCode,
    IconPalette,
    IconSettings,
    IconEye,
    IconRefresh,
    IconCopy,
    IconCheck,
    IconRobot,
    IconAccessible,
    IconApps,
    IconX,
    IconSend
} from '@tabler/icons-react'
import chatUIApi from '@/api/chatui'
import { enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'

const ChatUIManagement = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const [bots, setBots] = useState([])
    const [loading, setLoading] = useState(true)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [embedDialogOpen, setEmbedDialogOpen] = useState(false)
    const [selectedBot, setSelectedBot] = useState(null)
    const [activeTab, setActiveTab] = useState(0)
    const [copied, setCopied] = useState(false)
    const [chatOpen, setChatOpen] = useState(false)
    
    // ChatUI form
    const [chatUIForm, setChatUIForm] = useState({
        theme: 'LIGHT',
        primaryColor: '#2196F3',
        secondaryColor: '#1976D2',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        position: 'BOTTOM_RIGHT',
        iconUrl: '',
        greeting: 'Hello! How can I help you today?',
        quickReplies: '',
        bubbleStyle: '',
        avatarUrl: '',
        chatWidth: '350',
        chatHeight: '450',
        showTypingIndicator: true,
        showTimestamp: true,
        enableFileUpload: true,
        enableMarkdown: true,
        highContrast: false,
        screenReaderSupport: true,
        ariaLabel: 'Chat with our AI assistant'
    })
    
    const [embedCode, setEmbedCode] = useState('')
    const [isProduction, setIsProduction] = useState(false)

    useEffect(() => {
        loadBots()
    }, [])

    const loadBots = async () => {
        try {
            setLoading(true)
            const response = await chatUIApi.getAllBotsWithChatUI()
            setBots(response.data)
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

    const handleEditBot = (bot) => {
        setSelectedBot(bot)
        if (bot.chatUI) {
            setChatUIForm({
                theme: bot.chatUI.theme || 'LIGHT',
                primaryColor: bot.chatUI.primaryColor || '#2196F3',
                secondaryColor: bot.chatUI.secondaryColor || '#1976D2',
                backgroundColor: bot.chatUI.backgroundColor || '#ffffff',
                textColor: bot.chatUI.textColor || '#000000',
                fontFamily: bot.chatUI.fontFamily || 'Inter, sans-serif',
                borderRadius: bot.chatUI.borderRadius || '8px',
                boxShadow: bot.chatUI.boxShadow || '0 4px 12px rgba(0, 0, 0, 0.1)',
                position: bot.chatUI.position || 'BOTTOM_RIGHT',
                iconUrl: bot.chatUI.iconUrl || '',
                greeting: bot.chatUI.greeting || 'Hello! How can I help you today?',
                quickReplies: bot.chatUI.quickReplies || '',
                bubbleStyle: bot.chatUI.bubbleStyle || '',
                avatarUrl: bot.chatUI.avatarUrl || '',
                showTypingIndicator: bot.chatUI.showTypingIndicator !== false,
                showTimestamp: bot.chatUI.showTimestamp !== false,
                enableFileUpload: bot.chatUI.enableFileUpload !== false,
                enableMarkdown: bot.chatUI.enableMarkdown !== false,
                highContrast: bot.chatUI.highContrast || false,
                screenReaderSupport: bot.chatUI.screenReaderSupport !== false,
                ariaLabel: bot.chatUI.ariaLabel || 'Chat with our AI assistant'
            })
        }
        setEditDialogOpen(true)
    }

    const handleSaveChatUI = async () => {
        try {
            await chatUIApi.saveChatUI(selectedBot.id, chatUIForm)
            await loadBots()
            setEditDialogOpen(false)
            setSelectedBot(null)
            
            dispatch(enqueueSnackbarAction({
                message: 'Chat UI configuration saved successfully',
                options: { variant: 'success' }
            }))
        } catch (error) {
            console.error('Error saving Chat UI:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to save Chat UI configuration',
                options: { variant: 'error' }
            }))
        }
    }

    const handleDeleteChatUI = async () => {
        try {
            await chatUIApi.deleteChatUI(selectedBot.id)
            await loadBots()
            setDeleteDialogOpen(false)
            setSelectedBot(null)
            
            dispatch(enqueueSnackbarAction({
                message: 'Chat UI configuration deleted successfully',
                options: { variant: 'success' }
            }))
        } catch (error) {
            console.error('Error deleting Chat UI:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to delete Chat UI configuration',
                options: { variant: 'error' }
            }))
        }
    }

    const handleGenerateEmbedCode = async () => {
        try {
            const response = await chatUIApi.generateEmbedCode(selectedBot.id, isProduction)
            setEmbedCode(response.data.embedCode)
            setEmbedDialogOpen(true)
        } catch (error) {
            console.error('Error generating embed code:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to generate embed code',
                options: { variant: 'error' }
            }))
        }
    }

    const handleCopyEmbedCode = async () => {
        try {
            await navigator.clipboard.writeText(embedCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            dispatch(enqueueSnackbarAction({
                message: 'Embed code copied to clipboard',
                options: { variant: 'success' }
            }))
        } catch (error) {
            console.error('Error copying embed code:', error)
        }
    }

    const handleResetToDefault = async () => {
        try {
            await chatUIApi.resetToDefault(selectedBot.id)
            await loadBots()
            setEditDialogOpen(false)
            setSelectedBot(null)
            
            dispatch(enqueueSnackbarAction({
                message: 'Chat UI configuration reset to default',
                options: { variant: 'success' }
            }))
        } catch (error) {
            console.error('Error resetting Chat UI:', error)
            dispatch(enqueueSnackbarAction({
                message: 'Failed to reset Chat UI configuration',
                options: { variant: 'error' }
            }))
        }
    }

    const getStatusColor = (bot) => {
        if (!bot.chatUI) return 'default'
        if (bot.chatUI.isProduction) return 'success'
        return 'warning'
    }

    const getStatusText = (bot) => {
        if (!bot.chatUI) return 'Not Configured'
        if (bot.chatUI.isProduction) return 'Production'
        return 'Draft'
    }

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading bots...</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconMessageCircle size={32} />
                        Chat UI Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Customize chat widget appearance and behavior for each bot
                    </Typography>
                </Box>
            </Box>

            {/* Bots Grid */}
            {bots.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <IconRobot size={64} color="#ccc" />
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                            No Bots Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Create some bots first to customize their chat interfaces
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
                <Grid container spacing={3}>
                    {bots.map((bot) => (
                        <Grid item xs={12} md={6} lg={4} key={bot.id}>
                            <Card 
                                sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 3
                                    }
                                }}
                            >
                                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    {/* Bot Header */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                {bot.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {bot.description || 'No description'}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            label={getStatusText(bot)} 
                                            size="small" 
                                            color={getStatusColor(bot)}
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>

                                    {/* Chat UI Status */}
                                    <Box sx={{ mb: 2 }}>
                                        {bot.chatUI ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Theme: {bot.chatUI.theme}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Position: {bot.chatUI.position.replace('_', ' ')}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Primary Color: {bot.chatUI.primaryColor}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                No chat UI configuration
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Actions */}
                                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                        <Tooltip title="Customize Chat UI">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditBot(bot)}
                                                sx={{ color: 'primary.main' }}
                                            >
                                                <IconPalette size={16} />
                                            </IconButton>
                                        </Tooltip>
                                        {bot.chatUI && (
                                            <>
                                                <Tooltip title="Generate Embed Code">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setSelectedBot(bot)
                                                            handleGenerateEmbedCode()
                                                        }}
                                                        sx={{ color: 'success.main' }}
                                                    >
                                                        <IconCode size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Preview">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            // TODO: Implement preview functionality
                                                        }}
                                                        sx={{ color: 'info.main' }}
                                                    >
                                                        <IconEye size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Configuration">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setSelectedBot(bot)
                                                            setDeleteDialogOpen(true)
                                                        }}
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <IconTrash size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Edit Chat UI Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconPalette size={24} />
                        Customize Chat UI - {selectedBot?.name}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                            <Tab label="Theme" icon={<IconPalette size={16} />} />
                            <Tab label="Widget" icon={<IconApps size={16} />} />
                            <Tab label="Chat" icon={<IconMessageCircle size={16} />} />
                            <Tab label="Accessibility" icon={<IconAccessible size={16} />} />
                        </Tabs>
                    </Box>

                    {/* Theme Tab */}
                    {activeTab === 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                select
                                label="Theme"
                                value={chatUIForm.theme}
                                onChange={(e) => setChatUIForm(prev => ({ ...prev, theme: e.target.value }))}
                                fullWidth
                            >
                                <MenuItem value="LIGHT">Light</MenuItem>
                                <MenuItem value="DARK">Dark</MenuItem>
                                <MenuItem value="AUTO">Auto</MenuItem>
                            </TextField>
                            
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Primary Color"
                                    value={chatUIForm.primaryColor}
                                    onChange={(e) => setChatUIForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                                    fullWidth
                                    type="color"
                                />
                                <TextField
                                    label="Secondary Color"
                                    value={chatUIForm.secondaryColor}
                                    onChange={(e) => setChatUIForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                    fullWidth
                                    type="color"
                                />
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Background Color"
                                    value={chatUIForm.backgroundColor}
                                    onChange={(e) => setChatUIForm(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                    fullWidth
                                    type="color"
                                />
                                <TextField
                                    label="Text Color"
                                    value={chatUIForm.textColor}
                                    onChange={(e) => setChatUIForm(prev => ({ ...prev, textColor: e.target.value }))}
                                    fullWidth
                                    type="color"
                                />
                            </Box>
                            
                            <TextField
                                label="Font Family"
                                value={chatUIForm.fontFamily}
                                onChange={(e) => setChatUIForm(prev => ({ ...prev, fontFamily: e.target.value }))}
                                fullWidth
                            />
                            
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Border Radius"
                                    value={chatUIForm.borderRadius}
                                    onChange={(e) => setChatUIForm(prev => ({ ...prev, borderRadius: e.target.value }))}
                                    fullWidth
                                />
                                <TextField
                                    label="Box Shadow"
                                    value={chatUIForm.boxShadow}
                                    onChange={(e) => setChatUIForm(prev => ({ ...prev, boxShadow: e.target.value }))}
                                    fullWidth
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Widget Tab */}
                    {activeTab === 1 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                select
                                label="Position"
                                value={chatUIForm.position}
                                onChange={(e) => setChatUIForm(prev => ({ ...prev, position: e.target.value }))}
                                fullWidth
                            >
                                <MenuItem value="BOTTOM_RIGHT">Bottom Right</MenuItem>
                                <MenuItem value="BOTTOM_LEFT">Bottom Left</MenuItem>
                                <MenuItem value="TOP_RIGHT">Top Right</MenuItem>
                                <MenuItem value="TOP_LEFT">Top Left</MenuItem>
                            </TextField>
                            
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Chat Width (px)"
                                    type="number"
                                    value={chatUIForm.chatWidth}
                                    onChange={(e) => setChatUIForm(prev => ({ ...prev, chatWidth: e.target.value }))}
                                    fullWidth
                                    placeholder="350"
                                />
                                <TextField
                                    label="Chat Height (px)"
                                    type="number"
                                    value={chatUIForm.chatHeight}
                                    onChange={(e) => setChatUIForm(prev => ({ ...prev, chatHeight: e.target.value }))}
                                    fullWidth
                                    placeholder="450"
                                />
                            </Box>
                            
                            <TextField
                                label="Icon URL"
                                value={chatUIForm.iconUrl}
                                onChange={(e) => setChatUIForm(prev => ({ ...prev, iconUrl: e.target.value }))}
                                fullWidth
                                placeholder="https://example.com/icon.png"
                            />
                            
                            <TextField
                                label="Greeting Message"
                                value={chatUIForm.greeting}
                                onChange={(e) => setChatUIForm(prev => ({ ...prev, greeting: e.target.value }))}
                                fullWidth
                                multiline
                                rows={2}
                            />
                            
                            <TextField
                                label="Quick Replies (JSON)"
                                value={chatUIForm.quickReplies}
                                onChange={(e) => setChatUIForm(prev => ({ ...prev, quickReplies: e.target.value }))}
                                fullWidth
                                multiline
                                rows={3}
                                placeholder='["Hello", "Help", "Contact"]'
                            />
                        </Box>
                    )}

                    {/* Chat Tab */}
                    {activeTab === 2 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Avatar URL"
                                value={chatUIForm.avatarUrl}
                                onChange={(e) => setChatUIForm(prev => ({ ...prev, avatarUrl: e.target.value }))}
                                fullWidth
                                placeholder="https://example.com/avatar.png"
                            />
                            
                            <TextField
                                label="Bubble Style (JSON)"
                                value={chatUIForm.bubbleStyle}
                                onChange={(e) => setChatUIForm(prev => ({ ...prev, bubbleStyle: e.target.value }))}
                                fullWidth
                                multiline
                                rows={3}
                                placeholder='{"user": {"backgroundColor": "#2196F3"}, "bot": {"backgroundColor": "#f5f5f5"}}'
                            />
                            
                            <Divider />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={chatUIForm.showTypingIndicator}
                                        onChange={(e) => setChatUIForm(prev => ({ ...prev, showTypingIndicator: e.target.checked }))}
                                    />
                                }
                                label="Show Typing Indicator"
                            />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={chatUIForm.showTimestamp}
                                        onChange={(e) => setChatUIForm(prev => ({ ...prev, showTimestamp: e.target.checked }))}
                                    />
                                }
                                label="Show Timestamp"
                            />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={chatUIForm.enableFileUpload}
                                        onChange={(e) => setChatUIForm(prev => ({ ...prev, enableFileUpload: e.target.checked }))}
                                    />
                                }
                                label="Enable File Upload"
                            />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={chatUIForm.enableMarkdown}
                                        onChange={(e) => setChatUIForm(prev => ({ ...prev, enableMarkdown: e.target.checked }))}
                                    />
                                }
                                label="Enable Markdown"
                            />
                        </Box>
                    )}

                    {/* Accessibility Tab */}
                    {activeTab === 3 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="ARIA Label"
                                value={chatUIForm.ariaLabel}
                                onChange={(e) => setChatUIForm(prev => ({ ...prev, ariaLabel: e.target.value }))}
                                fullWidth
                                placeholder="Chat with our AI assistant"
                            />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={chatUIForm.highContrast}
                                        onChange={(e) => setChatUIForm(prev => ({ ...prev, highContrast: e.target.checked }))}
                                    />
                                }
                                label="High Contrast Mode"
                            />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={chatUIForm.screenReaderSupport}
                                        onChange={(e) => setChatUIForm(prev => ({ ...prev, screenReaderSupport: e.target.checked }))}
                                    />
                                }
                                label="Screen Reader Support"
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleResetToDefault} color="warning">
                        Reset to Default
                    </Button>
                    <Button onClick={handleSaveChatUI} variant="contained">
                        Save Configuration
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Chat UI Configuration</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the Chat UI configuration for "{selectedBot?.name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteChatUI} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Embed Code Dialog */}
            <Dialog open={embedDialogOpen} onClose={() => setEmbedDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconCode size={24} />
                        Embed Code - {selectedBot?.name}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Copy this code and paste it into your website's HTML to embed the chat widget.
                    </Alert>
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isProduction}
                                    onChange={(e) => setIsProduction(e.target.checked)}
                                />
                            }
                            label="Production Mode"
                        />
                    </Box>
                    
                    <TextField
                        label="Embed Code"
                        value={embedCode}
                        onChange={(e) => setEmbedCode(e.target.value)}
                        fullWidth
                        multiline
                        rows={15}
                        sx={{ fontFamily: 'monospace' }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEmbedDialogOpen(false)}>Close</Button>
                    <Button 
                        onClick={handleCopyEmbedCode} 
                        variant="contained"
                        startIcon={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    >
                        {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Live Preview Widget - Bottom Right */}
            {editDialogOpen && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: chatUIForm.position === 'BOTTOM_RIGHT' || chatUIForm.position === 'BOTTOM_LEFT' ? 24 : 'auto',
                        top: chatUIForm.position === 'TOP_RIGHT' || chatUIForm.position === 'TOP_LEFT' ? 24 : 'auto',
                        right: chatUIForm.position === 'BOTTOM_RIGHT' || chatUIForm.position === 'TOP_RIGHT' ? 24 : 'auto',
                        left: chatUIForm.position === 'BOTTOM_LEFT' || chatUIForm.position === 'TOP_LEFT' ? 24 : 'auto',
                        zIndex: 9999,
                        transition: 'all 0.3s ease-in-out'
                    }}
                >
                    {/* Chat Widget Button */}
                    <Paper
                        elevation={4}
                        onClick={() => setChatOpen(!chatOpen)}
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: chatUIForm.borderRadius || '8px',
                            backgroundColor: chatUIForm.primaryColor || '#2196F3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: chatUIForm.boxShadow || '0 4px 12px rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                                backgroundColor: chatUIForm.secondaryColor || '#1976D2',
                                transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease-in-out',
                            mb: 1
                        }}
                    >
                        {chatUIForm.iconUrl ? (
                            <Box
                                component="img"
                                src={chatUIForm.iconUrl}
                                sx={{ width: 32, height: 32 }}
                                onError={(e) => {
                                    e.target.style.display = 'none'
                                }}
                            />
                        ) : (
                            <IconMessageCircle size={32} color="#ffffff" />
                        )}
                    </Paper>
                    
                    {/* Preview Badge */}
                    <Chip
                        label="PREVIEW"
                        size="small"
                        sx={{
                            position: 'absolute',
                            bottom: -8,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: '#FF9800',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.65rem'
                        }}
                    />
                    
                    {/* Chat Window */}
                    {chatOpen && (
                        <Paper
                            elevation={8}
                            sx={{
                                position: 'absolute',
                                bottom: 70,
                                right: chatUIForm.position.includes('RIGHT') ? 0 : 'auto',
                                left: chatUIForm.position.includes('LEFT') ? 0 : 'auto',
                                width: chatUIForm.chatWidth ? `${chatUIForm.chatWidth}px` : '350px',
                                height: chatUIForm.chatHeight ? `${chatUIForm.chatHeight}px` : '450px',
                                backgroundColor: chatUIForm.backgroundColor || '#ffffff',
                                borderRadius: chatUIForm.borderRadius || '8px',
                                border: `2px solid ${chatUIForm.primaryColor || '#2196F3'}`,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Chat Header */}
                            <Box
                                sx={{
                                    backgroundColor: chatUIForm.primaryColor || '#2196F3',
                                    color: '#ffffff',
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <IconMessageCircle size={20} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {selectedBot?.name || 'Chat Assistant'}
                                </Typography>
                                <Box sx={{ flexGrow: 1 }} />
                                <IconButton
                                    size="small"
                                    onClick={() => setChatOpen(false)}
                                    sx={{ color: '#ffffff' }}
                                >
                                    <IconX size={16} />
                                </IconButton>
                            </Box>
                            
                            {/* Chat Messages */}
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 2,
                                    overflowY: 'auto',
                                    backgroundColor: chatUIForm.backgroundColor || '#ffffff'
                                }}
                            >
                                {/* Greeting Message */}
                                {chatUIForm.greeting && (
                                    <Box
                                        sx={{
                                            mb: 2,
                                            p: 2,
                                            backgroundColor: chatUIForm.primaryColor || '#2196F3',
                                            color: '#ffffff',
                                            borderRadius: chatUIForm.borderRadius || '8px',
                                            fontFamily: chatUIForm.fontFamily || 'Inter, sans-serif'
                                        }}
                                    >
                                        <Typography variant="body2">
                                            {chatUIForm.greeting}
                                        </Typography>
                                    </Box>
                                )}
                                
                                {/* Sample Messages */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box
                                        sx={{
                                            alignSelf: 'flex-start',
                                            p: 1.5,
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: chatUIForm.borderRadius || '8px',
                                            maxWidth: '80%'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontFamily: chatUIForm.fontFamily || 'Inter, sans-serif' }}>
                                            Hello! How can I help you today?
                                        </Typography>
                                    </Box>
                                    
                                    <Box
                                        sx={{
                                            alignSelf: 'flex-end',
                                            p: 1.5,
                                            backgroundColor: chatUIForm.primaryColor || '#2196F3',
                                            color: '#ffffff',
                                            borderRadius: chatUIForm.borderRadius || '8px',
                                            maxWidth: '80%'
                                        }}
                                    >
                                        <Typography variant="body2">
                                            I need help with my account
                                        </Typography>
                                    </Box>
                                    
                                    <Box
                                        sx={{
                                            alignSelf: 'flex-start',
                                            p: 1.5,
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: chatUIForm.borderRadius || '8px',
                                            maxWidth: '80%'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontFamily: chatUIForm.fontFamily || 'Inter, sans-serif' }}>
                                            I'd be happy to help! What specific issue are you experiencing?
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            
                            {/* Chat Input */}
                            <Box
                                sx={{
                                    p: 2,
                                    borderTop: `1px solid ${chatUIForm.primaryColor || '#2196F3'}`,
                                    backgroundColor: chatUIForm.backgroundColor || '#ffffff'
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        placeholder="Type your message..."
                                        size="small"
                                        fullWidth
                                        disabled
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: chatUIForm.borderRadius || '8px',
                                                fontFamily: chatUIForm.fontFamily || 'Inter, sans-serif'
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        disabled
                                        sx={{
                                            backgroundColor: chatUIForm.primaryColor || '#2196F3',
                                            borderRadius: chatUIForm.borderRadius || '8px',
                                            minWidth: 'auto',
                                            px: 2
                                        }}
                                    >
                                        <IconSend size={16} />
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    )}
                </Box>
            )}
        </Box>
    )
}

export default ChatUIManagement

