import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createUser, logAuditAction } from '@/lib/auth'
import { Role, Gender, BloodType } from '@prisma/client'

const patientRegistrationSchema = z.object({
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

  // Emergency Contact
  emergencyContact: z.string().min(1),
  emergencyPhone: z.string().min(10),

  // Medical Information
  bloodType: z.nativeEnum(BloodType).optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  insurance: z.string().optional(),
  insuranceId: z.string().optional(),

  // Account Information
  password: z.string().min(6),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = patientRegistrationSchema.parse(body)

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

    // Create user with patient role
    const user = await createUser({
      email: validatedData.email,
      password: validatedData.password,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: Role.PATIENT,
      phone: validatedData.phone,
      dateOfBirth: new Date(validatedData.dateOfBirth),
      gender: validatedData.gender,
      address: validatedData.address,
      city: validatedData.city,
      state: validatedData.state,
      zipCode: validatedData.zipCode,
      emergencyContact: validatedData.emergencyContact,
      emergencyPhone: validatedData.emergencyPhone
    })

    // Update patient record with additional medical information
    await prisma.patient.update({
      where: { userId: user.id },
      data: {
        bloodType: validatedData.bloodType,
        allergies: validatedData.allergies,
        medicalHistory: validatedData.medicalHistory,
        insurance: validatedData.insurance,
        insuranceId: validatedData.insuranceId
      }
    })

    // Log the registration
    await logAuditAction(
      user.id,
      'CREATE',
      'PATIENT',
      user.id,
      {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email
      },
      request.ip,
      request.headers.get('user-agent')
    )

    return NextResponse.json({
      message: 'Patient registered successfully',
      patientId: user.id
    })

  } catch (error) {
    console.error('Patient registration error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}