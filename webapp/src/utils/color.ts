// Helper function to convert RGB to hex
const rgbToHex = (r: number, g: number, b: number) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Generate random bright color
export const getRandomBrightColor = () => {
  const r = Math.floor(Math.random() * 128) + 128; // Value between 128 and 255
  const g = Math.floor(Math.random() * 128) + 128; // Value between 128 and 255
  const b = Math.floor(Math.random() * 128) + 128; // Value between 128 and 255
  return rgbToHex(r, g, b);
};

// Generate random dark color
export const getRandomDarkColor = () => {
  const r = Math.floor(Math.random() * 128); // Value between 0 and 127
  const g = Math.floor(Math.random() * 128); // Value between 0 and 127
  const b = Math.floor(Math.random() * 128); // Value between 0 and 127
  return rgbToHex(r, g, b);
};
