export type User = {
  id: string;
  username: string;
  password: string;
  idNumber: string;
  cellphone: string;
};

export type Store = {
  id: string;
  name: string;
  color: string;
  logoUrl: string;
  balance: number;
  minDue: number;
  dueDate: string;
  status: "paid" | "unpaid";
  interestRate: number;
  creditLimit: number;
};

export const stores: Store[] = [
  {
    id: "tfg",
    name: "TFG",
    color: "#3b82f6",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d0/TFG_Limited_Logo.svg/250px-TFG_Limited_Logo.svg.png",
    balance: 450,
    minDue: 150,
    dueDate: "25 June",
    status: "unpaid",
    interestRate: 21.0,
    creditLimit: 1200,
  },
  {
    id: "truworths",
    name: "Truworths",
    color: "#8b5cf6",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Truworths_Logo.jpg",
    balance: 500,
    minDue: 200,
    dueDate: "28 June",
    status: "unpaid",
    interestRate: 22.5,
    creditLimit: 1000,
  },
  {
    id: "ackermans",
    name: "Ackermans",
    color: "#14b8a6",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Ackermans_Logo.svg/250px-Ackermans_Logo.svg.png",
    balance: 250,
    minDue: 100,
    dueDate: "01 July",
    status: "paid",
    interestRate: 20.0,
    creditLimit: 800,
  },
];

const users: User[] = [];
const userAccounts = new Map<string, string[]>();

export const db = { users, stores, userAccounts };