const getLangPatterns = lang => {
  switch (lang) {
    case 'js':
      return {
        inline: /("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')|(`(?:\\[\s\S]|[^`])*`)|\r*\n*\/\/.*\r*\n|\r*\n*\/\/.*/gm,
        block: /("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')|(`(?:\\[\s\S]|[^`])*`)|\s*\r*\n*\/\*[\s\S]*?\*\/\s*$|\/\*[\s\S]*?\*\/\s*/gm,
        both: /("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')|(`(?:\\[\s\S]|[^`])*`)|\r*\n*\/\/.*\r*\n|\r*\n*\/\/.*|\r*\n*\/\*[\s\S]*?\*\/\s*$|\/\*[\s\S]*?\*\/\s*/gm,
      };
  }
};

const replaceComments = ({ code, pattern, substituteString, excludePatterns }) => {
  let charsCountChange = 0;

  excludePatterns = excludePatterns.map(pt => new RegExp(pt, 'gm'));

  code = code.replace(pattern, (match, capture_1, capture_2, capture_3) => {
    let shouldExclude = false;

    if (excludePatterns) {
      excludePatterns.forEach(pt => {
        if (pt.test(match)) shouldExclude = true;
      });
    }

    if (!shouldExclude && capture_1 === undefined && capture_2 === undefined && capture_3 === undefined) {
      charsCountChange += match.length;
      return substituteString;
    }

    return match;
  });

  return [code, charsCountChange];
};

const eraseComments = ({ code, pattern, excludePatterns }) =>
  replaceComments({
    code,
    pattern,
    excludePatterns,
    substituteString: '',
  });

module.exports = { eraseComments, getLangPatterns };
