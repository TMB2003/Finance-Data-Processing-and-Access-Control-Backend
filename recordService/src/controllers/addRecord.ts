import TryCatch from "../utils/tryCatch";
import { Request, Response } from "express";
import { sql_db } from "../config/connectDb";

const addRecord = TryCatch(async (req: Request, res: Response) => {

    const { amount, type, category, date, notes } = req.body;

    if (!amount || !type || !category || !date) {
        return res.status(400).json({ message: "amount, type, category and date are required" });
    }

    if (!["income", "expense"].includes(type)) {
        return res.status(400).json({ message: "type must be 'income' or 'expense'" });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ message: "amount must be a positive number" });
    }

    const result = await sql_db`
        INSERT INTO records (amount, type, category, date, notes, created_by)
        VALUES (
            ${Number(amount)},
            ${type},
            ${category},
            ${new Date(date)},
            ${notes ?? null},
            ${req.user!._id}
        )
        RETURNING *
    `;

    return res.status(201).json({
        success: true,
        message: "Record added successfully",
        record: result[0],
    });
});

export default addRecord;