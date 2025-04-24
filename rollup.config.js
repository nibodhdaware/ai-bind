import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default {
    input: "src/index.js",
    output: {
        file: "dist/ai-binder.min.js",
        format: "iife",
        name: "AiBinder",
    },
    plugins: [
        replace({
            "process.env.GEMINI_API_KEY": JSON.stringify(
                process.env.GEMINI_API_KEY,
            ),
            preventAssignment: true,
        }),
        resolve({
            browser: true,
        }),
        commonjs(),
        terser(),
    ],
};
