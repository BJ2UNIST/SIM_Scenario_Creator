import { buildSignals as buildAsType1 } from "./straight-left";
import { buildSignals as buildAsType4 } from "./straight-first";

// type GeneratorType = 1 | 2 | 3 | 4 | 5;

function getSignalBuilder(type: number) {
  if (type === 4) {
    return buildAsType4;
  }
  return buildAsType1;
}

export { getSignalBuilder };
