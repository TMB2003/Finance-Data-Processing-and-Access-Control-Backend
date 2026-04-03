import TryCatch from "../utils/tryCatch";
import { Request, Response } from "express";
import { sql_db } from "../config/connectDb";

const getAllRecords = TryCatch(async (req: Request, res: Response) => {

    const {
        type,
        category,
        from,        // date range start  e.g. 2024-01-01
        to,          // date range end    e.g. 2024-12-31
        limit = 10,
        page  = 1,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // validate type if provided
    if (type && !["income", "expense"].includes(type as string)) {
        return res.status(400).json({ message: "type must be 'income' or 'expense'" });
    }

    // validate date range if provided
    if (from && isNaN(Date.parse(from as string))) {
        return res.status(400).json({ message: "invalid 'from' date format" });
    }
    if (to && isNaN(Date.parse(to as string))) {
        return res.status(400).json({ message: "invalid 'to' date format" });
    }

    // build filters dynamically
    const records = await sql_db`
        SELECT *
        FROM records
        WHERE
            ${type     ? sql_db`type = ${type}`                                      : sql_db`TRUE`}
        AND ${category ? sql_db`category = ${category}`                              : sql_db`TRUE`}
        AND ${from     ? sql_db`date >= ${new Date(from as string)}`                 : sql_db`TRUE`}
        AND ${to       ? sql_db`date <= ${new Date(to as string)}`                   : sql_db`TRUE`}
        ORDER BY date DESC
        LIMIT  ${Number(limit)}
        OFFSET ${offset}
    `;

    // total count for pagination
    const countResult = await sql_db`
        SELECT COUNT(*) as total
        FROM records
        WHERE
            ${type     ? sql_db`type = ${type}`                                      : sql_db`TRUE`}
        AND ${category ? sql_db`category = ${category}`                              : sql_db`TRUE`}
        AND ${from     ? sql_db`date >= ${new Date(from as string)}`                 : sql_db`TRUE`}
        AND ${to       ? sql_db`date <= ${new Date(to as string)}`                   : sql_db`TRUE`}
    `;

    const total      = Number(countResult[0].total);
    const totalPages = Math.ceil(total / Number(limit));

    return res.status(200).json({
        success: true,
        pagination: {
            total,
            totalPages,
            currentPage : Number(page),
            limit       : Number(limit),
        },
        records,
    });
});

export default getAllRecords;