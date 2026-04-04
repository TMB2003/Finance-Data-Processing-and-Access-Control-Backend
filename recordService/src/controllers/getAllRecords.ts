import TryCatch from "../utils/tryCatch";
import { Request, Response } from "express";
import { sql_db } from "../config/connectDb";

const getAllRecords = TryCatch(async (req: Request, res: Response) => {

    const {
        type,
        category,
        from,
        to,
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

    // Build conditions array
    const conditions: string[] = [];
    const params: (string | number | Date)[] = [];
    let paramIndex = 1;

    if (type) {
        conditions.push(`type = $${paramIndex++}`);
        params.push(type as string);
    }
    if (category) {
        conditions.push(`category = $${paramIndex++}`);
        params.push(category as string);
    }
    if (from) {
        conditions.push(`date >= $${paramIndex++}`);
        params.push(new Date(from as string));
    }
    if (to) {
        conditions.push(`date <= $${paramIndex++}`);
        params.push(new Date(to as string));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get records
    const records = await sql_db.unsafe(`
        SELECT *
        FROM records
        ${whereClause}
        ORDER BY date DESC
        LIMIT $${paramIndex++}
        OFFSET $${paramIndex++}
    `, [...params, Number(limit), offset]);

    // Get total count
    const countResult = await sql_db.unsafe(`
        SELECT COUNT(*) as total
        FROM records
        ${whereClause}
    `, params);

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