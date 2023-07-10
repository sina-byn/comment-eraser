const fs = require('fs-extra');
const readline = require('readline');
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

const processFile = (filePath, config) => {
  const startTime = performance.now();
  const { pattern, replace, outputDir, postfix, excludePatterns } = config;

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

const processFiles = (filePaths, results, config) => {
  const { interactive } = config;

  if (interactive) {
    fs.writeFileSync('prelog.txt', filePaths.map(p => p + '=y').join('\n'));

    rl.question(
      `Edit \x1b[4mprelog.txt\x1b[0m and then press enter to continue`,
      () => {
        const content = fs.readFileSync('prelog.txt', 'utf-8');
        const filesRules = content
          .split('\n')
          .map(rule => rule.split('='))
          .filter(rule => rule.length === 2 && rule[1] === 'y');

        for (const [filePath, _] of filesRules) {
          results.push(processFile(filePath, config));
        }

        rl.close();
      },
    );

    return;
  }

  rl.close();
  filePaths.forEach(filePath => {
    results.push(processFile(filePath, config));
  });
};

const init = () => {
  const config = loadConfig();
  const { type, include, exclude, interactive, outputDir, postfix } = config;
  const pattern = patterns[type];
  let results = [];

  if (outputDir) {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    else fs.emptyDirSync(outputDir);
  }

  const filePaths = getPaths(include, exclude, postfix);

  processFiles(filePaths, results, { ...config, pattern });

  return [results, interactive];
};

const wipeout = () => {
  const { outputDir } = loadConfig();
  process.on('exit', () => {
    if (fs.existsSync('prelog.txt')) fs.unlinkSync('prelog.txt');
    if (outputDir && fs.existsSync(outputDir)) {
      const isEmpty = fs.readdirSync(outputDir).length === 0;
      if (isEmpty) fs.rmdirSync(outputDir);
    }
  });

  const label = formatLog('wipeout', 'green');
  console.time(label);

  const [results, interactive] = init();

  if (interactive) {
    rl.on('close', () => {
      console.log(label);
      console.log('\x1b[0m');
      console.table(formatResults(results));
    });

    return;
  }

  console.timeEnd(label);
  console.log('\x1b[0m');
  console.table(formatResults(results));
};

module.exports = wipeout;
