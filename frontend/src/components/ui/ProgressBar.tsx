interface Props {
  value: number; // 0 to 1
  className?: string;
  color?: string;
  trackColor?: string;
  height?: string;
}

export default function ProgressBar({
  value,
  className = '',
  color = 'bg-orange-500',
  trackColor = 'bg-orange-100 dark:bg-orange-900/30',
  height = 'h-2',
}: Props) {
  const pct = Math.min(Math.max(value, 0), 1) * 100;

  return (
    <div className={`w-full ${height} rounded-full overflow-hidden ${trackColor} ${className}`}>
      <div
        className={`${height} rounded-full ${color} transition-all duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
