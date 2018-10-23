# ansi-escape

<p>
  <a href="https://www.npmjs.com/package/@jamesdphillips/ansi-escape"><img src="https://img.shields.io/npm/v/@jamesdphillips/ansi-escape.svg?style=flat-square"></a>
  <a href="https://github.com/jamesdphillips/ansi-escape/blob/master/LICENSE"><img src="http://img.shields.io/npm/l/@jameesdphillips/ansi-escape.svg?style=flat-square"></a>
  <a href="https://circleci.com/gh/jamesdphillips/ansi-escape/tree/master"><img src="https://circleci.com/gh/jamesdphillips/ansi-escape/tree/master.svg?logo=sdfsdf&style=shield"></a>
</p>

> No bells or whistles parsing of ANSI escape sequences.

## ☁️  Installation

```bash
# Using yarn
yarn add @jamesdphillips/ansi-escape

# Using npm
npm install --save @jamesdphillips/ansi-escape
```

## ☁️  Usage

```
import parse from "@jamesdphillips/ansi-escape";

const content = "\x1B[38;5;1mred\x1B[0m";
const parsedContent = parse(myContent);
// ...
```

## 👩‍🎨 Previous Art

Parser largely borrowed from [anser].

[anser]: https://github.com/IonicaBizau/anser
