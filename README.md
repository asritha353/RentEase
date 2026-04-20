# 🏠 RentEase — Rental Property Management System

A production-grade, multi-role rental property management web application for the Indian rental market.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand |
| Routing | React Router v6 |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (via Supabase or Railway) |
| ORM | Prisma |
| Authentication | Firebase Google OAuth 2.0 |
| File Uploads | Cloudinary |
| LLM Integration | Claude API (claude-sonnet-4-20250514) |
| PDF Generation | Puppeteer |
| Deployment | Vercel (frontend) + Railway (backend) |

## 📁 Project Structure

```
rentease/
├── client/                      # React frontend
├── server/                      # Express backend
├── .env.example                 # Environment variables template
└── docker-compose.yml           # Local PostgreSQL
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ (or Supabase/Railway account)
- Firebase project with Google Auth enabled
- Cloudinary account
- Anthropic API key

### 1. Clone and Install

```bash
git clone <repo-url>
cd rentease

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your actual values
```

### 3. Database Setup

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3001

## 👥 Demo Credentials

| Role | Email |
|---|---|
| Admin | admin@rentease.in |
| Owner 1 | ravi.owner@rentease.in |
| Owner 2 | priya.owner@rentease.in |
| Tenant 1 | ananya.tenant@rentease.in |
| Tenant 2 | rohit.tenant@rentease.in |

> Note: These accounts are seeded. Log in via Google OAuth with these emails.

## 🏗️ Architecture

```
Frontend (React + Vite)
        │ REST API
        ▼
Backend (Express.js)
   ├── PostgreSQL (Prisma)
   ├── Cloudinary (images)
   └── Claude API (agreements)
```

## 📦 Deployment

- **Frontend:** Deploy `client/` to Vercel
- **Backend:** Deploy `server/` to Railway
- **Database:** Use Railway PostgreSQL or Supabase

## 📚 API Documentation

Import `postman_collection.json` from the root into Postman for full API docs.
