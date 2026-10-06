import base from "./jest.config.js";

/** Runs against real services. See compose.yaml. */
export default {
  ...base,
  roots: ["<rootDir>/test/integration"],
  testTimeout: 20000,
  // ioredis keeps a 2s disconnectTimeout timer after a refused connection.
  // It clears itself; wait past it before reporting open handles.
  openHandlesTimeout: 3000,
};
