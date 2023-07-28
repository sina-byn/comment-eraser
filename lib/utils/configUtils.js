const fs = require('fs');

// * defaults
const DEFAULT_CONFIG = {
  type: 'both',
  include: ['./**/*'],
  exclude: [],
  writeToOutput: true,
  replace: false,
  outputDir: 'no-comments',
  postfix: '-no-comments',
  excludePatterns: [],
  interactive: false,
};

const checkAndSetConfig = config => {
  if (!Array.isArray(config.include)) {
    if (typeof config.include === 'string') config.include = [config.include];
    else throw new Error('"include" must be an array');
  }
};

const loadConfig = (configPath = 'eraser.config.json') => {
  let config = {};

  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }

  config = { ...DEFAULT_CONFIG, ...config };

  checkAndSetConfig(config);

  return config;
};

module.exports = { loadConfig };
