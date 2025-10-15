'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Trophy, Calendar, TrendingUp } from 'lucide-react'
import { playersApi, tournamentsApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    totalTournaments: 0,
    ongoingTournaments: 0
  })
  const [recentTournaments, setRecentTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [playersRes, activePlayersRes, tournamentsRes, ongoingRes] = await Promise.all([
        playersApi.getAll(),
        playersApi.getAll({ active: true }),
        tournamentsApi.getAll(),
        tournamentsApi.getAll({ status: 'ongoing' })
      ])

      setStats({
        totalPlayers: playersRes.data.players.length,
        activePlayers: activePlayersRes.data.players.length,
        totalTournaments: tournamentsRes.data.tournaments.length,
        ongoingTournaments: ongoingRes.data.tournaments.length
      })

      setRecentTournaments(tournamentsRes.data.tournaments.slice(0, 5))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to the Chess Club Administrator Portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlayers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePlayers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Players</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePlayers}</div>
            <p className="text-xs text-muted-foreground">
              Currently registered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTournaments}</div>
            <p className="text-xs text-muted-foreground">
              Total organized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ongoingTournaments}</div>
            <p className="text-xs text-muted-foreground">
              Active tournaments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tournaments</CardTitle>
            <CardDescription>Latest tournament activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTournaments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tournaments yet</p>
              ) : (
                recentTournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/tournaments/${tournament.id}`)}
                  >
                    <div>
                      <p className="font-medium">{tournament.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(tournament.start_date)} • {tournament.type}
                      </p>
                    </div>
                    {getStatusBadge(tournament.status)}
                  </div>
                ))
              )}
            </div>
            <Button
              onClick={() => router.push('/dashboard/tournaments')}
              variant="outline"
              className="w-full mt-4"
            >
              View All Tournaments
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => router.push('/dashboard/tournaments/new')}
              className="w-full justify-start"
              variant="outline"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Create New Tournament
            </Button>
            <Button
              onClick={() => router.push('/dashboard/players/new')}
              className="w-full justify-start"
              variant="outline"
            >
              <Users className="w-4 h-4 mr-2" />
              Add New Player
            </Button>
            <Button
              onClick={() => router.push('/dashboard/tournaments?status=ongoing')}
              className="w-full justify-start"
              variant="outline"
            >
              <Calendar className="w-4 h-4 mr-2" />
              View Ongoing Tournaments
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
