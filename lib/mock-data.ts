// Mock Data Constants
export const ACCOUNTS = [
  { id: 1, store: "TFG", balance: 450, minDue: 150, dueDate: "25 June", status: "unpaid", interestRate: 21.0, creditLimit: 1200 },
  { id: 2, store: "Truworths", balance: 500, minDue: 200, dueDate: "28 June", status: "unpaid", interestRate: 22.5, creditLimit: 1000 },
  { id: 3, store: "Ackermans", balance: 250, minDue: 100, dueDate: "01 July", status: "paid", interestRate: 20.0, creditLimit: 800 },
] as const;

export const MONTHLY_SPENDING = [
  { month: "Jan", amount: 320 },
  { month: "Feb", amount: 480 },
  { month: "Mar", amount: 290 },
  { month: "Apr", amount: 610 },
  { month: "May", amount: 450 },
  { month: "Jun", amount: 380 },
];

export const TOTAL_CREDIT_LIMIT = 3000;
export const TOTAL_DEBT = 1200;

export const STORE_COLORS = {
  TFG: "#3b82f6",
  Truworths: "#8b5cf6", 
  Ackermans: "#14b8a6",
} as const;

export type Account = typeof ACCOUNTS[number];
export type Store = keyof typeof STORE_COLORS;
