import TryCatch from "../utils/tryCatch";
import { Request, Response } from "express";
import { RecordRepository } from "../repositories/recordRepository";
import { validateRecordType } from "../utils/validators";

const getAllRecords = TryCatch(async (req: Request, res: Response) => {
    const {
        type,
        category,
        from,
        to,
        limit = 50,
        page  = 1,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // validate type if provided
    if (type && !validateRecordType(type as string)) {
        return res.status(400).json({ message: "type must be 'income' or 'expense'" });
    }

    // validate date range if provided
    if (from && isNaN(Date.parse(from as string))) {
        return res.status(400).json({ message: "invalid 'from' date format" });
    }
    if (to && isNaN(Date.parse(to as string))) {
        return res.status(400).json({ message: "invalid 'to' date format" });
    }

    const { records, total } = await RecordRepository.findAll({
        type: type as string | undefined,
        category: category as string | undefined,
        from: from ? new Date(from as string) : undefined,
        to: to ? new Date(to as string) : undefined,
        limit: Number(limit),
        offset,
    });

    const totalPages = Math.ceil(total / Number(limit));

    return res.status(200).json({
        success: true,
        pagination: {
            total,
            totalPages,
            currentPage: Number(page),
            limit: Number(limit),
        },
        records,
    });
});

export default getAllRecords;