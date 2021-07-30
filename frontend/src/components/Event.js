import React, {useState} from 'react'
import {
  Card,
  CardBody,
  Button,
  Row,
  Col,
} from 'reactstrap';
import {useAuth0} from '@auth0/auth0-react'
import {Link} from 'react-router-dom'
import ContactModal from './ContactModal'
import CreateEventModal from './CreateEventModal'
import {get_access_token} from '../utils/AccessToken'
import axios from 'axios'
import Spinner from './Spinner'
import ServerErrorModal from './ServerErrorModal'
import ConfirmationModal from './ConfirmationModal'
import RatingModal from './RatingModal'
import {useHistory} from 'react-router-dom';
import moment from 'moment';

const Event = (props) => {
  const {event, is_user_host, is_user_guest, callback} = props
  const {user, loginWithRedirect} = useAuth0()
  const history = useHistory();

  const [is_loading, set_is_loading] = useState(false)
  const [is_showing_contactmodal, set_is_showing_contactmodal] = useState(false)
  const [is_showing_createEventModal, set_is_showing_createEventModal] = useState(false)
  const [error_response, set_error_response] = useState()
  const [is_showing_server_error_modal, set_is_showing_server_error_modal] = useState(false)
  const [is_showing_confirmation_modal, set_is_showing_confirmation_modal] = useState(false)
  const [confirmation_message, set_confirmation_message] = useState()
  const [confirmation_callback, set_confirmation_callback] = useState()
  const [rating_reviewee_nickname, set_rating_reviewee_nickname_auth0] = useState()
  const [rating_reviewee_user_id_auth0, set_rating_reviewee_user_id_auth0] = useState()
  const [rating_callback, set_rating_callback] = useState()
  const [is_showing_rating_modal, set_is_showing_rating_modal] = useState(false)

  // ########################################
  // ########################################

  async function join_event() {
    try {
      set_is_loading(true)

      if (!user?.sub) {
        loginWithRedirect()
        return
      }

      const accessToken = await get_access_token()

      await axios({
        method: 'post',
        url: `/api/events/${event.event_id}/guests/${user.sub}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      set_is_loading(false)
      history.push('/my-events/joined-events');
    } catch (err) {
      console.error(err)

      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)
    }
  }

  async function leave_event() {
    try {
      set_is_loading(true)

      if (!user?.sub) {
        loginWithRedirect()
        return
      }

      const accessToken = await get_access_token()

      await axios({
        method: 'delete',
        url: `/api/events/${event.event_id}/guests/${user.sub}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      set_is_loading(false)
      callback()
      history.push('/my-events/joined-events');
    } catch (err) {
      console.error(err)

      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)
    }
  }

  async function delete_event() {
    try {
      set_is_loading(true)

      if (!user?.sub) {
        loginWithRedirect()
        return
      }

      const accessToken = await get_access_token()

      await axios({
        method: 'delete',
        url: `/api/hosts/${user.sub}/events/${event.event_id}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      set_is_loading(false)
      callback()
      history.push('/my-events/organized-events');
    } catch (err) {
      console.error(err)

      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)
    }
  }

  // ########################################
  // ########################################

  const handle_join_event = () => {
    set_confirmation_message('Do you really want to join this event?')
    set_confirmation_callback(() => join_event)
    set_is_showing_confirmation_modal(true)
  }

  const handle_on_leave = () => {
    set_confirmation_message('Do you really want to leave this event? By leaving this event you get a negative rating.')
    set_confirmation_callback(() => leave_event)
    set_is_showing_confirmation_modal(true)
  }

  const handle_rate = (host_user_id_auth0, host_nickname_auth0) => {
    set_rating_reviewee_nickname_auth0(host_nickname_auth0)
    set_rating_reviewee_user_id_auth0(host_user_id_auth0)
    set_rating_callback(() => callback)
    set_is_showing_rating_modal(true)
  }

  const handle_on_delete = () => {
    set_confirmation_message('Do you really want to delete this event? By deleting this event you get a negative rating.')
    set_confirmation_callback(() => delete_event)
    set_is_showing_confirmation_modal(true)
  }

  // ########################################
  // ########################################

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
    return res
  }

  const render_status = () => {
    switch (event.status) {
      case 'PENDING':
        return <span style={{color: 'red'}}>Waiting for host to accept ...</span>
        break;
      case 'REJECTED':
        return <span style={{color: 'red'}}>Host has refused entry.</span>
        break;
    }
  }

  const render_buttons = () => {
    if (is_user_host) {
      return (
        <React.Fragment>
          <Link to={`/my-events/organized-events/${event.event_id}`}> <Button className="mx-2" outline color="success" size="lg" >
        Guests
          </Button>
          </Link>
          <Button className="mx-2" outline color="success" size="lg" onClick={() => set_is_showing_createEventModal(true)}>Edit</Button>
          <Button className="mx-2" outline color="success" size="lg" onClick={() => handle_on_delete()}>Delete</Button>
        </React.Fragment>)
    } else if (is_user_guest) {
      return (
        <React.Fragment>
          {event.status != 'ACCEPTED' && <p className="mb-0 green-font" style={{flex: '1 1 auto'}} >{render_status()}</p> }
          {event.status === 'ACCEPTED' && <Button className="mx-2" outline color="success" size="lg" onClick={() => set_is_showing_contactmodal(true)}>Contact</Button>}
          {event.status === 'ACCEPTED' && <Link to={`/my-events/joined-events/${event.event_id}`}> <Button className="mx-2" outline color="success" size="lg" >
        Guests
          </Button>
          </Link> }
          {event.status === 'ACCEPTED' && <Button className="mx-2" outline color="success" size="lg" onClick={() => handle_rate(event.host_user_id_auth0, event.host_nickname_auth0)}>Rate</Button>}
          <Button className="mx-2" outline color="success" size="lg" onClick={() => handle_on_leave()}>Leave</Button>
        </React.Fragment>)
    } else {
      return (
        <React.Fragment>
          <Button className="mx-2" outline color="success" size="lg" onClick={() => handle_join_event()}>Join</Button>
        </React.Fragment>)
    }
  }


  return (
    <Card className="mt-4 green-border" style={{maxWidth: '600px'}}>
      { is_loading && <Spinner /> }
      <CardBody>
        <Row className="green-font mb-4">
          <Col>
            <h3 className="green-font"> <React.Fragment><i class="fas fa-coffee green-font"></i> {event.type} </React.Fragment></h3>
          </Col>
          <Col>
            <p className="mb-0 green-font">
              {event.city}
            </p>
            <p className='mb-0 green-font'>
              {moment(event.start).format('YYYY-MM-DD (ddd.)')}<br/>
              {moment(event.start).format('HH:mm')}{' to '}
              {moment(event.end).format('HH:mm')}
            </p>
          </Col>
        </Row>
        <Row className="mb-2">
          <Col className="small-text description">
            {event.description}
          </Col>
        </Row>
      </CardBody>
      <div class="card-footer">
        <Row className='flexContainer-mt-10 mb-3'>
          <Col className="text-center green-font">
            <p className="mb-0 green-font organizer" >by {event.host_nickname_auth0} </p>
            {render_stars(event.host_rating_sum, event.host_rating_count)}
          </Col>
          <Col sm="6" className="text-center">
            <p className="mb-0 green-font">
              reservations
            </p>
            <p className='mb-0 green-font'>
              {event.total_places - event.free_places} / {event.total_places}
            </p>
          </Col>
        </Row>
        <Row className='flexContainer-mt-10' style={{justifyContent: 'flex-end', alignItems: 'center'}}>
          {render_buttons()}
        </Row>
      </div>
      <ContactModal
        is_showing={is_showing_contactmodal}
        set_is_showing={set_is_showing_contactmodal}
        event_id={event.event_id}
      />
      <CreateEventModal
        is_showing={is_showing_createEventModal}
        set_is_showing={set_is_showing_createEventModal}
        callback={callback}
        event_id={event.event_id}
      />
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
      <RatingModal
        is_showing={is_showing_rating_modal}
        set_is_showing={set_is_showing_rating_modal}
        callback={rating_callback}
        nickname_auth0={rating_reviewee_nickname}
        reviewee_user_id_auth0={rating_reviewee_user_id_auth0}
        event_id={event.event_id}
        is_user_host={is_user_host}
      />
    </Card>)
}

export default Event
