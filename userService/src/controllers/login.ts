import jwt from "jsonwebtoken";
import { User } from "../models/userModel";
import TryCatch from "../utils/tryCatch";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const login = TryCatch(async(req, res) => {
    const {email, password} = req.body;
    let user = await User.findOne({email});

    if(!user){
        return res.status(400).json({message: "User not found"});
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(400).json({message: "Invalid password"});
    }
    
    const expiry = process.env['JWT_EXPIRY'] as '7d' | '1d' | '30d' | '1h' | '1m';
    const token = jwt.sign({id: user.email}, process.env['JWT_SECRET'] as string, {expiresIn: expiry});

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return res.status(201).json({token});
});

export default login;