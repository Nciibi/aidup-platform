import { useState, useEffect } from 'react';
import { getAllUsers, deleteOrganizer, deleteDonor } from '../../api/admin.api';
import Spinner from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Mail, Shield, User, Trash2, Eye, Phone, Calendar, Search, Users } from 'lucide-react';

type RoleFilter = 'all' | 'organizer' | 'donator';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await getAllUsers();
      if (res.success && res.data) {
        const orgs = (res.data.organizers || []).map((org: any) => ({
          ...org,
          name: org.name || org.username,
          role: 'organizer',
          is_verified: org.is_verified,
        }));
        const donors = (res.data.donors || []).map((donor: any) => ({
          ...donor,
          name: donor.name || donor.username,
          role: 'donator',
          is_verified: true,
        }));
        setUsers([...orgs, ...donors]);
      }
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, role: string) => {
    if (window.confirm(`Are you sure you want to delete this ${role}?`)) {
      try {
        if (role === 'organizer') {
          await deleteOrganizer(id);
        } else {
          await deleteDonor(id);
        }
        loadUsers();
      } catch (error) {
        console.error('Failed to delete user', error);
      }
    }
  };

  const filteredUsers = users
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });

  const roleCounts = {
    all: users.length,
    organizer: users.filter(u => u.role === 'organizer').length,
    donator: users.filter(u => u.role === 'donator').length,
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Spinner /></div>;
  }

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">System Users</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage all platform participants — {users.length} total</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm w-64"
          />
        </div>
      </div>

      {/* Role Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'organizer', 'donator'] as RoleFilter[]).map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              roleFilter === role
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800'
            }`}
          >
            {role === 'all' ? 'All' : role === 'organizer' ? 'Organizers' : 'Donors'}
            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${
              roleFilter === role ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              {roleCounts[role]}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-8 py-5">User Profile</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Joined</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-all duration-200 group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <Avatar alt={user.name} src={user.photo} size="w-12 h-12" className="shadow-sm border-2 border-white dark:border-gray-800" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'organizer'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {user.role === 'organizer' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {user.role === 'organizer' ? 'ORGANIZER' : 'DONOR'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={user.is_verified ? 'approved' : 'pending'} />
                  </td>
                  <td className="px-8 py-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setSelectedUser(user); setIsViewModalOpen(true); }}
                        className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id, user.role)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No users found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                {searchQuery ? 'Try a different search.' : 'Users will appear here.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="User Information">
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl">
              <Avatar src={selectedUser.photo} alt={selectedUser.name} size="w-20 h-20" className="shadow-lg border-4 border-white dark:border-gray-800" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-[10px] font-black uppercase tracking-tighter">
                    UID: {selectedUser._id}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Role</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{selectedUser.role}</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedUser.is_verified ? 'approved' : 'pending'} />
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Username</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.username || 'N/A'}</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Joined</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm col-span-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Information</p>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium">{selectedUser.email}</span>
                  </div>
                  {(selectedUser.phoneNumber || selectedUser.phone_number) && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium">{selectedUser.phoneNumber || selectedUser.phone_number}</span>
                    </div>
                  )}
                  {selectedUser.bio && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bio</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedUser.bio}</p>
                    </div>
                  )}
                  {selectedUser.location && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-xs text-gray-400">Location:</span>
                      <span className="font-medium text-sm">{selectedUser.location}</span>
                    </div>
                  )}
                  {selectedUser.lastLogin && (
                    <div className="text-xs text-gray-400 mt-1">
                      Last login: {new Date(selectedUser.lastLogin).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => handleDelete(selectedUser._id, selectedUser.role)}
                className="flex-1 px-6 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold transition-all hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-95 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete User
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold transition-transform active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
