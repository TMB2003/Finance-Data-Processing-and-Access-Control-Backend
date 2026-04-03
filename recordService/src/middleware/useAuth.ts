import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const useAuth = (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            _id: string;
            role: string;
        };

        req.user = {
            _id: decoded._id,
            role: decoded.role,
        };

        next();

    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: invalid or expired token" });
    }
};