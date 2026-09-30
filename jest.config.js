/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  // Only the sources. The build compiles into dist/, which must not be run twice.
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      useESM: true,
      tsconfig: {
        module: "ESNext",
        moduleResolution: "node"
      }
    }],
  },
};
