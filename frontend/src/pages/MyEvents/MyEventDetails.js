import React, {useState, useEffect} from 'react'
import Event from '../../components/Event'
import {useParams} from 'react-router-dom'
import {SAMPLE_ORGANIZED_EVENTS} from '../../utils/constants'
import {
  Row,
  Col,
  Button,
} from 'reactstrap';
import {useAuth0} from '@auth0/auth0-react'
import axios from 'axios'
import {get_access_token} from '../../utils/AccessToken'
import Spinner from '../../components/Spinner'
import ServerErrorModal from '../../components/ServerErrorModal'
import hash from 'object-hash'
import ConfirmationModal from '../../components/ConfirmationModal'
import RatingModal from '../../components/RatingModal'

const EventDetails = (props) => {
  const {is_user_host, is_user_guest} = props
  const {event_id} = useParams()
  const {user} = useAuth0()
  const [event, set_event] = useState()
  const [guests, set_guests] = useState()
  const [error_response, set_error_response] = useState()
  const [is_showing_server_error_modal, set_is_showing_server_error_modal] = useState(false)
  const [is_loading, set_is_loading] = useState(false)
  const [is_showing_confirmation_modal, set_is_showing_confirmation_modal] = useState(false)
  const [confirmation_message, set_confirmation_message] = useState()
  const [confirmation_callback, set_confirmation_callback] = useState()
  const [confirmation_callback_arguments, set_confirmation_callback_arguments] = useState()
  const [rating_reviewee_nickname, set_rating_reviewee_nickname_auth0] = useState()
  const [rating_reviewee_user_id_auth0, set_rating_reviewee_user_id_auth0] = useState()
  const [rating_callback, set_rating_callback] = useState()
  const [is_showing_rating_modal, set_is_showing_rating_modal] = useState(false)
  // ########################################
  // ########################################

  useEffect(() => {
    (async () => {
      await get_event()
      await get_guests()
    })()
  }, [])

  // #######################################
  // #######################################


  const get_event = async () => {
    try {
      set_is_loading(true)

      const accessToken = await get_access_token()

      let url
      if (is_user_host) {
        url = `/api/hosts/${user.sub}/events/${event_id}`
      } else {
        url = `/api/guests/${user.sub}/events/${event_id}`
      }

      const response = await axios({
        method: 'get',
        url,
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
    }
  }

  const get_guests = async () => {
    try {
      set_is_loading(true)

      const accessToken = await get_access_token()

      const response = await axios({
        method: 'get',
        url: `/api/events/${event_id}/guests?not_rejected=true`,
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      set_is_loading(false)

      set_guests(response.data)
    } catch (err) {
      console.error(err)

      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)
    }
  }

  const edit_status = async (guest_user_id_auth0, status) => {
    try {
      set_is_loading(true)

      const accessToken = await get_access_token()

      const response = await axios({
        method: 'patch',
        url: `/api/events/${event_id}/guests/${guest_user_id_auth0}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        data: JSON.stringify({status}),
      })

      set_is_loading(false)

      get_guests()
      get_event()
      
    } catch (err) {
      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)
    }
  }

  // ########################################
  // ########################################

  const handle_edit_status = (guest_user_id_auth0, status) => {
    let message
    if (status == 'REJECTED') {
      message = 'Do you really want to reject this user?'
    } else {
      message = 'Do you really want to accept this user?'
    }

    set_confirmation_message(message)
    set_confirmation_callback(() => edit_status)
    set_confirmation_callback_arguments([guest_user_id_auth0, status])
    set_is_showing_confirmation_modal(true)
  }

  const handle_rate = (guest_user_id_auth0, guest_nickname_auth0) => {
    set_rating_reviewee_nickname_auth0(guest_nickname_auth0)
    set_rating_reviewee_user_id_auth0(guest_user_id_auth0)
    set_rating_callback(() => get_guests)
    set_is_showing_rating_modal(true)
  }

  // ########################################
  // ########################################

  function render_guests() {
    if (!guests) return []

    const rows = []
    guests.items.forEach((item) => {
      rows.push(
          <tr key={hash(JSON.stringify(item))}>
            <td>
              {item.guest_nickname_auth0}
            </td>
            <td>
              {item.guest_email_auth0}
            </td>
            <td>
              {item.status}
            </td>
            <td>
              {render_stars(item.guest_rating_sum, item.guest_rating_count)}
            </td>
            {is_user_host && (
              <td style={{whiteSpace: "nowrap"}}>
                { item.status === 'ACCEPTED' && <Button className="mx-1" outline color="success" size="sm" onClick={() => handle_rate(item.guest_user_id_auth0, item.guest_nickname_auth0)}>
                  <i class="fas fa-star"></i>
                </Button>}
                { item.status === 'PENDING' && <Button className="mx-1" outline color="success" size="sm" onClick={() => handle_edit_status(item.guest_user_id_auth0, 'ACCEPTED')}>
                  <i class="fas fa-user-plus"></i>
                </Button>}
                <Button className="mx-1" outline color="danger" size="sm" onClick={() => handle_edit_status(item.guest_user_id_auth0, 'REJECTED')}>
                  <i class="fas fa-user-slash"></i>
                </Button>
              </td>
            )}
          </tr>,
      )
    })

    return rows
  }

  const render_stars = (rating_sum, rating_count) => {
    const res = []
    for (let i = 0; i < 5; i++) {
      if (i < Math.round(rating_sum/rating_count)) {
        res.push(<span class="fa fa-star checked"></span>)
      } else {
        res.push(<span class="fa fa-star"></span>)
      }
    }
    res.push(<p className="mb-0 green-font small-text" >#{rating_count}</p>)
    return <div className="text-center" style={{whiteSpace: "nowrap"}}>{res}</div>
  }

  // ########################################
  // ########################################

  return (
    <React.Fragment>
    <Row style={{width: '100%'}}>
      <Col md={{size: 6, order: 1}} xs={{order: 2}} className='mb-5' style={{display: "flex", alignItems: "center"}}>
      <table class="table table-hover table-responsive">
        { is_loading && <Spinner /> }
        <thead>
          <tr>
            <th scope="col">nickname</th>
            <th scope="col">email</th>
            <th scope="col">status</th>
            <th scope="col">rating</th>
            {is_user_host && (
              <th scope="col"/>)}
          </tr>
        </thead>
        <tbody>
          {render_guests()}
        </tbody>
      </table>
      </Col>
            <Col md={{size: 6, order: 2}} xs={{order: 1}} className='mb-5' style={{display: "flex", justifyContent: "center"}}>
        { is_loading && <Spinner /> }
        {event && <Event event={event} is_user_guest={is_user_guest}  is_user_host={is_user_host} callback={get_event}/>}
      </Col>
      </Row>
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
        callback_arguments={confirmation_callback_arguments}
      />
      <RatingModal
        is_showing={is_showing_rating_modal}
        set_is_showing={set_is_showing_rating_modal}
        callback={rating_callback}
        nickname_auth0={rating_reviewee_nickname}
        reviewee_user_id_auth0={rating_reviewee_user_id_auth0}
        event_id={event_id}
        is_user_host={is_user_host}
      />
    </React.Fragment>)
}

export default EventDetails
