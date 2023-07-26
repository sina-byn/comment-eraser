const fs = require('fs-extra');
const chalk = require('chalk');
const readline = require('readline');
const { performance } = require('perf_hooks');

// * lib
const Report = require('./lib/Report');
const Prelog = require('./lib/Prelog');
const { eraseComments, getLangPatterns } = require('./lib/utils');
const { loadConfig } = require('./lib/utils/configUtils');
const { getFilePaths, getOutputPath, makeEmptyDir, removeEmptyDir } = require('./lib/utils/fileUtils');

// * patterns
const patterns = getLangPatterns('js');

// * readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const processFile = (filePath, config) => {
  const startTime = performance.now();
  const { pattern, replace, outputDir, postfix, excludePatterns } = config;

  const jsCode = fs.readFileSync(filePath, 'utf-8');
  const outputPath = getOutputPath(outputDir, filePath, postfix);
  const [commentsRemoved, removedChars] = eraseComments({
    code: jsCode,
    pattern: pattern,
    excludePatterns: excludePatterns,
  });

  if (replace) {
    fs.writeFileSync(filePath, commentsRemoved);
  } else {
    fs.writeFileSync(outputPath, commentsRemoved);
  }

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

const processFiles = (filePaths, config) => {
  const report = new Report();

  filePaths.forEach(f => {
    const log = processFile(f, config);
    report.append(log);
  });

  return report;
};

const interactiveProcessFiles = (prelog, config) => {
  const report = new Report();
  const question = `Edit ${chalk.bold.blue(prelog.fileName)} and then press enter to continue`;

  rl.question(question, () => {
    const filePaths = prelog.readLines();
    filePaths.forEach(f => {
      const log = processFile(f, config);
      report.append(log);
    });

    rl.close();
  });

  return report;
};

const eraseFromString = (code, config = {}) => {
  const startTime = performance.now();
  const { type = 'both', excludePatterns = [] } = config;

  const pattern = patterns[type];

  const endTime = performance.now();
  const elapsedTime = endTime - startTime;

  return [...eraseComments({ code, pattern, excludePatterns }), Report.formatElapsedTime(elapsedTime)];
};

const erase = () => {
  const config = loadConfig();
  const { type, include, exclude, outputDir, postfix, interactive } = config;
  config.pattern = patterns[type];

  makeEmptyDir(outputDir);
  process.on('exit', () => removeEmptyDir(outputDir));

  const filePaths = getFilePaths(include, exclude, postfix);

  if (interactive) {
    const prelog = new Prelog();
    prelog.writeLines(filePaths);
    const report = interactiveProcessFiles(prelog, config);

    rl.on('close', () => report.print(interactive));

    return;
  }

  console.time(chalk.bold.green('erased'));

  rl.close();

  const report = processFiles(filePaths, config);
  report.print();
};

module.exports = { erase, eraseFromString };
