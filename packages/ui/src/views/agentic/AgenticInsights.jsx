import { useState, useEffect } from 'react'
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Chip,
    List,
    ListItem,
    ListItemText,
    Alert,
    LinearProgress
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
    IconChartHistogram,
    IconRocket,
    IconUsers,
    IconMessageCircle,
    IconAlertCircle,
    IconTrendingUp,
    IconClock
} from '@tabler/icons-react'

// API
import agenticApi from '@/api/agentic'
import useApi from '@/hooks/useApi'
import moment from 'moment'

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
    const theme = useTheme()
    
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant='h6' color='text.secondary' gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant='h3' sx={{ fontWeight: 700, color }}>
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant='caption' color='text.secondary'>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: `${color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Icon size={28} color={color} />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}

const AgenticInsights = () => {
    const theme = useTheme()
    const [insights, setInsights] = useState(null)

    const getInsightsApi = useApi(agenticApi.getInsights)

    useEffect(() => {
        getInsightsApi.request()
    }, [])

    useEffect(() => {
        if (getInsightsApi.data?.success) {
            setInsights(getInsightsApi.data.insights)
        }
    }, [getInsightsApi.data])

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return theme.palette.error.main
            case 'medium':
                return theme.palette.warning.main
            case 'low':
                return theme.palette.info.main
            default:
                return theme.palette.grey[500]
        }
    }

    if (getInsightsApi.loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!insights) {
        return (
            <Alert severity='info'>
                No insights data available. Create some flows to see analytics.
            </Alert>
        )
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant='h4' sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconChartHistogram size={24} />
                    Agentic Insights Dashboard
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                    AI-powered analytics and recommendations for your workspace
                </Typography>
            </Box>

            {/* Overview Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title='Total Flows'
                        value={insights.totalFlows}
                        icon={IconRocket}
                        color={theme.palette.primary.main}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title='Deployed Flows'
                        value={insights.deployedFlows}
                        icon={IconTrendingUp}
                        color={theme.palette.success.main}
                        subtitle={`${Math.round((insights.deployedFlows / insights.totalFlows) * 100)}% of total`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title='Public Flows'
                        value={insights.publicFlows}
                        icon={IconUsers}
                        color={theme.palette.info.main}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title='Chatflows'
                        value={insights.flowsByType?.CHATFLOW || 0}
                        icon={IconMessageCircle}
                        color={theme.palette.warning.main}
                    />
                </Grid>
            </Grid>

            {/* Flow Types Breakdown */}
            {insights.flowsByType && Object.keys(insights.flowsByType).length > 0 && (
                <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                        Flows by Type
                    </Typography>
                    <Grid container spacing={2}>
                        {Object.entries(insights.flowsByType).map(([type, count]) => (
                            <Grid item xs={12} sm={6} md={4} key={type}>
                                <Box sx={{ mb: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant='body2'>{type}</Typography>
                                        <Typography variant='body2' fontWeight={600}>
                                            {count}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant='determinate'
                                        value={(count / insights.totalFlows) * 100}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            )}

            {/* Top Flows */}
            {insights.topFlows && insights.topFlows.length > 0 && (
                <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                        Most Active Flows
                    </Typography>
                    <List>
                        {insights.topFlows.slice(0, 5).map((flow, idx) => (
                            <ListItem
                                key={flow.id}
                                sx={{
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 1,
                                    mb: 1
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <Typography
                                        variant='h6'
                                        sx={{
                                            minWidth: 32,
                                            height: 32,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: theme.palette.primary.lighter,
                                            borderRadius: 1,
                                            fontWeight: 700
                                        }}
                                    >
                                        {idx + 1}
                                    </Typography>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                            {flow.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                            <Chip label={flow.type} size='small' variant='outlined' />
                                            {flow.deployed && <Chip label='Deployed' size='small' color='success' />}
                                            <Chip
                                                icon={<IconMessageCircle size={14} />}
                                                label={`${flow.messageCount} messages`}
                                                size='small'
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Recently Updated */}
            {insights.recentlyUpdated && insights.recentlyUpdated.length > 0 && (
                <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                        <IconClock size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Recently Updated Flows
                    </Typography>
                    <List>
                        {insights.recentlyUpdated.map((flow) => (
                            <ListItem key={flow.id}>
                                <ListItemText
                                    primary={flow.name}
                                    secondary={
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                            <Chip label={flow.type} size='small' variant='outlined' />
                                            <Typography variant='caption' color='text.secondary'>
                                                Updated {moment(flow.updatedDate).fromNow()}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {/* AI Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
                <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                        <IconAlertCircle size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        AI Recommendations
                    </Typography>
                    <List>
                        {insights.recommendations.map((rec, idx) => (
                            <Alert
                                key={idx}
                                severity={rec.priority === 'high' ? 'warning' : rec.priority === 'medium' ? 'info' : 'success'}
                                sx={{ mb: 2 }}
                                icon={<IconAlertCircle />}
                            >
                                <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {rec.type.toUpperCase()}
                                </Typography>
                                <Typography variant='body2'>{rec.message}</Typography>
                            </Alert>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    )
}

export default AgenticInsights

