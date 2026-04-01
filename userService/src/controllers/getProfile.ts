import { User } from "../models/userModel";
import TryCatch from "../utils/tryCatch";

const getProfile = TryCatch(async (req, res) => {
    const userEmail = req.user?.email;

    if (!userEmail) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findOne({email: userEmail});
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
        user: {
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});

export default getProfile;