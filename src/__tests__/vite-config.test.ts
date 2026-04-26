// @vitest-environment node
import { describe, it, expect } from "vitest";
import config from "../../vitest.config.mjs";

describe("vitest.config.mts", () => {
  // Positive cases
  describe("positive", () => {
    it("exports a config object", () => {
      expect(config).toBeDefined();
      expect(typeof config).toBe("object");
    });

    it("has a test configuration block", () => {
      expect(config).toHaveProperty("test");
      expect(typeof config.test).toBe("object");
    });

    it("uses jsdom as the test environment", () => {
      expect(config.test?.environment).toBe("jsdom");
    });

    it("has a plugins array", () => {
      expect(Array.isArray(config.plugins)).toBe(true);
    });

    it("has at least two plugins (tsconfigPaths and react)", () => {
      expect((config.plugins as unknown[]).length).toBeGreaterThanOrEqual(2);
    });
  });

  // Negative cases
  describe("negative", () => {
    it("does not use node as the test environment", () => {
      expect(config.test?.environment).not.toBe("node");
    });

    it("does not use happy-dom as the test environment", () => {
      expect(config.test?.environment).not.toBe("happy-dom");
    });

    it("does not have an empty plugins array", () => {
      expect((config.plugins as unknown[]).length).not.toBe(0);
    });

    it("does not have undefined test environment", () => {
      expect(config.test?.environment).not.toBeUndefined();
    });
  });

  // Edge cases
  describe("edge cases", () => {
    it("plugins array contains only truthy (non-null) entries", () => {
      const plugins = config.plugins as unknown[];
      const nonNullPlugins = plugins.filter(Boolean);
      expect(nonNullPlugins.length).toBe(plugins.length);
    });

    it("test block does not contain unexpected top-level keys beyond environment", () => {
      const knownKeys = new Set([
        "environment",
        "globals",
        "setupFiles",
        "include",
        "exclude",
        "coverage",
        "testTimeout",
        "hookTimeout",
        "reporters",
        "watch",
        "threads",
        "pool",
        "poolOptions",
        "isolate",
        "passWithNoTests",
        "bail",
        "retry",
        "sequence",
        "benchmark",
        "alias",
        "server",
        "typecheck",
        "clearMocks",
        "restoreMocks",
        "resetMocks",
        "mockReset",
        "fakeTimers",
        "snapshotOptions",
        "allowOnly",
        "dangerouslyIgnoreUnhandledErrors",
        "slowTestThreshold",
        "testNamePattern",
        "outputFile",
        "ui",
        "open",
        "browser",
        "singleThread",
        "maxWorkers",
        "minWorkers",
        "fileParallelism",
        "environmentMatchGlobs",
        "environmentOptions",
        "runner",
        "diff",
        "cache",
        "chaiConfig",
        "logHeapUsage",
        "css",
        "resolveSnapshotPath",
        "dir",
        "root",
        "name",
        "mode",
        "update",
        "watchExclude",
        "forceRerunTriggers",
      ]);

      const actualKeys = Object.keys(config.test ?? {});
      const unknownKeys = actualKeys.filter((k) => !knownKeys.has(k));
      expect(unknownKeys).toEqual([]);
    });

    it("config object itself is not null or array", () => {
      expect(config).not.toBeNull();
      expect(Array.isArray(config)).toBe(false);
    });
  });
});
