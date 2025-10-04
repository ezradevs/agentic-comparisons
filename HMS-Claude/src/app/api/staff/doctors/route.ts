import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Role } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only staff and admin can access doctor list
    if (user.role === Role.PATIENT) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const doctors = await prisma.staff.findMany({
      where: {
        user: {
          role: Role.DOCTOR,
          isActive: true
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        user: {
          firstName: 'asc'
        }
      }
    })

    return NextResponse.json({ doctors })

  } catch (error) {
    console.error('Fetch doctors error:', error)

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