import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        setupFiles: ["./src/_tests_/setup.ts"],
        environment: "node",
    },
    define: {
        "process.env.NODE_ENV": JSON.stringify("test"),
    },
});