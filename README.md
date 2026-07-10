# Notice Board

A full-stack notice board application built as a Reno Platforms engineering assignment. Supports creating, viewing, editing, and deleting notices across three categories — Exam, Event, and General — with image upload support via Cloudinary.

**Live demo:** [https://notice-board-iota-dun.vercel.app](https://notice-board-iota-dun.vercel.app)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (Pages Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| ORM | Prisma 7 |
| Database | TiDB Serverless (MySQL-compatible) |
| Image Storage | Cloudinary (unsigned upload) |
| Deployment | Vercel |

---

## Running Locally

### Prerequisites

- Node.js 18+
- A [TiDB Serverless](https://tidbcloud.com) account (free tier is sufficient)
- A [Cloudinary](https://cloudinary.com) account (free tier is sufficient)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/notice-board.git
cd notice-board
```

### 2. Install dependencies

```bash
npm install
```

`postinstall` automatically runs `prisma generate`, so the Prisma client is built immediately after install.

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set the following:

```env
# TiDB Serverless connection string
# Get this from: TiDB Cloud → Your Cluster → Connect → Prisma
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE?sslaccept=strict"

# Cloudinary — from: Cloudinary Dashboard → Settings → Upload → Upload Presets
# The preset must be set to "Unsigned"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
```

### 4. Run the database migration

```bash
npx prisma migrate dev --name init
```

This creates the `Notice` table in your TiDB database. You can verify it in the TiDB Cloud console.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## What I Would Improve With More Time

Time management. I tend to over-optimize things and chase perfection — whether it is a UI detail, an architectural decision, or the way a function is written. This habit often means I spend far more time on a single thing than it actually warrants, and I am actively working on recognising that point and moving on. Shipping something good and iterating is almost always better than holding back for something perfect.

---

## AI Usage

AI was used during this project primarily for styling and layout — getting the card design, gradients, modal layout, and responsive spacing to look polished faster than doing it all by hand. Outside of UI, it occasionally helped with small things like quickly looking up the correct Prisma 7 config syntax or catching a minor bug in the payload logic. The core structure, API design, data flow, and all business logic were written and reasoned through independently. Overall, AI acted more like a fast reference tool than a code generator.
