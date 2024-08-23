import type { Manifest } from "vite";

let cachedManifest: Manifest | undefined = undefined;
/**
 * Returns the manifest file for production build.
 * @returns {Manifest | undefined} The manifest file or undefined if not in production mode.
 */
export const getManifest = (): Manifest | undefined => {
  if (!import.meta.env.PROD) return undefined;
  if (!cachedManifest) {
    const mf = import.meta.glob<{ default: Manifest }>("/dist/.vite/manifest.json", { eager: true });
    for (let [, mod] of Object.entries(mf)) {
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
 * @param {string} name - The name of the script.
 * @returns {string} The script file path. If the manifest file is not found or the script file is not found in the manifest, it returns the name as is.
 */
export const getAsset = (name: string): string => {
  return `/${getManifest()?.[name]?.file ?? name}`;
};

export const getDarkModeScript = ({
  storageKey = "_t_",
  toggleId = "toggle-theme",
  darkKey = "dark",
  lightKey = "light",
  isAstroViewTransition = false
} = {}) => `!((e,t,m,a,v)=>{const c=()=>"undefined"!=typeof localStorage&&localStorage.getItem(e)?localStorage.getItem(e):window.matchMedia(\`(prefers-color-scheme:\${m})\`).matches?m:a,n=(t=c())=>{t===a?document.documentElement.classList.remove(m):document.documentElement.classList.add(m),window.localStorage.setItem(e,t)},o=()=>{const e=document.getElementById(t);e&&e.addEventListener("click",e=>{e.preventDefault(),n(c()===m?a:m)})};n();v?(document.addEventListener("astro:after-swap",()=>n()),document.addEventListener("astro:page-load",o)):(window.addEventListener("DOMContentLoaded",o))})("${storageKey}","${toggleId}","${darkKey}","${lightKey}",${isAstroViewTransition});`