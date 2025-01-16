import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/**", "*.js"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: { 
      globals: globals.browser
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "warn",
      "arrow-spacing": ["error", { "before": true, "after": true }],
      "block-spacing": ["error", "always"],
      "comma-dangle": ["error", "never"],
      "comma-spacing": ["error", { "before": false, "after": true }],
      "eol-last": ["error", "always"],
      "indent": ["error", 2],
      "keyword-spacing": ["error", { "before": true, "after": true }],
      "max-len": ["error", { code: 100 }],
      "no-trailing-spaces": ["error"],
      "object-curly-spacing": ["error", "always"],
      "quotes": ["error", "single"],
      "semi": ["error", "always"],
      "sort-imports": ["error", {
        "ignoreCase": false,
        "ignoreDeclarationSort": false,
        "ignoreMemberSort": false,
        "memberSyntaxSortOrder": ["none", "all", "multiple", "single"]
      }],
      "space-before-function-paren": ["error", {
        "anonymous": "always",
        "named": "never",
        "asyncArrow": "always"
      }],
      "space-infix-ops": ["error"]
    }
  }
];
