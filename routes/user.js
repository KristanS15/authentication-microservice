var express = require('express');
var router = express.Router();

const User = require('../models/User');

const errorHandler = require('../errors');

/* GET user profile. */
router.get('/profile', function (req, res, next) {
    res.send(req.user);
});

/* POST user update */
router.post('/profile/update', function (req, res, next) {
    let { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: 'Incorrect details provided.'
        });
    }

    User
        .query()
        .patchAndFetchById(req.user.id, {
            username: username,
            email: email,
            password: password
        })
        .then((user) => {
            return res.status(200).json({
                message: 'Profile updated.'
            });
        })
        .catch((err) => {
            return errorHandler(err, res);
        })
});

module.exports = router;