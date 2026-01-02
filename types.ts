
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface BudgetLimit {
  category: string;
  limit: number;
}

export interface AppState {
  transactions: Transaction[];
  goals: SavingsGoal[];
  limits: BudgetLimit[];
}
