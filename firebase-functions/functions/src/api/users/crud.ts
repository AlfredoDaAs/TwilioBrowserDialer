import * as express from 'express'
import { adminMiddleware } from '../../middlewares/admin'

const router = express.Router()

//needs admin middleware

router.get('/', (req, res) => {

})

router.post('/', adminMiddleware, (req, res) => {

})

router.put('/:id', adminMiddleware, (req, res) => {

})

router.delete('/:id', adminMiddleware, (req, res) => {

})

export default router