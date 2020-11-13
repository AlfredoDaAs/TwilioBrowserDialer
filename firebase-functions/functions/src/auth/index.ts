import * as admin from "firebase-admin"
import * as functions from 'firebase-functions';
import * as express from 'express'
import User from '../firestore/users'
import * as jwt from 'jsonwebtoken'

const router = express.Router();

const verifyToken = async (token: string) => {
    const user = await admin.auth().verifyIdToken(token)

    return user
}

router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const token = req.body.token

        const decodedIdToken = await verifyToken(token)

        if(!decodedIdToken.email_verified) {
            res.status(500).json({
                status: 'error',
                message: 'Google email is not verified'
            })
            return;
        }

        // getting user registered by admin
        let user = await User.findByEmail(decodedIdToken.email as string)

        if(user) {
            // updating data with decoded google information
            await User.updateOne(user.id, {
                name: decodedIdToken.name,
                email: decodedIdToken.email,
                picture: decodedIdToken.picture,
                uid: decodedIdToken.uid
            })

            user = await User.readOne(user.id)

            const jwtToken = jwt.sign({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }, functions.config().jwt.key, { expiresIn: "1d" })

            res.json({
                status: 'ok',
                token: jwtToken,
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            })
        }
        else {
            res.sendStatus(403)
            return;
        }
    } catch (error) {
        throw new Error(error);
    }
})

export default router;