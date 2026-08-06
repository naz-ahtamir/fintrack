// frontend/components/StatsCards.tsx
'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

export default function StatsCards() {
  const [stats, setStats] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get current month stats
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
        
        const response = await apiClient.get(`/transactions/stats?startDate=${startDate}&endDate=${endDate}`)
        setStats(response.data)
      } catch (error) {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Balance */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Balance</p>
            <p className="text-3xl font-bold mt-2">
              IDR {stats.balance.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* This Month Income */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">This Month Income</p>
            <p className="text-3xl font-bold mt-2">
              IDR {stats.income.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </div>
        </div>
      </div>

      {/* This Month Expenses */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm font-medium">This Month Expenses</p>
            <p className="text-3xl font-bold mt-2">
              IDR {stats.expenses.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
