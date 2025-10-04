import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(members)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const member = await prisma.member.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || null,
        phone: body.phone || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        membershipType: body.membershipType,
        membershipStart: new Date(body.membershipStart),
        membershipEnd: body.membershipEnd ? new Date(body.membershipEnd) : null,
        rating: body.rating,
        fideId: body.fideId || null,
        usChessId: body.usChessId || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        zipCode: body.zipCode || null,
        emergencyContact: body.emergencyContact || null,
        emergencyPhone: body.emergencyPhone || null,
        notes: body.notes || null,
        status: body.status,
      },
    })
    return NextResponse.json(member)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    )
  }
}
