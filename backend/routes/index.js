/* eslint no-invalid-this: "off"*/
const jwksRsa = require('jwks-rsa');
const jwt = require('express-jwt');
const config = require('../config');
const knex = require('knex')(config.DATABASE);
const rateLimit = require('express-rate-limit');
const users_auth0 = require('../utils/users_auth0');
const user_management_api_id = `https://${process.env.DOMAIN_OAUTH2}/api/v2/`;

module.exports = function(app) {
  app.get('/api/hosts/:host_user_id_auth0/events', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {host_user_id_auth0} = request.params;
      const {page, per_page, search_query} = request.query;

      if (!authenticate(host_user_id_auth0, request)) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      const attributes = [
        'events.event_id',
        'host_user_id_auth0',
        knex.raw(`FROM_UNIXTIME(start,'%Y-%m-%dT%TZ') as start`),
        knex.raw(`FROM_UNIXTIME(end,'%Y-%m-%dT%TZ') as end`),
        'city',
        'free_places',
        'total_places',
        'type',
        'description',
        'whatsapp_group_link',
        'meeting_point',
        'nickname_auth0 as host_nickname_auth0',
        'email_auth0 as host_email_auth0',
        'rating_sum as host_rating_sum',
        'rating_count as host_rating_count',
      ];

      const query = knex.queryBuilder();

      query.where('host_user_id_auth0', host_user_id_auth0).from('events').innerJoin('users', 'host_user_id_auth0', 'user_id_auth0');

      if (search_query) {
        // todo
      }

      query.select(...attributes).orderBy('start', 'desc');

      const result = {
        items: [],
        page: page,
        per_page: per_page,
        total_number_of_items: 0,
      };

      const offset = Math.max((per_page * page) - per_page, 0);

      result.items = await query.limit(per_page).offset(offset);
      result.total_number_of_items = (await knex.count('*', {as: 'count'}).from(query.as('resulting_table')))[0].count;

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/hosts/:host_user_id_auth0/events/:event_id', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {host_user_id_auth0, event_id} = request.params;

      if (!authenticate(host_user_id_auth0, request)) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      const attributes = [
        'events.event_id',
        'host_user_id_auth0',
        knex.raw(`FROM_UNIXTIME(start,'%Y-%m-%dT%TZ') as start`),
        knex.raw(`FROM_UNIXTIME(end,'%Y-%m-%dT%TZ') as end`),
        'city',
        'free_places',
        'total_places',
        'type',
        'description',
        'whatsapp_group_link',
        'meeting_point',
        'nickname_auth0 as host_nickname_auth0',
        'email_auth0 as host_email_auth0',
        'rating_sum as host_rating_sum',
        'rating_count as host_rating_count',
      ];

      const query = knex.queryBuilder();

      query.select(...attributes).where('host_user_id_auth0', host_user_id_auth0).andWhere('event_id', event_id).from('events').innerJoin('users', 'host_user_id_auth0', 'user_id_auth0');

      const result = (await query)[0];

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/hosts/:host_user_id_auth0/events', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {host_user_id_auth0} = request.params;
      let {city, start, end, total_places, description, type, whatsapp_group_link, meeting_point} = request.body;

      if (!authenticate(host_user_id_auth0, request)) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      start = Math.round(new Date(start).getTime()/1000);
      end = Math.round(new Date(end).getTime()/1000);

      if (start <= Date.now()/1000 || end <= Date.now()/1000) {
        const error = new Error();
        error.message = 'Event must be in the future.';
        error.status = 400;
        throw error;
      }

      if (start > end) {
        const error = new Error();
        error.message = 'Event cannot end before it starts.';
        error.status = 400;
        throw error;
      }

      const new_event = {
        host_user_id_auth0,
        start,
        end,
        city: city.toLowerCase(),
        free_places: total_places,
        total_places,
        type,
        description,
        whatsapp_group_link,
        meeting_point,
      };

      const event_id = (await knex('events').insert(new_event, ['event_id']))[0];

      const result = (await knex('events').innerJoin('users', 'host_user_id_auth0', 'user_id_auth0').where('event_id', event_id).select(
          'event_id',
          'host_user_id_auth0',
          knex.raw(`FROM_UNIXTIME(start,'%Y-%m-%dT%TZ') as start`),
          knex.raw(`FROM_UNIXTIME(end,'%Y-%m-%dT%TZ') as end`),
          'city',
          'free_places',
          'total_places',
          'type',
          'description',
          'whatsapp_group_link',
          'meeting_point',
          'nickname_auth0 as host_nickname_auth0',
          'email_auth0 as host_email_auth0',
          'rating_sum as host_rating_sum',
          'rating_count as host_rating_count',
      ))[0];

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/hosts/:host_user_id_auth0/events/:event_id', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {event_id, host_user_id_auth0} = request.params;
      const patch = request.body;

      if (!authenticate(host_user_id_auth0, request)) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      if (patch?.start) {
        patch.start = Math.round(new Date(patch.start).getTime()/1000);
      }
      if (patch?.end) {
        patch.end = Math.round(new Date(patch.end).getTime()/1000);
      }

      await knex('events').where('event_id', event_id).update(patch);

      const result = (await knex('events').innerJoin('users', 'host_user_id_auth0', 'user_id_auth0').where('event_id', event_id).select(
          'event_id',
          'host_user_id_auth0',
          knex.raw(`FROM_UNIXTIME(start,'%Y-%m-%dT%TZ') as start`),
          knex.raw(`FROM_UNIXTIME(end,'%Y-%m-%dT%TZ') as end`),
          'city',
          'free_places',
          'total_places',
          'type',
          'description',
          'whatsapp_group_link',
          'meeting_point',
          'nickname_auth0 as host_nickname_auth0',
          'email_auth0 as host_email_auth0',
          'rating_sum as host_rating_sum',
          'rating_count as host_rating_count',
      ))[0];

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/hosts/:host_user_id_auth0/events/:event_id', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {event_id, host_user_id_auth0} = request.params;

      if (!authenticate(host_user_id_auth0, request)) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      if (!(await is_event_in_past(event_id)) || process.env.NODE_ENV !== 'DEVELOPMENT') {
        await rate_negative(host_user_id_auth0, event_id);
      }

      await knex.transaction(async (trx) => {
        await trx('guests').where({event_id}).delete();
        await trx('events').where({event_id, host_user_id_auth0}).delete();
      });


      response.json({
        status: 200,
        message: 'Successfully deleted event.',
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/hosts/:reviewer_user_id_auth0/guests/:reviewee_user_id_auth0/ratings', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {reviewer_user_id_auth0, reviewee_user_id_auth0} = request.params;
      const {rating, event_id} = request.body;

      if (!authenticate(reviewer_user_id_auth0, request)) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      if (!(await is_host_of_event(reviewer_user_id_auth0, event_id))) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      if (!(await is_guest_of_event(reviewee_user_id_auth0, event_id))) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      if (!(await is_event_in_past(event_id)) && process.env.NODE_ENV !== 'DEVELOPMENT') {
        const error = new Error();
        error.message = 'Event has not taken place yet.';
        error.status = 403;
        throw error;
      }

      if (await rating_exists(reviewer_user_id_auth0, reviewee_user_id_auth0, event_id)) {
        const error = new Error();
        error.message = 'You have already posted a rating.';
        error.status = 400;
        throw error;
      }

      const new_rating = {
        event_id,
        reviewer_user_id_auth0,
        reviewee_user_id_auth0,
        rating,
      };

      await knex('ratings').insert(new_rating);

      const reviewee_user = (await knex('users').where('user_id_auth0', reviewee_user_id_auth0).select('rating_sum', 'rating_count'))[0];

      reviewee_user.rating_sum = reviewee_user.rating_sum + rating;
      reviewee_user.rating_count = reviewee_user.rating_count + 1;

      await knex('users').where('user_id_auth0', reviewee_user_id_auth0).update({...reviewee_user});

      const result = (await knex('ratings').where({
        reviewer_user_id_auth0,
        reviewee_user_id_auth0,
        event_id,
      }).select('*'))[0];

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  // ########################################
  // ########################################

  app.get('/api/guests/:guest_user_id_auth0/events', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {guest_user_id_auth0} = request.params;
      const {page, per_page} = request.query;

      if (!authenticate(guest_user_id_auth0, request)) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      const attributes = [
        'events.event_id',
        'host_user_id_auth0',
        knex.raw(`FROM_UNIXTIME(start,'%Y-%m-%dT%TZ') as start`),
        knex.raw(`FROM_UNIXTIME(end,'%Y-%m-%dT%TZ') as end`),
        'city',
        'free_places',
        'total_places',
        'type',
        'description',
        'status',
        'nickname_auth0 as host_nickname_auth0',
        'email_auth0 as host_email_auth0',
        'rating_sum as host_rating_sum',
        'rating_count as host_rating_count',
      ];

      const query = knex.queryBuilder();

      query.from('guests').where('guest_user_id_auth0', guest_user_id_auth0).innerJoin('events', 'guests.event_id', 'events.event_id').innerJoin('users', 'host_user_id_auth0', 'user_id_auth0');

      query.select(...attributes).orderBy('start', 'desc');

      const result = {
        items: [],
        page: page,
        per_page: per_page,
        total_number_of_items: 0,
      };

      const offset = Math.max((per_page * page) - per_page, 0);

      result.items = await query.limit(per_page).offset(offset);
      result.total_number_of_items = (await knex.count('*', {as: 'count'}).from(query.as('resulting_table')))[0].count;

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/guests/:guest_user_id_auth0/events/:event_id', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {guest_user_id_auth0, event_id} = request.params;

      if (!authenticate(guest_user_id_auth0, request)) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      const attributes = [
        'events.event_id',
        'host_user_id_auth0',
        knex.raw(`FROM_UNIXTIME(start,'%Y-%m-%dT%TZ') as start`),
        knex.raw(`FROM_UNIXTIME(end,'%Y-%m-%dT%TZ') as end`),
        'city',
        'free_places',
        'total_places',
        'type',
        'description',
        'status',
        'whatsapp_group_link',
        'meeting_point',
        'nickname_auth0 as host_nickname_auth0',
        'email_auth0 as host_email_auth0',
        'rating_sum as host_rating_sum',
        'rating_count as host_rating_count',
      ];

      const query = knex.queryBuilder();

      query.from('guests').innerJoin('events', 'guests.event_id', 'events.event_id').innerJoin('users', 'events.host_user_id_auth0', 'users.user_id_auth0').where('guest_user_id_auth0', guest_user_id_auth0).andWhere('guests.event_id', event_id).select(...attributes);

      const result = (await query)[0];

      if (result?.status != 'ACCEPTED') {
        delete result.host_email_auth0;
        delete result.whatsapp_group_link;
        delete result.meeting_point;
      }

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/guests/:reviewer_user_id_auth0/hosts/:reviewee_user_id_auth0/ratings', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {reviewer_user_id_auth0, reviewee_user_id_auth0} = request.params;
      const {rating, event_id} = request.body;

      if (!authenticate(reviewer_user_id_auth0, request)) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      if (!(await is_host_of_event(reviewee_user_id_auth0, event_id))) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      if (!(await is_guest_of_event(reviewer_user_id_auth0, event_id))) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      if (!(await is_event_in_past(event_id)) && process.env.NODE_ENV !== 'DEVELOPMENT') {
        const error = new Error();
        error.message = 'Event has not taken place yet.';
        error.status = 403;
        throw error;
      }

      if (await rating_exists(reviewer_user_id_auth0, reviewee_user_id_auth0, event_id)) {
        const error = new Error();
        error.message = 'You have already posted a rating.';
        error.status = 400;
        throw error;
      }

      if (await rating_exists(reviewer_user_id_auth0, reviewee_user_id_auth0, event_id)) {
        const error = new Error();
        error.message = 'You have already posted a rating.';
        error.status = 400;
        throw error;
      }

      const new_rating = {
        event_id,
        reviewer_user_id_auth0,
        reviewee_user_id_auth0,
        rating,
      };

      await knex('ratings').insert(new_rating);

      const reviewee_user = (await knex('users').where('user_id_auth0', reviewee_user_id_auth0).select('rating_sum', 'rating_count'))[0];

      reviewee_user.rating_sum = reviewee_user.rating_sum + rating;
      reviewee_user.rating_count = reviewee_user.rating_count + 1;

      await knex('users').where('user_id_auth0', reviewee_user_id_auth0).update({...reviewee_user});

      const result = (await knex('ratings').where({
        reviewer_user_id_auth0,
        reviewee_user_id_auth0,
        event_id,
      }).select('*'))[0];

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  // ########################################
  // ########################################

  app.get('/api/events', save_new_user, async function(request, response, next) {
    try {
      const {page, per_page, search_query} = request.query;

      const attributes = [
        'events.event_id',
        'host_user_id_auth0',
        knex.raw(`FROM_UNIXTIME(start,'%Y-%m-%dT%TZ') as start`),
        knex.raw(`FROM_UNIXTIME(end,'%Y-%m-%dT%TZ') as end`),
        'city',
        'free_places',
        'total_places',
        'type',
        'description',
        'nickname_auth0 as host_nickname_auth0',
        'rating_sum as host_rating_sum',
        'rating_count as host_rating_count',
      ];

      const query = knex.queryBuilder();

      if (search_query) {
        query.where(function() {
          this.where('city', search_query.toLowerCase()).orWhere('type', search_query.toUpperCase()).orWhere('nickname_auth0', search_query.toLowerCase());
        });
      }

      query.select(...attributes).from('events').innerJoin('users', 'host_user_id_auth0', 'user_id_auth0').orderBy('start', 'asc').andWhere('start', '>', Math.round(Date.now()/1000) );

      console.log('query', query.toSQL());

      const result = {
        items: [],
        page: page,
        per_page: per_page,
        total_number_of_items: 0,
      };

      const offset = Math.max((per_page * page) - per_page, 0);

      result.items = await query.limit(per_page).offset(offset);
      result.total_number_of_items = (await knex.count('*', {as: 'count'}).from(query.as('resulting_table')))[0].count;

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/events/:event_id/guests/:guest_user_id_auth0', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {event_id, guest_user_id_auth0} = request.params;

      if (!authenticate(guest_user_id_auth0, request)) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      if (await is_guest_host(event_id, guest_user_id_auth0)) {
        const error = new Error();
        error.message = 'Host cannot join his own event.';
        error.status = 400;
        throw error;
      }

      if (await guest_exists(event_id, guest_user_id_auth0)) {
        const error = new Error();
        error.message = 'Guest has already joined this event.';
        error.status = 400;
        throw error;
      }

      if (await is_fully_booked(event_id)) {
        const error = new Error();
        error.message = 'Fully booked.';
        error.status = 400;
        throw error;
      }

      if (await is_event_in_past(event_id)) {
        const error = new Error();
        error.message = 'Cannot join past event.';
        error.status = 400;
        throw error;
      }

      const new_guest = {
        event_id,
        guest_user_id_auth0,
        status: 'PENDING',
      };

      await knex('guests').insert(new_guest);

      const result = (await knex('guests').innerJoin('users', 'guest_user_id_auth0', 'user_id_auth0').where({
        event_id,
        guest_user_id_auth0,
      }).select(
          'event_id',
          'guest_user_id_auth0',
          'nickname_auth0 as guest_nickname_auth0',
          'email_auth0 as guest_email_auth0',
          'status',
          'rating_sum as guest_rating_sum',
          'rating_count as guest_rating_count',
      ))[0];

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/events/:event_id/guests/:guest_user_id_auth0', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {event_id, guest_user_id_auth0} = request.params;
      const {status} = request.body;

      if (!(await is_host_of_event(request.user.sub, event_id))) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      await knex.transaction(async (trx) => {
        await trx('guests').where({
          event_id,
          guest_user_id_auth0,
        }).update({status});

        const event = (await trx('events').where({event_id}).select())[0];

        const guests = await trx('guests').where({
          event_id,
          status: 'ACCEPTED',
        }).select();

        const free_places = event.total_places - guests.length;

        if (event.free_places != free_places) {
          await trx('events').where({event_id}).update({free_places});
        }
      });

      const result = (await knex('guests').innerJoin('users', 'guest_user_id_auth0', 'user_id_auth0').where({
        event_id,
        guest_user_id_auth0,
      }).select(
          'event_id',
          'guest_user_id_auth0',
          'nickname_auth0 as guest_nickname_auth0',
          'email_auth0 as guest_email_auth0',
          'status',
          'rating_sum as guest_rating_sum',
          'rating_count as guest_rating_count',
      ))[0];

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/events/:event_id/guests', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {event_id} = request.params;
      const {page, per_page, not_rejected} = request.query;

      if (!(await is_host_of_event(request.user.sub, event_id)) && !(await is_guest_of_event(request.user.sub, event_id))) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      const attributes = [
        'event_id',
        'guest_user_id_auth0',
        'nickname_auth0 as guest_nickname_auth0',
        'email_auth0 as guest_email_auth0',
        'status',
        'rating_sum as guest_rating_sum',
        'rating_count as guest_rating_count',
      ];

      const query = knex.queryBuilder();

      if (not_rejected) {
        query.where('status', '!=', 'REJECTED');
      }

      query.select(...attributes).where({event_id}).from('guests').innerJoin('users', 'guest_user_id_auth0', 'user_id_auth0');

      const result = {
        items: [],
        page: page,
        per_page: per_page,
        total_number_of_items: 0,
      };

      const offset = Math.max((per_page * page) - per_page, 0);

      result.items = await query.limit(per_page).offset(offset);
      result.total_number_of_items = (await knex.count('*', {as: 'count'}).from(query.as('resulting_table')))[0].count;

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/events/:event_id/guests/:guest_user_id_auth0', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {event_id, guest_user_id_auth0} = request.params;

      if (!authenticate(guest_user_id_auth0, request)) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      if (!(await is_guest_of_event(guest_user_id_auth0, event_id))) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      if (!(await is_event_in_past(event_id)) || process.env.NODE_ENV !== 'DEVELOPMENT') {
        await rate_negative(guest_user_id_auth0, event_id);
      }

      await knex.transaction(async (trx) => {
        await trx('guests').where({
          event_id,
          guest_user_id_auth0,
        }).delete();

        await trx('events').where({
          event_id,
        }).increment('free_places', 1);
      });

      response.json({
        status: 200,
        message: 'Successfully deleted guest.',
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/users/:user_id_auth0', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {user_id_auth0} = request.params;

      if (!authenticate(user_id_auth0, request)) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      const result = (await knex('users').where({user_id_auth0}).select())[0];

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/users/:user_id_auth0', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {user_id_auth0} = request.params;
      const {email_auth0, nickname_auth0} = request.body;

      if (!authenticate(user_id_auth0, request)) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      await patch_user(user_id_auth0, email_auth0, nickname_auth0);

      const result = (await knex('users').where({user_id_auth0}).select())[0];

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/users/:user_id_auth0', check_access_token(), save_new_user, async function(request, response, next) {
    try {
      const {user_id_auth0} = request.params;

      if (!authenticate(user_id_auth0, request)) {
        const error = new Error();
        error.message = 'Forbidden.';
        error.status = 403;
        throw error;
      }

      await delete_user(user_id_auth0);

      response.json({
        status: 200,
        message: 'Successfully deleted user.',
      });
    } catch (error) {
      next(error);
    }
  });
  // ########################################
  // ########################################

  app.post('/api/likes', post_rating_limiter, async function(request, response, next) {
    const {like} = request.body;
    console.log(1);
    if (like) {
      await knex('likes').insert({
        like: true,
        unix_time_in_seconds: Math.round(Date.now() / 1000),
      });
    } else {
      await knex('likes').insert({
        like: false,
        unix_time_in_seconds: Math.round(Date.now() / 1000),
      });
    }

    const likes = await knex('likes').select('id', 'like', knex.raw('FROM_UNIXTIME(`unix_time_in_seconds`,\'%Y-%m-%dT%TZ\') as datetime'));

    response.json(likes);
  });

  app.get('/api/likes', async function(request, response, next) {
    const likes = await knex('likes').select('id', 'like', knex.raw('FROM_UNIXTIME(`unix_time_in_seconds`,\'%Y-%m-%dT%TZ\') as datetime'));
    response.json(likes);
  });

  app.get('/api/number_of_likes', async function(request, response, next) {
    const number_of_likes = (await knex('likes').where({
      like: true,
    }).count('like as number_of_likes'))[0].number_of_likes;
    const number_of_dislikes = (await knex('likes').where({
      like: false,
    }).count('like as number_of_dislikes'))[0].number_of_dislikes;

    response.json({
      likes: number_of_likes,
      dislikes: number_of_dislikes,
    });
  });
};

// ########################################
// ########################################

const post_rating_limiter = rateLimit({
  windowMs: 15 * 1000,
  max: 1001,
});

// ########################################
// ########################################

function check_access_token() {
  return jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${process.env.DOMAIN_OAUTH2}/.well-known/jwks.json`,
    }),

    // Validate the audience and the issuer.
    audience: process.env.AUDIENCE_OAUTH2,
    issuer: `https://${process.env.DOMAIN_OAUTH2}/`,
    algorithms: ['RS256'],
  });
}

async function save_new_user(request, response, next) {
  try {
    if (!request?.user || !is_user_id(request?.user.sub)) {
      return next();
    }

    if (!(await user_exists(request.user.sub))) {
      await save_user(request.user.sub);
    }
    next();
  } catch (error) {
    next(error);
  }
}

// ########################################
// ########################################

async function user_exists(user_id) {
  const user = (await knex('users').where('user_id_auth0', user_id).select('*'))[0];
  if (user) {
    return true;
  } else {
    return false;
  }
}

async function guest_exists(event_id, guest_user_id_auth0) {
  const guest = (await knex('guests').where({event_id, guest_user_id_auth0}).select('*'))[0];
  if (guest) {
    return true;
  } else {
    return false;
  }
}

async function rating_exists(reviewer_user_id_auth0, reviewee_user_id_auth0, event_id) {
  const guest = (await knex('ratings').where({reviewer_user_id_auth0, reviewee_user_id_auth0, event_id}).select('*'))[0];
  if (guest) {
    return true;
  } else {
    return false;
  }
}


async function is_guest_host(event_id, guest_user_id_auth0) {
  const event = (await knex('events').where({event_id}).select('*'))[0];
  if (guest_user_id_auth0 === event.host_user_id_auth0) {
    return true;
  } else {
    return false;
  }
}

async function save_user(user_id) {
  const access_token = await users_auth0.get_access_token(user_management_api_id);

  const user = (await users_auth0.get_users({
    q: `user_id:"${user_id}"`,
    access_token: access_token,
  })).users[0];

  await knex('users').insert({
    user_id_auth0: user.user_id,
    email_auth0: user.email,
    nickname_auth0: user.nickname,
  });
}

async function delete_user(user_id_auth0) {
  await knex.transaction(async (trx) => {
    await trx('ratings').where({reviewer_user_id_auth0: user_id_auth0}).orWhere({reviewee_user_id_auth0: user_id_auth0}).delete();
    await trx('guests').where({guest_user_id_auth0: user_id_auth0}).delete();
    await trx('events').where({host_user_id_auth0: user_id_auth0}).delete();
    await trx('users').where({user_id_auth0}).delete();
  }).catch((err) => {
    if (err.message.includes('a foreign key constraint fails')) {
      err.status = 400;
      err.message = 'You must first delete all of your events.';
    }
    throw err;
  });

  const access_token = await users_auth0.get_access_token(user_management_api_id);
  await users_auth0.delete_user(user_id_auth0, access_token);
}

async function patch_user(user_id_auth0, email_auth0, nickname_auth0) {
  await patch_user_in_auth0(user_id_auth0, email_auth0, nickname_auth0);
  await patch_user_in_db(user_id_auth0, email_auth0, nickname_auth0);
}

// ########################################
// ########################################

async function patch_user_in_auth0(user_id_auth0, email_auth0, nickname_auth0) {
  const patched_user = {};
  if (email_auth0) {
    patched_user.email = email_auth0;
  }
  if (nickname_auth0) {
    patched_user.nickname = nickname_auth0;
  }
  const access_token = await users_auth0.get_access_token(user_management_api_id);
  await users_auth0.patch_user(user_id_auth0, patched_user, access_token);
}

async function patch_user_in_db(user_id_auth0, email_auth0, nickname_auth0) {
  const patched_user = {};
  if (email_auth0) {
    patched_user.email_auth0 = email_auth0;
  }
  if (nickname_auth0) {
    patched_user.nickname_auth0 = nickname_auth0;
  }

  await knex('users').where({user_id_auth0}).update({...patched_user});
}

function authenticate(user_id, request) {
  // exception for test m2m app
  if (!is_user_id(request.user.sub)) {
    return true;
  }

  return user_id === request.user.sub;
}

async function is_host_of_event(host_user_id_auth0, event_id) {
  if (!is_user_id(host_user_id_auth0)) {
    return true;
  }

  const result = (await knex('events').where({host_user_id_auth0, event_id}).select('*'))[0];
  if (result) {
    return true;
  } else {
    return false;
  }
}

async function is_guest_of_event(guest_user_id_auth0, event_id) {
  const result = (await knex('guests').where({guest_user_id_auth0, event_id}).select('*'))[0];
  if (result) {
    return true;
  } else {
    return false;
  }
}

async function is_event_in_past(event_id) {
  const event = (await knex('events').where({event_id}).select('*'))[0];
  if (event.end < Date.now()/1000) {
    return true;
  } else {
    return false;
  }
}

async function is_fully_booked(event_id) {
  const event = (await knex('events').where({event_id}).select('*'))[0];
  if (event.free_places === 0) {
    return true;
  } else {
    return false;
  }
}

function is_user_id(id) {
  return id.startsWith('auth0|');
}

async function rate_negative(reviewee_user_id_auth0, event_id) {
  const existing_rating = (await knex('ratings').where({
    reviewee_user_id_auth0,
    event_id,
  }).select())[0];

  if (existing_rating) {
    return;
  }

  const rating = 1;

  const new_rating = {
    event_id,
    reviewer_user_id_auth0: 'system',
    reviewee_user_id_auth0,
    rating,
    message: 'Has left or deleted event before it has started.',
  };

  await knex('ratings').insert(new_rating);

  const reviewee_user = (await knex('users').where('user_id_auth0', reviewee_user_id_auth0).select('rating_sum', 'rating_count'))[0];

  reviewee_user.rating_sum = reviewee_user.rating_sum + rating;
  reviewee_user.rating_count = reviewee_user.rating_count + 1;

  await knex('users').where('user_id_auth0', reviewee_user_id_auth0).update({...reviewee_user});
}

