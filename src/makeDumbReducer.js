// @flow
export type Reducer = (state: Object, payload: Object) => Object;
export type SubReducers = { [string]: Reducer };

function startsWith(haystack: string, needle: string) {
  return haystack.substr(0, needle.length) === needle;
}

function find<T>(array: Array<T>, predicate: (T, number, Array<T>) => boolean): ?T {
  for (let i = 0; i < array.length; i++)
    if (predicate(array[i], i, array))
      return array[i];
}

function makeDumbReducer(prefix: string, initialState: Object = {}, subReducers: SubReducers = {}) {
  const keys = Object.keys(subReducers);
  const prefixAndSeparator = prefix + '/';

  return function (state: Object = initialState, { type, ...payload }: { type: string } = {}) {
    if (type && startsWith(type, prefixAndSeparator)) {
      const unprefixedType = type.substring(prefixAndSeparator.length);
      const key = find(keys, key => startsWith(unprefixedType, key + '/'));

      if (key)
        return { ...state, [key]: { ...subReducers[key](state[key], { type: unprefixedType, ...payload }) } };

      const merged = { ...state, ...payload };
      Object.keys(merged).forEach(key => merged[key] === undefined && delete merged[key]);

      return merged;
    }

    return state;
  };
}

export default makeDumbReducer;
