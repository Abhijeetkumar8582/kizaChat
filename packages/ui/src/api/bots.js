import client from './client'

const getAllBots = () => client.get('/bots')

const getBotById = (id) => client.get(`/bots/${id}`)

const createBot = (body) => client.post('/bots', body)

const updateBot = (id, body) => client.patch(`/bots/${id}`, body)

const deleteBot = (id) => client.delete(`/bots/${id}`)

export default {
    getAllBots,
    getBotById,
    createBot,
    updateBot,
    deleteBot
}

