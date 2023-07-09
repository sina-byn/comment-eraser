const fs = require('fs');
const path = require('path');
const { minify } = require('uglify-js');
const { globSync } = require('glob');

// * utils
const { formatLog } = require('../utils/utils');

// * configs
const minify_options = {
  compress: true,
  mangle: true,
  output: {
    comments: false,
  },
};

const minifyFile = file => {
  const code = fs.readFileSync(file, 'utf-8');
  const minifiedCode = minify(code, minify_options).code;
  fs.writeFileSync(path.join('build', file), minifiedCode);
};

const build = () => {
  console.log(formatLog('building...', 'blue'));
  console.time('build process');
  if (!fs.existsSync('build')) fs.mkdirSync('build');
  if (!fs.existsSync('build/utils')) fs.mkdirSync('build/utils');

  const files = globSync(['index.js', 'utils/**/*.js']);
  files.forEach(file => minifyFile(file));
  console.timeEnd('build process');
  console.log(formatLog('build process was successful\x1b[0m', 'green'));
};

build();
