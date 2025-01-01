import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{ts}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["/dist/**", "**/*.js"]
  },
  {
    rules: {
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
      "space-before-function-paren": ["error", "never"],
      "space-infix-ops": ["error"]
    }
  }
];