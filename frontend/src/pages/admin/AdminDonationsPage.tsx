import { useState, useEffect } from 'react';
import { getAllDonations, updateDonation, deleteDonation } from '../../api/admin.api';
import Spinner from '../../components/ui/Spinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { DollarSign, Calendar, CheckCircle, XCircle, Eye, Trash2, Image, FileText, CreditCard, MessageSquare, Filter } from 'lucide-react';
import { getFullImageUrl } from '../../utils/image';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDon, setSelectedDon] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [reviewComments, setReviewComments] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const res = await getAllDonations();
      if (res.success && res.data) {
        setDonations(res.data);
      }
    } catch (error) {
      console.error('Failed to load donations', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string, amount: number) => {
    setActionLoading(true);
    try {
      await updateDonation(id, { status: newStatus, amount, review_comments: reviewComments });
      setIsModalOpen(false);
      setReviewComments('');
      loadDonations();
    } catch (error) {
      console.error('Failed to update donation', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this donation record?')) {
      try {
        await deleteDonation(id);
        loadDonations();
      } catch (error) {
        console.error('Failed to delete donation', error);
      }
    }
  };

  const openViewModal = (don: any) => {
    setSelectedDon(don);
    setReviewComments(don.review_comments || '');
    setIsModalOpen(true);
  };

  const openImagePreview = (img: string) => {
    setSelectedImage(img);
    setIsImageModalOpen(true);
  };

  const filteredDonations = filterStatus === 'all' 
    ? donations 
    : donations.filter(d => d.status === filterStatus);

  const statusCounts = {
    all: donations.length,
    pending: donations.filter(d => d.status === 'pending').length,
    approved: donations.filter(d => d.status === 'approved').length,
    rejected: donations.filter(d => d.status === 'rejected').length,
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Spinner /></div>;
  }

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Donations</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Review donation proofs and manage transactions</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              filterStatus === status
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${
              filterStatus === status ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-8 py-5">ID</th>
                <th className="px-8 py-5">Donor / Campaign</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Method</th>
                <th className="px-8 py-5">Evidence</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredDonations.map((don) => (
                <tr key={don._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-all duration-200 group">
                  <td className="px-8 py-5 text-xs font-mono text-gray-400">{don._id.slice(-8).toUpperCase()}</td>
                  <td className="px-8 py-5">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {typeof don.donator_id === 'object' && don.donator_id
                          ? (don.donator_id.username || don.donator_id.name || 'Unknown')
                          : (don.donator_id ? `ID: ${String(don.donator_id).slice(-6)}` : 'Anonymous')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {typeof don.campaign_id === 'object' && don.campaign_id
                          ? (don.campaign_id.title || 'Unknown Campaign')
                          : (don.campaign_id ? `Campaign: ${String(don.campaign_id).slice(-6)}` : 'No campaign')}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                      ${don.amount || 0}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">{don.currency || 'USD'}</span>
                  </td>
                  <td className="px-8 py-5">
                    {don.paiment_method && don.paiment_method.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {don.paiment_method[0].method_type || 'N/A'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    {don.evidance && don.evidance.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Image className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {don.evidance.length} file{don.evidance.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(don.submitted_date || don.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={don.status || 'pending'} />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openViewModal(don)}
                        className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(don._id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDonations.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No donations found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                {filterStatus !== 'all' ? `No ${filterStatus} donations.` : 'Donations will appear here.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Donation Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Donation Details">
        {selectedDon && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Amount</p>
                <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">${selectedDon.amount || 0}</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium mt-1">{selectedDon.currency || 'USD'}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <div className="mt-2"><StatusBadge status={selectedDon.status || 'pending'} /></div>
                <p className="text-xs text-gray-500 mt-2">
                  Submitted: {new Date(selectedDon.submitted_date || selectedDon.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Donor & Campaign Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Donor</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {typeof selectedDon.donator_id === 'object' && selectedDon.donator_id
                    ? (selectedDon.donator_id.username || selectedDon.donator_id.name || 'Unknown')
                    : (selectedDon.donator_id ? `ID: ${String(selectedDon.donator_id).slice(-8)}` : 'Anonymous')}
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Campaign</p>
                <p className="font-bold text-gray-900 dark:text-white truncate">
                  {typeof selectedDon.campaign_id === 'object' && selectedDon.campaign_id
                    ? (selectedDon.campaign_id.title || 'Unknown')
                    : (selectedDon.campaign_id ? `ID: ${String(selectedDon.campaign_id).slice(-8)}` : 'N/A')}
                </p>
              </div>
            </div>

            {/* Payment Method */}
            {selectedDon.paiment_method && selectedDon.paiment_method.length > 0 && (
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  <CreditCard className="w-3.5 h-3.5 inline mr-1" /> Payment Method
                </p>
                <div className="space-y-2">
                  {selectedDon.paiment_method.map((pm: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold">
                        {pm.method_type || 'Unknown'}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{pm.details || 'No details'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {selectedDon.description && (
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  <FileText className="w-3.5 h-3.5 inline mr-1" /> Description
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedDon.description}</p>
              </div>
            )}

            {/* Evidence / Proof of Donation */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">
                <Image className="w-4 h-4 inline mr-1.5" /> Donation Evidence / Proof
              </p>
              <div className="grid grid-cols-2 gap-4">
                {selectedDon.evidance && selectedDon.evidance.length > 0 ? (
                  selectedDon.evidance.map((img: string, idx: number) => {
                    const fullUrl = getFullImageUrl(img);
                    return (
                      <div
                        key={idx}
                        className="relative group rounded-2xl overflow-hidden shadow-md aspect-video bg-gray-100 dark:bg-gray-800 cursor-pointer"
                        onClick={() => openImagePreview(fullUrl || img)}
                      >
                        <img
                          src={fullUrl || img}
                          alt={`Evidence ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12">No Image</text></svg>';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="p-2 bg-white rounded-full text-gray-900">
                            <Eye className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded-lg text-[10px] text-white font-bold">
                          {idx + 1}/{selectedDon.evidance.length}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                    <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 italic">No evidence uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Review Comments */}
            {selectedDon.status === 'pending' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Review Comments (Optional)
                </label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Add a comment for this donation review..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  rows={3}
                />
              </div>
            )}

            {/* Existing review info */}
            {selectedDon.review_comments && selectedDon.status !== 'pending' && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Admin Review Comments</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDon.review_comments}</p>
                {selectedDon.review_date && (
                  <p className="text-xs text-gray-400 mt-2">
                    Reviewed on {new Date(selectedDon.review_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              {selectedDon.status === 'pending' ? (
                <>
                  <button
                    onClick={() => handleStatusChange(selectedDon._id, 'approved', selectedDon.amount)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {actionLoading ? 'Processing...' : 'Approve Donation'}
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedDon._id, 'rejected', selectedDon.amount)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                    {actionLoading ? 'Processing...' : 'Reject Donation'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold transition-transform active:scale-95"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Full-size Image Preview Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white font-bold text-sm flex items-center gap-1"
            >
              <XCircle className="w-5 h-5" /> Close Preview
            </button>
            <img
              src={selectedImage}
              alt="Evidence Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
