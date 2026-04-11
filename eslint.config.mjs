import next from "eslint-config-next";

const config = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "dist/**",
      "node_modules/**",
    ],
  },
  ...next,
];

export default config;
