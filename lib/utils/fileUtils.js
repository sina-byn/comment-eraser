const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

const getFilePath = (file, outputDir = '', postfix = '') => {
  const { dir, name, ext } = path.parse(file);
  const fileName = name + postfix + ext;

  return path.join(dir, outputDir, fileName);
};

const getFilePaths = (content, exclude, postfix) => {
  let filePaths = [];

  for (const pattern of content) {
    filePaths.push(...globSync(pattern, { ignore: ['node_modules/**', ...exclude] }));
  }

  filePaths = filePaths.filter(path => path.endsWith('.js') && !path.includes(postfix));

  return filePaths;
};

const removeEmptyDir = dir => {
  if (!dir || !fs.existsSync(dir)) return;

  const isEmpty = fs.readdirSync(dir).length === 0;
  isEmpty ? fs.rmdirSync(dir) : null;
};

module.exports = { getFilePath, getFilePaths, removeEmptyDir };
