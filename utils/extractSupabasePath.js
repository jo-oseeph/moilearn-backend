export const extractSupabasePath = (fileUrl) => {
  const marker = "/storage/v1/object/public/";
  const index = fileUrl.indexOf(marker);

  if (index === -1) return null;

  return fileUrl.substring(index + marker.length);
};
 