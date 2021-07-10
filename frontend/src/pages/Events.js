import React, {useState, useEffect} from 'react'
import {
  Button, Row, Col, Form, FormGroup, Input,
} from 'reactstrap';
import axios from 'axios'
import FeedbackModal from '../components/FeedbackModal'
import CreateEventModal from '../components/CreateEventModal'
import Event from '../components/Event'
import {EVENT_TYPES, SAMPLE_EVENTS} from '../utils/constants'
import Spinner from '../components/Spinner'
import ServerErrorModal from '../components/ServerErrorModal'
import ReactTypingEffect from 'react-typing-effect';
import {useAuth0} from '@auth0/auth0-react';

const Events = () => {
  const [number_of_likes, set_number_of_likes] = useState({
    like: 0,
    dislikes: 0,
  })
  const [is_loading, set_is_loading] = useState(true)
  // const [city, set_city] = useState('Berlin')
  // const [in_eu, set_in_eu] = useState(true)
  const [feedback_response, set_feedback_response] = useState(null)
  const [is_showing_feedbackmodal, set_is_showing_feedbackmodal] = useState(false)
  const [is_showing_createEventModal, set_is_showing_createEventModal] = useState(false)
  const [events, set_events] = useState()
  const [error_response, set_error_response] = useState()
  const [is_showing_server_error_modal, set_is_showing_server_error_modal] = useState(false)
  const [search_query, set_search_query] = useState()
  const {isAuthenticated, isLoading, user, loginWithRedirect} = useAuth0();

  // ########################################
  // ########################################

  useEffect(() => {
    (async () => {
      await get_events()
      await get_likes()
    })()
  }, [])

  // #######################################
  // #######################################

  const get_events = async (search_query) => {
    try {
      set_is_loading(true)

      let url = '/api/events'

      if (search_query) {
        url += `?search_query=${search_query}`
      }

      const response = await axios({
        method: 'get',
        url,
        headers: {
          'Accept': 'application/json',
        },
      })

      set_is_loading(false)

      set_events(response.data)
    } catch (err) {
      console.error(err)

      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)
    }
  }

  const get_likes = async () => {
    set_is_loading(true)

    const options = {
      method: 'get',
      // eslint-disable-next-line max-len
      url: `/api/number_of_likes`,
      headers: {
        accept: 'application/json',
      },
    }

    const response = await axios(options)

    set_is_loading(false)

    set_number_of_likes(response.data)
  }

  const like = async (bool) => {
    try {
      set_is_loading(true)

      const options = {
        method: 'post',
        // eslint-disable-next-line max-len
        url: `/api/likes`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          like: Number(bool),
        },
      }

      await axios(options)

      const result = await get_likes()
      console.log("result", result)
      if (result) set_number_of_likes(result)

      set_is_loading(false)
      set_feedback_response('Thx for your feedback.')
      set_is_showing_feedbackmodal(true)
    } catch (err) {
      set_feedback_response('You can only vote once.')
      set_is_showing_feedbackmodal(true)
      set_is_loading(false)
    }
  }

  // ########################################
  // ########################################

  const handle_search = async (evt) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      await get_events(evt.target.value)
    }
  }

  const handle_create_event = () => {
    if (!user?.sub) {
      loginWithRedirect()
      return
    }

    set_is_showing_createEventModal(true)
  }


  // ########################################
  // ########################################


  const render_kind = (kind) => {
    switch (kind) {
      case EVENT_TYPES.WORKSHOP:
        return <React.Fragment> <i class="fa fa-graduation-cap green-font"></i> {kind} </React.Fragment>
        break;
      case EVENT_TYPES.DAYGAME:
        return <React.Fragment> <i class="fa fa-running green-font"></i> {kind} </React.Fragment>
        break;
      case EVENT_TYPES.NIGHTGAME:
        return <React.Fragment><i class="fas fa-cocktail green-font"></i> {kind} </React.Fragment>
        break;
    }
  }

  const render_stars = (number_of_stars) => {
    const res = []
    for (let i = 0; i < 5; i++) {
      if (i < number_of_stars) {
        res.push(<span class="fa fa-star checked"></span>)
      } else {
        res.push(<span class="fa fa-star"></span>)
      }
    }
    return res
  }

  const render_events = () => {
    const cards = []

    events?.items.forEach((event) => {
      cards.push( <Event event={event} />)
    })

    return cards
  }

  return (
    <React.Fragment>
      {(!isAuthenticated || isLoading) && <Row className="mb-5">
        <Col xl={{size: 10, offset: 1}} style={{border: 'solid', padding: '25px', color: 'orange'}}>
          <Row style={{alignItems: 'center'}}>
            <Col md="1" className="mb-3 text-center">
              <i class="fas fa-exclamation" style={{fontSize: '50px', color: 'orange'}}></i>
            </Col>
            <Col md="9" className="mb-3 text-center">
              <ReactTypingEffect
                text={['This is only a mvp. If you want to have it implemented properly, then like it.', 'An opensource event market platform! ;-)']}
                eraseSpeed={0}
                speed={30}
                eraseDelay={15000}
                typingDelay={1000}
              />
            </Col>
            <Col md="2" className="mb-3 text-center">
              <div className="mr-3">
                <span onClick={() => like(true)} className="mr-3">
                  <i class="fas fa-thumbs-up mr-2 thumb-button" style={{fontSize: '30px'}}/>{number_of_likes.likes}
                </span>
                <span onClick={() => like(false)}>
                  <i class="far fa-thumbs-down mr-2 thumb-button" style={{fontSize: '30px'}}/>{number_of_likes.dislikes}
                </span>
              </div>
            </Col>
          </Row>
        </Col>
      </Row> }
      <Row style={{alignItems: 'center'}}>
        <Col className="mb-3 mt-3" sm="12" xl={{size: 4, offset: 3}}>
          <Form>
            <FormGroup style={{marginBottom: '0px'}}>
              <Input
                type="search"
                name="search"
                id="search"
                placeholder="Search events near to your City ..."
                autocomplete="off"
                value={search_query}
                onChange={(evt) => set_search_query(evt.target.value)}
                onKeyDown={handle_search}
              />
            </FormGroup>
          </Form>
        </Col>
        <Col className="mb-3 mt-3" sm="12" xl={{size: 2, offset: 2}}>
          <Button outline color="success" size="lg" onClick={() => handle_create_event()}>Create Event</Button>
        </Col>
      </Row>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
      }}>
        {events && render_events()}
      </div>
      <FeedbackModal
        is_showing={is_showing_feedbackmodal}
        set_is_showing={set_is_showing_feedbackmodal}
        message={feedback_response}
      />
      <CreateEventModal
        is_showing={is_showing_createEventModal}
        set_is_showing={set_is_showing_createEventModal}
        callback={get_events}
      />
      <ServerErrorModal
        is_showing={is_showing_server_error_modal}
        set_is_showing={set_is_showing_server_error_modal}
        error_response={error_response}
      />
    </React.Fragment>
  )
}

export default Events
