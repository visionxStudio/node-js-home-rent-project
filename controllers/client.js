exports.getIndex = (req, res, next) => {
    res.render('rent/index', {
        path: '/',
        pageTitle: 'Home',
    })
};

