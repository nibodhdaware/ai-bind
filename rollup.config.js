import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default {
    input: "src/index.js",
    output: [
        {
            file: "dist/ai-binder.min.js",
            format: "iife",
            name: "AiBinder",
            plugins: [terser()],
        },
        {
            file: "dist/ai-binder.esm.js",
            format: "esm",
            plugins: [terser()],
        },
        {
            file: "dist/ai-binder.cjs.js",
            format: "cjs",
            plugins: [terser()],
        },
    ],
    plugins: [resolve(), commonjs()],
};
