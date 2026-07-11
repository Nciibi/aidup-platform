import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminDashboard } from '../../api/admin.api';
import StatCard from '../../components/ui/StatCard';
import { Users, Building2, Heart, Flag, Shield, DollarSign, Clock, UserCheck, UserX, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getAdminDashboard();
      setStats(res.stats);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spinner />
      </div>
    );
  }

  const quickActions = [
    { label: 'Review Verifications', count: stats?.pendingVerifications || 0, path: '/admin/verifications', color: 'from-rose-500 to-pink-600', icon: <Shield className="w-5 h-5" /> },
    { label: 'Pending Campaigns', count: stats?.pendingCampaigns || 0, path: '/admin/campaigns', color: 'from-amber-500 to-orange-600', icon: <Flag className="w-5 h-5" /> },
    { label: 'Pending Donations', count: stats?.pendingDonations || 0, path: '/admin/donations', color: 'from-blue-500 to-cyan-600', icon: <Clock className="w-5 h-5" /> },
  ];

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
          Overview of the AidUp platform — manage everything in one place.
        </p>
      </div>

      {/* Quick Actions — items needing attention */}
      {(stats?.pendingVerifications > 0 || stats?.pendingCampaigns > 0 || stats?.pendingDonations > 0) && (
        <div className="mb-8">
          <h2 className="text-sm font-extrabold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-4 ml-1">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Needs Your Attention
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.filter(a => a.count > 0).map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-90`}></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-bold">{action.label}</p>
                    <p className="text-white text-3xl font-black mt-1">{action.count}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    {action.icon}
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mb-12 -mr-12"></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="mb-8">
        <h2 className="text-sm font-extrabold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-4 ml-1">
          Platform Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20">
                <Users className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats?.totalUsers || 0}</p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Users</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">
                {stats?.totalOrganizers || 0} organizers
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                {stats?.totalDonors || 0} donors
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
                <Flag className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats?.totalCampaigns || 0}</p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaigns</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> {stats?.approvedCampaigns || 0}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> {stats?.pendingCampaigns || 0}
              </span>
              <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <UserX className="w-3 h-3" /> {stats?.rejectedCampaigns || 0}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-900/20">
                <Shield className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats?.pendingVerifications || 0}</p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending Reviews</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Organizer verifications awaiting review
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20">
                <DollarSign className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">${stats?.totalDonations || 0}</p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Donations</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                {stats?.pendingDonations || 0} pending approval
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-sm font-extrabold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-4 ml-1">
          Quick Navigation
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" />, desc: 'All platform users' },
            { label: 'Organizers', path: '/admin/organizers', icon: <Building2 className="w-5 h-5" />, desc: 'Manage organizations' },
            { label: 'Campaigns', path: '/admin/campaigns', icon: <Flag className="w-5 h-5" />, desc: 'Review campaigns' },
            { label: 'Verifications', path: '/admin/verifications', icon: <Shield className="w-5 h-5" />, desc: 'ID verification' },
            { label: 'Donations', path: '/admin/donations', icon: <DollarSign className="w-5 h-5" />, desc: 'Transaction records' },
            { label: 'Audit Logs', path: '/admin/audit-logs', icon: <TrendingUp className="w-5 h-5" />, desc: 'System activity' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-left hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-lg hover:shadow-purple-100/50 dark:hover:shadow-none transition-all duration-300 group"
            >
              <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 w-fit mb-3 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
                <span className="text-gray-400 group-hover:text-purple-500 transition-colors">{item.icon}</span>
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
