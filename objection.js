const { Model } = require('objection');
const Knex = require('knex');
const knex_connection = require('./knexfile');

const knex = Knex(
    knex_connection.development
);

Model.knex(knex);

module.exports = Model;