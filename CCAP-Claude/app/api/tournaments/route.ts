import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { startDate: "desc" },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    })
    return NextResponse.json(tournaments)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tournaments" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const tournament = await prisma.tournament.create({
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
      { error: "Failed to create tournament" },
      { status: 500 }
    )
  }
}
