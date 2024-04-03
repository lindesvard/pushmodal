import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import clean from '@rollup-extras/plugin-clean';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import { dts } from 'rollup-plugin-dts';

const packageJson = require('./package.json');

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        interop: 'compat',
        exports: 'named',
        sourcemap: true,
        inlineDynamicImports: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        exports: 'named',
        sourcemap: true,
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      clean('dist'),
      peerDepsExternal(),
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
      }),
      typescript({
        tsconfig: './tsconfig.build.json',
      }),
      terser(),
      postcss({
        plugins: [autoprefixer],
        modules: {
          namedExport: true,
          //minify classnames
          generateScopedName: '[hash:base64:8]',
        },
        //uncomment the following 2 lines if you want to extract styles into a separated file
        /*extract: 'styles.css',
        inject: false,*/
        minimize: true,
        sourceMap: true,
        extensions: ['.scss', '.css'],
        use: ['sass'],
      }),
    ],
  },
  {
    input: 'dist/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
