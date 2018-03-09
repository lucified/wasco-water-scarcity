import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import rootReducer, { StateTree } from './reducers';

declare var window: { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any };

function configureStore(initialState: StateTree) {
  const composeEnhancers =
    (process.env.NODE_ENV !== 'production' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(thunkMiddleware)),
  );

  return store;
}

export default configureStore;
