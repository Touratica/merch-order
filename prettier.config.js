/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: ["prettier-plugin-prisma", "prettier-plugin-tailwindcss"],
  tailwindFunctions: ["cn"],
};

export default config;
