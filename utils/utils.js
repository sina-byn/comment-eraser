const formatMilliseconds = ms => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  const milliseconds = Math.floor(ms % 1000);

  const formattedTime = [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
    milliseconds.toString().padStart(3, '0'),
  ].join(':');

  return formattedTime;
};

const formatLogs = results =>
  results.map(res => {
    delete res.commentsRemoved;
    res.removedChars = [res.removedChars.toLocaleString(), res.removedChars];
    res.elapsedTime = formatMilliseconds(res.elapsedTime);
    return res;
  });

const formatLog = (text, fgColor) => {
  const reset = '\x1b[0m';
  const fgBlue = '\x1b[94m';
  const fgGreen = '\x1b[32m';
  const fgWhite = '\x1b[37m';
  let fg;

  switch (fgColor) {
    case 'blue':
      fg = fgBlue;
      break;
    case 'green':
      fg = fgGreen;
      break;
    case 'white':
      fg = fgWhite;
      break;
    default:
      fg = '';
  }

  return reset + fg + text;
};

module.exports = { formatLog, formatLogs };
