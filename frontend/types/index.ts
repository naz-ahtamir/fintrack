// types/index.ts
export interface User {
  id: number
  name: string
  email: string
  role: 'USER' | 'ADMIN' | 'MODERATOR'
  isActive: boolean
  createdAt: string
  updatedAt: string
  settings?: UserSetting
}

export interface UserSetting {
  id: number
  userId: number
  currency: string
  language: string
  timeZone: string
  dateFormat: string
  theme: string
  decimalPlaces: number
}

export interface Account {
  id: number
  userId: number
  accountTypeId: number
  name: string
  description?: string
  balance: string
  currency: string
  isActive: boolean
  lastReconciled?: string
  lastBalance?: string
  createdAt: string
  updatedAt: string
  accountType: AccountType
}

export interface AccountType {
  id: number
  name: 'CASH' | 'BANK' | 'EWALLET' | 'CREDIT_CARD' | 'INVESTMENT'
}

export interface Category {
  id: number
  userId: number
  name: string
  type: 'INCOME' | 'EXPENSE'
  description?: string
  icon?: string
  color?: string
  isActive: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: number
  userId: number
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  amount: string
  description?: string
  notes?: string
  accountId?: number
  fromAccountId?: number
  toAccountId?: number
  categoryId?: number
  transactionDate: string
  recurrenceType?: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  isReconciled: boolean
  createdAt: string
  updatedAt: string
  account?: Account
  fromAccount?: Account
  toAccount?: Account
  category?: Category
}

export interface Budget {
  id: number
  userId: number
  categoryId: number
  amount: string
  month: number
  year: number
  alertThreshold: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  category: Category
}

export interface Goal {
  id: number
  userId: number
  title: string
  description?: string
  category?: string
  targetAmount: string
  currentAmount: string
  startDate?: string
  targetDate?: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  priority: number
  isAutoCalculate: boolean
  createdAt: string
  updatedAt: string
}

// UI Component Props
export interface CardProps {
  children: React.ReactNode
  className?: string
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export interface DashboardStats {
  totalBalance: number
  monthlyIncome: number
  monthlyExpense: number
  budgetUsedPercentage: number
  activeAccounts: number
  pendingTransactions: number
}
