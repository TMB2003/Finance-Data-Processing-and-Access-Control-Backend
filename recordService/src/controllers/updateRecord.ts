import TryCatch from "../utils/tryCatch";
import { Request, Response } from "express";
import { sql_db } from "../config/connectDb";

const updateRecord = TryCatch(async (req: Request, res: Response) => {

    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;

    // check record exists
    const existing = await sql_db`
        SELECT * FROM records WHERE id = ${id}
    `;

    if (existing.length === 0) {
        return res.status(404).json({ message: "Record not found" });
    }

    // validate type if provided
    if (type && !["income", "expense"].includes(type)) {
        return res.status(400).json({ message: "type must be either 'income' or 'expense'" });
    }

    // validate amount if provided
    if (amount !== undefined && (isNaN(amount) || Number(amount) <= 0)) {
        return res.status(400).json({ message: "amount must be a positive number" });
    }

    // partial update — keep existing values if not provided
    const updated = await sql_db`
        UPDATE records
        SET
            amount   = ${amount ? Number(amount) : existing[0].amount},
            type     = ${type     ?? existing[0].type},
            category = ${category ?? existing[0].category},
            date     = ${date ? new Date(date)   : existing[0].date},
            notes    = ${notes    ?? existing[0].notes}
        WHERE id = ${id}
        RETURNING *
    `;

    return res.status(200).json({
        success: true,
        message: "Record updated successfully",
        record: updated[0],
    });
});

export default updateRecord;