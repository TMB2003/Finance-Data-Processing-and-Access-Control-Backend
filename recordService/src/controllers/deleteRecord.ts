import TryCatch from "../utils/tryCatch";
import { Request, Response } from "express";
import { sql_db } from "../config/connectDb";

const deleteRecord = TryCatch(async (req: Request, res: Response) => {

    const { id } = req.params;

    // check record exists
    const existing = await sql_db`
        SELECT id FROM records WHERE id = ${id}
    `;

    if (existing.length === 0) {
        return res.status(404).json({ message: "Record not found" });
    }

    await sql_db`
        DELETE FROM records WHERE id = ${id}
    `;

    return res.status(200).json({
        success: true,
        message: "Record deleted successfully",
    });
});

export default deleteRecord;