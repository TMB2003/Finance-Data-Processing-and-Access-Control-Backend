import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("Connected to database");
    } catch (error) {
        console.log("Error connecting to database", error);
    }
};

export default connectDb;
