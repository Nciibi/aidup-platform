import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string;
  icon: ReactNode;
  className?: string;
}

export default function StatCard({ label, value, icon, className = '' }: Props) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 ${className}`}>
      <span className="text-gray-400 dark:text-gray-500">{icon}</span>
      <div>
        <p className="text-base font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}
