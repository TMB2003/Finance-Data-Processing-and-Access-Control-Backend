import type { NextFunction, Request, RequestHandler, Response } from "express";

const TryCatch = (handler : RequestHandler): RequestHandler => {
    return async (req : Request , res : Response, next : NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            next(error);
        }
    }
}

export default TryCatch;