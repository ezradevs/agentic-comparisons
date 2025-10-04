# Chess Club Portal - Setup Guide

This guide will walk you through setting up the Chess Club Admin Portal from scratch.

## Quick Start

If you just want to get the app running quickly:

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Generate Prisma Client and create database
npx prisma generate
npx prisma db push

# 3. Seed the database with sample data
npm run db:seed

# 4. Start the development server
npm run dev
```

Then open http://localhost:3000 and login with:
- **Email**: admin@chessclub.com
- **Password**: admin123

## Detailed Setup Instructions

### Step 1: Verify Prerequisites

Make sure you have:
- Node.js 18 or higher (`node --version`)
- npm 9 or higher (`npm --version`)

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- Prisma ORM
- NextAuth.js
- Tailwind CSS
- TypeScript
- And all other dependencies

### Step 3: Environment Configuration

The `.env` file is already set up with default values:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**For Production**: Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Step 4: Database Setup

The app uses SQLite by default, which requires no external database server.

**Generate Prisma Client**:
```bash
npx prisma generate
```

**Create the database schema**:
```bash
npx prisma db push
```

This will create a `dev.db` file in the `prisma` directory.

### Step 5: Seed Sample Data

Populate the database with sample data:

```bash
npm run db:seed
```

This creates:
- 1 admin user
- 6 sample members
- 3 tournaments
- 4 events
- 5 payment records

### Step 6: Start the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Step 7: Login

Use these credentials to access the admin portal:
- **Email**: admin@chessclub.com
- **Password**: admin123

## Database Management

### View Database with Prisma Studio

Open a visual database editor:
```bash
npm run db:studio
```

This opens Prisma Studio at http://localhost:5555

### Reset Database

If you need to start fresh:

```bash
# Delete the database
rm prisma/dev.db

# Recreate and seed
npx prisma db push
npm run db:seed
```

### Update Database Schema

If you modify `prisma/schema.prisma`:

```bash
npx prisma db push
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

### Prisma Client Issues

If you get Prisma client errors:
```bash
npx prisma generate
```

### Build Errors

Clear the Next.js cache:
```bash
rm -rf .next
npm run dev
```

### Database Connection Issues

Make sure the `DATABASE_URL` in `.env` is correct and the prisma directory exists.

## Project Structure Overview

```
chess-club-portal/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── types/                 # TypeScript type definitions
```

## Available Pages

After setup, you can access:

- `/login` - Login page
- `/dashboard` - Main dashboard with statistics
- `/members` - Member management
- `/tournaments` - Tournament management
- `/events` - Event management
- `/payments` - Payment tracking
- `/ratings` - Member ratings and rankings

## Default Sample Data

The seeded database includes:

**Members** (6):
- John Doe (Premium, 1850 rating)
- Jane Smith (Senior, 1650 rating)
- Michael Johnson (Junior, 1200 rating)
- Sarah Williams (Senior, 1750 rating)
- Robert Brown (Premium, 2100 rating)
- Emily Davis (Junior, 1350 rating)

**Tournaments** (3):
- Spring Championship 2025
- Weekly Blitz Tournament
- Summer Open 2025

**Events** (4):
- Weekly Practice Session
- Beginner Chess Lessons
- Club Social Night
- Board Meeting

**Payments** (5):
- Various membership and tournament fees

## Next Steps

1. **Customize the data**: Use Prisma Studio or the UI to modify sample data
2. **Add real members**: Start adding actual club members
3. **Schedule events**: Create upcoming events for your club
4. **Update admin password**: Change the default admin password
5. **Configure for production**: Update environment variables

## Production Deployment

See the main README.md for production deployment instructions.

## Need Help?

- Check the main [README.md](./README.md) for more details
- Review the [Prisma documentation](https://www.prisma.io/docs)
- Check [Next.js documentation](https://nextjs.org/docs)
- Review [NextAuth.js documentation](https://next-auth.js.org)

---

Happy chess club managing! ♟️
