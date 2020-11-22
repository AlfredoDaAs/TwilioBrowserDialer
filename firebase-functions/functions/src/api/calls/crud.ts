import * as express from 'express'
import calls from '../../firestore/calls'

const router = express.Router()

router.get('/:number', async (req, res, next) => {
  try {
    const number = req.params.number
    const results = await calls.getCallsOfNumber(number);

    res.json(results)
  } catch (error) {
    next(error)
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = req.body

    if(!body.from || !body.to) {
      return next(new Error('Missing required fields'));
    }

    const result = await calls.createOne({
      from: body.from,
      to: body.to
    })
    
    res.json(result)
  } catch (error) {
    next(error)
  }
});

export default router;
