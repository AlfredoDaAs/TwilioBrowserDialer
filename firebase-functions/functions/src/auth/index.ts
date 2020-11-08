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
            res.json({
                status: 'error',
                message: 'Google email is not verified'
            })
            return;
        }

        let user = await User.findByEmail(decodedIdToken.email as string)

        if(!user) {
            const id = await User.createOne({
                name: decodedIdToken.name,
                email: decodedIdToken.email,
                picture: decodedIdToken.picture,
                uid: decodedIdToken.uid
            })

            if(!id) {
                res.json({
                    status: 'error',
                    message: 'User could not be created'
                })
                return;
            }

            user = await User.readOne(id)
        }

        const jwtToken = jwt.sign({ name: user.name, email: user.email, isAdmin: user.isAdmin }, functions.config().jwt.key, { expiresIn: "1d" })

        res.json({
            status: 'ok',
            token: jwtToken,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        })
    } catch (error) {
        console.log('error', error);
        
        res.json(error.message)
    }
})

export default router;