import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default {
    input: "src/ai-binder.js",
    output: {
        file: "dist/ai-binder.min.js",
        format: "iife",
        name: "AiBinder",
        sourcemap: true,
        banner: "/*! AiBinder v1.0.0 | MIT License */",
        footer: "//# sourceMappingURL=ai-binder.min.js.map",
    },
    plugins: [
        resolve(),
        commonjs(),
        terser({
            format: {
                comments: false,
                preamble: "/*! AiBinder v1.0.0 | MIT License */",
            },
        }),
    ],
};
