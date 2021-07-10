import React from 'react'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'

const InfoModal = (props) => {
  const {is_showing, set_is_showing, message} = props

  return (
    <Modal isOpen={is_showing}>
      <ModalHeader toggle={() => set_is_showing(false)}>Info</ModalHeader>
      <ModalBody>
        <p>{message}</p>
      </ModalBody>
      <ModalFooter>
        <Button outline color="secondary"
          onClick={() => set_is_showing(false)}
        >
          Back
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default InfoModal
