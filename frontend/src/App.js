import React, {Suspense} from 'react'
import {Route, Switch} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.css'
import './assets/styles/index.css'

import Layout from './components/Layout'
import Spinner from './components/Spinner'
import {start_fetching_access_token} from './utils/AccessToken'
import {useAuth0} from '@auth0/auth0-react';

const Events = React.lazy(() => import('./pages/Events'))
const MyEventsIndex = React.lazy(() => import('./pages/MyEvents/Index.js'))

export default function App() {
  const auth0 = useAuth0();
  const {isLoading, isAuthenticated} = auth0;

  if (!isLoading && isAuthenticated) {
    start_fetching_access_token(auth0)
  }

  return (
    <Layout>
      { isLoading ? <Spinner /> :
      <Suspense fallback={<Spinner />}>
        <Switch>
          <Route
            exact
            path="/"
            component={Events}
          />
          <Route
            path="/my-events"
            component={MyEventsIndex}
          />
        </Switch>
      </Suspense>
      }
    </Layout>
  )
}
