// @flow
export type SpecialReducer = (state: Object, payload: Object) => Object;
export type SpecialReducers = { [string]: SpecialReducer };

function startsWith(haystack: string, needle: string) {
  return haystack.substr(0, needle.length) === needle;
}

function makeDumbReducer(prefix: string, initialState: Object = {}, specialReducers: SpecialReducers = {}) {
  return function(state: Object = initialState, { type, ...payload }: { type: string } = {}) {
    if (type) {
      if (specialReducers[type]) {
        return specialReducers[type](state, payload);
      } else if (startsWith(type, prefix)) {
        return {
          ...state,
          ...payload,
        };
      }
    }

    return state;
  }
}

export default makeDumbReducer;
