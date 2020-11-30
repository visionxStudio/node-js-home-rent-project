const express = require('express');
const User = require('../models/admin');
const router = express.Router();
const authController = require('../controllers/auth');
const isAdmin = require('../middleware/isAdmin');


const {
    check,
    body
} = require('express-validator');


router.get('/login', authController.getLogin);

// login routes
router.post('/login',
    [
        body('username'),
        body('password', 'password has to be valid!')
        .isLength({
            min: 6,
            max: 32
        })
        .trim()
    ], authController.postLogin);

router.get('/signup', authController.getSignup)


// signup routes
router.post(
    '/signup', [
        check('email')
        .custom((email, {
            req
        }) => {
            return User.findOne({
                    email: email
                })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('E-mail Already Exists, please pick a different one!');
                    };
                })
        }),
        check('username', 'Username must be Alphanumeric')
        .isAlphanumeric()
        .custom((username, {
            req
        }) => {
            return User.findOne({
                    username: username
                })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Username Already Exists, please pick a different one!');
                    };
                })
        }),
        body('password', 'Please enter a password with at least 6 characters.')
        .isLength({
            min: 6,
            max: 32
        })
        .trim()
        .custom((value, {
            req
        }) => {
            if (value !== req.body.confirmPassword) {
                throw new Error('Passwords have to match!')
            }
            return true;
        })
    ],
    authController.postSignup)


router.get('/logout', isAdmin, authController.getLogout)


module.exports = router;