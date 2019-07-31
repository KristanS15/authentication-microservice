const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const passport = require('passport');
const randtoken = require('rand-token');

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

        req.login(user, { session: false }, (err) => {
            if (err) {
                res.send(err);
            }

            const token = jwt.sign(user, 'your_jwt_secret', { expiresIn: 20 });

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
        });
    })(req, res);

});

router.post('/token/refresh', function (req, res, next) {

    passport.authenticate('refresh_token', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Refresh failed',
                user: user
            });
        }

        const token = jwt.sign(user, 'your_jwt_secret', { expiresIn: 20 });

        return res.json({ user, token }) 
    })(req, res);

});

module.exports = router;