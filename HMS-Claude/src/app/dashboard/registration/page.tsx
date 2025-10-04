'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, UserPlus, Users } from 'lucide-react'
import { BloodType, Gender, Role } from '@prisma/client'

const patientRegistrationSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.nativeEnum(Gender),

  // Address Information
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Please enter a valid zip code'),

  // Emergency Contact
  emergencyContact: z.string().min(1, 'Emergency contact name is required'),
  emergencyPhone: z.string().min(10, 'Please enter a valid emergency phone number'),

  // Medical Information
  bloodType: z.nativeEnum(BloodType).optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  insurance: z.string().optional(),
  insuranceId: z.string().optional(),

  // Account Information
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

const staffRegistrationSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.nativeEnum(Gender),

  // Address Information
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Please enter a valid zip code'),

  // Staff Information
  role: z.nativeEnum(Role).refine(role => role !== Role.PATIENT, {
    message: "Please select a valid staff role"
  }),
  department: z.string().min(1, 'Department is required'),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),

  // Account Information
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type PatientFormData = z.infer<typeof patientRegistrationSchema>
type StaffFormData = z.infer<typeof staffRegistrationSchema>

export default function RegistrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('patient')

  const patientForm = useForm<PatientFormData>({
    resolver: zodResolver(patientRegistrationSchema)
  })

  const staffForm = useForm<StaffFormData>({
    resolver: zodResolver(staffRegistrationSchema)
  })

  const onPatientSubmit = async (data: PatientFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/register/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      setSuccess('Patient registered successfully!')
      patientForm.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const onStaffSubmit = async (data: StaffFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/register/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      setSuccess('Staff member registered successfully!')
      staffForm.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Registration</h2>
        <p className="text-muted-foreground">
          Register new patients and staff members
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="patient" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Patient Registration</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Staff Registration</span>
          </TabsTrigger>
        </TabsList>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <TabsContent value="patient" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Registration</CardTitle>
              <CardDescription>
                Register a new patient in the hospital management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        {...patientForm.register('firstName')}
                        disabled={isLoading}
                      />
                      {patientForm.formState.errors.firstName && (
                        <p className="text-sm text-red-600">{patientForm.formState.errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        {...patientForm.register('lastName')}
                        disabled={isLoading}
                      />
                      {patientForm.formState.errors.lastName && (
                        <p className="text-sm text-red-600">{patientForm.formState.errors.lastName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...patientForm.register('email')}
                        disabled={isLoading}
                      />
                      {patientForm.formState.errors.email && (
                        <p className="text-sm text-red-600">{patientForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        {...patientForm.register('phone')}
                        disabled={isLoading}
                      />
                      {patientForm.formState.errors.phone && (
                        <p className="text-sm text-red-600">{patientForm.formState.errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...patientForm.register('dateOfBirth')}
                        disabled={isLoading}
                      />
                      {patientForm.formState.errors.dateOfBirth && (
                        <p className="text-sm text-red-600">{patientForm.formState.errors.dateOfBirth.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select onValueChange={(value) => patientForm.setValue('gender', value as Gender)} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Gender.MALE}>Male</SelectItem>
                          <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                          <SelectItem value={Gender.OTHER}>Other</SelectItem>
                          <SelectItem value={Gender.PREFER_NOT_TO_SAY}>Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      {patientForm.formState.errors.gender && (
                        <p className="text-sm text-red-600">{patientForm.formState.errors.gender.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        {...patientForm.register('address')}
                        disabled={isLoading}
                      />
                      {patientForm.formState.errors.address && (
                        <p className="text-sm text-red-600">{patientForm.formState.errors.address.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...patientForm.register('city')}
                        disabled={isLoading}
                      />
                      {patientForm.formState.errors.city && (
                        <p className="text-sm text-red-600">{patientForm.formState.errors.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        {...patientForm.register('state')}
                        disabled={isLoading}
                      />
                      {patientForm.formState.errors.state && (
                        <p className="text-sm text-red-600">{patientForm.formState.errors.state.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        {...patientForm.register('zipCode')}
                        disabled={isLoading}
                      />
                      {patientForm.formState.errors.zipCode && (
                        <p className="text-sm text-red-600">{patientForm.formState.errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContact"
                        {...patientForm.register('emergencyContact')}
                        disabled={isLoading}
                      />
                      {patientForm.formState.errors.emergencyContact && (
                        <p className="text-sm text-red-600">{patientForm.formState.errors.emergencyContact.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                      <Input
                        id="emergencyPhone"
                        {...patientForm.register('emergencyPhone')}
                        disabled={isLoading}
                      />
                      {patientForm.formState.errors.emergencyPhone && (
                        <p className="text-sm text-red-600">{patientForm.formState.errors.emergencyPhone.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bloodType">Blood Type (Optional)</Label>
                      <Select onValueChange={(value) => patientForm.setValue('bloodType', value as BloodType)} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BloodType.A_POSITIVE}>A+</SelectItem>
                          <SelectItem value={BloodType.A_NEGATIVE}>A-</SelectItem>
                          <SelectItem value={BloodType.B_POSITIVE}>B+</SelectItem>
                          <SelectItem value={BloodType.B_NEGATIVE}>B-</SelectItem>
                          <SelectItem value={BloodType.AB_POSITIVE}>AB+</SelectItem>
                          <SelectItem value={BloodType.AB_NEGATIVE}>AB-</SelectItem>
                          <SelectItem value={BloodType.O_POSITIVE}>O+</SelectItem>
                          <SelectItem value={BloodType.O_NEGATIVE}>O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insurance">Insurance Provider (Optional)</Label>
                      <Input
                        id="insurance"
                        {...patientForm.register('insurance')}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insuranceId">Insurance ID (Optional)</Label>
                      <Input
                        id="insuranceId"
                        {...patientForm.register('insuranceId')}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="allergies">Allergies (Optional)</Label>
                      <Textarea
                        id="allergies"
                        {...patientForm.register('allergies')}
                        disabled={isLoading}
                        placeholder="List any known allergies..."
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="medicalHistory">Medical History (Optional)</Label>
                      <Textarea
                        id="medicalHistory"
                        {...patientForm.register('medicalHistory')}
                        disabled={isLoading}
                        placeholder="Provide relevant medical history..."
                      />
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        {...patientForm.register('password')}
                        disabled={isLoading}
                      />
                      {patientForm.formState.errors.password && (
                        <p className="text-sm text-red-600">{patientForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...patientForm.register('confirmPassword')}
                        disabled={isLoading}
                      />
                      {patientForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-600">{patientForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering Patient...
                    </>
                  ) : (
                    'Register Patient'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Registration</CardTitle>
              <CardDescription>
                Register a new staff member in the hospital management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Staff registration form would go here with similar structure to patient registration
                but including additional fields for role, department, specialization, and license number.
              </p>
              <p className="text-sm text-blue-600">
                This form follows the same pattern as patient registration with role-specific fields.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}