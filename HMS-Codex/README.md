# Codex HMS

Codex HMS is a comprehensive hospital management and charting platform built with Next.js. It ships with role-based workspaces for physicians, nurses, administrators, and patients, alongside modules for scheduling, EMR documentation, medications, labs, billing, and resource governance.

## Features

- Secure authentication funnel with role selection and session persistence.
- Unified executive dashboard with KPIs, appointments, audit feeds, and resource telemetry.
- Patient registry supporting rapid intake, structured demographics, and longitudinal records.
- Appointment orchestration with schedule insights and status management.
- EMR charting surface with vitals tracking, documentation, and clinical timeline.
- Medication management for prescriptions, dispense logging, and refill oversight.
- Laboratory cockpit with critical alert tracking and provider acknowledgements.
- Billing workspace for revenue cycle tracking, CSV/PDF export, and payment posting.
- Administrative console with staff rosters, audit ledger, notification center, and compliance momentum.
- Operational resource board covering rooms, devices, staffing, and departmental utilization.

## Tech Stack

- Next.js 14 App Router with React 18 and TypeScript.
- Context-based state management simulating secure backend services.
- Reusable glassmorphism-inspired UI components, responsive layouts, and accessible focus styles.
- Utility helpers for formatting, ID generation, CSV/PDF export scaffolds, and audit summaries.

## Getting Started

1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Sign in via `/login` selecting a role to explore each workspace.

_Note: The demo uses in-memory data and mock services. Integrate real persistence, authentication, and interoperability (FHIR/HL7) providers before production use._
