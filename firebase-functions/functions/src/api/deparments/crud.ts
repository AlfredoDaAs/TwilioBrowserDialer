import * as express from 'express'
import deparments from '../../firestore/departments'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const results = await deparments.getDeparments();

    res.json(results)
  } catch (error) {
    next(error)
  }
})