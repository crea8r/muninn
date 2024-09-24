export const normalizeToTagStyle = (text: string) => {
  return text
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]/g, ''); // Remove all non-alphanumeric characters except hyphens
};

export const generateRandomPassword = () => {
  const randomPassword = Math.random().toString(36).slice(-8);
  return randomPassword;
};

export const normalise = (str: string) => {
  return str.replace(/\s/g, '').toLowerCase();
};
