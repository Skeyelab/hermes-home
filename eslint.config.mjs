import next from "eslint-config-next";

const config = [
  {
    ignores: [
      ".pnp.*",
      ".yarn/**",
      ".next/**",
      "out/**",
      "dist/**",
      "node_modules/**",
    ],
  },
  ...next,
];

export default config;
