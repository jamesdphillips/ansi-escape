# ansi-escape

<p>
  <a href="https://circleci.com/gh/jamesdphillips/graphql/tree/master"><img src="https://circleci.com/gh/jamesdphillips/graphql/tree/master.svg?logo=sdfsdf&style=shield"></a>
  <a href="https://codeclimate.com/github/jamesdphillips/graphql/maintainability"><img src="https://api.codeclimate.com/v1/badges/9527ae9a786ed7c9ad5b/maintainability" /></a>
  <a href="https://codeclimate.com/github/jamesdphillips/graphql/test_coverage"><img src="https://api.codeclimate.com/v1/badges/9527ae9a786ed7c9ad5b/test_coverage" /></a>
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
