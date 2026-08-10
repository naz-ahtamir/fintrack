-- ======================================================
-- FINTRACK - DATABASE QUERIES (8+ Query)
-- Semua query menggunakan snake_case (user_id, transaction_date)
-- ======================================================

-- 1. SELECT dengan Filter (Cari transaksi Expense di atas Rp 100.000)
SELECT * 
FROM "Transaction" 
WHERE type = 'EXPENSE' 
  AND amount > 100000;

-- 2. JOIN 3 Tabel (Transaksi + Akun + Kategori)
-- Menampilkan detail transaksi dengan nama akun dan kategori
SELECT 
  t.id, 
  t.amount, 
  t.description,
  a.name AS account_name, 
  c.name AS category_name
FROM "Transaction" t
JOIN "Account" a ON t.account_id = a.id
LEFT JOIN "Category" c ON t.category_id = c.id
ORDER BY t.transaction_date DESC;

-- 3. GROUP BY (Total Pengeluaran per Kategori)
SELECT 
  c.name AS category_name, 
  SUM(t.amount) AS total_spent
FROM "Transaction" t
JOIN "Category" c ON t.category_id = c.id
WHERE t.type = 'EXPENSE'
GROUP BY c.name
ORDER BY total_spent DESC;

-- 4. GROUP BY dengan DATE (Total Pemasukan per Bulan)
SELECT 
  DATE_TRUNC('month', t.transaction_date) AS month,
  SUM(t.amount) AS total_income
FROM "Transaction" t
WHERE t.type = 'INCOME'
GROUP BY month
ORDER BY month DESC;

-- 5. LEFT JOIN (Akun yang Tidak Pernah Dipakai Transaksi)
SELECT 
  a.id, 
  a.name AS account_name,
  a.balance
FROM "Account" a
LEFT JOIN "Transaction" t ON t.account_id = a.id
WHERE t.id IS NULL;

-- 6. Subquery (Transaksi di Atas Rata-rata Pengeluaran User)
SELECT *
FROM "Transaction" t1
WHERE t1.amount > (
  SELECT AVG(t2.amount) 
  FROM "Transaction" t2 
  WHERE t2.user_id = t1.user_id 
    AND t2.type = 'EXPENSE'
);

-- 7. Aggregasi GROUP BY (Total Saldo per User)
SELECT 
  u.id,
  u.name,
  SUM(a.balance) AS total_balance
FROM "User" u
JOIN "Account" a ON a.user_id = u.id
GROUP BY u.id, u.name
ORDER BY total_balance DESC;

-- 8. Filter dengan Date Range (Transaksi Bulan Januari 2026)
SELECT * 
FROM "Transaction"
WHERE transaction_date BETWEEN '2026-01-01' AND '2026-01-31'
ORDER BY transaction_date;