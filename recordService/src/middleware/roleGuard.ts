import { Request, Response, NextFunction } from "express";

export const isViewer = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: please login" });
    }

    const allowed = ["viewer", "analyst", "admin"];

    if (!allowed.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }

    next();
};

export const isAnalyst = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: please login" });
    }

    const allowed = ["analyst", "admin"];

    if (!allowed.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: analyst or admin only" });
    }

    next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: please login" });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: admin only" });
    }

    next();
};