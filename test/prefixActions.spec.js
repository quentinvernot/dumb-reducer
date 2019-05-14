// @flow
import { describe, it } from 'mocha';
import { expect } from 'chai';

import prefixActions from '../src/prefixActions';

const prefix = 'the prefix';
const goodProp = 'goodProp';

describe('prefixActions', () => {
  it('works with empty action object', () => {
    expect(prefixActions(prefix, {})).to.deep.equal({});
  });

  it('returns an object with the same keys as the input', () => {
    const unprefixedActions = { a: () => {}, b: () => {} };
    const prefixedActions = prefixActions(prefix, unprefixedActions);
    expect(prefixedActions).to.have.all.keys('a', 'b');
  });

  it('returns an object with the same keys as the input, recursively', () => {
    const unprefixedActions = { a: () => {}, b: { c: () => {}, d: () => {} } };
    const prefixedActions = prefixActions(prefix, unprefixedActions);
    expect(prefixedActions).to.have.all.keys('a', 'b');
    expect(prefixedActions.b).to.have.all.keys('c', 'd');
  });

  it('works with a single action', () => {
    const unprefixedActions = { run: myProp => ({ myProp }) };
    const prefixedActions = prefixActions(prefix, unprefixedActions);
    expect(prefixedActions.run(goodProp)).to.deep.equal({ type: `${prefix}/run`, myProp: goodProp });
  });

  it('works with a nested action', () => {
    const unprefixedActions = { sub: { run: myProp => ({ myProp }) } };
    const prefixedActions = prefixActions(prefix, unprefixedActions);
    expect(prefixedActions.sub.run(goodProp)).to.deep.equal({ type: `${prefix}/sub/run`, myProp: goodProp });
  });
});
