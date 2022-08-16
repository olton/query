import { terser } from 'rollup-plugin-terser'

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
    }
]