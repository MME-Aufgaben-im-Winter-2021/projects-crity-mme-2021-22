import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

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
            { test: /\.svg$/, type: "asset/resource" },
            { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: "app/src/index.html", favicon: "app/resources/img/favicon.ico" }),
        new MiniCssExtractPlugin({ filename: "text_layer_builder.css" })
    ]
};