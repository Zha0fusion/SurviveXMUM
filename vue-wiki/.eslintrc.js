module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    parser: "@babel/eslint-parser",
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "prettier/prettier": ["error", { endOfLine: "auto" }],
    "no-unused-components": "off", // 关闭未使用组件的警告
    "vue/multi-word-component-names": "off", // 关闭多词组件名的警告
    "vue/no-unused-vars": "off", // 关闭未使用变量的警告
    'prettier/prettier': 'off', // 关闭 prettier 的规则
  },
};
