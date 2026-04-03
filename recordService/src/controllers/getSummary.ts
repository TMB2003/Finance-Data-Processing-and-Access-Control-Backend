import TryCatch from "../utils/tryCatch";
import { Request, Response } from "express";
import { sql_db } from "../config/connectDb";

const getSummary = TryCatch(async (req: Request, res: Response) => {

    const { trend = "monthly" } = req.query;

    if (!["monthly", "weekly"].includes(trend as string)) {
        return res.status(400).json({ message: "trend must be 'monthly' or 'weekly'" });
    }

    // total income and expenses + net balance
    const totalsResult = await sql_db`
        SELECT
            COALESCE(SUM(amount) FILTER (WHERE type = 'income'),  0) AS total_income,
            COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS total_expenses
        FROM records
    `;

    const totalIncome   = Number(totalsResult[0].total_income);
    const totalExpenses = Number(totalsResult[0].total_expenses);
    const netBalance    = totalIncome - totalExpenses;

    // category wise totals
    const categoryTotals = await sql_db`
        SELECT
            category,
            type,
            COALESCE(SUM(amount), 0) AS total
        FROM records
        GROUP BY category, type
        ORDER BY total DESC
    `;

    // recent activity — last 10 records
    const recentActivity = await sql_db`
        SELECT *
        FROM records
        ORDER BY created_at DESC
        LIMIT 10
    `;

    // monthly or weekly trends
    const trends = await sql_db`
        SELECT
            ${trend === "monthly"
                ? sql_db`TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS period`
                : sql_db`TO_CHAR(DATE_TRUNC('week',  date), 'YYYY-MM-DD') AS period`
            },
            type,
            COALESCE(SUM(amount), 0) AS total
        FROM records
        GROUP BY period, type
        ORDER BY period DESC
    `;

    // shape trends into { period, income, expense }
    const trendsMap: Record<string, { period: string; income: number; expense: number }> = {};

    for (const row of trends) {
        if (!trendsMap[row.period]) {
            trendsMap[row.period] = { period: row.period, income: 0, expense: 0 };
        }
        if (row.type === "income") {
            trendsMap[row.period].income  = Number(row.total);
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