import React, {useState, useEffect} from 'react'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Form, FormGroup, Label, Input, Row, Col} from 'reactstrap'
import Spinner from './Spinner'
import ServerErrorModal from './ServerErrorModal'
import {get_access_token} from '../utils/AccessToken'
import axios from 'axios'
import {useAuth0} from '@auth0/auth0-react'
import {useHistory} from 'react-router-dom';
import moment from 'moment';

const CreateEventModal = (props) => {
  const {is_showing, set_is_showing, callback, event_id} = props

  const [start, set_start] = useState('2021-07-31T10:49:00');
  const [end, set_end] = useState('2021-08-03T10:49:00');
  const [city, set_city] = useState('karlsruhe');
  const [total_places, set_total_places] = useState(12);
  const [free_places, set_free_places] = useState(12);
  const [description, set_description] = useState('no description');
  const [whatsapp_group_link, set_whatsapp_group_link] = useState();
  const [meeting_point, set_meeting_point] = useState('schloss');
  const [type, set_type] = useState('WORKSHOP');

  const [is_loading, set_is_loading] = useState(false)
  const [error_response, set_error_response] = useState()
  const [is_showing_server_error_modal, set_is_showing_server_error_modal] = useState()
  const {user} = useAuth0()
  const history = useHistory();

  // ########################################
  // ########################################

  useEffect(() => {
    (async () => {
      if (event_id && is_showing) {
        await get_event()
      }
    })()
  }, [event_id, is_showing])

  // ########################################
  // ########################################


  const get_event = async () => {
    try {
      set_is_loading(true)

      const accessToken = await get_access_token()

      const response = await axios({
        method: 'get',
        url: `/api/hosts/${user.sub}/events/${event_id}`,
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      set_start(format_date(response.data.start))
      set_end(format_date(response.data.end))
      set_city(response.data.city)
      set_free_places(response.data.free_places)
      set_total_places(response.data.total_places)
      set_description(response.data.description)
      set_whatsapp_group_link(response.data.whatsapp_group_link)
      set_meeting_point(response.data.meeting_point)
      set_type(response.data.type)

      set_is_loading(false)
    } catch (err) {
      console.error(err)

      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)

      return null
    }
  }

  const patch_event = async () => {
    try {
      set_is_loading(true)

      const new_event = {city,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        free_places: free_places <= total_places ? free_places : total_places,
        total_places: total_places,
        description,
        type,
        whatsapp_group_link: whatsapp_group_link || '',
        meeting_point}

      const accessToken = await get_access_token()

      await axios({
        method: 'patch',
        url: `/api/hosts/${user.sub}/events/${event_id}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        data: JSON.stringify(new_event),
      })

      set_is_loading(false)
      set_is_showing(false)

      callback()
    } catch (err) {
      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)
    }
  }

  const post_event = async () => {
    try {
      set_is_loading(true)

      const new_event = {city,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        free_places: total_places && Number(total_places),
        total_places: total_places && Number(total_places),
        description,
        whatsapp_group_link: whatsapp_group_link || '',
        type,
        meeting_point}

      const accessToken = await get_access_token()

      await axios({
        method: 'post',
        url: `/api/hosts/${user.sub}/events`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        data: JSON.stringify(new_event),
      })

      set_is_loading(false)
      set_is_showing(false)

      callback()

      history.push('/my-events/organized-events');
    } catch (err) {
      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)
    }
  }

  // ########################################
  // ########################################

  const format_date = (iso_string) => {
    return moment(iso_string).format('YYYY-MM-DDTHH:mm:ss')
  }

  // ########################################
  // ########################################

  return (
    <Modal isOpen={is_showing} size={'lg'}>
      { is_loading && <Spinner /> }
      <ModalHeader toggle={() => set_is_showing(false)}>{event_id ? 'Edit Event' : 'Create Event'}</ModalHeader>
      <ModalBody>
        <Form>
          <Row form>
            <Col md={4}>
              <FormGroup>
                <Label for="type">Type</Label>
                <Input type="text" name="type" id="type" value={type} onChange={(evt) => set_type(evt.target.value)} autocomplete="off" />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="city">City</Label>
                <Input type="text" name="city" id="city" value={city} onChange={(evt) => set_city(evt.target.value)} autocomplete="off" />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="meeting_point">Meeting Point</Label>
                <Input type="url" name="meeting_point" id="meeting_point" value={meeting_point} onChange={(evt) => set_meeting_point(evt.target.value)} autocomplete="off"/>
              </FormGroup>
            </Col>
          </Row>
          <Row form>
            <Col md={6}>
              <FormGroup>
                <Label for="start">Start</Label>
                <Input type="datetime-local" name="start" id="start" value={start} onChange={(evt) => set_start(evt.target.value)} />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="end">End</Label>
                <Input type="datetime-local" name="end" id="end" value={end} onChange={(evt) => set_end(evt.target.value)} />
              </FormGroup>
            </Col>
          </Row>
          <Row form>
            <Col md={6}>
              <FormGroup>
                <Label for="total_places">Total places</Label>
                <Input type="number" name="total_places" id="total_places" value={total_places} onChange={(evt) => set_total_places(Number(evt.target.value))} />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="whatsapp_group_link">Whatsapp Group Link
                  <a href="https://faq.whatsapp.com/android/chats/how-to-create-and-invite-into-a-group" target="_blank" rel="noreferrer">
                    <i class="fas fa-question green-font ml-2" style={{cursor: 'pointer'}}/>
                  </a>
                </Label>
                <Input type="url" name="whatsapp_group_link" id="whatsapp_group_link" value={whatsapp_group_link} onChange={(evt) => set_whatsapp_group_link(evt.target.value)} autocomplete="off"/>
              </FormGroup>
            </Col>
          </Row>
          <FormGroup>
            <Label for="description">Description</Label>
            <Input rows="6" type="textarea" name="description" id="description" value={description} onChange={(evt) => set_description(evt.target.value)} />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        {event_id ? <Button outline color="success"
          onClick={() => patch_event()}
        >
          Save
        </Button> :
                <Button outline color="success"
                  onClick={() => post_event()}
                >
          Create
                </Button>}
      </ModalFooter>
      <ServerErrorModal
        is_showing={is_showing_server_error_modal}
        set_is_showing={set_is_showing_server_error_modal}
        error_response={error_response}
      />
    </Modal>
  )
}

export default CreateEventModal
