import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const useAuth = (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: no token provided" });
    }

    try {
        const decoded = verifyToken(token);

        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();

    } catch (err) {
        console.error("JWT verification failed:", err);
        return res.status(401).json({ message: "Unauthorized: invalid or expired token" });
    }
};