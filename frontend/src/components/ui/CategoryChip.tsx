interface Props {
  text: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

export default function CategoryChip({ text, icon, isSelected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 whitespace-nowrap ${
        isSelected
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon && <span className="text-base">{icon}</span>}
      {text}
    </button>
  );
}
