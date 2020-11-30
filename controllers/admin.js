const Client = require('../models/client');
const {
    validationResult
} = require('express-validator');

exports.getAddClient = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
        cssresult = 'success';
    } else {
        message = null;
        cssresult: null;
    }
    res.render('admin/add-client', {
        path: 'admin/add-client',
        pageTitle: 'Add a client',
        result: cssresult,
        errorMessage: message,
        oldInput: {
            firstname: '',
            lastname: '',
            address: '',
            roomRent: '',
            wifi: '',
            water: ''
        },
        validationErrors: []
    });
};

exports.postAddClient = (req, res, next) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const address = req.body.address;
    const roomRent = req.body.roomRent;
    const wifi = req.body.wifi;
    const water = req.body.water;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-client', {
            path: 'admin/add-client',
            pageTitle: 'Add a client',
            result: 'danger',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                firstname: '',
                lastname: '',
                address: '',
                roomRent: '',
                wifi: '',
                water: ''
            },
            validationErrors: errors.array()
        });
    }

    const client = new Client({
        firstname: firstname,
        lastname: lastname,
        address: address,
        roomRent: roomRent,
        wifi: wifi,
        water: water,
        userId: req.user
    });
    client.save()
        .then(result => {
            console.log('Client Created');
            req.flash('error', 'Client Created Successfully, Add another Client!');
            return res.redirect('/admin/add-client');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};