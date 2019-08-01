const express = require('express');
const router = express.Router();

const passport = require('passport');

const User = require('../models/User');
const Token = require('../models/Token');

const errorHandler = require('../errors');

/* POST login */
router.post('/login', function (req, res) {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Login failed',
                user: user
            });
        }

        const token = new Token(user);
        return res.json({ user, token }) 
    })(req, res);
});

/* POST register new user */
router.post('/register', function(req, res, next) {
    var { username, password } = req.body;

    User
        .query()
        .insertAndFetch({username: username, password: password})
        .then((user) => {
            const token = new Token(user.clean());
            return res.json({ user: user.clean(), token }) 
        })
        .catch((err) => {
            return errorHandler(err, res);
        })
});

/* POST refresh token */
router.post('/token/refresh', function (req, res, next) {
    passport.authenticate('refresh_token', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Refresh failed',
                user: user
            });
        }

        const token = new Token(user);
        return res.json({ user, token }) 
    })(req, res);
});

module.exports = router;