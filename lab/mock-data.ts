export type AccountStatus = "unpaid" | "paid" | "overdue";

export interface Account {
  id: string;
  store: string;
  balance: number;
  limit: number;
  minDue: number;
  dueDate: string;
  status: AccountStatus;
  interestRate: number;
  lastPayment?: string;
  storeUrl: string;
}

export const STORE_COLORS: Record<string, string> = {
  Truworths: "#8b5cf6",
  Ackemans : "#FF5722",
  Foschini: "#9C27B0",
};

export const ACCOUNTS: Account[] = [
  {
    id: "3",
    store: "Truworths",
    balance: 4100,
    limit: 6000,
    minDue: 410,
    dueDate: "20 May",
    status: "overdue",
    interestRate: 31.2,
    lastPayment: "22 Mar",
    storeUrl: "https://truworths.co.za",
  },
  {
    id: "4",
    store: "Ackemans",
    balance: 750,
    limit: 2000,
    minDue: 75,
    dueDate: "1 Jun",
    status: "unpaid",
    interestRate: 24.5,
    lastPayment: "1 May",
    storeUrl: "https://www.ackermans.co.za/",
  },
];

export const TOTAL_DEBT = ACCOUNTS.reduce((sum, a) => sum + a.balance, 0);

export const USER_PROFILE = {
  name: "Nomsa",
  monthlyIncome: 18000,
  monthlyBudgetForDebt: 2500,
};