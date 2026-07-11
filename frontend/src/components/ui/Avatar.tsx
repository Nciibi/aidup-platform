import { getFullImageUrl } from '../../utils/image';

interface Props {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: string;
  className?: string;
}

export default function Avatar({ src, alt = 'Avatar', fallback, size = 'w-10 h-10', className = '' }: Props) {
  const imageUrl = getFullImageUrl(src);
  const initials = (alt || '?').charAt(0).toUpperCase();

  return imageUrl ? (
    <img
      src={imageUrl}
      alt={alt}
      className={`${size} rounded-full object-cover ring-2 ring-white dark:ring-gray-800 ${className}`}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
      }}
    />
  ) : (
    <div
      className={`${size} rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm ${className}`}
    >
      {fallback || initials}
    </div>
  );
}
