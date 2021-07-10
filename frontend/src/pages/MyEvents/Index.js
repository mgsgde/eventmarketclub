import React, {useState, useEffect} from 'react'
import {NavLink as RRNavLink, Route, Switch} from 'react-router-dom'
import MyEvents from './MyEvents.js'
import MyEventDetails from './MyEventDetails.js'

import {Row,
  NavLink,
  NavItem,
  Nav,
  Navbar} from 'reactstrap'

const MyEventsIndex = (props) => {
  const {match} = props

  return (
    <Row>
      <Navbar className="w-100">
        <Nav>
          <NavItem>
            <NavLink
              tag={RRNavLink}
              exact
              to={`${match.url}/joined-events`}
              activeClassName="active"
              className="green-font"
              isActive={ (match, location) => {
                return /.*(\/my-events|\/my-events\/joined-events|\/my-events\/joined-events\/\d+)$/.test(location.pathname)
              }}
            >
                Joined Events
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              tag={RRNavLink}
              exact
              to={`${match.url}/organized-events`}
              activeClassName="active"
              isActive={ (match, location) => {
                return /.*\/my-events\/organized-events/.test(location.pathname)
              }}
              className="green-font"
            >
                Organized Events
            </NavLink>
          </NavItem>
        </Nav>
        <div style={{padding: '0 1rem', width: '100%'}}>
          <hr style={{'border': '0.5px solid #44f1a6'}} />
        </div>
      </Navbar>
      <Switch>
        <Route
          exact
          path={[match.path, `${match.path}/joined-events`]}
          component={() => <MyEvents is_user_guest/>}
        />
        <Route
          exact
          path={[`${match.path}/organized-events`]}
          component={() => <MyEvents is_user_host/>}
        />
        <Route
          exact
          path={[`${match.path}/joined-events/:event_id`]}
          component={() => <MyEventDetails is_user_guest/>}
        />          
        <Route
          exact
          path={[`${match.path}/organized-events/:event_id`]}
          component={() => <MyEventDetails is_user_host/>}
        />      
      </Switch>
    </Row>)
}

export default MyEventsIndex
