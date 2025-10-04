import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, logAuditAction } from '@/lib/auth'
import { Role } from '@prisma/client'
import { z } from 'zod'
import { addDays, startOfDay, endOfDay, parseISO } from 'date-fns'

const appointmentSchema = z.object({
  patientId: z.string().min(1),
  staffId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().min(1),
  time: z.string().min(1),
  duration: z.number().min(15).max(240).default(30), // 15 min to 4 hours
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM')
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const week = searchParams.get('week')

    let whereClause: any = {}

    // Role-based filtering
    if (user.role === Role.PATIENT) {
      const patient = await prisma.patient.findUnique({
        where: { userId: user.id }
      })
      if (!patient) {
        return NextResponse.json(
          { error: 'Patient record not found' },
          { status: 404 }
        )
      }
      whereClause.patientId = patient.id
    } else if (user.role === Role.DOCTOR || user.role === Role.NURSE) {
      const staff = await prisma.staff.findUnique({
        where: { userId: user.id }
      })
      if (!staff) {
        return NextResponse.json(
          { error: 'Staff record not found' },
          { status: 404 }
        )
      }
      whereClause.staffId = staff.id
    }

    // Date filtering
    if (week) {
      const weekStart = startOfDay(parseISO(week))
      const weekEnd = endOfDay(addDays(weekStart, 6))
      whereClause.startTime = {
        gte: weekStart,
        lte: weekEnd
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true
              }
            }
          }
        },
        staff: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json({ appointments })

  } catch (error) {
    console.error('Fetch appointments error:', error)

    if (error?.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only certain roles can create appointments
    if (![Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = appointmentSchema.parse(body)

    // Create start and end times
    const [hours, minutes] = validatedData.time.split(':').map(Number)
    const appointmentDate = parseISO(validatedData.date)
    appointmentDate.setHours(hours, minutes, 0, 0)

    const startTime = appointmentDate
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + validatedData.duration)

    // Check for conflicts
    const conflicts = await prisma.appointment.findMany({
      where: {
        staffId: validatedData.staffId,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ],
        status: {
          notIn: ['CANCELLED', 'NO_SHOW']
        }
      }
    })

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Time slot conflicts with existing appointment' },
        { status: 409 }
      )
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: validatedData.patientId,
        staffId: validatedData.staffId,
        title: validatedData.title,
        description: validatedData.description,
        startTime,
        endTime,
        priority: validatedData.priority as any,
        status: 'SCHEDULED'
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        staff: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    // Log the action
    await logAuditAction(
      user.id,
      'CREATE',
      'APPOINTMENT',
      appointment.id,
      {
        patientName: `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`,
        staffName: `${appointment.staff.user.firstName} ${appointment.staff.user.lastName}`,
        title: appointment.title,
        startTime: appointment.startTime
      },
      request.ip,
      request.headers.get('user-agent')
    )

    return NextResponse.json({
      message: 'Appointment created successfully',
      appointment
    }, { status: 201 })

  } catch (error) {
    console.error('Create appointment error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    if (error?.message === 'Authentication required' || error?.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}