const passport = require('passport'),
    moment = require('moment-timezone'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    GoogleStrategy = require('passport-google-oauth20').Strategy,
    userController = require('../controllers/user');

let apiPrepend;
switch (process.env.NODE_ENV) {
    case 'development':
        apiPrepend = 'dev';
        break;
    case 'stage':
        apiPrepend = 'stage';
        break;
    case 'production':
        apiPrepend = 'prod';
        break;
    default:
        apiPrepend = 'dev';
}

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.JWT_SECRET
};

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
    if (!payload.email) return done(new Error('Auth Error'), false);
    //console.log("user Id: ", payload.id);
    userController.findById(payload.id, user => done(null, user), err => done(new Error('User Not Found: Require Auth'), false));
});

const googleLogin = new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.APP_HOST + "/" + apiPrepend + "/auth/google/callback",
        passReqToCallback: true
    },
    (req, accessToken, refreshToken, profile, done) => {
        // Check if the google profile and google profile id exists
        if (profile && profile.id) {
            //console.log("profile is " + JSON.stringify(profile));
            let googleUser = {
                first_name: profile._json.given_name || '',
                last_name: profile._json.family_name || '',
                email_id: profile._json.email,
                email_verified: profile._json.email_verified
            };
            //console.log("Google user is ", JSON.stringify(googleUser));
            userController.findOrCreate(googleUser, userResponse => {
                //console.log("Received response", JSON.stringify(userResponse));
                done(null, userResponse);
            });
        }
    }
);

passport.serializeUser(function (user, done) {
    //console.log("Serialize user is: ", JSON.stringify(user));
    done(null, user.data.user.id);
});

passport.deserializeUser(function (id, done) {
    userController.findById(id, user => {
        if (user !== null) {
            done(null, user.id);
        }
        else done({error: 'Passport unable to deserialize user from session'});
    });
});

passport.use(jwtLogin);
passport.use(googleLogin);
