import { useState, useEffect } from 'react';
import { getAllOrganizers, deleteOrganizer, updateOrganizer } from '../../api/admin.api';
import Spinner from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Mail, Phone, MapPin, Calendar, Trash2, Edit2, Eye, Globe, Building2, Search, Shield, CheckCircle } from 'lucide-react';

type FilterStatus = 'all' | 'verified' | 'unverified';

export default function AdminOrganizersPage() {
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadOrganizers();
  }, []);

  const loadOrganizers = async () => {
    try {
      const res = await getAllOrganizers();
      if (res.success && res.data) {
        setOrganizers(res.data);
      }
    } catch (error) {
      console.error('Failed to load organizers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this organizer?')) {
      try {
        await deleteOrganizer(id);
        loadOrganizers();
        setIsViewModalOpen(false);
      } catch (error) {
        console.error('Failed to delete organizer', error);
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updateOrganizer(selectedOrg._id, selectedOrg);
      setIsEditModalOpen(false);
      loadOrganizers();
    } catch (error) {
      console.error('Failed to update organizer', error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrganizers = organizers
    .filter(org => {
      if (filterStatus === 'verified') return org.is_verified === true;
      if (filterStatus === 'unverified') return !org.is_verified;
      return true;
    })
    .filter(org => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        org.name?.toLowerCase().includes(q) ||
        org.username?.toLowerCase().includes(q) ||
        org.email?.toLowerCase().includes(q)
      );
    });

  const filterCounts = {
    all: organizers.length,
    verified: organizers.filter(o => o.is_verified === true).length,
    unverified: organizers.filter(o => !o.is_verified).length,
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Spinner /></div>;
  }

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Organizers</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage and verify registered organizations — {organizers.length} total</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search organizers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm w-64"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'verified', 'unverified'] as FilterStatus[]).map((status) => (
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
              {filterCounts[status]}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-8 py-5">Organization</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5">Joined</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredOrganizers.map((org) => (
                <tr key={org._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-all duration-200 group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar alt={org.name || org.username} src={org.photo} size="w-12 h-12" className="shadow-sm border-2 border-white dark:border-gray-800" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${org.is_verified ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">{org.name || org.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">ID: {org._id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={org.is_verified ? 'approved' : 'pending'} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium text-sm">{org.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs">{org.phone_number || org.phoneNumber || 'Not provided'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setSelectedOrg({...org}); setIsViewModalOpen(true); }}
                        className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedOrg({...org}); setIsEditModalOpen(true); }}
                        className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl transition-colors"
                        title="Edit Organizer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(org._id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors"
                        title="Delete Organizer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrganizers.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No organizers found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                {searchQuery ? 'Try a different search.' : 'They will appear here once they register.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Organizer Profile">
        {selectedOrg && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl">
              <Avatar src={selectedOrg.photo} alt={selectedOrg.name || selectedOrg.username} size="w-24 h-24" className="ring-4 ring-white dark:ring-gray-800 shadow-xl" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedOrg.name || selectedOrg.username}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={selectedOrg.is_verified ? 'approved' : 'pending'} />
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    Member since {new Date(selectedOrg.createdAt || Date.now()).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-3 text-indigo-600 dark:text-indigo-400">
                  <Mail className="w-5 h-5" />
                  <span className="font-bold text-sm uppercase tracking-wider">Email Address</span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium break-all">{selectedOrg.email}</p>
                {selectedOrg.contactemail && selectedOrg.contactemail !== selectedOrg.email && (
                  <p className="text-xs text-gray-500 mt-1">Contact: {selectedOrg.contactemail}</p>
                )}
              </div>
              <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-3 text-emerald-600 dark:text-emerald-400">
                  <Phone className="w-5 h-5" />
                  <span className="font-bold text-sm uppercase tracking-wider">Phone Number</span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium">{selectedOrg.phone_number || selectedOrg.phoneNumber || 'Not available'}</p>
              </div>
              {selectedOrg.location && (
                <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-3 text-rose-600 dark:text-rose-400">
                    <MapPin className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">Location</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedOrg.location}</p>
                </div>
              )}
              {selectedOrg.website && (
                <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-3 text-blue-600 dark:text-blue-400">
                    <Globe className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">Website</span>
                  </div>
                  <a href={selectedOrg.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-medium hover:underline break-all">
                    {selectedOrg.website}
                  </a>
                </div>
              )}
              {selectedOrg.bio && (
                <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm col-span-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bio</p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedOrg.bio}</p>
                </div>
              )}
              <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm col-span-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Account Details</p>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <p className="text-xs text-gray-400">Username</p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{selectedOrg.username || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Google Auth</p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{selectedOrg.isGoogleAuth ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Last Login</p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      {selectedOrg.lastLogin ? new Date(selectedOrg.lastLogin).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => { setIsViewModalOpen(false); setSelectedOrg({...selectedOrg}); setIsEditModalOpen(true); }}
                className="flex-1 px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/30 active:scale-95 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
              <button
                onClick={() => handleDelete(selectedOrg._id)}
                className="px-6 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold transition-all hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold transition-transform active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Organizer">
        {selectedOrg && (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Organization Name</label>
                <input
                  type="text"
                  value={selectedOrg.name || selectedOrg.username || ''}
                  onChange={(e) => setSelectedOrg({ ...selectedOrg, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white font-medium transition-shadow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  value={selectedOrg.username || ''}
                  onChange={(e) => setSelectedOrg({ ...selectedOrg, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white font-medium transition-shadow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={selectedOrg.email || ''}
                  onChange={(e) => setSelectedOrg({ ...selectedOrg, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white font-medium transition-shadow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Phone</label>
                <input
                  type="text"
                  value={selectedOrg.phone_number || ''}
                  onChange={(e) => setSelectedOrg({ ...selectedOrg, phone_number: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white font-medium transition-shadow"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Bio</label>
                <textarea
                  value={selectedOrg.bio || ''}
                  onChange={(e) => setSelectedOrg({ ...selectedOrg, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white font-medium transition-shadow resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  value={selectedOrg.location || ''}
                  onChange={(e) => setSelectedOrg({ ...selectedOrg, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white font-medium transition-shadow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Website</label>
                <input
                  type="text"
                  value={selectedOrg.website || ''}
                  onChange={(e) => setSelectedOrg({ ...selectedOrg, website: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white font-medium transition-shadow"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Verification Status
                </label>
                <select
                  value={selectedOrg.is_verified ? 'approved' : 'pending'}
                  onChange={(e) => setSelectedOrg({ ...selectedOrg, is_verified: e.target.value === 'approved' })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white font-medium transition-shadow"
                >
                  <option value="pending">Pending / Not Verified</option>
                  <option value="approved">Approved / Verified</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold transition-all hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
