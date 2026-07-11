interface Props {
  status: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  approved: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', label: 'Approved', dot: 'bg-emerald-500' },
  active: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', label: 'Active', dot: 'bg-emerald-500' },
  pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', label: 'Pending', dot: 'bg-amber-500' },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Rejected', dot: 'bg-red-500' },
  not_submitted: { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-500 dark:text-gray-400', label: 'Not Submitted', dot: 'bg-gray-400' },
};

export default function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
}
