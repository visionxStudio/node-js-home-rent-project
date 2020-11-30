const User = require('../models/admin');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const {
    validationResult
} = require('express-validator');

// setting up the email service from the sendgrip
const sendgrip = require('@sendgrid/mail');
sendgrip.setApiKey(process.env.SENDGRID_API_KEY);

exports.getLogin = (req, res, next ) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login to your account',
        path: '/login',
        errorMessage: message,
        result: '',
        oldInput: {
            username: '',
            password: ''
        },
        validationErrors: []
    })
};

exports.postLogin = (req, res, next ) => {
    const username = req.body.username;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login to your account',
            path: '/login',
            errorMessage: errors.array()[0].msg,
            result: 'danger',
            oldInput: {
                username: username,
                password: password
            },
            validationErrors: errors.array()
        });
    }

    User.findOne({
            username: username
        })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    pageTitle: 'Login to your account',
                    path: '/login',
                    errorMessage: 'Invalid username or Password',
                    result: 'danger',
                    oldInput: {
                        username: username,
                        password: password
                    },
                    validationErrors: errors.array()
                });
            }

            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (!doMatch) {
                        return res.status(422).render('auth/login', {
                            pageTitle: 'Login to your account',
                            path: '/login',
                            errorMessage: 'Invalid username or Password',
                            result: 'danger',
                            oldInput: {
                                username: username,
                                password: password
                            },
                            validationErrors: errors.array()
                        });
                    } else {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log('login Success!');
                            res.redirect('/');
                        });
                    }
                }).catch(err => {
                    console.log(err);
                    res.redirect('/login');
                })
        })
        .catch();
};



exports.getSignup = (req, res, next ) => {
    res.render('auth/signup', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false,
        errorMessage: false,
        oldInput: {
            username: '',
            email: '',
            password: '',
        },
    });
};

exports.postSignup = (req, res, next ) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    // checking for the possible errors
    const errors = validationResult(req); // passing the req argument because routes errors are stored in req
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Sign Up now for Free!',
            path: '/signup',
            errorMessage: errors.array()[0].msg,
            result: 'danger',
            oldInput: {
                username: username,
                email: email,
                password: password,
            },
            validationErrors: errors.array()
        })
    }

    // if the above code success then only the new user will be created!
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                username: username,
                email: email,
                password: hashedPassword,
                
            });
            return user.save()
                .then(result => {
                    const msg = {
                        to: email,
                        from: 'manish.rajak2055@gmail.com',
                        subject: 'SignUp Successful!',
                        html: '<h1>You successfully signed up!</h1>',
                    };
                    return sendgrip.send(msg)
                        .then(success => {
                            if (success) {
                                return res.status(200).render('auth/signup', {
                                    pageTitle: 'Sign Up now for Free!',
                                    path: '/signup',
                                    errorMessage: 'You have Successfully signed up!.',
                                    result: 'success',
                                    oldInput: {
                                        username: '',
                                        email: '',
                                        password: '',
                                    },
                                    validationErrors: errors.array()
                                })
                            } else {
                                return res.status(422).render('auth/signup', {
                                    pageTitle: 'Sign Up now for Free!',
                                    path: '/signup',
                                    errorMessage: 'opps!! Something Went Wrong!! Try Again Later!',
                                    result: 'danger',
                                    oldInput: {
                                        username: username,
                                        email: email,
                                        password: password,
                                    },
                                    validationErrors: errors.array()
                                })
                            }
                        })
                        .catch(err => {
                            throw new Error('Email cannot be sent')
                        })
                })
                .catch(err => {
                    console.log(err);
                })
        })
        .catch()
};


exports.getLogout = (req, res, next) => {
    req.session.destroy(err => {
        if(err) {
            console.log(err);
        }
        res.redirect('/');
    });
};
