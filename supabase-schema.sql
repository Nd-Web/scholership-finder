-- =====================================================
-- SCHOLARSHIP FINDER AI - DATABASE SCHEMA
-- =====================================================
-- This file contains the complete database schema for Supabase.
-- Run this in your Supabase SQL Editor to create all tables.
--
-- Tables:
--   - profiles (extends auth.users)
--   - scholarships
--   - applications
--
-- Features:
--   - Row Level Security (RLS)
--   - Indexes for performance
--   - Foreign key constraints
--   - Automatic timestamps
-- =====================================================

-- =====================================================
-- ENABLE UUID EXTENSION
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Education levels
CREATE TYPE education_level AS ENUM (
  'high_school',
  'bachelor',
  'master',
  'phd',
  'certificate',
  'diploma'
);

-- Financial need levels
CREATE TYPE financial_need_level AS ENUM (
  'low',
  'medium',
  'high'
);

-- Funding types
CREATE TYPE funding_type AS ENUM (
  'full',
  'partial',
  'merit_based',
  'need_based',
  'research_grant',
  'fellowship'
);

-- Application statuses
CREATE TYPE application_status AS ENUM (
  'saved',
  'in_progress',
  'submitted',
  'under_review',
  'interview_scheduled',
  'accepted',
  'rejected',
  'withdrawn'
);

-- =====================================================
-- PROFILES TABLE
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Personal Information
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  date_of_birth DATE,
  nationality VARCHAR(100),
  country_of_residence VARCHAR(100),

  -- Education Information
  field_of_study VARCHAR(200),
  current_education_level education_level,
  target_education_level education_level,
  gpa DECIMAL(3, 2),
  gpa_scale DECIMAL(2, 1) DEFAULT 4.0,

  -- Additional Information
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  extracurriculars TEXT[] DEFAULT '{}',

  -- Preferences
  preferred_study_countries VARCHAR(100)[] DEFAULT '{}',
  preferred_study_fields VARCHAR(100)[] DEFAULT '{}',
  financial_need financial_need_level,

  -- Notification Preferences
  notification_preferences JSONB DEFAULT '{"email_deadline_reminders": true, "email_updates": true, "email_matches": true}',

  -- Matching Preferences
  matching_preferences JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_nationality ON profiles(nationality);
CREATE INDEX idx_profiles_country ON profiles(country_of_residence);
CREATE INDEX idx_profiles_field_of_study ON profiles(field_of_study);
CREATE INDEX idx_profiles_target_education ON profiles(target_education_level);
CREATE INDEX idx_profiles_financial_need ON profiles(financial_need);

-- =====================================================
-- SCHOLARSHIPS TABLE
-- =====================================================

CREATE TABLE scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Information
  title VARCHAR(200) NOT NULL,
  provider_name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Eligibility
  country VARCHAR(100)[] NOT NULL DEFAULT '{}',
  field_of_study VARCHAR(100)[] NOT NULL DEFAULT '{}',
  min_gpa DECIMAL(3, 2),
  gpa_scale DECIMAL(2, 1) DEFAULT 4.0,

  -- Funding Details
  funding_type funding_type NOT NULL,
  funding_amount DECIMAL(10, 2),

  -- Timeline
  deadline DATE,
  start_date DATE,
  duration_months INTEGER,

  -- Application Details
  eligibility_criteria TEXT[] DEFAULT '{}',
  required_documents TEXT[] DEFAULT '{}',
  application_url VARCHAR(500),
  website_url VARCHAR(500),
  contact_email VARCHAR(255),

  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for scholarships
CREATE INDEX idx_scholarships_active ON scholarships(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX idx_scholarships_funding_type ON scholarships(funding_type);
CREATE INDEX idx_scholarships_country ON scholarships USING GIN(country);
CREATE INDEX idx_scholarships_field_of_study ON scholarships USING GIN(field_of_study);
CREATE INDEX idx_scholarships_min_gpa ON scholarships(min_gpa);
CREATE INDEX idx_scholarships_created_at ON scholarships(created_at DESC);

-- Full-text search index
CREATE INDEX idx_scholarships_search ON scholarships USING GIN (
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, ''))
);

-- =====================================================
-- APPLICATIONS TABLE
-- =====================================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE NOT NULL,

  -- Status
  status application_status DEFAULT 'saved' NOT NULL,

  -- Application Details
  submitted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  documents_submitted TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  -- Constraints
  CONSTRAINT unique_user_scholarship UNIQUE (user_id, scholarship_id)
);

-- Indexes for applications
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_scholarship_id ON applications(scholarship_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX idx_applications_user_status ON applications(user_id, status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- SCHOLARSHIPS POLICIES
-- =====================================================

-- Everyone can view active scholarships (read-only)
CREATE POLICY "Anyone can view active scholarships"
  ON scholarships
  FOR SELECT
  USING (is_active = TRUE);

-- Only authenticated users can view all scholarships (for matching)
CREATE POLICY "Authenticated users can view scholarships"
  ON scholarships
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- =====================================================
-- APPLICATIONS POLICIES
-- =====================================================

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON applications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can insert own applications"
  ON applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own applications
CREATE POLICY "Users can update own applications"
  ON applications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own applications
CREATE POLICY "Users can delete own applications"
  ON applications
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to scholarships
CREATE TRIGGER update_scholarships_updated_at
  BEFORE UPDATE ON scholarships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to applications
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get current user's profile
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS profiles AS $$
BEGIN
  RETURN (
    SELECT * FROM profiles
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's application count by status
CREATE OR REPLACE FUNCTION get_application_stats(user_id_param UUID)
RETURNS TABLE (
  status application_status,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.status, COUNT(*)::BIGINT
  FROM applications a
  WHERE a.user_id = user_id_param
  GROUP BY a.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Uncomment to add sample scholarships for testing
-- Note: You'll need to replace the UUIDs with actual values

/*
INSERT INTO scholarships (title, provider_name, description, country, field_of_study, min_gpa, funding_type, funding_amount, deadline, eligibility_criteria, required_documents, is_active)
VALUES
(
  'Global Excellence Scholarship',
  'International Education Foundation',
  'A prestigious scholarship for outstanding students seeking to pursue higher education abroad.',
  ARRAY['USA', 'UK', 'Canada', 'Australia'],
  ARRAY['Computer Science', 'Engineering', 'Business', 'Medicine'],
  3.5,
  'full',
  50000,
  '2026-06-30',
  ARRAY[
    'Minimum GPA of 3.5',
    'Proof of English proficiency',
    'Leadership experience',
    'Community service record'
  ],
  ARRAY[
    'Academic transcripts',
    'Two recommendation letters',
    'Personal statement',
    'CV/Resume'
  ],
  TRUE
),
(
  'Women in STEM Scholarship',
  'Tech Diversity Initiative',
  'Supporting women pursuing careers in Science, Technology, Engineering, and Mathematics.',
  ARRAY['USA', 'Canada', 'Germany'],
  ARRAY['Computer Science', 'Engineering', 'Data Science', 'Physics', 'Mathematics'],
  3.0,
  'merit_based',
  25000,
  '2026-05-15',
  ARRAY[
    'Identify as female',
    'Pursuing STEM degree',
    'Minimum GPA of 3.0',
    'Demonstrated passion for technology'
  ],
  ARRAY[
    'Academic transcripts',
    'Personal essay',
    'One recommendation letter'
  ],
  TRUE
),
(
  'Developing Countries Scholarship',
  'World Education Fund',
  'Full funding for students from developing countries to study at partner universities.',
  ARRAY['UK', 'Netherlands', 'Sweden', 'Norway'],
  ARRAY['Public Health', 'Environmental Science', 'Economics', 'International Relations'],
  3.2,
  'need_based',
  40000,
  '2026-04-30',
  ARRAY[
    'From eligible developing country',
    'Demonstrated financial need',
    'Commitment to return home after studies'
  ],
  ARRAY[
    'Proof of nationality',
    'Financial documents',
    'Academic transcripts',
    'Study plan'
  ],
  TRUE
);
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify your schema is set up correctly:

-- Check tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check indexes
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- Check RLS policies
-- SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE schemaname = 'public';
