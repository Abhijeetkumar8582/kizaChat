import { useState } from 'react'
import {
    Box,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    TextField,
    Card,
    CardContent,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Stack
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconBug, IconBulb, IconAlertCircle, IconCode, IconChevronDown, IconShieldCheck } from '@tabler/icons-react'

// API
import agenticApi from '@/api/agentic'
import useApi from '@/hooks/useApi'

const ERROR_TYPES = {
    configuration: { color: 'warning', label: 'Configuration', icon: IconCode },
    runtime: { color: 'error', label: 'Runtime', icon: IconAlertCircle },
    dependency: { color: 'info', label: 'Dependency', icon: IconCode },
    network: { color: 'warning', label: 'Network', icon: IconAlertCircle },
    authentication: { color: 'error', label: 'Authentication', icon: IconShieldCheck }
}

const FlowDebugger = () => {
    const theme = useTheme()
    const [errorMessage, setErrorMessage] = useState('')
    const [debugInfo, setDebugInfo] = useState(null)
    const [error, setError] = useState(null)

    const debugFlowApi = useApi(agenticApi.debugFlow)

    const handleDebug = async () => {
        if (!errorMessage.trim()) {
            setError('Please enter an error message to debug')
            return
        }

        setError(null)
        setDebugInfo(null)

        try {
            const response = await debugFlowApi.request({
                errorMessage
            })

            if (response.data.success) {
                setDebugInfo(response.data.debugInfo)
            } else {
                setError('Failed to debug error. Please try again.')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while debugging')
        }
    }

    const ErrorTypeIcon = debugInfo?.errorType && ERROR_TYPES[debugInfo.errorType]
        ? ERROR_TYPES[debugInfo.errorType].icon
        : IconAlertCircle

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant='h4' sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconBug size={24} />
                    AI Debugger
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                    Get AI-powered solutions for flow errors and issues
                </Typography>
            </Box>

            {/* Error Input */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                    Paste Your Error Message
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={8}
                    placeholder={`Paste your error message or stack trace here. For example:

Error: Cannot read property 'invoke' of undefined
    at ConversationalRetrievalQAChain.run
    at async handler.ts:125
    
Or describe the issue you're experiencing...`}
                    value={errorMessage}
                    onChange={(e) => setErrorMessage(e.target.value)}
                    sx={{ mb: 2, fontFamily: 'monospace' }}
                />
                <Button
                    variant='contained'
                    size='large'
                    startIcon={debugFlowApi.loading ? <CircularProgress size={20} /> : <IconBug />}
                    onClick={handleDebug}
                    disabled={debugFlowApi.loading || !errorMessage.trim()}
                    sx={{ px: 4 }}
                >
                    {debugFlowApi.loading ? 'Debugging...' : 'Debug Error'}
                </Button>
            </Paper>

            {/* Error Display */}
            {error && (
                <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Debug Results */}
            {debugInfo && !debugInfo.rawResponse && (
                <Box>
                    {/* Root Cause */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: theme.palette.error.lighter }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <ErrorTypeIcon size={24} />
                            <Box>
                                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                    Root Cause Identified
                                </Typography>
                                {debugInfo.errorType && (
                                    <Chip
                                        label={ERROR_TYPES[debugInfo.errorType]?.label || debugInfo.errorType}
                                        color={ERROR_TYPES[debugInfo.errorType]?.color || 'default'}
                                        size='small'
                                        sx={{ mt: 1 }}
                                    />
                                )}
                            </Box>
                        </Box>
                        <Typography variant='body1'>{debugInfo.rootCause}</Typography>
                    </Paper>

                    {/* Affected Components */}
                    {debugInfo.affectedComponents && debugInfo.affectedComponents.length > 0 && (
                        <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant='h6' sx={{ mb: 2 }}>
                                Affected Components
                            </Typography>
                            <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                                {debugInfo.affectedComponents.map((component, idx) => (
                                    <Chip key={idx} label={component} variant='outlined' />
                                ))}
                            </Stack>
                        </Paper>
                    )}

                    {/* Solution */}
                    {debugInfo.solution && (
                        <Paper elevation={0} sx={{ p: 3, mb: 3, border: `2px solid ${theme.palette.success.main}` }}>
                            <Typography variant='h6' sx={{ mb: 2, color: theme.palette.success.dark }}>
                                <IconBulb size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                Solution
                            </Typography>

                            {/* Steps */}
                            {debugInfo.solution.steps && debugInfo.solution.steps.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant='subtitle1' sx={{ mb: 1, fontWeight: 600 }}>
                                        Steps to Fix:
                                    </Typography>
                                    <List>
                                        {debugInfo.solution.steps.map((step, idx) => (
                                            <ListItem key={idx}>
                                                <ListItemText
                                                    primary={`${idx + 1}. ${step}`}
                                                    primaryTypographyProps={{ variant: 'body1' }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}

                            {/* Code Changes */}
                            {debugInfo.solution.codeChanges && debugInfo.solution.codeChanges.length > 0 && (
                                <Box>
                                    <Typography variant='subtitle1' sx={{ mb: 1, fontWeight: 600 }}>
                                        Recommended Changes:
                                    </Typography>
                                    {debugInfo.solution.codeChanges.map((change, idx) => (
                                        <Card key={idx} sx={{ mb: 2 }}>
                                            <CardContent>
                                                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                                                    Node: {change.nodeId}
                                                </Typography>
                                                <Typography variant='body2' sx={{ mb: 1 }}>
                                                    Parameter: <code>{change.parameter}</code>
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant='caption' color='text.secondary'>
                                                            Current:
                                                        </Typography>
                                                        <Paper
                                                            sx={{
                                                                p: 1,
                                                                bgcolor: theme.palette.error.lighter,
                                                                fontFamily: 'monospace',
                                                                fontSize: '0.875rem'
                                                            }}
                                                        >
                                                            {change.currentValue}
                                                        </Paper>
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant='caption' color='text.secondary'>
                                                            Suggested:
                                                        </Typography>
                                                        <Paper
                                                            sx={{
                                                                p: 1,
                                                                bgcolor: theme.palette.success.lighter,
                                                                fontFamily: 'monospace',
                                                                fontSize: '0.875rem'
                                                            }}
                                                        >
                                                            {change.suggestedValue}
                                                        </Paper>
                                                    </Box>
                                                </Box>
                                                <Typography variant='caption' color='text.secondary'>
                                                    Reason: {change.reason}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            )}
                        </Paper>
                    )}

                    {/* Prevention */}
                    {debugInfo.prevention && debugInfo.prevention.length > 0 && (
                        <Accordion>
                            <AccordionSummary expandIcon={<IconChevronDown />}>
                                <Typography variant='h6'>
                                    <IconShieldCheck size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                    Prevention Measures
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List>
                                    {debugInfo.prevention.map((measure, idx) => (
                                        <ListItem key={idx}>
                                            <ListItemText primary={measure} />
                                        </ListItem>
                                    ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    )}

                    {/* Alternatives */}
                    {debugInfo.alternatives && debugInfo.alternatives.length > 0 && (
                        <Accordion sx={{ mt: 1 }}>
                            <AccordionSummary expandIcon={<IconChevronDown />}>
                                <Typography variant='h6'>Alternative Approaches</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List>
                                    {debugInfo.alternatives.map((alt, idx) => (
                                        <ListItem key={idx}>
                                            <ListItemText primary={alt} />
                                        </ListItem>
                                    ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    )}

                    {/* Documentation */}
                    {debugInfo.documentation && debugInfo.documentation.length > 0 && (
                        <Accordion sx={{ mt: 1 }}>
                            <AccordionSummary expandIcon={<IconChevronDown />}>
                                <Typography variant='h6'>Related Documentation</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List>
                                    {debugInfo.documentation.map((doc, idx) => (
                                        <ListItem key={idx}>
                                            <ListItemText primary={doc} />
                                        </ListItem>
                                    ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    )}
                </Box>
            )}

            {/* Raw Response Fallback */}
            {debugInfo?.rawResponse && (
                <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                        Debug Analysis
                    </Typography>
                    <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                        {debugInfo.summary}
                    </Typography>
                </Paper>
            )}
        </Box>
    )
}

export default FlowDebugger

