'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Button, Card } from '@/components/ui';
import { X, Upload, User, Mail, Briefcase, Link as LinkIcon, Target } from 'lucide-react';

interface EditProfileModalProps {
  user: any;
  onClose: () => void;
  onUpdate: (updatedUser: any) => void;
}

export default function EditProfileModal({ user, onClose, onUpdate }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    role: user?.role || 'builder',
    github: user?.externalLinks?.github || '',
    linkedin: user?.externalLinks?.linkedin || '',
    portfolio: user?.externalLinks?.portfolio || '',
    leetcode: user?.externalLinks?.leetcode || '',
    behance: user?.externalLinks?.behance || '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar ? `http://localhost:5000${user.avatar}` : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('auth_token');

    try {
      // Upload avatar if changed
      let avatarUrl = user?.avatar;
      if (avatarFile) {
        const formDataAvatar = new FormData();
        formDataAvatar.append('avatar', avatarFile);

        const avatarRes = await fetch('http://localhost:5000/api/users/me/avatar', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataAvatar,
        });

        const avatarData = await avatarRes.json();

        if (!avatarData.success) {
          throw new Error(avatarData.error?.message || 'Failed to upload avatar');
        }

        avatarUrl = avatarData.data.avatar;
      }

      // Update profile
      const updateData = {
        displayName: formData.displayName,
        username: formData.username,
        bio: formData.bio,
        role: formData.role,
        externalLinks: {
          github: formData.github,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
          leetcode: formData.leetcode,
          behance: formData.behance,
        },
      };

      const res = await fetch('http://localhost:5000/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to update profile');
      }

      onUpdate(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card glass className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold gradient-text">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {avatarPreview ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent-cyan">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold">
                    {formData.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              <p className="text-xs text-text-secondary">JPG, PNG, GIF or WEBP. Max 5MB.</p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-accent-cyan" />
                Display Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg focus:outline-none focus:border-accent-cyan transition-colors"
                placeholder="Your display name"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent-cyan" />
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg focus:outline-none focus:border-accent-cyan transition-colors"
                placeholder="username"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg focus:outline-none focus:border-accent-cyan transition-colors resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-accent-cyan" />
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg focus:outline-none focus:border-accent-cyan transition-colors capitalize"
              >
                <option value="builder">Builder</option>
                <option value="mentor">Mentor</option>
                <option value="investor">Investor</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>

            {/* External Links */}
            <div>
              <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-accent-cyan" />
                External Links
              </label>
              <div className="space-y-3">
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg focus:outline-none focus:border-accent-cyan transition-colors"
                  placeholder="GitHub URL"
                />
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg focus:outline-none focus:border-accent-cyan transition-colors"
                  placeholder="LinkedIn URL"
                />
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg focus:outline-none focus:border-accent-cyan transition-colors"
                  placeholder="Portfolio URL"
                />
                <input
                  type="url"
                  name="leetcode"
                  value={formData.leetcode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg focus:outline-none focus:border-accent-cyan transition-colors"
                  placeholder="LeetCode URL"
                />
                <input
                  type="url"
                  name="behance"
                  value={formData.behance}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg focus:outline-none focus:border-accent-cyan transition-colors"
                  placeholder="Behance URL"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
