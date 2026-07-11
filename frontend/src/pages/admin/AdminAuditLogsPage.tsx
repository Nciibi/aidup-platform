import { useState, useEffect } from 'react';
import { getAllAuditLogs, deleteAuditLog } from '../../api/admin.api';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { Activity, Clock, Trash2, Eye, Globe, Monitor, Shield, User, ChevronDown, ChevronUp, Search } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await getAllAuditLogs();
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (error) {
      console.error('Failed to load audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this audit log entry?')) {
      try {
        await deleteAuditLog(id);
        loadLogs();
      } catch (error) {
        console.error('Failed to delete log', error);
      }
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
    if (status >= 200 && status < 300) return 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (status >= 300 && status < 400) return 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    if (status >= 400 && status < 500) return 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
    return 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  const getUserModelIcon = (model?: string) => {
    switch (model) {
      case 'admin': return <Shield className="w-3.5 h-3.5 text-purple-500" />;
      case 'organizer': return <User className="w-3.5 h-3.5 text-indigo-500" />;
      case 'donator': return <User className="w-3.5 h-3.5 text-blue-500" />;
      default: return <Activity className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  // Filter and sort
  const filteredLogs = logs
    .filter(log => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        log.action?.toLowerCase().includes(q) ||
        log.resource?.toLowerCase().includes(q) ||
        log.userModel?.toLowerCase().includes(q) ||
        log.ip?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime();
      const dateB = new Date(b.timestamp || 0).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

  if (loading) {
    return <div className="flex justify-center p-12"><Spinner /></div>;
  }

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Audit Logs</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">System activity and admin actions — {logs.length} total entries</p>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search actions, resources, IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm w-72"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5">
                  <button
                    onClick={() => setSortAsc(!sortAsc)}
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Timestamp
                    {sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </th>
                <th className="px-6 py-5">User</th>
                <th className="px-6 py-5">Action</th>
                <th className="px-6 py-5">Resource</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">IP</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-all duration-200 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-mono text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getUserModelIcon(log.userModel)}
                      <div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 capitalize">
                          {log.userModel || 'system'}
                        </span>
                        {log.userId && (
                          <p className="text-[10px] text-gray-400 font-mono">
                            {typeof log.userId === 'string' ? log.userId.slice(-6) : 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{log.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                      {log.resource || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {log.status && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {log.ip && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Globe className="w-3 h-3" />
                        <span className="font-mono">{log.ip}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setSelectedLog(log); setIsModalOpen(true); }}
                        className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(log._id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
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
          {filteredLogs.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                {searchQuery ? 'No matching logs found' : 'No audit logs yet'}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                {searchQuery ? 'Try a different search term.' : 'Actions will be recorded here.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Log Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Audit Log Details">
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Timestamp</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">HTTP Status</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${getStatusColor(selectedLog.status)}`}>
                  {selectedLog.status || 'N/A'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">User Type</p>
                <div className="flex items-center gap-2 mt-1">
                  {getUserModelIcon(selectedLog.userModel)}
                  <span className="font-bold text-gray-900 dark:text-white capitalize">{selectedLog.userModel || 'System'}</span>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">User ID</p>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                  {typeof selectedLog.userId === 'string' ? selectedLog.userId : JSON.stringify(selectedLog.userId) || 'N/A'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Action</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{selectedLog.action}</p>
            </div>

            <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Resource</p>
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{selectedLog.resource || 'N/A'}</p>
            </div>

            {selectedLog.ip && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> IP Address
                  </p>
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{selectedLog.ip}</p>
                </div>
                {selectedLog.userAgent && (
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Monitor className="w-3 h-3" /> User Agent
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 break-all leading-relaxed">{selectedLog.userAgent}</p>
                  </div>
                )}
              </div>
            )}

            {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Additional Details</p>
                <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold transition-transform active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
