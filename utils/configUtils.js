const fs = require('fs');

// * defaults
const DEFAULT_CONFIG = {
  type: 'both',
  include: ['./**/*'],
  exclude: [],
  replace: false,
  outputDir: '',
  postfix: '-no-comments',
  excludePatterns: [],
  interactive: false
};

const checkAndSetConfig = config => {
  if (!Array.isArray(config.include)) {
    if (typeof config.include === 'string') config.include = [config.include];
    else throw new Error('"include" must be an array');
  }
};

const loadConfig = () => {
  let config;

  try {
    config = JSON.parse(fs.readFileSync('wipeout.config.json', 'utf-8'));
  } catch (err) {
    return DEFAULT_CONFIG;
  }

  config = { ...DEFAULT_CONFIG, ...config };

  checkAndSetConfig(config);

  return config;
};

module.exports = { loadConfig };
