'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Users, Play, Trophy, Plus, X, Save } from 'lucide-react'
import { tournamentsApi, playersApi, gamesApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function TournamentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tournamentId = params?.id as string
  const [tournament, setTournament] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [allPlayers, setAllPlayers] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [standings, setStandings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRound, setSelectedRound] = useState<number>(1)
  const [addPlayerDialogOpen, setAddPlayerDialogOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')

  useEffect(() => {
    if (tournamentId) {
      loadTournamentData()
    }
  }, [tournamentId])

  useEffect(() => {
    if (tournament) {
      setSelectedRound(Math.max(1, tournament.current_round))
    }
  }, [tournament])

  useEffect(() => {
    if (selectedRound && tournamentId) {
      loadGames(selectedRound)
    }
  }, [selectedRound, tournamentId])

  const loadTournamentData = async () => {
    try {
      const [tournamentRes, playersRes, allPlayersRes, standingsRes] = await Promise.all([
        tournamentsApi.getOne(parseInt(tournamentId)),
        tournamentsApi.getPlayers(parseInt(tournamentId)),
        playersApi.getAll({ active: true }),
        tournamentsApi.getStandings(parseInt(tournamentId))
      ])

      setTournament(tournamentRes.data.tournament)
      setPlayers(playersRes.data.players)
      setAllPlayers(allPlayersRes.data.players)
      setStandings(standingsRes.data.standings)
    } catch (error) {
      console.error('Failed to load tournament:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadGames = async (round: number) => {
    try {
      const response = await tournamentsApi.getGames(parseInt(tournamentId), round)
      setGames(response.data.games)
    } catch (error) {
      console.error('Failed to load games:', error)
    }
  }

  const handleAddPlayer = async () => {
    if (!selectedPlayer) return

    try {
      await tournamentsApi.addPlayer(parseInt(tournamentId), parseInt(selectedPlayer))
      setAddPlayerDialogOpen(false)
      setSelectedPlayer('')
      await loadTournamentData()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add player')
    }
  }

  const handleRemovePlayer = async (playerId: number) => {
    if (!confirm('Remove this player from the tournament?')) return

    try {
      await tournamentsApi.removePlayer(parseInt(tournamentId), playerId)
      await loadTournamentData()
    } catch (error) {
      alert('Failed to remove player')
    }
  }

  const handleStartNextRound = async () => {
    if (!confirm('Start the next round and generate pairings?')) return

    try {
      await tournamentsApi.startNextRound(parseInt(tournamentId))
      await loadTournamentData()
      alert('Next round started successfully!')
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to start next round')
    }
  }

  const handleUpdateResult = async (gameId: number, result: string) => {
    try {
      await gamesApi.updateResult(gameId, result)
      await loadGames(selectedRound)
      await loadTournamentData()
    } catch (error) {
      alert('Failed to update result')
    }
  }

  const getTournamentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      swiss: 'Swiss System',
      round_robin: 'Round Robin',
      single_elimination: 'Single Elimination',
      double_elimination: 'Double Elimination'
    }
    return labels[type] || type
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      upcoming: 'secondary',
      ongoing: 'default',
      completed: 'outline',
      cancelled: 'destructive'
    }
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const availablePlayers = allPlayers.filter(
    (p) => !players.some((tp) => tp.id === p.id)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!tournament) {
    return <div className="p-8">Tournament not found</div>
  }

  return (
    <div className="p-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              {getStatusBadge(tournament.status)}
              <span className="text-gray-600">{getTournamentTypeLabel(tournament.type)}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-600">{formatDate(tournament.start_date)}</span>
            </div>
          </div>
          {tournament.status !== 'completed' && (
            <Button onClick={handleStartNextRound}>
              <Play className="w-4 h-4 mr-2" />
              Start Round {tournament.current_round + 1}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="players">Players ({players.length})</TabsTrigger>
          <TabsTrigger value="pairings">Pairings</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{players.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Current Round</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tournament.current_round} / {tournament.rounds}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Time Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tournament.time_control || 'N/A'}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tournament Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tournament.description && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Description</p>
                  <p className="text-gray-900">{tournament.description}</p>
                </div>
              )}
              {tournament.location && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-gray-900">{tournament.location}</p>
                </div>
              )}
              {(tournament.min_rating || tournament.max_rating) && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating Range</p>
                  <p className="text-gray-900">
                    {tournament.min_rating || '0'} - {tournament.max_rating || '∞'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tournament Players</CardTitle>
                  <CardDescription>Manage participants</CardDescription>
                </div>
                <Dialog open={addPlayerDialogOpen} onOpenChange={setAddPlayerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Player
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Player to Tournament</DialogTitle>
                      <DialogDescription>Select a player to add</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a player" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePlayers.map((player) => (
                            <SelectItem key={player.id} value={player.id.toString()}>
                              {player.first_name} {player.last_name} ({player.rating})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddPlayerDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddPlayer} disabled={!selectedPlayer}>
                        Add Player
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>FIDE ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No players added yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    players.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">
                          {player.first_name} {player.last_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{player.rating}</Badge>
                        </TableCell>
                        <TableCell>{player.fide_id || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePlayer(player.id)}
                            disabled={tournament.current_round > 0}
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pairings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Round Pairings</CardTitle>
                  <CardDescription>View and enter game results</CardDescription>
                </div>
                <Select
                  value={selectedRound.toString()}
                  onValueChange={(value) => setSelectedRound(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: tournament.current_round }, (_, i) => i + 1).map((round) => (
                      <SelectItem key={round} value={round.toString()}>
                        Round {round}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Board</TableHead>
                    <TableHead>White</TableHead>
                    <TableHead>Black</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {games.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No games for this round
                      </TableCell>
                    </TableRow>
                  ) : (
                    games.map((game) => (
                      <TableRow key={game.id}>
                        <TableCell>{game.board_number}</TableCell>
                        <TableCell>
                          {game.white_first_name} {game.white_last_name}
                        </TableCell>
                        <TableCell>
                          {game.black_player_id ? (
                            `${game.black_first_name} ${game.black_last_name}`
                          ) : (
                            <Badge variant="secondary">BYE</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {game.result ? (
                            <Badge>{game.result}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Pending</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!game.result && (
                            <Select onValueChange={(value) => handleUpdateResult(game.id, value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Set result" />
                              </SelectTrigger>
                              <SelectContent>
                                {!game.black_player_id ? (
                                  <SelectItem value="BYE">BYE</SelectItem>
                                ) : (
                                  <>
                                    <SelectItem value="1-0">1-0 (White wins)</SelectItem>
                                    <SelectItem value="0-1">0-1 (Black wins)</SelectItem>
                                    <SelectItem value="1/2-1/2">½-½ (Draw)</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standings">
          <Card>
            <CardHeader>
              <CardTitle>Current Standings</CardTitle>
              <CardDescription>Tournament leaderboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Games</TableHead>
                    <TableHead>W-D-L</TableHead>
                    <TableHead>Buchholz</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No standings available yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    standings.map((standing, index) => (
                      <TableRow key={standing.player_id}>
                        <TableCell>
                          <Badge variant={index < 3 ? 'default' : 'secondary'}>
                            {standing.rank}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {standing.first_name} {standing.last_name}
                        </TableCell>
                        <TableCell>{standing.rating}</TableCell>
                        <TableCell>
                          <Badge variant="default">{standing.points}</Badge>
                        </TableCell>
                        <TableCell>{standing.games_played}</TableCell>
                        <TableCell>
                          {standing.wins}-{standing.draws}-{standing.losses}
                        </TableCell>
                        <TableCell>{standing.buchholz.toFixed(1)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
