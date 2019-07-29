const passport = require('passport');
const passportJWT = require("passport-jwt");

const ExtractJWT = passportJWT.ExtractJwt;

const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;

const User = require('./models/User');

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
},
    function (username, password, done) {
        return User
            .forge({ username: username })
            .fetch()
            .then((usr) => {
                if (!usr) {
                    return done(null, false);
                }
                usr.validatePassword(password).then((valid) => {
                    if (!valid) {
                        return done(null, false);
                    }
                    return done(null, JSON.parse(JSON.stringify(usr)));
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
        //find the user in db if needed
        return User
            .where({ id: jwtPayload.id })
            .fetch()
            .then(usr => {
                return done(null, JSON.parse(JSON.stringify(usr)));
            })
            .catch(err => {
                return done(err);
            });
    }
));