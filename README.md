[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/quentinvernot/dumbReducer/master/LICENSE)
[![NPM version](https://img.shields.io/npm/v/dumb-reducer.svg)](https://www.npmjs.com/package/dumb-reducer)


## What is this?

It's a reducer factory function that creates simple redux action handlers for any action beginning with a set `prefix`, these handlers would simply put the action payloads into the state. An optional `initialState` can be set if needed, as well as `specialReducers` for other cases (though you may want to create normal normal reducers there).

## How do I use it?

Let's say you have this component:
```js
const myForm = ({ submit, isFetching }) => (
  <form onSubmit={submit}>
    ...
    <Button type="submit">
      Go!
      {isFetching && <Spinner />}
    </Button>
  </form>
)
```

The form's `onSubmit` callback would call these actions when needed to display or hide the Spinner element:
```js
const submitStart = () => ({
  type: 'FORM_SUBMIT_START',
  isFetching: true,
});

const submitResult = (error) => ({
  type: 'FORM_SUBMIT_RESULT',
  isFetching: false,
  error,
});
```

You would also need reducers to handle these actions:
```js
export const formReducer = (state = { isFetching: false }, action = {}) => {
  switch (action.type) {
    case 'FORM_SUBMIT_START':
      return {
        ...state,
        isFetching: action.isFetching,
      };
    case 'FORM_SUBMIT_RESULT':
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

This lib is here to replace that last part with this:
```js
import makeDumbReducer from 'dumbReducer';

export default makeDumbReducer(
  'FORM_SUBMIT_', // prefix
  { isFetching: false } // initial state
);
```

That's it! It just forwards the payload.


## Limitations

It really isn't ideal when you have to work on lists. Say you have to add an element to a list, your action would look like this:
```js
const addElement = (element) => ({
  type: 'LIST_ADD_ELEMENT',
  element,
});
```

And then, the reducer would have to do something a bit complex, where the element is added to the list in the state instead of just replacing the key:
```js
case 'LIST_ADD_ELEMENT':
  return {
    ...state,
    list: [...state.list, action.element],
  };
};
```

There are solutions: you could have a substate just for the list, where elements have an id and are forwarded as `[element.id]: element`, you could also give the whole list as a parameter of the action, and let that handle the logic, or, if you really need the dumbReducer and more complicated logic in the same substate, you could use this:

```js
import makeDumbReducer from 'dumbReducer';

export default makeDumbReducer(
  'LIST_', // prefix
  { list: [] }, // initial state
  {
    LIST_ADD_ELEMENT: (state, payload) => ({ ...state, list: [...state.list, action.element] })
  } // special reducers
);
```

## Why?

I needed an excuse to publish a package and see how to handle es6 and flow in those conditions (hence the completely overkill toolchain).
