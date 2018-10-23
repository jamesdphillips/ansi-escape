import parse from "./parse";

test("parses empty string", () => {
  const rs = parse("");

  expect(rs.length).toBe(1);
  expect(rs).toEqual([
    {
      bgColor: null,
      clearLine: false,
      content: "",
      decoration: null,
      fgColor: null,
    },
  ]);
});

test("parses string without escape codes", () => {
  const rs = parse("this is a test");

  expect(rs.length).toBe(1);
  expect(rs).toEqual([
    {
      bgColor: null,
      clearLine: false,
      content: "this is a test",
      decoration: null,
      fgColor: null,
    },
  ]);
});

test("parses string with carridge return present", () => {
  const rs = parse("this is a test\r\ntest!");

  expect(rs.length).toBe(1);
  expect(rs).toEqual([
    {
      bgColor: null,
      clearLine: true,
      content: "this is a test\r\ntest!",
      decoration: null,
      fgColor: null,
    },
  ]);
});

test("parses string with foreground color", () => {
  const rs = parse("\x1B[0;32mtest!\x1B[0m");

  expect(rs.length).toBe(3);
  expect(rs).toContainEqual({
    bgColor: null,
    clearLine: false,
    content: "test!",
    decoration: null,
    fgColor: {
      type: "ansi",
      color: "green",
      bright: false,
    },
  });
});

test("parses string with background color", () => {
  const rs = parse("\x1B[0;42m tests 4 fun \x1B[0m");

  expect(rs.length).toBe(3);
  expect(rs).toContainEqual({
    bgColor: {
      type: "ansi",
      color: "green",
      bright: false,
    },
    clearLine: false,
    content: " tests 4 fun ",
    decoration: null,
    fgColor: null,
  });
});

test("parses string with bright color", () => {
  const rs = parse("\x1B[48;5;9mred\x1B[0m");

  expect(rs.length).toBe(3);
  expect(rs).toContainEqual({
    bgColor: {
      type: "ansi",
      color: "red",
      bright: true,
    },
    clearLine: false,
    content: "red",
    decoration: null,
    fgColor: null,
  });
});

test("parses string with bolded contents", () => {
  const rs = parse("\x1B[1;48;5;9mi am emboldened\x1B[0m");

  expect(rs.length).toBe(3);
  expect(rs).toContainEqual({
    bgColor: {
      type: "ansi",
      color: "red",
      bright: true,
    },
    clearLine: false,
    content: "i am emboldened",
    decoration: "bold",
    fgColor: null,
  });
});

test("parses string with extended palette", () => {
  const rs = parse("\x1B[48;5;1mred\x1B[0m");

  expect(rs.length).toBe(3);
  expect(rs).toContainEqual({
    bgColor: {
      type: "ansi",
      color: "red",
      bright: false,
    },
    clearLine: false,
    content: "red",
    decoration: null,
    fgColor: null,
  });
});

test("parses string with extended palette non-standard color", () => {
  const rs = parse("\x1B[48;5;21mi am gorgeous\x1B[0m");

  expect(rs.length).toBe(3);
  expect(rs).toContainEqual({
    bgColor: {
      type: "rgb",
      red: 0,
      green: 0,
      blue: 255,
    },
    clearLine: false,
    content: "i am gorgeous",
    decoration: null,
    fgColor: null,
  });
});

test("parses string with extended palette grayscale", () => {
  const rs = parse("\x1B[48;5;233mi am gorgeous\x1B[0m");

  expect(rs.length).toBe(3);
  expect(rs).toContainEqual({
    bgColor: {
      type: "rgb",
      red: 16,
      green: 16,
      blue: 16,
    },
    clearLine: false,
    content: "i am gorgeous",
    decoration: null,
    fgColor: null,
  });
});

test("parses string with true color", () => {
  const rs = parse("\x1B[48;2;10;20;30mi am gorgeous\x1B[0m");

  expect(rs.length).toBe(3);
  expect(rs).toContainEqual({
    bgColor: {
      type: "rgb",
      red: 10,
      green: 20,
      blue: 30,
    },
    clearLine: false,
    content: "i am gorgeous",
    decoration: null,
    fgColor: null,
  });
});
