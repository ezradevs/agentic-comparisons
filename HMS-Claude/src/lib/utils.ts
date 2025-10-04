import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString()
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleString()
}

export function formatTime(date: Date | string | null): string {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function calculateAge(birthDate: Date | string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export function generatePatientId(): string {
  return `P${Date.now().toString().slice(-6)}`
}

export function generateStaffId(): string {
  return `S${Date.now().toString().slice(-6)}`
}

export function generateInvoiceNumber(): string {
  return `INV-${Date.now().toString().slice(-8)}`
}