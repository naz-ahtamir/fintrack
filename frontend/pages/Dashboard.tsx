import { useTransactions } from '../lib/hooks/useTransactions';
import { useAccounts } from '../lib/hooks/useAccounts';
import { useState } from 'react';
import { TransactionModal } from '../components/TransactionModal';

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: {
    name: string;
  };
  account: {
    name: string;
  };
}

export function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch real data from API
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: accounts, isLoading: accLoading } = useAccounts();

  if (txLoading || accLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Accounts Summary */}
      <section>
        <h2>Your Accounts</h2>
        <div className="accounts-grid">
          {(accounts as Account[])?.map((account) => (
            <div key={account.id} className="account-card">
              <h3>{account.name}</h3>
              <p>Balance: {account.balance} {account.currency}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Transactions List */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>Recent Transactions</h2>
          <button onClick={() => setIsModalOpen(true)}>
            + Add Transaction
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Account</th>
            </tr>
          </thead>
          <tbody>
            {(transactions as Transaction[])?.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
                <td>{tx.description}</td>
                <td>{tx.category.name}</td>
                <td>{tx.amount}</td>
                <td>{tx.account.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Modal for adding transaction */}
      <TransactionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}