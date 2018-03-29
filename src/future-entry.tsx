import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { AppFuture } from './components/app-future';
import configureStore from './configure-store';
import { initialState } from './reducers';

const store = configureStore(initialState);

ReactDOM.render(
  <Provider store={store}>
    <AppFuture />
  </Provider>,
  document.getElementById('content'),
);
