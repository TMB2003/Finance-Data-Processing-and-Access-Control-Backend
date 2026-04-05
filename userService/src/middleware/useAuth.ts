import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
            };
        }
    }
}

const useAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({message: "Not Authenicated"});
    }

    const token = authHeader.split(" ")[1];

    try{
        const secret = process.env["JWT_SECRET"];
        if(!secret){
            return res.status(500).json({message: "JWT secret not configured"});
        }

        const decoded = jwt.verify(token, secret) as { _id?: string };
        if(!decoded._id){
            return res.status(401).json({message: "Invalid token"});
        }

        req.user = { id: decoded._id };
        return next();
    } catch {
        return res.status(401).json({message: "Invalid token"});
    }
};

export default useAuth;