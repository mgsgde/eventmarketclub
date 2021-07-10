import React from 'react'
import {Spinner as SpinnerRS} from 'reactstrap'

const Spinner = () => {
  return (
    <div class="overlay">
      <SpinnerRS className="loading" color="primary" />
    </div>
  )
}

export default Spinner
