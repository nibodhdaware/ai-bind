const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: "./src/ai-binder.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "ai-binder.min.js",
        library: "AiBinder",
        libraryTarget: "umd",
        globalObject: "this",
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    plugins: [],
};
