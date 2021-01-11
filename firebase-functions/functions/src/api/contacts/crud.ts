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

router.put('/:id', async (req, res, next) => {
  try {
    const { body } = req

    if (!body.firstName
      || !body.lastName
      || !body.phoneNumber) {
      return next(new Error('Missing required fields (firstName, lastName, phoneNumber)'))
    }

    const { id } = req.params
    const contact = await contacts.readOne(id)

    if(!contact) {
      return next(new Error('No contact was found'))
    }

    const result = await contacts.updateOne(contact.id, {
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
      company: body.company
    })
    
    res.json(result)
  } catch (error) {
    next(error);
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const result = await contacts.hardDelete(id)

    res.json(result)
  } catch (error) {
    next(error);
  }
})

export default router;