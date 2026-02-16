# Form Genie — Full-Stack SaaS Application

Smart Google Form Automation Platform with Authentication, Credit System, and Admin Dashboard.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Gmail account with App Password

### 1. Setup Environment

```bash
cp .env.example .env
# Fill in your Supabase URL, keys, JWT secret, and SMTP credentials
```

### 2. Setup Database

Run the SQL schema in your Supabase SQL Editor:
```bash
# Copy contents of supabase/schema.sql into Supabase SQL Editor and run
```

Create Storage Buckets in Supabase Dashboard:
- `payment-screenshots` (private)
- `static-assets` (public) — Upload your payment QR code as `payment-qr.png`

### 3. Install & Run Server

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:5000`

### 4. Install & Run Client

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:3000`

---

## 📁 Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API & form services
│   │   ├── contexts/          # Auth context
│   │   ├── App.tsx            # Router
│   │   └── types.ts           # TypeScript types
│   ├── index.html
│   └── vite.config.ts
├── server/                    # Express backend
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth & RBAC
│   │   ├── services/          # Email service
│   │   └── config/            # Supabase client
│   └── package.json
├── supabase/
│   └── schema.sql             # Database schema
└── .env.example               # Environment template
```

---

## 📡 API Documentation

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user (multipart form) | No |
| POST | `/api/auth/login` | Login and get JWT | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Admin Endpoints (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users (optional `?status=pending`) |
| GET | `/api/admin/users/:id` | Get user details with transactions |
| PUT | `/api/admin/users/:id/approve` | Approve user + send email |
| PUT | `/api/admin/users/:id/reject` | Reject user + send email |
| PUT | `/api/admin/users/:id/credits` | Add/reduce credits `{amount, action}` |
| GET | `/api/admin/users/:id/screenshot` | Get payment screenshot URL |

### Credit Endpoints (Approved Users)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/credits/balance` | Get credit balance |
| POST | `/api/credits/deduct` | Deduct credits `{count}` |
| GET | `/api/credits/logs` | Get credit history |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/qr-code` | Get payment QR code URL |

---

## 🔐 Default Admin

```
Username: admin
Password: admin
```

⚠️ Change these immediately in production!

---

## 🏗 Production Build

```bash
# Client
cd client && npm run build

# Server
cd server && npm run build && npm start
```

---

## 📋 Plans

| Plan | Submissions | Price |
|------|-------------|-------|
| Starter | 150 | ₹100 |
| Pro | 300 | ₹180 |
| Executive | 500 | ₹300 |
