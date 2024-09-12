export const normalizeToTagStyle = (text: string) => {
  return text
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]/g, ''); // Remove all non-alphanumeric characters except hyphens
};
