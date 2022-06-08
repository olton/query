import { terser } from 'rollup-plugin-terser'
import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'

export default [
    {
        input: 'src/browser.js',
        output: [
            {
                file: 'lib/query.js',
                format: 'iife',
                name: "",
                plugins: [
                ]
            },
            {
                file: 'lib/query.min.js',
                format: 'iife',
                name: "",
                plugins: [
                    terser()
                ]
            }
        ]
    },
    {
        input: 'src/query.js',
        output: [
            {
                file: 'dist/query.js',
                format: 'esm',
            }
        ],
        plugins: [
            commonjs(),
            babel({ babelHelpers: 'bundled' })
        ]
    }
]