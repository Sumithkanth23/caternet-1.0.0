import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { toAbsoluteUrl } from '../../lib/api';

/**
 * Clickable avatar for sidebars.
 * Props:
 *   imageUrl    – current image path (relative or absolute)
 *   displayName – fallback text for initial
 *   onUpload    – async (file: File) => updatedProfile  (handles API call)
 *   onSuccess   – (updatedProfile) => void  (e.g. setProfile)
 */
export default function SidebarAvatarUpload({ imageUrl, displayName, onUpload, onSuccess }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null); // optimistic local preview

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);
    try {
      const updated = await onUpload(file);
      if (onSuccess) onSuccess(updated);
      // Release old object URL
      URL.revokeObjectURL(objectUrl);
      setPreview(null); // real URL from server will now come via profile
    } catch {
      setPreview(null); // revert on error
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected
      e.target.value = '';
    }
  };

  const src = preview || (imageUrl ? toAbsoluteUrl(imageUrl) : null);
  const initial = (displayName || '?').charAt(0).toUpperCase();

  return (
    <div className="relative w-12 h-12 shrink-0 group cursor-pointer" onClick={() => inputRef.current?.click()}>
      {/* Avatar */}
      {src ? (
        <img
          src={src}
          alt={displayName}
          className="w-12 h-12 rounded-full object-cover border-2 border-orange-400"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-lg font-bold text-white">
          {initial}
        </div>
      )}

      {/* Hover overlay */}
      {!uploading && (
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera size={18} className="text-white" />
        </div>
      )}

      {/* Uploading spinner */}
      {uploading && (
        <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
          <Loader2 size={18} className="text-white animate-spin" />
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
