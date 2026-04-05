import TryCatch from "../utils/tryCatch";
import { generateToken } from "../utils/jwt";
import { verifyUser } from "../services/userServices";
import { userSchema } from "../types/userTypes";

const login = TryCatch(async(req, res) => {
    const {email, password} = req.body;
    
    const user:userSchema = await verifyUser(email, password);

    const token:string = generateToken(user);

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return res.status(201).json({token});
});

export default login;