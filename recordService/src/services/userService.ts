import axios from "axios";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL!;

export const getUserById = async (userId: string, token: string) => {
    const response = await axios.get(`${USER_SERVICE_URL}/profile`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.user;
};