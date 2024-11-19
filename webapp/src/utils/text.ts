export const normalizeToTagStyle = (text: string) => {
  if (!text) return '';
  return text
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]/g, ''); // Remove all non-alphanumeric characters except hyphens
};

export const normalizeToIdStyle = (text: string) => {
  if (!text) return '';
  return text
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
};

export const generateRandomPassword = () => {
  const randomPassword = Math.random().toString(36).slice(-8);
  return randomPassword;
};

export const normalise = (str: string) => {
  if (!str) return '';
  return str.replace(/\s/g, '').toLowerCase();
};

export const shortenText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const randomId = (len: number) => {
  // random ID with text and numbers
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
