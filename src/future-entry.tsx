import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { AppFuture } from './components/app-future';
import configureStore from './configure-store';
import { getInitialState } from './reducers';
import { AppType } from './types';

const store = configureStore(getInitialState(), AppType.FUTURE);

ReactDOM.render(
  <Provider store={store}>
    <AppFuture />
  </Provider>,
  document.getElementById('content'),
);
