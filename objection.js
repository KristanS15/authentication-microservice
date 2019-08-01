const { Model } = require('objection');
const Knex = require('knex');
const knex_connection = require('./knexfile');

const { DBErrors } = require('objection-db-errors');

const knex = Knex(
    knex_connection.development
);

class BaseModel extends DBErrors(Model) {

}

BaseModel.knex(knex);

module.exports = BaseModel;