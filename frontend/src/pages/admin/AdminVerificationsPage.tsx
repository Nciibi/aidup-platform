import { useState, useEffect } from 'react';
import { getAllVerifications, updateVerification, deleteVerification } from '../../api/admin.api';
import Spinner from '../../components/ui/Spinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { FileText, Calendar, CheckCircle, XCircle, Eye, User, Trash2, Phone, MessageSquare, Image, ExternalLink } from 'lucide-react';
import { getFullImageUrl } from '../../utils/image';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'not_submitted';

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVer, setSelectedVer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [reviewComments, setReviewComments] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      const res = await getAllVerifications();
      if (res.success && res.data) {
        setVerifications(res.data);
      }
    } catch (error) {
      console.error('Failed to load verifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await updateVerification(id, { status: newStatus, review_comments: reviewComments });
      loadVerifications();
      setIsModalOpen(false);
      setReviewComments('');
    } catch (error) {
      console.error('Failed to update verification', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this verification request?')) {
      try {
        await deleteVerification(id);
        loadVerifications();
      } catch (error) {
        console.error('Failed to delete verification', error);
      }
    }
  };

  const openViewModal = (ver: any) => {
    setSelectedVer(ver);
    setReviewComments(ver.review_comments || '');
    setIsModalOpen(true);
  };

  const openImagePreview = (img: string) => {
    setSelectedImage(img);
    setIsImageModalOpen(true);
  };

  const filteredVerifications = filterStatus === 'all'
    ? verifications
    : verifications.filter(v => v.status === filterStatus);

  const statusCounts = {
    all: verifications.length,
    pending: verifications.filter(v => v.status === 'pending').length,
    approved: verifications.filter(v => v.status === 'approved').length,
    rejected: verifications.filter(v => v.status === 'rejected').length,
    not_submitted: verifications.filter(v => v.status === 'not_submitted').length,
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Spinner /></div>;
  }

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Verifications</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Review organizer identity documents and verification requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected', 'not_submitted'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              filterStatus === status
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800'
            }`}
          >
            {status === 'not_submitted' ? 'Not Submitted' : status.charAt(0).toUpperCase() + status.slice(1)}
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
                <th className="px-8 py-5">Organizer</th>
                <th className="px-8 py-5">Phone</th>
                <th className="px-8 py-5">Documents</th>
                <th className="px-8 py-5">Submitted</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredVerifications.map((ver) => (
                <tr key={ver._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-all duration-200 group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base">
                          {ver.name || 'Anonymous Organizer'}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          OID: {(ver.organizer_id || ver._id).slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium text-sm">{ver.phone || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {ver.images && ver.images.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Image className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {ver.images.length} doc{ver.images.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-gray-500">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      {ver.submitted_date
                        ? new Date(ver.submitted_date).toLocaleDateString()
                        : new Date(ver.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={ver.status} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openViewModal(ver)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </button>
                      <button
                        onClick={() => handleDelete(ver._id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredVerifications.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No verification requests</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                {filterStatus !== 'all' ? `No ${filterStatus} verifications.` : 'Requests will appear here.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Verification Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Verification Review">
        {selectedVer && (
          <div className="space-y-6">
            {/* Organizer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  <User className="w-3.5 h-3.5 inline mr-1" /> Organizer Name
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedVer.name}</p>
              </div>
              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  <Phone className="w-3.5 h-3.5 inline mr-1" /> Phone Number
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedVer.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Organizer ID</p>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">{selectedVer.organizer_id}</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Status</p>
                <div className="mt-1"><StatusBadge status={selectedVer.status} /></div>
              </div>
            </div>

            {/* Identity Documents */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">
                <FileText className="w-4 h-4 inline mr-1.5" /> Identity Documents
              </p>
              <div className="grid grid-cols-2 gap-4">
                {selectedVer.images && selectedVer.images.length > 0 ? (
                  selectedVer.images.map((img: string, idx: number) => {
                    const fullUrl = getFullImageUrl(img);
                    return (
                      <div
                        key={idx}
                        className="relative group rounded-2xl overflow-hidden shadow-md aspect-video bg-gray-100 dark:bg-gray-800 cursor-pointer"
                        onClick={() => openImagePreview(fullUrl || img)}
                      >
                        <img
                          src={fullUrl || img}
                          alt={`Document ${idx + 1}`}
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
                          Doc {idx + 1}
                        </div>
                        <a
                          href={fullUrl || img}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                    <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 italic">No documents uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Review Comments */}
            {selectedVer.status === 'pending' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Review Comments (Optional)
                </label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Add a comment for this verification review..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  rows={3}
                />
              </div>
            )}

            {/* Existing review */}
            {selectedVer.review_comments && selectedVer.status !== 'pending' && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Admin Review Comments</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedVer.review_comments}</p>
                {selectedVer.review_date && (
                  <p className="text-xs text-gray-400 mt-2">
                    Reviewed on {new Date(selectedVer.review_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
              {selectedVer.status === 'pending' ? (
                <>
                  <button
                    onClick={() => handleStatusChange(selectedVer._id, 'approved')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {actionLoading ? 'Processing...' : 'Approve Verification'}
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedVer._id, 'rejected')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                    {actionLoading ? 'Processing...' : 'Reject Verification'}
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
              alt="Document Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
