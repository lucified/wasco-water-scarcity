import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';

import Spinner from './components/generic/spinner';
import configureStore from './configure-store';
import { initialState } from './reducers';

const store = configureStore(initialState);

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Route component={Spinner} />
    </BrowserRouter>
  </Provider>,
  document.getElementById('content'),
);
