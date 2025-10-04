import { database } from '../db/database';
import { runMigrations } from '../db/migrations';
import { userService } from '../services/userService';
import { memberService } from '../services/memberService';
import { eventService } from '../services/eventService';
import { announcementService } from '../services/announcementService';
import type { MemberStatus } from '../types/domain';

const seedUsers = async () => {
  const row = database.instance.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (row.count > 0) return;

  await userService.create({
    email: 'director@chessclub.io',
    password: 'PlayWell!24',
    full_name: 'Alex Director',
    role: 'director'
  });

  await userService.create({
    email: 'organizer@chessclub.io',
    password: 'Organize#24',
    full_name: 'Jamie Organizer',
    role: 'organizer'
  });

  console.log('Seeded default users (passwords included in seed script).');
};

const seedMembers = () => {
  const row = database.instance.prepare('SELECT COUNT(*) as count FROM members').get() as { count: number };
  if (row.count > 0) return;

  const members = [
    { first_name: 'Sophia', last_name: 'Lopez', rating: 1820, email: 'sophia.lopez@example.com', status: 'active' as MemberStatus, join_date: '2023-01-14' },
    { first_name: 'Henry', last_name: 'Kim', rating: 1685, email: 'henry.kim@example.com', status: 'active' as MemberStatus, join_date: '2023-03-22' },
    { first_name: 'Maya', last_name: 'Singh', rating: 1450, email: 'maya.singh@example.com', status: 'active' as MemberStatus, join_date: '2022-11-05' },
    { first_name: 'Elena', last_name: 'Petrov', rating: 1910, email: 'elena.petrov@example.com', status: 'active' as MemberStatus, join_date: '2021-09-17' },
    { first_name: 'Noah', last_name: 'Reed', rating: 1320, email: 'noah.reed@example.com', status: 'guest' as MemberStatus, join_date: '2024-01-02' },
    { first_name: 'Lucas', last_name: 'Chen', rating: 2045, email: 'lucas.chen@example.com', status: 'active' as MemberStatus, join_date: '2020-06-11' },
    { first_name: 'Amelia', last_name: 'Garcia', rating: 1580, email: 'amelia.garcia@example.com', status: 'active' as MemberStatus, join_date: '2023-07-19' },
    { first_name: 'Ethan', last_name: 'Patel', rating: 1710, email: 'ethan.patel@example.com', status: 'inactive' as MemberStatus, join_date: '2022-02-12' }
  ];

  members.forEach((member) => memberService.create(member));
  console.log('Seeded members.');
};

const seedEvents = () => {
  const row = database.instance.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
  if (row.count > 0) return;

  const registrationIndex = new Map<string, string>();

  const upcomingTournament = eventService.create({
    name: 'Spring Open 2024',
    category: 'tournament',
    format: '5-round Swiss',
    start_date: '2024-04-20T10:00:00Z',
    end_date: '2024-04-20T18:00:00Z',
    registration_deadline: '2024-04-19T23:59:00Z',
    location: 'Club Hall A',
    time_control: 'G/45; d5',
    description: 'Annual spring open tournament for all rating levels.',
    status: 'published',
    capacity: 40
  });

  const trainingCamp = eventService.create({
    name: 'Elite Training Camp',
    category: 'training',
    format: 'Workshops and Simuls',
    start_date: '2024-03-10T09:00:00Z',
    end_date: '2024-03-12T17:00:00Z',
    registration_deadline: '2024-03-01T23:59:00Z',
    location: 'Training Center',
    time_control: 'Varied',
    description: 'Three-day intensive training lead by club masters.',
    status: 'completed',
    capacity: 20
  });

  const members = memberService.list();
  members.slice(0, 6).forEach((member, idx) => {
    const registration = eventService.createRegistration({
      event_id: upcomingTournament.id,
      member_id: member.id,
      status: idx < 5 ? 'registered' : 'waitlisted'
    });
    registrationIndex.set(`${registration.event_id}:${registration.member_id}`, registration.id);

    if (idx < 4) {
      eventService.updateRegistration(registration.id, { score: idx % 2 === 0 ? 1 : 0.5 });
    }
  });

  const campRegistrations = members.slice(0, 4).map((member) => {
    const registration = eventService.createRegistration({
      event_id: trainingCamp.id,
      member_id: member.id,
      status: 'checked_in',
      notes: 'Attended all sessions'
    });
    registrationIndex.set(`${registration.event_id}:${registration.member_id}`, registration.id);
    return { registration, member };
  });

  if (campRegistrations.length >= 4) {
    const white1 = campRegistrations[0];
    const black1 = campRegistrations[1];
    const white2 = campRegistrations[2];
    const black2 = campRegistrations[3];

    const match1 = eventService.createMatch({
      event_id: trainingCamp.id,
      round: 1,
      board: 1,
      white_member_id: white1.member.id,
      black_member_id: black1.member.id,
      result: 'white',
      played_at: '2024-03-10T11:00:00Z'
    });
    const white1RegId = registrationIndex.get(`${match1.event_id}:${match1.white_member_id}`);
    if (white1RegId) {
      eventService.updateRegistration(white1RegId, { score: 1 });
    }
    const black1RegId = registrationIndex.get(`${match1.event_id}:${match1.black_member_id}`);
    if (black1RegId) {
      eventService.updateRegistration(black1RegId, { score: 0 });
    }

    eventService.createMatch({
      event_id: trainingCamp.id,
      round: 1,
      board: 2,
      white_member_id: white2.member.id,
      black_member_id: black2.member.id,
      result: 'draw',
      played_at: '2024-03-10T11:00:00Z'
    });
    const white2RegId = registrationIndex.get(`${trainingCamp.id}:${white2.member.id}`);
    if (white2RegId) {
      eventService.updateRegistration(white2RegId, { score: 0.5 });
    }
    const black2RegId = registrationIndex.get(`${trainingCamp.id}:${black2.member.id}`);
    if (black2RegId) {
      eventService.updateRegistration(black2RegId, { score: 0.5 });
    }
  }

  console.log('Seeded events, registrations, and matches.');
};

const seedAnnouncements = () => {
  const row = database.instance.prepare('SELECT COUNT(*) as count FROM announcements').get() as { count: number };
  if (row.count > 0) return;

  announcementService.create({
    title: 'Club Renovation Update',
    body: 'Main hall upgrades are complete. Boards and clocks are refreshed for the new season.',
    priority: 'high'
  });

  announcementService.create({
    title: 'Volunteer Night',
    body: 'Join us next Friday to help set up boards for the scholastic invitational.',
    priority: 'normal',
    publish_at: '2024-02-02T18:00:00Z',
    expires_at: '2024-02-10T23:59:00Z'
  });

  console.log('Seeded announcements.');
};

const main = async () => {
  runMigrations();
  await seedUsers();
  seedMembers();
  seedEvents();
  seedAnnouncements();

  console.log('Database seed completed.');
};

main().catch((error) => {
  console.error('Failed to seed database:', error);
  process.exit(1);
});
