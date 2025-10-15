# Quick Start Guide

## Running the Application

### Terminal 1 - Backend Server

```bash
cd backend
npm run dev
```

The backend API will start on **http://localhost:3001**

### Terminal 2 - Frontend Application

```bash
cd frontend
npm run dev
```

The frontend will start on **http://localhost:3000**

## First Time Setup

The database will be automatically initialized when you start the backend server.

## Logging In

1. Open your browser to **http://localhost:3000**
2. You'll be redirected to the login page
3. Use these default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

## Using the Application

### 1. Add Players

1. Click **Players** in the sidebar
2. Click **Add Player**
3. Fill in player information
4. Click **Create Player**

### 2. Create a Tournament

1. Click **Tournaments** in the sidebar
2. Click **Create Tournament**
3. Fill in tournament details:
   - Name (required)
   - Type (Swiss, Round Robin, etc.)
   - Start Date (required)
   - Number of Rounds (required)
4. Click **Create Tournament**

### 3. Add Players to Tournament

1. Open the tournament
2. Go to the **Players** tab
3. Click **Add Player**
4. Select a player from the dropdown
5. Click **Add Player**

### 4. Start the Tournament

1. Once you have players added, click **Start Round 1**
2. Pairings will be automatically generated

### 5. Enter Results

1. Go to the **Pairings** tab
2. For each game, use the dropdown to select the result:
   - **1-0** (White wins)
   - **0-1** (Black wins)
   - **½-½** (Draw)
3. Results are saved automatically

### 6. View Standings

1. Go to the **Standings** tab
2. See current rankings with tiebreaks

### 7. Continue to Next Round

1. After all games in a round are complete, click **Start Round [N]**
2. New pairings will be automatically generated based on current standings

## Features to Explore

### Player Management
- Edit player details
- View tournament history
- Track player ratings

### Tournament Types
- **Swiss System**: Best for larger groups
- **Round Robin**: Everyone plays everyone
- **Single Elimination**: Knockout tournament
- **Double Elimination**: Second chance bracket

### Standings & Tiebreaks
- Points (wins = 1, draws = 0.5)
- Buchholz (sum of opponents' scores)
- Sonneborn-Berger (defeated opponents' scores)

## Troubleshooting

### Backend won't start
- Check that port 3001 is available
- Try: `cd backend && npm install`

### Frontend won't start
- Check that port 3000 is available
- Try: `cd frontend && npm install`

### Can't login
- Ensure backend is running
- Check browser console for errors
- Verify backend is accessible at http://localhost:3001/api/health

### No players showing in tournament
- Make sure players are marked as "Active"
- Check they were added to the tournament in the Players tab

## Production Deployment

See the main README.md for detailed production deployment instructions.

## Need Help?

Check the full documentation in README.md for:
- API documentation
- Database schema
- Security considerations
- Production deployment guides
