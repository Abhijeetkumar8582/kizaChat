import { Request, Response, NextFunction } from 'express'
import entitiesService from '../../services/entities'

const getAllEntities = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const entities = await entitiesService.getAllEntities()
        return res.json(entities)
    } catch (error) {
        next(error)
    }
}

const getEntityById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const entity = await entitiesService.getEntityById(req.params.id)
        return res.json(entity)
    } catch (error) {
        next(error)
    }
}

const createEntity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const entity = await entitiesService.createEntity(req.body)
        return res.status(201).json(entity)
    } catch (error) {
        next(error)
    }
}

const updateEntity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const entity = await entitiesService.updateEntity(req.params.id, req.body)
        return res.json(entity)
    } catch (error) {
        next(error)
    }
}

const deleteEntity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await entitiesService.deleteEntity(req.params.id)
        return res.status(204).send()
    } catch (error) {
        next(error)
    }
}

export default {
    getAllEntities,
    getEntityById,
    createEntity,
    updateEntity,
    deleteEntity
}

