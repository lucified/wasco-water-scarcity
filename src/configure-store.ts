import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createMiddleware as createHashMiddleware } from './hash-middleware';
import rootReducer, { StateTree } from './reducers';
import { AppType } from './types';

declare var window: { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any };

function configureStore(initialState: StateTree, appType: AppType) {
  const composeEnhancers =
    (process.env.NODE_ENV !== 'production' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(createHashMiddleware(appType), thunkMiddleware),
    ),
  );

  return store;
}

export default configureStore;
