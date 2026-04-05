import TryCatch from "../utils/tryCatch";
import { Request, Response } from "express";
import { RecordRepository } from "../repositories/recordRepository";
import { validateRecordType, validateAmount } from "../utils/validators";

const updateRecord = TryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;

    const existing = await RecordRepository.findById(id as string);
    if (!existing) {
        return res.status(404).json({ message: "Record not found" });
    }

    // validate type if provided
    if (type && !validateRecordType(type)) {
        return res.status(400).json({ message: "type must be either 'income' or 'expense'" });
    }

    // validate amount if provided
    if (amount !== undefined && !validateAmount(Number(amount))) {
        return res.status(400).json({ message: "amount must be a positive number" });
    }

    const record = await RecordRepository.update(
        id as string,
        {
            amount: amount ? Number(amount) : undefined,
            type,
            category,
            date: date ? new Date(date) : undefined,
            notes: notes ?? null,
        },
        existing as any
    );

    return res.status(200).json({
        success: true,
        message: "Record updated successfully",
        record,
    });
});

export default updateRecord;