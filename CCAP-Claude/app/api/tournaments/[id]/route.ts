import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const body = await request.json()
    const tournament = await prisma.tournament.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description || null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        location: body.location || null,
        format: body.format,
        timeControl: body.timeControl,
        entryFee: body.entryFee,
        maxParticipants: body.maxParticipants || null,
        status: body.status,
      },
    })
    return NextResponse.json(tournament)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update tournament" },
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
    await prisma.tournament.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete tournament" },
      { status: 500 }
    )
  }
}
