# comment-eraser [![NPM version](https://img.shields.io/npm/v/comment-eraser.svg?style=flat)](https://www.npmjs.com/package/comment-eraser) [![NPM monthly downloads](https://img.shields.io/npm/dm/comment-eraser.svg?style=flat)](https://npmjs.org/package/comment-eraser) [![NPM total downloads](https://img.shields.io/npm/dt/comment-eraser.svg?style=flat)](https://npmjs.org/package/comment-eraser) 

Please consider following this project's author, [Sina Bayandorian](https://github.com/sina-byn), and consider starring the project to show your :heart: and support.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Configuration](#configuration)
- [Interactive Mode](#interactive-mode)

## Install

Install with [npm](https://www.npmjs.com/package/comment-eraser):

```sh
$ npm install --save comment-eraser
```

## Usage

```js
const { erase } = require('comment-eraser');

// reads eraser.config.json - falls back to DEFAULT_CONFIG if not specified
// removes comments from specified .js files
erase();
```

```js
const { eraseFromCodeString } = require('comment-eraser');

// config
const config = {
  type: 'both',
  code: jsCodeString
};

const [commentsRemoved, removedCharsCount, elapsedTime] = eraseFromCodeString(config);

console.log(commentsRemoved, removedCharsCount, elapsedTime);
```

## API

### [erase](index.js#L153)

Erases comments from the specified files.

**Example**

```js
const { erase } = require('comment-eraser');
erase();
```

### [eraseFromCodeString](index.js#L139)

Erases comments from the given `string`.

**Params**

* `type` **{ both | inline | block }**
* `code` **{ String }**
* `excludePatterns` **{ String[ ] }**

**Returns**

* `[commentsRemoved, removedCharsCount, elapsedTime]` **{ [String, Number, TimeStamp] }**

**Example**

```js
const { eraseFromCodeString } = require('comment-eraser');
const [ commentsRemoved, removedCharsCount, elapsedTime ] = eraseFromCodeString('// a comment \n sample js code');
console.log(commentsRemoved, removedCharsCount, elapsedTime);
```

## Configuration

utilized by the [erase](#erase) function

**eraser.config.json**

* `type`: **{ 'both' | 'inline' | 'block' }** specifies the comment type to be erased
  * `both`: default - all comments
  * `inline`: inline comments only
  * `block`: block comments only
* `include`: **{ String | String[ ] }** glob pattern **-** js files to be included **-** default is `./**/*`
* `exclude`: **{ String | String[ ] }** glob pattern **-** js files to be excluded **-** default is `[]`
* `replace`: **{ Boolean }** specifies whether to replace the file's content after removing the comments or not  **-** default is `false`
  * will override `outputDir` and `postfix`if specified
* `outputDir`: **{ String }** specifies the directory in which the new files are going the be created **-** default is `no-comments`
* `postfix`: **{ String }** specifies the postfix to be added to the new files generated after the comment removal process  **-** default is `-no-comments`
* `excludePatterns`: **{ String[ ] }** specifies comment patterns not to be excluded **-** default is `[]`
  * note that each pattern must be a valid `RegExp` pattern or it will be ignored
* `interactive`: **{ Boolean }** activates interactive mode if set to `true` **-** default is `false`

## Interactive Mode
in this mode a temp file named `prelog` is created in which you can specify which files to include or not include one by one and then hit `Enter` to continue the process based on the `prelog` file


* set `interactive` to `true` to activate in `eraser.config.json`
* `=y`: include file - default for all files 
* `=n`: exclude file
* note that the `prelog` file will be removed after the process is finished

**Exmaple - prelog**
```js
sample.js=y
sample-2.js=n
```