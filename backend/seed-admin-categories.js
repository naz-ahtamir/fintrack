// Script to seed categories for all users via API
// Usage: node seed-admin-categories.js

const API_URL = 'https://fintrack-api-6mz4.onrender.com';

const USERS = [
  { email: 'admin@fintrack.com', password: 'Admin@2026#', name: 'Admin' },
  { email: 'moderator@fintrack.com', password: 'Mod@2026#', name: 'Moderator' },
  { email: 'user2@fintrack.com', password: 'User@2026#', name: 'User2' },
  { email: 'demo@fintrack.com', password: 'Demo@2026#', name: 'Demo' },
];

const categories = [
  { name: 'Salary', type: 'INCOME', color: '#22c55e', icon: '💰' },
  { name: 'Freelance', type: 'INCOME', color: '#3b82f6', icon: '💼' },
  { name: 'Investment', type: 'INCOME', color: '#8b5cf6', icon: '📈' },
  { name: 'Food', type: 'EXPENSE', color: '#ef4444', icon: '🍔' },
  { name: 'Transport', type: 'EXPENSE', color: '#f59e0b', icon: '🚗' },
  { name: 'Shopping', type: 'EXPENSE', color: '#ec4899', icon: '🛍️' },
  { name: 'Entertainment', type: 'EXPENSE', color: '#8b5cf6', icon: '🎮' },
  { name: 'Utilities', type: 'EXPENSE', color: '#06b6d4', icon: '💡' },
];

async function seedUserCategories(user) {
  try {
    console.log(`\n🔐 Processing ${user.name} (${user.email})...`);
    
    // 1. Login
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: user.password }),
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }
    
    const { token } = await loginRes.json();
    console.log('  ✅ Logged in');
    
    // 2. Check existing categories
    const existingRes = await fetch(`${API_URL}/api/categories`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    const existing = await existingRes.json();
    console.log(`  📋 Found ${existing.length} existing categories`);
    
    if (existing.length >= 8) {
      console.log('  ⏭️  Already has categories, skipping');
      return { user: user.name, status: 'skipped', count: existing.length };
    }
    
    // 3. Create categories
    console.log('  🏷️  Creating categories...');
    let created = 0;
    let failed = 0;
    
    for (const category of categories) {
      const res = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(category),
      });
      
      if (res.ok) {
        created++;
        console.log(`    ✅ ${category.name}`);
      } else {
        failed++;
        const error = await res.text();
        console.log(`    ❌ ${category.name}: ${error}`);
      }
    }
    
    return { user: user.name, status: 'completed', created, failed };
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { user: user.name, status: 'error', error: error.message };
  }
}

async function main() {
  console.log('🚀 Seeding categories for all users...\n');
  console.log('═══════════════════════════════════════');
  
  const results = [];
  
  for (const user of USERS) {
    const result = await seedUserCategories(user);
    results.push(result);
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('\n📊 Summary:');
  results.forEach(r => {
    if (r.status === 'completed') {
      console.log(`  ✅ ${r.user}: Created ${r.created} categories`);
    } else if (r.status === 'skipped') {
      console.log(`  ⏭️  ${r.user}: Already has ${r.count} categories`);
    } else {
      console.log(`  ❌ ${r.user}: ${r.error}`);
    }
  });
  
  console.log('\n✅ Done!');
}

main();
