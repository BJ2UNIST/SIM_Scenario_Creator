type Emit = (event: string, data: any) => void;
type On = (event: string, callback: (data: any) => void) => void;

export type { Emit, On };
