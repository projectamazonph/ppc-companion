// PostCSS config — check env to handle Vite 8 vs Next.js compat
// Vite 8's postcss-load-config can't resolve @tailwindcss/postcss
const isVitest = typeof process !== "undefined" && process.env.VITEST;

const config = {
  plugins: isVitest
    ? {}
    : ["@tailwindcss/postcss"],
};

export default config;
