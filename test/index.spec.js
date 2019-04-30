// @flow
import { describe, it } from 'mocha';
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

import makeDumbReducer from '../src';

const initialState = deepFreeze({ a: 'a', b: { b1: 'b1', b2: 2 } });
const goodPrefix = 'goodPrefix';

describe('makeDumbReducer', () => {
  it('should create a dumb reducer', () => {
    makeDumbReducer('test');
  });

  it('should return the state as-is if no action is given', () => {
    const reducer = makeDumbReducer(goodPrefix);
    expect(reducer(initialState)).to.deep.equal(initialState);
  });

  it('should return the initialState as-is if no state or action are given', () => {
    const reducer = makeDumbReducer(goodPrefix, initialState);
    expect(reducer()).to.deep.equal(initialState);
  });

  it('should return the state as-is if giving an action with a type that doesn\'t match the prefix', () => {
    const reducer = makeDumbReducer(goodPrefix);
    const action = { type: 'not-goodPrefix', c: 'c' };
    expect(reducer(initialState, action)).to.deep.equal(initialState);
  });

  it('should return the state as-is if giving an action with a type that doesn\'t match the prefix + the separator', () => {
    const reducer = makeDumbReducer(goodPrefix);
    const action = { type: goodPrefix, c: 'c' };
    expect(reducer(initialState, action)).to.deep.equal(initialState);
  });

  it('should return the updated state by forwarding the content of the given action', () => {
    const c = 'c';
    const reducer = makeDumbReducer(goodPrefix);
    const action = { type: 'goodPrefix/c', c };
    expect(reducer(initialState, action)).to.deep.equal({ ...initialState, c });
  });

  it('should run the given subreducer if the type matches', () => {
    const c = 'c';
    const subreducer = (state, payload) => ({ ...state, c: payload.c });
    const reducer = makeDumbReducer(goodPrefix, undefined, { sub: subreducer });
    const action = { type: 'goodPrefix/sub', c };
    expect(reducer(initialState, action)).to.deep.equal({ ...initialState, sub: { c } });
  });

  it('should not put the action\'s payload into the root state when running a subreducer', () => {
    const c = 'c';
    const subreducer = state => state;
    const reducer = makeDumbReducer(goodPrefix, undefined, { sub: subreducer });
    const action = { type: 'goodPrefix/sub', c };
    expect(reducer(initialState, action)).to.deep.equal({ ...initialState, sub: {} });
  });
});
