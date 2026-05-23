# Zonke

A South African retail store-card aggregation dashboard that helps users manage multiple store accounts in one unified interface.

## Overview

Zonke ("all" in isiZulu) consolidates your South African retail store cards — TFG, Truworths, Woolworths, Ackermans, and more — into a single dashboard. Track balances, receive payment reminders via WhatsApp, and get AI-powered insights to optimize your debt repayment strategy.

## Features

### Dashboard
- **Account Overview**: View total debt, amounts due this month, and upcoming payment dates
- **Smart Pay Optimizer**: AI-powered recommendations for payment prioritization
- **Debt Distribution Chart**: Visual breakdown of debt across all linked accounts
- **Quick Actions**: Pay individual accounts directly from the dashboard

### Link Accounts
- **3-Step Wizard**: Guided flow to securely connect store cards
- **Supported Retailers**: TFG, Truworths, Woolworths, Ackermans, Mr Price, Edgars
- **Secure Credential Entry**: Bank-level encryption indicators and security badges

### Notifications
- **WhatsApp Integration**: Opt-in for payment reminders via WhatsApp
- **Customizable Alerts**: Configure payday summaries, payment reminders, and credit limit warnings
- **Phone Verification**: Secure verification flow for WhatsApp notifications

### Financial Insights
- **Credit Utilization**: Visual indicator of credit usage across all accounts
- **Debt Paydown Simulator**: Interactive tool to model extra payment scenarios
- **Spending Trends**: 6-month spending history with category breakdown

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Charts**: Recharts
- **Typography**: DM Sans (body), Outfit (headings)

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Main app entry point
│   └── globals.css         # Theme tokens and global styles
├── components/
│   └── zonke/
│       ├── sidebar.tsx     # Navigation sidebar
│       ├── dashboard.tsx   # Main dashboard view
│       ├── link-accounts.tsx   # Account linking wizard
│       ├── notifications.tsx   # WhatsApp & alert settings
│       └── insights.tsx    # Financial insights & simulator
└── lib/
    └── mock-data.ts        # Sample account data
```

## Design System

### Colors
- **Background**: Deep charcoal (#0f1117)
- **Surface**: Elevated cards (#1a1d24)
- **Primary**: Warm gold/amber (#f59e0b)
- **Success**: Emerald green (#10b981)
- **Destructive**: Rose red (#ef4444)

### Currency
All monetary values are displayed in South African Rand (R).

## License

MIT
