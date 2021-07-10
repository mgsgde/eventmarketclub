/* eslint no-invalid-this: "off"*/
/* eslint no-unused-vars: "off"*/
const db = require('../utils/db.js');
const config = require('../config.js');
const assert = require('assert');
const user_management_api_id = `https://${process.env.DOMAIN_AUTH0}/api/v2/`;
const eventmarket_api_id = `https://eventmarket.com/api`;
const axios = require('axios');
const knex = require('knex')(config.DATABASE);

const user_ids = [];

let host_user;
let guest_user;

describe(`Testing hosts\n`, function() {
  before(async function() {
    this.timeout(60000);

    await db.delete();
    await db.setup();
    app = require('../index.js');
    await app;

    // ########################################
    // ########################################

    const access_token_usermanagement = await get_access_token(user_management_api_id);

    let random_id = make_random_id(10);

    host_user = await create_user({
      email: `testuser-${random_id}@eventmarket.com`,
      nickname: `testuser-${random_id}`,
    }, access_token_usermanagement);

    random_id = make_random_id(10);

    guest_user = await create_user({
      email: `testuser-${random_id}@eventmarket.com`,
      nickname: `testuser-${random_id}`,
    }, access_token_usermanagement);
  });

  it(`event gets created, guest joins and rates host and finally leaves.`, async function() {
    this.timeout(600000);

    const access_token_eventmarket = await get_access_token(eventmarket_api_id);

    const city = 'stuttgart';
    const start = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    const free_places = 10;
    const total_places = 10;
    const description = 'Adipisicing excepteur eu duis proident voluptate magna proident nisi in ut anim aute velit veniam proident in aute consectetur.';
    const type = 'WORKSHOP';
    const whatsapp_group_link = 'whatsapp.com';
    const meeting_point = 'marktplatz';
    const host_user_id_auth0 = host_user.user_id;

    const new_event = {
      city,
      start,
      end,
      free_places,
      total_places,
      description,
      type,
      whatsapp_group_link,
      meeting_point,
    };

    const {event_id} = await post_event(host_user_id_auth0, new_event, access_token_eventmarket);

    // ########################################
    // ########################################

    await post_guest(guest_user.user_id, event_id, access_token_eventmarket);

    const patched_guest = {
      status: 'ACCEPTED',
    };
    await patch_guest(guest_user.user_id, event_id, patched_guest, access_token_eventmarket);

    const rating = {
      event_id,
      rating: 4,
    };

    await post_guest_rating(guest_user.user_id, host_user.user_id, rating, access_token_eventmarket);

    const result = await get_guest_events(guest_user.user_id, access_token_eventmarket);

    assert(result.per_page !== undefined && result.per_page !== null);
    assert(result.page !== undefined && result.page !== null);
    assert(result.total_number_of_items !== undefined && result.total_number_of_items !== null);
    assert(result.items !== undefined && result.items !== null);

    assert.equal(result.items[0].host_user_id_auth0, host_user_id_auth0);
    assert.equal(result.items[0].city, city);
    // assert.equal(result.items[0].start, start);
    // assert.equal(result.items[0].end, end);
    assert.equal(result.items[0].free_places, 9);
    assert.equal(result.items[0].total_places, total_places);
    assert.equal(result.items[0].description, description);
    assert.equal(result.items[0].type, type);
    assert.equal(result.items[0].host_rating_sum, rating.rating);
    assert.equal(result.items[0].host_rating_count, 1);

    const result_2 = await get_guest_event(guest_user.user_id, event_id, access_token_eventmarket);

    assert.equal(result_2.host_user_id_auth0, host_user_id_auth0);
    assert.equal(result_2.city, city);
    // assert.equal(result_2.start, start);
    // assert.equal(result_2.end, end);
    assert.equal(result_2.free_places, 9);
    assert.equal(result_2.total_places, total_places);
    assert.equal(result_2.description, description);
    assert.equal(result_2.type, type);
    assert.equal(result_2.host_rating_sum, rating.rating);
    assert.equal(result_2.host_rating_count, 1);
    assert.equal(result_2.whatsapp_group_link, whatsapp_group_link);
    assert.equal(result_2.meeting_point, meeting_point);

    const result_3 = await delete_guest_event(guest_user.user_id, event_id, access_token_eventmarket);

    assert(result_3.status);
    assert(result_3.message);

    assert.equal(result_3.status, 200);
    assert.equal(result_3.message, 'Successfully deleted guest.');

    const guest = (await knex('guests').where({
      guest_user_id_auth0: guest_user.user_id,
      event_id,
    }).select())[0];

    assert.equal(guest, null);

    const result_4 = (await knex('ratings').where({
      reviewer_user_id_auth0: 'system',
      reviewee_user_id_auth0: guest_user.user_id,
      event_id,
    }).select())[0];

    assert(result_4.rating === 1);

    const result_5 = (await knex('events').where({
      event_id,
    }).select())[0];

    assert(result_5.free_places === 10);
  });

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
}

async function get_events(host_user_id_auth0, access_token) {
  const options = {
    method: 'GET',
    url: `http://localhost:${config.PORT}/api/hosts/${host_user_id_auth0}/events`,
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
  };

  console.info(`Calling ${options.method} ${options.url}: `, options);

  const response = await axios(options);

  console.info(`Response from ${options.method} ${options.url}: `, response.data);

  return response.data;
}

async function get_event(host_user_id_auth0, event_id, access_token) {
  const options = {
    method: 'GET',
    url: `http://localhost:${config.PORT}/api/hosts/${host_user_id_auth0}/events/${event_id}`,
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
  };

  console.info(`Calling ${options.method} ${options.url}: `, options);

  const response = await axios(options);

  console.info(`Response from ${options.method} ${options.url}: `, response.data);

  return response.data;
}

async function post_guest(guest_user_id_auth0, event_id, access_token) {
  const options = {
    method: 'POST',
    url: `http://localhost:${config.PORT}/api/events/${event_id}/guests/${guest_user_id_auth0}`,
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
  };

  console.info(`Calling ${options.method} ${options.url}: `, options);

  const response = await axios(options);

  console.info(`Response from ${options.method} ${options.url}: `, response.data);

  return response.data;
}

async function patch_guest(guest_user_id_auth0, event_id, body, access_token) {
  const options = {
    method: 'PATCH',
    url: `http://localhost:${config.PORT}/api/events/${event_id}/guests/${guest_user_id_auth0}`,
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
    data: JSON.stringify(body),
  };

  console.info(`Calling ${options.method} ${options.url}: `, options);

  const response = await axios(options);

  console.info(`Response from ${options.method} ${options.url}: `, response.data);

  return response.data;
}

async function post_host_rating(reviewer_user_id_auth0, reviewee_user_id_auth0, rating, access_token) {
  const options = {
    method: 'POST',
    url: `http://localhost:${config.PORT}/api/hosts/${reviewer_user_id_auth0}/guests/${reviewee_user_id_auth0}/ratings`,
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
    data: JSON.stringify(rating),
  };

  console.info(`Calling ${options.method} ${options.url}: `, options);

  const response = await axios(options);

  console.info(`Response from ${options.method} ${options.url}: `, response.data);

  return response.data;
}

async function get_event_guests(event_id, access_token) {
  const options = {
    method: 'GET',
    url: `http://localhost:${config.PORT}/api/events/${event_id}/guests`,
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
  };

  console.info(`Calling ${options.method} ${options.url}: `, options);

  const response = await axios(options);

  console.info(`Response from ${options.method} ${options.url}: `, response.data);

  return response.data;
}

async function post_guest_rating(reviewer_user_id_auth0, reviewee_user_id_auth0, rating, access_token) {
  const options = {
    method: 'POST',
    url: `http://localhost:${config.PORT}/api/guests/${reviewer_user_id_auth0}/hosts/${reviewee_user_id_auth0}/ratings`,
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
    data: JSON.stringify(rating),
  };

  console.info(`Calling ${options.method} ${options.url}: `, options);

  const response = await axios(options);

  console.info(`Response from ${options.method} ${options.url}: `, response.data);

  return response.data;
}

async function get_guest_events(guest_user_id_auth0, access_token) {
  const options = {
    method: 'GET',
    url: `http://localhost:${config.PORT}/api/guests/${guest_user_id_auth0}/events`,
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
  };

  console.info(`Calling ${options.method} ${options.url}: `, options);

  const response = await axios(options);

  console.info(`Response from ${options.method} ${options.url}: `, response.data);

  return response.data;
}

async function get_guest_event(guest_user_id_auth0, event_id, access_token) {
  const options = {
    method: 'GET',
    url: `http://localhost:${config.PORT}/api/guests/${guest_user_id_auth0}/events/${event_id}`,
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
  };

  console.info(`Calling ${options.method} ${options.url}: `, options);

  const response = await axios(options);

  console.info(`Response from ${options.method} ${options.url}: `, response.data);

  return response.data;
}


async function delete_guest_event(guest_user_id_auth0, event_id, access_token) {
  const options = {
    method: 'DELETE',
    url: `http://localhost:${config.PORT}/api/events/${event_id}/guests/${guest_user_id_auth0}`,
    headers: {
      'Content-type': 'application/json',
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
}
;

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
}
;


// ########################################
// ########################################

async function create_user({email, nickname}, access_token) {
  const new_user = await post_user({
    email,
    nickname,
  }, access_token);

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
    url: `https://${process.env.DOMAIN_AUTH0}/api/v2/users`,
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
}
;


async function delete_auth0_user(user_id, access_token) {
  const options = {
    method: 'DELETE',
    url: `https://${process.env.DOMAIN_AUTH0}/api/v2/users/${user_id}`,
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
  const url = `https://${process.env.DOMAIN_AUTH0}/oauth/token`;

  const options = {
    method: 'POST',
    url,
    headers: {
      'content-type': 'application/json',
    },
    data: JSON.stringify({
      client_id: process.env.API_TEST_CLIENT_ID_AUTH0,
      client_secret: process.env.API_TEST_CLIENT_SECRET_AUTH0,
      audience: audience,
      grant_type: 'client_credentials',
    }),
  };

  const response = await axios(options);

  return response.data.access_token;
}
;

// ########################################
// ########################################

function make_random_id(length) {
  const result = [];
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result.push(characters.charAt(Math.floor(Math.random() *
      charactersLength)));
  }
  return result.join('');
}
