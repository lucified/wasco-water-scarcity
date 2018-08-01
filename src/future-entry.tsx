import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import 'whatwg-fetch'; // Need polyfill to support IE11
import { AppFuture } from './components/app-future';
import configureStore from './configure-store';
import { getInitialState } from './reducers';
import { AppType } from './types';

const store = configureStore(getInitialState(), AppType.FUTURE);

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <AppFuture />
    </BrowserRouter>
  </Provider>,
  document.getElementById('content'),
);
