// ─── VerificationPage ───────────────────────────────────────────────────────
// Replaces: Verificationscreen.kt
// Full verification form with organization details and document uploads

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../api/profile.api';
import Spinner from '../components/ui/Spinner';
import {
  ArrowLeft, Upload, X, CheckCircle, Shield, Building2, Phone, FileText,
  MapPin, Globe, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerificationPage() {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !phone.trim() || files.length === 0) {
      toast.error('Please fill all required fields and upload at least one document');
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', orgName);
      fd.append('phone', phone);
      if (address) fd.append('address', address);
      if (website) fd.append('website', website);
      if (contactEmail) fd.append('contactemail', contactEmail);
      if (description) fd.append('description', description);
      files.forEach((f) => fd.append('images', f));
      await profileApi.submitVerification(fd);
      setSuccess(true);
      toast.success('Verification submitted!');
      setTimeout(() => navigate('/create'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Verification Submitted
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
          We'll review your documents and notify you once your organization is verified.
        </p>
      </div>
    );
  }

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
            Organization
          </p>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Verify Organization
          </h1>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex gap-4 p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30">
        <Shield className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">Why verification?</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
            We verify organizations to protect donors and ensure transparency. Once verified, you
            can create campaigns and receive donations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Org Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <Building2 className="w-4 h-4 text-gray-400" /> Organization Name *
          </label>
          <input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className={inputCls}
            placeholder="Your organization name"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <Phone className="w-4 h-4 text-gray-400" /> Phone Number *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
            placeholder="+1234567890"
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 text-gray-400" /> Address
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputCls}
            placeholder="Organization address"
          />
        </div>

        {/* Website */}
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

        {/* Contact Email */}
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

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="w-4 h-4 text-gray-400" /> Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputCls} resize-none`}
            placeholder="Describe your organization and its mission..."
          />
        </div>

        {/* Documents */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <Upload className="w-4 h-4 text-gray-400" /> Verification Documents * (max 5)
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Upload registration certificates, licenses, or other official documents.
          </p>
          <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to upload documents</span>
            <span className="text-xs text-gray-400 mt-1">
              Accepted: Images (JPG, PNG, PDF scans)
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {files.length > 0 && (
            <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
              {files.map((f, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img
                    src={URL.createObjectURL(f)}
                    alt=""
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
        >
          {isSubmitting ? <Spinner className="py-0" /> : 'Submit Verification'}
        </button>
      </form>
    </div>
  );
}
