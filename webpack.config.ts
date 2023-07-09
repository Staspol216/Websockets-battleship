import path from 'path';


export default () => {
    return {
        entry: "./index.ts",
        target: "node",
        mode: "production",
        output: {
            filename: "bundle.min.js",
            path: path.resolve(__dirname, "dist"),
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
    }
};
