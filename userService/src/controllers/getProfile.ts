import { User } from "../models/userModel";
import TryCatch from "../utils/tryCatch";

const getProfile = TryCatch(async (req, res) => {
    const userId = req.user?.id;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
        user: {
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive
        },
    });
});

export default getProfile;