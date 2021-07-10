import React, {useState, useEffect} from 'react'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Form, FormGroup, Label, Input, Row, Col} from 'reactstrap'
import Spinner from './Spinner'
import ServerErrorModal from './ServerErrorModal'
import {get_access_token} from '../utils/AccessToken'
import axios from 'axios'
import {useAuth0} from '@auth0/auth0-react'

const RatingModal = (props) => {
  const {is_showing, set_is_showing, callback, event_id, nickname_auth0, reviewee_user_id_auth0, is_user_host} = props

  const [is_loading, set_is_loading] = useState(false)
  const [error_response, set_error_response] = useState()
  const [is_showing_server_error_modal, set_is_showing_server_error_modal] = useState()
  const {user} = useAuth0()
  const [rating, set_rating] = useState()

  // ########################################
  // ########################################

  const rate = async (rating) => {
    try {
      set_is_loading(true)

      const accessToken = await get_access_token()

      let url
      if (is_user_host) {
        url = `/api/hosts/${user.sub}/guests/${reviewee_user_id_auth0}/ratings`
      } else {
        url = `/api/guests/${user.sub}/hosts/${reviewee_user_id_auth0}/ratings`
      }

      let new_rating = {rating, event_id: Number(event_id)}

      const response = await axios({
        method: 'post',
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        data: JSON.stringify(new_rating),
      })

      set_is_loading(false)
      set_is_showing(false)

      callback()

      return response.data
    } catch (err) {
      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)

      return null
    }
  }

  return (
    <Modal isOpen={is_showing} size={'md'}>
      { is_loading && <Spinner /> }
      <ModalHeader toggle={() => set_is_showing(false)}>{`Rate User '${nickname_auth0}'`}</ModalHeader>
      <ModalBody>
        <div className="rating" style={{textAlign: 'center', fontSize: '40px'}}>
          <span class="fa fa-star" onClick={() => rate(5)}></span>
          <span class="fa fa-star" onClick={() => rate(4)}></span>
          <span class="fa fa-star" onClick={() => rate(3)}></span>
          <span class="fa fa-star" onClick={() => rate(2)}></span>
          <span class="fa fa-star" onClick={() => rate(1)}></span>
        </div>
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

export default RatingModal
