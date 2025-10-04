'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Phone
} from 'lucide-react'
import { AppointmentStatus, Priority, Role } from '@prisma/client'

interface Appointment {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  priority: Priority
  patient: {
    user: {
      firstName: string
      lastName: string
      phone?: string
    }
    patientId: string
  }
  staff: {
    user: {
      firstName: string
      lastName: string
    }
    department: string
    specialization?: string
  }
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
]

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.CONFIRMED:
      return 'bg-green-100 text-green-800'
    case AppointmentStatus.SCHEDULED:
      return 'bg-blue-100 text-blue-800'
    case AppointmentStatus.IN_PROGRESS:
      return 'bg-yellow-100 text-yellow-800'
    case AppointmentStatus.COMPLETED:
      return 'bg-gray-100 text-gray-800'
    case AppointmentStatus.CANCELLED:
      return 'bg-red-100 text-red-800'
    case AppointmentStatus.NO_SHOW:
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case Priority.URGENT:
      return 'border-l-red-500'
    case Priority.HIGH:
      return 'border-l-orange-500'
    case Priority.MEDIUM:
      return 'border-l-yellow-500'
    case Priority.LOW:
      return 'border-l-green-500'
    default:
      return 'border-l-gray-500'
  }
}

export default function AppointmentsPage() {
  const { data: session } = useSession()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [doctors, setDoctors] = useState<any[]>([])

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Start on Monday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    fetchAppointments()
    if (session?.user?.role !== Role.PATIENT) {
      fetchDoctors()
    }
  }, [currentWeek, session])

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/appointments?week=${format(weekStart, 'yyyy-MM-dd')}`)
      const data = await response.json()

      if (response.ok) {
        setAppointments(data.appointments)
      } else {
        setError(data.error || 'Failed to fetch appointments')
      }
    } catch (err) {
      setError('Failed to fetch appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/staff/doctors')
      const data = await response.json()
      if (response.ok) {
        setDoctors(data.doctors)
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err)
    }
  }

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(appointment =>
      isSameDay(parseISO(appointment.startTime), date)
    )
  }

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1))
  }

  const goToNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1))
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  if (!session) return null

  const userRole = session.user.role

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">
            Manage and view appointments
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>

          {[Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE].includes(userRole) && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                  <DialogDescription>
                    Create a new appointment for a patient
                  </DialogDescription>
                </DialogHeader>
                <AppointmentForm
                  doctors={doctors}
                  selectedDate={selectedDate}
                  onSuccess={() => {
                    setIsDialogOpen(false)
                    fetchAppointments()
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-semibold">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
        </div>

        <Button variant="outline" size="sm" onClick={goToNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekly Calendar View */}
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day)
          const isToday = isSameDay(day, new Date())

          return (
            <Card
              key={index}
              className={`min-h-[400px] ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {format(day, 'EEE')}
                </CardTitle>
                <CardDescription className="text-lg font-semibold">
                  {format(day, 'd')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-2 rounded-lg border-l-4 ${getPriorityColor(appointment.priority)} bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-600">
                          {format(parseISO(appointment.startTime), 'HH:mm')}
                        </span>
                        <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </Badge>
                      </div>

                      <h4 className="text-sm font-medium truncate">
                        {appointment.title}
                      </h4>

                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <User className="h-3 w-3 mr-1" />
                        <span className="truncate">
                          {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                        </span>
                      </div>

                      <div className="flex items-center text-xs text-gray-500">
                        <Stethoscope className="h-3 w-3 mr-1" />
                        <span className="truncate">
                          Dr. {appointment.staff.user.firstName} {appointment.staff.user.lastName}
                        </span>
                      </div>

                      {appointment.priority === Priority.URGENT && (
                        <div className="mt-1">
                          <Badge variant="destructive" className="text-xs">
                            URGENT
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}

                  {dayAppointments.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">
                      No appointments
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">Total appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length}
            </div>
            <p className="text-xs text-muted-foreground">Ready to go</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === AppointmentStatus.SCHEDULED).length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.priority === Priority.URGENT).length}
            </div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Appointment Form Component
function AppointmentForm({
  doctors,
  selectedDate,
  onSuccess
}: {
  doctors: any[]
  selectedDate: Date
  onSuccess: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Form submission logic would go here
    setTimeout(() => {
      setIsSubmitting(false)
      onSuccess()
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="patient">Patient</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Search patient..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="patient1">John Doe (P123456)</SelectItem>
            <SelectItem value="patient2">Jane Smith (P123457)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="doctor">Doctor</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select doctor..." />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                Dr. {doctor.user.firstName} {doctor.user.lastName} - {doctor.specialization}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            type="date"
            defaultValue={format(selectedDate, 'yyyy-MM-dd')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Appointment Title</Label>
        <Input placeholder="e.g., General Checkup" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea placeholder="Additional notes..." />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
      </Button>
    </form>
  )
}