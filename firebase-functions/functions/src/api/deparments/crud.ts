import * as express from 'express'
import deparments from '../../firestore/departments'

const router = express.Router()

router.get('/:id?', async (req, res, next) => {
  try {
    const { id } = req.params

    if(id) {
      const deparment = await deparments.readOne(id);

      return res.json(deparment);
    }

    const results = await deparments.getDeparments();

    return res.json(results)
  } catch (error) {
    return next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { body } = req

    if(!body.name) {
      return next(new Error('Missing required fields'));
    }

    const result = await deparments.createOne({
      name: body.name
    })

    return res.json(result)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { body } = req

    if(!id || id === undefined || id === null) {
      return next(new Error('Missing id parameter'))
    }

    if(!body.name) {
      return next(new Error('Missing required fields'));
    }

    const deparment = await deparments.readOne(id);

    if(!deparment) {
      return next(new Error('No deparment was found'))
    }

    const result = await deparments.updateOne(id, {
      name: body.name
    })

    return res.json(result);
  } catch (error) {
    next(error);
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    if(!id || id === undefined || id === null) {
      return next(new Error('Missing id parameter'))
    }

    return await deparments.hardDelete(id);
  } catch (error) {
    next(error)
  }
})

export default router;
