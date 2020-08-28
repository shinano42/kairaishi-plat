const express = require('express')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const env = process.env.NODE_ENV ||  'development';
const config = require(__dirname +  '/config/config.json')[env]
const authRouters = require('./routes/auth-routes'); 
const profileRouters = require('./routes/profile-routes'); 
const makerRouters = require('./routes/maker-routes');
const figureRouters = require('./routes/figure-routes');
const apiRouters = require('./routes/api-routes');
const searchRouters = require('./routes/search-routes');
const passportSetup = require('./config/passport-setup')
const db = require('./models/index');
const cookieSession = require('cookie-session');
const flash = require('connect-flash')
const keys = require('./config/keys')
const passport = require('passport');
const path = require('path');


const app = express()
db.sequelize.authenticate().then(() => {
    console.log('DB connected');
})
.catch(err=> {
    console.log('DB connected failed')
});



// Set port 
const port = 3000
// Register ExpressHandlebars instance-level helpers
const hbs = exphbs.create({ helpers: {} })
// define handlebars using
// tell express that all templates ahead will be handlebars 
app.set('view engine', 'ejs')
app.use("/static", express.static(__dirname + '/static'));
app.use("/statics", express.static(__dirname + '/dist'));
app.use("/", express.static(__dirname + '/static/cert'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(cookieSession({
    maxAge: 1 * 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));

// initailize passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouters);
app.use('/profile', profileRouters);
app.use('/maker', makerRouters);
app.use('/figures', figureRouters);
app.use('/api', apiRouters);
app.use('/search', searchRouters);



app.get('/', (req, res) => {
    res.render("home", { user: req.user});
})

app.get('/search', (req, res) => {
    res.render("home", { user: req.user});
})

app.listen(port, () => {
    console.log(`Express is listening on http://localhost:${port}`)
});