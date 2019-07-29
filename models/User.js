const bcrypt = require('bcrypt');
const bookshelf = require('../bookshelf');

var User = bookshelf.Model.extend({
    tableName: 'users',
    initialize: function () {
        this.on('creating', this.encryptPassword);
    },
    hasTimestamps: true,
    encryptPassword: (model, attrs, options) => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(model.attributes.password, 10, (err, hash) => {
                if (err) return reject(err);
                model.set('password', hash);
                resolve(hash);
            });
        });
    },
    validatePassword: function (suppliedPassword) {
        let self = this;
        return new Promise(function (resolve, reject) {
            const hash = self.attributes.password;
            bcrypt.compare(suppliedPassword, hash, (err, res) => {
                if (err) return reject(err);
                return resolve(res);
            });
        });
    }
});

module.exports = User;