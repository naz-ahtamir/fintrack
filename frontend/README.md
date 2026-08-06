# FinTrack - Premium Personal Finance Management

A modern, production-ready financial dashboard built with Next.js 16, inspired by premium fintech SaaS products like Stripe, Mercury, Ramp, and Brex.

![FinTrack Dashboard](./public/preview.png)

## ✨ Features

### Core Functionality
- 📊 **Dashboard** - Comprehensive financial overview with real-time stats
- 💰 **Transactions** - Track income, expenses, and transfers
- 🏦 **Accounts** - Manage multiple financial accounts
- 🏷️ **Categories** - Organize transactions with custom categories
- 💵 **Budgets** - Set and monitor spending limits
- 🎯 **Financial Goals** - Track progress towards savings objectives
- 📈 **Reports** - Detailed financial analytics and insights
- 👤 **Profile & Settings** - User account management

### Design & UX
- 🎨 **Premium Design** - Clean, professional fintech aesthetics
- 🌓 **Dark Mode** - Full dark mode support with smooth transitions
- 📱 **Responsive** - Fully responsive design (mobile, tablet, desktop)
- ⚡ **Smooth Animations** - Subtle micro-interactions with Framer Motion
- 🎯 **Accessible** - WCAG 2.1 AA compliant
- 🚀 **Fast** - Optimized performance and loading times

### Technical
- ⚛️ **Next.js 16** - Latest App Router with server components
- 🔷 **TypeScript** - Type-safe development
- 🎨 **Tailwind CSS 4** - Utility-first styling
- 📊 **Recharts** - Beautiful, responsive charts
- 🎭 **Framer Motion** - Smooth animations
- 🔍 **React Query** - Efficient data fetching and caching
- 🗃️ **Zustand** - Lightweight state management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd fintrack-api/frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and configure your backend API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. **Open your browser**
```
http://localhost:3001
```

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js 16 App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page (redirects to login)
│   ├── login/                   # Authentication
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── dashboard/               # Main dashboard
│   │   └── page.tsx
│   ├── transactions/            # Transaction management
│   │   └── page.tsx
│   ├── accounts/                # Account management
│   │   └── page.tsx
│   ├── categories/              # Category management
│   │   └── page.tsx
│   ├── budgets/                 # Budget tracking
│   │   └── page.tsx
│   ├── goals/                   # Financial goals
│   │   └── page.tsx
│   ├── reports/                 # Reports and analytics
│   │   └── page.tsx
│   ├── profile/                 # User profile
│   │   └── page.tsx
│   └── settings/                # App settings
│       └── page.tsx
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx           # Premium button component
│   │   ├── Card.tsx             # Card with variants
│   │   ├── Input.tsx            # Form input
│   │   ├── Badge.tsx            # Status badges
│   │   ├── Select.tsx           # Dropdown select
│   │   ├── Table.tsx            # Data table
│   │   ├── Alert.tsx            # Alert messages
│   │   ├── Skeleton.tsx         # Loading skeletons
│   │   └── EmptyState.tsx       # Empty state component
│   ├── layout/                  # Layout components
│   │   ├── Sidebar.tsx          # Collapsible sidebar navigation
│   │   ├── Header.tsx           # Top header with search and user menu
│   │   └── DashboardLayout.tsx  # Main layout wrapper
│   └── dashboard/               # Dashboard-specific components
│       ├── StatCard.tsx         # Stat display cards
│       ├── CashFlowChart.tsx    # Cash flow visualization
│       ├── ExpenseByCategoryChart.tsx
│       ├── RecentTransactions.tsx
│       ├── BudgetProgress.tsx
│       └── FinancialGoals.tsx
├── lib/
│   ├── design-system.ts         # Design tokens and theme
│   ├── utils.ts                 # Utility functions
│   ├── api-client.ts            # API client configuration
│   ├── providers/               # React context providers
│   │   ├── ThemeProvider.tsx    # Dark mode support
│   │   └── QueryProvider.tsx    # React Query setup
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTransactions.ts
│   │   ├── useAccounts.ts
│   │   └── useCategories.ts
│   └── store/                   # State management
│       └── auth.store.ts        # Authentication state
├── public/                      # Static assets
├── styles/
│   └── globals.css              # Global styles and CSS variables
├── types/                       # TypeScript types
│   └── index.ts
├── .env.local                   # Environment variables (create this)
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── DESIGN_SYSTEM.md             # Design system documentation
└── README.md                    # This file
```

## 🎨 Design System

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for comprehensive design guidelines including:
- Color palette
- Typography
- Spacing system
- Component library
- Animation patterns
- Accessibility guidelines

## 🔧 Configuration

### API Integration

Update `lib/api-client.ts` to configure your backend API:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

### Theme Customization

Modify design tokens in `lib/design-system.ts`:

```typescript
export const designSystem = {
  colors: {
    brand: { ... },
    neutral: { ... },
    // ...
  },
  typography: { ... },
  spacing: { ... },
};
```

### Component Customization

All components accept standard props and can be styled with Tailwind classes:

```typescript
<Button
  variant="primary"
  size="lg"
  className="custom-class"
  leftIcon={<Icon />}
>
  Click me
</Button>
```

## 📱 Pages

### Authentication
- **Login** (`/login`) - User sign in with email/password
- **Register** (`/register`) - New user registration

### Main Application
- **Dashboard** (`/dashboard`) - Financial overview with stats, charts, and quick actions
- **Transactions** (`/transactions`) - View, filter, and manage all transactions
- **Accounts** (`/accounts`) - Manage bank accounts, credit cards, and investments
- **Categories** (`/categories`) - Create and organize transaction categories
- **Budgets** (`/budgets`) - Set spending limits and track progress
- **Goals** (`/goals`) - Define and monitor financial goals
- **Reports** (`/reports`) - View detailed financial reports and analytics
- **Profile** (`/profile`) - User profile and preferences
- **Settings** (`/settings`) - Application settings

## 🎯 Key Components

### StatCard
Display key financial metrics with icons and trends:
```typescript
<StatCard
  title="Total Balance"
  value={45678.90}
  change={8.2}
  changeLabel="vs last month"
  icon={Wallet}
  iconColor="text-blue-600"
  trend="up"
/>
```

### CashFlowChart
Visualize income vs expenses over time:
```typescript
<CashFlowChart
  data={[
    { month: 'Jan', income: 12000, expense: 8000 },
    // ...
  ]}
/>
```

### RecentTransactions
Show latest transaction activity:
```typescript
<RecentTransactions
  transactions={[
    {
      id: '1',
      description: 'Salary',
      amount: 5000,
      type: 'income',
      category: { name: 'Salary', color: '#22c55e' },
      // ...
    },
  ]}
/>
```

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Adding a New Page

1. Create a new folder in `app/` directory
2. Add `page.tsx` file
3. Use DashboardLayout wrapper:

```typescript
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function MyPage() {
  return (
    <DashboardLayout>
      {/* Your content */}
    </DashboardLayout>
  );
}
```

4. Add navigation link in `components/layout/Sidebar.tsx`

### Creating a New Component

1. Create component file in appropriate directory
2. Follow the design system guidelines
3. Export from index file if creating a component library
4. Add proper TypeScript types

## 🎨 Styling

### Tailwind CSS
Utility-first CSS framework with custom configuration:

```typescript
<div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm">
  Content
</div>
```

### Custom CSS Variables
Access design tokens via CSS variables:

```css
.custom-class {
  background: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
}
```

### Dark Mode
Automatic dark mode support using class strategy:

```typescript
<div className="bg-white dark:bg-neutral-900">
  Adapts to theme
</div>
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

The build output will be optimized for:
- Minimal bundle size
- Fast page loads
- SEO optimization
- Static asset optimization

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment Variables
Configure these in your deployment platform:
- `NEXT_PUBLIC_API_URL` - Backend API URL

## 🔒 Security

- All API requests include authentication tokens
- CSRF protection enabled
- XSS protection via React
- Secure cookie handling
- Environment variables for sensitive data

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review the design system guide

## 🙏 Acknowledgments

Design inspiration from:
- [Stripe](https://stripe.com)
- [Mercury](https://mercury.com)
- [Ramp](https://ramp.com)
- [Brex](https://brex.com)

Built with:
- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org)
- [Lucide Icons](https://lucide.dev)

---

Made with ❤️ for better financial management
