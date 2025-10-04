"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Users, Calendar } from "lucide-react"
import TournamentDialog from "./tournament-dialog"
import { formatDate } from "@/lib/utils"

type Tournament = {
  id: string
  name: string
  description: string | null
  startDate: string
  endDate: string | null
  location: string | null
  format: string
  timeControl: string
  entryFee: number
  maxParticipants: number | null
  status: string
  _count?: {
    registrations: number
  }
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTournaments()
  }, [])

  useEffect(() => {
    const filtered = tournaments.filter((tournament) => {
      const query = searchQuery.toLowerCase()
      return (
        tournament.name.toLowerCase().includes(query) ||
        tournament.location?.toLowerCase().includes(query)
      )
    })
    setFilteredTournaments(filtered)
  }, [searchQuery, tournaments])

  const fetchTournaments = async () => {
    try {
      const response = await fetch("/api/tournaments")
      const data = await response.json()
      setTournaments(data)
      setFilteredTournaments(data)
    } catch (error) {
      console.error("Failed to fetch tournaments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tournament?")) return

    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTournaments()
      }
    } catch (error) {
      console.error("Failed to delete tournament:", error)
    }
  }

  const handleEdit = (tournament: Tournament) => {
    setSelectedTournament(tournament)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedTournament(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedTournament(null)
    fetchTournaments()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "default"
      case "in-progress":
        return "warning"
      case "completed":
        return "success"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
          <p className="text-gray-500 mt-1">Manage chess tournaments and competitions</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tournament
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search tournaments by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading tournaments...</div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No tournaments found matching your search." : "No tournaments yet. Add your first tournament!"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell className="font-medium">{tournament.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3 text-gray-400" />
                        {formatDate(tournament.startDate)}
                      </div>
                    </TableCell>
                    <TableCell>{tournament.location || "TBD"}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{tournament.format}</div>
                        <div className="text-xs text-gray-500">{tournament.timeControl}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Users className="mr-1 h-3 w-3 text-gray-400" />
                        {tournament._count?.registrations || 0}
                        {tournament.maxParticipants && ` / ${tournament.maxParticipants}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(tournament.status)}>
                        {tournament.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(tournament)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tournament.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TournamentDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        tournament={selectedTournament}
      />
    </div>
  )
}
