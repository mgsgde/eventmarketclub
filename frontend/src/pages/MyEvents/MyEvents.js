import React, {useState, useEffect} from 'react'
import Event from '../../components/Event'
import Spinner from '../../components/Spinner'
import ServerErrorModal from '../../components/ServerErrorModal'
import axios from 'axios'
import {useAuth0} from '@auth0/auth0-react';
import {get_access_token} from '../../utils/AccessToken'

const MyEvents = (props) => {
  const {is_user_guest, is_user_host} = props
  const [is_loading, set_is_loading] = useState(true)
  const [events, set_events] = useState()
  const [error_response, set_error_response] = useState()
  const [is_showing_server_error_modal, set_is_showing_server_error_modal] = useState(false)
  const {user, isAuthenticated} = useAuth0();

  // ########################################
  // ########################################

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        await get_events()
      }
    })()
  }, [])

  // #######################################
  // #######################################

  const get_events = async () => {
    try {
      set_is_loading(true)

      const accessToken = await get_access_token()

      let url
      if (is_user_host) {
        url = `/api/hosts/${user.sub}/events`
      } else {
        url = `/api/guests/${user.sub}/events`
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

      set_events(response.data)
    } catch (err) {
      console.error(err)

      set_is_loading(false)
      set_error_response(err.response)
      set_is_showing_server_error_modal(true)

      return null
    }
  }

  // ########################################
  // ########################################

  const render_events = () => {
    const cards = []

    events?.items.forEach((event) => {
      cards.push( <Event event={event} is_user_guest={is_user_guest} is_user_host={is_user_host} callback={get_events}/>)
    })

    return cards
  }

  return (
    <React.Fragment>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        width: '100%',
      }}>

        {events && render_events()}
      </div>
      <ServerErrorModal
        is_showing={is_showing_server_error_modal}
        set_is_showing={set_is_showing_server_error_modal}
        error_response={error_response}
      />
    </React.Fragment>
  )
}

export default MyEvents
