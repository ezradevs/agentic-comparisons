"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"

type Member = {
  id: string
  firstName: string
  lastName: string
  rating: number
  membershipType: string
  status: string
  fideId: string | null
  usChessId: string | null
}

export default function RatingsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    avgRating: 0,
    highestRating: 0,
    lowestRating: 0,
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    let filtered = members.filter((member) => {
      const query = searchQuery.toLowerCase()
      return (
        member.firstName.toLowerCase().includes(query) ||
        member.lastName.toLowerCase().includes(query)
      )
    })

    // Sort
    if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating)
    } else {
      filtered.sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      )
    }

    setFilteredMembers(filtered)
  }, [searchQuery, members, sortBy])

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/members")
      const data = await response.json()
      setMembers(data)

      // Calculate stats
      if (data.length > 0) {
        const ratings = data.map((m: Member) => m.rating)
        const avg = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        const max = Math.max(...ratings)
        const min = Math.min(...ratings)

        setStats({
          avgRating: Math.round(avg),
          highestRating: max,
          lowestRating: min,
        })
      }
    } catch (error) {
      console.error("Failed to fetch members:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRatingCategory = (rating: number) => {
    if (rating >= 2400) return { label: "Master", color: "default" }
    if (rating >= 2200) return { label: "Expert", color: "secondary" }
    if (rating >= 2000) return { label: "Advanced", color: "success" }
    if (rating >= 1600) return { label: "Intermediate", color: "outline" }
    return { label: "Beginner", color: "secondary" }
  }

  const getRatingTrend = (rating: number) => {
    const avg = stats.avgRating
    if (rating > avg + 100) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (rating < avg - 100) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ratings & Rankings</h1>
        <p className="text-gray-500 mt-1">Track member ratings and performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Rating
            </CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Trophy className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}</div>
            <p className="text-xs text-gray-500 mt-1">Club average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Highest Rating
            </CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highestRating}</div>
            <p className="text-xs text-gray-500 mt-1">Top performer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Rating Range
            </CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <TrendingDown className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.highestRating - stats.lowestRating}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.lowestRating} - {stats.highestRating}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search members by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy("rating")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  sortBy === "rating"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Sort by Rating
              </button>
              <button
                onClick={() => setSortBy("name")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  sortBy === "name"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Sort by Name
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading ratings...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No members found matching your search." : "No members yet."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>FIDE ID</TableHead>
                  <TableHead>US Chess ID</TableHead>
                  <TableHead>Membership</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member, index) => {
                  const category = getRatingCategory(member.rating)
                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-bold text-center">
                        {sortBy === "rating" ? (
                          index === 0 ? (
                            <span className="text-yellow-600">🥇 {index + 1}</span>
                          ) : index === 1 ? (
                            <span className="text-gray-400">🥈 {index + 1}</span>
                          ) : index === 2 ? (
                            <span className="text-orange-600">🥉 {index + 1}</span>
                          ) : (
                            index + 1
                          )
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {member.firstName} {member.lastName}
                      </TableCell>
                      <TableCell className="text-lg font-bold">{member.rating}</TableCell>
                      <TableCell>
                        <Badge variant={category.color as any}>{category.label}</Badge>
                      </TableCell>
                      <TableCell>{getRatingTrend(member.rating)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {member.fideId || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {member.usChessId || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.membershipType}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
