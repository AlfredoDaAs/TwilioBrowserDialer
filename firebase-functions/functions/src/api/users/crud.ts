import * as express from 'express'
import { adminMiddleware } from '../../middlewares/admin'
import User from '../../firestore/users'

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const users = await User.getAllUsers()

        res.json(users)
    } catch (error) {
        throw new Error(error);
    }
})

router.post('/', adminMiddleware, async (req, res) => {
    try {
        const body = req.body

        const result = await User.createOne({
            name: body.name,
            email: body.email,
            'twilio.number': body.twilioNumber
        })

        res.json(result)
    } catch (error) {
        throw new Error(error);
    }
})

/* router.put('/:id', adminMiddleware, (req, res) => {

})

router.delete('/:id', adminMiddleware, (req, res) => {

}) */

export default router