import * as express from 'express'
import { adminMiddleware } from '../../middlewares/admin'
import User from '../../firestore/users'

const router = express.Router()

router.get('/:id?', async (req, res) => {
    try {
        const id = req.params.id
        if(id) {
            const user = await User.readOne(id)

            res.json(user)
        }
        else {
            const users = await User.getAllUsers()

            res.json(users)
        }
    } catch (error) {
        throw new Error(error);
    }
})

router.post('/', adminMiddleware, async (req, res) => {
    try {
        const body = req.body

        if(!body.name
            || !body.lastname
            || !body.email) {
            throw new Error("Missing required fields (name, lastname, email)");
        }

        const result = await User.createOne({
            name: body.name,
            lastName: body.lastname,
            email: body.email,
            phoneNumber: body.phoneNumber ? body.phoneNumber : null,
            deparment: body.deparment ? body.deparment : null
        })

        res.json(result)
    } catch (error) {
        throw new Error(error);
    }
})

router.put('/:id', adminMiddleware, async (req, res) => {
    try {
        const body = req.body
        const id = req.params.id

        const result = await User.updateOne(id, {
            phoneNumber: body.phoneNumber,
            deparment: body.deparment,
            name: body.name,
            lastName: body.lastName
        })

        res.json(result)
    } catch (error) {
        throw new Error(error);
    }
})

/* router.delete('/:id', adminMiddleware, (req, res) => {

}) */

export default router