import TryCatch from "../utils/tryCatch";
import { Request, Response } from "express";
import { RecordRepository } from "../repositories/recordRepository";
import { validateTrendPeriod } from "../utils/validators";

const getSummary = TryCatch(async (req: Request, res: Response) => {
    const { trend = "monthly" } = req.query;

    if (!validateTrendPeriod(trend as string)) {
        return res.status(400).json({ message: "trend must be 'monthly' or 'weekly'" });
    }

    const { totalIncome, totalExpenses, categoryTotals } = await RecordRepository.getSummary();
    const netBalance = totalIncome - totalExpenses;
    const recentActivity = await RecordRepository.getRecentActivity(10);
    const trends = await RecordRepository.getTrends(trend as "monthly" | "weekly");

    // shape trends into { period, income, expense }
    const trendsMap: Record<string, { period: string; income: number; expense: number }> = {};

    for (const row of trends) {
        if (!trendsMap[row.period]) {
            trendsMap[row.period] = { period: row.period, income: 0, expense: 0 };
        }
        if (row.type === "income") {
            trendsMap[row.period].income = Number(row.total);
        } else {
            trendsMap[row.period].expense = Number(row.total);
        }
    }

    return res.status(200).json({
        success: true,
        summary: {
            totalIncome,
            totalExpenses,
            netBalance,
            categoryTotals,
            recentActivity,
            trends: Object.values(trendsMap),
        },
    });
});

export default getSummary;