import TryCatch from "../utils/tryCatch";
import { updateUser } from "../services/userServices";
import { userSchema } from "../types/userTypes";

const update = TryCatch(async(req, res) => {
    const { isActive } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: user not authenticated" });
    }
    
    if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const user: userSchema = await updateUser(userId, { isActive });

    return res.status(200).json({
        success: true,
        message: "User updated successfully",
        user
    });
});

export default update;