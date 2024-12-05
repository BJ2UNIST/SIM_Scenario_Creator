const colors = require("colors");

const color: any = {
  G: colors.green("G"),
  g: colors.brightGreen("g"),
  r: colors.red("r"),
};

/**
 * 신호에 맞는 색상을 적용한 문자열을 반환한다.
 * @param phase
 * @returns
 */
function colored(phase: string): string {
  return phase
    .split("")
    .map((s) => color[s])
    .join("");
}

export { colored };
