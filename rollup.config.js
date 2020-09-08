import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
// import { terser } from 'rollup-plugin-terser';
import { eslint } from 'rollup-plugin-eslint';
import json from 'rollup-plugin-json';
export default [
  {
    input: './src/index.js',
    output: {
      name: 'localmock',
      file: 'dist/release.js',
      format: 'umd',
    },
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      json({
        include: 'node_modules/**',
      }),
      commonjs({
        include: /node_modules/
      }),
      eslint({
        throwOnError: true,
        throwOnWarning: true,
        include: ['src/**'],
        exclude: ['node_modules/**']
      }),
      babel({
        exclude: 'node_modules/**', // 防止打包node_modules下的文件
        runtimeHelpers: true, // 使plugin-transform-runtime生效
      }),
      // terser(),
    ],
    // external: ['path', 'fs', 'os'],
  },
];