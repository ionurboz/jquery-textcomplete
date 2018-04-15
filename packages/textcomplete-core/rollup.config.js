import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import typescript from "rollup-plugin-typescript2"

const outputs = [
    {
        file: "./dist/index.js",
        format: "cjs",
        sourcemap: true
    },
    {
        file: "./dist/index.mjs",
        format: "es",
        sourcemap: true
    }
]

export default outputs.map(output => ({
    input: "./src/index.ts",
    output,
    plugins: [
        resolve(),
        commonjs({
            namedExports: {
                "node_modules/eventemitter3/index.js": ["EventEmitter"]
            }
        }),
        typescript(),
    ]
}))
