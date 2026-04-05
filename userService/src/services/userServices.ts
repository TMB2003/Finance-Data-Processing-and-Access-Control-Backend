import bcrypt from "bcrypt";
import { User } from "../models/userModel";
import { userSchema } from "../types/userTypes";

const toUserWithoutPassword = (user: any): userSchema => {
    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword as userSchema;
};

export const createUser = async (name: string, email: string, password: string, role: string, isActive: boolean) => {
    const existing = await User.findOne({ email });
    if (existing) throw new Error("Email already registered");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: passwordHash, role, isActive });

    return toUserWithoutPassword(user);
};

export const verifyUser = async (email: string, password: string) => {
    const user = await findUserByEmail(email);
    if (!user) throw new Error("Invalid credentials");
    
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");
    
    return toUserWithoutPassword(user);
};

export const findUserById = async(_id: string) => {
    return await User.findOne({_id});
}

export const updateUser = async (_id: string, updates: { isActive?: boolean }) => {
    const user = await User.findByIdAndUpdate(_id, updates, { returnDocument: 'after' });
    if (!user) throw new Error("User not found");
    return toUserWithoutPassword(user);
};

export const findUserByEmail = async (email: string) => {
    return await User.findOne({ email }).select("+password");
};

export const verifyPassword = async (plain: string, hashed: string): Promise<boolean> => {
    return await bcrypt.compare(plain, hashed);
};