import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { Role } from "@prisma/client"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return null
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname
      if (req.nextUrl.search) {
        from += req.nextUrl.search
      }

      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      )
    }

    // Role-based access control
    const userRole = token?.role as Role
    const pathname = req.nextUrl.pathname

    // Admin-only routes
    if (pathname.startsWith("/admin") && userRole !== Role.ADMIN) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // Doctor/Nurse routes
    if (
      pathname.startsWith("/medical") &&
      ![Role.DOCTOR, Role.NURSE, Role.ADMIN].includes(userRole)
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // Lab technician routes
    if (
      pathname.startsWith("/lab") &&
      ![Role.LAB_TECHNICIAN, Role.DOCTOR, Role.ADMIN].includes(userRole)
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // Pharmacist routes
    if (
      pathname.startsWith("/pharmacy") &&
      ![Role.PHARMACIST, Role.DOCTOR, Role.ADMIN].includes(userRole)
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // Patient-specific routes
    if (pathname.startsWith("/patient") && userRole !== Role.PATIENT) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    return null
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
    "/api/((?!auth).+)"
  ],
}