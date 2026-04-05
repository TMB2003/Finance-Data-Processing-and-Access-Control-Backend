import TryCatch from "../utils/tryCatch";
import { generateToken } from "../utils/jwt";
import { verifyUser } from "../services/userServices";

const login = TryCatch(async(req, res) => {
    const {email, password} = req.body;
    
    const user = await verifyUser(email, password);
    
    const token = generateToken({_id: user._id.toString(), role: user.role});

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return res.status(201).json({token});
});

export default login;