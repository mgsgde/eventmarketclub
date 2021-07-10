import React from 'react'
import {
  Button, Row, Col, Form, FormGroup, Input,
} from 'reactstrap';

const Footer = (props) => {
  return (
    <footer class="mt-3 p-3" style={{textAlign: "right"}} >

    <a class="text-muted" href="mailto:info@eventmarket.com"><i className="fas fa-envelope mr-2 green-font"></i>Email</a>
    </footer>
  )
}

export default Footer

