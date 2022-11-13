const HtmlWebpackPlugin = require("html-webpack-plugin");
var FriendlyErrorsWebpackPlugin = require("@soda/friendly-errors-webpack-plugin");
module.exports = {
  entry: "./src/index.ts",
  devServer: {
    port: "8080",
  },
  stats: "errors-only",
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      },
      {
        test: /\.glsl$/,
        loader: "webpack-glsl-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new FriendlyErrorsWebpackPlugin({
      clearConsole: true,
      compilationSuccessInfo: {
        messages: ["You application is running here http://localhost:8080"],
      },
    }),
  ],

  output: {
    filename: "index.js",
  },
};
