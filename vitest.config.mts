import { defineConfig } from "vitest/config";

// Unit test untuk logika murni di src/lib (lihat AGENTS.md bagian 10)
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
