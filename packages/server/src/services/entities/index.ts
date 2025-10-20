import { StatusCodes } from 'http-status-codes'
import { Entity } from '../../database/entities/Entity'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'

// Get all entities
const getAllEntities = async () => {
    try {
        const appServer = getRunningExpressApp()
        const entities = await appServer.AppDataSource.getRepository(Entity).find({
            order: {
                createdDate: 'DESC'
            },
            relations: ['variables']
        })
        return entities
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: entitiesService.getAllEntities - ${getErrorMessage(error)}`
        )
    }
}

// Get entity by ID
const getEntityById = async (entityId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const entity = await appServer.AppDataSource.getRepository(Entity).findOne({
            where: { id: entityId },
            relations: ['variables']
        })
        if (!entity) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Entity ${entityId} not found`)
        }
        return entity
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: entitiesService.getEntityById - ${getErrorMessage(error)}`
        )
    }
}

// Create new entity
const createEntity = async (entityData: Partial<Entity>): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const newEntity = appServer.AppDataSource.getRepository(Entity).create(entityData)
        const entity = await appServer.AppDataSource.getRepository(Entity).save(newEntity)
        return entity
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: entitiesService.createEntity - ${getErrorMessage(error)}`
        )
    }
}

// Update entity
const updateEntity = async (entityId: string, entityData: Partial<Entity>): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const entity = await appServer.AppDataSource.getRepository(Entity).findOneBy({ id: entityId })
        if (!entity) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Entity ${entityId} not found`)
        }
        await appServer.AppDataSource.getRepository(Entity).merge(entity, entityData)
        const updatedEntity = await appServer.AppDataSource.getRepository(Entity).save(entity)
        return updatedEntity
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: entitiesService.updateEntity - ${getErrorMessage(error)}`
        )
    }
}

// Delete entity
const deleteEntity = async (entityId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const entity = await appServer.AppDataSource.getRepository(Entity).findOneBy({ id: entityId })
        if (!entity) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Entity ${entityId} not found`)
        }
        const response = await appServer.AppDataSource.getRepository(Entity).remove(entity)
        return response
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: entitiesService.deleteEntity - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getAllEntities,
    getEntityById,
    createEntity,
    updateEntity,
    deleteEntity
}

