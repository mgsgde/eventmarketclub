import React from 'react'
import {Container} from 'reactstrap'
import NavBar from './NavBar'
import Footer from './Footer'

const Layout = (props) => {
  return (
    <React.Fragment>
      <NavBar />
      <Container className="p-4" style={{position: "relative", minHeight: '80vh'}}>
      {props.children}
		<Footer/>
      </Container>
    </React.Fragment>
  )
}

export default Layout
