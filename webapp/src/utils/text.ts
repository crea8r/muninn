export const normalizeToTagStyle = (text: string) => {
  if (!text) return '';
  return text
    .toLowerCase() // Convert to lowercase
    .trim(); // Remove leading/trailing spaces
  // .replace(/\s+/g, '-') // Replace spaces with hyphens
  // .replace(/[^\w-]/g, ''); // Remove all non-alphanumeric characters except hyphens
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

// Utility function to calculate Levenshtein distance
function levenshteinDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

// Function to calculate similarity score (1 - normalized Levenshtein distance)
export function similarityScore(a, b) {
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const maxLen = Math.max(a.length, b.length);
  return 1 - distance / maxLen; // Score between 0 and 1
}

export const SIMILARITY_THRESHOLD = 0.4;

export function findSimilarText(text: string, list: string[]) {
  return (
    list
      .filter((item) => similarityScore(text, item) > SIMILARITY_THRESHOLD)
      .sort((a, b) => similarityScore(b, text) - similarityScore(a, text)) || [
      '',
    ]
  );
}
