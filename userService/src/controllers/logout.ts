import TryCatch from "../utils/tryCatch";

const logout = TryCatch(async(req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    return res.status(200).json({message: "Logged out successfully"});
});

export default logout;