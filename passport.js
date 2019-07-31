const passport = require('passport');

const passportJWT = require("passport-jwt");
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;

const LocalStrategy = require('passport-local').Strategy;
const RefreshTokenStrategy = require('passport-refresh-token').Strategy;

const User = require('./models/User');

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
},
    function (username, password, done) {
        return User
            .query()
            .where('username', username)
            .first()
            .then(usr => {
                if (!usr) {
                    return done(null, false);
                }
                usr.validatePassword(password).then((valid) => {
                    if (!valid) {
                        return done(null, false);
                    }
                    return done(null, JSON.parse(JSON.stringify(usr.clean())));
                });
            })
            .catch((err) => {
                return done(err);
            });
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
},
    function (jwtPayload, done) {
        return User
            .query()
            .findById(jwtPayload.id)
            .then(usr => {
                return done(null, JSON.parse(JSON.stringify(usr)));
            })
            .catch(err => {
                return done(err);
            });
    }
));

passport.use(new RefreshTokenStrategy(
    function(refresh_token, done) {
        return User
            .query()
            .where({ refreshToken: refresh_token })
            .first()
            .then(usr => {
                return done(null, JSON.parse(JSON.stringify(usr.clean())));
            })
            .catch(err => {
                return done(err);
            });
    }
))