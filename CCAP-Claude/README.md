# Chess Club Admin Portal

A modern, full-stack web application for managing chess club operations. Built with Next.js 15, TypeScript, Prisma, and Tailwind CSS.

## Features

### 🎯 Core Functionality
- **Dashboard**: Overview of club statistics, recent members, and payments
- **Member Management**: Complete CRUD operations for member profiles with detailed information
- **Tournament Management**: Create and manage tournaments with various formats and time controls
- **Event Calendar**: Schedule and track club events, lessons, and meetings
- **Payment Tracking**: Record and monitor membership fees, tournament entries, and other payments
- **Ratings System**: Track and display member ratings with rankings and performance metrics

### 🔐 Authentication
- Secure login system with NextAuth.js
- Password hashing with bcryptjs
- Session-based authentication
- Protected routes with middleware

### 💾 Database
- SQLite database (easily deployable, no external database required)
- Prisma ORM for type-safe database access
- Comprehensive data models for all entities
- Seed data included for testing

### 🎨 Modern UI
- Clean, professional interface with Tailwind CSS
- Responsive design for desktop and mobile
- Custom UI components (buttons, cards, tables, dialogs, badges)
- Intuitive navigation with sidebar
- Search and filter functionality across all pages

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd chess-club-portal
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Set up the database**:
   ```bash
   npm run db:push
   ```

4. **Seed the database with sample data**:
   ```bash
   npm run db:seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

### Default Login Credentials

```
Email: admin@chessclub.com
Password: admin123
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with sample data

## Database Schema

### User
Admin users who can access the portal
- Email, password, name, role

### Member
Chess club members
- Personal information (name, email, phone, DOB)
- Membership details (type, start/end dates, status)
- Chess ratings and IDs (FIDE, US Chess)
- Address and emergency contact
- Notes

### Tournament
Chess tournaments
- Basic info (name, description, dates, location)
- Format (Swiss, Round Robin, Elimination)
- Time control (Blitz, Rapid, Classical)
- Entry fees and participant limits
- Status tracking

### Event
Club events and activities
- Title, description, date/time
- Location and event type (lesson, practice, social, meeting)
- Attendance limits and cost

### Payment
Financial transactions
- Amount, payment type, payment method
- Description and status
- Linked to members

### TournamentRegistration
Member registrations for tournaments

### EventAttendance
Member attendance tracking for events

### Game
Chess game records (for future tournament pairings)

## Project Structure

```
chess-club-portal/
├── app/
│   ├── (auth)/
│   │   └── login/              # Login page
│   ├── (dashboard)/
│   │   ├── dashboard/          # Main dashboard
│   │   ├── members/            # Member management
│   │   ├── tournaments/        # Tournament management
│   │   ├── events/             # Event management
│   │   ├── payments/           # Payment tracking
│   │   ├── ratings/            # Ratings and rankings
│   │   └── layout.tsx          # Dashboard layout
│   ├── api/
│   │   ├── auth/               # NextAuth API routes
│   │   ├── members/            # Member API endpoints
│   │   ├── tournaments/        # Tournament API endpoints
│   │   ├── events/             # Event API endpoints
│   │   └── payments/           # Payment API endpoints
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page (redirects to dashboard)
├── components/
│   └── ui/                     # Reusable UI components
├── lib/
│   ├── auth/                   # Authentication configuration
│   ├── db.ts                   # Prisma client
│   └── utils.ts                # Utility functions
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data script
├── types/
│   └── next-auth.d.ts          # NextAuth type definitions
└── middleware.ts               # Route protection middleware
```

## Features in Detail

### Member Management
- Add, edit, and delete members
- Comprehensive member profiles with:
  - Personal information
  - Membership details
  - Chess ratings and federation IDs
  - Contact information
  - Emergency contacts
  - Custom notes
- Search and filter members
- Member status tracking (active, inactive, suspended)

### Tournament Management
- Create tournaments with customizable settings
- Multiple formats: Swiss System, Round Robin, Single Elimination
- Time controls: Blitz, Rapid, Classical
- Entry fee tracking
- Participant limits
- Registration tracking
- Tournament status management

### Event Management
- Schedule various event types:
  - Lessons
  - Practice sessions
  - Social events
  - Board meetings
- Date and time tracking
- Location management
- Attendance limits
- Cost tracking
- Attendance management

### Payment System
- Record payments for:
  - Memberships
  - Tournament entries
  - Event fees
  - Other transactions
- Multiple payment methods (cash, check, card, online)
- Payment status tracking (completed, pending, refunded)
- Revenue analytics:
  - Total revenue
  - Monthly revenue
  - Pending payments count

### Ratings & Rankings
- Display member ratings
- Ranking system with visual medals for top 3
- Rating categories (Beginner, Intermediate, Advanced, Expert, Master)
- FIDE and US Chess ID tracking
- Rating trend indicators
- Sortable by rating or name
- Statistical overview (average rating, highest rating, rating range)

## Environment Variables

The `.env` file contains:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

⚠️ **Important**: Change `NEXTAUTH_SECRET` to a random string in production. Generate one with:
```bash
openssl rand -base64 32
```

## Deployment

### Building for Production

```bash
npm run build
npm start
```

### Deployment Platforms

This app can be deployed to:
- **Vercel** (recommended for Next.js)
- **Railway**
- **Render**
- **DigitalOcean App Platform**
- Any Node.js hosting platform

### Production Considerations

1. **Database**: For production, consider upgrading to PostgreSQL or MySQL
   - Update `DATABASE_URL` in `.env`
   - Change `provider` in `prisma/schema.prisma`
   - Run `npx prisma migrate dev`

2. **Authentication**:
   - Change `NEXTAUTH_SECRET` to a secure random string
   - Update `NEXTAUTH_URL` to your production domain

3. **Security**:
   - Review and update CORS settings if needed
   - Implement rate limiting
   - Add input validation
   - Enable HTTPS

## Future Enhancements

Potential features to add:
- Tournament pairings and standings
- Game recording with PGN import/export
- Email notifications
- Member portal for self-service
- Online payment processing
- Calendar view for events
- Reporting and analytics
- Bulk operations
- Photo uploads
- Document management
- Multi-language support

## License

MIT License - feel free to use this for your chess club!

## Support

For issues or questions, please open an issue on the project repository.

---

Built with ♟️ by Claude Code
