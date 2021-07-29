/* eslint no-invalid-this: "off"*/

const config = require('../config.js');
const assert = require('assert');
const user_management_api_id = `https://${process.env.DOMAIN_OAUTH2}/api/v2/`;
const eventmarket_api_id = `https://eventmarketclub.com/api`;
const axios = require('axios');
const knex = require('knex')(config.DATABASE);

const user_ids = [];

describe(`Testing users\n`, function() {
  before(async function() {
    this.timeout(60000);

    app = require('../index.js');
    await app;
  });

  it(`PATCH /users/:user_id_auth0`, async function() {
    this.timeout(600000);

    const access_token_usermanagement = await get_access_token(user_management_api_id);

    let random_id = make_random_id(10);

    const new_user = await create_user({
      email: `testuser-${random_id}@eventmarketclub.com`,
      nickname: `testuser-${random_id}`,
    }, access_token_usermanagement);

    // ########################################
    // ########################################

    const access_token_eventmarket = await get_access_token(eventmarket_api_id);

    const host_user_id_auth0 = new_user.user_id;

    const new_event = {
      'city': 'berlin',
      'start': new Date(Date.now() + 2*60*60*1000).toISOString(),
      'end': new Date(Date.now() + 4*60*60*1000).toISOString(),
      'free_places': 0,
      'total_places': 0,
      'description': 'Lorem ipsum est reprehenderit proident ea ad ex amet ut officia velit consequat aute do culpa dolore aute commodo proident incididunt voluptate dolore dolor excepteur aliqua.',
      'type': 'WORKSHOP',
      'whatsapp_group_link': 'suttgart',
      'meeting_point': 'marktplatz',
    };

    await post_event(host_user_id_auth0, new_event, access_token_eventmarket);

    // ########################################
    // ########################################

    random_id = make_random_id(10);

    const email_updated = `testuser-${random_id}@eventmarketclub.com`;
    const nickname_updated = `testuser-${random_id}`;

    const patched_user = await patch_user(new_user.user_id, {email_auth0: email_updated, nickname_auth0: nickname_updated}, access_token_eventmarket);

    assert.equal(patched_user.email_auth0, email_updated);
    assert.equal(patched_user.nickname_auth0, nickname_updated);
  });

  it(`DELETE /users/:user_id_auth0`, async function() {
    this.timeout(600000);

    const access_token_usermanagement = await get_access_token(user_management_api_id);

    const random_id = make_random_id(10);

    const new_user = await create_user({
      email: `testuser-${random_id}@eventmarketclub.com`,
      nickname: `testuser-${random_id}`,
    }, access_token_usermanagement);

    // ########################################
    // ########################################

    const access_token_eventmarket = await get_access_token(eventmarket_api_id);

    const host_user_id_auth0 = new_user.user_id;

    let new_event = {
      'city': 'string',
      'start': new Date(Date.now() + 2*60*60*1000).toISOString(),
      'end': new Date(Date.now() + 4*60*60*1000).toISOString(),
      'free_places': 0,
      'total_places': 0,
      'description': 'string',
      'type': 'WORKSHOP',
      'whatsapp_group_link': 'suttgart',
      'meeting_point': 'marktplatz',
    };

    new_event = await post_event(host_user_id_auth0, new_event, access_token_eventmarket);

    // ########################################
    // ########################################

    await delete_user(new_user.user_id, access_token_eventmarket);

    const user = (await knex('users').where({user_id_auth0: new_user.user_id}).select())[0];
    const event = (await knex('events').where({event_id: new_event.event_id}).select())[0];

    assert.equal(user, null);
    assert.equal(event, null);
  });

  // ########################################
  // ########################################

  after(async function() {
    this.timeout(60000);

    const access_token_usermanagement = await get_access_token(user_management_api_id);

    for (let i = 0; i < user_ids.length; i++) {
      await delete_auth0_user(user_ids[i], access_token_usermanagement);
    }
  });
});

// ########################################
// ########################################

async function post_event(host_user_id_auth0, event, access_token) {
  const options = {
    method: 'POST',
    url: `http://localhost:${config.PORT}/api/hosts/${host_user_id_auth0}/events`,
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
    data: JSON.stringify(event),
  };

  console.info(`Calling ${options.method} ${options.url}: `, options);

  const response = await axios(options);

  console.info(`Response from ${options.method} ${options.url}: `, response.data);

  return response.data;
};

async function patch_user(user_id, patched_user, access_token) {
  const options = {
    method: 'PATCH',
    url: `http://localhost:${config.PORT}/api/users/${user_id}`,
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
    data: JSON.stringify(patched_user),
  };

  console.info(`Calling ${options.method} ${options.url}: `, options);

  const response = await axios(options);

  console.info(`Response from ${options.method} ${options.url}: `, response.data);

  return response.data;
};

async function delete_user(user_id, access_token) {
  const options = {
    method: 'DELETE',
    url: `http://localhost:${config.PORT}/api/users/${user_id}`,
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
  };

  console.info(`Calling ${options.method} ${options.url}: `, options);

  const response = await axios(options);

  console.info(`Response from ${options.method} ${options.url}: `, response.data);

  return response.data;
};
// ########################################
// ########################################

async function create_user({email, nickname}, access_token) {
  const new_user = await post_user({email, nickname}, access_token);

  await knex('users').insert({
    user_id_auth0: new_user.user_id,
    email_auth0: new_user.email,
    nickname_auth0: new_user.nickname,
  });

  return new_user;
}

async function post_user({email, nickname}, access_token) {
  const body = {
    'connection': 'Username-Password-Authentication',
    'password': 'Ku3Ne:6Vxa&kK*Gu+d~Jt6mK)Xb!9y',
    'email': email,
    'nickname': nickname,
  };

  const options = {
    method: 'POST',
    url: `https://${process.env.DOMAIN_OAUTH2}/api/v2/users`,
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
    data: JSON.stringify(body),
  };

  console.info(`Calling ${options.method} ${options.url}: `, options);

  const response = await axios(options);

  console.info(`Response from ${options.method} ${options.url}: `, response.data);

  user_ids.push(response.data.user_id);

  return response.data;
};


async function delete_auth0_user(user_id, access_token) {
  const options = {
    method: 'DELETE',
    url: `https://${process.env.DOMAIN_OAUTH2}/api/v2/users/${user_id}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
  };

  console.info(`Calling ${options.method} ${options.url}: `, options);

  const response = await axios(options);

  console.info(`Response from ${options.method} ${options.url}: `, response.data);

  return response.data;
}

// ########################################
// ########################################

async function get_access_token(audience) {
  const url = `https://${process.env.DOMAIN_OAUTH2}/oauth/token`;

  const options = {
    method: 'POST',
    url,
    headers: {
      'content-type': 'application/json',
    },
    data: JSON.stringify({
      client_id: process.env.BACKEND_TEST_SCRIPT_CLIENT_ID_OAUTH2,
      client_secret: process.env.BACKEND_TEST_SCRIPT_SECRET_OAUTH2,
      audience: audience,
      grant_type: 'client_credentials',
    }),
  };

  const response = await axios(options);

  return response.data.access_token;
};

// ########################################
// ########################################

function make_random_id(length) {
  const result = [];
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result.push(characters.charAt(Math.floor(Math.random() *
 charactersLength)));
  }
  return result.join('');
}
