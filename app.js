// importing the required library
const express = require('express');
const chalk = require('chalk');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const csrf = require('csurf');
const flash = require('connect-flash');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const ms = require('ms');

const User = require('./models/admin');

// Defining the constants
const MONGODB_URI = 'mongodb+srv://manish:iamvisionx123@test-42wxh.mongodb.net/home';

const app = express();

// Initializing the store for session 
const store = new MongoDBStore({
    uri: MONGODB_URI,
    store: 'collection'
});

const csrfProtection = csrf();


const fileStorage = multer.diskStorage({
    destination: function(req, file, cb ) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString()+ '-' + file.originalname);  
    }
})

const fileFilter = (req, file, cb) => {
    if((file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}


app.set('view engine', 'ejs');
app.set('views', 'views');

// Routes
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
const authRoutes = require('./routes/auth');


app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
  }).single('image')); // storing the single image


// defining the static path for css and js
app.use(express.static(path.join(__dirname, 'public')));

/*
Here we are specifying that the /image is for the url and images is for directory
*/

app.use('/images', express.static(path.join(__dirname, 'images')));


app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: ms('14 days')
    },
}));

app.use(csrfProtection);

app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        if (!user) {
          return next();
        }
        req.user = user;
        next();
      })
      .catch(err => {
        throw new Error(err);
      });
  });

// storing isAuthenticated and csrfToken in locals and use this before the routes
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
  });

// using the routes
app.use('/admin', adminRoutes);
app.use(clientRoutes);
app.use(authRoutes);

app.use((req, res, next ) => {
    const url = req.url;
    const hostname = req.hostname;
    res.status(400).render('404', {
        pageTitle: 'Error!!',
        path: 'error',
        result: 'danger',
        errorMessage: `We are sorry but the page you requested was not found`,
    });
});

// connecting to the database 
mongoose.connect(
        MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, err => {
            if (err) {
                console.log(chalk.inverse.red(err));
            } else {
                console.log(chalk.greenBright.inverse.bold('We are connected!'))
            }
        }
    )
    .then(() => {
        console.log('Listening to localhost:3000');
        app.listen(3000);
    })
    .catch(err => {
        console.log('error at mongoose connect!');
        console.log(err);
    });