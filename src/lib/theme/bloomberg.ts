/** Bloomberg-terminal presentation — dense black canvas, amber chrome, white data. */
export const BLOOMBERG = {
  canvas: "#000000",
  panel: "#0a0a0a",
  border: "#333333",
  chrome: "#ff9900",
  chromeMuted: "#cc7a00",
  label: "#ff9900",
  data: "#ffffff",
  muted: "#999999",
} as const;

/** PRO mode (non-beginner) uses Bloomberg institutional chrome. */
export function isBloombergChrome(beginnerMode: boolean): boolean {
  return !beginnerMode;
}
