# How to Run the Loan Tracker Application (Supabase-Only)

## Prerequisites

1. **Node.js 18+**
2. **npm/yarn/pnpm**
3. A **Supabase project** with access to SQL Editor

---

## Step 1: Configure Environment Variables

Create `.env.local` in the project root:

```properties
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

---

## Step 2: Apply Supabase Migrations

Run these SQL files in Supabase SQL Editor, in order:

1. `supabase/migrations/20260415_001_init_loan_tracker.sql`
2. `supabase/migrations/20260505_002_record_payment_atomic.sql`
3. `supabase/migrations/20260505_003_update_delete_payment_atomic.sql`

This creates tables, RLS policies, triggers, and payment RPC functions.

---

## Step 3: Run the Frontend

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open the shown local URL (commonly `http://localhost:5173`).

---

## Step 4: Verify Core Flows

1. Sign in (anonymous auth supported).
2. Add a contact.
3. Create a lend/borrow/group expense transaction.
4. Record a payment and refresh page (data should persist).
5. Update payment and verify remaining balance updates.
6. Delete payment and verify balance/instalment states recalculate.

---

## Payment Regression Checklist

- [ ] `addPayment` persists and survives refresh.
- [ ] `updatePayment` updates `payments`, `loan_entries`, and related `installments`.
- [ ] `deletePayment` restores `loan_entries.amount_remaining` and installment progress.
- [ ] Group-expense payment with `payeeId` persists correctly.
- [ ] Installment payment updates term `amount_paid`, `status`, and `paid_date`.
- [ ] No RLS errors while user accesses only own rows.

---

## Troubleshooting

**Supabase auth/session issues:**
- Check browser console and Supabase Auth settings (anonymous sign-in enabled if needed).

**Migration/RPC errors:**
- Re-run migration SQL in order and confirm functions exist:
  - `record_payment_atomic`
  - `update_payment_atomic`
  - `delete_payment_atomic`

**Frontend build issues:**
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

---

## Production Build

```bash
npm run build
npm run preview
```

---

## Need Help?

- Check browser console and Supabase logs.
- Verify `.env.local` keys are valid.
- Verify migrations were applied in correct order.

