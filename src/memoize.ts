// Based on reselect's memoize function:
// https://github.com/reactjs/reselect/blob/master/src/index.js#L5-L20

function defaultEqualityCheck(oldArgs: any[], newArgs: any[]) {
  return newArgs.every((val: any, index: number) => val === oldArgs[index]);
}

type GenericFunction = (...args: any[]) => any;
type EqualityChecker = (oldArgs: any[], newArgs: any[]) => boolean;
type Memoizer = <TFunc extends GenericFunction>(
  func: TFunc,
  equalityCheck?: EqualityChecker,
) => TFunc;

/**
 * A memoizer with a cache size of 1.
 * By default, the equality checks for object equality using ===.
 */
const memoize: Memoizer = <TFunc extends GenericFunction>(
  func: TFunc,
  equalityCheck = defaultEqualityCheck,
) => {
  let lastArgs: any[];
  let lastResult: ReturnType<TFunc>;

  return ((...args: any[]) => {
    if (
      !lastArgs ||
      lastArgs.length !== args.length ||
      !equalityCheck(lastArgs, args)
    ) {
      lastResult = func(...args);
    }
    lastArgs = args;
    return lastResult;
  }) as TFunc;
};

export default memoize;
