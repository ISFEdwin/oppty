# Ø Oppty — Opportunity Cost Financial Decision Tool

> *Move budgeting from a reactive task to a proactive decision-making weapon.*

Oppty (short for **Opportunity Cost**) uses **Behavioural Economics** to counteract "present bias" — our natural tendency to overvalue immediate rewards over long-term gains. Every price tag is translated into three **True Cost** dimensions before you decide to buy.

---

## The Rational Multiplier — Three Dimensions of True Cost

### ⬡ Dimension 1 — Labour Hours
> "This laptop costs **62 hours of your life**, not $1,500."

$$\text{Cost}_{time} = \frac{\text{Price}}{\text{Hourly Rate}_{net}}$$

### ◈ Dimension 2 — Future Value
> "Your daily $5.50 coffee is a **$38,000+ hole** in your retirement fund over 30 years."

$$FV = P \times (1 + r)^n$$

### ◇ Dimension 3 — Utility Swap
> "That $600 jacket is equivalent to **4 round-trip flights to Tokyo**. Are you sure?"

---

## Features

| Feature | Description |
|---|---|
| **Rationality Report** | Full True Cost analysis for any purchase |
| **Anti-Impulse Vault** | 48-hour cooling-off period for high-value items |
| **Subscription Auditor** | Calculates cost-per-hour, flags zombie services |
| **Goal Tracker** | Visual progress toward Big Goals with watercolour landscape |
| **Chrome Extension** | Real-time price overlay on Amazon, Best Buy, Apple, Walmart & more |

---

## Project Structure

```
oppty/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── index.js          # Server entry point
│   │   ├── routes/
│   │   │   ├── analysis.js   # Rationality Report endpoint
│   │   │   ├── subscriptions.js
│   │   │   ├── vault.js      # Anti-Impulse Vault
│   │   │   ├── goals.js
│   │   │   └── users.js
│   │   ├── services/
│   │   │   └── financialCalculator.js  # Core calculation logic
│   │   └── db/
│   │       └── schema.sql    # PostgreSQL schema
│   └── tests/
│       └── financialCalculator.test.js
│
├── frontend/                 # React web app (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── RationalityReport.jsx
│   │   │   ├── SubscriptionAuditor.jsx
│   │   │   ├── AntiImpulseVault.jsx
│   │   │   └── GoalTracker.jsx
│   │   ├── utils/
│   │   │   └── financialCalculator.js  # Client-side calculations
│   │   └── styles/
│   │       └── index.css     # Mechanical-Technical dark-mode theme
│   └── src/__tests__/
│       └── financialCalculator.test.js
│
└── extension/                # Chrome Extension (Manifest V3)
    ├── manifest.json
    ├── content.js            # Price overlay content script
    ├── popup.html            # Extension popup UI
    └── popup.js
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- (Optional) PostgreSQL >= 14 for persistent data

### 1. Backend

```bash
cd backend
npm install
npm start          # API server on http://localhost:4000
```

For development with auto-reload:
```bash
npm run dev
```

**Database setup** (optional — MVP uses in-memory store):
```bash
psql -U postgres -c "CREATE DATABASE oppty;"
psql -U postgres -d oppty -f src/db/schema.sql
```

Set `DATABASE_URL=postgresql://postgres:password@localhost:5432/oppty` in `backend/.env`.

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/analysis/report` | Generate a Rationality Report |
| `POST` | `/api/analysis/recurring` | Model recurring daily cost |
| `GET/POST` | `/api/subscriptions` | Subscription CRUD |
| `PUT` | `/api/subscriptions/:id/usage` | Update hours used + audit |
| `GET/POST` | `/api/vault` | Anti-Impulse Vault CRUD |
| `PUT` | `/api/vault/:id/decide` | Record buy/skip decision |
| `GET/POST` | `/api/goals` | Financial goals CRUD |
| `PUT` | `/api/goals/:id/progress` | Update saved amount |
| `POST/PUT` | `/api/users` | User profile |

**Example — Rationality Report:**
```bash
curl -X POST http://localhost:4000/api/analysis/report \
  -H "Content-Type: application/json" \
  -d '{"price": 1500, "hourlyRateNet": 24, "years": 10, "itemName": "MacBook Pro"}'
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # Dev server on http://localhost:3000
```

The frontend proxies all `/api` requests to `http://localhost:4000` automatically.

Build for production:
```bash
npm run build
npm run preview
```

### 3. Chrome Extension

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/` directory

The extension will automatically overlay prices on Amazon, Best Buy, Apple, Walmart, eBay, Etsy, and Target with True Cost information.

---

## Running Tests

### Backend (Jest)
```bash
cd backend && npm test
```

### Frontend (Vitest)
```bash
cd frontend && npm test
```

---

## Technical Architecture

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | Single-page app with dark "Mechanical-Technical" UI |
| **Backend** | Node.js + Express | Financial logic & REST API |
| **Database** | PostgreSQL | Persistent user data, goals, vault items |
| **Extension** | Chrome Manifest V3 | Real-time DOM price overlay |
| **Integrations** | Plaid API (planned) | Real-time income & spending sync |

---

## Monetisation Strategy

1. **Freemium Model** — Core Rationality Report is free. Anti-Impulse Vault and Subscription Auditor are premium features ($4.99/month).

2. **B2B Licensing** — White-label the engine for banks' "Financial Wellness" programmes to reduce credit card defaults. Banks pay a per-MAU fee.

3. **Affiliate Re-direction** — When a user decides to *skip* a purchase, Oppty facilitates redirecting the money to a high-yield savings account or ETF partner. Oppty earns a referral fee on the AUM — aligned incentives, not push-to-buy commissions.

---

## Privacy & Data Architecture

Oppty is designed with **privacy-first principles**:

- **Local-first computation**: All financial calculations run client-side in the browser and extension. No purchase data is sent to any server by default.
- **E2E encrypted cloud sync** (planned): User profiles and goals can optionally be synced via an encrypted backend — users hold their own encryption keys.
- **No tracking**: The extension does not report which sites you visit or what prices you viewed.
- **Plaid integration** (optional): If bank sync is enabled, tokens are stored encrypted per user and never shared.

---

## UX Design Philosophy

The UI deliberately avoids "soft/bubbly" consumer app tropes. The aesthetic is **"Financial Cockpit"**:

- **Dark mode** with sharp lines and monospace (`JetBrains Mono`) data readouts
- **Schematic-style** data visualisations — dashed dividers, bordered dimension cards
- **Watercolour progress landscape** on Goal cards — starts as a desaturated sketch and becomes vibrant and detailed as savings progress increases

---

## Market Validation

### Problem
Most budgeting apps (Mint, YNAB, Personal Capital) are **reactive** — they show you what you already spent. None translate purchases into their true behavioural cost *at the moment of decision*.

### Opportunity
- The global personal finance software market is valued at **$1.57B (2023)** and growing at **5.7% CAGR**.
- 70% of Americans live paycheck-to-paycheck, driven by impulse spending and poor long-term thinking.
- Behavioural economics interventions (loss aversion framing, cooling-off periods) have been shown in academic literature to **reduce impulse purchases by 20-40%**.

### Differentiation
| Feature | Oppty | YNAB | Mint | NerdWallet |
|---|---|---|---|---|
| Labour-hour translation | Yes | No | No | No |
| Future-value overlay | Yes | No | No | No |
| Anti-Impulse Vault | Yes | No | No | No |
| Browser extension overlay | Yes | No | No | No |
| Subscription utilisation audit | Yes | Partial | Yes | No |
| B2B bank licensing | Yes | No | No | No |

---

*Built with Behavioural Economics, not just spreadsheets.*