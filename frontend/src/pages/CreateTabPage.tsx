// ─── CreateTabPage ──────────────────────────────────────────────────────────
// Replaces: CampaignCreationScreen.kt
// Handles verification states and full campaign creation form

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTab } from '../hooks/useCreateTab';
import { campaignApi } from '../api/campaign.api';
import Spinner from '../components/ui/Spinner';
import {
  Clock, AlertTriangle, ShieldCheck, PlusCircle, ArrowLeft, Upload, X,
  FileText, DollarSign, Calendar, Image, CreditCard, Target, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Category } from '../types/campaign.types';

export default function CreateTabPage() {
  const navigate = useNavigate();
  const { state, rejectionTimeLeft, refresh } = useCreateTab();

  // ── Loading state ──────────────────────────────────────────────────────
  if (state === 'loading') return <Spinner className="min-h-[60vh]" />;

  // ── Pending verification ───────────────────────────────────────────────
  if (state === 'pending') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Verification Pending
        </h2>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
          Your verification documents are being reviewed. You'll be able to create campaigns once
          your organization is verified.
        </p>
        <button
          onClick={refresh}
          className="px-8 py-3 rounded-2xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all"
        >
          Check Status
        </button>
      </div>
    );
  }

  // ── Rejected (24h cooldown) ────────────────────────────────────────────
  if (state === 'rejected') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Verification Rejected
        </h2>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
          Unfortunately, your verification was not approved. You can resubmit after the cooldown
          period ends.
        </p>
        <div className="px-6 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm font-bold text-red-600 dark:text-red-400">
            Cooldown: {rejectionTimeLeft}
          </p>
        </div>
        <button
          onClick={() => navigate('/verification')}
          className="px-8 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold transition-all"
        >
          Resubmit Verification
        </button>
      </div>
    );
  }

  // ── Not verified — show verification prompt ────────────────────────────
  if (state === 'form') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <ShieldCheck className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Verify Your Organization
        </h2>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
          To create campaigns, you need to verify your organization first. Submit your documents for
          review.
        </p>
        <button
          onClick={() => navigate('/verification')}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/25 hover:shadow-2xl transition-all"
        >
          Start Verification
        </button>
      </div>
    );
  }

  // ── Verified — show campaign creation form ─────────────────────────────
  return <CampaignCreationForm />;
}

// ─── Campaign Creation Form ──────────────────────────────────────────────────

function CampaignCreationForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [goals, setGoals] = useState<string[]>(['']);
  const [paymentMethods, setPaymentMethods] = useState<{ method_type: string; details: string }[]>([
    { method_type: '', details: '' },
  ]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    campaignApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  };

  const addGoal = () => setGoals((prev) => [...prev, '']);
  const removeGoal = (i: number) => setGoals((prev) => prev.filter((_, idx) => idx !== i));
  const updateGoal = (i: number, val: string) =>
    setGoals((prev) => prev.map((g, idx) => (idx === i ? val : g)));

  const addPayment = () =>
    setPaymentMethods((prev) => [...prev, { method_type: '', details: '' }]);
  const removePayment = (i: number) =>
    setPaymentMethods((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !goalAmount || !categoryId) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      if (story) fd.append('story', story);
      fd.append('goal_amount', goalAmount);
      if (goalDate) fd.append('goal_date', goalDate);
      fd.append('category', categoryId);

      const validGoals = goals.filter((g) => g.trim());
      if (validGoals.length > 0) fd.append('goal', JSON.stringify(validGoals));

      const validPayments = paymentMethods.filter((p) => p.method_type.trim());
      if (validPayments.length > 0) fd.append('paiment_methods', JSON.stringify(validPayments));

      if (bannerFile) fd.append('banner', bannerFile);
      imageFiles.forEach((f) => fd.append('images', f));

      const response = await campaignApi.createCampaign(fd);
      if (response.success) {
        toast.success('Campaign created successfully!');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Failed to create campaign');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            New Campaign
          </p>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Create Campaign
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Banner Upload */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <Image className="w-4 h-4 text-gray-400" /> Banner Image
          </label>
          <label className="block cursor-pointer">
            {bannerPreview ? (
              <div className="relative rounded-2xl overflow-hidden h-48">
                <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setBannerFile(null);
                    setBannerPreview(null);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload banner image</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
          </label>
        </div>

        {/* Title */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="w-4 h-4 text-gray-400" /> Campaign Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="Give your campaign a compelling title"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <PlusCircle className="w-4 h-4 text-gray-400" /> Category *
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputCls}
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="w-4 h-4 text-gray-400" /> Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`${inputCls} resize-none`}
            placeholder="Describe your campaign and its impact..."
            required
          />
        </div>

        {/* Story */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <BookOpen className="w-4 h-4 text-gray-400" /> Story
          </label>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={4}
            className={`${inputCls} resize-none`}
            placeholder="Share the story behind your campaign..."
          />
        </div>

        {/* Goal Amount + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 text-gray-400" /> Goal Amount ($) *
            </label>
            <input
              type="number"
              min="1"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className={inputCls}
              placeholder="10000"
              required
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" /> Goal Date
            </label>
            <input
              type="date"
              value={goalDate}
              onChange={(e) => setGoalDate(e.target.value)}
              className={inputCls}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Campaign Goals */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <Target className="w-4 h-4 text-gray-400" /> Campaign Goals
          </label>
          <div className="space-y-3">
            {goals.map((g, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={g}
                  onChange={(e) => updateGoal(i, e.target.value)}
                  className={`${inputCls} flex-1`}
                  placeholder={`Goal ${i + 1}`}
                />
                {goals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGoal(i)}
                    className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addGoal}
              className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
            >
              + Add Goal
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <CreditCard className="w-4 h-4 text-gray-400" /> Payment Methods
          </label>
          <div className="space-y-3">
            {paymentMethods.map((pm, i) => (
              <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 space-y-3">
                <div className="flex gap-2">
                  <input
                    value={pm.method_type}
                    onChange={(e) => {
                      const updated = [...paymentMethods];
                      updated[i] = { ...updated[i], method_type: e.target.value };
                      setPaymentMethods(updated);
                    }}
                    className={`${inputCls} flex-1`}
                    placeholder="e.g. Bank Transfer, PayPal"
                  />
                  {paymentMethods.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePayment(i)}
                      className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  value={pm.details}
                  onChange={(e) => {
                    const updated = [...paymentMethods];
                    updated[i] = { ...updated[i], details: e.target.value };
                    setPaymentMethods(updated);
                  }}
                  className={inputCls}
                  placeholder="Account details, link, etc."
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addPayment}
              className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
            >
              + Add Payment Method
            </button>
          </div>
        </div>

        {/* Additional Images */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <Image className="w-4 h-4 text-gray-400" /> Additional Images (max 5)
          </label>
          <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 transition-colors cursor-pointer">
            <Upload className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-sm text-gray-500">Click to upload images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageAdd}
              className="hidden"
            />
          </label>
          {imageFiles.length > 0 && (
            <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
              {imageFiles.map((file, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
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
          {isSubmitting ? <Spinner className="py-0" /> : 'Create Campaign'}
        </button>
      </form>
    </div>
  );
}
