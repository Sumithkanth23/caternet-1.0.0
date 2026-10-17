const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function getImageUploadError(file) {
  if (!file) return 'Choose an image to upload.';
  if (!IMAGE_TYPES.includes(file.type)) return 'Use a JPG, PNG, or WebP image.';
  if (file.size > MAX_IMAGE_SIZE) return 'Image must be smaller than 5 MB.';
  return '';
}
