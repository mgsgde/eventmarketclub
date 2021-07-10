import React from 'react'
import ReactDOM from 'react-dom'
import {Router} from 'react-router-dom'
import App from './App'
import history from './utils/history'
import {Auth0Provider} from '@auth0/auth0-react';
import assert from "assert"

assert.notStrictEqual(process.env.REACT_APP_AUTH0_DOMAIN, undefined)
assert.notStrictEqual(process.env.REACT_APP_AUTH0_CLIENTID, undefined)

const onRedirectCallback = (appState: any) => {
  history.replace((appState && appState.returnTo) || window.location.pathname)
}

ReactDOM.render(
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENTID}
      redirectUri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
    >
      <Router history={history}>
        <App />
      </Router>
    </Auth0Provider>,
    document.getElementById('root'),
)

