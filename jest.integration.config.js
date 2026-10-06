import base from "./jest.config.js";

/** Runs against real services. See compose.yaml. */
export default {
  ...base,
  roots: ["<rootDir>/test/integration"],
  testTimeout: 20000,
};
