import * as admin from "firebase-admin"
import * as express from 'express'

const router = express.Router();

const verifyToken = async (token: string) => {
    const user = await admin.auth().verifyIdToken(token)

    return user
}

router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const token = req.body.token

        const decodedIdToken = await verifyToken(token)

        console.log('decodedIdToken', decodedIdToken);

        // create or get user from firestore

        res.json({
            status: 'ok',
            user: decodedIdToken
        })
        
    } catch (error) {
        console.log('error', error.message);
        
        res.json(error.message)
    }
})

export default router;