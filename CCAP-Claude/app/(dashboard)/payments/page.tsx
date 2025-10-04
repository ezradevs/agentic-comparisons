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
import { Plus, Search, DollarSign, TrendingUp, Calendar } from "lucide-react"
import PaymentDialog from "./payment-dialog"
import { formatDate, formatCurrency } from "@/lib/utils"

type Payment = {
  id: string
  amount: number
  paymentType: string
  paymentMethod: string
  description: string | null
  status: string
  paymentDate: string
  member: {
    id: string
    firstName: string
    lastName: string
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    const filtered = payments.filter((payment) => {
      const query = searchQuery.toLowerCase()
      return (
        payment.member.firstName.toLowerCase().includes(query) ||
        payment.member.lastName.toLowerCase().includes(query) ||
        payment.paymentType.toLowerCase().includes(query)
      )
    })
    setFilteredPayments(filtered)
  }, [searchQuery, payments])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments")
      const data = await response.json()
      setPayments(data)
      setFilteredPayments(data)

      // Calculate stats
      const total = data.reduce((sum: number, p: Payment) =>
        p.status === "completed" ? sum + p.amount : sum, 0
      )
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthly = data.reduce((sum: number, p: Payment) =>
        p.status === "completed" && new Date(p.paymentDate) >= monthStart
          ? sum + p.amount : sum, 0
      )
      const pending = data.filter((p: Payment) => p.status === "pending").length

      setStats({
        totalRevenue: total,
        monthlyRevenue: monthly,
        pendingPayments: pending,
      })
    } catch (error) {
      console.error("Failed to fetch payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    fetchPayments()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success"
      case "pending":
        return "warning"
      case "refunded":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "membership":
        return "default"
      case "tournament":
        return "secondary"
      case "event":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Track payments and revenue</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month
            </CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Payments
            </CardTitle>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting completion</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search payments by member name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading payments...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No payments found matching your search." : "No payments yet. Record your first payment!"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.member.firstName} {payment.member.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentTypeColor(payment.paymentType)}>
                        {payment.paymentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {payment.description || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PaymentDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  )
}
