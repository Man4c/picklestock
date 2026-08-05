import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    clearMocks: true,
    coverage: {
      include: ["lib/**/*.ts", "app/admin/actions.ts"],
    },
  },
});
