import React, {useState} from 'react';
import {
  Collapse,
  Navbar,
  Nav,
  NavItem,
  NavLink,
  Row,
  Col,
  NavbarBrand,
  NavbarToggler,
} from 'reactstrap';
import {NavLink as RRNavLink} from 'react-router-dom'
import pic from '../assets/pictures/pic.png';
import UserModal from './UserModal'
import {useAuth0} from '@auth0/auth0-react';

const NavBar = (props) => {
  const [is_showing_usermodal, set_is_showing_usermodal] = useState(false)
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const {loginWithRedirect, logout} = useAuth0();
  const {isAuthenticated} = useAuth0();

  // ########################################
  // ########################################

  const handle_edit_account = () => {
    set_is_showing_usermodal(true)
  }

  // ########################################
  // ########################################

  return (
    <Row>
      <Col sm="12" xl={{size: 8, offset: 2}}>
        <Navbar expand="md" dark>
          <NavbarBrand href="/"><img style={{width: '45px'}}alt="" src={pic}/></NavbarBrand>
          <NavbarToggler onClick={toggle} />
        
          <Collapse isOpen={isOpen} navbar >
            <Nav navbar className="mr-auto">
              <NavItem  >
                <NavLink
                  tag={RRNavLink}
                  exact
                  to={`/`}
                  activeClassName="active"
                  className="green-font"
                >
              Events
                </NavLink>
              </NavItem>
              {isAuthenticated === true && <NavItem >
                <NavLink
                  tag={RRNavLink}
                  to={`/my-events`}
                  activeClassName="active"
                  className="green-font"
                >
              My Events
                </NavLink>
              </NavItem>
              }
            </Nav>
            <Nav navbar>
              {isAuthenticated === false && <NavItem onClick={() => loginWithRedirect()}>
                <NavLink
                  exact
                  activeClassName="active"
                  className="green-font"
                >
              Login
                </NavLink>
              </NavItem>
              }
              {isAuthenticated === true && <NavItem className="mr-4" onClick={() => logout({returnTo: window.location.origin})}>
                <NavLink
                  exact
                  activeClassName="active"
                  className="green-font"
                >
              Logout
                </NavLink>
              </NavItem>
              }
              {isAuthenticated === true && <NavItem>
                <NavLink
                  activeClassName="active"
                  className="green-font"
                  onClick={() => handle_edit_account()}
                >
                  <i className="fas fa-user-alt green-font"></i>
                </NavLink>
              </NavItem>
              }
            </Nav>
          </Collapse>
        </Navbar>
      </Col>
      <UserModal
        is_showing={is_showing_usermodal}
        set_is_showing={set_is_showing_usermodal}
      />
    </Row>
  );
}

export default NavBar
