import TryCatch from "../utils/tryCatch";
import { Request, Response } from "express";
import { RecordRepository } from "../repositories/recordRepository";
import { validateRecordType, validateAmount, validateRequiredFields } from "../utils/validators";

const addRecord = TryCatch(async (req: Request, res: Response) => {
    const { amount, type, category, date, notes } = req.body;

    const missing = validateRequiredFields({ amount, type, category, date }, ["amount", "type", "category", "date"]);
    if (missing.length > 0) {
        return res.status(400).json({ message: `${missing.join(", ")} are required` });
    }

    if (!validateRecordType(type)) {
        return res.status(400).json({ message: "type must be 'income' or 'expense'" });
    }

    if (!validateAmount(Number(amount))) {
        return res.status(400).json({ message: "amount must be a positive number" });
    }

    const record = await RecordRepository.create({
        amount: Number(amount),
        type,
        category,
        date: new Date(date),
        notes: notes ?? null,
        created_by: req.user!.id,
    });

    return res.status(201).json({
        success: true,
        message: "Record added successfully",
        record,
    });
});

export default addRecord;