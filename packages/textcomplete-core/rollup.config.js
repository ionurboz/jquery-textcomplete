import typescript from "rollup-plugin-typescript2"

export default [
    {
        input: "./src/index.ts",
        output: {
            file: "./dist/index.js",
            format: "cjs",
            sourcemap: true
        },
        plugins: [
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
