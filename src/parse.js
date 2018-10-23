/* @flow */

type Decorations =
  | "bold"
  | "dim"
  | "italic"
  | "underline"
  | "blink"
  | "reverse"
  | "hidden"
  | "strikethrough";

type ANSIColors =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white";

type ANSIColor = {
  type: "ansi",
  color: ANSIColors,
  bright: boolean,
};

type RGBColor = {
  type: "rgb",
  red: number,
  green: number,
  blue: number,
};

type Color = ANSIColor | RGBColor;

type Chunk = {
  content: string,
  clearLine: boolean,
  decoration: ?Decorations,
  fgColor: ?Color,
  bgColor: ?Color,
};

type ParseOpts = {
  clearLine: boolean,
};

const escapeSequence = new RegExp(/\033\[/);
const ansiColors: Array<ANSIColors> = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
];

function createRGBColor(red, green, blue: number): RGBColor {
  return {
    type: "rgb",
    red,
    green,
    blue,
  };
}

function createAnsiColor(color: ANSIColors, bright: boolean): ANSIColor {
  return {
    type: "ansi",
    color,
    bright,
  };
}

function format8bitColor(num: number): Color {
  if (num < 16) {
    return { type: "ansi", color: ansiColors[num % 8], bright: num > 8 };
  }

  // https://gist.github.com/jasonm23/2868981#file-xterm-256color-yaml
  // https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
  if (num >= 16 && num < 232) {
    const n = num - 16;
    const levels = [0, 95, 135, 175, 215, 255];

    const red = levels[~~(n / 32)];
    const green = levels[~~((n % 32) / 6)];
    const blue = levels[n % 6];

    return createRGBColor(red, green, blue);
  }

  if (num >= 232) {
    const n = num - 231;
    const hue = n * 8;
    return createRGBColor(hue, hue, hue);
  }

  throw new Error("given value is not within valid range");
}

// eslint-disable-next-line complexity
function parseChunk(text, opts: ParseOpts): Chunk {
  const result = {
    content: text,
    fgColor: null,
    bgColor: null,
    clearLine: opts.clearLine,
    decoration: null,
  };

  // https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
  const matches = text.match(
    /^([!\x3c-\x3f]*)([\d;]*)([\x20-\x2c]*[\x40-\x7e])([\s\S]*)/m,
  );

  if (!matches) return result;

  result.content = matches[4]; // eslint-disable-line prefer-destructuring
  const nums = matches[2].split(";");

  // Ignore if not a SGR command
  if (matches[1] !== "" || matches[3] !== "m") {
    return result;
  }

  let bgColor = null;
  let fgColor = null;
  let decoration: ?Decorations = null;

  while (nums.length > 0) {
    const numStr = nums.shift();
    const num = parseInt(numStr, 10);

    if (Number.isNaN(num) || num === 0) {
      fgColor = bgColor = decoration = null;
    } else if (num === 1) {
      decoration = "bold";
    } else if (num === 2) {
      decoration = "dim";
      // Enable code 2 to get string
    } else if (num === 3) {
      decoration = "italic";
    } else if (num === 4) {
      decoration = "underline";
    } else if (num === 5) {
      decoration = "blink";
    } else if (num === 7) {
      decoration = "reverse";
    } else if (num === 8) {
      decoration = "hidden";
      // Enable code 9 to get strikethrough
    } else if (num === 9) {
      decoration = "strikethrough";
    } else if (num === 39) {
      fgColor = null;
    } else if (num === 49) {
      bgColor = null;
      // Foreground color
    } else if (num >= 30 && num < 38) {
      fgColor = createAnsiColor(ansiColors[num % 10], false);
      // Foreground bright color
    } else if (num >= 90 && num < 98) {
      fgColor = createAnsiColor(ansiColors[num % 10], true);
      // Background color
    } else if (num >= 40 && num < 48) {
      bgColor = createAnsiColor(ansiColors[num % 10], false);
      // Background bright color
    } else if (num >= 100 && num < 108) {
      bgColor = createAnsiColor(ansiColors[num % 10], true);
    } else if (num === 38 || num === 48) {
      if (nums.length >= 1) {
        const mode = nums.shift();
        let color: Color;

        if (mode === "5" && nums.length >= 1) {
          const val = parseInt(nums.shift(), 10);
          color = format8bitColor(val);
        } else if (mode === "2" && nums.length >= 3) {
          color = createRGBColor(
            parseInt(nums.shift(), 10),
            parseInt(nums.shift(), 10),
            parseInt(nums.shift(), 10),
          );
        }

        // extend color (38=fg, 48=bg)
        const isForeground = num === 38;
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

function parse(text: string, opts: ?ParseOpts): Array<Chunk> {
  const rawChunks = text.split(escapeSequence);
  const firstRawChunk = rawChunks.shift();

  const clearLine = /\r/.test(text); // check for Carriage Return
  const parseOpts = { clearLine, ...opts };
  const chunks = rawChunks.map(chunk => parseChunk(chunk, parseOpts));

  const first = parseChunk("", parseOpts);
  first.content = firstRawChunk;
  first.clearLine = clearLine;
  chunks.unshift(first);

  return chunks;
}

export default parse;
