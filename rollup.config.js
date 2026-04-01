const typescript = require('rollup-plugin-typescript2');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const external = require('rollup-plugin-peer-deps-external');
const terser = require('@rollup/plugin-terser');
const postcss = require('rollup-plugin-postcss');
const pkg = require('./package.json');
const image = require('@rollup/plugin-image');
const { dts } = require('rollup-plugin-dts');

module.exports = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    external: ['viem', 'react', 'react-dom'],
    plugins: [
      external(),
      typescript({
        tsconfig: './tsconfig.json',
        useTsconfigDeclarationDir: true,
      }),
      resolve(),
      commonjs(),
      terser(),
      postcss({
        extract: false,
        inject: true,
        minimize: true,
        modules: true,
      }),
      image(),
    ],
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    },
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/types/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external: ['react', 'react-dom', 'viem']
  }
];