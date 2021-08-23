import typescript from 'rollup-plugin-typescript2';
import {terser} from 'rollup-plugin-terser';
import { name } from './package.json';

export default [
  // ES module build (replaces broken basic TypeScript compilation)
  // * ref: <https://github.com/microsoft/TypeScript/issues/18442> , <https://github.com/alshdavid/rxjs/blob/main/rollup.config.js#L10>
  // * ref: <https://github.com/microsoft/TypeScript/pull/35148>
  // * ref: <https://github.com/microsoft/TypeScript/issues/37582>
  {
    preserveModules: true,
    input: ['src/index.ts'],
    output: [{ dir: 'dist/esm', format: 'esm', entryFileNames: '[name].mjs' }],
    plugins: [typescript({ tsconfig: './tsconfig.npm.json' })],
  },
  {
    preserveModules: true,
    input: ['src/index.ts'],
    output: [{ dir: 'dist/cjs', format: 'cjs', entryFileNames: '[name].js' }],
    plugins: [typescript({ tsconfig: './tsconfig.npm.json' })],
  },
  {
    preserveModules: false,
    input: ['src/index.ts'],
    output: [{ dir: 'dist/umd', format: 'umd', entryFileNames: '[name].js', name }],
    plugins: [typescript({ tsconfig: './tsconfig.npm.json' }), terser()],
  },
  {
    preserveModules: false,
    input: ['src/index.ts'],
    output: [{ dir: 'dist/amd', format: 'amd', entryFileNames: '[name].js', name }],
    plugins: [typescript({ tsconfig: './tsconfig.npm.json' }), terser()],
  },
]