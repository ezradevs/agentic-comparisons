'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Role } from '@prisma/client'

interface HeaderProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    role: Role
    firstName: string
    lastName: string
  }
}

function getRoleDisplayName(role: Role): string {
  switch (role) {
    case Role.PATIENT:
      return 'Patient'
    case Role.DOCTOR:
      return 'Doctor'
    case Role.NURSE:
      return 'Nurse'
    case Role.ADMIN:
      return 'Administrator'
    case Role.RECEPTIONIST:
      return 'Receptionist'
    case Role.LAB_TECHNICIAN:
      return 'Lab Technician'
    case Role.PHARMACIST:
      return 'Pharmacist'
    default:
      return role
  }
}

function getRoleBadgeVariant(role: Role): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (role) {
    case Role.ADMIN:
      return 'destructive'
    case Role.DOCTOR:
      return 'default'
    case Role.NURSE:
      return 'secondary'
    default:
      return 'outline'
  }
}

export function Header({ user }: HeaderProps) {
  const [notificationCount] = useState(3) // This would come from actual notification system

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}