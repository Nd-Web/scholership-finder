'use client';

import { useEffect, useState } from 'react';
import type { Profile, EducationLevel, FinancialNeedLevel } from '@/types';

export default function ProfilePage() {
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

      setSuccess(true);
      setProfile(data.data);
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
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">
          Tell us about yourself to get better scholarship recommendations.
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          Profile saved successfully!
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                placeholder="Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                placeholder="e.g., American, Nigerian, Indian"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country of residence</label>
              <input
                type="text"
                value={formData.countryOfResidence}
                onChange={(e) => setFormData({ ...formData, countryOfResidence: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                placeholder="e.g., United States, Canada"
              />
            </div>
          </div>
        </div>

        {/* Education Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Education Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Field of study</label>
              <input
                type="text"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                placeholder="e.g., Computer Science, Business"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current education level</label>
              <select
                value={formData.currentEducationLevel}
                onChange={(e) => setFormData({ ...formData, currentEducationLevel: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Target education level</label>
              <select
                value={formData.targetEducationLevel}
                onChange={(e) => setFormData({ ...formData, targetEducationLevel: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">GPA</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                  placeholder="3.5"
                />
                <select
                  value={formData.gpaScale}
                  onChange={(e) => setFormData({ ...formData, gpaScale: e.target.value })}
                  className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                >
                  <option value="4.0">/ 4.0</option>
                  <option value="5.0">/ 5.0</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred study countries</label>
              <input
                type="text"
                value={formData.preferredStudyCountries}
                onChange={(e) => setFormData({ ...formData, preferredStudyCountries: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                placeholder="e.g., USA, UK, Canada (comma separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred study fields</label>
              <input
                type="text"
                value={formData.preferredStudyFields}
                onChange={(e) => setFormData({ ...formData, preferredStudyFields: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                placeholder="e.g., Computer Science, Engineering (comma separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Financial need level</label>
              <select
                value={formData.financialNeed}
                onChange={(e) => setFormData({ ...formData, financialNeed: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              >
                <option value="">Select level</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none text-gray-900 placeholder-gray-400"
                placeholder="Tell us about yourself, your goals, and what makes you unique..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                placeholder="e.g., Python, Leadership, Research (comma separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Extracurriculars</label>
              <input
                type="text"
                value={formData.extracurriculars}
                onChange={(e) => setFormData({ ...formData, extracurriculars: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                placeholder="e.g., Debate Club, Volunteer Work, Sports (comma separated)"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
