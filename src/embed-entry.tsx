import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AppEmbed } from './components/app-embed';
import configureStore from './configure-store';
import { initialState } from './reducers';

const store = configureStore(initialState);

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <AppEmbed />
    </BrowserRouter>
  </Provider>,
  document.getElementById('content'),
);
