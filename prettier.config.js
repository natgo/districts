/** @type {import("prettier").Options} */
const config = {
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  printWidth: 100,
  trailingComma: "all",
  importOrder: [
    "^(^solid-js|solid-start$)",
    "^@mui/(.*)$",
    "<THIRD_PARTY_MODULES>",
    "^~/(.*)$",
    "^../",
    "^[./]",
  ],
  importOrderGroupNamespaceSpecifiers: true,
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
};

export default config;
