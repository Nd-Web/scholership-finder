-- =====================================================
-- SCHOLARSHIP FINDER AI - SEED DATA
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to populate
-- the database with sample scholarships for testing.
-- =====================================================

-- Clear existing data (optional - comment out for first run)
-- DELETE FROM applications;
-- DELETE FROM scholarships;

-- =====================================================
-- SCHOLARSHIPS - NORTH AMERICA
-- =====================================================

INSERT INTO scholarships (title, provider_name, description, country, field_of_study, min_gpa, funding_type, funding_amount, deadline, start_date, duration_months, eligibility_criteria, required_documents, application_url, website_url, is_active)
VALUES
(
  'Fulbright Foreign Student Program',
  'U.S. Department of State',
  'The Fulbright Program is one of the most prestigious scholarship programs in the world, offering graduate students, young professionals, and artists from abroad the opportunity to study, conduct research, and showcase their talents in the United States.',
  ARRAY['USA'],
  ARRAY['Computer Science', 'Engineering', 'Business', 'Public Policy', 'International Relations', 'Environmental Science'],
  3.5,
  'full',
  55000,
  '2026-10-01',
  '2026-09-01',
  24,
  ARRAY[
    'Citizens of eligible countries (not U.S. citizens)',
    ''Bachelor''s degree or equivalent before program start',
    'Demonstrated leadership potential',
    'Strong academic record',
    'Commitment to returning home after studies'
  ],
  ARRAY[
    'Online application form',
    'Academic transcripts',
    'Three letters of recommendation',
    'Personal statement',
    'Research proposal (for research grants)',
    'Proof of English proficiency'
  ],
  'https://foreign.fulbrightprogram.org',
  'https://foreign.fulbrightprogram.org',
  TRUE
),
(
  'MIT Scholarships for International Students',
  'Massachusetts Institute of Technology',
  'MIT offers need-based financial aid to international students admitted to undergraduate programs. All admitted students receive full demonstrated financial need.',
  ARRAY['USA'],
  ARRAY['Computer Science', 'Engineering', 'Physics', 'Mathematics', 'Economics', 'Biology'],
  3.8,
  'need_based',
  80000,
  '2026-05-15',
  '2026-09-01',
  48,
  ARRAY[
    'Admission to MIT undergraduate program',
    'Demonstrated financial need',
    'Strong academic background in STEM',
    'Extracurricular achievements'
  ],
  ARRAY[
    'MIT admission application',
    'Financial aid application (CSS Profile)',
    'Parent financial statement',
    'Tax documents'
  ],
  'https://mit.edu/financialaid',
  'https://mit.edu',
  TRUE
),
(
  'Stanford Knight-Hennessy Scholars Program',
  'Stanford University',
  'Knight-Hennessy Scholars develops a community of future global leaders to address complex challenges through collaboration and innovation. Full funding for graduate studies at Stanford.',
  ARRAY['USA'],
  ARRAY['Business', 'Engineering', 'Law', 'Medicine', 'Education', 'Environmental Science', 'Public Policy'],
  3.7,
  'full',
  100000,
  '2026-10-12',
  '2026-09-01',
  36,
  ARRAY[
    'Bachelor''s degree before program start',
    'Demonstrated leadership potential',
    'Civic engagement and community impact',
    'Strong academic record',
    'Graduate program admission at Stanford'
  ],
  ARRAY[
    'Online application',
    'Resume/CV',
    'Three recommendation letters',
    'Video responses',
    'Academic transcripts',
    'Graduate school application'
  ],
  'https://knight-hennessy.stanford.edu',
  'https://knight-hennessy.stanford.edu',
  TRUE
),
(
  'Canada Graduate Scholarships - Master''s Program',
  'Government of Canada',
  'The Canada Graduate Scholarships – Master''s program promotes research excellence in Canadian universities. Open to Canadian citizens and permanent residents.',
  ARRAY['Canada'],
  ARRAY['Computer Science', 'Engineering', 'Health Sciences', 'Natural Sciences', 'Social Sciences'],
  3.7,
  'merit_based',
  20000,
  '2026-12-01',
  '2026-09-01',
  12,
  ARRAY[
    'Canadian citizen or permanent resident',
    'Enrolled in eligible master''s program',
    'Strong research potential',
    'Minimum average of A- in previous studies'
  ],
  ARRAY[
    'Online application through ResearchNet',
    'Research proposal',
    'Two letters of reference',
    'Academic transcripts',
    'CV'
  ],
  'https://www.nserc-crsng.gc.ca',
  'https://www.nserc-crsng.gc.ca',
  TRUE
),
(
  'University of Toronto Lester B. Pearson Scholarship',
  'University of Toronto',
  'The Lester B. Pearson International Scholarship Program covers tuition, books, incidental fees, and full residence support for four years. Recognizes exceptional international students.',
  ARRAY['Canada'],
  ARRAY['Computer Science', 'Engineering', 'Business', 'Life Sciences', 'Humanities', 'Social Sciences'],
  3.8,
  'full',
  60000,
  '2026-11-30',
  '2026-09-01',
  48,
  ARRAY[
    'International student (not Canadian citizen/PR)',
    'Currently in secondary school or graduated after June 2025',
    'Exceptional academic achievement',
    'Demonstrated leadership and creativity'
  ],
  ARRAY[
    'University of Toronto admission application',
    'Scholarship application (separate)',
    'School nomination required',
    'Two references',
    'Personal statement'
  ],
  'https://future.utoronto.ca/pearson',
  'https://future.utoronto.ca/pearson',
  TRUE
);

-- =====================================================
-- SCHOLARSHIPS - EUROPE
-- =====================================================

INSERT INTO scholarships (title, provider_name, description, country, field_of_study, min_gpa, funding_type, funding_amount, deadline, start_date, duration_months, eligibility_criteria, required_documents, application_url, website_url, is_active)
VALUES
(
  'Erasmus Mundus Joint Master Degrees',
  'European Union',
  'Erasmus Mundus offers full scholarships for master''s students worldwide to study in at least two European countries. Covers tuition, travel, and living expenses.',
  ARRAY['Germany', 'France', 'Netherlands', 'Spain', 'Italy', 'Sweden', 'Denmark', 'Portugal'],
  ARRAY['Engineering', 'Computer Science', 'Environmental Science', 'Business', 'International Relations', 'Data Science'],
  3.0,
  'full',
  48000,
  '2026-01-15',
  '2026-09-01',
  24,
  ARRAY[
    'Bachelor''s degree or equivalent',
    'Not an EU citizen (for most scholarships)',
    'Strong academic record',
    'English proficiency (or language of instruction)'
  ],
  ARRAY[
    'Application through specific program',
    'Academic transcripts',
    'CV',
    'Motivation letter',
    'Two recommendation letters',
    'Language certificate'
  ],
  'https://eacea.ec.europa.eu/scholarships/erasmus-mundus',
  'https://erasmus-plus.ec.europa.eu',
  TRUE
),
(
  'DAAD Scholarships for International Students',
  'German Academic Exchange Service',
  'DAAD offers a wide range of scholarships for international students to study in Germany. Options include master''s, PhD, and research grants.',
  ARRAY['Germany'],
  ARRAY['Engineering', 'Computer Science', 'Natural Sciences', 'Agriculture', 'Architecture', 'Urban Planning'],
  3.2,
  'partial',
  25000,
  '2026-08-31',
  '2026-10-01',
  24,
  ARRAY[
    'Completed bachelor''s degree (for master''s programs)',
    'Maximum 36 months since last degree',
    'German or English language proficiency',
    'Strong academic record'
  ],
  ARRAY[
    'DAAD application portal',
    'Academic transcripts',
    'CV in tabular form',
    'Motivation letter',
    'Two recommendation letters',
    'Language certificates'
  ],
  'https://www.daad.de/en',
  'https://www.daad.de',
  TRUE
),
(
  'Chevening Scholarships',
  'UK Government',
  'Chevening is the UK government''s global scholarship program, funded by the Foreign, Commonwealth & Development Office. Offers full funding for one-year master''s degrees.',
  ARRAY['UK'],
  ARRAY['Public Policy', 'International Relations', 'Business', 'Law', 'Journalism', 'Environmental Science', 'Computer Science'],
  3.3,
  'full',
  45000,
  '2026-11-07',
  '2026-09-01',
  12,
  ARRAY[
    'Citizen of eligible Chevening country',
    'Bachelor''s degree with upper second-class honors',
    'Minimum 2 years work experience',
    'Commitment to return home after studies',
    'Leadership potential'
  ],
  ARRAY[
    'Online application',
    'Academic transcripts',
    'Two reference letters',
    'Four essays (leadership, networking, etc.)',
    'Unconditional university offer (by deadline)'
  ],
  'https://www.chevening.org',
  'https://www.chevening.org',
  TRUE
),
(
  'ETH Zurich Excellence Scholarship',
  'ETH Zurich',
  'The Excellence Scholarship & Opportunity Programme (ESOP) supports outstanding students with a scholarship and mentoring program.',
  ARRAY['Switzerland'],
  ARRAY['Engineering', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Architecture'],
  3.9,
  'merit_based',
  30000,
  '2026-12-15',
  '2026-09-01',
  24,
  ARRAY[
    'Admission to ETH master''s program',
    'Outstanding academic record',
    'Top of graduating class',
    'Strong letters of recommendation'
  ],
  ARRAY[
    'ETH application for master''s program',
    **Scholarship application (separate)**,
    'Academic transcripts',
    'Three recommendation letters',
    'Motivation letter',
    'CV'
  ],
  'https://ethz.ch/students/studies/financial-support/esop',
  'https://ethz.ch',
  TRUE
),
(
  'Holland Scholarship',
  'Dutch Ministry of Education',
  'The Holland Scholarship is for international students from outside the EEA who want to do their bachelor''s or master''s in the Netherlands.',
  ARRAY['Netherlands'],
  ARRAY['Engineering', 'Business', 'Social Sciences', 'Arts', 'Life Sciences'],
  3.0,
  'partial',
  5000,
  '2026-05-01',
  '2026-09-01',
  12,
  ARRAY[
    'Non-EEA citizenship',
    'Admission to participating Dutch university',
    'Strong academic record',
    **Bachelor applicants: high school diploma**
  ],
  ARRAY[
    'University application',
    **Scholarship application through university**,
    'Academic transcripts',
    'Motivation letter',
    'CV'
  ],
  'https://www.studyinnl.org',
  'https://www.studyinnl.org',
  TRUE
);

-- =====================================================
-- SCHOLARSHIPS - ASIA & OCEANIA
-- =====================================================

INSERT INTO scholarships (title, provider_name, description, country, field_of_study, min_gpa, funding_type, funding_amount, deadline, start_date, duration_months, eligibility_criteria, required_documents, application_url, website_url, is_active)
VALUES
(
  'Singapore International Graduate Award (SINGA)',
  'Agency for Science, Technology and Research (A*STAR)',
  'SINGA is a prestigious PhD scholarship for international students to pursue research in Singapore. Full funding with monthly stipend.',
  ARRAY['Singapore'],
  ARRAY['Computer Science', 'Engineering', 'Biomedical Sciences', 'Physical Sciences'],
  3.5,
  'full',
  40000,
  '2026-06-30',
  '2026-08-01',
  48,
  ARRAY[
    **Bachelor or Master's degree**,
    'Strong research background',
    'Good English proficiency',
    'Publications are a plus'
  ],
  ARRAY[
    'Online application',
    'Research proposal',
    'Academic transcripts',
    'Two recommendation letters',
    'CV with publications list',
    'IELTS/TOEFL scores'
  ],
  'https://www.a-star.edu.sg/singa',
  'https://www.a-star.edu.sg',
  TRUE
),
(
  'University of Melbourne International Scholarship',
  'University of Melbourne',
  'The Melbourne International Undergraduate Scholarship offers tuition remission for high-achieving international students.',
  ARRAY['Australia'],
  ARRAY['Computer Science', 'Engineering', 'Business', 'Science', 'Arts'],
  3.7,
  'merit_based',
  35000,
  '2026-11-30',
  '2026-03-01',
  36,
  ARRAY[
    'International student status',
    'Outstanding academic achievement',
    'Admission to eligible undergraduate program',
    'Not receiving other major scholarships'
  ],
  ARRAY[
    'University admission application',
    'Automatic consideration (no separate application)',
    'Academic transcripts',
    'Personal statement (if requested)'
  ],
  'https://scholarships.unimelb.edu.au',
  'https://www.unimelb.edu.au',
  TRUE
),
(
  'Japanese Government MEXT Scholarship',
  'Ministry of Education, Culture, Sports, Science and Technology',
  'MEXT scholarships are offered by the Japanese government to international students who wish to study at Japanese universities.',
  ARRAY['Japan'],
  ARRAY['Engineering', 'Computer Science', 'Economics', 'International Relations', 'Japanese Studies'],
  3.3,
  'full',
  35000,
  '2026-06-30',
  '2026-04-01',
  60,
  ARRAY[
    'Age requirements (varies by program)',
    **Bachelor's degree (for graduate programs)**,
    'Good health',
    'Willingness to learn Japanese'
  ],
  ARRAY[
    'Application through Japanese embassy',
    'Academic transcripts',
    **Field of study/research plan**,
    'Two recommendation letters',
    'Medical certificate'
  ],
  'https://www.studyinjapan.go.jp',
  'https://www.studyinjapan.go.jp',
  TRUE
),
(
  'China Government Scholarship (CSC)',
  **China Scholarship Council**,
  'The CSC Scholarship is a full scholarship for international students to study at Chinese universities. Covers tuition, accommodation, and living expenses.',
  ARRAY['China'],
  ARRAY['Engineering', 'Computer Science', **Medicine**, 'Agriculture', 'Business', 'Chinese Language'],
  3.0,
  'full',
  30000,
  '2026-04-30',
  '2026-09-01',
  48,
  ARRAY[
    'Non-Chinese citizenship',
    'Age requirements (varies by program)',
    'Good health',
    **Bachelor's degree (for master's programs)**
  ],
  ARRAY[
    'CSC online application',
    'University application (separate)',
    'Academic transcripts',
    'Two recommendation letters',
    **Study plan or research proposal**,
    'Foreigner Physical Examination Form'
  ],
  'http://www.csc.edu.cn',
  'http://www.csc.edu.cn',
  TRUE
),
(
  'Australia Awards Scholarships',
  **Australian Government**,
  'Australia Awards are long-term scholarships awarded to students from developing countries, particularly those located in the Indo-Pacific region.',
  ARRAY['Australia'],
  ARRAY['Public Health', 'Environmental Science', 'Agriculture', 'Engineering', 'Public Policy', **Education**],
  3.2,
  'full',
  50000,
  '2026-04-30',
  '2026-07-01',
  24,
  ARRAY[
    'Citizen of eligible country',
    **Bachelor's degree or equivalent**,
    'Minimum 3 years relevant work experience',
    'Commitment to development impact'
  ],
  ARRAY[
    **DFAT online application**,
    'Academic transcripts',
    'CV',
    'Development impact plan',
    'Two reference letters'
  ],
  'https://www.dfat.gov.au/australia-awards',
  'https://www.dfat.gov.au',
  TRUE
);

-- =====================================================
-- SCHOLARSHIPS - SPECIALIZED/THEMATIC
-- =====================================================

INSERT INTO scholarships (title, provider_name, description, country, field_of_study, min_gpa, funding_type, funding_amount, deadline, start_date, duration_months, eligibility_criteria, required_documents, application_url, website_url, is_active)
VALUES
(
  'Women in STEM Scholarship - Google',
  'Google',
  'Google offers scholarships for women pursuing degrees in computer science, computer engineering, or informatics. Includes mentorship and community opportunities.',
  ARRAY['USA', 'Canada', 'UK', 'Germany', 'Australia'],
  ARRAY['Computer Science', 'Software Engineering', 'Informatics', 'Data Science'],
  3.5,
  'merit_based',
  10000,
  '2026-04-15',
  '2026-09-01',
  12,
  ARRAY[
    'Identify as female',
    'Enrolled in CS/Engineering program',
    'Strong academic record',
    'Passion for technology'
  ],
  ARRAY[
    'Online application',
    'Academic transcripts',
    'Resume',
    'Essay responses',
    'One recommendation letter'
  ],
  'https://buildyourfuture.withgoogle.com/scholarships',
  'https://buildyourfuture.withgoogle.com',
  TRUE
),
(
  'Mastercard Foundation Scholars Program',
  'Mastercard Foundation',
  'The Mastercard Foundation Scholars Program provides comprehensive support to young people from economically disadvantaged backgrounds who demonstrate academic talent and leadership potential.',
  ARRAY['USA', 'Canada', 'UK', 'Netherlands', 'Australia'],
  ARRAY['Business', 'Engineering', 'Public Health', 'Agriculture', **Education**, 'Environmental Science'],
  3.3,
  'full',
  55000,
  '2026-02-28',
  '2026-09-01',
  48,
  ARRAY[
    'African citizenship',
    'Demonstrated financial need',
    'Strong academic record',
    'Leadership potential',
    'Commitment to giving back'
  ],
  ARRAY[
    'Partner university application',
    **Scholarship application (separate)**,
    'Academic transcripts',
    'Personal statement',
    'Two recommendation letters',
    'Proof of financial need'
  ],
  'https://mastercardfdn.org',
  'https://mastercardfdn.org',
  TRUE
),
(
  'Joint Japan/World Bank Graduate Scholarship',
  'World Bank',
  'The JJ/WBGSP offers scholarships to women and men from developing countries to pursue master''s degrees in development-related fields.',
  ARRAY['USA', 'UK', 'Germany', 'Japan', 'Belgium'],
  ARRAY['Economics', 'Public Policy', 'Public Health', 'Agriculture', 'Environmental Science', 'Urban Planning'],
  3.3,
  'full',
  45000,
  '2026-05-15',
  '2026-09-01',
  24,
  ARRAY[
    'Citizen of eligible developing country',
    **Bachelor's degree with development focus**,
    'Minimum 3 years development-related work experience',
    'Commitment to return home after studies'
  ],
  ARRAY[
    'Online application',
    'Academic transcripts',
    'CV',
    **Development impact statement**,
    'Three recommendation letters',
    'University admission letter'
  ],
  'https://www.worldbank.org/jjwbgsp',
  'https://www.worldbank.org',
  TRUE
),
(
  'Aga Khan Foundation International Scholarship',
  'Aga Khan Foundation',
  'The AKF ISP provides scholarships and interest-free loans to students from selected developing countries who have no other means of financing their education.',
  ARRAY['USA', 'UK', 'France', 'Canada', 'Germany'],
  ARRAY['Economics', 'Public Policy', **Medicine**, 'Engineering', 'Agriculture', 'Architecture'],
  3.3,
  'need_based',
  40000,
  '2026-07-31',
  '2026-09-01',
  24,
  ARRAY[
    'Citizen of eligible country',
    'Demonstrated financial need',
    'Admission to reputable university',
    'Commitment to repay 50% as interest-free loan'
  ],
  ARRAY[
    'Application through national AKF office',
    'Academic transcripts',
    'Proof of financial need',
    'University admission letter',
    'Personal statement'
  ],
  'https://www.theakdn.org',
  'https://www.theakdn.org',
  TRUE
),
(
  'Rotary Foundation Global Grants',
  'Rotary International',
  'Rotary Global Grants support graduate-level coursework or research in one of Rotary''s seven areas of focus. Minimum award of $10,000 USD.',
  ARRAY['USA', 'UK', 'Japan', 'Australia', 'Spain'],
  ARRAY['Public Health', **Education**, 'Environmental Science', 'Peace Studies', 'Economics', 'Water & Sanitation'],
  3.3,
  'partial',
  15000,
  '2026-06-30',
  '2026-09-01',
  24,
  ARRAY[
    'Rotary club sponsorship required',
    **Bachelor's degree**,
    'Alignment with Rotary areas of focus',
    'Leadership potential'
  ],
  ARRAY[
    'Application through sponsoring Rotary club',
    'Academic transcripts',
    'Project description',
    'Budget',
    'Timeline'
  ],
  'https://www.rotary.org/en/our-programs/global-grants',
  'https://www.rotary.org',
  TRUE
);

-- =====================================================
-- SCHOLARSHIPS - AFRICA-FOCUSED
-- =====================================================

INSERT INTO scholarships (title, provider_name, description, country, field_of_study, min_gpa, funding_type, funding_amount, deadline, start_date, duration_months, eligibility_criteria, required_documents, application_url, website_url, is_active)
VALUES
(
  'African Leadership University Scholarships',
  'African Leadership University',
  'ALU offers scholarships to outstanding African students who demonstrate leadership potential and commitment to Africa''s development.',
  ARRAY['Mauritius', 'Rwanda', 'Senegal'],
  ARRAY['Business', 'Computer Science', 'International Relations', 'Engineering', 'Environmental Science'],
  3.0,
  'need_based',
  20000,
  '2026-08-31',
  '2026-09-01',
  48,
  ARRAY[
    'African citizenship',
    'Strong academic record',
    'Demonstrated leadership',
    'Financial need'
  ],
  ARRAY[
    'ALU admission application',
    'Scholarship application',
    'Academic transcripts',
    'Personal statement',
    'Two recommendation letters'
  ],
  'https://www.alueducation.com',
  'https://www.alueducation.com',
  TRUE
),
(
  'Tony Elumelu Foundation Entrepreneurship Programme',
  'Tony Elumelu Foundation',
  'The TEF Entrepreneurship Programme identifies, trains, and funds young African entrepreneurs. Includes seed capital and mentorship.',
  ARRAY['Nigeria', 'Kenya', 'South Africa', 'Ghana', 'All African countries'],
  ARRAY['Business', 'Entrepreneurship', 'Agriculture', 'Technology'],
  2.5,
  'fellowship',
  5000,
  '2026-03-31',
  '2026-06-01',
  12,
  ARRAY[
    'African citizenship',
    'Business idea or existing business (less than 3 years)',
    'Commitment to complete training program',
    'Age 18-35'
  ],
  ARRAY[
    'Online application',
    'Business idea description',
    'Personal information',
    'Video pitch (optional)'
  ],
  'https://www.tonyelumelufoundation.org',
  'https://www.tonyelumelufoundation.org',
  TRUE
);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check that scholarships were inserted
-- SELECT COUNT(*) FROM scholarships WHERE is_active = TRUE;

-- View all scholarships
-- SELECT title, provider_name, funding_type, funding_amount, deadline FROM scholarships ORDER BY deadline;
