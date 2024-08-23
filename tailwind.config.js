import plugin from "tailwindcss/plugin";
import colors from "tailwindcss/colors";
import typographyPlugin from "@tailwindcss/typography";
import { addIconSelectors as addIconSelectorsPlugin } from "@iconify/tailwind";

const uiPlugin = () =>
  plugin(({ addBase, theme }) => {
    /** @type {any} */
    const dark = theme("colors.neutral");
    addBase({
      ":root": {
        "--color-border": dark[200],
      },
      body: {
        backgroundColor: dark[50],
        color: dark[950],
      },
      "html.dark": {
        "--color-border": dark[900],
        "& body": {
          backgroundColor: dark[950],
          color: dark[50],
        },
      },
    });
  });

/** @type {import("tailwindcss").Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
      },
      borderColor: {
        DEFAULT: "var(--color-border)",
      },
      ringColor: {
        DEFAULT: colors.yellow[500],
      },
      ringOffsetColor: {
        DEFAULT: colors.yellow[500],
      },
      ringOpacity: {
        DEFAULT: 0.5,
      },
    },
  },

  plugins: [typographyPlugin(), addIconSelectorsPlugin(["ri"]), uiPlugin()],
};
