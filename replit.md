# Overview

PartnerConnector is a professional referral platform designed for accountants, business consultants, and financial advisors to earn commissions by referring payment processing solutions to their clients. The application features a React-based frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and implementing secure authentication through Replit's OAuth system.

# Recent Changes

**Referral Form Simplification (October 2025)**
- Completely removed business name autocomplete/search functionality from all referral submission forms
- Deleted business-name-autocomplete.tsx component and old referral-form.tsx
- Unified referral submission experience uses ReferralStepper component with simple text inputs
- Business name field is now a standard input without search or autocomplete features
- All referral submission now flows through the streamlined 3-step ReferralStepper (Contact → Business → Review)

**Team Management Real Data Integration (October 2025)**
- Replaced all mock data with real user data from database
- Created `/api/team/progression` endpoint aggregating: partner level, team size, total revenue (direct + override), invite statistics
- Updated Progression tab to display real metrics with null-safe SQL aggregation using coalesce
- Simplified UI by removing gamification elements (XP, streaks, achievements) not tracked in database
- Updated Referral Links tab to show user's actual referral code and signup links
- Fixed Sheet component visibility issue: changed from transparent bg-background to solid bg-white with shadow-2xl and border-l-2 border-primary
- Partner level mapping implemented server-side: 1→Bronze, 2→Silver, 3→Gold, 4→Platinum
- All changes architect-reviewed and approved

**Training System Redesign (September 2025)**
- Complete transformation of training section into modern, gamified learning hub
- **Product Training**: Comprehensive modules for Dojo card payments and business funding with competitive analysis, pricing mastery, and ROI calculators
- **Platform Training**: Team invitation system with Level 2 (20%) and Extended network (10%) commission visualization and network growth strategies
- **Platform Usage**: Step-by-step training for deal submission, referral tracking, payment processes, and dashboard navigation
- **Enhanced Support**: Multi-channel support system with call booking, searchable knowledge base (15+ articles), and FAQ system with filtering
- **Gamification System**: Bronze → Silver → Gold → Platinum Partner progression with 1850+ points, achievement badges, 7-day learning streaks, and celebration animations
- Fixed critical framer-motion import errors and ensured consistent commission structure (L2=20%, Extended=10%) across all components
- Added comprehensive data-testid attributes for testing and maintained responsive design with smooth animations

**Dashboard UX Redesign (September 2025)**
- Implemented comprehensive dashboard redesign with improved UX and navigation
- Added desktop side navigation component with icon-based, expandable design (hover to expand from w-16 to w-64)
- Redesigned dashboard layout into three distinct sections:
  - **Hero Overview**: Welcome message, snapshot cards (Deals Submitted, Commission Pending, Total Referrals, Monthly Earnings), and progress tracking with gamification
  - **Action Hub**: Prominent "Add Team Member" button and Quick Actions grid (Submit Deal, Track Referral, View Payout History, Upload Bills)
  - **Engagement Feed**: Weekly tasks, recent referrals list, and daily suggestions for ongoing user engagement
- Maintained responsive design with desktop side navigation and mobile hamburger menu
- Preserved all existing functionality while dramatically improving visual hierarchy and user experience

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript and follows a component-based architecture:
- **UI Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The backend implements a RESTful API using Express.js:
- **Framework**: Express.js with TypeScript for type safety
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect for secure user authentication
- **Session Management**: Express sessions stored in PostgreSQL using connect-pg-simple
- **File Handling**: Multer middleware for handling file uploads (bill uploads)
- **API Design**: REST endpoints with consistent error handling and logging

## Database Design
PostgreSQL database with the following core entities:
- **Users**: Stores user profiles with GDPR/marketing consent tracking
- **Business Types**: Categorizes different types of businesses for commission calculation
- **Referrals**: Tracks submitted referrals with status management
- **Bill Uploads**: Handles client payment processing bill storage
- **Commission Payments**: Tracks commission payments to users
- **Sessions**: Stores user session data for authentication

## Authentication & Authorization
- **Provider**: Replit Auth using OpenID Connect protocol
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Route Protection**: Middleware-based authentication checks for protected routes
- **User Management**: Automatic user creation/updates on successful authentication

## File Upload System
- **Storage**: In-memory storage with Multer (10MB file size limit)
- **Security**: File type and size validation
- **Association**: Files linked to specific referrals for commission calculation

# External Dependencies

## Database Services
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Database toolkit with PostgreSQL dialect
- **Connection Pooling**: @neondatabase/serverless for optimized connections

## Authentication Services
- **Replit Auth**: OpenID Connect authentication provider
- **Session Storage**: connect-pg-simple for PostgreSQL session storage

## Development Tools
- **Replit Integration**: Cartographer and runtime error modal plugins
- **Build System**: ESBuild for server bundling, Vite for client bundling
- **Type Safety**: TypeScript across the entire stack

## UI Components & Styling
- **Radix UI**: Headless component primitives for accessible UI
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library with consistent design system
- **Lucide React**: Icon library for consistent iconography

## Utility Libraries
- **Form Validation**: Zod for runtime type checking and validation
- **Date Handling**: date-fns for date manipulation
- **Class Management**: clsx and tailwind-merge for conditional styling
- **Query Management**: TanStack Query for server state synchronization