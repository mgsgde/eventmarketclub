'use strict';
const axios = require('axios');
const Promise_Throttle = require('promise-throttle');
const promise_throttle_auth0_management_api = new Promise_Throttle({
  requestsPerSecond: 2, // 2 per second https://auth0.com/docs/policies/rate-limits
  promiseImplementation: Promise,
});
const promise_throttle_auth0_authentication_api = new Promise_Throttle({
  requestsPerSecond: 2.5, // limit is 300 per minute <=> 5 per second > 2.5 https://auth0.com/docs/policies/rate-limit-policy/authentication-api-endpoint-rate-limits
  promiseImplementation: Promise,
});
const log = async function(data1, data2 = '') {
  const currentDate = '[' + new Date().toUTCString() + '] [users_auth0.js] ';
  console.info('\n\x1b[36m%s\x1b[0m', currentDate, data1, data2);
};

// ########################################
// ########################################

exports.get_access_token = async function get_access_token(audience) {
  const url = `https://${process.env.DOMAIN_OAUTH2}/oauth/token`;

  const options = {
    method: 'POST',
    url,
    headers: {
      'content-type': 'application/json',
    },
    data: JSON.stringify({
      client_id: process.env.BACKEND_CLIENT_ID_OAUTH2,
      client_secret: process.env.BACKEND_CLIENT_SECRET_OAUTH2,
      audience: audience,
      grant_type: 'client_credentials',
    }),
  };

  // log(`Calling ${options.method} ${options.url} with data:`, options.data);

  let response;
  try {
    response = await promise_throttle_auth0_authentication_api.add(axios.bind(this, options));
  } catch (err) {
    err.status = 504;
    throw err;
  }

  return response.data.access_token;
};

// ########################################
// ########################################

exports.get_users = async function get_users({page, per_page, sort, q, access_token}) {
  let queryString = `fields=${'user_id,logins_count,phone_number,updated_at,blocked,last_login,given_name,family_name,created_at,email,user_metadata,nickname'}`;
  if (page) {
    queryString = `${queryString}&page=${page}`;
  }
  if (per_page) {
    queryString = `${queryString}&per_page=${per_page}`;
  }
  if (sort) {
    queryString = `${queryString}&sort=${sort}`;
  }
  if (q) {
    queryString = `${queryString}&q=${require('querystring').escape(q)}`;
  }

  const url = `https://${process.env.DOMAIN_OAUTH2}/api/v2/users?include_totals=true&${queryString}`;

  const options = {
    method: 'GET',
    url,
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + access_token,
    },
  };

  log(`Calling ${options.method} ${url} with:`, options);

  let response;
  try {
    response = await promise_throttle_auth0_management_api.add(axios.bind(this, options));
  } catch (err) {
    err.status = 504;
    throw err;
  }

  log(`Response from ${options.method} ${url}:`, response.data);

  response = {
    users: response.data.users,
    per_page: per_page,
    page: page,
    totalResultCount: response.data.total,
  };

  return response;
};

exports.delete_user = async function delete_user(user_id_auth0, access_token) {
  const url = `https://${process.env.DOMAIN_OAUTH2}/api/v2/users/${user_id_auth0}`;

  const options = {
    method: 'DELETE',
    url,
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + access_token,
    },
  };

  log(`Calling ${options.method} ${url} with:`, options);

  let response;
  try {
    response = await promise_throttle_auth0_management_api.add(axios.bind(this, options));
  } catch (err) {
    err.status = 504;
    throw err;
  }

  log(`Response from ${options.method} ${url}:`, response.data);

  return response.data;
};

exports.patch_user = async function patch_user(user_id_auth0, patched_user, access_token) {
  const url = `https://${process.env.DOMAIN_OAUTH2}/api/v2/users/${user_id_auth0}`;

  const options = {
    method: 'PATCH',
    url,
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
    data: JSON.stringify(patched_user),
  };

  log(`Calling ${options.method} ${url} with:`, options);

  let response;
  try {
    response = await promise_throttle_auth0_management_api.add(axios.bind(this, options));
  } catch (err) {
    err.status = 504;
    throw err;
  }

  log(`Response from ${options.method} ${url}:`, response.data);

  return response.data;
};

