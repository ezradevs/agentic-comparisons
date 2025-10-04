import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      firstName: string
      lastName: string
      phone?: string
      patient?: any
      staff?: any
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: Role
    firstName: string
    lastName: string
    phone?: string
    patient?: any
    staff?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    firstName: string
    lastName: string
    phone?: string
    patient?: any
    staff?: any
  }
}