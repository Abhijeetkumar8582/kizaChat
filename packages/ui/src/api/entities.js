import client from './client'

const getAllEntities = () => client.get('/entities')

const getEntityById = (id) => client.get(`/entities/${id}`)

const createEntity = (entity) => client.post('/entities', entity)

const updateEntity = (id, entity) => client.put(`/entities/${id}`, entity)

const deleteEntity = (id) => client.delete(`/entities/${id}`)

export default {
    getAllEntities,
    getEntityById,
    createEntity,
    updateEntity,
    deleteEntity
}

