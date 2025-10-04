# Hospital Management System

A comprehensive, modern hospital management and charting system built with Next.js, TypeScript, and Prisma. This system provides secure user authentication with role-based access control, patient management, appointment scheduling, electronic medical records, and much more.

## 🏥 Features

### Core Features Implemented

- ✅ **Secure Authentication System** with NextAuth.js
- ✅ **Role-Based Access Control (RBAC)** for different user types
- ✅ **Comprehensive Database Schema** with Prisma ORM
- ✅ **Patient Registration & Intake Forms** with validation
- ✅ **Appointment Scheduling System** with calendar integration
- ✅ **Responsive Dashboard** with role-specific navigation

### User Roles

- **Patients**: View appointments, medical records, prescriptions, billing
- **Doctors**: Manage patients, appointments, prescriptions, medical records
- **Nurses**: Assist with patient care, view schedules, update records
- **Administrators**: Full system access, staff management, reports
- **Receptionists**: Patient registration, appointment scheduling
- **Lab Technicians**: Manage lab orders and results
- **Pharmacists**: Handle prescription management

### Planned Features

- 🔄 Electronic Medical Records (EMR) system
- 🔄 Medical charting with real-time updates
- 🔄 Medication management and prescription tracking
- 🔄 Laboratory test ordering and result recording
- 🔄 Billing and invoicing system
- 🔄 Data export functionality (PDF, CSV)
- 🔄 Audit logging for compliance
- 🔄 Notification system for critical events
- 🔄 HL7/FHIR interoperability standards support

## 🚀 Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (configurable)
- **Authentication**: NextAuth.js with JWT
- **UI Components**: Radix UI, Lucide Icons
- **Form Handling**: React Hook Form with Zod validation
- **Real-time Features**: Socket.io, Pusher (planned)
- **Charts & Analytics**: Recharts
- **File Export**: jsPDF, PapaParse

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hospital-management-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment template:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/hospital_management"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# Hospital Configuration
HOSPITAL_NAME="City General Hospital"
HOSPITAL_ADDRESS="123 Main Street, City, State 12345"
HOSPITAL_PHONE="+1-555-0123"
```

### 4. Database Setup

Generate Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma db push
```

Optional: Seed the database with sample data:

```bash
npx prisma db seed
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Default Login

Since this is a development version, you'll need to register users through the registration forms or create them directly in the database.

## 📱 Usage

### For Administrators

1. **Staff Management**: Register new staff members with appropriate roles
2. **Patient Management**: Oversee patient registrations and records
3. **System Configuration**: Manage hospital settings and user permissions
4. **Reports & Analytics**: View system-wide statistics and reports

### For Medical Staff (Doctors/Nurses)

1. **Patient Care**: Access patient records and medical history
2. **Appointment Management**: Schedule and manage patient appointments
3. **Medical Records**: Create and update patient medical records
4. **Prescriptions**: Manage patient medications and prescriptions

### For Patients

1. **Profile Management**: Update personal information and medical history
2. **Appointments**: View and schedule appointments with doctors
3. **Medical Records**: Access personal medical records and test results
4. **Billing**: View invoices and payment history

### For Reception Staff

1. **Patient Registration**: Register new patients in the system
2. **Appointment Scheduling**: Coordinate appointments between patients and doctors
3. **Basic Patient Management**: Update patient contact information

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application dashboard
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── layout/           # Layout components (sidebar, header)
│   ├── providers/        # Context providers
│   └── ui/              # Base UI components
├── lib/                  # Utility functions and configurations
├── types/               # TypeScript type definitions
└── styles/              # Global styles and Tailwind config

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Database migration files
```

## 🛡️ Security Features

- **Authentication**: Secure JWT-based authentication with NextAuth.js
- **Role-Based Access Control**: Granular permissions for different user roles
- **Input Validation**: Comprehensive form validation with Zod schemas
- **Audit Logging**: Track all system actions for compliance
- **Password Security**: Bcrypt hashing for password storage
- **HIPAA Compliance Ready**: Designed with healthcare data privacy in mind

## 📊 Database Schema

The system includes comprehensive models for:

- **Users & Authentication**: User accounts with role management
- **Patients**: Patient profiles with medical history
- **Staff**: Healthcare staff with specializations
- **Appointments**: Scheduling system with conflict detection
- **Medical Records**: Electronic health records
- **Prescriptions**: Medication management
- **Lab Tests**: Laboratory order and result tracking
- **Billing**: Invoice and payment management
- **Audit Logs**: System activity tracking

## 🧪 Development

### Running Tests

```bash
npm test
```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check
```

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma db reset
```

## 🚀 Deployment

### Production Environment Variables

Ensure all environment variables are properly set for production:

- Use a secure `NEXTAUTH_SECRET`
- Configure proper database URLs
- Set up email services for notifications
- Configure file storage for attachments

### Deployment Options

- **Vercel**: Recommended for Next.js applications
- **Railway**: Good for full-stack applications with databases
- **Docker**: Container deployment for any cloud provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation and existing issues first
- Provide detailed information about your setup and the issue

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core authentication and RBAC
- ✅ Basic patient and staff management
- ✅ Appointment scheduling

### Phase 2 (In Progress)
- 🔄 Electronic Medical Records (EMR)
- 🔄 Medical charting and vitals
- 🔄 Prescription management

### Phase 3 (Planned)
- 📅 Laboratory management
- 📅 Billing and invoicing
- 📅 Advanced reporting and analytics

### Phase 4 (Future)
- 📅 Mobile application
- 📅 Telemedicine integration
- 📅 AI-powered features

---

**⚠️ Important Notice**: This is a demonstration/development version. For production use in healthcare environments, ensure compliance with relevant regulations (HIPAA, GDPR, etc.) and conduct proper security audits.
