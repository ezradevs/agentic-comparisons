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
import { Plus, Search, Edit, Trash2, Calendar, MapPin } from "lucide-react"
import EventDialog from "./event-dialog"
import { formatDate } from "@/lib/utils"

type Event = {
  id: string
  title: string
  description: string | null
  date: string
  endDate: string | null
  location: string | null
  eventType: string
  maxAttendees: number | null
  cost: number
  _count?: {
    attendances: number
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    const filtered = events.filter((event) => {
      const query = searchQuery.toLowerCase()
      return (
        event.title.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query) ||
        event.eventType.toLowerCase().includes(query)
      )
    })
    setFilteredEvents(filtered)
  }, [searchQuery, events])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events")
      const data = await response.json()
      setEvents(data)
      setFilteredEvents(data)
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error("Failed to delete event:", error)
    }
  }

  const handleEdit = (event: Event) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedEvent(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedEvent(null)
    fetchEvents()
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "lesson":
        return "default"
      case "practice":
        return "secondary"
      case "social":
        return "success"
      case "meeting":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">Manage club events and activities</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search events by title, location, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No events found matching your search." : "No events yet. Add your first event!"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3 text-gray-400" />
                        {formatDate(event.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-1 h-3 w-3 text-gray-400" />
                        {event.location || "TBD"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getEventTypeColor(event.eventType)}>
                        {event.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {event._count?.attendances || 0}
                      {event.maxAttendees && ` / ${event.maxAttendees}`}
                    </TableCell>
                    <TableCell>
                      {event.cost > 0 ? `$${event.cost.toFixed(2)}` : "Free"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
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

      <EventDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        event={selectedEvent}
      />
    </div>
  )
}
