import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';
import 'whatwg-fetch'; // Need polyfill to support IE11
import { App } from './components/app';
import configureStore from './configure-store';
import { getInitialState } from './reducers';
import { AppType } from './types';

const store = configureStore(getInitialState(), AppType.PAST);

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Route component={App} />
    </BrowserRouter>
  </Provider>,
  document.getElementById('content'),
);
