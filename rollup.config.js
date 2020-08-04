import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
// import { terser } from 'rollup-plugin-terser';
import { eslint } from 'rollup-plugin-eslint';

export default [
  {
    input: './src/index.js',
    output: {
      name: 'localmock',
      file: 'dist/release.js',
      format: 'cjs',
      // minify: true,
    },
    plugins: [
      resolve(), // 这样 Rollup 能找到 `ms`
      commonjs(), // 这样 Rollup 能转换 `ms` 为一个ES模块
      eslint({
        throwOnError: true,
        throwOnWarning: true,
        include: ['src/**'],
        // external: ['path', 'fs', 'mkdir', 'os'],
        exclude: ['node_modules/**']
     }),
      babel({
        exclude: 'node_modules/**', // 防止打包node_modules下的文件
        runtimeHelpers: true, // 使plugin-transform-runtime生效
      }),
      // terser(),
    ],
  },
];