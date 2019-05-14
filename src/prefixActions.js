// @flow
export function prefixActions(prefix: string, actions: Object): Object {
  return Object.keys(actions).reduce(function (acc, type) {
    const prefixedType = `${prefix}/${type}`;
    const action = actions[type];
    if (typeof action === 'function')
      acc[type] = (...args) => ({...action(...args), type: prefixedType});
    else
      acc[type] = prefixActions(prefixedType, actions[type]);
    return acc;
  }, {});
}

export default prefixActions;
