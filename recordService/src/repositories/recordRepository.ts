import { sql_db } from "../config/connectDb";

export interface RecordInput {
    amount: number;
    type: string;
    category: string;
    date: Date;
    notes?: string | null;
    created_by: string;
}

export interface RecordUpdateInput {
    amount?: number;
    type?: string;
    category?: string;
    date?: Date;
    notes?: string | null;
}

export const RecordRepository = {
    async findById(id: string) {
        const result = await sql_db`SELECT * FROM records WHERE id = ${id}`;
        return result[0] || null;
    },

    async findAll(options: {
        type?: string;
        category?: string;
        from?: Date;
        to?: Date;
        limit: number;
        offset: number;
    }) {
        const { type, category, from, to, limit, offset } = options;
        
        const conditions: string[] = [];
        const params: (string | number | Date)[] = [];
        let paramIndex = 1;

        if (type) {
            conditions.push(`type = $${paramIndex++}`);
            params.push(type);
        }
        if (category) {
            conditions.push(`category = $${paramIndex++}`);
            params.push(category);
        }
        if (from) {
            conditions.push(`date >= $${paramIndex++}`);
            params.push(from);
        }
        if (to) {
            conditions.push(`date <= $${paramIndex++}`);
            params.push(to);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const records = await sql_db.unsafe(
            `SELECT * FROM records ${whereClause} ORDER BY date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
            [...params, limit, offset]
        );

        const countResult = await sql_db.unsafe(
            `SELECT COUNT(*) as total FROM records ${whereClause}`,
            params
        );

        return {
            records,
            total: Number(countResult[0]?.total || 0),
        };
    },

    async create(input: RecordInput) {
        const result = await sql_db`
            INSERT INTO records (amount, type, category, date, notes, created_by)
            VALUES (${input.amount}, ${input.type}, ${input.category}, ${input.date}, ${input.notes ?? null}, ${input.created_by})
            RETURNING *
        `;
        return result[0];
    },

    async update(id: string, input: RecordUpdateInput, existing: RecordInput) {
        const result = await sql_db`
            UPDATE records
            SET
                amount = ${input.amount ?? existing.amount},
                type = ${input.type ?? existing.type},
                category = ${input.category ?? existing.category},
                date = ${input.date ?? existing.date},
                notes = ${input.notes ?? existing.notes ?? null}
            WHERE id = ${id}
            RETURNING *
        `;
        return result[0];
    },

    async delete(id: string) {
        await sql_db`DELETE FROM records WHERE id = ${id}`;
    },

    async getSummary() {
        const totalsResult = await sql_db`
            SELECT
                COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) AS total_income,
                COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS total_expenses
            FROM records
        `;

        const categoryTotals = await sql_db`
            SELECT category, type, COALESCE(SUM(amount), 0) AS total
            FROM records
            GROUP BY category, type
            ORDER BY total DESC
        `;

        return {
            totalIncome: Number(totalsResult[0]?.total_income || 0),
            totalExpenses: Number(totalsResult[0]?.total_expenses || 0),
            categoryTotals,
        };
    },

    async getRecentActivity(limit: number = 10) {
        return await sql_db`
            SELECT * FROM records ORDER BY created_at DESC LIMIT ${limit}
        `;
    },

    async getTrends(period: "monthly" | "weekly") {
        const trends = await sql_db`
            SELECT
                ${period === "monthly"
                    ? sql_db`TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM')`
                    : sql_db`TO_CHAR(DATE_TRUNC('week', date), 'YYYY-MM-DD')`
                } AS period,
                type,
                COALESCE(SUM(amount), 0) AS total
            FROM records
            GROUP BY period, type
            ORDER BY period DESC
        `;
        return trends;
    },
};
