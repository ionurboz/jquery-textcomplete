import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import typescript from "rollup-plugin-typescript2"

const namedExports = {
    "node_modules/eventemitter3/index.js": ["EventEmitter"]
}

export default [
    {
        input: "./src/index.ts",
        output: {
            file: "./dist/index.js",
            format: "cjs",
            sourcemap: true
        },
        plugins: [
            resolve(),
            commonjs({ namedExports }),
            typescript({
                tsconfigOverride: {
                    compilerOptions: {
                        target: "es5"
                    }
                }
            })
        ]
    },
    {
        input: "./src/index.ts",
        output: {
            file: "./dist/index.mjs",
            format: "es",
            sourcemap: true
        },
        plugins: [
            resolve(),
            commonjs({ namedExports }),
            typescript({
                tsconfigOverride: {
                    compilerOptions: {
                        target: "es2015"
                    }
                }
            }),
        ]
    }
]
