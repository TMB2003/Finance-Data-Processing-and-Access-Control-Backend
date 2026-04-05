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