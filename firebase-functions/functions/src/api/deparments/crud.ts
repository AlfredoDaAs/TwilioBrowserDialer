import * as express from 'express'
import { adminMiddleware } from '../../middlewares/admin'
import departments from '../../firestore/departments'
import users from '../../firestore/users'

const router = express.Router()

router.get('/:id?', async (req, res, next) => {
  try {
    const { id } = req.params

    if (id) {
      const deparment = await departments.readOne(id);

      return res.json(deparment);
    }

    const results = await departments.getDeparments();

    return res.json(results)
  } catch (error) {
    return next(error)
  }
})

router.post('/', adminMiddleware, async (req, res, next) => {
  try {
    const { body } = req

    if (!body.name) {
      return next(new Error('Missing required fields'));
    }

    const result = await departments.createOne({
      name: body.name
    })

    return res.json(result)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { body } = req

    if (!id || id === undefined || id === null) {
      return next(new Error('Missing id parameter'))
    }

    if (!body.name) {
      return next(new Error('Missing required fields'));
    }

    const deparment = await departments.readOne(id);

    if (!deparment) {
      return next(new Error('No deparment was found'))
    }

    const result = await departments.updateOne(id, {
      name: body.name
    })

    return res.json(result);
  } catch (error) {
    next(error);
  }
})

router.delete('/:id', adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params

    if (!id || id === undefined || id === null) {
      return next(new Error('Missing id parameter'))
    }

    const department = await departments.readOne(id);

    if (!department) {
      return next(new Error('Department not found'));
    }

    const deleted = await departments.hardDelete(id);

    if (deleted) {
      await users.removeUsersDepartment(department.name);
    }

    return res.json(true);
  } catch (error) {
    return next(error);
  }
})

export default router;
