"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
}

type TournamentDialogProps = {
  open: boolean
  onClose: () => void
  tournament: Tournament | null
}

export default function TournamentDialog({ open, onClose, tournament }: TournamentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    location: "",
    format: "swiss",
    timeControl: "rapid",
    entryFee: "0",
    maxParticipants: "",
    status: "upcoming",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tournament) {
      setFormData({
        name: tournament.name,
        description: tournament.description || "",
        startDate: new Date(tournament.startDate).toISOString().split("T")[0],
        endDate: tournament.endDate ? new Date(tournament.endDate).toISOString().split("T")[0] : "",
        location: tournament.location || "",
        format: tournament.format,
        timeControl: tournament.timeControl,
        entryFee: tournament.entryFee.toString(),
        maxParticipants: tournament.maxParticipants?.toString() || "",
        status: tournament.status,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        location: "",
        format: "swiss",
        timeControl: "rapid",
        entryFee: "0",
        maxParticipants: "",
        status: "upcoming",
      })
    }
  }, [tournament, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = tournament ? `/api/tournaments/${tournament.id}` : "/api/tournaments"
      const method = tournament ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          entryFee: parseFloat(formData.entryFee),
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
          endDate: formData.endDate || null,
        }),
      })

      if (response.ok) {
        onClose()
      }
    } catch (error) {
      console.error("Failed to save tournament:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{tournament ? "Edit Tournament" : "Add New Tournament"}</DialogTitle>
          <DialogDescription>
            {tournament ? "Update tournament information" : "Create a new chess tournament"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Spring Championship 2025"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Tournament details, rules, prizes..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Main Club Hall"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">Format *</Label>
                <Select
                  id="format"
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  required
                >
                  <option value="swiss">Swiss System</option>
                  <option value="round-robin">Round Robin</option>
                  <option value="elimination">Single Elimination</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeControl">Time Control *</Label>
                <Select
                  id="timeControl"
                  value={formData.timeControl}
                  onChange={(e) => setFormData({ ...formData, timeControl: e.target.value })}
                  required
                >
                  <option value="blitz">Blitz (3-5 min)</option>
                  <option value="rapid">Rapid (10-30 min)</option>
                  <option value="classical">Classical (60+ min)</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryFee">Entry Fee ($)</Label>
                <Input
                  id="entryFee"
                  type="number"
                  step="0.01"
                  value={formData.entryFee}
                  onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : tournament ? "Update Tournament" : "Add Tournament"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
