[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/quentinvernot/dumb-reducer/master/LICENSE)
[![NPM version](https://img.shields.io/npm/v/dumb-reducer.svg)](https://www.npmjs.com/package/dumb-reducer)


## What is this?

It's a reducer factory function that creates redux action handlers for any action beginning with a set `prefix`, these handlers will put the action's payload directly into the state. An optional `initialState` can be set if needed, as well as a `subReducers` parameter that allows you to set special rules for special cases and behaves a bit like [combineReducers](https://redux.js.org/api/combinereducers#combinereducersreducers).


## How do I use it?

Let's say you have this component:
```js
const myForm = ({ submit, isFetching, error, success }) => (
  <form onSubmit={submit}>
    ...
    <Button type="submit">
      Go!
      {isFetching && <Spinner />}
    </Button>
    {error && 'An error occurred!'}
    {success && 'A success occurred!'}
  </form>
);
```

The form's `onSubmit` callback would eventually dispatch these actions to display or hide the Spinner element, the error, or the success state:
```js
const submitStart = () => ({
  type: 'formSubmit/start',
  isFetching: true,
  error: null,
  success: false,
});

const submitSuccess = () => ({
  type: 'formSubmit/success',
  isFetching: false,
  success: true,
});

const submitError = (error) => ({
  type: 'formSubmit/error',
  isFetching: false,
  error,
});
```

You would also need reducers to handle these actions:
```js
export default (state = { isFetching: false, error: null, success: false }, action = {}) => {
  switch (action.type) {
    case 'formSubmit/start':
      return {
        ...state,
        isFetching: action.isFetching,
        error: action.error,
        success: action.success,
      };
    case 'formSubmit/success':
      return {
        ...state,
        isFetching: action.isFetching,
        success: action.success,
      };
    case 'formSubmit/error':
      return {
        ...state,
        isFetching: action.isFetching,
        error: action.error,
      };
    default:
      return state;
  }
};
```

You'll notice that, for the most part, we could just put whatever is in the action directly into the state without looking. This lib is here to replace that example with this:
```js
import { makeDumbReducer } from 'dumb-reducer';

export default makeDumbReducer(
  'formSubmit', // prefix
  { isFetching: false, success: false, error: null }, // initial state
);
```

That's it! It forwards the payload.


## Sub-reducers

You may need to have different/more complex behaviours in parts of the state, `makeDumbReducer` allows you to set sub-reducers through the third parameter. Here is a an example with a sub-reducer that keeps an auto-incrementing counter of the number of times it was called:
```js
import { makeDumbReducer } from 'dumb-reducer';

export default makeDumbReducer(
  'myState', // prefix
  { counter: 0 }, // initial state
  { counter: (state, action) => state + 1 }, // sub-reducers
);

// the sub-reducer will be called if you dispatch any of these actions:
{ type: 'myState/counter' };
{ type: 'myState/counter/doStuff' };
```

Note that sub-reducers only have access to (and return) the sub-state they are assigned to, which is very similar to [combineReducers](https://redux.js.org/api/combinereducers#combinereducersreducers).


## Deleting a key

If you set a key to `undefined` in the action, the key will be deleted in the state.
```js
// initial state is `{}`
dispatch({ type: 'myState/set', isSet: true }); // state is now `{ isSet: true }`
dispatch({ type: 'myState/unset', isSet: undefined }); // state is now `{}`
```


## Helper to prefix actions

There's also a helper that automatically prefixes actions by adding the `type` and should help make action code smaller too:
```js
// Reducer
import { makeDumbReducer } from 'dumb-reducer';

export default makeDumbReducer(
  'formSubmit', // prefix
  { isFetching: false, success: false, error: null }, // initial state
);


// Actions
import { prefixActions } from 'dumb-reducer';
const actions = prefixActions(
  'formSubmit', // prefix
  {
    start: () => ({ isFetching: true, error: null, success: false }),
    success: () => ({ isFetching: false, success: true }),
    error: error => ({ isFetching: true, error }),
  }, // actions
);

// later...
dispatch(actions.start());
// will dispatch { type: 'formSubmit/start', isFetching: true, error: null, success: false }
dispatch(actions.error(myError));
// will dispatch { type: 'formSubmit/error', isFetching: false, error: myError }
```


This helper also accepts nested objects, useful with sub-reducers. Here is an example for a state containing a `hasSession` flag and a list of users like `{ <user id>: <user> }`:
```js
// reducer
import { makeDumbReducer } from 'dumb-reducer';

export default makeDumbReducer(
  'myState', // prefix
  { hasSession: false, users: {} }, // initial state
  { users: makeDumbReducer('users') }, // sub-reducers, with a nested dumb-reducer for the users
);


// actions
import { prefixActions } from 'dumb-reducer';
const actions = prefixActions(
  'myState', // prefix
  {
    setHasSession: hasSession => ({ hasSession }),
    setAllUsers: users => ({ users }),
    users: {
      add: user => ({ [user.id]: user }),
      remove: userId => ({ [userId]: undefined }),
    },
  }, // actions
);

// later...
dispatch(actions.setHasSession(true));
// will dispatch { type: 'myState/setHasSession', hasSession: true }
dispatch(actions.users.add(selfUser));
// will dispatch { type: 'myState/users/add', [selfUser.id]: selfUser }
```


## Quirks and limitations

* `<prefix>/stuff` is a valid action type, `<prefix>_stuff` and `<prefix>` are not. The `/` is expected. This is also true when using sub-reducers, `<prefix>/<subprefix>/stuff` is valid while `<prefix>/<subprefix>` is not.
* You can put dumb-reducers in your dumb-reducer, although this expects a static state structure. It doesn't work if you have a dynamically changing list objects (like `{ <user id>: <user> }`). You'll need something a bit smarter if you want to, say, update the email of a user in your local redux-user-cache without putting the whole user in the action.
* You can't have a key called `type` in the state without using sub-reducers.
* It really isn't ideal when you have to work with arrays. It's usually better to use a dict with `{ <object.id>: <object> }`, but if you really need to add/remove elements in an array in a dumb-reducer, you can use the `subReducers` param for the specific key that is an array.
