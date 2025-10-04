'use client'

import { useSession } from 'next-auth/react'
import { Role } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Users,
  FileText,
  Pill,
  FlaskConical,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()

  if (!session) return null

  const userRole = session.user.role

  // Mock data - in real app, this would come from API
  const stats = {
    totalPatients: 1284,
    todayAppointments: 23,
    pendingTests: 15,
    activePrescriptions: 42,
    pendingBills: 8,
    totalRevenue: 125000
  }

  const recentActivities = [
    { id: 1, type: 'appointment', message: 'New appointment scheduled with Dr. Smith', time: '10 mins ago', status: 'info' },
    { id: 2, type: 'prescription', message: 'Prescription dispensed for John Doe', time: '25 mins ago', status: 'success' },
    { id: 3, type: 'test', message: 'Lab results available for Jane Smith', time: '1 hour ago', status: 'warning' },
    { id: 4, type: 'billing', message: 'Payment received for invoice #INV-001', time: '2 hours ago', status: 'success' }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your hospital management system
        </p>
      </div>

      {/* Stats Grid */}
      {[Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST].includes(userRole) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">+3 from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTests}</div>
              <p className="text-xs text-muted-foreground">-2 from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePrescriptions}</div>
              <p className="text-xs text-muted-foreground">+8 from last week</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Stats for Admin */}
      {userRole === Role.ADMIN && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBills}</div>
              <p className="text-xs text-muted-foreground">-3 from yesterday</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Patient-specific dashboard */}
      {userRole === Role.PATIENT && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">Tomorrow, 2:30 PM</p>
                <p className="text-sm text-muted-foreground">Dr. Smith - General Checkup</p>
                <Badge variant="outline">Confirmed</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold">Blood Test - Complete</p>
                <p className="text-sm text-muted-foreground">All values within normal range</p>
                <Badge variant="secondary">View Details</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold">3 active medications</p>
                <p className="text-sm text-muted-foreground">Next refill due in 5 days</p>
                <Badge variant="outline">Manage</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your hospital system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                {getStatusIcon(activity.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Commonly used functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {userRole === Role.PATIENT && (
              <>
                <button className="flex items-center space-x-2 p-3 text-left border rounded-lg hover:bg-gray-50">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Book Appointment</span>
                </button>
                <button className="flex items-center space-x-2 p-3 text-left border rounded-lg hover:bg-gray-50">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">View Records</span>
                </button>
              </>
            )}

            {[Role.DOCTOR, Role.NURSE].includes(userRole) && (
              <>
                <button className="flex items-center space-x-2 p-3 text-left border rounded-lg hover:bg-gray-50">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Patient List</span>
                </button>
                <button className="flex items-center space-x-2 p-3 text-left border rounded-lg hover:bg-gray-50">
                  <Pill className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Prescriptions</span>
                </button>
              </>
            )}

            {userRole === Role.ADMIN && (
              <>
                <button className="flex items-center space-x-2 p-3 text-left border rounded-lg hover:bg-gray-50">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Manage Staff</span>
                </button>
                <button className="flex items-center space-x-2 p-3 text-left border rounded-lg hover:bg-gray-50">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">View Reports</span>
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}