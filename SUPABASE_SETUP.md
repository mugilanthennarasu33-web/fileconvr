# fileconvr — Supabase Database & Google OAuth Setup Guide

This guide provides step-by-step instructions to configure a live **Supabase** project, **Google Cloud OAuth 2.0 Credentials**, and **Supabase PostgreSQL** for **fileconvr**.

---

## Architecture Overview

```
┌─────────────────────────────────┐
│     React + Vite Frontend       │
│  (Supabase JS Client + OAuth)   │
└───────────────┬─────────────────┘
                │ 1. Redirect to Google / Sign-In
                │ 2. Receive Supabase Session Token
                ▼
┌─────────────────────────────────┐
│         Supabase Auth           │  <───>  Google Cloud OAuth
│ (Identity, Session Management)  │         (Client ID & Secret)
└───────────────┬─────────────────┘
                │ 3. Authorization: Bearer <access_token>
                ▼
┌─────────────────────────────────┐
│    Express + TypeScript API     │
│ (verifySupabaseToken Middleware)│
└───────────────┬─────────────────┘
                │ 4. Prisma ORM / Direct Pooler (DATABASE_URL)
                ▼
┌─────────────────────────────────┐
│      Supabase PostgreSQL        │
│   (Row Level Security + Data)   │
└─────────────────────────────────┘
```

---

## Step 1: Create a Supabase Project

1. Navigate to [Supabase](https://supabase.com/) and sign in to your dashboard.
2. Click **New Project** and select your organization.
3. Enter your project details:
   - **Name**: `fileconvr`
   - **Database Password**: Set a strong, secure password (save this securely; you will need it for the database connection string).
   - **Region**: Choose the region closest to your backend hosting or users.
4. Click **Create new project** and wait for deployment to complete (~1-2 minutes).

---

## Step 2: Retrieve API URL & Publishable Key

1. In your Supabase dashboard, navigate to **Project Settings** > **API**.
2. Locate the following values:
   - **Project URL**: e.g. `https://xyzcompany.supabase.co`
   - **Publishable Key (`anon` / `public`)**: e.g. `eyJhbGciOiJIUzI1NiIsInR5cCI6...`
   - **JWT Secret**: Found under **Project Settings** > **API** > **JWT Settings**. (Used by backend for fast cryptographic token verification).
   - **Service Role Key (secret)**: Only needed for backend administrative operations; **NEVER** expose this to frontend code or commit to Git.

---

## Step 3: Retrieve the PostgreSQL Connection String

1. In your Supabase project dashboard, click the **Connect** button at the top header (or navigate to **Project Settings** > **Database**).
2. Select **Prisma** or **Transaction Pooler** (recommended for serverless or high-concurrency Node.js Express environments):
   - **Connection Mode**: Session mode (port 5432) or Transaction mode (port 6543 with `?pgbouncer=true`).
3. The connection string template looks like:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
   ```
4. Replace `[YOUR-PASSWORD]` with your actual Supabase database password and ensure `sslmode=require` is present.

---

## Step 4: Configure Google OAuth in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Google Cloud project or select an existing one.
3. Navigate to **APIs & Services** > **OAuth consent screen**:
   - Choose **External** user type and click **Create**.
   - Fill in:
     - **App name**: `fileconvr`
     - **User support email**: Your support email
     - **Developer contact information**: Your email
   - Under **Scopes**, add `openid`, `.../auth/userinfo.email`, and `.../auth/userinfo.profile`.
   - Save and continue.
4. Navigate to **APIs & Services** > **Credentials**:
   - Click **+ Create Credentials** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `fileconvr-web`.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (Local frontend Vite dev server)
     - `https://your-production-domain.com` (Your production domain)
   - **Authorized redirect URIs**:
     - In your Supabase dashboard, go to **Authentication** > **Providers** > **Google**.
     - Copy the **Callback URL (for OAuth)** provided by Supabase:
       `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
     - Paste this exact URI into Google Cloud's **Authorized redirect URIs** list.
   - Click **Create**.
   - Note your **Client ID** and **Client Secret**.

---

## Step 5: Enable Google Provider in Supabase Auth

1. In Supabase Dashboard, go to **Authentication** > **Providers** > **Google**.
2. Toggle **Google Enabled** to **ON**.
3. Paste the **Client ID** and **Client Secret** obtained from Google Cloud Console.
4. Click **Save**.

---

## Step 6: Configure URL Configuration & Redirect Allowlists in Supabase

1. In Supabase Dashboard, navigate to **Authentication** > **URL Configuration**.
2. Set **Site URL**:
   - For local development: `http://localhost:5173`
   - For production: `https://your-production-domain.com`
3. Under **Redirect URLs**, add the allowed redirect patterns:
   - `http://localhost:5173/*`
   - `http://localhost:5173/auth/callback`
   - `https://your-production-domain.com/*`
   - `https://your-production-domain.com/auth/callback`
4. Click **Save**.

---

## Step 7: Update Environment Variables

### Frontend (`frontend/.env`)

Create or update `frontend/.env`:

```env
# Supabase Client Configuration
VITE_SUPABASE_URL=https://<YOUR-PROJECT-REF>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...<YOUR-PUBLISHABLE-KEY>

# Backend Express API URL
VITE_API_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)

Create or update `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Client URL (for CORS and redirects)
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173

# Supabase Auth Configuration
SUPABASE_URL=https://<YOUR-PROJECT-REF>.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...<YOUR-PUBLISHABLE-KEY>
SUPABASE_JWT_SECRET=<YOUR-SUPABASE-JWT-SECRET>
# Optional server-only secret:
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Supabase PostgreSQL Connection String
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
```

---

## Step 8: Apply Database Migrations and RLS Policies

Run the following from the `backend/` directory:

1. **Deploy Prisma Migrations to Supabase PostgreSQL**:
   ```bash
   npx prisma migrate deploy
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Apply Row Level Security (RLS) Policies**:
   - Open your Supabase Dashboard and go to the **SQL Editor**.
   - Copy the contents of `backend/prisma/rls_policies.sql`.
   - Paste into the SQL query box and click **Run**.
   - This enables RLS on `"User"`, `"ProcessingJob"`, `"UsageRecord"`, `"Subscription"`, and `"Session"`, and adds security triggers preventing unauthorized tier escalation.

---

## Step 9: Verify Google Sign-In & Data Persistence

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```
2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.
4. Click **Sign In** or **Register** in the header.
5. Click **Continue with Google**.
6. Select your Google account and grant permissions.
7. You should be redirected back through `/auth/callback`, your avatar and name will appear in the top-right header, and you will land on your personal **Dashboard**.
8. Execute a PDF operation (e.g., Merge or Split).
9. Check your Supabase Table Editor under `"ProcessingJob"` and `"User"` to confirm the records were persisted with your Supabase Auth user UUID!
