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
const licensePlugin = license({
  banner: {
    file: `config/header.txt`,
    data() {
      return {
        ...pluginConfig,
        filename,
        parameters: generateParams(paramsConfig)
      };
    }
  }
});
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
];
console.log('external :', external);
const globals = {};
for (const ext of external) {
  globals[ext] = 'window';
}


const configs = [...makeInitialConfig(), ...makeMinConfig()];

function makeInitialConfig() {
  return [
    {
      external,
      input: 'src/index.ts',
      output: [
        {
          file: 'dist/' + filename + '.js',
          format: 'iife',
          name: pluginConfig.author + '_' + pluginConfig.pluginName,
          sourcemap: true,
          globals
        }
      ],
      plugins: [
        json(),
        resolve(),
        commonjs(),
        typescript({
          typescript: require('typescript')
        }),
        licensePlugin
      ]
    }
  ];
}

function makeMinConfig() {
  if (mvConfig.miniVersion)
    return [
      {
        external,
        input: 'src/index.ts',
        output: [
          {
            file: 'dist/' + filename + '.min.js',
            format: 'iife',
            name: pluginConfig.author + '_' + pluginConfig.pluginName,
            sourcemap: true,
            globals
          }
        ],
        plugins: [
          json(),
          resolve(),
          commonjs(),
          typescript({
            typescript: require('typescript')
          }),
          terser(),
          licensePlugin
        ]
      }
    ];
  return [];
}

export default configs;
