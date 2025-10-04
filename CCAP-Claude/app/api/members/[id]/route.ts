import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const body = await request.json()
    const member = await prisma.member.update({
      where: { id: params.id },
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
      { error: "Failed to update member" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    await prisma.member.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    )
  }
}
