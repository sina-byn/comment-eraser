const path = require('path');
const { globSync } = require('glob');

const getOutputPath = (outputDir, filePath, postfix = '') => {
  const { dir, name, ext } = path.parse(filePath);
  return path.join(dir, outputDir, `${name}${postfix}${ext}`);
};

const getPaths = (content, exclude, postfix) => {
  let filePaths = [];

  for (const pattern of content) {
    filePaths.push(
      ...globSync(pattern, { ignore: ['node_modules/**', ...exclude] }),
    );
  }

  return filePaths.filter(
    path => path.endsWith('.js') && !path.includes(postfix),
  );
};

module.exports = { getPaths, getOutputPath };
