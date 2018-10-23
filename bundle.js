'use strict';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

var escapeSequence = new RegExp(/\033\[/);
var ansiColors = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"];

function parse(text, opts) {
  var rawChunks = text.split(escapeSequence);
  var firstRawChunk = rawChunks.shift();
  var clearLine = /\r/.test(text); // check for Carriage Return

  var parseOpts = _objectSpread({
    clearLine: clearLine
  }, opts);

  var chunks = rawChunks.map(function (chunk) {
    return parseChunk(chunk, parseOpts);
  });
  var first = parseChunk("", parseOpts);
  first.content = firstRawChunk;
  first.clearLine = clearLine;
  chunks.unshift(first);
  return chunks;
}

function parseChunk(text, opts) {
  var result = {
    content: text,
    fgColor: null,
    bgColor: null,
    clearLine: opts.clearLine,
    decoration: null
  }; // https://en.wikipedia.org/wiki/ANSI_escape_code#Colors

  var matches = text.match(/^([!\x3c-\x3f]*)([\d;]*)([\x20-\x2c]*[\x40-\x7e])([\s\S]*)/m);
  if (!matches) return result;
  var rawText = result.content = matches[4];
  var nums = matches[2].split(";"); // Ignore if not a SGR command

  if (matches[1] !== "" || matches[3] !== "m") {
    return result;
  }

  var bgColor = null;
  var fgColor = null;
  var decoration = null;

  while (nums.length > 0) {
    var numStr = nums.shift();
    var num = parseInt(numStr);

    if (isNaN(num) || num === 0) {
      fgColor = bgColor = decoration = null;
    } else if (num === 1) {
      decoration = "bold";
    } else if (num === 2) {
      decoration = "dim"; // Enable code 2 to get string
    } else if (num == 3) {
      decoration = "italic";
    } else if (num == 4) {
      decoration = "underline";
    } else if (num == 5) {
      decoration = "blink";
    } else if (num === 7) {
      decoration = "reverse";
    } else if (num === 8) {
      decoration = "hidden"; // Enable code 9 to get strikethrough
    } else if (num === 9) {
      decoration = "strikethrough";
    } else if (num == 39) {
      fgColor = null;
    } else if (num == 49) {
      bgColor = null; // Foreground color
    } else if (num >= 30 && num < 38) {
      fgColor = createAnsiColor(ansiColors[num % 10], false); // Foreground bright color
    } else if (num >= 90 && num < 98) {
      fgColor = createAnsiColor(ansiColors[num % 10], true); // Background color
    } else if (num >= 40 && num < 48) {
      bgColor = createAnsiColor(ansiColors[num % 10], false); // Background bright color
    } else if (num >= 100 && num < 108) {
      bgColor = createAnsiColor(ansiColors[num % 10], true);
    } else if (num === 38 || num === 48) {
      if (nums.length >= 1) {
        var mode = nums.shift();
        var color = void 0;

        if (mode === "5" && nums.length >= 1) {
          var val = parseInt(nums.shift());
          color = format8bitColor(val);
        } else if (mode === "2" && nums.length >= 3) {
          color = createRGBColor(parseInt(nums.shift()), parseInt(nums.shift()), parseInt(nums.shift()));
        } // extend color (38=fg, 48=bg)


        var isForeground = num === 38;

        if (isForeground) {
          fgColor = color;
        } else {
          bgColor = color;
        }
      }
    }
  }

  if (fgColor === null && bgColor === null && decoration === null) {
    return result;
  }

  result.fgColor = fgColor;
  result.bgColor = bgColor;
  result.decoration = decoration;
  return result;
}

function format8bitColor(num) {
  if (num < 16) {
    return {
      type: "ansi",
      color: ansiColors[num % 8],
      bright: num > 8
    };
  } // https://gist.github.com/jasonm23/2868981#file-xterm-256color-yaml
  // https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit


  if (num >= 16 && num < 232) {
    var n = num - 16;
    var levels = [0, 95, 135, 175, 215, 255];
    var red = levels[~~(n / 32)];
    var green = levels[~~(n % 32 / 6)];
    var blue = levels[n % 6];
    return createRGBColor(red, green, blue);
  }

  if (num >= 232) {
    var _n = num - 231;

    var hue = _n * 8;
    return createRGBColor(hue, hue, hue);
  }

  throw new Error("given value is not within valid range");
}

function createRGBColor(red, green, blue) {
  return {
    type: "rgb",
    red: red,
    green: green,
    blue: blue
  };
}

function createAnsiColor(color, bright) {
  return {
    type: "ansi",
    color: color,
    bright: bright
  };
}

module.exports = parse;
