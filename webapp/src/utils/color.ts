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

// Function to convert hex color to RGB
function hexToRgb(hex): number[] {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

// Function to adjust color brightness
function adjustBrightness([r, g, b]: number[], factor) {
  return [
    Math.min(255, Math.max(0, Math.floor(r * factor))),
    Math.min(255, Math.max(0, Math.floor(g * factor))),
    Math.min(255, Math.max(0, Math.floor(b * factor))),
  ];
}

// Main function to get shades of a color
export function getShades(hexColor) {
  const rgbColor: number[] = hexToRgb(hexColor);
  const lighterShadeRbg = adjustBrightness(rgbColor, 1.7);
  const darkerShadeRbg = adjustBrightness(rgbColor, 0.5);
  const lighterShade = rgbToHex(
    lighterShadeRbg[0],
    lighterShadeRbg[1],
    lighterShadeRbg[2]
  ); // 20% lighter
  const darkerShade = rgbToHex(
    darkerShadeRbg[0],
    darkerShadeRbg[1],
    darkerShadeRbg[2]
  ); // 20% darker

  return { lighterShade, darkerShade };
}
