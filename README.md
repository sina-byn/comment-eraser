# DEPRECATED - comment-eraser [![NPM version](https://img.shields.io/npm/v/comment-eraser.svg?style=flat)](https://www.npmjs.com/package/comment-eraser) [![NPM monthly downloads](https://img.shields.io/npm/dm/comment-eraser.svg?style=flat)](https://npmjs.org/package/comment-eraser) [![NPM total downloads](https://img.shields.io/npm/dt/comment-eraser.svg?style=flat)](https://npmjs.org/package/comment-eraser) 

> Removing comments from JavaScript files has never been this easy.

Please consider following this project's author, [Sina Bayandorian](https://github.com/sina-byn), and consider starring the project to show your :heart: and support.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
    - [erase](#erase)
    - [eraseFromString](#erasefromstring)
- [Configuration](#configuration)
- [Interactive Mode](#interactive-mode)
- [Cli Tool](#cli-tool)

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
const { eraseFromString } = require('comment-eraser');

// config
const config = {
  type: 'both',
  code: jsCodeString
};

const [commentsRemoved, removedCharsCount, elapsedTime] = eraseFromString(config);

console.log(commentsRemoved, removedCharsCount, elapsedTime);
```

## API

### [erase](index.js#L105)

Erases comments from the specified files **-** Read [Configuration](#configuration) and [Interactive Mode](#interactive-mode) for more.

**Params**
* `configPath`: **String -** optional **-** default is `'eraser.config.json'`

**Returns**
* `{ filePath, outputPath, commentsRemoved, removedCharsCount, elapsedTime }[] | undefined`: **{ String, String, String, Number, TimeStamp }[ ] | undefined**

**Notes**
* note that when `interactive` is set to `true` the logs will no longer be available to you and the function will return `undefined`

**Example**

```js
// note that this function needs no argument to be passed to it
// since it reads and utilizes eraser.config.json

const { erase } = require('comment-eraser');

const logs = erase();
console.log(logs);
```

### [eraseFromString](index.js#L82)

Erases comments from the given `string`.

**Params**

* `code`: **String**
* `config`: **Object**
  * `type`: **'both' | 'inline' | 'block'**
  * `excludePatterns`: **String[ ] -** specifies comment patterns not to be excluded **-** default is `[]`
  * note that each pattern must be a valid `RegExp` pattern or an error will be thrown 
  * `output`: **{ path: String, file: String, append: Boolean }**
    * `path`: **String -** default is `''`
    * `file`: **String -** default is `'output.js'`
    * `append`: **Boolean -** default is `false`

**Returns**

* `[commentsRemoved, removedCharsCount, outputPath, elapsedTime]`: **[ String, Number, (String | null), TimeStamp ]**

**Notes**
* if no `output` object is passed then the result won't be written to a file
* in order to use the default `output` config pass `{}` as the `output`option
* if two function calls have the same `output` option:
    * `append` set to `true` **-** all results will be appended to the file
    * `append` set to `false` **-** only the result of the last function call will be written to the file

**Example**

```js
// note that in this example no new file is created
// as no config or output option is passed down to the function

const { eraseFromString } = require('comment-eraser');

const sampleString = '// a comment \n sample js code';
const [ commentsRemoved, removedCharsCount, elapsedTime ] = eraseFromString(sampleString);
console.log(commentsRemoved, removedCharsCount, outputPath, elapsedTime);
```

## Configuration

utilized by the [erase](#erase) function

**eraser.config.json**

* `type`: **'both' | 'inline' | 'block'** specifies the comment type to be erased
  * `both`: default - all comments
  * `inline`: inline comments only
  * `block`: block comments only
* `include`: **String | String[ ] -** glob pattern **-** js files to be included **-** default is `./**/*`
* `exclude`: **String[ ] -** glob pattern **-** js files to be excluded **-** default is `[]`
* `writeToOutput`: **Boolean -** specifies whether to write the output string into specific files **-** default is `true`
  * based on `replace`, `outputDir`, `postfix`
* `replace`: **Boolean -** specifies whether to replace the file's content after removing the comments or not  **-** default is `false`
  * will override `outputDir` and `postfix`if specified
* `outputDir`: **String -** specifies the directory in which the new files are going the be created **-** default is `no-comments`
* `postfix`: **String -** specifies the postfix to be added to the new files generated after the comment removal process  **-** default is `-no-comments`
* `excludePatterns`: **String[ ] -** specifies comment patterns not to be excluded **-** default is `[]`
  * note that each pattern must be a valid `RegExp` pattern or an error will be thrown
* `interactive`: **Boolean -** activates interactive mode if set to `true` **-** default is `false`

## Interactive Mode
In this mode a temp file named `prelog` is created in which you can specify which files to include or not include one by one and then hit `Enter` to continue the process based on the `prelog` file

* set `interactive` to `true` to activate in `eraser.config.json`
* only available when using the [erase](#erase) function
* `=y`: include file **-** default for all files 
* `=n`: exclude file
* note that the `prelog` file will be removed after the process is finished

**Exmaple - prelog**
```js
sample.js=y
sample-2.js=n
```

## Cli Tool
[eraser-cli](https://www.npmjs.com/package/eraser-cli) - the cli tool for this package
easily integrate the comment-eraser into your build process or install it globally and use it wherever you want