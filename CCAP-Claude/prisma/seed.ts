import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'admin@chessclub.com' },
    update: {},
    create: {
      email: 'admin@chessclub.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  })
  console.log('✅ Created admin user:', user.email)

  // Create members
  const members = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-0101',
      dateOfBirth: new Date('1990-05-15'),
      membershipType: 'premium',
      membershipStart: new Date('2024-01-01'),
      rating: 1850,
      fideId: '1234567',
      status: 'active',
      city: 'New York',
      state: 'NY',
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '555-0102',
      dateOfBirth: new Date('1985-08-22'),
      membershipType: 'senior',
      membershipStart: new Date('2023-06-15'),
      rating: 1650,
      usChessId: '9876543',
      status: 'active',
      city: 'Los Angeles',
      state: 'CA',
    },
    {
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.j@example.com',
      phone: '555-0103',
      dateOfBirth: new Date('2005-03-10'),
      membershipType: 'junior',
      membershipStart: new Date('2024-09-01'),
      rating: 1200,
      status: 'active',
      city: 'Chicago',
      state: 'IL',
    },
    {
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.w@example.com',
      phone: '555-0104',
      dateOfBirth: new Date('1995-11-30'),
      membershipType: 'senior',
      membershipStart: new Date('2024-02-01'),
      rating: 1750,
      fideId: '2345678',
      status: 'active',
      city: 'Houston',
      state: 'TX',
    },
    {
      firstName: 'Robert',
      lastName: 'Brown',
      email: 'robert.b@example.com',
      phone: '555-0105',
      dateOfBirth: new Date('1980-07-18'),
      membershipType: 'premium',
      membershipStart: new Date('2023-01-01'),
      rating: 2100,
      fideId: '3456789',
      usChessId: '8765432',
      status: 'active',
      city: 'Phoenix',
      state: 'AZ',
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.d@example.com',
      phone: '555-0106',
      dateOfBirth: new Date('2006-12-05'),
      membershipType: 'junior',
      membershipStart: new Date('2024-08-15'),
      rating: 1350,
      status: 'active',
      city: 'Philadelphia',
      state: 'PA',
    },
  ]

  for (const memberData of members) {
    const member = await prisma.member.create({ data: memberData })
    console.log('✅ Created member:', member.firstName, member.lastName)
  }

  // Create tournaments
  const tournaments = [
    {
      name: 'Spring Championship 2025',
      description: 'Annual spring tournament with prizes for top 3 finishers',
      startDate: new Date('2025-03-15'),
      endDate: new Date('2025-03-16'),
      location: 'Main Club Hall',
      format: 'swiss',
      timeControl: 'rapid',
      entryFee: 25.00,
      maxParticipants: 32,
      status: 'upcoming',
    },
    {
      name: 'Weekly Blitz Tournament',
      description: 'Fast-paced blitz tournament every Friday',
      startDate: new Date('2025-01-10'),
      location: 'Club Room A',
      format: 'swiss',
      timeControl: 'blitz',
      entryFee: 5.00,
      status: 'completed',
    },
    {
      name: 'Summer Open 2025',
      description: 'Open tournament for all skill levels',
      startDate: new Date('2025-06-20'),
      endDate: new Date('2025-06-22'),
      location: 'Convention Center',
      format: 'swiss',
      timeControl: 'classical',
      entryFee: 50.00,
      maxParticipants: 64,
      status: 'upcoming',
    },
  ]

  for (const tournamentData of tournaments) {
    const tournament = await prisma.tournament.create({ data: tournamentData })
    console.log('✅ Created tournament:', tournament.name)
  }

  // Create events
  const events = [
    {
      title: 'Weekly Practice Session',
      description: 'Open practice for all members',
      date: new Date('2025-01-15T18:00:00'),
      endDate: new Date('2025-01-15T21:00:00'),
      location: 'Main Club Hall',
      eventType: 'practice',
      cost: 0,
    },
    {
      title: 'Beginner Chess Lessons',
      description: 'Lessons for beginners covering basic tactics and strategy',
      date: new Date('2025-01-20T10:00:00'),
      endDate: new Date('2025-01-20T12:00:00'),
      location: 'Club Room B',
      eventType: 'lesson',
      maxAttendees: 15,
      cost: 20.00,
    },
    {
      title: 'Club Social Night',
      description: 'Casual games and socializing with refreshments',
      date: new Date('2025-01-25T19:00:00'),
      endDate: new Date('2025-01-25T22:00:00'),
      location: 'Main Club Hall',
      eventType: 'social',
      cost: 5.00,
    },
    {
      title: 'Board Meeting',
      description: 'Monthly board meeting to discuss club operations',
      date: new Date('2025-02-01T18:30:00'),
      location: 'Conference Room',
      eventType: 'meeting',
      maxAttendees: 10,
      cost: 0,
    },
  ]

  for (const eventData of events) {
    const event = await prisma.event.create({ data: eventData })
    console.log('✅ Created event:', event.title)
  }

  // Create some payments
  const allMembers = await prisma.member.findMany()
  const payments = [
    {
      memberId: allMembers[0].id,
      amount: 100.00,
      paymentType: 'membership',
      paymentMethod: 'card',
      description: 'Annual membership fee',
      status: 'completed',
      paymentDate: new Date('2024-01-01'),
    },
    {
      memberId: allMembers[1].id,
      amount: 75.00,
      paymentType: 'membership',
      paymentMethod: 'cash',
      description: 'Annual membership fee',
      status: 'completed',
      paymentDate: new Date('2023-06-15'),
    },
    {
      memberId: allMembers[2].id,
      amount: 50.00,
      paymentType: 'membership',
      paymentMethod: 'online',
      description: 'Annual membership fee (Junior)',
      status: 'completed',
      paymentDate: new Date('2024-09-01'),
    },
    {
      memberId: allMembers[3].id,
      amount: 25.00,
      paymentType: 'tournament',
      paymentMethod: 'card',
      description: 'Spring Championship entry fee',
      status: 'completed',
      paymentDate: new Date('2025-01-05'),
    },
    {
      memberId: allMembers[4].id,
      amount: 100.00,
      paymentType: 'membership',
      paymentMethod: 'check',
      description: 'Annual membership fee (Premium)',
      status: 'completed',
      paymentDate: new Date('2024-01-01'),
    },
  ]

  for (const paymentData of payments) {
    const payment = await prisma.payment.create({ data: paymentData })
    console.log('✅ Created payment:', formatCurrency(payment.amount))
  }

  console.log('🎉 Seeding completed successfully!')
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
