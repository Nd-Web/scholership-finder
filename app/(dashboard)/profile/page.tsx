'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Profile, EducationLevel, FinancialNeedLevel } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    countryOfResidence: '',
    fieldOfStudy: '',
    currentEducationLevel: '',
    targetEducationLevel: '',
    gpa: '',
    gpaScale: '4.0',
    bio: '',
    skills: '',
    extracurriculars: '',
    preferredStudyCountries: '',
    preferredStudyFields: '',
    financialNeed: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (data.success && data.data) {
        const p = data.data as Profile;
        setProfile(p);
        setFormData({
          firstName: p.first_name || '',
          lastName: p.last_name || '',
          dateOfBirth: p.date_of_birth || '',
          nationality: p.nationality || '',
          countryOfResidence: p.country_of_residence || '',
          fieldOfStudy: p.field_of_study || '',
          currentEducationLevel: p.current_education_level || '',
          targetEducationLevel: p.target_education_level || '',
          gpa: p.gpa?.toString() || '',
          gpaScale: p.gpa_scale?.toString() || '4.0',
          bio: p.bio || '',
          skills: p.skills?.join(', ') || '',
          extracurriculars: p.extracurriculars?.join(', ') || '',
          preferredStudyCountries: p.preferred_study_countries?.join(', ') || '',
          preferredStudyFields: p.preferred_study_fields?.join(', ') || '',
          financialNeed: p.financial_need || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const body = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth || undefined,
        nationality: formData.nationality || undefined,
        countryOfResidence: formData.countryOfResidence || undefined,
        fieldOfStudy: formData.fieldOfStudy || undefined,
        currentEducationLevel: formData.currentEducationLevel as EducationLevel || undefined,
        targetEducationLevel: formData.targetEducationLevel as EducationLevel || undefined,
        gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
        gpaScale: formData.gpaScale ? parseFloat(formData.gpaScale) : undefined,
        bio: formData.bio || undefined,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        extracurriculars: formData.extracurriculars.split(',').map(s => s.trim()).filter(Boolean),
        preferredStudyCountries: formData.preferredStudyCountries.split(',').map(s => s.trim()).filter(Boolean),
        preferredStudyFields: formData.preferredStudyFields.split(',').map(s => s.trim()).filter(Boolean),
        financialNeed: formData.financialNeed as FinancialNeedLevel || undefined,
      };

      const method = profile ? 'PUT' : 'POST';
      const response = await fetch('/api/profile', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.error?.message || 'Failed to save profile');
        return;
      }

      setProfile(data.data);

      // Redirect to dashboard after creating new profile
      if (method === 'POST') {
        router.push('/dashboard');
        return;
      }

      // Show success message for updates
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="Loading profile">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">
          Tell us about yourself to get better scholarship recommendations.
        </p>
      </header>

      {/* Success Message */}
      {success && (
        <div
          className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          Profile saved successfully!
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Personal Information */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <legend className="text-lg font-semibold text-gray-900 px-2">Personal Information</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First name <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 min-h-[44px]"
                placeholder="John"
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last name <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 min-h-[44px]"
                placeholder="Doe"
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of birth
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none min-h-[44px]"
              />
            </div>
            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <input
                id="nationality"
                name="nationality"
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 min-h-[44px]"
                placeholder="e.g., American, Nigerian, Indian"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="countryOfResidence" className="block text-sm font-medium text-gray-700 mb-2">
                Country of residence
              </label>
              <input
                id="countryOfResidence"
                name="countryOfResidence"
                type="text"
                value={formData.countryOfResidence}
                onChange={(e) => setFormData({ ...formData, countryOfResidence: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 min-h-[44px]"
                placeholder="e.g., United States, Canada"
              />
            </div>
          </div>
        </fieldset>

        {/* Education Information */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <legend className="text-lg font-semibold text-gray-900 px-2">Education Information</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="sm:col-span-2">
              <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700 mb-2">
                Field of study
              </label>
              <input
                id="fieldOfStudy"
                name="fieldOfStudy"
                type="text"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 min-h-[44px]"
                placeholder="e.g., Computer Science, Business"
              />
            </div>
            <div>
              <label htmlFor="currentEducationLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Current education level
              </label>
              <select
                id="currentEducationLevel"
                name="currentEducationLevel"
                value={formData.currentEducationLevel}
                onChange={(e) => setFormData({ ...formData, currentEducationLevel: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none min-h-[44px]"
              >
                <option value="">Select level</option>
                <option value="high_school">High School</option>
                <option value="bachelor">Bachelor&apos;s Degree</option>
                <option value="master">Master&apos;s Degree</option>
                <option value="phd">PhD</option>
                <option value="certificate">Certificate</option>
                <option value="diploma">Diploma</option>
              </select>
            </div>
            <div>
              <label htmlFor="targetEducationLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Target education level
              </label>
              <select
                id="targetEducationLevel"
                name="targetEducationLevel"
                value={formData.targetEducationLevel}
                onChange={(e) => setFormData({ ...formData, targetEducationLevel: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none min-h-[44px]"
              >
                <option value="">Select level</option>
                <option value="high_school">High School</option>
                <option value="bachelor">Bachelor&apos;s Degree</option>
                <option value="master">Master&apos;s Degree</option>
                <option value="phd">PhD</option>
                <option value="certificate">Certificate</option>
                <option value="diploma">Diploma</option>
              </select>
            </div>
            <div>
              <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-2">
                GPA
              </label>
              <div className="flex gap-2">
                <input
                  id="gpa"
                  name="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 min-h-[44px]"
                  placeholder="3.5"
                  aria-describedby="gpa-hint"
                />
                <select
                  id="gpaScale"
                  name="gpaScale"
                  value={formData.gpaScale}
                  onChange={(e) => setFormData({ ...formData, gpaScale: e.target.value })}
                  className="w-24 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none min-h-[44px]"
                  aria-label="GPA scale"
                >
                  <option value="4.0">/ 4.0</option>
                  <option value="5.0">/ 5.0</option>
                </select>
              </div>
              <p id="gpa-hint" className="text-xs text-gray-500 mt-1">Enter your GPA on the selected scale</p>
            </div>
          </div>
        </fieldset>

        {/* Preferences */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <legend className="text-lg font-semibold text-gray-900 px-2">Preferences</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="preferredStudyCountries" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred study countries
              </label>
              <input
                id="preferredStudyCountries"
                name="preferredStudyCountries"
                type="text"
                value={formData.preferredStudyCountries}
                onChange={(e) => setFormData({ ...formData, preferredStudyCountries: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 min-h-[44px]"
                placeholder="e.g., USA, UK, Canada (comma separated)"
                aria-describedby="countries-hint"
              />
              <p id="countries-hint" className="text-xs text-gray-500 mt-1">Separate multiple countries with commas</p>
            </div>
            <div>
              <label htmlFor="preferredStudyFields" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred study fields
              </label>
              <input
                id="preferredStudyFields"
                name="preferredStudyFields"
                type="text"
                value={formData.preferredStudyFields}
                onChange={(e) => setFormData({ ...formData, preferredStudyFields: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 min-h-[44px]"
                placeholder="e.g., Computer Science, Engineering (comma separated)"
                aria-describedby="fields-hint"
              />
              <p id="fields-hint" className="text-xs text-gray-500 mt-1">Separate multiple fields with commas</p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="financialNeed" className="block text-sm font-medium text-gray-700 mb-2">
                Financial need level
              </label>
              <select
                id="financialNeed"
                name="financialNeed"
                value={formData.financialNeed}
                onChange={(e) => setFormData({ ...formData, financialNeed: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none min-h-[44px]"
              >
                <option value="">Select level</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Additional Information */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <legend className="text-lg font-semibold text-gray-900 px-2">Additional Information</legend>
          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none text-gray-900 placeholder-gray-400"
                placeholder="Tell us about yourself, your goals, and what makes you unique..."
              />
            </div>
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <input
                id="skills"
                name="skills"
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 min-h-[44px]"
                placeholder="e.g., Python, Leadership, Research (comma separated)"
                aria-describedby="skills-hint"
              />
              <p id="skills-hint" className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
            </div>
            <div>
              <label htmlFor="extracurriculars" className="block text-sm font-medium text-gray-700 mb-2">
                Extracurriculars
              </label>
              <input
                id="extracurriculars"
                name="extracurriculars"
                type="text"
                value={formData.extracurriculars}
                onChange={(e) => setFormData({ ...formData, extracurriculars: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 min-h-[44px]"
                placeholder="e.g., Debate Club, Volunteer Work, Sports (comma separated)"
                aria-describedby="extracurriculars-hint"
              />
              <p id="extracurriculars-hint" className="text-xs text-gray-500 mt-1">Separate multiple activities with commas</p>
            </div>
          </div>
        </fieldset>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
                Saving...
              </span>
            ) : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}