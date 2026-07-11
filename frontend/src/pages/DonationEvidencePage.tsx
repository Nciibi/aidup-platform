// ─── DonationEvidencePage ───────────────────────────────────────────────────
// Replaces: DonationEvidenceScreen.kt

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDonations } from '../hooks/useDonations';
import Spinner from '../components/ui/Spinner';
import { ArrowLeft, Upload, X, CheckCircle } from 'lucide-react';

export default function DonationEvidencePage() {
  const { id: campaignId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSubmitting, error, submitSuccess, submitEvidence, resetSubmit } = useDonations();
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);

  const PAYMENT_OPTIONS = ['Cash', 'Bank Transfer', 'Mobile Money', 'PayPal', 'Cryptocurrency'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleMethod = (method: string) => {
    setSelectedMethods((prev) => prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) return;
    const success = await submitEvidence(campaignId, description, selectedMethods, files);
    if (success) {
      setTimeout(() => { resetSubmit(); navigate(-1); }, 2000);
    }
  };

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Donation Submitted!</h2>
        <p className="text-gray-500">Your evidence is pending review.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Submit Donation</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}

        {/* Payment Methods */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Payment Method Used</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_OPTIONS.map((method) => (
              <button key={method} type="button" onClick={() => toggleMethod(method)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedMethods.includes(method)
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe your donation..."
            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-none" />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Evidence Images (max 5)</label>
          <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to upload images</span>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          </label>
          {files.length > 0 && (
            <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
              {files.map((file, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img src={URL.createObjectURL(file)} alt="" className="w-20 h-20 rounded-xl object-cover" />
                  <button type="button" onClick={() => removeFile(i)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={isSubmitting || selectedMethods.length === 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/25 hover:shadow-2xl transition-all disabled:opacity-60">
          {isSubmitting ? <Spinner className="py-0" /> : 'Submit Evidence'}
        </button>
      </form>
    </div>
  );
}
