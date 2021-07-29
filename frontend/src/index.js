import React from 'react'
import ReactDOM from 'react-dom'
import {Router} from 'react-router-dom'
import App from './App'
import history from './utils/history'
import {Auth0Provider} from '@auth0/auth0-react';
import assert from 'assert'

assert.notStrictEqual(process.env.REACT_APP_DOMAIN_OAUTH2, undefined)
assert.notStrictEqual(process.env.REACT_APP_CLIENTID_OAUTH2, undefined)

const onRedirectCallback = (appState: any) => {
  history.replace((appState && appState.returnTo) || window.location.pathname)
}

ReactDOM.render(
    <Auth0Provider
      domain={process.env.REACT_APP_DOMAIN_OAUTH2}
      clientId={process.env.REACT_APP_CLIENTID_OAUTH2}
      redirectUri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
    >
      <Router history={history}>
        <App />
      </Router>
    </Auth0Provider>,
    document.getElementById('root'),
)

