const bcrypt = require('bcrypt');
const Model = require('../objection');

class User extends Model {
    static get tableName() {
        return 'users';
    }

    $beforeInsert() {
        this.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    $beforeUpdate() {
        this.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
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

    clean() {
        let self = this;
        let viewable_keys = ["id", "username"];
        let clean_user = {};

        Object.keys(self).forEach(e => {
            if(viewable_keys.includes(e)) {
                clean_user[e] = self[e];
            }
        });

        return clean_user;
    }
}

module.exports = User;