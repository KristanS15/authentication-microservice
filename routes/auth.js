const express = require('express');
const router = express.Router();

const fs = require('fs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const randtoken = require('rand-token');

const bcrypt = require('bcrypt');

const User = require('../models/User');

/* POST login. */
router.post('/login', function (req, res, next) {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Login failed',
                user: user
            });
        }

        var privateKEY  = fs.readFileSync('./private.key', 'utf8');
        const token = jwt.sign(user, privateKEY, { expiresIn: 20 });

        var refreshToken = randtoken.uid(256);

        User
            .query()
            .patch({ refreshToken: refreshToken })
            .findById(user.id)
            .then()
            .catch((err) => {
                console.log(err);
            })

        return res.json({ user, token, refreshToken }) 
    })(req, res);
});

router.post('/register', function(req, res, next) {
    var { username, password } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return reject(err);
        password = hash;
    });

    User
        .query()
        .insertAndFetch({username: username, password: password})
        .then((user) => {
            var privateKEY  = fs.readFileSync('./private.key', 'utf8');

            user = user.clean();

            const token = jwt.sign(JSON.parse(JSON.stringify(user)), privateKEY, { expiresIn: 20 });

            return res.json({ user, token }) 
        });
});

router.post('/token/refresh', function (req, res, next) {
    passport.authenticate('refresh_token', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Refresh failed',
                user: user
            });
        }

        var privateKEY  = fs.readFileSync('./private.key', 'utf8');
        const token = jwt.sign(user, privateKEY, { expiresIn: 20 });

        return res.json({ user, token }) 
    })(req, res);
});

module.exports = router;