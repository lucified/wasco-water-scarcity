import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AppEmbed } from './components/app-embed';
import configureStore from './configure-store';
import { getInitialState } from './reducers';
import { AppType } from './types';

const store = configureStore(getInitialState(), AppType.EMBED);

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <AppEmbed />
    </BrowserRouter>
  </Provider>,
  document.getElementById('content'),
);
