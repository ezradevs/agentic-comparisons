import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Insufficient permissions")
  }
  return user
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export async function createUser(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  role: Role
  phone?: string
  dateOfBirth?: Date
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY"
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  })

  if (existingUser) {
    throw new Error("User already exists")
  }

  const hashedPassword = await hashPassword(userData.password)

  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword
    }
  })

  // Create patient record if role is PATIENT
  if (userData.role === Role.PATIENT) {
    const patientId = `P${Date.now().toString().slice(-6)}`
    await prisma.patient.create({
      data: {
        userId: user.id,
        patientId
      }
    })
  }

  // Create staff record if role is not PATIENT
  if (userData.role !== Role.PATIENT) {
    const staffId = `S${Date.now().toString().slice(-6)}`
    await prisma.staff.create({
      data: {
        userId: user.id,
        staffId,
        department: getDefaultDepartment(userData.role),
        hireDate: new Date()
      }
    })
  }

  return user
}

function getDefaultDepartment(role: Role): string {
  switch (role) {
    case Role.DOCTOR:
      return "General Medicine"
    case Role.NURSE:
      return "Nursing"
    case Role.LAB_TECHNICIAN:
      return "Laboratory"
    case Role.PHARMACIST:
      return "Pharmacy"
    case Role.RECEPTIONIST:
      return "Administration"
    case Role.ADMIN:
      return "Administration"
    default:
      return "General"
  }
}

export async function logAuditAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent
    }
  })
}