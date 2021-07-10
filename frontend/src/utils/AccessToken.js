import jwtDecode from 'jwt-decode'

let access_token
let in_progress_promise

export async function start_fetching_access_token(auth0) {
  if (!access_token || is_expired(await access_token)) {
    access_token = get_token_from_auth0({audience: process.env.REACT_APP_AUTH0_EVENTMARKET_API_ID}, auth0)
  }

  const token = await access_token

  const token_decoded = jwtDecode(token)
  const valid_in_seconds = token_decoded.exp - token_decoded.iat

  await wait(valid_in_seconds)
  start_fetching_access_token(auth0)
}

export async function get_access_token() {
  return access_token
}

// ########################################
// ########################################

const get_token_from_auth0 = async (options, auth0) => {
  if (in_progress_promise) await in_progress_promise
  return await (in_progress_promise = new Promise(async (resolve, reject) => {
    try {
      const {getAccessTokenSilently, getAccessTokenWithPopup} = auth0

      let token
      if (window.location.hostname === 'localhost') {
        token = await getAccessTokenWithPopup(options)
      } else {
        token = await getAccessTokenSilently(options)
      }
      resolve(token)
    } catch (err) {
      reject(err)
    }
  }))
}

function wait(seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000)
  })
}

function is_expired(token) {
  const token_decoded = jwtDecode(token)
  return token_decoded.exp * 1000 <= Date.now()
}
