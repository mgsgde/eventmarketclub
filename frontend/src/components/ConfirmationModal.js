import React from 'react'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'

const ConfirmationModal = (props) => {
  let {is_showing, set_is_showing, message, callback, callback_arguments} = props

  if (!callback_arguments)
    callback_arguments = []

  return (
    <Modal isOpen={is_showing}>
      <ModalHeader toggle={() => set_is_showing(false)}>Confirm</ModalHeader>
      <ModalBody>
        {message}
      </ModalBody>
      <ModalFooter>
        <Button outline color="success"
          onClick={() => {
            callback(...callback_arguments)
            set_is_showing(false)
          }}
        >
          Yes
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default ConfirmationModal
