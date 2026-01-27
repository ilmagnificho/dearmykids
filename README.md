# DearMyKids

A premium AI service that transforms children's photos into hyper-realistic "Future Dream Career" portraits.

## 🛠 Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + Shadcn/UI
- **Backend:** Supabase (Auth, DB, Storage)
- **AI:** Replicate / Fal.ai

## 🚀 Getting Started

### 1. Environment Setup
Create a `.env.local` file in the root directory and add your keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
REPLICATE_API_TOKEN=your_replicate_token
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Visit http://localhost:3000

## 🗄️ Database Setup (Supabase)
Run the SQL queries in `supabase/schema.sql` in your Supabase SQL Editor to verify tables and policies.

## 📂 Project Structure
- `/app`: Pages and API routes
- `/components`: UI and feature components
- `/utils/supabase`: Supabase helper functions
- `/supabase`: SQL schema and migrations
