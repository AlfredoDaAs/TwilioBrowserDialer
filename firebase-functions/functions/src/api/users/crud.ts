import * as express from 'express'
import { adminMiddleware } from '../../middlewares/admin'
import users from '../../firestore/users'

const router = express.Router()

router.get('/:id?', async (req, res, next) => {
    try {
        const id = req.params.id
        if(id) {
            const user = await users.readOne(id)

            res.json(user)
        }
        else {
            const results = await users.getAllUsers()

            res.json(results)
        }
    } catch (error) {
        next(error)
    }
})

router.post('/', adminMiddleware, async (req, res, next) => {
    try {
        const body = req.body

        if(!body.name
            || !body.lastName
            || !body.email) {
            return next(new Error('Missing required fields (name, lastname, email)'))
        }

        const user = await users.findByEmail(body.email)

        if(user) {
            return next(new Error('User already exists'))
        }

        const result = await users.createOne({
            name: body.name,
            lastName: body.lastName,
            email: body.email,
            phoneNumber: body.phoneNumber ? body.phoneNumber : null,
            deparment: body.deparment ? body.deparment : null
        })

        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.put('/:id', adminMiddleware, async (req, res, next) => {
    try {
        const body = req.body
        const id = req.params.id

        const result = await users.updateOne(id, {
            phoneNumber: body.phoneNumber,
            deparment: body.deparment,
            name: body.name,
            lastName: body.lastName
        })

        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.delete('/:id', adminMiddleware, async (req, res, next) => {
  try {
    const id = req.params.id

    if(!id) {
      return next(new Error('missing user id'));
    }

    const user = await users.readOne(id);

    if(user.isAdmin) {
      return next(new Error('Cannot delete admin user'));
    }

    const result = await users.hardDelete(id);
    return res.json(result)
  } catch (error) {
    return next(error)
  }
})

export default router