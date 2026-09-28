const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const unicorn = require("eslint-plugin-unicorn");

module.exports = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      unicorn,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        Bun: "readonly",
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        crypto: "readonly",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "unicorn/better-regex": "error",
      "unicorn/no-console-spaces": "error",
      "unicorn/prefer-node-protocol": "error",
      "unicorn/prefer-modern-dom-apis": "error",
      "unicorn/prefer-export-from": "error",
      "unicorn/prefer-ternary": "error",
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    ignores: [
      "dist/**",
      ".next/**",
      "node_modules/**",
      "bun.lockb",
      "*.config.js",
      "*.config.mjs",
    ],
  }
);