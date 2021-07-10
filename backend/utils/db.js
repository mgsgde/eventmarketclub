const config = require('../config');
const knex = require('knex')(config.DATABASE);

exports.setup = async () => {
  if (!(await knex.schema.hasTable('events'))) {
    await knex.schema.createTable('events', function(table) {
      table.increments('event_id').primary();
      table.string('host_user_id_auth0').notNullable();
      table.integer('start').notNullable();
      table.integer('end');
      table.string('city').notNullable();
      table.integer('free_places').notNullable();
      table.integer('total_places').notNullable();
      table.enu('type', ['WORKSHOP', 'DAYGAME', 'NIGHTGAME', 'MEETUP']).notNullable();
      table.text('description', 'longtext').notNullable();
      table.string('whatsapp_group_link').notNullable();
      table.string('meeting_point').notNullable();
    });
  }

  if (!(await knex.schema.hasTable('guests'))) {
    await knex.schema.createTable('guests', function(table) {
      table.primary(['event_id', 'guest_user_id_auth0']);
      table.foreign('event_id').references('event_id').inTable('events');
      table.integer('event_id').unsigned().notNullable();
      table.string('guest_user_id_auth0').notNullable();
      table.enu('status', ['ACCEPTED', 'PENDING', 'REJECTED']).notNullable();
    });
  }

  if (!(await knex.schema.hasTable('ratings'))) {
    await knex.schema.createTable('ratings', function(table) {
      table.primary(['reviewer_user_id_auth0', 'reviewee_user_id_auth0', 'event_id']);
      table.string('reviewer_user_id_auth0').notNullable();
      table.string('reviewee_user_id_auth0').notNullable();
      table.integer('event_id').unsigned().notNullable();
      table.integer('rating').notNullable();
      table.text('message');
    });
  }

  if (!(await knex.schema.hasTable('likes'))) {
    await knex.schema.createTable('likes', function(table) {
      table.increments('id').primary();
      table.boolean('like');
      table.integer('unix_time_in_seconds');
    });
  }

  if (!(await knex.schema.hasTable('users'))) {
    await knex.schema.createTable('users', function(table) {
      table.string('user_id_auth0').primary();
      table.string('email_auth0').notNullable();
      table.string('nickname_auth0').notNullable();
      table.integer('rating_sum').defaultTo(0);
      table.integer('rating_count').defaultTo(0);
    });
  }
};

exports.delete = async () => {
  try {
    await knex.schema.dropTableIfExists('guests');
    await knex.schema.dropTableIfExists('ratings');
    await knex.schema.dropTableIfExists('events');
    await knex.schema.dropTableIfExists('likes');
    await knex.schema.dropTableIfExists('users');
  } catch ( err ) {
    console.info(err);
  }
};
