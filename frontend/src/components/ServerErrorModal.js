import React from 'react'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'

const ServerErrorModal = (props) => {
  const {is_showing, set_is_showing, error_response} = props

  return (
    <Modal isOpen={is_showing}>
      <ModalHeader toggle={() => set_is_showing(false)}>{`${error_response?.status} ${error_response?.statusText}`}</ModalHeader>
      <ModalBody>
        {error_response?.data?.message}
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

export default ServerErrorModal
