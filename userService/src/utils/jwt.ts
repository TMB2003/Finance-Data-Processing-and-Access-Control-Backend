import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { userSchema } from "../types/userTypes";

dotenv.config();

const JWT_SECRET  = process.env["JWT_SECRET"]!;

export const generateToken = (payload: userSchema): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): userSchema => {
    return jwt.verify(token, JWT_SECRET) as userSchema;
};