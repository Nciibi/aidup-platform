// ─── EditProfilePage ────────────────────────────────────────────────────────
// Replaces: Editprofilescreen.kt
// Full edit form with image preview, role-specific fields, validation

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Globe, Type, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { profileData, organizerData, userRole, updateProfile } = useProfile();
  const isOrg = userRole === 'organizer';

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOrg && organizerData) {
      setName(organizerData.name || '');
      setUsername(organizerData.username || '');
      setBio(organizerData.bio || '');
      setEmail(organizerData.email || '');
      setPhone(organizerData.phoneNumber || '');
      setLocation(organizerData.location || '');
      setWebsite(organizerData.website || '');
      setContactEmail(organizerData.contactemail || '');
    } else if (profileData) {
      setName(profileData.name || '');
      setUsername(profileData.username || '');
      setBio(profileData.bio || '');
      setEmail(profileData.email || '');
      setPhone(profileData.phoneNumber || '');
    }
  }, [isOrg, organizerData, profileData]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    const fd = new FormData();
    if (name) fd.append('name', name);
    if (username) fd.append('username', username);
    if (bio) fd.append('bio', bio);
    if (email) fd.append('email', email);
    if (phone) fd.append('phoneNumber', phone);
    if (isOrg && location) fd.append('location', location);
    if (isOrg && website) fd.append('website', website);
    if (isOrg && contactEmail) fd.append('contactemail', contactEmail);
    if (photo) fd.append(isOrg ? 'images' : 'photo', photo);

    const success = await updateProfile(fd, isOrg);
    setIsSaving(false);
    if (success) {
      toast.success('Profile updated!');
      navigate('/profile');
    } else {
      toast.error('Failed to update profile');
    }
  };

  const currentPhoto = isOrg ? organizerData?.photo : profileData?.photo;

  const inputCls =
    'w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all';

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-orange-500 uppercase">
            Settings
          </p>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Edit Profile</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center">
          <label className="cursor-pointer relative group">
            <Avatar
              src={photoPreview || currentPhoto}
              alt={name}
              size="w-28 h-28"
            />
            <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-400 mt-2">Tap to change photo</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 text-gray-400" /> Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="Your full name"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <Type className="w-4 h-4 text-gray-400" /> Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputCls}
              placeholder="@username"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 text-gray-400" /> Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Tell us about yourself..."
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/200</p>
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4 text-gray-400" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 text-gray-400" /> Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
              placeholder="+1234567890"
            />
          </div>

          {/* Organizer-specific fields */}
          {isOrg && (
            <>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 text-gray-400" /> Location
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={inputCls}
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  <Globe className="w-4 h-4 text-gray-400" /> Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={inputCls}
                  placeholder="https://yourorg.com"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 text-gray-400" /> Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className={inputCls}
                  placeholder="contact@yourorg.com"
                />
              </div>
            </>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
        >
          {isSaving ? <Spinner className="py-0" /> : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
