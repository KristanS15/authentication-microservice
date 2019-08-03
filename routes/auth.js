const express = require('express');
const router = express.Router();

const passport = require('passport');
const randtoken = require('rand-token');

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
    var { username, email, password } = req.body;

    User
        .query()
        .insertAndFetch({username: username, email: email, password: password})
        .then((user) => {
            const token = new Token(user.clean());
            return res.json({ user: user.clean(), token }) 
        })
        .catch((err) => {
            return errorHandler(err, res);
        })
});

/* POST forgot password */
router.post('/password/forgot', function (req, res, next) {
    var { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: 'No email provided.'
        });
    }

    User
        .query()
        .where('email', email)
        .first()
        .then((user) => {
            if(user) {
                // Generate password reset token
                let password_reset_token = randtoken.uid(256);

                // Generate password reset token expiry (3 hours)
                var expiryDate = new Date();
                expiryDate.setTime(expiryDate.getTime() + (3 * 60 * 60 * 1000))
                expiryDate = expiryDate.toISOString().slice(0, 19).replace('T', ' ');

                // Save password reset token and password reset expiry
                User
                    .query()
                    .patch({
                        password_reset_token: password_reset_token,
                        password_reset_token_expiry: expiryDate
                    })
                    .findById(user.id)
                    .then(() => {
                        // Send reset email
                        res.mailer.send('forgot_password', {
                            to: email,
                            subject: 'Password Reset',
                            password_reset_token: password_reset_token
                        }, function (err) {
                            if (err) {
                                console.log(err);
                                return res.status(200).json({
                                    message: "There was an error sending the email"
                                });
                            }
                            return res.status(200).json({
                                message: "Password reset email sent to " + email
                            }); 
                        });
                    })
                    .catch((err) => {
                        return errorHandler(err, res);
                    });
            } else {
                return res.status(400).json({
                    message: "No account with the email address exists"
                }); 
            }
        })
        .catch((err) => {
            console.log(err);
            return errorHandler(err, res);
        })
});

/* POST check reset token */
router.post('/password/reset_token_check', function (req, res, next) {
    let {password_reset_token} = req.body;

    if (!password_reset_token) {
        return res.status(400).json({
            message: 'No reset token provided.'
        });
    }

    User
        .query()
        .where('password_reset_token', password_reset_token)
        .first()
        .then((user) => {
            if(user) {
                if(user.hasActivePasswordResetToken()) {
                    return res.status(200).json({
                        user: user.clean()
                    });
                } else {
                    return res.status(400).json({
                        message: 'Password reset token expired.'
                    });
                }
            } else {
                return res.status(400).json({
                    message: 'No user with this token found.'
                });
            }
        })
        .catch((err) => {
            return errorHandler(res, err);
        });
});

/* POST reset password */
router.post('/password/reset', function (req, res, next) {
    let {password_reset_token, password} = req.body;

    if (!password_reset_token) {
        return res.status(400).json({
            message: 'No reset token provided.'
        });
    }

    if (!password) {
        return res.status(400).json({
            message: 'No new password provided.'
        });
    }

    var expiryDate = new Date();
    expiryDate = expiryDate.toISOString().slice(0, 19).replace('T', ' ');

    User
        .query()
        .where('password_reset_token', password_reset_token)
        .first()
        .then((user) => {
            if(user) {
                if(user.hasActivePasswordResetToken()) {
                    User
                        .query()
                        .patch({
                            password: password,
                            password_reset_token: "",
                            password_reset_token_expiry: expiryDate
                        })
                        .findById(user.id)
                        .then(() => {
                            return res.status(200).json({
                                message: 'Password updated.'
                            });
                        })
                        .catch((err) => {
                            return errorHandler(res, err);
                        })
                }
            } else {
                return res.status(400).json({
                    message: 'No user found.'
                });
            }
        })
        .catch((err) => {
            return errorHandler(res, err);
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