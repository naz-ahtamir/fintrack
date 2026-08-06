// src/schemas/transaction.ts
import { z } from 'zod'

export const TransactionSchema = z.discriminatedUnion('type', [
  // INCOME
  z.object({
    type: z.literal('INCOME'),
    accountId: z.number().positive('Account harus dipilih'),
    categoryId: z.number().positive('Kategori harus dipilih'),
    amount: z.string().regex(/^\d+(\.\d{1,4})?$/, 'Format amount tidak valid'),
    description: z.string().min(1).max(255),
    transactionDate: z.date(),
    recurrenceType: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional()
  }),
  // EXPENSE
  z.object({
    type: z.literal('EXPENSE'),
    accountId: z.number().positive('Account harus dipilih'),
    categoryId: z.number().positive('Kategori harus dipilih'),
    amount: z.string().regex(/^\d+(\.\d{1,4})?$/, 'Format amount tidak valid'),
    description: z.string().min(1).max(255),
    transactionDate: z.date(),
    recurrenceType: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional()
  }),
  // TRANSFER
  z.object({
    type: z.literal('TRANSFER'),
    fromAccountId: z.number().positive('Akun sumber harus dipilih'),
    toAccountId: z.number().positive('Akun tujuan harus dipilih'),
    amount: z.string().regex(/^\d+(\.\d{1,4})?$/, 'Format amount tidak valid'),
    description: z.string().optional(),
    transactionDate: z.date()
  })
])

export type Transaction = z.infer<typeof TransactionSchema>