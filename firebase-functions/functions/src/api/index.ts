import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import env from '../common/env'
import User from '../firestore/users'

export const apiValidation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const auth = req.headers['authorization']

    if(auth) {
        const token = auth.split(' ')[1]

        jwt.verify(token, env().jwt.token, async (err: any, decoded: any) => {
            if(err) {
                return res.status(403)
                    .json({
                        success: false,
                        message: 'Failed to Authenticate Token'
                    })
            }

            req.decoded = decoded

            const user = await User.findByEmail(decoded.email)

            if(!user) {
                return res.status(403)
                    .json({
                        success: false,
                        message: 'User does not exist'
                    })
            }

            req.isAdmin = user.isAdmin
            next()
        })

        return;
    }
    else {
        return res.status(403).json({
            success: false,
            message: 'Failed to Authenticate Token'
        });
    }
}