import * as express from 'express'
import contacts from '../../firestore/contacts'

const router = express.Router()

router.get('/:id?', async (req, res, next) => {
  try {
    const { id } = req.params;
    let result;

    if(!id) {
      result = await contacts.getAll();
    } else {
      result = await contacts.readOne(id);
    }

    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { body } = req;

    if (!body.firstName
      || !body.lastName
      || !body.phoneNumber) {
      return next(new Error('Missing required fields (firstName, lastName, phoneNumber)'))
    }

    const result = await contacts.createOne({
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
      company: body.company
    })

    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

export default router;