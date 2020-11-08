import * as express from 'express'

export const adminMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if(req.isAdmin) return next()

    res.status(403)
        .json({
            success: false,
            message: 'Unauthorized access'
        })
}