import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
    entry: "./app/src/index.js",
    mode: "development",
    output: {
        path: path.join(path.resolve(), "dist"),
        filename: "index_bundle.js"
    },
    module: {
        rules: [
            // TODO(optimize): Use this instead (reduce GET requests): https://www.npmjs.com/package/svg-inline-loader ?
            { test: /\.svg$/, type: "asset/resource" }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "app/src/index.html"
        })
    ]
};