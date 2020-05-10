module.exports = {
  "extends": "airbnb-base",
  "plugins": [
      "import"
  ],
  "env": {
    "node": true
  },
  "rules": {
    "comma-dangle": [
      "error",
      {
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "always-multiline",
        "exports": "always-multiline",
        "functions": "never"
      }
    ],

    "no-prototype-builtins": "off",
    "max-len": ["error", 140, 2, {
      "ignoreUrls": true,
      "ignoreComments": true,
      "ignoreRegExpLiterals": true,
      "ignoreStrings": true,
      "ignoreTemplateLiterals": true,
    }],
    "no-await-in-loop":"off",
    "no-plusplus":"off",
    "no-shadow":"off",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-underscore-dangle": "off",
    "no-param-reassign": "off",
    "guard-for-in": "off",
    "class-methods-use-this": "off",
    "no-use-before-define": ["error", { "functions": false, "classes": false,"variables":false }],
    "prefer-destructuring": ["error", {"array":false,"object":true}],
    "no-empty":["error",{"allowEmptyCatch":true}],
    "array-callback-return":"off",
    "consistent-return":"off",
    "prefer-promise-reject-errors":"off",
    "global-require":"off",
    "default-case":"off",
    "func-names":"off",
    "no-console":"off",
    "new-cap":"off",
  }
};
