var express = require('express');
var bodyParser = require('body-parser');

var user = require('./routes/user');
var auth = require('./routes/auth');

const passport = require('passport');

require('./passport');

const app = express();
const port = 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/user', passport.authenticate('jwt', { session: false }), user);
app.use('/auth', auth);

app.listen(port, () => console.log(`Authentication Microservice running on port ${port}!`));