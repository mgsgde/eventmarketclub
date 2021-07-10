import React from 'react'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'

const FeedbackModal = (props) => {
  const {is_showing, set_is_showing, message} = props

  return (
    <Modal isOpen={is_showing}>
      <ModalBody>
        <p>{message}</p> 
        <p>
        If you have an idea or want to get involved, contact me <i class="fas fa-arrow-right"></i> <a href="mailto:dfni1@eventmarket.com?subject=Idea/Feedback/Question"><i class="far fa-envelope"></i></a></p>
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

export default FeedbackModal
