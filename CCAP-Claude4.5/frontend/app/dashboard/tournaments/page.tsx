'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, Users, Trophy } from 'lucide-react'
import { tournamentsApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function TournamentsPage() {
  const router = useRouter()
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTournaments()
  }, [])

  const loadTournaments = async () => {
    try {
      const response = await tournamentsApi.getAll()
      setTournaments(response.data.tournaments)
    } catch (error) {
      console.error('Failed to load tournaments:', error)
    } finally {
      setLoading(false)
    }
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

  const getTournamentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      swiss: 'Swiss System',
      round_robin: 'Round Robin',
      single_elimination: 'Single Elimination',
      double_elimination: 'Double Elimination'
    }
    return labels[type] || type
  }

  const groupedTournaments = {
    ongoing: tournaments.filter(t => t.status === 'ongoing'),
    upcoming: tournaments.filter(t => t.status === 'upcoming'),
    completed: tournaments.filter(t => t.status === 'completed')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
          <p className="text-gray-600 mt-1">Manage chess tournaments</p>
        </div>
        <Button onClick={() => router.push('/dashboard/tournaments/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Tournament
        </Button>
      </div>

      <div className="space-y-6">
        {groupedTournaments.ongoing.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Ongoing Tournaments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedTournaments.ongoing.map((tournament) => (
                <Card
                  key={tournament.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/dashboard/tournaments/${tournament.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{tournament.name}</CardTitle>
                      {getStatusBadge(tournament.status)}
                    </div>
                    <CardDescription>{getTournamentTypeLabel(tournament.type)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(tournament.start_date)}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Trophy className="w-4 h-4 mr-2" />
                        Round {tournament.current_round} of {tournament.rounds}
                      </div>
                      {tournament.location && (
                        <div className="text-gray-600">{tournament.location}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {groupedTournaments.upcoming.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Upcoming Tournaments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedTournaments.upcoming.map((tournament) => (
                <Card
                  key={tournament.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/dashboard/tournaments/${tournament.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{tournament.name}</CardTitle>
                      {getStatusBadge(tournament.status)}
                    </div>
                    <CardDescription>{getTournamentTypeLabel(tournament.type)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(tournament.start_date)}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Trophy className="w-4 h-4 mr-2" />
                        {tournament.rounds} rounds
                      </div>
                      {tournament.location && (
                        <div className="text-gray-600">{tournament.location}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {groupedTournaments.completed.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Completed Tournaments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedTournaments.completed.map((tournament) => (
                <Card
                  key={tournament.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/dashboard/tournaments/${tournament.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{tournament.name}</CardTitle>
                      {getStatusBadge(tournament.status)}
                    </div>
                    <CardDescription>{getTournamentTypeLabel(tournament.type)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(tournament.start_date)}
                      </div>
                      {tournament.location && (
                        <div className="text-gray-600">{tournament.location}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tournaments.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tournaments yet</h3>
              <p className="text-gray-600 mb-4">Create your first tournament to get started</p>
              <Button onClick={() => router.push('/dashboard/tournaments/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Tournament
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
