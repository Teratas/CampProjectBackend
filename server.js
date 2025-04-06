const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const FacebookStrategy = require('passport-facebook').Strategy; // ✅ Fixed spelling
const cors = require('cors');
dotenv.config({ path: './config/config.env' });

connectDB();

//route files
const app = express();
const auth = require('./routes/auth');
const cloud = require('./routes/cloud');
const campgrounds = require('./routes/campgrounds');
const bookings = require('./routes/bookings');
const userRouter = require('./routes/user')

app.use(cors());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cookieParser());

//mount routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/cloud', cloud);
app.use('/api/v1/campgrounds', campgrounds);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/users', userRouter)


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    profileFields: ['id', 'displayName', 'email'],
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
    console.log('Error: ', err.message);
    server.close(() => process.exit(1));
});
