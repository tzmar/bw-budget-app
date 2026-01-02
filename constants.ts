
export const INCOME_CATEGORIES = [
  'Salary',
  'Business',
  'Side Hustle',
  'Livestock/Farm',
  'Remittance',
  'Other'
];

export const EXPENSE_CATEGORIES = [
  'Rent',
  'Groceries',
  'Transport/Fuel',
  'Airtime/Data',
  'Electricity (BPC)',
  'Water (WUC)',
  'Education/School Fees',
  'Entertainment',
  'Health',
  'Loan Payment',
  'Other'
];

export const CURRENCY_SYMBOL = 'P';
export const CURRENCY_CODE = 'BWP';

export const INITIAL_LIMITS = EXPENSE_CATEGORIES.map(cat => ({
  category: cat,
  limit: 0
}));
