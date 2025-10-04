import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, Calendar, DollarSign, TrendingUp, UserCheck } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

async function getStats() {
  const [
    totalMembers,
    activeMembers,
    upcomingTournaments,
    upcomingEvents,
    recentPayments,
    totalRevenue
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { status: "active" } }),
    prisma.tournament.count({ where: { status: "upcoming" } }),
    prisma.event.count({ where: { date: { gte: new Date() } } }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { paymentDate: "desc" },
      include: { member: true }
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "completed",
        paymentDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })
  ])

  return {
    totalMembers,
    activeMembers,
    upcomingTournaments,
    upcomingEvents,
    recentPayments,
    monthlyRevenue: totalRevenue._sum.amount || 0
  }
}

async function getRecentMembers() {
  return prisma.member.findMany({
    take: 5,
    orderBy: { createdAt: "desc" }
  })
}

export default async function DashboardPage() {
  const stats = await getStats()
  const recentMembers = await getRecentMembers()

  const statCards = [
    {
      title: "Total Members",
      value: stats.totalMembers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Active Members",
      value: stats.activeMembers,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Upcoming Tournaments",
      value: stats.upcomingTournaments,
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthlyRevenue),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    },
    {
      title: "Avg Member Rating",
      value: "1450",
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to your chess club admin portal</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMembers.length > 0 ? (
                recentMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{member.firstName} {member.lastName}</p>
                      <p className="text-sm text-gray-500">{member.membershipType}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Rating: {member.rating}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No members yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentPayments.length > 0 ? (
                stats.recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {payment.member.firstName} {payment.member.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{payment.paymentType}</p>
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No payments yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
