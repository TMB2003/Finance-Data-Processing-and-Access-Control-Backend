import { sql_db } from "./connectDb.js";

export const initDB = async () => {
    try {
        await sql_db`
            CREATE TABLE IF NOT EXISTS records (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
                type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
                category VARCHAR(100) NOT NULL,
                date TIMESTAMPTZ NOT NULL,
                notes TEXT,
                created_by VARCHAR(24) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;

        console.log("SQL Database initialized successfully");
    } catch (error) {
        console.log("SQL Database initialization failed", error);
    }
}
