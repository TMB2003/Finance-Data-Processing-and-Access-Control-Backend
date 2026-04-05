import TryCatch from "../utils/tryCatch";
import { Request, Response } from "express";
import { RecordRepository } from "../repositories/recordRepository";

const getRecord = TryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;

    const record = await RecordRepository.findById(id as string);

    if (!record) {
        return res.status(404).json({ message: "Record not found" });
    }

    return res.status(200).json({
        success: true,
        record,
    });
});

export default getRecord;