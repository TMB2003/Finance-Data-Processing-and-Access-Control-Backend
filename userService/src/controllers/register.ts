import TryCatch from "../utils/tryCatch";
import { generateToken } from "../utils/jwt";
import { createUser } from "../services/userServices";
import { userSchema } from "../types/userTypes";

const register = TryCatch(async(req, res) => {
    const {name, email, password, role} = req.body;
    
    const user:userSchema = await createUser(name, email, password, role, true);
    
    const token:string = generateToken(user);

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