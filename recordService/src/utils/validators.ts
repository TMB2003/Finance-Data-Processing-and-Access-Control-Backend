export const VALID_RECORD_TYPES = ["income", "expense"] as const;
export type RecordType = typeof VALID_RECORD_TYPES[number];

export const validateRecordType = (type: string): type is RecordType => {
    return VALID_RECORD_TYPES.includes(type as RecordType);
};

export const validateAmount = (amount: unknown): amount is number => {
    return typeof amount === "number" && !isNaN(amount) && amount > 0;
};

export const VALID_TREND_PERIODS = ["monthly", "weekly"] as const;
export type TrendPeriod = typeof VALID_TREND_PERIODS[number];

export const validateTrendPeriod = (trend: string): trend is TrendPeriod => {
    return VALID_TREND_PERIODS.includes(trend as TrendPeriod);
};

export const validateRequiredFields = (
    fields: Record<string, unknown>,
    required: string[]
): string[] => {
    return required.filter(field => !fields[field]);
};
