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

    console.log('host_user', host_user);

    random_id = make_random_id(10);

    guest_user = await create_user({
      email: `testuser-${random_id}@eventmarket.com`,
      nickname: `testuser-${random_id}`,
    }, access_token_usermanagement);
  });

  it(`create event and get it`, async function() {
    this.timeout(600000);

    const access_token_eventmarket = await get_access_token(eventmarket_api_id);

    const city = 'stuttgart';
    const start = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    const total_places = 10;
    const free_places = 10;
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

    const result = await post_event(host_user_id_auth0, new_event, access_token_eventmarket);

    assert(result.event_id !== null && result.event_id !== undefined);
    assert(result.host_user_id_auth0 !== null && result.host_user_id_auth0 !== undefined);
    assert(result.host_nickname_auth0 !== null && result.host_nickname_auth0 !== undefined);
    assert(result.city !== null && result.city !== undefined);
    assert(result.start !== null && result.start !== undefined);
    assert(result.end !== null && result.end !== undefined);
    assert(result.free_places !== null && result.free_places !== undefined);
    assert(result.total_places !== null && result.total_places !== undefined);
    assert(result.description !== null && result.description !== undefined);
    assert(result.type !== null && result.type !== undefined);
    assert(result.host_rating_sum !== null && result.host_rating_sum !== undefined);
    assert(result.host_rating_count !== null && result.host_rating_count !== undefined);
    assert(result.host_email_auth0 !== null && result.host_email_auth0 !== undefined);
    assert(result.whatsapp_group_link !== null && result.whatsapp_group_link !== undefined);
    assert(result.meeting_point !== null && result.meeting_point !== undefined);

    assert.equal(result.host_user_id_auth0, host_user_id_auth0);
    assert.equal(result.city, city);
    // assert.equal(result.start, start);
    // assert.equal(result.end, end);
    assert.equal(result.free_places, 10);
    assert.equal(result.total_places, total_places);
    assert.equal(result.description, description);
    assert.equal(result.type, type);
    assert.equal(result.host_rating_sum, 0);
    assert.equal(result.host_rating_count, 0);
    assert.equal(result.whatsapp_group_link, whatsapp_group_link);
    assert.equal(result.meeting_point, meeting_point);

    // ########################################
    // ########################################

    const result_1 = await get_events(host_user_id_auth0, access_token_eventmarket);

    assert(result_1.per_page !== undefined && result_1.per_page !== null);
    assert(result_1.page !== undefined && result_1.page !== null);
    assert(result_1.total_number_of_items !== undefined && result_1.total_number_of_items !== null);
    assert(result_1.items !== undefined && result_1.items !== null);

    assert.equal(result_1.items[0].host_user_id_auth0, host_user_id_auth0);
    assert.equal(result_1.items[0].city, city);
    // assert.equal(result_1.items[0].start, start);
    // assert.equal(result_1.items[0].end, end);
    assert.equal(result_1.items[0].free_places, 10);
    assert.equal(result_1.items[0].total_places, total_places);
    assert.equal(result_1.items[0].description, description);
    assert.equal(result_1.items[0].type, type);
    assert.equal(result_1.items[0].host_rating_sum, 0);
    assert.equal(result_1.items[0].host_rating_count, 0);
    assert.equal(result_1.items[0].whatsapp_group_link, whatsapp_group_link);
    assert.equal(result_1.items[0].meeting_point, meeting_point);

    // ########################################
    // ########################################

    const result_2 = await get_event(host_user_id_auth0, result.event_id, access_token_eventmarket);

    assert.equal(result_2.host_user_id_auth0, host_user_id_auth0);
    assert.equal(result_2.city, city);
    // assert.equal(result_2.start, start);
    // assert.equal(result_2.end, end);
    assert.equal(result_2.free_places, 10);
    assert.equal(result_2.total_places, total_places);
    assert.equal(result_2.description, description);
    assert.equal(result_2.type, type);
    assert.equal(result_2.host_rating_sum, 0);
    assert.equal(result_2.host_rating_count, 0);
    assert.equal(result_2.whatsapp_group_link, whatsapp_group_link);
    assert.equal(result_2.meeting_point, meeting_point);
  });

  it(`event gets created, guest joins and is rated by host and guests are retrieved.`, async function() {
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

    const updated_event = {
      city: 'heidelberg',
      start,
      end,
      free_places,
      total_places,
      description,
      type,
      whatsapp_group_link,
      meeting_point,
    };

    const result_1 = await patch_event(host_user_id_auth0, event_id, updated_event, access_token_eventmarket);

    assert.equal(result_1.host_user_id_auth0, host_user.user_id);
    assert.equal(result_1.city, updated_event.city);
    // assert.equal(result_2.start, updated_event.start);
    // assert.equal(result_2.end, updated_event.end);
    assert.equal(result_1.free_places, 10);
    assert.equal(result_1.total_places, updated_event.total_places);
    assert.equal(result_1.description, updated_event.description);
    assert.equal(result_1.type, updated_event.type);
    assert.equal(result_1.host_rating_sum, 0);
    assert.equal(result_1.host_rating_count, 0);
    assert.equal(result_1.whatsapp_group_link, updated_event.whatsapp_group_link);
    assert.equal(result_1.meeting_point, updated_event.meeting_point);

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
    await post_host_rating(host_user.user_id, guest_user.user_id, rating, access_token_eventmarket);

    const result_2 = await get_event_guests(event_id, access_token_eventmarket);

    assert(result_2.per_page !== undefined && result_2.per_page !== null);
    assert(result_2.page !== undefined && result_2.page !== null);
    assert(result_2.total_number_of_items !== undefined && result_2.total_number_of_items !== null);
    assert(result_2.items !== undefined && result_2.items !== null);

    assert.equal(result_2.items[0].event_id, event_id);
    assert.equal(result_2.items[0].guest_user_id_auth0, guest_user.user_id);
    assert.equal(result_2.items[0].status, patched_guest.status);
    assert.equal(result_2.items[0].guest_rating_sum, rating.rating);
    assert.equal(result_2.items[0].guest_rating_count, 1);

    const result_3 = await delete_host_event(host_user.user_id, event_id, access_token_eventmarket);

    assert(result_3.status);
    assert(result_3.message);

    assert.equal(result_3.status, 200);
    assert.equal(result_3.message, 'Successfully deleted event.');

    const event = (await knex('events').where({
      host_user_id_auth0: host_user.user_id,
      event_id,
    }).select())[0];

    assert.equal(event, null);

    const guests = await knex('guests').where({
      event_id,
    }).select();

    assert(guests.length === 0);

    const result_4 = (await knex('ratings').where({
      reviewer_user_id_auth0: 'system',
      reviewee_user_id_auth0: host_user.user_id,
      event_id,
    }).select())[0];

    assert(result_4.rating === 1);
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

async function patch_event(host_user_id_auth0, event_id, event, access_token) {
  const options = {
    method: 'patch',
    url: `http://localhost:${config.PORT}/api/hosts/${host_user_id_auth0}/events/${event_id}`,
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

async function delete_host_event(host_user_id_auth0, event_id, access_token) {
  const options = {
    method: 'DELETE',
    url: `http://localhost:${config.PORT}/api/hosts/${host_user_id_auth0}/events/${event_id}`,
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
