import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { paymentDate: "desc" },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })
    return NextResponse.json(payments)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payment = await prisma.payment.create({
      data: {
        memberId: body.memberId,
        amount: body.amount,
        paymentType: body.paymentType,
        paymentMethod: body.paymentMethod,
        description: body.description || null,
        status: body.status,
        paymentDate: new Date(body.paymentDate),
      },
    })
    return NextResponse.json(payment)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}
