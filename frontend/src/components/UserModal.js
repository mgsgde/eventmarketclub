import React, {useState, useEffect} from 'react'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Form, FormGroup, Label, Input, Row, Col} from 'reactstrap'
import Spinner from './Spinner'
import ServerErrorModal from './ServerErrorModal'
import ConfirmationModal from './ConfirmationModal'
import {get_access_token} from '../utils/AccessToken'
import axios from 'axios'
import {useAuth0} from '@auth0/auth0-react'

const UserModal = (props) => {
  const {is_showing, set_is_showing} = props

  const [user, set_user] = useState(false)
  const [email_auth0, set_email_auth0] = useState()
  const [nickname_auth0, set_nickname_auth0] = useState()
  const [is_loading, set_is_loading] = useState(false)
  const [error_response, set_error_response] = useState()
  const [is_showing_server_error_modal, set_is_showing_server_error_modal] = useState()
  const [is_showing_confirmation_modal, set_is_showing_confirmation_modal] = useState(false)
  const [confirmation_message, set_confirmation_message] = useState()
  const [confirmation_callback, set_confirmation_callback] = useState()

  const {user: user_auth0, logout, isLoading} = useAuth0()

  // ########################################
  // ########################################

  useEffect(() => {
    (async () => {
      if (user_auth0?.sub) {
        await get_user()
      }
    })()
  }, [user_auth0])

  // ########################################
  // ########################################


  const get_user = async () => {
    try {
      set_is_loading(true)

      const accessToken = await get_access_token()

      const response = await axios({
        method: 'get',
        url: `/api/users/${user_auth0.sub}`,
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      set_user(response.data)
      set_email_auth0(response.data.email_auth0)
      set_nickname_auth0(response.data.nickname_auth0)

      set_is_loading(false)
    } catch (err) {
      console.error(err)

      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)

      return null
    }
  }

  const patch_user = async () => {
    try {
      set_is_loading(true)

      const accessToken = await get_access_token()

      const response = await axios({
        method: 'patch',
        url: `/api/users/${user_auth0.sub}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        data: JSON.stringify({nickname_auth0, email_auth0}),
      })

      set_user(response.data)
      set_is_loading(false)

      logout({returnTo: window.location.origin})
    } catch (err) {
      console.error(err)
      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)
    }
  }

  const delete_user = async () => {
    try {
      set_is_loading(true)

      const accessToken = await get_access_token()

      await axios({
        method: 'delete',
        url: `/api/users/${user_auth0.sub}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      set_is_loading(false)

      logout({returnTo: window.location.origin})
    } catch (err) {
      console.error(err)
      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)
    }
  }

  // ########################################
  // ########################################

  const handle_delete_event = () => {
    set_confirmation_message('Do you really want to delete this account?')
    set_confirmation_callback(() => delete_user)
    set_is_showing_confirmation_modal(true)
  }

  // ########################################
  // ########################################

  return (
    <Modal isOpen={is_showing} size={'lg'}>
      { is_loading && <Spinner /> }
      <ModalHeader toggle={() => {
        set_is_showing(false)
        get_user()
      }}>Edit User</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label >email</Label>
            <Input type="email" autocomplete="off" value={email_auth0} onChange={(evt) => set_email_auth0(evt.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label >nickname</Label>
            <Input type="email" autocomplete="off" value={nickname_auth0} onChange={(evt) => set_nickname_auth0(evt.target.value)} />
          </FormGroup>
          <hr style={{borderColor: 'red'}} className="my-5"/>
          <FormGroup style={{textAlign: 'center'}}>
            <Button outline color="danger"
              onClick={() => handle_delete_event()}
            >
          Delete Account
            </Button>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter >
        <Button outline color="success"
          onClick={() => patch_user()}
          disabled={(() => {
            if (user.email_auth0 != email_auth0 || user.nickname_auth0 != nickname_auth0) {
              return false
            } else {
              return true
            }
          })()}
        >
          Save
        </Button>
      </ModalFooter>
      <ServerErrorModal
        is_showing={is_showing_server_error_modal}
        set_is_showing={set_is_showing_server_error_modal}
        error_response={error_response}
      />
      <ConfirmationModal
        is_showing={is_showing_confirmation_modal}
        set_is_showing={set_is_showing_confirmation_modal}
        message={confirmation_message}
        callback={confirmation_callback}
      />
    </Modal>
  )
}

export default UserModal
