// Update with your config settings.

require('dotenv').config()

module.exports = {
	client: process.env.DB_CLIENT,
	connection: {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
		charset: process.env.DB_CHARSET || 'utf8'
	},
	migrations: {
		tableName: 'knex_migrations'
	}
};
