const fs = require('fs-extra');
const path = require('path');
const { globSync } = require('glob');

const getOutputPath = (outputDir, filePath, postfix = '') => {
  const { dir, name, ext } = path.parse(filePath);
  return path.join(dir, outputDir, `${name}${postfix}${ext}`);
};

const getFilePaths = (content, exclude, postfix) => {
  let filePaths = [];

  for (const pattern of content) {
    filePaths.push(...globSync(pattern, { ignore: ['node_modules/**', ...exclude] }));
  }

  filePaths = filePaths.filter(path => path.endsWith('.js') && !path.includes(postfix));

  return filePaths;
};

const makeEmptyDir = dir => {
  if (!dir) return;

  if (!fs.existsSync()) {
    fs.mkdirSync(dir, { recursive: true });
    return;
  }

  fs.emptydirSync(dir);
};

const removeEmptyDir = dir => {
  if (!dir || !fs.existsSync(dir)) return;

  const isEmpty = fs.readdirSync(dir).length === 0;
  isEmpty ? fs.rmdirSync(dir) : null;
};

module.exports = { getFilePaths, getOutputPath, makeEmptyDir, removeEmptyDir };
