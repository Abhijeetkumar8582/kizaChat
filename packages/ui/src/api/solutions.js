import client from './client'

const getSolutionsByBotId = (botId) => client.get(`/solutions/bot/${botId}`)

const getSolutionById = (id) => client.get(`/solutions/${id}`)

const createSolution = (body) => client.post('/solutions', body)

const updateSolution = (id, body) => client.patch(`/solutions/${id}`, body)

const deleteSolution = (id) => client.delete(`/solutions/${id}`)

export default {
    getSolutionsByBotId,
    getSolutionById,
    createSolution,
    updateSolution,
    deleteSolution
}

