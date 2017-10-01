import { describe, it } from 'mocha';
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

import makeDumbReducer from '../es';

const initialState = deepFreeze({ a: 'a', b: { b1: 'b1', b2: 2 } });

describe('dumbReducer', () => {
  it('should create a dumb reducer without problem', () => {
    makeDumbReducer('test_');
  });

  it('should return an exact copy of the state if no action is given', () => {
    const reducer = makeDumbReducer('test_');
    expect(reducer(initialState)).to.deep.equal(initialState);
  });

  it('should return an exact copy of the initialState if no state or action are given', () => {
    const reducer = makeDumbReducer('test_', initialState);
    expect(reducer()).to.deep.equal(initialState);
  });

  it('should return an exact copy of the state if an action with a type that doesn\'t match is given', () => {
    const reducer = makeDumbReducer('test_');
    const action = { type: 'bad_c', c: 'c' };
    expect(reducer(initialState, action)).to.deep.equal(initialState);
  });

  it('should return the updated state by forwarding the content of the given action', () => {
    const c = 'c';
    const reducer = makeDumbReducer('test_');
    const action = { type: 'test_c', c };
    expect(reducer(initialState, action)).to.deep.equal({ ...initialState, c });
  });

  it('should run the given special reducer if the type matches', () => {
    const c = 'c';
    const d = 'd';
    const special = (state, payload) => ({ ...state, ...payload, d });
    const reducer = makeDumbReducer('test_', undefined, { special });
    const action = { type: 'special', c };
    expect(reducer(initialState, action)).to.deep.equal({ ...initialState, c, d });
  });
});
