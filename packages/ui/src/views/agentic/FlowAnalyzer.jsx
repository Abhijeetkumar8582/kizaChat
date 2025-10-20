import { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
    IconMicroscope,
    IconAlertCircle,
    IconAlertTriangle,
    IconInfoCircle,
    IconTrendingUp,
    IconShieldCheck,
    IconCoin,
    IconRocket,
    IconChevronDown,
    IconCheck
} from '@tabler/icons-react'

// API
import agenticApi from '@/api/agentic'
import chatflowsApi from '@/api/chatflows'
import useApi from '@/hooks/useApi'

const SEVERITY_CONFIG = {
    high: { color: 'error', icon: IconAlertCircle, label: 'High' },
    medium: { color: 'warning', icon: IconAlertTriangle, label: 'Medium' },
    low: { color: 'info', icon: IconInfoCircle, label: 'Low' }
}

const CATEGORY_ICONS = {
    performance: IconRocket,
    security: IconShieldCheck,
    'best-practice': IconCheck,
    cost: IconCoin
}

const FlowAnalyzer = () => {
    const theme = useTheme()
    const [selectedFlow, setSelectedFlow] = useState('')
    const [analysis, setAnalysis] = useState(null)
    const [error, setError] = useState(null)
    const [flows, setFlows] = useState([])

    const getAllFlowsApi = useApi(chatflowsApi.getAllChatflows)
    const analyzeFlowApi = useApi(agenticApi.analyzeFlow)

    useEffect(() => {
        getAllFlowsApi.request()
    }, [])

    useEffect(() => {
        if (getAllFlowsApi.data) {
            setFlows(getAllFlowsApi.data)
        }
    }, [getAllFlowsApi.data])

    const handleAnalyze = async () => {
        if (!selectedFlow) {
            setError('Please select a flow to analyze')
            return
        }

        setError(null)
        setAnalysis(null)

        try {
            const response = await analyzeFlowApi.request(selectedFlow)
            if (response.data.success) {
                setAnalysis(response.data.analysis)
            } else {
                setError('Failed to analyze flow. Please try again.')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while analyzing the flow')
        }
    }

    const getScoreColor = (score) => {
        if (score >= 80) return theme.palette.success.main
        if (score >= 60) return theme.palette.warning.main
        return theme.palette.error.main
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant='h4' sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconMicroscope size={24} />
                    Flow Analyzer
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                    Get AI-powered insights and optimization recommendations for your flows
                </Typography>
            </Box>

            {/* Flow Selection */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Flow to Analyze</InputLabel>
                    <Select
                        value={selectedFlow}
                        label='Select Flow to Analyze'
                        onChange={(e) => setSelectedFlow(e.target.value)}
                    >
                        {flows.map((flow) => (
                            <MenuItem key={flow.id} value={flow.id}>
                                {flow.name} ({flow.type})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant='contained'
                    size='large'
                    startIcon={analyzeFlowApi.loading ? <CircularProgress size={20} /> : <IconMicroscope />}
                    onClick={handleAnalyze}
                    disabled={analyzeFlowApi.loading || !selectedFlow}
                    sx={{ px: 4 }}
                >
                    {analyzeFlowApi.loading ? 'Analyzing...' : 'Analyze Flow'}
                </Button>
            </Paper>

            {/* Error Display */}
            {error && (
                <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Analysis Results */}
            {analysis && (
                <Box>
                    {/* Overall Score */}
                    {analysis.overallScore !== undefined && (
                        <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: theme.palette.background.default }}>
                            <Typography variant='h6' sx={{ mb: 2 }}>
                                Overall Score
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Typography variant='h2' sx={{ fontWeight: 700, color: getScoreColor(analysis.overallScore) }}>
                                    {analysis.overallScore}
                                </Typography>
                                <Typography variant='h5' color='text.secondary'>
                                    / 100
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant='determinate'
                                value={analysis.overallScore}
                                sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    bgcolor: theme.palette.grey[200],
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: getScoreColor(analysis.overallScore),
                                        borderRadius: 5
                                    }
                                }}
                            />
                        </Paper>
                    )}

                    {/* Strengths */}
                    {analysis.strengths && analysis.strengths.length > 0 && (
                        <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.success.main}` }}>
                            <Typography variant='h6' sx={{ mb: 2, color: theme.palette.success.dark }}>
                                ✅ Strengths
                            </Typography>
                            <List>
                                {analysis.strengths.map((strength, idx) => (
                                    <ListItem key={idx}>
                                        <ListItemIcon>
                                            <IconCheck color={theme.palette.success.main} />
                                        </ListItemIcon>
                                        <ListItemText primary={strength} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}

                    {/* Issues */}
                    {analysis.issues && analysis.issues.length > 0 && (
                        <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant='h6' sx={{ mb: 2 }}>
                                Issues & Recommendations
                            </Typography>
                            {analysis.issues.map((issue, idx) => {
                                const SeverityIcon = SEVERITY_CONFIG[issue.severity]?.icon || IconInfoCircle
                                const CategoryIcon = CATEGORY_ICONS[issue.category] || IconInfoCircle

                                return (
                                    <Card key={idx} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                                                <CategoryIcon size={20} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                                                        <Chip
                                                            icon={<SeverityIcon size={16} />}
                                                            label={SEVERITY_CONFIG[issue.severity]?.label || issue.severity}
                                                            color={SEVERITY_CONFIG[issue.severity]?.color || 'default'}
                                                            size='small'
                                                        />
                                                        <Chip label={issue.category} size='small' variant='outlined' />
                                                    </Box>
                                                    <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                                                        {issue.issue}
                                                    </Typography>
                                                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                                                        {issue.recommendation}
                                                    </Typography>
                                                    {issue.nodeIds && issue.nodeIds.length > 0 && (
                                                        <Typography variant='caption' color='text.secondary'>
                                                            Affected nodes: {issue.nodeIds.join(', ')}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </Paper>
                    )}

                    {/* Optimizations */}
                    {analysis.optimizations && analysis.optimizations.length > 0 && (
                        <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant='h6' sx={{ mb: 2 }}>
                                <IconTrendingUp size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                Optimization Opportunities
                            </Typography>
                            {analysis.optimizations.map((opt, idx) => (
                                <Accordion key={idx}>
                                    <AccordionSummary expandIcon={<IconChevronDown />}>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                                            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                                {opt.title}
                                            </Typography>
                                            <Chip label={`Impact: ${opt.impact}`} size='small' color='primary' />
                                            <Chip label={`Effort: ${opt.effort}`} size='small' variant='outlined' />
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant='body2' sx={{ mb: 2 }}>
                                            {opt.description}
                                        </Typography>
                                        {opt.steps && opt.steps.length > 0 && (
                                            <>
                                                <Divider sx={{ my: 2 }} />
                                                <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                                                    Implementation Steps:
                                                </Typography>
                                                <List dense>
                                                    {opt.steps.map((step, stepIdx) => (
                                                        <ListItem key={stepIdx}>
                                                            <ListItemText
                                                                primary={`${stepIdx + 1}. ${step}`}
                                                                primaryTypographyProps={{ variant: 'body2' }}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Paper>
                    )}

                    {/* Summary */}
                    {analysis.summary && (
                        <Alert severity='info' icon={<IconInfoCircle />}>
                            <Typography variant='body2'>{analysis.summary}</Typography>
                        </Alert>
                    )}

                    {/* Raw Response Fallback */}
                    {analysis.rawResponse && (
                        <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant='h6' sx={{ mb: 2 }}>
                                Analysis Results
                            </Typography>
                            <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                                {analysis.summary}
                            </Typography>
                        </Paper>
                    )}
                </Box>
            )}
        </Box>
    )
}

export default FlowAnalyzer

