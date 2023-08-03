export const isDateString = (value: string): boolean => !Number.isNaN(Date.parse(value));