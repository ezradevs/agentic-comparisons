'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Role } from '@prisma/client'
import { cn } from '@/lib/utils'
import {
  Calendar,
  FileText,
  Users,
  Stethoscope,
  Pill,
  FlaskConical,
  CreditCard,
  BarChart3,
  Settings,
  Hospital,
  UserCheck,
  ClipboardList,
  HeartPulse,
  Activity
} from 'lucide-react'

interface SidebarProps {
  userRole: Role
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: Role[]
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    roles: [Role.PATIENT, Role.DOCTOR, Role.NURSE, Role.ADMIN, Role.RECEPTIONIST, Role.LAB_TECHNICIAN, Role.PHARMACIST]
  },
  {
    title: 'Appointments',
    href: '/dashboard/appointments',
    icon: Calendar,
    roles: [Role.PATIENT, Role.DOCTOR, Role.NURSE, Role.ADMIN, Role.RECEPTIONIST]
  },
  {
    title: 'Patients',
    href: '/dashboard/patients',
    icon: Users,
    roles: [Role.DOCTOR, Role.NURSE, Role.ADMIN, Role.RECEPTIONIST]
  },
  {
    title: 'Medical Records',
    href: '/dashboard/medical-records',
    icon: FileText,
    roles: [Role.PATIENT, Role.DOCTOR, Role.NURSE, Role.ADMIN]
  },
  {
    title: 'Medical Charting',
    href: '/dashboard/charting',
    icon: HeartPulse,
    roles: [Role.DOCTOR, Role.NURSE, Role.ADMIN]
  },
  {
    title: 'Prescriptions',
    href: '/dashboard/prescriptions',
    icon: Pill,
    roles: [Role.PATIENT, Role.DOCTOR, Role.PHARMACIST, Role.ADMIN]
  },
  {
    title: 'Lab Tests',
    href: '/dashboard/lab-tests',
    icon: FlaskConical,
    roles: [Role.PATIENT, Role.DOCTOR, Role.LAB_TECHNICIAN, Role.ADMIN]
  },
  {
    title: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard,
    roles: [Role.PATIENT, Role.ADMIN, Role.RECEPTIONIST]
  },
  {
    title: 'Staff Management',
    href: '/dashboard/staff',
    icon: UserCheck,
    roles: [Role.ADMIN]
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: Activity,
    roles: [Role.ADMIN, Role.DOCTOR]
  },
  {
    title: 'Registration',
    href: '/dashboard/registration',
    icon: ClipboardList,
    roles: [Role.ADMIN, Role.RECEPTIONIST]
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: [Role.ADMIN]
  }
]

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const filteredNavigation = navigation.filter(item => item.roles.includes(userRole))

  return (
    <div className="bg-white w-64 shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Hospital className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">HMS</span>
        </div>
      </div>

      <nav className="mt-6">
        <div className="px-3">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-md text-sm font-medium mb-1 transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}