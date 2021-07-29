'use strict';

// ########################################
// ########################################


const DEVELOPMENT = {
  DATABASE: {
    client: 'mysql',
    connection: {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    },
  },

  PORT: 5000,
};

const PRODUCTION = {
  DATABASE: {
    client: 'mysql',
    connection: {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    },
  },

  PORT: 443,
};

// ########################################
// ########################################

switch (process.env.NODE_ENV) {
  case 'DEVELOPMENT':
    module.exports = DEVELOPMENT;
    break;
  case 'PRODUCTION':
    module.exports = PRODUCTION;
    break;

  default:
    throw new Error('Please specify environment variable \'NODE_ENV\' out of {\'DEVELOPMENT\', \'PRODUCTION\'}.');
}

// ########################################
// ########################################
