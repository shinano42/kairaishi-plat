const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const TwitterStrategy = require('passport-twitter');
const FacebookStrategy = require('passport-facebook');
const keys = require('./keys')
const db = require('../models/index')

passport.serializeUser((user, done) => {
    console.log('user')
    console.log(user)
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    db.User.findOne({ where: { id: id} }).then((user) => {
        done(null, user);
    });
});

// provider Google
passport.use(new GoogleStrategy({
    // options for the google strategy
    callbackURL: '/auth/google/redirect',
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    // passport cb function
    console.log('passport cb function fired.');
    // check if user already exists in db
    db.User
    .findOne({ where: { socialId: profile.id, provider: profile.provider } })
    .then((currentUser) => {
        if (currentUser) {
            // already have the user
            console.log('user is ' + currentUser)
            done(null,  currentUser);
        } else {
            // if not, create user in db
            var email = null;
            var username = null;
            if (typeof profile.emails !== "undefined") {
                email = profile.emails[0].value;
                username = email.split("@")[0];
            }
            console.log(profile);
            db.User.create({
                name: profile.displayName,
                username: username,
                socialId: profile.id,
                email: email,
                provider: profile.provider,
                thumbnail: profile.photos[0].value
            }).then(newUser => {
                console.log("new user created" + newUser);
                done(null, newUser);
                }).catch(err => {
                console.log(err)
            });

        }
    });


    console.log(profile);
}));


//provider Twitter
passport.use(new TwitterStrategy({
    // options for the Twitter strategy
    callbackURL: '/auth/twitter/redirect',
    consumerKey: keys.twitter.apiKey,
    consumerSecret: keys.twitter.apiSecret
}, (accessToken, refreshToken, profile, done) => {
    // passport cb function
    console.log('passport cb function fired.');
    // check if user already exists in db
    db.User
    .findOne({ where: { socialId: profile.id, provider: profile.provider } })
    .then((currentUser) => {
        if (currentUser) {
            // already have the user
            done(null,  currentUser);
        } else {
            // if not, create user in db
            var email = null;
            if (typeof profile.emails !== "undefined") {
                email = profile.emails[0].value;
            }
            
            db.User.create({
                username: profile.username,
                name: profile.displayName,
                socialId: profile.id,
                email: email,
                provider: profile.provider,
                thumbnail: profile.photos[0].value
            }).then(newUser => {
                done(null, newUser);
                }).catch(err => {
                console.log(err)
            });

        }
    });

}));

//provider Facebook
passport.use(new FacebookStrategy({
    // options for the Twitter strategy
    callbackURL: '/auth/facebook/redirect',
    clientID: keys.facebook.appID,
    clientSecret: keys.facebook.appSecret
}, (accessToken, refreshToken, profile, done) => {
    // passport cb function
    console.log('passport cb function fired.');
    // check if user already exists in db
    db.User
    .findOne({ where: { socialId: profile.id, provider: profile.provider } })
    .then((currentUser) => {
        if (currentUser) {
            // already have the user
            console.log('user is ' + currentUser)
            done(null,  currentUser);
        } else {
            // if not, create user in db
            var email = null;
            if (typeof profile.emails !== "undefined") {
                email = profile.emails[0].value;
            }
            
            db.User.create({
                username: profile.displayName,
                socialId: profile.id,
                email: email,
                provider: profile.provider,
                thumbnail: profile.profileUrl
            }).then(newUser => {
                console.log("new user created" + newUser);
                done(null, newUser);
                }).catch(err => {
                console.log(err)
            });

        }
    });
    console.log(profile);

}));