const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { globSync } = require('glob');
const { minify } = require('uglify-js');

// * config
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
  console.log(chalk.bold.blue('building...'));
  console.time(chalk.bold.blue('build process'));
  
  fs.emptyDirSync('build');
  fs.emptyDirSync('build/lib');
  fs.emptyDirSync('build/lib/utils');
  
  const files = globSync(['index.js', 'lib/**/*.js']);
  files.forEach(file => minifyFile(file));
  
  console.timeEnd(chalk.bold.blue('build process'));
  console.log(chalk.bold.green('build process was successful'));
};

build();
