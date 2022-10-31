/** @type {import('prettier').Config} */
module.exports = {
  bracketSpacing: false,
  singleQuote: true,
  trailingComma: 'es5',
  endOfLine: 'auto',
  overrides: [
    {files: '**/*.{scss,css,pcss,html,mdx}', options: {printWidth: 120}},
  ],
  importOrderParserPlugins: [
    'typescript',
    'jsx',
    JSON.stringify(['decorators', {decoratorsBeforeExport: true}]),
  ],
  importOrder: ['^[./]', '^\\/', '^\\.\\.\\/', '\\.\\/'],
};
