import TryCatch from "../utils/tryCatch";
import { Request, Response } from "express";
import { sql_db } from "../config/connectDb";

const getRecord = TryCatch(async (req: Request, res: Response) => {

    const { id } = req.params;

    const result = await sql_db`
        SELECT * FROM records WHERE id = ${id}
    `;

    if (result.length === 0) {
        return res.status(404).json({ message: "Record not found" });
    }

    return res.status(200).json({
        success: true,
        record: result[0],
    });
});

export default getRecord;