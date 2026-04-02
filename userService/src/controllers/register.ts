import jwt from "jsonwebtoken";
import TryCatch from "../utils/tryCatch";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "../models/userModel";
dotenv.config();

const register = TryCatch(async(req, res) => {
    const {name, email, password, role} = req.body;
    let user = await User.findOne({email});

    if(user){
        return res.status(400).json({message: "User already exists"});
    }
    
    const hashPassword = await bcrypt.hash(password, 10);
    user = await User.create({name, email, password: hashPassword, role});
    
    const token = jwt.sign({id: user._id}, process.env['JWT_SECRET'] as string, {expiresIn: "7d"});

    if(!token){
        return res.status(500).json({message: "Failed to generate token"});
    }
    
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({token});
});

export default register;