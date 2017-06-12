// These are needed to tell TypeScript what the imports for
// these file types return.

declare module '*.scss' {
  const value: any;
  export = value;
}

declare module '*.svg' {
  const content: string;
  export = content;
}

declare module '*.png' {
  const content: string;
  export = content;
}

declare module '*.hbs' {
  const content: (context: any) => string;
  export = content;
}

// These are missing in official typings
declare module 'd3-scale-chromatic' {
  const schemeReds: string[][];
  const schemeBlues: string[][];
  const schemePurples: string[][];
  const schemeOranges: string[][];
}
