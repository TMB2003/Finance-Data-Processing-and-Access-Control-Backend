import TryCatch from "../utils/tryCatch";
import { Request, Response } from "express";
import { RecordRepository } from "../repositories/recordRepository";

const deleteRecord = TryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;

    const existing = await RecordRepository.findById(id as string);
    if (!existing) {
        return res.status(404).json({ message: "Record not found" });
    }

    await RecordRepository.delete(id as string);

    return res.status(200).json({
        success: true,
        message: "Record deleted successfully",
    });
});

export default deleteRecord;