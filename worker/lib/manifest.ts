import type { Manifest } from "vite";

let cachedManifest: Manifest | undefined = undefined;
/**
 * Returns the manifest file for production build.
 *
 * @returns {Manifest | undefined} The manifest file or undefined if not in production mode.
 */
export const getManifest = (): Manifest | undefined => {
  if (!import.meta.env.PROD) return undefined;
  if (!cachedManifest) {
    const MANIFEST = import.meta.glob<{ default: Manifest }>("/dist/.vite/manifest.json", { eager: true });
    for (let [, mod] of Object.entries(MANIFEST)) {
      if (mod["default"]) {
        cachedManifest = mod.default;
        break;
      }
    }
  }
  return cachedManifest;
};

/**
 * Returns the script file path based on the name and the manifest file.
 *
 * @param {string} name - The name of the script.
 * @returns {string} The script file path. If the manifest file is not found or the script file is not found in the manifest, it returns the name as is.
 */
export const getScript = (name: string): string => {
  return `/${getManifest()?.[name]?.file ?? name}`;
};
