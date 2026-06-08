# Finora - Modern AI Smart Salary & Savings Assistant 🚀

Finora is a comprehensive personal finance micro-app engineered to manage available salaries, calculate daily safe spending limites, track automated micro-savings, detect forgotten recurring bills with Gemini AI, and track **Borrowed & Lent Money** with custom collection workflows.

Built specifically with a desktop-first precision, mobile-first responsive view utilizing React, Vite, Tailwind CSS, Express, and Neon PostgreSQL.

---

## 🌟 Core App Core Pillars & Features

1. **Daily Safe Spending Threholds**: Instantly calculates your available daily cash boundary based on remaining salary days and overhead payments to avoid end of month deficits.
2. **Borrowed Money Ledger (Owed To Me)**: Comprehensive dashboard to record loans given to friends/contacts (Name, Amount, Date, Due Date, and custom notes).
3. **Smart Debt Reminders**: Automatically prompts alerts on loans older than 14 days or past their due date, allowing quick full or partial recovery actions.
4. **Micro-Savings Jars**: Define shopping goals with deadlines; our algorithm adjusts required daily micro-deposits to purchase on-time without borrowing.
5. **Forgotten Bill Scanner**: Automatically monitors spent logs periodically to highlight potential unrecorded recurring subscription dues.
6. **Bilingual Support (AR/EN)**: Native Cairo typography for standard Arabic and sleek Inter UI fonts for English.
7. **PWA Standalone Shell**: Built-in service worker caching, instant app shell, and fully compatible with installation as a home screen icon.
8. **Hybrid Persistence Architecture**: Secure standalone file database in development mode, switching seamlessly to cloud-hosted Neon PostgreSQL syncing protocols once credentials are provided.

---

## 🛠️ PostgreSQL, Neon, GitHub, and Render Setup

Finora is designed to be fully deployable with zero production friction. Follow these variables to wire your databases.

### 1. Environment Config Requirements

Introduce these keys in your deployment platform (e.g. Render, GitHub Secrets, or local `.env` file):

```env
# Server Port (Defaults to 3000 in AI Studio and Cloud Run containers)
PORT=3000

# Production vs Development Toggle
NODE_ENV=production

# Gemini AI Key for budgeting insights and Chat helper
GEMINI_API_KEY=your-gemini-api-key

# Neon PostgreSQL connection string (For Prisma & backup)
DATABASE_URL=postgresql://user:password@neon-hostname/dbname?sslmode=require
```

### 2. Prisma Database Migration

Before building is initiated or during deploy pipelines:

```bash
# Install development dependencies
npm install prisma @prisma/client --save-dev

# Generate the Prisma Client
npx prisma generate

# Execute Schema migration on Neon PostgreSQL cluster
npx prisma db push
```

### 3. Deploying to Render

Use these build and start commands in your Render dashboard:

- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm run start`

---

## 🎨 Creative app Signature & Credits

Developed and Created with absolute commitment to UX standards by **Ahmed Fox**.
Designed in a cosmic slate dark canvas framework. Title, Splash, and details have been calibrated to Finora.

*All mock data has been cleared out. Fresh installations launch as a pristine slate ready for real-time asset calibration.*
