const fs = require('fs');
const tmp = require('tmp');
const path = require('path');

// * config
const prelogConfig = {
  mode: 0o644,
  prefix: 'prelog',
  tmpdir: process.cwd(),
};

// * defaults
const DEFAULT_FORMAT_FN = l => (l += '=y');
const DEFAULT_FILTER_FN = l => {
  const chunks = l.split('=');
  if (chunks.length === 2 && chunks[1] === 'y') {
    return chunks[0];
  }
};

class Prelog {
  constructor() {
    tmp.setGracefulCleanup();
    const tempFile = tmp.fileSync(prelogConfig);
    this.filePath = tempFile.name;
    this.fileName = path.parse(this.filePath).base;
  }

  writeLines(lines, formatFn = DEFAULT_FORMAT_FN) {
    fs.writeFileSync(this.filePath, lines.map(formatFn).join('\n'));
  }

  readLines(filterFn = DEFAULT_FILTER_FN) {
    const content = fs.readFileSync(this.filePath, 'utf-8');
    return content
      .split('\n')
      .map(filterFn)
      .filter(l => l);
  }
}

module.exports = Prelog;
