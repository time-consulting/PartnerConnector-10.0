# Overview

PartnerConnector is a professional referral platform for accountants, business consultants, and financial advisors. Its primary purpose is to facilitate the referral of payment processing solutions to clients, enabling partners to earn commissions. The platform aims to be a comprehensive tool for managing referrals, tracking commissions, and providing robust support for its users.

# Recent Changes

## November 20, 2025 - Codebase Cleanup
- **Removed Legacy Leads System**: Deleted the legacy "leads" table and "leadInteractions" table from the database schema, along with all associated API endpoints and storage methods. Partners now exclusively use the "opportunities" table for tracking potential business before submitting formal deals.
- **Consolidated Email Services**: Removed SendGrid dependency and associated `emailService.ts` file. All email communications now use GoHighLevel exclusively for both transactional emails (verification, password reset) and SMS (2FA verification codes).
- **Removed Admin Backdoor**: Deleted the `/api/admin/initialize-production-admin` route for security purposes. Admin accounts must be created through proper channels.
- **Terminology Clarification**: "Leads" terminology fully removed from business deal tracking to eliminate confusion with MLM partner hierarchy (which uses "referrals" for team invites).

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React 18 and TypeScript, utilizing a component-based architecture. Key technologies include:
- **UI Framework**: React 18 with TypeScript.
- **Styling**: Tailwind CSS with shadcn/ui for consistent design.
- **Routing**: Wouter for client-side routing.
- **State Management**: TanStack Query for server state management.
- **Form Handling**: React Hook Form with Zod validation.
- **Build Tool**: Vite for development and production builds.

## Backend Architecture
The backend is a RESTful API developed with Express.js and TypeScript, designed for scalability and maintainability.
- **Framework**: Express.js with TypeScript.
- **Database ORM**: Drizzle ORM for type-safe database operations.
- **Authentication**: Replit Auth with OpenID Connect.
- **Session Management**: Express sessions stored in PostgreSQL using connect-pg-simple.
- **File Handling**: Multer for file uploads.

## Database Design
A PostgreSQL database underpins the application, featuring core entities such as:
- **Users**: User profiles, including onboarding status, GDPR/marketing consent, and authentication security fields (emailVerified, verificationToken, passwordResetToken, passwordResetExpires, loginAttempts, lockoutUntil, lastLogin).
- **Deals**: Tracks business deal submissions (formerly called "referrals"), their status, and associated information. Note: Partner invites/team referrals use separate "referral" terminology to distinguish from business deals.
- **Quotes**: Manages quotes sent from Dojo, including customer journey status.
- **Business Types**: Categorization of businesses for commission calculations.
- **Bill Uploads**: Stores client payment processing bills (file content excluded from list queries for performance).
- **Commission Payments**: Records commission payouts to users.
- **Payment Verification Codes**: Stores 2FA codes for commission payment verification (10-minute expiry).
- **Sessions**: Stores user session data.
- **Partner Hierarchy**: Tracks multi-level marketing (MLM) relationships and commission structures.

## Authentication & Authorization
- **Provider**: Custom email/password authentication with GoHighLevel email integration.
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple.
- **Route Protection**: Middleware-based checks for secure access.
- **User Management**: Automatic user creation and updates upon successful authentication, with a mandatory 3-step onboarding flow for new users.
- **Security Features**:
  - Email verification required for all new accounts
  - Password strength requirements (min 8 chars, at least 1 letter + 1 number)
  - Rate limiting: 5 failed login attempts trigger 15-minute account lockout
  - Secure password reset with token expiration (1 hour)
  - Password hashing with bcrypt (12 rounds)
  - Verification email resend capability

## File Upload System
- **Storage**: In-memory with Multer (10MB limit).
- **Security**: File type and size validation.
- **Association**: Files are linked to specific deals.
- **Performance Optimization**: File content (fileContent/fileData) excluded from list queries, only loaded for downloads (20-50x faster queries).

## Commission Fraud Prevention
- **2FA Authentication**: All commission payments require SMS verification code (6-digit, 10-minute expiry).
- **Variance Validation**: Automated checks against expected commissions:
  - NTC deals: Max 20% variance tolerance
  - Switcher deals: Max 100% variance tolerance
- **Duplicate Prevention**: Payment lock system prevents simultaneous payments for the same deal.
- **SMS Service**: GoHighLevel (GHL) integration for sending verification codes to admin phone.
- **Audit Trail**: All payment confirmations logged with variance percentage and verification details.

## UI/UX Decisions
- **Design Language**: Inspired by Dojo.tech, featuring rounded cards, clear action buttons, and professional typography.
- **Mobile-First Approach**: Responsive design across all components, including a mobile-optimized referral form and quick add lead capture.
- **Dashboard Redesign**: Three distinct sections: Hero Overview, Action Hub, and Engagement Feed.
- **Navigation**: Desktop side navigation (expandable) and mobile hamburger menu.
- **Quotes Page**: Card-based grid layout with a full-screen detail modal and distinct customer journey stages.
- **Referral Form Redesign**: Streamlined 3-stage mobile-first flow without an earnings preview sidebar.
- **Admin Portal**: Streamlined two-tab structure: (1) Quote Requests showing new submissions with comprehensive details (business info, current processor, products, funding), (2) Deal Management Pipeline with 7 progression stages. Removed duplicate quote request subtab for clarity.
- **Training System**: Gamified learning hub with progression (Bronze to Platinum Partner), achievement badges, and learning streaks.
- **Referral Status**: Default status changed from 'pending' to 'submitted' to ensure new referrals appear immediately in Quote Requests tab.

## Features and Functionality
- **Deals Management**: Create, track, and manage business deal submissions (terminology: "deals" for business submissions, "referrals" for partner team invites).
- **Quotes Management**: View, approve, question, request rate changes, and send quotes to clients.
- **Onboarding System**: Mandatory multi-step onboarding for new users.
- **Team Tracking & MLM**: Referral code generation, hierarchical team linking (L1=60%, L2=20%, L3=10% commissions), and real-time team analytics.
- **Admin Portal**: Streamlined dashboard with single Quote Requests tab (status='submitted'), Deal Management Pipeline with 7 subtabs (Sent Quotes, Sign Up, Docs Out, Awaiting Docs, Approved, Complete, Declined), CSV export, analytics, and system settings.
- **Commission Payment System**: 
  - Two-step payment process: Initiate (generates 2FA code) → Confirm (verifies code)
  - SMS verification via GoHighLevel for all payments
  - Variance validation (NTC 20%, Switcher 100%)
  - Duplicate payment prevention
  - MLM distribution (60% direct, 20% parent, 10% grandparent)
  - Commission displays removed from partner UI (fraud prevention)
- **Mobile Engagement**: Real-time notifications via WebSockets, quick add form, push notifications via Web Push API, PWA support with offline mode, and voice input.
- **Authentication System**: 
  - Custom login/signup with email verification
  - Password reset flow with secure tokens (via GoHighLevel)
  - Rate limiting and account lockout protection
  - Resend verification email capability
  - Password strength validation
- **Contact Form**: Full-width dialog for enhanced desktop experience.

# External Dependencies

## Database Services
- **PostgreSQL**: Primary database provided by Neon serverless PostgreSQL.
- **Drizzle ORM**: Database toolkit for PostgreSQL.
- **@neondatabase/serverless**: For optimized connection pooling.

## Authentication Services
- **Replit Auth**: OpenID Connect authentication provider.
- **connect-pg-simple**: For PostgreSQL-backed session storage.

## Development Tools
- **Replit Integration**: Cartographer and runtime error modal plugins.
- **ESBuild**: For server bundling.
- **Vite**: For client bundling.
- **TypeScript**: For type safety across the stack.

## UI Components & Styling
- **Radix UI**: Headless component primitives for accessibility.
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Pre-built component library.
- **Lucide React**: Icon library.

## Utility Libraries
- **Zod**: For runtime type checking and form validation.
- **date-fns**: For date manipulation.
- **clsx** and **tailwind-merge**: For conditional styling.
- **TanStack Query**: For server state synchronization.