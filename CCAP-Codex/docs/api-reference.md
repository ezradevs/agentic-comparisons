# API Reference

Base URL: `http://localhost:4000/api`

All endpoints (except `/auth/login`) require the `Authorization: Bearer <token>` header.

## Auth

### `POST /auth/login`

Request:
```json
{
  "email": "director@chessclub.io",
  "password": "PlayWell!24"
}
```

Response:
```json
{
  "token": "<jwt>",
  "user": {
    "id": "uuid",
    "email": "director@chessclub.io",
    "full_name": "Alex Director",
    "role": "director"
  }
}
```

### `GET /auth/profile`
Returns the authenticated user profile.

---

## Members

### `GET /members`
Query parameters:
- `status` (optional): `active | inactive | guest | alumni`
- `search` (optional): matches first/last/preferred name or email

Response:
```json
{ "members": [ Member ] }
```

### `POST /members`
Create a member.
```json
{
  "first_name": "Sophia",
  "last_name": "Lopez",
  "email": "sophia@example.com",
  "status": "active"
}
```

### `GET /members/:id`
Fetch a single member.

### `PUT /members/:id`
Partial update. Fields mirror the create payload plus `rating`, `join_date`, etc.

### `DELETE /members/:id`
Remove the member record.

### `GET /members/stats/by-status`
Returns counts grouped by membership status.

---

## Events

### `GET /events`
Query parameters:
- `status` (`draft | published | completed | cancelled`)
- `category` (`tournament | league | training | social`)
- `upcomingOnly` (boolean)
- `search`

Response: `{ "events": [ Event ] }`

### `POST /events`
Create an event.
```json
{
  "name": "Spring Open",
  "category": "tournament",
  "format": "5-round Swiss",
  "start_date": "2024-04-20T10:00:00.000Z",
  "status": "draft"
}
```

### `GET /events/:id`
Returns the event plus related data.
```json
{
  "event": Event,
  "registrations": [RegistrationDetail],
  "matches": [MatchDetail],
  "standings": [StandingRow]
}
```

### `PUT /events/:id`
Update event metadata.

### `DELETE /events/:id`
Delete event (cascades to registrations + matches).

#### Registrations
- `GET /events/:id/registrations`
- `POST /events/:id/registrations` body: `{ "member_id": "uuid", "status": "registered" }`
- `PATCH /events/registrations/:id` updates `{ status, score, notes, check_in_at }`
- `DELETE /events/registrations/:id`

#### Matches
- `GET /events/:id/matches`
- `POST /events/:id/matches` body: `{ round, board, white_member_id?, black_member_id?, result? }`
- `PATCH /events/matches/:id`
- `DELETE /events/matches/:id`

#### Standings
- `GET /events/:id/standings` – points, wins/draws/losses derived from matches/registrations.

---

## Dashboard

### `GET /dashboard/metrics`
Returns roll-ups for the landing page:
```json
{
  "metrics": {
    "totals": { "members": 75, "activeMembers": 54, "newThisMonth": 5, "averageRating": 1630 },
    "upcomingEvents": [ { "id": "...", "name": "Spring Open", "start_date": "..." } ],
    "standingsPreview": [ { "event_id": "...", "completed_matches": 8 } ],
    "recentActivity": {
      "latestMembers": [ { "id": "...", "name": "Sophia Lopez" } ],
      "latestMatches": [ { "id": "...", "event_name": "Training Camp" } ]
    }
  }
}
```

---

## Announcements

### `GET /announcements`
Query parameter `activeOnly=true` filters to unexpired bulletins.

### `POST /announcements`
```json
{
  "title": "Club Renovation",
  "body": "Main hall upgrades are complete.",
  "priority": "high",
  "publish_at": "2024-03-01T18:00:00.000Z"
}
```

### `PUT /announcements/:id`
Update title/body/priority/scheduling.

### `DELETE /announcements/:id`
Remove bulletin.

---

## Health

### `GET /health`
Unauthenticated status endpoint returning `{ "status": "ok" }`.

---

## Error Handling

Errors follow the shape:
```json
{ "error": "Human-readable message" }
```

- `400` – validation errors, failed login
- `401` – missing/invalid token
- `403` – insufficient permission (for future role checks)
- `404` – resource not found
