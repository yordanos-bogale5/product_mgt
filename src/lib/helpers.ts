/**
 * Ensures a valid image URL is returned, falling back to a placeholder if needed
 * @param imageUrl The original image URL
 * @returns A valid image URL
 */
export const getValidImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return 'https://via.placeholder.com/150?text=No+Image';
  }
  
  // Check if the URL is from Supabase storage and properly formatted
  if (imageUrl.includes('storage/v1/object/public/')) {
    return imageUrl;
  }
  
  // If it's a valid URL but not from Supabase, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Default fallback
  return 'https://via.placeholder.com/150?text=No+Image';
};
