const bcrypt = require('bcrypt');
const Model = require('../objection');

class User extends Model {
    static get tableName() {
        return 'user';
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["username", "email", "password"],
            properties: {
                id: {type: "integer"},
                username: {type: "string"},
                email: {type: "string", format: "email"},
                password: {type: "string", minLength: 6},
                refresh_token: {type: "string"},
                refresh_token_expiry: {type: "string"},
                password_reset_token: {type: "string"},
                password_reset_token_expiry: {type: "string"}
            }
        }
    }

    async $beforeInsert() {
        this.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        this.password = await bcrypt.hash(this.password, 12);
    }

    async $beforeUpdate() {
        this.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        if(this.password) {
            this.password = await bcrypt.hash(this.password, 12);
        }
    }

    validatePassword(suppliedPassword) {
        let self = this;
        return new Promise(function (resolve, reject) {
            const hash = self.password;
            bcrypt.compare(suppliedPassword, hash, (err, res) => {
                if (err) return reject(err);
                return resolve(res);
            });
        });
    }

    hasActiveRefreshToken() {
        return this.refresh_token_expiry > new Date();
    }

    hasActivePasswordResetToken() {
        return this.password_reset_token_expiry > new Date();
    }

    clean() {
        let self = this;
        let viewable_keys = ["id", "username"];
        
        let clean_user = {};
        Object.keys(self).forEach(e => {
            if(viewable_keys.includes(e)) {
                clean_user[e] = self[e];
            }
        });

        return JSON.parse(JSON.stringify(clean_user));
    }
}

module.exports = User;