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

type Member = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  dateOfBirth: string | null
  membershipType: string
  membershipStart: string
  membershipEnd: string | null
  rating: number
  fideId: string | null
  usChessId: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  notes: string | null
  status: string
}

type MemberDialogProps = {
  open: boolean
  onClose: () => void
  member: Member | null
}

export default function MemberDialog({ open, onClose, member }: MemberDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    membershipType: "senior",
    membershipStart: new Date().toISOString().split("T")[0],
    membershipEnd: "",
    rating: "1200",
    fideId: "",
    usChessId: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContact: "",
    emergencyPhone: "",
    notes: "",
    status: "active",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email || "",
        phone: member.phone || "",
        dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split("T")[0] : "",
        membershipType: member.membershipType,
        membershipStart: new Date(member.membershipStart).toISOString().split("T")[0],
        membershipEnd: member.membershipEnd ? new Date(member.membershipEnd).toISOString().split("T")[0] : "",
        rating: member.rating.toString(),
        fideId: member.fideId || "",
        usChessId: member.usChessId || "",
        address: member.address || "",
        city: member.city || "",
        state: member.state || "",
        zipCode: member.zipCode || "",
        emergencyContact: member.emergencyContact || "",
        emergencyPhone: member.emergencyPhone || "",
        notes: member.notes || "",
        status: member.status,
      })
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        membershipType: "senior",
        membershipStart: new Date().toISOString().split("T")[0],
        membershipEnd: "",
        rating: "1200",
        fideId: "",
        usChessId: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        emergencyContact: "",
        emergencyPhone: "",
        notes: "",
        status: "active",
      })
    }
  }, [member, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = member ? `/api/members/${member.id}` : "/api/members"
      const method = member ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rating: parseInt(formData.rating),
          dateOfBirth: formData.dateOfBirth || null,
          membershipEnd: formData.membershipEnd || null,
        }),
      })

      if (response.ok) {
        onClose()
      }
    } catch (error) {
      console.error("Failed to save member:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{member ? "Edit Member" : "Add New Member"}</DialogTitle>
          <DialogDescription>
            {member ? "Update member information" : "Add a new member to your chess club"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="membershipType">Membership Type *</Label>
                <Select
                  id="membershipType"
                  value={formData.membershipType}
                  onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                  required
                >
                  <option value="junior">Junior</option>
                  <option value="senior">Senior</option>
                  <option value="premium">Premium</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="membershipStart">Membership Start *</Label>
                <Input
                  id="membershipStart"
                  type="date"
                  value={formData.membershipStart}
                  onChange={(e) => setFormData({ ...formData, membershipStart: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="membershipEnd">Membership End</Label>
                <Input
                  id="membershipEnd"
                  type="date"
                  value={formData.membershipEnd}
                  onChange={(e) => setFormData({ ...formData, membershipEnd: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating *</Label>
                <Input
                  id="rating"
                  type="number"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fideId">FIDE ID</Label>
                <Input
                  id="fideId"
                  value={formData.fideId}
                  onChange={(e) => setFormData({ ...formData, fideId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usChessId">US Chess ID</Label>
                <Input
                  id="usChessId"
                  value={formData.usChessId}
                  onChange={(e) => setFormData({ ...formData, usChessId: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : member ? "Update Member" : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
