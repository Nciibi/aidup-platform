import { useState, useEffect } from 'react';
import { getAllCampaigns, updateCampaign, deleteCampaign } from '../../api/admin.api';
import Spinner from '../../components/ui/Spinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Flag, Calendar, CheckCircle, XCircle, Info, Trash2, Image, CreditCard, Target, Eye, BookOpen } from 'lucide-react';
import { getFullImageUrl } from '../../utils/image';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamp, setSelectedCamp] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const res = await getAllCampaigns();
      if (Array.isArray(res)) {
        setCampaigns(res);
      } else if (res && res.data) {
        setCampaigns(res.data);
      }
    } catch (error) {
      console.error('Failed to load campaigns', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'approved') updateData.approved_at = new Date();
      if (newStatus === 'rejected') updateData.rejected_at = new Date();
      await updateCampaign(id, updateData);
      loadCampaigns();
      setIsViewModalOpen(false);
    } catch (error) {
      console.error('Failed to update campaign', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id);
        loadCampaigns();
      } catch (error) {
        console.error('Failed to delete campaign', error);
      }
    }
  };

  const openImagePreview = (img: string) => {
    setSelectedImage(img);
    setIsImageModalOpen(true);
  };

  const filteredCampaigns = filterStatus === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === filterStatus);

  const statusCounts = {
    all: campaigns.length,
    pending: campaigns.filter(c => c.status === 'pending').length,
    approved: campaigns.filter(c => c.status === 'approved').length,
    rejected: campaigns.filter(c => c.status === 'rejected').length,
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Spinner /></div>;
  }

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Campaigns</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Review and manage fundraising initiatives</p>
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
                <th className="px-8 py-5">Campaign</th>
                <th className="px-8 py-5">Progress</th>
                <th className="px-8 py-5">Deadline</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredCampaigns.map((camp) => {
                const bannerUrl = getFullImageUrl(camp.banner);
                const progress = camp.goal_amount > 0 ? Math.min(100, ((camp.raised_amount || 0) / camp.goal_amount) * 100) : 0;
                return (
                  <tr key={camp._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-all duration-200 group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        {bannerUrl ? (
                          <img src={bannerUrl} alt={camp.title} className="w-16 h-12 rounded-xl object-cover shadow-sm" />
                        ) : (
                          <div className="w-16 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Flag className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="max-w-xs">
                          <p className="font-bold text-gray-900 dark:text-white truncate text-base">{camp.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{camp.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5 min-w-[140px]">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-emerald-600 dark:text-emerald-400">${camp.raised_amount || 0}</span>
                          <span className="text-gray-400">of ${camp.goal_amount}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold">{progress.toFixed(0)}% funded</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {camp.goal_date ? new Date(camp.goal_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={camp.status || 'pending'} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setSelectedCamp(camp); setIsViewModalOpen(true); }}
                          className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors"
                          title="View Details"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {camp.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(camp._id, 'approved')}
                              className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl transition-colors"
                              title="Quick Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(camp._id, 'rejected')}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl transition-colors"
                              title="Quick Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(camp._id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredCampaigns.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No campaigns found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                {filterStatus !== 'all' ? `No ${filterStatus} campaigns.` : 'Campaigns will appear here.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Detail Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Campaign Details">
        {selectedCamp && (() => {
          const bannerUrl = getFullImageUrl(selectedCamp.banner);
          return (
            <div className="space-y-6">
              {/* Banner */}
              {bannerUrl && (
                <div className="relative rounded-3xl overflow-hidden shadow-lg cursor-pointer" onClick={() => openImagePreview(bannerUrl)}>
                  <img src={bannerUrl} alt={selectedCamp.title} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <StatusBadge status={selectedCamp.status || 'pending'} />
                  </div>
                </div>
              )}

              {/* Title & Meta */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{selectedCamp.title}</h3>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {!bannerUrl && <StatusBadge status={selectedCamp.status || 'pending'} />}
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Deadline: {selectedCamp.goal_date ? new Date(selectedCamp.goal_date).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    ID: {selectedCamp._id.slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Financials */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Raised</p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">${selectedCamp.raised_amount || 0}</p>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Goal</p>
                  <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">${selectedCamp.goal_amount}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-emerald-600 dark:text-emerald-400">Progress</span>
                  <span className="text-gray-400">
                    {selectedCamp.goal_amount > 0
                      ? `${Math.min(100, ((selectedCamp.raised_amount || 0) / selectedCamp.goal_amount) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, ((selectedCamp.raised_amount || 0) / selectedCamp.goal_amount) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Description */}
              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedCamp.description}</p>
              </div>

              {/* Story */}
              {selectedCamp.story && (
                <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Campaign Story
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{selectedCamp.story}</p>
                </div>
              )}

              {/* Goals */}
              {selectedCamp.goal && selectedCamp.goal.length > 0 && (
                <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Campaign Goals
                  </p>
                  <div className="space-y-2">
                    {selectedCamp.goal.map((g: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              {selectedCamp.paiment_methods && selectedCamp.paiment_methods.length > 0 && (
                <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> Payment Methods
                  </p>
                  <div className="space-y-2">
                    {selectedCamp.paiment_methods.map((pm: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold">
                          {pm.method_type || 'Unknown'}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium break-all">{pm.details || 'No details'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Campaign Images */}
              {selectedCamp.images && selectedCamp.images.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider flex items-center gap-1.5">
                    <Image className="w-4 h-4" /> Campaign Images ({selectedCamp.images.length})
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedCamp.images.map((img: string, idx: number) => {
                      const fullUrl = getFullImageUrl(img);
                      return (
                        <div
                          key={idx}
                          className="relative group rounded-xl overflow-hidden shadow-sm aspect-square bg-gray-100 dark:bg-gray-800 cursor-pointer"
                          onClick={() => openImagePreview(fullUrl || img)}
                        >
                          <img
                            src={fullUrl || img}
                            alt={`Campaign image ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12">No Image</text></svg>';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                {selectedCamp.status?.toLowerCase() === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedCamp._id, 'approved')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {actionLoading ? 'Processing...' : 'Approve Campaign'}
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedCamp._id, 'rejected')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                      {actionLoading ? 'Processing...' : 'Reject Campaign'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="w-full px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold transition-transform active:scale-95"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Full-size Image Preview */}
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
              alt="Campaign Image Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
