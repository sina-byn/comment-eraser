const chalk = require('chalk');

class Report {
  constructor(label = 'erased') {
    this.label = chalk.bold.green(label);
    this.logs = [];
    this.formattedLogs = [];
  }

  print(interactive) {
    console[interactive ? 'log' : 'timeEnd'](this.label);
    this.logs.length && console.table(this.formattedLogs);
  }

  append(log) {
    this.logs.push(log);
    this.formattedLogs.push(this.formatLog(log));
  }

  formatLog(log) {
    delete log.commentsRemoved;
    log.removedChars = [log.removedChars.toLocaleString(), log.removedChars];
    log.elapsedTime = Report.formatElapsedTime(log.elapsedTime);
    return log;
  }

  static formatElapsedTime(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
    const milliseconds = Math.floor(ms % 1000);

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
      milliseconds.toString().padStart(3, '0'),
    ].join(':');
  }
}

module.exports = Report;
