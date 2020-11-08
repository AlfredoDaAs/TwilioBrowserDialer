import * as express from 'express'
//import { adminMiddleware } from '../../middlewares/admin'
import User from '../../firestore/users'

const router = express.Router()

router.get('/', async (req, res) => {
    const users = await User.getAllUsers()

    res.json(users)
})

/* router.post('/', adminMiddleware, (req, res) => {

})

router.put('/:id', adminMiddleware, (req, res) => {

})

router.delete('/:id', adminMiddleware, (req, res) => {

}) */

export default router