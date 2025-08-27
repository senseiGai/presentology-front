import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Project-wide rule overrides
  {
    rules: {
      // Allow explicit usage of the `any` type across the project
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
