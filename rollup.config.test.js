import typescript from 'rollup-plugin-typescript2';
import license from 'rollup-plugin-license';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';
import mvConfig from './config/mv.config';
import { pluginConfig } from './config/plugin.config';
import * as paramsConfig from './config/params.config';
import generateParams from './tools/params.generator';
import pkg from './package.json';

const filename = pluginConfig.pluginName;
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
];
const globals = {};
for (const ext of external) {
  globals[ext] = 'window';
}

export default {
  external,
  input: 'e2e/index.ts',
  output: [
    {
      file: 'dist/' + filename + 'test.js',
      format: 'iife',
      name: pluginConfig.author + '_' + pluginConfig.pluginName + '_Test',
      sourcemap: false,
      globals
    }
  ],
  plugins: [
    json(),
    resolve(),
    commonjs(),
    typescript({
      typescript: require('typescript')
    })
  ]
};
