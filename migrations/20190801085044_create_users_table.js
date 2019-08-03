
exports.up = function(knex) {
    return knex.schema
        .createTable('user', function (table) {
            table.increments('id');
            table.string('username').unique().notNullable();
            table.string('email').unique().notNullable();
            table.string('password').notNullable();
            table.string('refresh_token', 256);
            table.timestamp('refresh_token_expiry');
            table.string('password_reset_token', 256);
            table.timestamp('password_reset_token_expiry');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable("user");
};
