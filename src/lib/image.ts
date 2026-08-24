export const optimizedImage = (url: string, width = 400, quality = 80): string => {
  if (!url) return url;
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}width=${width}&quality=${quality}`;
  }
  return url;
};
