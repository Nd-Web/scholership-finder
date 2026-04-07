# Scholarship Finder AI - Project Setup Guide

## Overview

This is a production-level AI-powered scholarship matching platform built with Next.js, Supabase, and TypeScript.

## Project Structure

```
Scholarship Finder AI/
├── app/
│   ├── (auth)/                    # Auth route group
│   │   ├── login/page.tsx         # Login page
│   │   └── signup/page.tsx        # Signup page
│   ├── (dashboard)/               # Protected dashboard routes
│   │   ├── layout.tsx             # Dashboard layout with sidebar
│   │   ├── dashboard/page.tsx     # Main dashboard
│   │   ├── profile/page.tsx       # User profile form
│   │   ├── scholarships/page.tsx  # Scholarship browser
│   │   └── applications/page.tsx  # Application tracker
│   ├── api/                       # API routes
│   │   ├── auth/                  # Auth endpoints
│   │   ├── profile/               # Profile endpoints
│   │   ├── scholarships/          # Scholarship endpoints
│   │   ├── recommendations/       # Matching recommendations
│   │   └── applications/          # Application endpoints
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── components/                    # React components (to be built)
├── lib/
│   ├── supabase/                  # Supabase clients
│   ├── validators/                # Zod schemas
│   └── utils.ts                   # Utility functions
├── services/
│   ├── matching/                  # Matching algorithm
│   ├── profile.service.ts         # Profile business logic
│   ├── scholarship.service.ts     # Scholarship business logic
│   └── application.service.ts     # Application business logic
├── types/
│   ├── database.ts                # Database types
│   ├── api.ts                     # API types
│   └── index.ts                   # Type exports
├── middleware.ts                  # Auth middleware
├── supabase-schema.sql            # Database schema
├── .env.local                     # Environment variables
└── .env.example                   # Environment template
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to the SQL Editor in your Supabase dashboard
3. Copy the contents of `supabase-schema.sql` and run it
4. Get your credentials from Settings > API

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features Implemented

### Core Features
- [x] User authentication (Supabase Auth)
- [x] User profile system with comprehensive fields
- [x] Scholarship database with filtering
- [x] Smart matching algorithm (6 weighted criteria)
- [x] Application tracking system
- [x] Match explanations (why each scholarship matches)

### Matching Algorithm Criteria
1. **Country Eligibility (25%)** - User's location vs scholarship countries
2. **Field of Study (25%)** - User's field vs scholarship fields (with related field matching)
3. **GPA Requirement (20%)** - User's GPA vs minimum requirements
4. **Funding Type (15%)** - User's financial need vs funding type
5. **Deadline (10%)** - Feasibility of application timeline
6. **Education Level (5%)** - User's education level vs scholarship requirements

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Sign in |
| POST | /api/auth/logout | Sign out |
| GET | /api/profile | Get user profile |
| POST | /api/profile | Create profile |
| PUT | /api/profile | Update profile |
| GET | /api/scholarships | List scholarships |
| POST | /api/recommendations | Get personalized matches |
| GET | /api/applications | Get user's applications |
| POST | /api/applications | Track new application |
| PUT | /api/applications/[id] | Update application |
| DELETE | /api/applications/[id] | Remove application |

## Database Schema

### Tables

1. **profiles** - User profile information
   - Personal info (name, nationality, country)
   - Education info (field of study, GPA, education level)
   - Preferences (preferred countries, fields, financial need)

2. **scholarships** - Scholarship opportunities
   - Basic info (title, provider, description)
   - Eligibility (countries, fields, min GPA)
   - Funding details (type, amount)
   - Timeline (deadline, start date, duration)

3. **applications** - Application tracking
   - Status tracking (saved, in_progress, submitted, etc.)
   - Notes and documents
   - Timestamps

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Public read access to active scholarships only

## Next Steps (Enhancements)

1. **Add Seed Data** - Populate the scholarships table with real opportunities
2. **Email Notifications** - Set up Supabase Edge Functions for deadline reminders
3. **Search Improvements** - Add full-text search with ranking
4. **Chat Assistant** - Implement a chatbot for scholarship guidance
5. **Document Upload** - Add file storage for application documents
6. **Analytics Dashboard** - Show application success rates and insights

## Architecture Decisions

### Why This Structure?

1. **Services Layer** - Business logic is isolated from API routes, making it testable and reusable
2. **Type Safety** - TypeScript throughout with shared types between frontend and backend
3. **Validation** - Zod schemas ensure data integrity at API boundaries
4. **Matching Algorithm** - Pure function that can be tested independently
5. **Route Groups** - Next.js route groups `(auth)` and `(dashboard)` for logical organization

### Security Considerations

- All API routes validate authentication via middleware
- RLS policies enforce data access at database level
- Input validation with Zod prevents injection attacks
- Service role key only used server-side (never exposed to client)

## Testing

To test the application:

1. Create a Supabase account and project
2. Run the schema SQL
3. Set up environment variables
4. Run `npm run dev`
5. Create an account via /signup
6. Complete your profile
7. Browse scholarships and track applications

## Production Deployment

### Recommended: Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

- Update `NEXT_PUBLIC_APP_URL` to your production domain
- Ensure Supabase project allows your production domain in CORS settings

## Contributing

When adding new features:

1. Add types to `types/` directory
2. Add validators to `lib/validators/`
3. Add business logic to `services/`
4. Add API routes to `app/api/`
5. Add UI components to `components/`
6. Add pages to `app/`

## License

MIT License - This is a portfolio project for educational purposes.
