import * as express from 'express'
import * as functions from 'firebase-functions';
import * as jwt from 'jsonwebtoken'
import User from '../firestore/users'

export const apiValidation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const auth = req.headers.authorization

  if (auth) {
    const token = auth.split('Bearer ')[1]

    if (!token) {
      return res.status(403)
        .json({
          success: false,
          message: 'Failed to Authenticate Token'
        })
    }

    jwt.verify(token, functions.config().jwt.key, async (err: any, decoded: any) => {
      if (err) {
        return res.status(403)
          .json({
            success: false,
            message: 'Failed to Authenticate Token'
          })
      }

      req.decoded = decoded

      if (!decoded.email) {
        return res.status(403)
          .json({
            success: false,
            message: 'No email account found'
          })
      }

      const user = await User.findByEmail(decoded.email)

      if (!user) {
        return res.status(403)
          .json({
            success: false,
            message: 'User does not exist'
          })
      }

      req.isAdmin = user.isAdmin
      next()
      return;
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