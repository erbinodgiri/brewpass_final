# BrewPass ☕

Digital loyalty stamp cards for Nepal's coffee shops.
Multi-cafe platform with staff approval and plan management.

---

## Quick Start

```bash
npm install
cp .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

---

## Demo Accounts

| Shop | Email | Password | Plan |
|---|---|---|---|
| Cafe Piccolo | cafe@piccolo.com | demo1234 | Pro |
| Binod Cafe | binod@cafe.com | demo1234 | Basic |

**Admin panel:** http://localhost:3000/admin
**Admin PIN:** `brewpass2024`

---

## Pages

| Route | Who |
|---|---|
| `/` | Landing page |
| `/register` | New shop signup |
| `/login` | Shop login |
| `/scan/[shopId]` | Customers — request stamp, check card |
| `/dashboard` | Overview + analytics |
| `/dashboard/approvals` | Approve/reject stamp requests |
| `/dashboard/stamp` | Manual stamp (staff) |
| `/dashboard/customers` | Customer list + search |
| `/dashboard/settings` | Settings + QR code + plan info |
| `/admin` | Platform admin — manage all shops |

---

## Plan Management

Go to `/admin` → enter PIN → click **Manage** on any shop.

| Plan | Price | Customers |
|---|---|---|
| Free | NPR 0 | 50 max |
| Basic | NPR 1,500/mo | Unlimited |
| Pro | NPR 3,500/mo | Unlimited |

---

## Security

- No stamps without staff approval
- 10-minute cooldown blocks duplicate requests
- Free plan capped at 50 customers
- Suspended/expired shops cannot accept stamps

---

## For Mobile Testing

```bash
ipconfig getifaddr en0
npm run dev -- --hostname 0.0.0.0
# Update .env: NEXT_PUBLIC_APP_URL="http://YOUR_IP:3000"
# Regenerate QR in Settings
```

---

## Deploy to Production

1. Change `prisma/schema.prisma` provider to `postgresql`
2. Set up Neon or Supabase free PostgreSQL
3. Deploy to Vercel (free tier)
4. Add env vars in Vercel dashboard
5. Run `npx prisma db push` against prod DB

---

Built in Nepal 🇳🇵
