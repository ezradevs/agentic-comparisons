import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createUser, logAuditAction, requireRole } from '@/lib/auth'
import { Role, Gender } from '@prisma/client'

const staffRegistrationSchema = z.object({
  // Personal Information
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  dateOfBirth: z.string().min(1),
  gender: z.nativeEnum(Gender),

  // Address Information
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(5),

  // Staff Information
  role: z.nativeEnum(Role).refine(role => role !== Role.PATIENT),
  department: z.string().min(1),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),

  // Account Information
  password: z.string().min(6),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export async function POST(request: NextRequest) {
  try {
    // Only admins can register staff
    await requireRole([Role.ADMIN])

    const body = await request.json()
    const validatedData = staffRegistrationSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Create user with staff role
    const user = await createUser({
      email: validatedData.email,
      password: validatedData.password,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: validatedData.role,
      phone: validatedData.phone,
      dateOfBirth: new Date(validatedData.dateOfBirth),
      gender: validatedData.gender,
      address: validatedData.address,
      city: validatedData.city,
      state: validatedData.state,
      zipCode: validatedData.zipCode
    })

    // Update staff record with additional information
    await prisma.staff.update({
      where: { userId: user.id },
      data: {
        department: validatedData.department,
        specialization: validatedData.specialization,
        licenseNumber: validatedData.licenseNumber
      }
    })

    // Log the registration
    const currentUser = await requireRole([Role.ADMIN])
    await logAuditAction(
      currentUser.id,
      'CREATE',
      'STAFF',
      user.id,
      {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        role: validatedData.role,
        department: validatedData.department
      },
      request.ip,
      request.headers.get('user-agent')
    )

    return NextResponse.json({
      message: 'Staff member registered successfully',
      staffId: user.id
    })

  } catch (error) {
    console.error('Staff registration error:', error)

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