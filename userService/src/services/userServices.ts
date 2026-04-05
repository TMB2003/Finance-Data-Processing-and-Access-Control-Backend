import bcrypt from "bcrypt";
import { User } from "../models/userModel";

export const createUser = async (name: string, email: string, password: string, role: string, isActive: boolean) => {
    const existing = await User.findOne({ email });
    if (existing) throw new Error("Email already registered");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: passwordHash, role, isActive });
    return user;
};

export const verifyUser = async (email: string, password: string) => {
    const user = await findUserByEmail(email);
    if (!user) throw new Error("Invalid credentials");
    
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");
    
    return user;
};

export const findUserByEmail = async (email: string) => {
    return await User.findOne({ email }).select("+password");
};

export const verifyPassword = async (plain: string, hashed: string): Promise<boolean> => {
    return await bcrypt.compare(plain, hashed);
};