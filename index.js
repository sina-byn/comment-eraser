const fs = require('fs');
const { performance } = require('perf_hooks');

// * utils
const { getPaths, getOutputPath } = require('./utils/fileUtils');
const { formatLog, formatResults } = require('./utils/utils');
const { loadConfig } = require('./utils/configUtils');

// * patterns
const commentPattern =
  /("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')|(`(?:\\[\s\S]|[^`])*`)|\r*\n*\/\/.*\r\n|\r*\n*\/\/.*|\r*\n*\/\*[\s\S]*?\*\/\s*$|\/\*[\s\S]*?\*\/\s*/gm;
const inlineCommentPattern =
  /("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')|(`(?:\\[\s\S]|[^`])*`)|\r*\n*\/\/.*\r\n|\r*\n*\/\/.*/gm;
const blockCommentPattern =
  /("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')|(`(?:\\[\s\S]|[^`])*`)|\r*\n*\/\*[\s\S]*?\*\/\s*$|\/\*[\s\S]*?\*\/\s*/gm;
const patterns = {
  inline: inlineCommentPattern,
  block: blockCommentPattern,
  both: commentPattern,
};

const removeComments = ({ code, pattern, excludePatterns }) => {
  let removedChars = 0;

  excludePatterns = excludePatterns.map(pt => new RegExp(pt, 'gm'));

  code = code.replace(pattern, (match, capture_1, capture_2, capture_3) => {
    let shouldExclude = false;

    if (excludePatterns) {
      excludePatterns.forEach(pt => {
        if (pt.test(match)) shouldExclude = true;
      });
    }

    if (
      !shouldExclude &&
      capture_1 === undefined &&
      capture_2 === undefined &&
      capture_3 === undefined
    ) {
      removedChars += match.length;
      return '';
    }

    return match;
  });

  return [code, removedChars];
};

const processFile = ({ filePath, pattern, config }) => {
  const startTime = performance.now();
  const { replace, outputDir, postfix, excludePatterns } = config;

  const jsCode = fs.readFileSync(filePath, 'utf-8');
  const outputPath = getOutputPath(outputDir, filePath, postfix);
  const [commentsRemoved, removedChars] = removeComments({
    code: jsCode,
    pattern: pattern,
    excludePatterns: excludePatterns,
  });

  if (replace) fs.writeFileSync(filePath, commentsRemoved);
  else fs.writeFileSync(outputPath, commentsRemoved);

  const endTime = performance.now();
  const elapsedTime = endTime - startTime;
  return {
    filePath,
    outputPath,
    removedChars,
    commentsRemoved,
    elapsedTime,
  };
};

const init = () => {
  const config = loadConfig();
  const { type, include, exclude, outputDir, postfix } = config;
  const pattern = patterns[type];
  let results = [];

  if (outputDir && !fs.existsSync(outputDir))
    fs.mkdirSync(outputDir, { recursive: true });

  const filePaths = getPaths(include, exclude, postfix);
  filePaths.forEach(async filePath => {
    const result = processFile({ filePath, pattern, config });
    results.push(result);
  });

  return results;
};

const wipeout = () => {
  const label = formatLog('wipeout', 'green');
  console.time(label);

  const results = init();

  console.timeEnd(label);
  console.log('\x1b[0m');
  console.table(formatResults(results));
};

module.exports = wipeout;
