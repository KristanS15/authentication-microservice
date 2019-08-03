require('dotenv').config()

var express = require('express');
var bodyParser = require('body-parser');

var user = require('./routes/user');
var auth = require('./routes/auth');

const passport = require('passport');

const mailer = require('express-mailer');

require('./passport');

// Create express app and port
const app = express();
const port = process.env.PORT || 3000

// Mail config
mailer.extend(app, {
    from: process.env.MAIL_FROM,
    host: process.env.MAIL_HOST, // hostname
    secureConnection: process.env.MAIL_SECURE || true, // use SSL
    port: process.env.MAIL_PORT || 465, // port for secure SMTP
    transportMethod: process.env.MAIL_TRANSPORT_METHOD || 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// App config
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.locals.env = process.env;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use('/user', passport.authenticate('jwt', { session: false }), user);
app.use('/auth', auth);

// Listener
app.listen(port, () => console.log(`Authentication Microservice running on port ${port}!`));