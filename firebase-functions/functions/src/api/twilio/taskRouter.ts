import * as express from 'express';
import * as taskRouter from '../../taskRouter'

const router = express.Router();

router.post('/worker', async (req, res, next) =>  {
  try {
    const { body } = req;

    const worker = await taskRouter.createWorker({
      id: body.id,
      name: body.name,
      departments: body.departments
    })

    res.json(worker);
  } catch (error) {
    next(error);
  }
});

router.post('/taskQueue', async (req, res, next) => {
  try {
    const taskQueue = await taskRouter.createTaskQueue({
      name: req.body.name
    }, req.body.default)

    res.json(taskQueue);
  } catch (error) {
    next(error);
  }
});

router.post('/workflow', async (req, res, next) => {
  try {
    const workflow = await taskRouter.createWorkflow();

    res.json(workflow);
  } catch (error) {
    next(error);
  }
});

export default router;
