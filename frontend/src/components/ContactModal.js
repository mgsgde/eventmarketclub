import React, {useState, useEffect} from 'react'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Form, FormGroup, Label, Input} from 'reactstrap'
import Spinner from './Spinner'
import ServerErrorModal from './ServerErrorModal'
import {get_access_token} from '../utils/AccessToken'
import axios from 'axios'
import {useAuth0} from '@auth0/auth0-react'

const ContactModal = (props) => {
  const {is_showing, set_is_showing, event_id} = props
  const {user} = useAuth0()

  const [event, set_event] = useState();
  const [is_loading, set_is_loading] = useState(false)
  const [error_response, set_error_response] = useState()
  const [is_showing_server_error_modal, set_is_showing_server_error_modal] = useState()

  // ########################################
  // ########################################

  useEffect(() => {
    (async () => {
      if (is_showing)
        await get_event()
    })()
  }, [is_showing])

  // ########################################
  // ########################################

  const get_event = async () => {
    try {
      set_is_loading(true)

      const accessToken = await get_access_token()

      const response = await axios({
        method: 'get',
        url: `/api/guests/${user.sub}/events/${event_id}`,
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      set_is_loading(false)

      set_event(response.data)
    } catch (err) {
      console.error(err)

      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)

      return null
    }
  }

  return (
    <Modal isOpen={is_showing} >
      { is_loading && <Spinner /> }
      <ModalHeader toggle={() => set_is_showing(false)}>Contact</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input type="text" name="email" id="email" value={event?.host_email_auth0} disabled />
          </FormGroup>
          <FormGroup>
            <Label for="whatsapp_group_link">Whatsapp Group</Label>
            <Input type="text" name="whatsapp_group_link" id="whatsapp_group_link" value={event?.whatsapp_group_link} disabled />
          </FormGroup>
          <FormGroup>
            <Label for="whatsapp_group_link">Meeting Point</Label>
            <Input type="text" name="meeting_point" id="meeting_point" value={event?.meeting_point} disabled />
          </FormGroup>          
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button outline color="secondary"
          onClick={() => set_is_showing(false)}
        >
          Back
        </Button>
      </ModalFooter>
      <ServerErrorModal
        is_showing={is_showing_server_error_modal}
        set_is_showing={set_is_showing_server_error_modal}
        error_response={error_response}
      />
    </Modal>
  )
}

export default ContactModal
