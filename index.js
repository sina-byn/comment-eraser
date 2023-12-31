const fs = require('fs-extra');
const chalk = require('chalk');
const readline = require('readline');
const { performance } = require('perf_hooks');

// * lib
const Report = require('./lib/Report');
const Prelog = require('./lib/Prelog');
const { eraseComments, getLangPatterns } = require('./lib/utils');
const { loadConfig } = require('./lib/utils/configUtils');
const { getFilePath, getFilePaths, removeEmptyDir } = require('./lib/utils/fileUtils');

// * patterns
const patterns = getLangPatterns('js');

// * readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const processFile = (filePath, config) => {
  const startTime = performance.now();
  const { pattern, writeToOutput, replace, outputDir, postfix, excludePatterns } = config;

  const jsCode = fs.readFileSync(filePath, 'utf-8');
  const outputPath = getFilePath(filePath, outputDir, postfix);
  const [commentsRemoved, removedCharsCount] = eraseComments({
    code: jsCode,
    pattern: pattern,
    excludePatterns: excludePatterns,
  });

  if (writeToOutput) {
    if (replace) {
      fs.writeFileSync(filePath, commentsRemoved);
    } else {
      fs.writeFileSync(outputPath, commentsRemoved);
    }
  }

  const endTime = performance.now();
  const elapsedTime = endTime - startTime;

  return {
    filePath,
    outputPath,
    commentsRemoved,
    removedCharsCount,
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
  const { type = 'both', excludePatterns = [], output = undefined } = config;
  const pattern = patterns[type];
  let outputPath = null;

  const [commentsRemoved, removedCharsCount] = eraseComments({ code, pattern, excludePatterns });

  if (output) {
    const { path = '', file = 'output.js', append = false } = output;
    const filePath = getFilePath(file, path);

    if (path) fs.mkdirsSync(path, { recursive: true });
    fs.writeFileSync(filePath, commentsRemoved, { flag: append ? 'a' : 'w' });
    outputPath = filePath;
  }

  const endTime = performance.now();
  const elapsedTime = Report.formatElapsedTime(endTime - startTime);

  return [commentsRemoved, removedCharsCount, outputPath, elapsedTime];
};

const erase = (configPath = 'eraser.config.json') => {
  const config = loadConfig(configPath);
  const { type, include, exclude, writeToOutput, outputDir, postfix, interactive } = config;
  config.pattern = patterns[type];

  if (writeToOutput) fs.emptyDirSync(outputDir);
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
  return report.logs;
};

module.exports = { erase, eraseFromString };
