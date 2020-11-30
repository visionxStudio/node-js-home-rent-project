const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const isAdmin = require('../middleware/isAdmin');
const {
    check,
    body
} = require('express-validator');


router.get('/add-client', isAdmin, adminController.getAddClient);

router.post('/add-client', [
    body('firstname')
    .trim()
    .custom((firstname, {
        req
    }) => {
        if (firstname === '' || firstname.length <= 2) {
            throw new Error('Firstname must have at least three characters');
        };
        return true;
    }),
    body('lastname', 'lastname should not contain numbers and others special symbols.')
    .trim()
    .custom((lastname, {
        req
    }) => {
        if (lastname === '' || lastname.length <= 2) {
            throw new Error('lastname must have at least three characters');
        };
        return true;
    }),
    body('address', 'Address should not contain special symbols!')
    .isAlphanumeric()
    .custom((address, {
        req
    }) => {
        if (address === '') {
            throw new Error('Address cannot be empty');
        } else if (address.length <= 2) {
            throw new Error('Address must be at least 3 characters long.');
        }
        return true;
    }),
], isAdmin, adminController.postAddClient);

module.exports = router;