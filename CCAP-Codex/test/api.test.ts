process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DB_PATH = './data/test-db.sqlite3';

import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import fs from 'fs';
import path from 'path';

const dbFile = path.resolve(process.cwd(), process.env.DB_PATH ?? './data/test-db.sqlite3');
let databaseRef: typeof import('../src/db/database')['database'];
let userServiceRef: typeof import('../src/services/userService')['userService'];
let authServiceRef: typeof import('../src/services/authService')['authService'];
let memberServiceRef: typeof import('../src/services/memberService')['memberService'];
let eventServiceRef: typeof import('../src/services/eventService')['eventService'];
let announcementServiceRef: typeof import('../src/services/announcementService')['announcementService'];
let runMigrationsRef: typeof import('../src/db/migrations')['runMigrations'];

before(async () => {
  if (fs.existsSync(dbFile)) {
    fs.rmSync(dbFile);
  }

  ({ database: databaseRef } = await import('../src/db/database'));
  ({ runMigrations: runMigrationsRef } = await import('../src/db/migrations'));
  ({ userService: userServiceRef } = await import('../src/services/userService'));
  ({ authService: authServiceRef } = await import('../src/services/authService'));
  ({ memberService: memberServiceRef } = await import('../src/services/memberService'));
  ({ eventService: eventServiceRef } = await import('../src/services/eventService'));
  ({ announcementService: announcementServiceRef } = await import('../src/services/announcementService'));

  runMigrationsRef();
  await userServiceRef.create({
    email: 'integration@test.club',
    password: 'SuperStrong!9',
    full_name: 'Integration Admin',
    role: 'director'
  });
});

after(() => {
  databaseRef.instance.close();
  if (fs.existsSync(dbFile)) {
    fs.rmSync(dbFile);
  }
});

test('authService issues JWT tokens for valid credentials', async () => {
  const result = await authServiceRef.login('integration@test.club', 'SuperStrong!9');
  assert.ok(result.token);
  assert.equal(result.user.email, 'integration@test.club');
});

test('memberService supports CRUD operations with filters', () => {
  const created = memberServiceRef.create({
    first_name: 'Case',
    last_name: 'Study',
    email: 'case.study@example.com',
    status: 'active'
  });
  assert.equal(created.first_name, 'Case');

  memberServiceRef.create({ first_name: 'Guest', last_name: 'Observer', status: 'guest' });

  const filtered = memberServiceRef.list({ status: 'guest' });
  assert.ok(filtered.every((member) => member.status === 'guest'));

  const updated = memberServiceRef.update(created.id, { rating: 1800, notes: 'Promoted via tests' });
  assert.equal(updated.rating, 1800);
  assert.match(updated.notes ?? '', /tests/);

  memberServiceRef.remove(created.id);
  assert.equal(memberServiceRef.getById(created.id), null);
});

test('eventService aggregates standings from matches', () => {
  const event = eventServiceRef.create({
    name: 'Integration Open',
    category: 'tournament',
    format: '3-round Swiss',
    start_date: new Date().toISOString(),
    status: 'published'
  });

  const white = memberServiceRef.create({ first_name: 'White', last_name: 'Player', status: 'active' });
  const black = memberServiceRef.create({ first_name: 'Black', last_name: 'Player', status: 'active' });

  eventServiceRef.createRegistration({ event_id: event.id, member_id: white.id, status: 'registered' });
  eventServiceRef.createRegistration({ event_id: event.id, member_id: black.id, status: 'registered' });

  eventServiceRef.createMatch({
    event_id: event.id,
    round: 1,
    board: 1,
    white_member_id: white.id,
    black_member_id: black.id,
    result: 'white'
  });

  const standings = eventServiceRef.standings(event.id);
  assert.equal(standings[0]?.member_id, white.id);
  assert.equal(standings[0]?.points, 1);
});

test('announcementService manages bulletins', () => {
  const announcement = announcementServiceRef.create({
    title: 'Integration Notice',
    body: 'Testing announcement service',
    priority: 'high'
  });

  const active = announcementServiceRef.list(true);
  assert.ok(active.some((item) => item.id === announcement.id));

  const updated = announcementServiceRef.update(announcement.id, { priority: 'normal' });
  assert.equal(updated.priority, 'normal');

  announcementServiceRef.remove(announcement.id);
  const remaining = announcementServiceRef.list();
  assert.ok(!remaining.some((item) => item.id === announcement.id));
});
